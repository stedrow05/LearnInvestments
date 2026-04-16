/* ===== App Controller ===== */
window.App = (function () {
    "use strict";

    var state = {
        currentTab: "portfolio",
        /* Stock holdings: { AAPL: 3, MSFT: 1, ... } (share counts) */
        stockHoldings: {},
        /* Other investments: dollar amounts */
        otherHoldings: { bonds: 0, etfs: 0, savings: 0 },
        /* Simulation tracking */
        simulationRun: false,
        simulationStale: false
    };

    var STORAGE_KEY = "learnInvestments_portfolio";

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                stockHoldings: state.stockHoldings,
                otherHoldings: state.otherHoldings
            }));
        } catch (e) { /* localStorage may be unavailable */ }
    }

    function loadState() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            var parsed = JSON.parse(saved);
            if (parsed.stockHoldings) state.stockHoldings = parsed.stockHoldings;
            if (parsed.otherHoldings) {
                state.otherHoldings.bonds = parsed.otherHoldings.bonds || 0;
                state.otherHoldings.etfs = parsed.otherHoldings.etfs || 0;
                state.otherHoldings.savings = parsed.otherHoldings.savings || 0;
            }
        } catch (e) { /* ignore corrupt data */ }
    }

    function resetState() {
        state.stockHoldings = {};
        state.otherHoldings = { bonds: 0, etfs: 0, savings: 0 };
        state.simulationRun = false;
        state.simulationStale = false;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }

    /* --- Utility functions --- */
    function formatCurrency(n) {
        return "$" + Math.round(n).toLocaleString("en-US");
    }

    function formatPercent(n) {
        return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function el(id) {
        return document.getElementById(id);
    }

    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return (parent || document).querySelectorAll(selector);
    }

    /* --- Calculate total spent --- */
    function getTotalSpent() {
        var data = window.AppData;
        var total = 0;

        // Stock holdings
        for (var ticker in state.stockHoldings) {
            var stock = getStockByTicker(ticker);
            if (stock) total += state.stockHoldings[ticker] * stock.price;
        }

        // Other holdings
        for (var key in state.otherHoldings) {
            total += state.otherHoldings[key];
        }

        return total;
    }

    function getRemaining() {
        return window.AppData.BUDGET - getTotalSpent();
    }

    function getStockByTicker(ticker) {
        var stocks = window.AppData.stocks;
        for (var i = 0; i < stocks.length; i++) {
            if (stocks[i].ticker === ticker) return stocks[i];
        }
        var custom = window.AppData.customStocks;
        for (var j = 0; j < custom.length; j++) {
            if (custom[j].ticker === ticker) return custom[j];
        }
        return null;
    }

    /* --- Tab Navigation --- */
    function initTabs() {
        qsa(".tab-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                switchTab(btn.dataset.tab);
            });
        });
    }

    function switchTab(tabName) {
        state.currentTab = tabName;

        qsa(".tab-btn").forEach(function (btn) {
            var isActive = btn.dataset.tab === tabName;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-selected", isActive);
        });

        qsa(".tab-panel").forEach(function (panel) {
            panel.classList.toggle("active", panel.id === "tab-" + tabName);
        });
    }

    /* --- Learn Sub-tabs --- */
    function initLearnTabs() {
        qsa(".learn-tab-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var tab = btn.dataset.learnTab;
                qsa(".learn-tab-btn").forEach(function (b) {
                    b.classList.toggle("active", b.dataset.learnTab === tab);
                });
                qsa(".learn-panel").forEach(function (p) {
                    p.classList.toggle("active", p.id === "learn-" + tab);
                });
            });
        });
    }

    /* --- Initialization --- */
    function init() {
        loadState();
        initTabs();
        initLearnTabs();

        if (window.ChartManager) ChartManager.init();
        if (window.ImpactAnalyzer) ImpactAnalyzer.init();
        if (window.Portfolio) Portfolio.init();
        if (window.Simulation) Simulation.init();
        if (window.Quiz) Quiz.init();
        if (window.Education) Education.init();
    }

    document.addEventListener("DOMContentLoaded", init);

    return {
        state: state,
        formatCurrency: formatCurrency,
        formatPercent: formatPercent,
        clamp: clamp,
        el: el,
        qs: qs,
        qsa: qsa,
        switchTab: switchTab,
        getTotalSpent: getTotalSpent,
        getRemaining: getRemaining,
        getStockByTicker: getStockByTicker,
        saveState: saveState,
        resetState: resetState
    };
})();
