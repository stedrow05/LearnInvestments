/* ===== Portfolio Builder ===== */
window.Portfolio = (function () {
    "use strict";

    var data = window.AppData;
    var app;
    var activeSectorFilter = "all";

    function init() {
        app = window.App;
        renderSectorFilters();
        renderStockGrid();
        renderOtherInvestments();
        updateSummary();
        initModal();
        initStockLookup();
    }

    /* --- Sector filter buttons --- */
    function renderSectorFilters() {
        var sectors = [];
        var allStocks = data.stocks.concat(data.customStocks || []);
        allStocks.forEach(function (s) {
            if (sectors.indexOf(s.sector) === -1) sectors.push(s.sector);
        });

        var container = app.el("sector-filters");
        container.innerHTML = '<button class="filter-btn active" data-sector="all">All</button>';

        sectors.forEach(function (sector) {
            var btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.dataset.sector = sector;
            btn.textContent = sector;
            container.appendChild(btn);
        });

        container.addEventListener("click", function (e) {
            if (!e.target.classList.contains("filter-btn")) return;
            activeSectorFilter = e.target.dataset.sector;
            container.querySelectorAll(".filter-btn").forEach(function (b) {
                b.classList.toggle("active", b.dataset.sector === activeSectorFilter);
            });
            renderStockGrid();
        });
    }

    /* --- Stock cards grid --- */
    function renderStockGrid() {
        var container = app.el("stock-grid");
        var allStocks = data.stocks.concat(data.customStocks || []);
        var filtered = allStocks.filter(function (s) {
            return activeSectorFilter === "all" || s.sector === activeSectorFilter;
        });

        container.innerHTML = filtered.map(function (stock) {
            var held = app.state.stockHoldings[stock.ticker] || 0;
            var riskLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];
            var maxBuyable = Math.floor(app.getRemaining() / stock.price) + held;

            return '<div class="stock-card" data-ticker="' + stock.ticker + '" style="border-top-color:' + stock.sectorColor + '">' +
                '<div class="stock-card-top">' +
                    '<div class="stock-card-header">' +
                        '<div class="stock-ticker">' + stock.ticker +
                            (stock.isCustom ? ' <span class="live-badge">Live</span>' : '') +
                        '</div>' +
                        '<div class="stock-name">' + stock.name + '</div>' +
                    '</div>' +
                    '<div class="stock-price">' + app.formatCurrency(stock.price) + '<span class="price-label">/share</span></div>' +
                '</div>' +
                '<div class="stock-card-meta">' +
                    '<span class="meta-tag">' + stock.sector + '</span>' +
                    '<span class="meta-tag">Risk: ' + riskLabels[stock.riskLevel] + '</span>' +
                    (stock.dividend > 0 ? '<span class="meta-tag dividend-tag">Div: ' + stock.dividend + '%</span>' : '') +
                '</div>' +
                '<p class="stock-card-desc">' + stock.description.split(".")[0] + '.</p>' +
                '<div class="stock-card-actions">' +
                    '<button class="btn btn-secondary btn-sm stock-info-btn" data-ticker="' + stock.ticker + '">Learn More</button>' +
                    '<div class="share-controls">' +
                        '<button class="share-btn minus" data-ticker="' + stock.ticker + '" ' + (held === 0 ? 'disabled' : '') + '>&minus;</button>' +
                        '<span class="share-count" id="count-' + stock.ticker + '">' + held + '</span>' +
                        '<button class="share-btn plus" data-ticker="' + stock.ticker + '" ' + (app.getRemaining() < stock.price && held === 0 ? 'disabled' : '') + '>+</button>' +
                    '</div>' +
                '</div>' +
                (held > 0 ? '<div class="stock-held-value">Invested: ' + app.formatCurrency(held * stock.price) + '</div>' : '') +
            '</div>';
        }).join("");

        // Bind events
        container.querySelectorAll(".share-btn.plus").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                buyShare(btn.dataset.ticker);
            });
        });
        container.querySelectorAll(".share-btn.minus").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                sellShare(btn.dataset.ticker);
            });
        });
        container.querySelectorAll(".stock-info-btn").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                showStockModal(btn.dataset.ticker);
            });
        });
    }

    /* --- Buy / Sell shares --- */
    function buyShare(ticker) {
        var stock = app.getStockByTicker(ticker);
        if (!stock || app.getRemaining() < stock.price) return;

        app.state.stockHoldings[ticker] = (app.state.stockHoldings[ticker] || 0) + 1;
        renderStockGrid();
        updateSummary();
    }

    function sellShare(ticker) {
        if (!app.state.stockHoldings[ticker] || app.state.stockHoldings[ticker] <= 0) return;

        app.state.stockHoldings[ticker]--;
        if (app.state.stockHoldings[ticker] === 0) delete app.state.stockHoldings[ticker];
        renderStockGrid();
        updateSummary();
    }

    /* --- Other investments (bonds, ETFs, savings) --- */
    function renderOtherInvestments() {
        var container = app.el("other-investments");
        container.innerHTML = "";

        data.otherInvestments.forEach(function (inv) {
            var card = document.createElement("div");
            card.className = "alloc-card";
            card.style.borderLeftColor = inv.color;

            var val = app.state.otherHoldings[inv.id] || 0;
            var minSign = inv.typicalReturn.min >= 0 ? "+" : "";
            var returnRange = minSign + inv.typicalReturn.min + "% to +" + inv.typicalReturn.max + "%";

            card.innerHTML =
                '<div class="alloc-card-header">' +
                    '<span class="alloc-card-icon">' + inv.icon + '</span>' +
                    '<span class="alloc-card-title">' + inv.name + '</span>' +
                '</div>' +
                '<div class="alloc-card-meta">' +
                    '<span class="meta-tag">Return: ' + returnRange + '/yr</span>' +
                '</div>' +
                '<p class="alloc-card-desc">' + inv.description.split(".")[0] + '.</p>' +
                '<div class="alloc-slider-row">' +
                    '<input type="range" class="alloc-slider" ' +
                        'id="slider-' + inv.id + '" ' +
                        'min="0" max="' + data.BUDGET + '" step="100" value="' + val + '" ' +
                        'aria-label="' + inv.name + ' allocation" ' +
                        'style="accent-color: ' + inv.color + '">' +
                    '<div class="alloc-input-group">' +
                        '<span class="dollar-sign">$</span>' +
                        '<input type="number" class="alloc-amount-input" ' +
                            'id="input-' + inv.id + '" ' +
                            'min="0" max="' + data.BUDGET + '" step="100" value="' + val + '" ' +
                            'aria-label="' + inv.name + ' dollar amount">' +
                    '</div>' +
                '</div>';

            container.appendChild(card);

            var slider = app.el("slider-" + inv.id);
            var input = app.el("input-" + inv.id);

            slider.addEventListener("input", function () {
                var v = parseInt(slider.value, 10);
                v = constrainOther(inv.id, v);
                slider.value = v;
                input.value = v;
                app.state.otherHoldings[inv.id] = v;
                updateSummary();
            });

            input.addEventListener("input", function () {
                var v = parseInt(input.value, 10) || 0;
                v = app.clamp(v, 0, data.BUDGET);
                v = constrainOther(inv.id, v);
                input.value = v;
                slider.value = v;
                app.state.otherHoldings[inv.id] = v;
                updateSummary();
            });
        });
    }

    function constrainOther(id, value) {
        var remaining = app.getRemaining();
        var current = app.state.otherHoldings[id] || 0;
        var maxAllowed = remaining + current;
        return app.clamp(value, 0, maxAllowed);
    }

    /* --- Stock detail modal --- */
    function initModal() {
        var overlay = app.el("stock-modal");
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeModal();
        });
    }

    function showStockModal(ticker) {
        var stock = app.getStockByTicker(ticker);
        if (!stock) return;

        var modal = app.el("stock-modal-content");
        var held = app.state.stockHoldings[ticker] || 0;
        var riskLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];

        modal.innerHTML =
            '<button class="modal-close" id="modal-close-btn">&times;</button>' +
            '<div class="modal-header" style="border-bottom-color:' + stock.sectorColor + '">' +
                '<div><div class="stock-ticker" style="font-size:1.5rem">' + stock.ticker + '</div>' +
                '<div class="stock-name" style="font-size:1.1rem">' + stock.name + '</div></div>' +
                '<div class="stock-price" style="font-size:1.5rem">' + app.formatCurrency(stock.price) + '<span class="price-label">/share</span></div>' +
            '</div>' +
            '<div class="modal-body">' +
                '<p style="margin-bottom:1rem; line-height:1.7">' + stock.description + '</p>' +
                '<div class="modal-stats">' +
                    '<div class="detail-stat"><div class="detail-stat-value">' + stock.sector + '</div><div class="detail-stat-label">Sector</div></div>' +
                    '<div class="detail-stat"><div class="detail-stat-value">' + riskLabels[stock.riskLevel] + '</div><div class="detail-stat-label">Risk</div></div>' +
                    '<div class="detail-stat"><div class="detail-stat-value">' + stock.typicalReturn.average + '%</div><div class="detail-stat-label">Avg Return</div></div>' +
                    '<div class="detail-stat"><div class="detail-stat-value">' + (stock.dividend > 0 ? stock.dividend + '%' : 'None') + '</div><div class="detail-stat-label">Dividend</div></div>' +
                '</div>' +
                '<div class="invest-detail-grid">' +
                    '<div class="detail-box benefits"><h4>\u2705 Why Buy</h4><ul>' +
                        stock.whyBuy.map(function (b) { return '<li>' + b + '</li>'; }).join("") +
                    '</ul></div>' +
                    '<div class="detail-box risks"><h4>\u26A0\uFE0F Risks</h4><ul>' +
                        stock.risks.map(function (r) { return '<li>' + r + '</li>'; }).join("") +
                    '</ul></div>' +
                '</div>' +
                '<div class="guidance-box"><h4>\u{1F4A1} Guidance for Beginners</h4><p>' + stock.guidance + '</p></div>' +
                '<div class="modal-buy-section">' +
                    '<div class="modal-holding">You own: <strong>' + held + ' share' + (held !== 1 ? 's' : '') + '</strong>' +
                        (held > 0 ? ' (' + app.formatCurrency(held * stock.price) + ')' : '') +
                    '</div>' +
                    '<div class="share-controls share-controls-lg">' +
                        '<button class="share-btn minus" id="modal-sell" ' + (held === 0 ? 'disabled' : '') + '>&minus;</button>' +
                        '<span class="share-count">' + held + '</span>' +
                        '<button class="share-btn plus" id="modal-buy" ' + (app.getRemaining() < stock.price ? 'disabled' : '') + '>+</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        app.el("stock-modal").style.display = "flex";

        app.el("modal-close-btn").addEventListener("click", closeModal);
        app.el("modal-buy").addEventListener("click", function () {
            buyShare(ticker);
            showStockModal(ticker); // refresh
        });
        app.el("modal-sell").addEventListener("click", function () {
            sellShare(ticker);
            showStockModal(ticker); // refresh
        });
    }

    function closeModal() {
        app.el("stock-modal").style.display = "none";
    }

    /* --- Update all summary displays --- */
    function updateSummary() {
        var totalSpent = app.getTotalSpent();
        var remaining = app.getRemaining();

        // Budget bar
        var pct = (totalSpent / data.BUDGET) * 100;
        var fill = app.el("budget-bar-fill");
        fill.style.width = Math.min(pct, 100) + "%";
        fill.classList.toggle("over-budget", totalSpent > data.BUDGET);
        app.el("budget-allocated").textContent = app.formatCurrency(totalSpent);
        app.el("budget-remaining").textContent = app.formatCurrency(remaining) + " remaining";

        // Holdings list
        updateHoldingsList();

        // Diversification
        var divScore = calcDiversification();
        app.el("diversification-score").textContent = Math.round(divScore);
        app.el("diversification-bar").style.width = divScore + "%";

        // Risk
        updateRiskGauge();

        // Dividends
        updateDividendIncome();

        // Advice
        updateAdvice();

        // Pie chart
        if (window.ChartManager) ChartManager.updateAllocationPie(getAllocationMap());
    }

    /* --- Holdings list in sidebar --- */
    function updateHoldingsList() {
        var container = app.el("holdings-list");
        var totalSpent = app.getTotalSpent();

        if (totalSpent === 0) {
            container.innerHTML = '<p class="advice-empty">No investments yet. Start buying below!</p>';
            return;
        }

        var html = '';
        var holdings = app.state.stockHoldings;
        var tickers = Object.keys(holdings).sort();

        tickers.forEach(function (ticker) {
            var stock = app.getStockByTicker(ticker);
            if (!stock) return;
            var shares = holdings[ticker];
            var value = shares * stock.price;
            html += '<div class="holding-row">' +
                '<span class="holding-name" style="color:' + stock.sectorColor + '">' + ticker + '</span>' +
                '<span class="holding-detail">' + shares + ' share' + (shares !== 1 ? 's' : '') + '</span>' +
                '<span class="holding-value">' + app.formatCurrency(value) + '</span>' +
            '</div>';
        });

        data.otherInvestments.forEach(function (inv) {
            var val = app.state.otherHoldings[inv.id] || 0;
            if (val > 0) {
                html += '<div class="holding-row">' +
                    '<span class="holding-name" style="color:' + inv.color + '">' + inv.icon + ' ' + inv.name + '</span>' +
                    '<span class="holding-detail"></span>' +
                    '<span class="holding-value">' + app.formatCurrency(val) + '</span>' +
                '</div>';
            }
        });

        html += '<div class="holding-row holding-total">' +
            '<span class="holding-name">Total</span>' +
            '<span class="holding-detail"></span>' +
            '<span class="holding-value">' + app.formatCurrency(totalSpent) + '</span>' +
        '</div>';

        container.innerHTML = html;
    }

    /* --- Build allocation map for charts/simulation --- */
    function getAllocationMap() {
        var map = {};
        var holdings = app.state.stockHoldings;

        for (var ticker in holdings) {
            var stock = app.getStockByTicker(ticker);
            if (stock) map[ticker] = holdings[ticker] * stock.price;
        }

        data.otherInvestments.forEach(function (inv) {
            var val = app.state.otherHoldings[inv.id] || 0;
            if (val > 0) map[inv.id] = val;
        });

        return map;
    }

    /* --- Diversification (Shannon entropy) --- */
    function calcDiversification() {
        var map = getAllocationMap();
        var keys = Object.keys(map);
        if (keys.length === 0) return 0;

        var total = 0;
        keys.forEach(function (k) { total += map[k]; });
        if (total === 0) return 0;

        // Use sector-level diversification for stocks + other categories
        var sectorTotals = {};
        for (var ticker in app.state.stockHoldings) {
            var stock = app.getStockByTicker(ticker);
            if (!stock) continue;
            var val = app.state.stockHoldings[ticker] * stock.price;
            sectorTotals[stock.sector] = (sectorTotals[stock.sector] || 0) + val;
        }
        data.otherInvestments.forEach(function (inv) {
            var v = app.state.otherHoldings[inv.id] || 0;
            if (v > 0) sectorTotals[inv.id] = v;
        });

        var cats = Object.keys(sectorTotals);
        if (cats.length <= 1) return cats.length === 1 ? 15 : 0;

        var maxEntropy = Math.log(cats.length);
        var entropy = 0;
        cats.forEach(function (c) {
            var p = sectorTotals[c] / total;
            if (p > 0) entropy -= p * Math.log(p);
        });

        return (entropy / maxEntropy) * 100;
    }

    /* --- Risk gauge --- */
    function updateRiskGauge() {
        var totalSpent = app.getTotalSpent();
        var riskLabels = ["\u2014", "Very Low", "Low", "Moderate", "High", "Very High"];

        if (totalSpent === 0) {
            app.el("risk-level").textContent = "\u2014";
            app.qsa(".risk-dot").forEach(function (dot) { dot.className = "risk-dot"; });
            return;
        }

        var weightedRisk = 0;

        for (var ticker in app.state.stockHoldings) {
            var stock = app.getStockByTicker(ticker);
            if (!stock) continue;
            var val = app.state.stockHoldings[ticker] * stock.price;
            weightedRisk += (val / totalSpent) * stock.riskLevel;
        }

        data.otherInvestments.forEach(function (inv) {
            var v = app.state.otherHoldings[inv.id] || 0;
            if (v > 0) weightedRisk += (v / totalSpent) * inv.riskLevel;
        });

        var riskInt = Math.round(weightedRisk);
        riskInt = app.clamp(riskInt, 1, 5);

        app.el("risk-level").textContent = riskLabels[riskInt];
        app.qsa(".risk-dot").forEach(function (dot) {
            var level = parseInt(dot.dataset.level, 10);
            dot.className = "risk-dot";
            if (level <= riskInt) dot.classList.add("active-" + level);
        });
    }

    /* --- Dividend income --- */
    function updateDividendIncome() {
        var totalDiv = 0;
        for (var ticker in app.state.stockHoldings) {
            var stock = app.getStockByTicker(ticker);
            if (!stock || !stock.dividend) continue;
            var invested = app.state.stockHoldings[ticker] * stock.price;
            totalDiv += invested * (stock.dividend / 100);
        }

        var el = app.el("dividend-income");
        if (totalDiv > 0) {
            el.textContent = app.formatCurrency(totalDiv) + " / year";
            el.style.color = "var(--color-success)";
        } else {
            el.textContent = "\u2014";
            el.style.color = "";
        }
    }

    /* --- Advice engine --- */
    function updateAdvice() {
        var totalSpent = app.getTotalSpent();
        var adviceList = app.el("advice-list");
        var messages = [];

        if (totalSpent === 0) {
            adviceList.innerHTML = '<p class="advice-empty">Start investing to receive personalized guidance.</p>';
            return;
        }

        // Sector concentration
        var sectorPcts = {};
        for (var ticker in app.state.stockHoldings) {
            var stock = app.getStockByTicker(ticker);
            if (!stock) continue;
            var val = app.state.stockHoldings[ticker] * stock.price;
            sectorPcts[stock.sector] = (sectorPcts[stock.sector] || 0) + val;
        }
        for (var sec in sectorPcts) {
            var pct = (sectorPcts[sec] / totalSpent) * 100;
            if (pct > 60) {
                messages.push({ type: "warning", icon: "\u26A0\uFE0F",
                    text: Math.round(pct) + "% of your portfolio is in " + sec + ". If this sector has a bad year, your whole portfolio takes a big hit. Consider diversifying into other sectors." });
            }
        }

        // Single stock concentration
        for (var t in app.state.stockHoldings) {
            var s = app.getStockByTicker(t);
            if (!s) continue;
            var v = app.state.stockHoldings[t] * s.price;
            var sp = (v / totalSpent) * 100;
            if (sp > 40) {
                messages.push({ type: "warning", icon: "\u26A0\uFE0F",
                    text: Math.round(sp) + "% of your portfolio is in " + s.name + " alone. Even great companies can have bad years. Spreading your investment reduces this risk." });
            }
        }

        // All in stocks, no bonds/savings
        var stockTotal = 0;
        for (var tk in app.state.stockHoldings) {
            var st = app.getStockByTicker(tk);
            if (st) stockTotal += app.state.stockHoldings[tk] * st.price;
        }
        var stockPct = (stockTotal / totalSpent) * 100;
        var bondsSavings = (app.state.otherHoldings.bonds || 0) + (app.state.otherHoldings.savings || 0);

        if (stockPct > 80 && bondsSavings === 0) {
            messages.push({ type: "info", icon: "\u{1F680}",
                text: "Your portfolio is almost entirely stocks. This is aggressive \u2014 great for long-term growth, but consider adding some bonds or savings as a safety cushion." });
        }

        // All in safe stuff
        if (bondsSavings > totalSpent * 0.7 && stockTotal === 0) {
            messages.push({ type: "info", icon: "\u{1F6E1}\uFE0F",
                text: "Your portfolio is very conservative with no stocks. This is safe but may not beat inflation over time. Even a small stock allocation can boost long-term returns." });
        }

        // No dividends
        var hasDividends = false;
        for (var d in app.state.stockHoldings) {
            var ds = app.getStockByTicker(d);
            if (ds && ds.dividend > 0) { hasDividends = true; break; }
        }
        if (stockTotal > 0 && !hasDividends) {
            messages.push({ type: "info", icon: "\u{1F4B0}",
                text: "None of your stocks pay dividends. Consider adding dividend-paying stocks like Coca-Cola or J&J for passive income alongside growth." });
        }

        // Good diversification
        var divScore = calcDiversification();
        if (divScore > 70 && totalSpent >= data.BUDGET * 0.5) {
            messages.push({ type: "success", icon: "\u2705",
                text: "Nice work! Your portfolio is well-diversified across sectors and investment types. This balanced approach helps manage risk." });
        }

        // High risk stocks
        var highRiskPct = 0;
        for (var hr in app.state.stockHoldings) {
            var hrs = app.getStockByTicker(hr);
            if (hrs && hrs.riskLevel >= 4) {
                highRiskPct += (app.state.stockHoldings[hr] * hrs.price / totalSpent) * 100;
            }
        }
        if (highRiskPct > 50) {
            messages.push({ type: "warning", icon: "\u{1F3A2}",
                text: "Over half your portfolio is in high-risk stocks. These can deliver big gains but also steep losses. Make sure you won't need this money in the short term." });
        }

        // Budget fully used
        if (totalSpent >= data.BUDGET * 0.95) {
            messages.push({ type: "success", icon: "\u{1F389}",
                text: "You've invested most of your $10,000 budget! Head to the Simulate tab to see how your portfolio might grow over time." });
        }

        if (messages.length === 0) {
            adviceList.innerHTML = '<p class="advice-empty">Looking good! Keep building your portfolio.</p>';
            return;
        }

        adviceList.innerHTML = messages.map(function (msg) {
            return '<div class="advice-item advice-' + msg.type + '">' +
                '<span class="advice-icon">' + msg.icon + '</span>' +
                '<span>' + msg.text + '</span>' +
            '</div>';
        }).join("");
    }

    /* --- Set holdings programmatically (used by Quiz) --- */
    function setHoldings(suggested) {
        // Clear existing
        app.state.stockHoldings = {};
        app.state.otherHoldings = { bonds: 0, etfs: 0, savings: 0 };

        // Set stocks
        if (suggested.stocks) {
            for (var ticker in suggested.stocks) {
                app.state.stockHoldings[ticker] = suggested.stocks[ticker];
            }
        }

        // Set others
        if (suggested.bonds !== undefined) app.state.otherHoldings.bonds = suggested.bonds;
        if (suggested.etfs !== undefined) app.state.otherHoldings.etfs = suggested.etfs;
        if (suggested.savings !== undefined) app.state.otherHoldings.savings = suggested.savings;

        // Re-render
        renderStockGrid();
        renderOtherInvestments();
        updateSummary();
    }

    function getTotal() {
        return app.getTotalSpent();
    }

    function getAllocMap() {
        return getAllocationMap();
    }

    /* --- Live stock price lookup (web scraping + CSV, manual fallback) --- */
    function initStockLookup() {
        var input = app.el("lookup-ticker-input");
        var btn = app.el("lookup-btn");
        var resultEl = app.el("lookup-result");

        btn.addEventListener("click", doLookup);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") doLookup();
        });

        function doLookup() {
            var ticker = input.value.trim().toUpperCase().replace(/[^A-Z0-9.]/g, "");
            if (!ticker) return;

            resultEl.style.display = "block";
            resultEl.innerHTML = '<span class="lookup-loading">Looking up ' + ticker + '&hellip;</span>';
            btn.disabled = true;

            fetchLivePrice(ticker, function (name, price) {
                btn.disabled = false;
                if (price && price > 0) {
                    showLookupResult(ticker, name || ticker, price);
                } else {
                    showManualEntry(ticker);
                }
            });
        }

        /*
         * Try multiple data sources in order:
         *  1. Scrape Yahoo Finance page HTML via allorigins proxy — parse the
         *     JSON data Yahoo embeds in the page (regularMarketPrice / shortName)
         *  2. Stooq CSV via allorigins proxy — simple CSV, Close at column 6
         *  3. Stooq CSV direct — in case CORS is allowed
         * Calls back with (name, price) on success, or (null, null) on total failure.
         */
        function fetchLivePrice(ticker, callback) {
            var sym = (ticker.indexOf(".") === -1 ? ticker + ".US" : ticker).toLowerCase();

            var yahooPage = "https://finance.yahoo.com/quote/" + encodeURIComponent(ticker) + "/";
            var stooqCsv  = "https://stooq.com/q/l/?s=" + encodeURIComponent(sym) + "&f=sd2t2ohlcv&h&e=csv";

            var attempts = [
                { url: "https://api.allorigins.win/raw?url=" + encodeURIComponent(yahooPage), parse: parseYahooHtml },
                { url: "https://api.allorigins.win/raw?url=" + encodeURIComponent(stooqCsv),  parse: parseStooqCsv  },
                { url: stooqCsv,                                                               parse: parseStooqCsv  }
            ];

            function tryNext(i) {
                if (i >= attempts.length) { callback(null, null); return; }
                var a = attempts[i];
                fetch(a.url)
                    .then(function (res) {
                        if (!res.ok) throw new Error("HTTP " + res.status);
                        return res.text();
                    })
                    .then(function (text) {
                        var result = a.parse(text, ticker);
                        if (result && result.price > 0) {
                            callback(result.name, result.price);
                        } else {
                            tryNext(i + 1);
                        }
                    })
                    .catch(function () { tryNext(i + 1); });
            }

            tryNext(0);
        }

        /* Parse price + name from Yahoo Finance page HTML.
         * Yahoo embeds a large JSON object in the page that contains these keys. */
        function parseYahooHtml(html, ticker) {
            var priceMatch = html.match(/"regularMarketPrice"\s*:\s*\{\s*"raw"\s*:\s*([\d.]+)/);
            if (!priceMatch) {
                // Newer Yahoo page format stores it differently
                priceMatch = html.match(/"regularMarketPrice":([\d.]+)/);
            }
            if (!priceMatch) return null;

            var price = parseFloat(priceMatch[1]);
            if (!price || price <= 0) return null;

            var nameMatch = html.match(/"shortName"\s*:\s*"([^"]+)"/);
            var name = nameMatch ? nameMatch[1] : ticker;

            return { price: Math.round(price * 100) / 100, name: name };
        }

        /* Parse Close price from Stooq CSV.
         * Format string "sd2t2ohlcv" → columns: Symbol(0) Date(1) Time(2) Open(3) High(4) Low(5) Close(6) Volume(7) */
        function parseStooqCsv(csv, ticker) {
            var lines = csv.trim().split(/\r?\n/);
            if (lines.length < 2) return null;

            var cols = lines[1].split(",");
            var closeStr = (cols[6] || "").trim();
            var price = parseFloat(closeStr);

            if (!closeStr || closeStr === "N/D" || isNaN(price) || price <= 0) return null;

            return { price: Math.round(price * 100) / 100, name: ticker };
        }

        function showLookupResult(ticker, name, price) {
            // Already in preset stocks?
            var stocks = data.stocks;
            for (var i = 0; i < stocks.length; i++) {
                if (stocks[i].ticker === ticker) {
                    resultEl.innerHTML =
                        '<div class="lookup-already-exists">' +
                            '<strong>' + ticker + '</strong> is already in the marketplace above at ' +
                            app.formatCurrency(stocks[i].price) + '/share.' +
                            ' <span class="lookup-live-note">Live: ' + app.formatCurrency(price) + '</span>' +
                        '</div>';
                    return;
                }
            }

            // Already added as custom? Update price.
            var custom = data.customStocks;
            for (var j = 0; j < custom.length; j++) {
                if (custom[j].ticker === ticker) {
                    custom[j].price = price;
                    custom[j].name = name;
                    resultEl.innerHTML =
                        '<div class="lookup-already-exists">' +
                            '<strong>' + ticker + '</strong> already in your marketplace — price updated to ' +
                            app.formatCurrency(price) + '/share.' +
                        '</div>';
                    renderStockGrid();
                    updateSummary();
                    return;
                }
            }

            resultEl.innerHTML =
                '<div class="lookup-found-card">' +
                    '<div class="lookup-found-info">' +
                        '<span class="lookup-found-ticker">' + ticker + '</span>' +
                        '<span class="lookup-found-name">' + name + '</span>' +
                        '<span class="lookup-found-price">' + app.formatCurrency(price) + '/share</span>' +
                        '<span class="live-badge">Live</span>' +
                    '</div>' +
                    '<button class="btn btn-primary btn-sm" id="lookup-add-btn">+ Add to Marketplace</button>' +
                '</div>';

            app.el("lookup-add-btn").addEventListener("click", function () {
                addCustomStock(ticker, name, price);
                resultEl.style.display = "none";
                input.value = "";
            });
        }

        /* Shown when all proxies fail — lets user enter price manually */
        function showManualEntry(ticker) {
            resultEl.innerHTML =
                '<div class="lookup-manual">' +
                    '<p class="lookup-manual-note">Live price unavailable for <strong>' + ticker + '</strong>. Enter details manually:</p>' +
                    '<div class="lookup-manual-fields">' +
                        '<input type="text" id="lookup-manual-name" class="lookup-manual-input" ' +
                            'placeholder="Company name" value="' + ticker + '">' +
                        '<div class="lookup-manual-price-row">' +
                            '<span class="dollar-sign">$</span>' +
                            '<input type="number" id="lookup-manual-price" class="lookup-manual-input lookup-manual-price" ' +
                                'placeholder="Price per share" min="0.01" step="0.01">' +
                        '</div>' +
                        '<button class="btn btn-primary btn-sm" id="lookup-manual-add-btn">+ Add to Marketplace</button>' +
                    '</div>' +
                '</div>';

            app.el("lookup-manual-add-btn").addEventListener("click", function () {
                var name = app.el("lookup-manual-name").value.trim() || ticker;
                var price = parseFloat(app.el("lookup-manual-price").value);
                if (!price || price <= 0) {
                    app.el("lookup-manual-price").style.borderColor = "var(--color-danger)";
                    return;
                }
                addCustomStock(ticker, name, price);
                resultEl.style.display = "none";
                input.value = "";
            });
        }
    }

    function addCustomStock(ticker, name, price) {
        data.customStocks.push({
            ticker: ticker,
            name: name,
            price: price,
            sector: "Custom",
            sectorColor: "#607D8B",
            riskLevel: 3,
            typicalReturn: { min: -25, max: 35, average: 10 },
            dividend: 0,
            description: name + " — added with a live market price. The simulator uses default return estimates for custom stocks.",
            whyBuy: ["You added this stock to explore it in the simulator."],
            risks: ["Custom stocks use generic return assumptions. Real-world performance will differ."],
            guidance: "This stock was added using live market data. Since we don't have detailed analysis, the simulation uses broad market averages as a stand-in.",
            isCustom: true
        });
        renderSectorFilters();
        renderStockGrid();
        updateSummary();
    }

    return {
        init: init,
        setHoldings: setHoldings,
        getTotal: getTotal,
        getAllocMap: getAllocMap
    };
})();
