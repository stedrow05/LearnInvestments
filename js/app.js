/* ===== App Controller ===== */
window.App = (function () {
    "use strict";

    const state = {
        currentTab: "portfolio",
        allocations: { stocks: 0, bonds: 0, etfs: 0, savings: 0 }
    };

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

    /* --- Tab Navigation --- */
    function initTabs() {
        const tabBtns = qsa(".tab-btn");
        tabBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                switchTab(btn.dataset.tab);
            });
        });
    }

    function switchTab(tabName) {
        state.currentTab = tabName;

        qsa(".tab-btn").forEach(function (btn) {
            const isActive = btn.dataset.tab === tabName;
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
        initTabs();
        initLearnTabs();

        if (window.Portfolio) Portfolio.init();
        if (window.Simulation) Simulation.init();
        if (window.ChartManager) ChartManager.init();
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
        switchTab: switchTab
    };
})();
