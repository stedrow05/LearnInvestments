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
            return (s >>> 0) / 0xFFFFFFFF;
        };
    }

    /* --- Normal distribution via Box-Muller --- */
    function normalRandom(rng, mean, stdDev) {
        var u1 = rng();
        var u2 = rng();
        // Avoid log(0)
        if (u1 === 0) u1 = 0.0001;
        var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z * stdDev;
    }

    /* --- Pick market event using cumulative probability --- */
    function pickMarketEvent(rng) {
        var roll = rng();
        var cumulative = 0;
        for (var i = 0; i < data.marketEvents.length; i++) {
            cumulative += data.marketEvents[i].probability;
            if (roll <= cumulative) return data.marketEvents[i];
        }
        return data.marketEvents[data.marketEvents.length - 1];
    }

    /* --- Run a single simulation --- */
    function runSingle(allocations, years, rng) {
        var current = {};
        data.investmentTypes.forEach(function (type) {
            current[type.id] = allocations[type.id] || 0;
        });

        var snapshots = [];
        var events = [];

        for (var year = 1; year <= years; year++) {
            var event = pickMarketEvent(rng);
            events.push({ year: year, event: event });

            data.investmentTypes.forEach(function (type) {
                if (current[type.id] <= 0) return;

                var avg = type.typicalReturn.average / 100;
                var stdDev = (type.typicalReturn.max - type.typicalReturn.min) / 100 / 4;
                var baseReturn = normalRandom(rng, avg, stdDev);
                var eventMod = event.impacts[type.id] || 0;
                var totalReturn = baseReturn + eventMod;

                // Soft clamp
                var minR = type.typicalReturn.min / 100 - 0.1;
                var maxR = type.typicalReturn.max / 100 + 0.1;
                totalReturn = Math.max(minR, Math.min(maxR, totalReturn));

                current[type.id] *= (1 + totalReturn);
                if (current[type.id] < 0) current[type.id] = 0;
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

    /* --- Run simulation for a given allocation (percentage-based or dollar) --- */
    function runMultiple(allocations, years, baseSeed) {
        var allResults = [];

        for (var i = 0; i < NUM_RUNS; i++) {
            var rng = createRNG(baseSeed + i * 7919);
            allResults.push(runSingle(allocations, years, rng));
        }

        return allResults;
    }

    /* --- Extract percentiles from multiple runs --- */
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

    /* --- Run the full simulation (user + benchmarks) --- */
    function runFullSimulation() {
        var allocs = app.state.allocations;
        var total = window.Portfolio.getTotal();

        if (total === 0) {
            alert("Please allocate some funds in the Portfolio tab first.");
            return;
        }

        var years = parseInt(app.el("sim-years").value, 10);
        var baseSeed = Math.floor(Math.random() * 100000);

        // User portfolio
        var userResults = runMultiple(allocs, years, baseSeed);
        var userPercentiles = extractPercentiles(userResults, years);

        // Conservative benchmark
        var consBudget = {};
        var bench = data.benchmarks.conservative;
        for (var key in bench) consBudget[key] = (bench[key] / 100) * total;
        var consResults = runMultiple(consBudget, years, baseSeed);
        var consPercentiles = extractPercentiles(consResults, years);

        // Aggressive benchmark
        var aggBudget = {};
        var benchAgg = data.benchmarks.aggressive;
        for (var key2 in benchAgg) aggBudget[key2] = (benchAgg[key2] / 100) * total;
        var aggResults = runMultiple(aggBudget, years, baseSeed);
        var aggPercentiles = extractPercentiles(aggResults, years);

        // Collect events from the median run
        var medianRun = userResults[Math.floor(NUM_RUNS / 2)];
        var significantEvents = medianRun.events.filter(function (e) {
            return e.event.name !== "Steady Growth";
        });

        // Display results
        displayResults(userPercentiles, consPercentiles, aggPercentiles, significantEvents, total);
    }

    /* --- Display results --- */
    function displayResults(userP, consP, aggP, events, initialTotal) {
        // Hide placeholder
        app.el("sim-no-data").style.display = "none";

        // Show results section
        app.el("sim-results").style.display = "block";

        // Summary cards
        var last = userP[userP.length - 1];
        app.el("result-median").textContent = app.formatCurrency(last.p50);
        app.el("result-range").textContent = app.formatCurrency(last.p10) + " \u2013 " + app.formatCurrency(last.p90);

        var totalReturn = ((last.p50 - initialTotal) / initialTotal) * 100;
        app.el("result-return").textContent = app.formatPercent(totalReturn);
        app.el("result-return").style.color = totalReturn >= 0 ? "var(--color-success)" : "var(--color-danger)";

        // Market events log
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

        // Render chart
        if (window.ChartManager) {
            ChartManager.renderGrowthChart(userP, consP, aggP, initialTotal);
        }
    }

    return {
        init: init
    };
})();
