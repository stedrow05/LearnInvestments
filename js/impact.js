/* ===================================================================
 *  Portfolio Impact Analyzer
 *  Intercepts every buy action and shows a before/after analysis
 *  of how the new investment changes the portfolio.
 *
 *  Tech stack: Vanilla JS (ES5), no external deps. IIFE module pattern.
 *
 *  Financial logic overview
 *  ─────────────────────────
 *  Diversification  — Shannon entropy at sector level, normalised to
 *                     0–100. Higher = more evenly spread across sectors.
 *                     Formula: H = -Σ(p_i * ln(p_i)) / ln(N)  × 100
 *
 *  Weighted risk    — Σ(holding_value / total × riskLevel).
 *                     riskLevel is an integer 1–5 set per asset in data.js.
 *
 *  Expected return  — Σ(holding_value / total × typicalReturn.average).
 *                     Returns are in % per year (annual).
 *
 *  Volatility proxy — Per-holding std dev ≈ (max − min) / 4  (empirical
 *                     95 % range → σ approximation). Weighted by value.
 *                     NOTE: This ignores correlation between holdings,
 *                     so true portfolio vol will be lower than this figure.
 *                     A production app would use a covariance matrix.
 *
 *  Correlation      — Proxied by sector membership: same sector ≈ high
 *                     positive correlation. No real historical data used.
 *                     In production, feed a correlation matrix from a
 *                     market-data API (e.g. Polygon.io, Alpha Vantage).
 *
 *  All calculations run on a *simulated* copy of state — the real
 *  App.state is never mutated until the user confirms the purchase.
 * =================================================================== */

window.ImpactAnalyzer = (function () {
    "use strict";

    var app, data;
    var pendingCallback = null;
    var pendingTicker   = null;
    var pendingShares   = 1;

    /* ----------------------------------------------------------------
     *  Initialization — called from App.init()
     * ---------------------------------------------------------------- */
    function init() {
        app  = window.App;
        data = window.AppData;
        buildModalShell();
    }

    /* ----------------------------------------------------------------
     *  Build the persistent modal DOM element once on startup
     * ---------------------------------------------------------------- */
    function buildModalShell() {
        var overlay = document.createElement("div");
        overlay.id        = "impact-modal";
        overlay.className = "modal-overlay impact-overlay";
        overlay.style.display = "none";

        var box = document.createElement("div");
        box.id        = "impact-modal-content";
        box.className = "modal-content impact-content";
        overlay.appendChild(box);

        document.body.appendChild(overlay);

        // Close on backdrop click
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) dismiss(false);
        });

        // Close on ESC (stacked on top of the stock-detail ESC listener)
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && overlay.style.display !== "none") dismiss(false);
        });
    }

    /* ----------------------------------------------------------------
     *  Public API
     *
     *  show(ticker, initialShares, callback)
     *    callback(confirmed: bool, shares: int)
     *    Called when user dismisses the modal.
     * ---------------------------------------------------------------- */
    function show(ticker, initialShares, callback) {
        pendingTicker   = ticker;
        pendingShares   = initialShares || 1;
        pendingCallback = callback;
        renderContent();
        document.getElementById("impact-modal").style.display = "flex";
    }

    function dismiss(confirmed) {
        document.getElementById("impact-modal").style.display = "none";
        if (pendingCallback) {
            var cb = pendingCallback;
            pendingCallback = null;
            cb(confirmed, confirmed ? pendingShares : 0);
        }
    }

    /* ----------------------------------------------------------------
     *  Render modal content (re-called when share count changes)
     * ---------------------------------------------------------------- */
    function renderContent() {
        var stock = app.getStockByTicker(pendingTicker);
        if (!stock) return;

        var analysis      = analyzeImpact(pendingTicker, pendingShares);
        var maxAffordable = Math.max(1, Math.floor(app.getRemaining() / stock.price));
        var box           = document.getElementById("impact-modal-content");

        box.innerHTML =
            /* ── Header ───────────────────────────────── */
            '<button class="modal-close" id="impact-close-x">&times;</button>' +
            '<div class="impact-header" style="border-left: 4px solid ' + stock.sectorColor + '">' +
                '<div>' +
                    '<div class="impact-title">&#128202; Portfolio Impact Analysis</div>' +
                    '<div class="impact-subtitle">Adding <strong>' + escHtml(stock.name) + '</strong> (' + stock.ticker + ') &middot; ' + app.formatCurrency(stock.price) + '/share</div>' +
                '</div>' +
                '<span class="impact-sector-badge" style="background:' + stock.sectorColor + '22; color:' + stock.sectorColor + '; border:1px solid ' + stock.sectorColor + '55">' + escHtml(stock.sector) + '</span>' +
            '</div>' +

            /* ── Body ─────────────────────────────────── */
            '<div class="impact-body">' +

                /* Summary */
                '<div class="impact-section">' +
                    '<div class="impact-section-label">Summary</div>' +
                    '<p class="impact-summary">' + analysis.summary + '</p>' +
                '</div>' +

                /* Metrics */
                '<div class="impact-section">' +
                    '<div class="impact-section-label">Key Metrics</div>' +
                    '<div class="impact-metrics">' +
                        '<div class="impact-metrics-head">' +
                            '<span></span><span class="col-label">Before</span><span></span><span class="col-label">After</span><span class="col-label">Change</span>' +
                        '</div>' +
                        metricRow("Diversification",    analysis.before.diversity,       analysis.after.diversity,       "score") +
                        metricRow("Risk Level",         analysis.before.riskLabel,        analysis.after.riskLabel,        "label") +
                        metricRow("Expected Return",    analysis.before.expectedReturn,  analysis.after.expectedReturn,  "pct")   +
                        metricRow("Est. Volatility",    analysis.before.volatility,      analysis.after.volatility,      "pct")   +
                        sectorRow(stock.sector,         analysis.before.sectorPct,       analysis.after.sectorPct)               +
                    '</div>' +
                    '<p class="impact-metrics-note">&#8505; Volatility is a weighted-average approximation. True portfolio volatility is lower due to diversification effects.</p>' +
                '</div>' +

                /* Pros */
                (analysis.pros.length > 0 ?
                    '<div class="impact-section">' +
                        '<div class="impact-section-label impact-label-good">&#10003; Good Effects</div>' +
                        '<ul class="impact-bullets impact-good">' +
                            analysis.pros.map(function (p) { return '<li>' + p + '</li>'; }).join("") +
                        '</ul>' +
                    '</div>' : '') +

                /* Cons */
                (analysis.cons.length > 0 ?
                    '<div class="impact-section">' +
                        '<div class="impact-section-label impact-label-warn">&#9888; Things to Consider</div>' +
                        '<ul class="impact-bullets impact-warn">' +
                            analysis.cons.map(function (c) { return '<li>' + c + '</li>'; }).join("") +
                        '</ul>' +
                    '</div>' : '') +

                /* Recommendation */
                '<div class="impact-section impact-rec impact-rec-' + analysis.recommendation.type + '">' +
                    '<div class="impact-section-label">&#128161; Recommendation</div>' +
                    '<p>' + analysis.recommendation.text + '</p>' +
                '</div>' +

            '</div>' + /* /impact-body */

            /* ── Footer ───────────────────────────────── */
            '<div class="impact-footer">' +
                '<div class="impact-shares-row">' +
                    '<span class="impact-shares-label">Shares to add:</span>' +
                    '<button class="share-btn minus" id="impact-dec" ' + (pendingShares <= 1 ? 'disabled' : '') + '>&minus;</button>' +
                    '<span class="impact-shares-num" id="impact-shares-num">' + pendingShares + '</span>' +
                    '<button class="share-btn plus"  id="impact-inc" ' + (pendingShares >= maxAffordable ? 'disabled' : '') + '>+</button>' +
                    '<span class="impact-shares-cost">= ' + app.formatCurrency(pendingShares * stock.price) + '</span>' +
                '</div>' +
                '<div class="impact-footer-btns">' +
                    '<button class="btn btn-secondary" id="impact-cancel">Cancel</button>' +
                    '<button class="btn btn-primary"   id="impact-confirm">&#10003; Confirm Add</button>' +
                '</div>' +
            '</div>';

        /* ── Wire events ── */
        document.getElementById("impact-close-x").addEventListener("click",  function () { dismiss(false); });
        document.getElementById("impact-cancel").addEventListener("click",   function () { dismiss(false); });
        document.getElementById("impact-confirm").addEventListener("click",  function () { dismiss(true);  });

        document.getElementById("impact-dec").addEventListener("click", function () {
            if (pendingShares > 1) { pendingShares--; renderContent(); }
        });
        document.getElementById("impact-inc").addEventListener("click", function () {
            if (pendingShares < maxAffordable) { pendingShares++; renderContent(); }
        });
    }

    /* ----------------------------------------------------------------
     *  Metric row renderers
     * ---------------------------------------------------------------- */
    function metricRow(label, before, after, type) {
        var bStr, aStr, dStr, cls;

        if (type === "score") {
            bStr = Math.round(before);
            aStr = Math.round(after);
            var d = after - before;
            dStr = (d >= 0 ? "+" : "") + Math.round(d);
            cls  = d > 2 ? "delta-up" : (d < -2 ? "delta-down" : "delta-flat");
        } else if (type === "pct") {
            bStr = before.toFixed(1) + "%";
            aStr = after.toFixed(1) + "%";
            var dp = after - before;
            dStr = (dp >= 0 ? "+" : "") + dp.toFixed(1) + "%";
            cls  = dp > 0.2 ? "delta-up" : (dp < -0.2 ? "delta-down" : "delta-flat");
        } else { /* label */
            bStr = before;
            aStr = after;
            dStr = (before === after) ? "\u2014" : "\u25b2";
            cls  = "delta-flat";
        }

        return '<div class="impact-metric-row">' +
            '<span class="imp-label">' + label + '</span>' +
            '<span class="imp-before">' + bStr + '</span>' +
            '<span class="imp-arrow">&rarr;</span>' +
            '<span class="imp-after">' + aStr + '</span>' +
            '<span class="imp-delta ' + cls + '">' + dStr + '</span>' +
        '</div>';
    }

    function sectorRow(sector, before, after) {
        var bStr  = Math.round(before) + "%";
        var aStr  = Math.round(after)  + "%";
        var d     = after - before;
        var dStr  = (d >= 0 ? "+" : "") + Math.round(d) + "%";
        var high  = after > 40;
        var aCls  = high ? "imp-after imp-warn-val" : "imp-after";
        var dCls  = high ? "imp-delta delta-warn"   : (d > 5 ? "imp-delta delta-up" : "imp-delta delta-flat");

        return '<div class="impact-metric-row">' +
            '<span class="imp-label">' + escHtml(sector) + ' Sector</span>' +
            '<span class="imp-before">' + bStr + '</span>' +
            '<span class="imp-arrow">&rarr;</span>' +
            '<span class="' + aCls + '">' + aStr + (high ? ' &#9888;' : '') + '</span>' +
            '<span class="' + dCls + '">' + dStr + '</span>' +
        '</div>';
    }

    /* ================================================================
     *  ANALYSIS ENGINE
     *
     *  All helpers take explicit (stocks, other) parameters so they
     *  can operate on either real or simulated state without mutation.
     * ================================================================ */

    /* --- Master function ------------------------------------------ */
    function analyzeImpact(ticker, sharesAdding) {
        var stock      = app.getStockByTicker(ticker);
        var addedValue = sharesAdding * stock.price;

        /* Build simulated holdings (no real-state mutation) */
        var simStocks = {};
        for (var t in app.state.stockHoldings) simStocks[t] = app.state.stockHoldings[t];
        simStocks[ticker] = (simStocks[ticker] || 0) + sharesAdding;

        var simOther = {
            bonds:   app.state.otherHoldings.bonds,
            etfs:    app.state.otherHoldings.etfs,
            savings: app.state.otherHoldings.savings
        };

        /* Current totals */
        var curTotal  = calcTotal(app.state.stockHoldings, app.state.otherHoldings);
        var newTotal  = curTotal + addedValue;
        var isEmpty   = curTotal === 0;
        var isNewHolding  = !app.state.stockHoldings[ticker];
        var isDuplicate   = !!app.state.stockHoldings[ticker];

        /* Before metrics */
        var before = isEmpty
            ? { total: 0, diversity: 0, riskRaw: 0, riskLabel: "\u2014", expectedReturn: 0, volatility: 0, sectorPct: 0 }
            : {
                total:          curTotal,
                diversity:      calcDiversity(app.state.stockHoldings, app.state.otherHoldings),
                riskRaw:        calcRisk(app.state.stockHoldings, app.state.otherHoldings),
                riskLabel:      riskLabel(calcRisk(app.state.stockHoldings, app.state.otherHoldings)),
                expectedReturn: calcReturn(app.state.stockHoldings, app.state.otherHoldings),
                volatility:     calcVolatility(app.state.stockHoldings, app.state.otherHoldings),
                sectorPct:      calcSectorPct(stock.sector, app.state.stockHoldings, curTotal)
              };

        /* After metrics */
        var after = {
            total:          newTotal,
            diversity:      calcDiversity(simStocks, simOther),
            riskRaw:        calcRisk(simStocks, simOther),
            riskLabel:      riskLabel(calcRisk(simStocks, simOther)),
            expectedReturn: calcReturn(simStocks, simOther),
            volatility:     calcVolatility(simStocks, simOther),
            sectorPct:      calcSectorPct(stock.sector, simStocks, newTotal)
        };

        /* Supporting facts */
        var correlated    = findCorrelated(ticker, stock.sector);
        var annualDivInc  = stock.dividend > 0 ? (addedValue * stock.dividend / 100) : 0;
        var pctOfPortfolio = (addedValue / newTotal) * 100;

        /* Narrative */
        var pros           = buildPros(stock, before, after, addedValue, newTotal, annualDivInc, isNewHolding, correlated, isEmpty, sharesAdding);
        var cons           = buildCons(stock, before, after, addedValue, newTotal, isDuplicate, correlated, pctOfPortfolio);
        var recommendation = buildRecommendation(pros, cons, before, after, stock, isDuplicate, isEmpty);
        var summary        = buildSummary(stock, sharesAdding, addedValue, newTotal, before, after, isNewHolding, isEmpty);

        return { before: before, after: after, pros: pros, cons: cons, recommendation: recommendation, summary: summary };
    }

    /* ----------------------------------------------------------------
     *  Low-level calculators
     *  Each takes explicit (stocks, other) so they never touch App.state.
     * ---------------------------------------------------------------- */

    /* Total invested value across all holdings */
    function calcTotal(stocks, other) {
        var total = 0;
        for (var t in stocks) {
            var s = app.getStockByTicker(t);
            if (s) total += stocks[t] * s.price;
        }
        data.otherInvestments.forEach(function (inv) {
            total += (other[inv.id] || 0);
        });
        return total;
    }

    /*
     * Diversification — Shannon entropy at sector/asset-class level.
     *
     *   p_i = value in bucket i / total portfolio value
     *   H   = -Σ p_i * ln(p_i)           (raw entropy)
     *   H_max = ln(N)                     (entropy if perfectly equal)
     *   Score = H / H_max * 100
     *
     * Buckets: each unique stock sector + each "other" investment type.
     * Score of 100 means exactly equal weight across all buckets.
     */
    function calcDiversity(stocks, other) {
        var total = calcTotal(stocks, other);
        if (total === 0) return 0;

        var buckets = {};
        for (var t in stocks) {
            var s = app.getStockByTicker(t);
            if (!s) continue;
            buckets[s.sector] = (buckets[s.sector] || 0) + stocks[t] * s.price;
        }
        data.otherInvestments.forEach(function (inv) {
            var v = other[inv.id] || 0;
            if (v > 0) buckets[inv.id] = v;
        });

        var cats = Object.keys(buckets);
        if (cats.length <= 1) return cats.length === 1 ? 15 : 0;

        var maxH = Math.log(cats.length);
        var H    = 0;
        cats.forEach(function (k) {
            var p = buckets[k] / total;
            if (p > 0) H -= p * Math.log(p);
        });
        return (H / maxH) * 100;
    }

    /*
     * Weighted risk — value-weighted average of riskLevel integers (1–5).
     *   R = Σ ( holding_value / total × riskLevel )
     */
    function calcRisk(stocks, other) {
        var total = calcTotal(stocks, other);
        if (total === 0) return 0;
        var w = 0;
        for (var t in stocks) {
            var s = app.getStockByTicker(t);
            if (s) w += (stocks[t] * s.price / total) * s.riskLevel;
        }
        data.otherInvestments.forEach(function (inv) {
            var v = other[inv.id] || 0;
            if (v > 0) w += (v / total) * inv.riskLevel;
        });
        return w;
    }

    /*
     * Expected return — value-weighted average of typicalReturn.average (%).
     *   ER = Σ ( holding_value / total × avgReturn% )
     */
    function calcReturn(stocks, other) {
        var total = calcTotal(stocks, other);
        if (total === 0) return 0;
        var w = 0;
        for (var t in stocks) {
            var s = app.getStockByTicker(t);
            if (s) w += (stocks[t] * s.price / total) * s.typicalReturn.average;
        }
        data.otherInvestments.forEach(function (inv) {
            var v = other[inv.id] || 0;
            if (v > 0) w += (v / total) * inv.typicalReturn.average;
        });
        return w;
    }

    /*
     * Volatility proxy — weighted average of per-holding standard deviation.
     *   σ_i ≈ (max_i − min_i) / 4   (treats the return range as ≈4σ)
     *   Portfolio σ ≈ Σ ( w_i × σ_i )
     *
     * IMPORTANT ASSUMPTION: This is a weighted-average (not quadratic)
     * aggregation, so it overstates true portfolio vol (which benefits from
     * correlation < 1 between holdings). It's useful as an upper-bound
     * estimate and directional indicator. A real system would use:
     *   σ_portfolio = sqrt( Σ_i Σ_j w_i w_j σ_i σ_j ρ_ij )
     */
    function calcVolatility(stocks, other) {
        var total = calcTotal(stocks, other);
        if (total === 0) return 0;
        var w = 0;
        for (var t in stocks) {
            var s = app.getStockByTicker(t);
            if (s) {
                var sd = (s.typicalReturn.max - s.typicalReturn.min) / 4;
                w += (stocks[t] * s.price / total) * sd;
            }
        }
        data.otherInvestments.forEach(function (inv) {
            var v = other[inv.id] || 0;
            if (v > 0) {
                var sd = (inv.typicalReturn.max - inv.typicalReturn.min) / 4;
                w += (v / total) * sd;
            }
        });
        return w;
    }

    /* Percentage of portfolio value in a given sector */
    function calcSectorPct(sector, stocks, total) {
        if (total === 0) return 0;
        var val = 0;
        for (var t in stocks) {
            var s = app.getStockByTicker(t);
            if (s && s.sector === sector) val += stocks[t] * s.price;
        }
        return (val / total) * 100;
    }

    /*
     * Correlation proxy — returns names of already-held stocks in the same
     * sector. Same-sector stocks tend to move together (ρ ≈ 0.5–0.8),
     * so adding another creates concentration risk beyond the raw %.
     *
     * Production note: replace with real ρ values from a market-data API.
     */
    function findCorrelated(ticker, sector) {
        var names = [];
        for (var t in app.state.stockHoldings) {
            if (t === ticker) continue;
            var s = app.getStockByTicker(t);
            if (s && s.sector === sector) names.push(s.name || t);
        }
        return names;
    }

    function riskLabel(raw) {
        var labels = ["\u2014", "Very Low", "Low", "Moderate", "High", "Very High"];
        return labels[Math.max(0, Math.min(5, Math.round(raw)))] || "\u2014";
    }

    /* ================================================================
     *  Narrative builders — generate plain-English bullets and text
     * ================================================================ */

    function buildSummary(stock, shares, addedValue, newTotal, before, after, isNewHolding, isEmpty) {
        var shareWord = shares === 1 ? "share" : "shares";
        var parts     = [];

        parts.push(
            "Adding " + shares + " " + shareWord + " of " + stock.name +
            " for " + app.formatCurrency(addedValue) +
            " brings your total invested to " + app.formatCurrency(newTotal) + "."
        );

        if (isEmpty) {
            parts.push("This is your first investment \u2014 great start!");
        } else {
            if (after.diversity > before.diversity + 4) {
                parts.push("Your diversification score improves meaningfully, spreading risk further across sectors.");
            } else if (after.diversity < before.diversity - 4) {
                parts.push("Your diversification score decreases, concentrating holdings more in fewer sectors.");
            }
            if (after.sectorPct > 45) {
                parts.push("Note: the " + stock.sector + " sector will make up " + Math.round(after.sectorPct) + "% of your portfolio after this purchase.");
            }
        }

        return parts.join(" ");
    }

    function buildPros(stock, before, after, addedValue, newTotal, annualDiv, isNewHolding, correlated, isEmpty, shares) {
        var pros = [];
        var shareWord = shares === 1 ? "share" : "shares";

        // New position
        if (isNewHolding) {
            pros.push("Adds a new company, reducing your dependence on any single stock.");
        }

        // Diversification improvement
        if (!isEmpty && after.diversity > before.diversity + 3) {
            pros.push(
                "Improves diversification score by " + Math.round(after.diversity - before.diversity) +
                " points (from " + Math.round(before.diversity) + " to " + Math.round(after.diversity) + ")."
            );
        }

        // New sector
        var heldSectors = {};
        for (var t in app.state.stockHoldings) {
            var s = app.getStockByTicker(t);
            if (s) heldSectors[s.sector] = true;
        }
        if (isNewHolding && !heldSectors[stock.sector]) {
            pros.push("Adds first exposure to the " + stock.sector + " sector, broadening your portfolio.");
        }

        // Lower risk than portfolio
        if (!isEmpty && stock.riskLevel < Math.round(before.riskRaw)) {
            pros.push(
                "Risk level (" + riskLabel(stock.riskLevel) + ") is below your current portfolio average, helping balance higher-risk holdings."
            );
        }

        // Return improvement
        if (!isEmpty && after.expectedReturn > before.expectedReturn + 0.3) {
            pros.push(
                "Boosts expected annual return from " + before.expectedReturn.toFixed(1) +
                "% to " + after.expectedReturn.toFixed(1) + "%."
            );
        }

        // Dividend
        if (annualDiv > 0) {
            pros.push(
                "Earns ~" + app.formatCurrency(annualDiv) + "/year in dividends (" +
                stock.dividend + "% yield) — passive income on top of price growth."
            );
        }

        // Low correlation
        if (!isEmpty && correlated.length === 0) {
            pros.push("No existing holdings in this sector, so correlation with your portfolio is low. Good for reducing volatility.");
        }

        if (pros.length === 0) {
            pros.push("Increases your total market exposure by " + app.formatCurrency(addedValue) + ".");
        }
        return pros;
    }

    function buildCons(stock, before, after, addedValue, newTotal, isDuplicate, correlated, pctOfPortfolio) {
        var cons = [];

        // Sector over-concentration
        if (after.sectorPct > 40) {
            cons.push(
                stock.sector + " sector rises to " + Math.round(after.sectorPct) + "% of your portfolio. " +
                "A single sector above 40% creates concentrated exposure \u2014 a bad year for " +
                stock.sector + " could hit your whole portfolio hard."
            );
        }

        // Same-sector holdings (correlation)
        if (correlated.length > 0) {
            cons.push(
                "High correlation with " + correlated.join(" and ") + " (same sector). " +
                "These holdings tend to move together, so a sector downturn impacts all of them simultaneously."
            );
        }

        // Doubling down on existing position
        if (isDuplicate) {
            var existingShares = app.state.stockHoldings[stock.ticker] || 0;
            cons.push(
                "You already own " + existingShares + " share" + (existingShares !== 1 ? "s" : "") +
                " of " + stock.name + ". This increases your single-stock concentration."
            );
        }

        // High intrinsic risk
        if (stock.riskLevel >= 4) {
            cons.push(
                "Rated " + riskLabel(stock.riskLevel) + " risk. Expect larger price swings; short-term losses can be significant."
            );
        }

        // Volatility increase
        if (!isEmpty && after.volatility > before.volatility + 1.5) {
            cons.push(
                "Raises estimated portfolio volatility from " + before.volatility.toFixed(1) +
                "% to " + after.volatility.toFixed(1) + "% \u2014 wider potential swings up or down."
            );
        }

        // Lopsided single purchase
        if (pctOfPortfolio > 30) {
            cons.push(
                "This purchase represents " + Math.round(pctOfPortfolio) + "% of your total portfolio, " +
                "creating a large initial concentration. Consider starting with fewer shares and diversifying first."
            );
        }

        return cons;
    }

    function buildRecommendation(pros, cons, before, after, stock, isDuplicate, isEmpty) {
        var type, text;
        var overConcentrated = after.sectorPct > 50;
        var mildConcentrated = after.sectorPct > 40;

        if (isEmpty) {
            type = "proceed";
            text = "Great start! Every portfolio begins somewhere. " + stock.name +
                   " is a real company you can learn about as you build. " +
                   "You\u2019ll want to diversify across sectors over time.";

        } else if (overConcentrated) {
            type = "caution";
            text = "Over half your portfolio would be in " + stock.sector + ". " +
                   "Consider adding bonds, ETFs, or stocks from other sectors first to " +
                   "reduce sector-specific risk, then revisit this purchase.";

        } else if (mildConcentrated && isDuplicate) {
            type = "caution";
            text = "You\u2019re doubling down on " + stock.name + " in an already " +
                   "concentrated sector. This can work if you have conviction in the company, " +
                   "but balancing with a different sector would reduce risk.";

        } else if (pros.length > cons.length || cons.length === 0) {
            type = "proceed";
            text = "Solid addition. " +
                   (after.diversity > before.diversity + 2 ? "Your diversification improves. " : "") +
                   "The risk level stays " + after.riskLabel + ". Proceed with confidence.";

        } else {
            type = "neutral";
            text = "Reasonable choice, but weigh the trade-offs above. " +
                   "If you\u2019re unsure, buying fewer shares now and observing how this stock " +
                   "behaves before committing more is a sound strategy.";
        }

        return { type: type, text: text };
    }

    /* ----------------------------------------------------------------
     *  Utility
     * ---------------------------------------------------------------- */
    function escHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /* ----------------------------------------------------------------
     *  Public surface
     * ---------------------------------------------------------------- */
    return {
        init: init,
        show: show
    };

})();
