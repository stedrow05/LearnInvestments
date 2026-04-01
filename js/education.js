/* ===== Education / Learn Tab ===== */
window.Education = (function () {
    "use strict";

    var data = window.AppData;
    var app;

    function init() {
        app = window.App;
        renderInvestmentTypes();
        renderGlossary();
        renderTips();
        initGlossarySearch();
    }

    /* --- Investment Type Accordions --- */
    function renderInvestmentTypes() {
        var container = app.el("investment-accordion");
        if (!container) return;

        container.innerHTML = data.investmentTypes.map(function (type) {
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
                            '<div class="detail-box benefits">' +
                                '<h4>\u2705 Benefits</h4>' +
                                '<ul>' + type.benefits.map(function (b) {
                                    return '<li>' + b + '</li>';
                                }).join("") + '</ul>' +
                            '</div>' +
                            '<div class="detail-box risks">' +
                                '<h4>\u26A0\uFE0F Risks</h4>' +
                                '<ul>' + type.risks.map(function (r) {
                                    return '<li>' + r + '</li>';
                                }).join("") + '</ul>' +
                            '</div>' +
                        '</div>' +
                        '<div class="detail-stats">' +
                            '<div class="detail-stat">' +
                                '<div class="detail-stat-value" style="color:' + type.color + '">' +
                                    type.typicalReturn.average + '%' +
                                '</div>' +
                                '<div class="detail-stat-label">Avg. Annual Return</div>' +
                            '</div>' +
                            '<div class="detail-stat">' +
                                '<div class="detail-stat-value">' + riskLabels[type.riskLevel] + '</div>' +
                                '<div class="detail-stat-label">Risk Level</div>' +
                            '</div>' +
                            '<div class="detail-stat">' +
                                '<div class="detail-stat-value">' +
                                    type.typicalReturn.min + '% to +' + type.typicalReturn.max + '%' +
                                '</div>' +
                                '<div class="detail-stat-label">Return Range</div>' +
                            '</div>' +
                        '</div>' +
                        (type.glossaryTerms.length > 0 ?
                            '<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--color-border-light);">' +
                                '<strong style="font-size:0.85rem; color:var(--color-text-secondary);">Related terms: </strong>' +
                                type.glossaryTerms.map(function (term) {
                                    return '<span class="glossary-link" data-term="' + term + '">' + term + '</span>';
                                }).join(", ") +
                            '</div>' : '') +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join("");

        // Bind accordion toggles
        container.querySelectorAll(".accordion-header").forEach(function (header) {
            header.addEventListener("click", function () {
                var item = header.parentElement;
                var body = item.querySelector(".accordion-body");
                var isOpen = item.classList.contains("open");

                // Close all others
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

        // Bind glossary term links
        initGlossaryPopovers(container);
    }

    /* --- Glossary --- */
    function renderGlossary(filter) {
        var container = app.el("glossary-list");
        if (!container) return;

        var terms = Object.keys(data.glossary).sort();

        if (filter) {
            var lower = filter.toLowerCase();
            terms = terms.filter(function (t) {
                return t.toLowerCase().includes(lower) ||
                       data.glossary[t].toLowerCase().includes(lower);
            });
        }

        if (terms.length === 0) {
            container.innerHTML = '<p style="color:var(--color-text-muted); padding:1rem;">No matching terms found.</p>';
            return;
        }

        container.innerHTML = terms.map(function (term) {
            return '<div class="glossary-item">' +
                '<div class="glossary-term">' + term + '</div>' +
                '<div class="glossary-definition">' + data.glossary[term] + '</div>' +
            '</div>';
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
            return '<div class="tip-card">' +
                '<span class="tip-number">' + (i + 1) + '</span>' +
                '<div class="tip-content">' +
                    '<strong>' + tip.title + '</strong>' +
                    '<p>' + tip.content + '</p>' +
                '</div>' +
            '</div>';
        }).join("");
    }

    /* --- Glossary Popovers --- */
    function initGlossaryPopovers(container) {
        var popover = app.el("glossary-popover");
        var termEl = app.el("popover-term");
        var defEl = app.el("popover-definition");

        if (!popover || !container) return;

        container.querySelectorAll(".glossary-link").forEach(function (link) {
            link.addEventListener("mouseenter", function (e) {
                var term = link.dataset.term;
                var definition = data.glossary[term] || data.glossary[term.toLowerCase()];

                if (!definition) return;

                termEl.textContent = term;
                defEl.textContent = definition;
                popover.style.display = "block";

                var rect = link.getBoundingClientRect();
                popover.style.left = Math.min(rect.left, window.innerWidth - 300) + "px";
                popover.style.top = (rect.bottom + 8) + "px";
            });

            link.addEventListener("mouseleave", function () {
                popover.style.display = "none";
            });
        });
    }

    return {
        init: init
    };
})();
