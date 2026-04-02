/* ===== Simulation Engine ===== */
window.Simulation = (function () {
    "use strict";

    var data = window.AppData;
    var app;
    var NUM_RUNS = 100;

    function init() {
        app = window.App;

        var yearsSlider = app.el("sim-years");
        var yearsDisplay = app.el("sim-years-display");

        yearsSlider.addEventListener("input", function () {
            yearsDisplay.textContent = yearsSlider.value + " year" + (yearsSlider.value === "1" ? "" : "s");
        });

        app.el("sim-run-btn").addEventListener("click", runFullSimulation);
    }

    /* --- Seeded PRNG (Linear Congruential Generator) --- */
    function createRNG(seed) {
        var s = seed;
        return function () {
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
            return (s >>> 0) / 0x100000000;
        };
    }

    /* --- Normal distribution via Box-Muller --- */
    function normalRandom(rng, mean, stdDev) {
        var u1 = rng();
        var u2 = rng();
        if (u1 === 0) u1 = 0.0001;
        var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z * stdDev;
    }

    /* --- Pick market event --- */
    function pickMarketEvent(rng) {
        var roll = rng();
        var cumulative = 0;
        for (var i = 0; i < data.marketEvents.length; i++) {
            cumulative += data.marketEvents[i].probability;
            if (roll <= cumulative) return data.marketEvents[i];
        }
        return data.marketEvents[data.marketEvents.length - 1];
    }

    /* --- Build holdings list for simulation --- */
    function buildHoldingsList() {
        var items = [];

        // Individual stocks
        for (var ticker in app.state.stockHoldings) {
            var stock = app.getStockByTicker(ticker);
            if (!stock) continue;
            items.push({
                id: ticker,
                type: "stock",
                sector: stock.sector,
                value: app.state.stockHoldings[ticker] * stock.price,
                typicalReturn: stock.typicalReturn
            });
        }

        // Other investments
        data.otherInvestments.forEach(function (inv) {
            var val = app.state.otherHoldings[inv.id] || 0;
            if (val > 0) {
                items.push({
                    id: inv.id,
                    type: "other",
                    sector: null,
                    value: val,
                    typicalReturn: inv.typicalReturn
                });
            }
        });

        return items;
    }

    /* --- Run a single simulation --- */
    function runSingle(holdings, years, rng) {
        var current = {};
        holdings.forEach(function (h) { current[h.id] = h.value; });

        var snapshots = [];
        var events = [];

        for (var year = 1; year <= years; year++) {
            var event = pickMarketEvent(rng);
            events.push({ year: year, event: event });

            holdings.forEach(function (h) {
                if (current[h.id] <= 0) return;

                var avg = h.typicalReturn.average / 100;
                var stdDev = (h.typicalReturn.max - h.typicalReturn.min) / 100 / 4;
                var baseReturn = normalRandom(rng, avg, stdDev);

                // Apply event impact
                var eventMod = 0;
                if (h.type === "stock" && event.sectorImpacts) {
                    eventMod = event.sectorImpacts[h.sector] || 0;
                } else if (h.type === "other" && event.otherImpacts) {
                    eventMod = event.otherImpacts[h.id] || 0;
                }

                var totalReturn = baseReturn + eventMod;

                // Soft clamp
                var minR = h.typicalReturn.min / 100 - 0.1;
                var maxR = h.typicalReturn.max / 100 + 0.1;
                totalReturn = Math.max(minR, Math.min(maxR, totalReturn));

                current[h.id] *= (1 + totalReturn);
                if (current[h.id] < 0) current[h.id] = 0;
            });

            var total = 0;
            for (var key in current) total += current[key];

            snapshots.push({
                year: year,
                total: total,
                breakdown: Object.assign({}, current),
                eventName: event.name
            });
        }

        return { snapshots: snapshots, events: events };
    }

    /* --- Run multiple simulations --- */
    function runMultiple(holdings, years, baseSeed) {
        var allResults = [];
        for (var i = 0; i < NUM_RUNS; i++) {
            var rng = createRNG(baseSeed + i * 7919);
            allResults.push(runSingle(holdings, years, rng));
        }
        return allResults;
    }

    /* --- Extract percentiles --- */
    function extractPercentiles(allResults, years) {
        var percentiles = [];
        for (var y = 0; y < years; y++) {
            var totals = allResults.map(function (r) {
                return r.snapshots[y].total;
            }).sort(function (a, b) { return a - b; });

            percentiles.push({
                year: y + 1,
                p10: totals[Math.floor(NUM_RUNS * 0.10)],
                p50: totals[Math.floor(NUM_RUNS * 0.50)],
                p90: totals[Math.floor(NUM_RUNS * 0.90)]
            });
        }
        return percentiles;
    }

    /* --- Build benchmark holdings --- */
    function buildBenchmarkHoldings(total, benchConfig) {
        var items = [];

        // For benchmarks, create a synthetic "stock" entry based on risk level
        var stockBudget = total - (total * (benchConfig.bonds + benchConfig.etfs + benchConfig.savings) / 100);
        if (stockBudget > 0) {
            // Approximate stock returns based on risk level
            var avgReturn = 5 + benchConfig.stockRisk * 2; // 7-14% range
            var minReturn = -10 - benchConfig.stockRisk * 5;
            var maxReturn = 15 + benchConfig.stockRisk * 5;
            items.push({
                id: "bench_stocks",
                type: "stock",
                sector: "Technology", // use tech as representative
                value: stockBudget,
                typicalReturn: { min: minReturn, max: maxReturn, average: avgReturn }
            });
        }

        data.otherInvestments.forEach(function (inv) {
            var val = total * (benchConfig[inv.id] || 0) / 100;
            if (val > 0) {
                items.push({
                    id: inv.id,
                    type: "other",
                    sector: null,
                    value: val,
                    typicalReturn: inv.typicalReturn
                });
            }
        });

        return items;
    }

    /* --- Run full simulation --- */
    function runFullSimulation() {
        var total = app.getTotalSpent();
        if (total === 0) {
            alert("Please buy some stocks or allocate funds in the Portfolio tab first.");
            return;
        }

        var years = parseInt(app.el("sim-years").value, 10);
        var baseSeed = Math.floor(Math.random() * 100000);

        // User portfolio
        var userHoldings = buildHoldingsList();
        var userResults = runMultiple(userHoldings, years, baseSeed);
        var userPercentiles = extractPercentiles(userResults, years);

        // Benchmarks
        var consHoldings = buildBenchmarkHoldings(total, data.benchmarks.conservative);
        var consResults = runMultiple(consHoldings, years, baseSeed);
        var consPercentiles = extractPercentiles(consResults, years);

        var aggHoldings = buildBenchmarkHoldings(total, data.benchmarks.aggressive);
        var aggResults = runMultiple(aggHoldings, years, baseSeed);
        var aggPercentiles = extractPercentiles(aggResults, years);

        // Median run events
        var medianFinal = userPercentiles[years - 1].p50;
        var medianRun = userResults.reduce(function (closest, run) {
            var diff = Math.abs(run.snapshots[years - 1].total - medianFinal);
            var closestDiff = Math.abs(closest.snapshots[years - 1].total - medianFinal);
            return diff < closestDiff ? run : closest;
        }, userResults[0]);
        var significantEvents = medianRun.events.filter(function (e) {
            return e.event.name !== "Steady Growth";
        });

        displayResults(userPercentiles, consPercentiles, aggPercentiles, significantEvents, total);
    }

    /* --- Display results --- */
    function displayResults(userP, consP, aggP, events, initialTotal) {
        app.el("sim-no-data").style.display = "none";
        app.el("sim-results").style.display = "block";

        var last = userP[userP.length - 1];
        app.el("result-median").textContent = app.formatCurrency(last.p50);
        app.el("result-range").textContent = app.formatCurrency(last.p10) + " \u2013 " + app.formatCurrency(last.p90);

        var totalReturn = ((last.p50 - initialTotal) / initialTotal) * 100;
        app.el("result-return").textContent = app.formatPercent(totalReturn);
        app.el("result-return").style.color = totalReturn >= 0 ? "var(--color-success)" : "var(--color-danger)";

        var eventsEl = app.el("events-list");
        if (events.length === 0) {
            eventsEl.innerHTML = '<div class="event-item"><span class="event-icon">\u2796</span> No major market events during this period.</div>';
        } else {
            eventsEl.innerHTML = events.map(function (e) {
                return '<div class="event-item">' +
                    '<span class="event-year">Year ' + e.year + '</span>' +
                    '<span class="event-icon">' + e.event.icon + '</span>' +
                    '<span>' + e.event.name + '</span>' +
                '</div>';
            }).join("");
        }

        if (window.ChartManager) {
            ChartManager.renderGrowthChart(userP, consP, aggP, initialTotal);
        }
    }

    return {
        init: init
    };
})();
