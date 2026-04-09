/* ===== Education / Learn Tab ===== */
window.Education = (function () {
    "use strict";

    var data = window.AppData;
    var app;

    function init() {
        app = window.App;
        renderCompanies();
        renderInvestmentTypes();
        renderGlossary();
        renderTips();
        initGlossarySearch();
    }

    /* --- Company Accordions --- */
    function renderCompanies() {
        var container = app.el("company-accordion");
        if (!container) return;

        var allStocks = data.stocks.concat(data.customStocks || []);
        var riskLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];

        container.innerHTML = allStocks.map(function (stock) {
            var customBadge = stock.isCustom
                ? '<span class="meta-tag meta-tag-custom" style="margin-left:auto;margin-right:0.5rem;">Custom</span>'
                : '<span class="meta-tag" style="margin-left:auto;margin-right:0.5rem;">' + stock.sector + '</span>';

            return '<div class="accordion-item">' +
                '<button class="accordion-header" aria-expanded="false">' +
                    '<span class="accordion-icon" style="font-size:1rem;font-weight:700;color:' + stock.sectorColor + '">' + stock.ticker + '</span>' +
                    '<span>' + stock.name + '</span>' +
                    customBadge +
                    '<span class="accordion-arrow">\u25BC</span>' +
                '</button>' +
                '<div class="accordion-body">' +
                    '<div class="accordion-content">' +
                        '<p style="margin-bottom:1rem; line-height:1.7;">' + stock.description + '</p>' +
                        '<div class="guidance-box"><h4>\u{1F4A1} Guidance for Beginners</h4><p>' + stock.guidance + '</p></div>' +
                        '<div class="invest-detail-grid">' +
                            '<div class="detail-box benefits"><h4>\u2705 Why Buy</h4><ul>' +
                                stock.whyBuy.map(function (b) { return '<li>' + b + '</li>'; }).join("") +
                            '</ul></div>' +
                            '<div class="detail-box risks"><h4>\u26A0\uFE0F Risks</h4><ul>' +
                                stock.risks.map(function (r) { return '<li>' + r + '</li>'; }).join("") +
                            '</ul></div>' +
                        '</div>' +
                        '<div class="detail-stats">' +
                            '<div class="detail-stat"><div class="detail-stat-value">' + app.formatCurrency(stock.price) + '</div><div class="detail-stat-label">Share Price</div></div>' +
                            '<div class="detail-stat"><div class="detail-stat-value" style="color:' + stock.sectorColor + '">' + stock.typicalReturn.average + '%</div><div class="detail-stat-label">Avg. Return</div></div>' +
                            '<div class="detail-stat"><div class="detail-stat-value">' + riskLabels[stock.riskLevel] + '</div><div class="detail-stat-label">Risk Level</div></div>' +
                            '<div class="detail-stat"><div class="detail-stat-value">' + (stock.dividend > 0 ? stock.dividend + '%' : 'None') + '</div><div class="detail-stat-label">Dividend</div></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join("");

        initAccordion(container);
    }

    /* --- Other Investment Type Accordions --- */
    function renderInvestmentTypes() {
        var container = app.el("investment-accordion");
        if (!container) return;

        container.innerHTML = data.otherInvestments.map(function (type) {
            var riskLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];

            return '<div class="accordion-item">' +
                '<button class="accordion-header" aria-expanded="false">' +
                    '<span class="accordion-icon">' + type.icon + '</span>' +
                    '<span>' + type.name + '</span>' +
                    '<span class="accordion-arrow">\u25BC</span>' +
                '</button>' +
                '<div class="accordion-body">' +
                    '<div class="accordion-content">' +
                        '<p style="margin-bottom:1rem; line-height:1.7;">' + type.description + '</p>' +
                        '<div class="invest-detail-grid">' +
                            '<div class="detail-box benefits"><h4>\u2705 Benefits</h4><ul>' +
                                type.benefits.map(function (b) { return '<li>' + b + '</li>'; }).join("") +
                            '</ul></div>' +
                            '<div class="detail-box risks"><h4>\u26A0\uFE0F Risks</h4><ul>' +
                                type.risks.map(function (r) { return '<li>' + r + '</li>'; }).join("") +
                            '</ul></div>' +
                        '</div>' +
                        '<div class="detail-stats">' +
                            '<div class="detail-stat"><div class="detail-stat-value" style="color:' + type.color + '">' + type.typicalReturn.average + '%</div><div class="detail-stat-label">Avg. Return</div></div>' +
                            '<div class="detail-stat"><div class="detail-stat-value">' + riskLabels[type.riskLevel] + '</div><div class="detail-stat-label">Risk Level</div></div>' +
                            '<div class="detail-stat"><div class="detail-stat-value">' +
                                (type.typicalReturn.min >= 0 ? '+' : '') + type.typicalReturn.min + '% to +' + type.typicalReturn.max + '%' +
                            '</div><div class="detail-stat-label">Return Range</div></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join("");

        initAccordion(container);
    }

    /* --- Shared accordion behavior --- */
    function initAccordion(container) {
        container.querySelectorAll(".accordion-header").forEach(function (header) {
            header.addEventListener("click", function () {
                var item = header.parentElement;
                var body = item.querySelector(".accordion-body");
                var isOpen = item.classList.contains("open");

                container.querySelectorAll(".accordion-item.open").forEach(function (openItem) {
                    if (openItem !== item) {
                        openItem.classList.remove("open");
                        openItem.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
                        openItem.querySelector(".accordion-body").style.maxHeight = null;
                    }
                });

                if (isOpen) {
                    item.classList.remove("open");
                    header.setAttribute("aria-expanded", "false");
                    body.style.maxHeight = null;
                } else {
                    item.classList.add("open");
                    header.setAttribute("aria-expanded", "true");
                    body.style.maxHeight = body.scrollHeight + "px";
                }
            });
        });
    }

    /* --- Glossary --- */
    function renderGlossary(filter) {
        var container = app.el("glossary-list");
        if (!container) return;

        var terms = Object.keys(data.glossary).sort();
        if (filter) {
            var lower = filter.toLowerCase();
            terms = terms.filter(function (t) {
                return t.toLowerCase().includes(lower) || data.glossary[t].toLowerCase().includes(lower);
            });
        }

        if (terms.length === 0) {
            container.innerHTML = '<p style="color:var(--color-text-muted); padding:1rem;">No matching terms found.</p>';
            return;
        }

        container.innerHTML = terms.map(function (term) {
            return '<div class="glossary-item"><div class="glossary-term">' + term +
                '</div><div class="glossary-definition">' + data.glossary[term] + '</div></div>';
        }).join("");
    }

    function initGlossarySearch() {
        var input = app.el("glossary-search-input");
        if (!input) return;
        input.addEventListener("input", function () {
            renderGlossary(input.value.trim());
        });
    }

    /* --- Tips --- */
    function renderTips() {
        var container = app.el("tips-list");
        if (!container) return;

        container.innerHTML = data.tips.map(function (tip, i) {
            return '<div class="tip-card"><span class="tip-number">' + (i + 1) + '</span>' +
                '<div class="tip-content"><strong>' + tip.title + '</strong><p>' + tip.content + '</p></div></div>';
        }).join("");
    }

    return { init: init, renderCompanies: renderCompanies };
})();
