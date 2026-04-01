/* ===== Portfolio Builder ===== */
window.Portfolio = (function () {
    "use strict";

    var data = window.AppData;
    var app;

    function init() {
        app = window.App;
        renderCards();
        updateSummary();
    }

    /* --- Render allocation cards --- */
    function renderCards() {
        var container = app.el("allocation-cards");
        container.innerHTML = "";

        data.investmentTypes.forEach(function (type) {
            var card = document.createElement("div");
            card.className = "alloc-card";
            card.style.borderLeftColor = type.color;

            var riskLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];
            var returnRange = type.typicalReturn.min + "% to +" + type.typicalReturn.max + "%";

            card.innerHTML =
                '<div class="alloc-card-header">' +
                    '<span class="alloc-card-icon">' + type.icon + '</span>' +
                    '<span class="alloc-card-title">' + type.name + '</span>' +
                '</div>' +
                '<div class="alloc-card-meta">' +
                    '<span class="meta-tag">Risk: ' + riskLabels[type.riskLevel] + '</span>' +
                    '<span class="meta-tag">Return: ' + returnRange + '/yr</span>' +
                '</div>' +
                '<p class="alloc-card-desc">' + type.description.split(".")[0] + '.</p>' +
                '<div class="alloc-slider-row">' +
                    '<input type="range" class="alloc-slider" ' +
                        'id="slider-' + type.id + '" ' +
                        'min="0" max="' + data.BUDGET + '" step="100" value="0" ' +
                        'aria-label="' + type.name + ' allocation" ' +
                        'style="accent-color: ' + type.color + '">' +
                    '<div class="alloc-input-group">' +
                        '<span class="dollar-sign">$</span>' +
                        '<input type="number" class="alloc-amount-input" ' +
                            'id="input-' + type.id + '" ' +
                            'min="0" max="' + data.BUDGET + '" step="100" value="0" ' +
                            'aria-label="' + type.name + ' dollar amount">' +
                    '</div>' +
                    '<span class="alloc-pct" id="pct-' + type.id + '">0%</span>' +
                '</div>';

            container.appendChild(card);

            // Bind events
            var slider = app.el("slider-" + type.id);
            var input = app.el("input-" + type.id);

            slider.addEventListener("input", function () {
                var val = parseInt(slider.value, 10);
                val = constrainAllocation(type.id, val);
                slider.value = val;
                input.value = val;
                app.state.allocations[type.id] = val;
                updateSummary();
            });

            input.addEventListener("input", function () {
                var val = parseInt(input.value, 10) || 0;
                val = app.clamp(val, 0, data.BUDGET);
                val = constrainAllocation(type.id, val);
                input.value = val;
                slider.value = val;
                app.state.allocations[type.id] = val;
                updateSummary();
            });
        });
    }

    /* --- Constrain so total doesn't exceed budget --- */
    function constrainAllocation(typeId, value) {
        var allocs = app.state.allocations;
        var otherTotal = 0;
        for (var key in allocs) {
            if (key !== typeId) otherTotal += allocs[key];
        }
        var max = data.BUDGET - otherTotal;
        return app.clamp(value, 0, max);
    }

    /* --- Get total allocated --- */
    function getTotal() {
        var allocs = app.state.allocations;
        var total = 0;
        for (var key in allocs) total += allocs[key];
        return total;
    }

    /* --- Update all summary displays --- */
    function updateSummary() {
        var allocs = app.state.allocations;
        var total = getTotal();

        // Update percentage labels
        data.investmentTypes.forEach(function (type) {
            var pctEl = app.el("pct-" + type.id);
            if (pctEl) {
                var pct = total > 0 ? (allocs[type.id] / data.BUDGET * 100) : 0;
                pctEl.textContent = Math.round(pct) + "%";
            }
        });

        // Budget bar
        var pct = (total / data.BUDGET) * 100;
        var fill = app.el("budget-bar-fill");
        fill.style.width = Math.min(pct, 100) + "%";
        fill.classList.toggle("over-budget", total > data.BUDGET);

        app.el("budget-allocated").textContent = app.formatCurrency(total);
        app.el("budget-remaining").textContent = app.formatCurrency(data.BUDGET - total) + " remaining";

        // Diversification score
        var divScore = calcDiversification();
        app.el("diversification-score").textContent = Math.round(divScore);
        app.el("diversification-bar").style.width = divScore + "%";

        // Risk level
        updateRiskGauge();

        // Expected return
        updateReturnRange();

        // Advice
        updateAdvice();

        // Pie chart
        if (window.ChartManager) ChartManager.updateAllocationPie(allocs);
    }

    /* --- Diversification score (Shannon entropy, normalized 0-100) --- */
    function calcDiversification() {
        var allocs = app.state.allocations;
        var total = getTotal();
        if (total === 0) return 0;

        var types = data.investmentTypes;
        var n = types.length;
        var maxEntropy = Math.log(n);
        var entropy = 0;

        types.forEach(function (type) {
            var p = allocs[type.id] / total;
            if (p > 0) entropy -= p * Math.log(p);
        });

        return (entropy / maxEntropy) * 100;
    }

    /* --- Risk gauge --- */
    function updateRiskGauge() {
        var allocs = app.state.allocations;
        var total = getTotal();
        var riskLabels = ["—", "Very Low", "Low", "Moderate", "High", "Very High"];

        if (total === 0) {
            app.el("risk-level").textContent = "—";
            app.qsa(".risk-dot").forEach(function (dot) { dot.className = "risk-dot"; });
            return;
        }

        var weightedRisk = 0;
        data.investmentTypes.forEach(function (type) {
            weightedRisk += (allocs[type.id] / total) * type.riskLevel;
        });

        var riskInt = Math.round(weightedRisk);
        riskInt = app.clamp(riskInt, 1, 5);

        app.el("risk-level").textContent = riskLabels[riskInt];

        app.qsa(".risk-dot").forEach(function (dot) {
            var level = parseInt(dot.dataset.level, 10);
            dot.className = "risk-dot";
            if (level <= riskInt) {
                dot.classList.add("active-" + level);
            }
        });
    }

    /* --- Expected return range --- */
    function updateReturnRange() {
        var allocs = app.state.allocations;
        var total = getTotal();
        var rangeEl = app.el("return-range");

        if (total === 0) {
            rangeEl.textContent = "—";
            rangeEl.style.color = "";
            return;
        }

        var weightedMin = 0, weightedMax = 0;
        data.investmentTypes.forEach(function (type) {
            var w = allocs[type.id] / total;
            weightedMin += w * type.typicalReturn.min;
            weightedMax += w * type.typicalReturn.max;
        });

        rangeEl.textContent = weightedMin.toFixed(1) + "% to +" + weightedMax.toFixed(1) + "% / year";
        rangeEl.style.color = weightedMin >= 0 ? "var(--color-success)" : "";
    }

    /* --- Advice engine --- */
    function updateAdvice() {
        var allocs = app.state.allocations;
        var total = getTotal();
        var adviceList = app.el("advice-list");
        var messages = [];

        if (total === 0) {
            adviceList.innerHTML = '<p class="advice-empty">Start allocating your budget to receive personalized advice.</p>';
            return;
        }

        var pcts = {};
        data.investmentTypes.forEach(function (type) {
            pcts[type.id] = (allocs[type.id] / total) * 100;
        });

        // Check for heavy concentration
        data.investmentTypes.forEach(function (type) {
            if (pcts[type.id] > 70) {
                messages.push({
                    type: "warning",
                    icon: "\u26A0\uFE0F",
                    text: "Your portfolio is heavily concentrated in " + type.name + " (" + Math.round(pcts[type.id]) + "%). Consider spreading your investments more broadly to reduce risk."
                });
            }
        });

        // Too much in savings
        if (pcts.savings > 50) {
            messages.push({
                type: "warning",
                icon: "\u{1F4A1}",
                text: "More than half your portfolio is in savings. While very safe, this may not keep up with inflation over time. Consider allocating some to growth investments if your timeline is long."
            });
        }

        // Missing asset classes
        data.investmentTypes.forEach(function (type) {
            if (allocs[type.id] === 0 && total > 0) {
                messages.push({
                    type: "info",
                    icon: "\u{1F4CC}",
                    text: "You haven't allocated anything to " + type.name + ". Adding even a small amount can improve diversification."
                });
            }
        });

        // Very conservative
        if ((pcts.bonds || 0) + (pcts.savings || 0) > 80) {
            messages.push({
                type: "info",
                icon: "\u{1F6E1}\uFE0F",
                text: "Your portfolio is very conservative. This is great for short-term goals (1-3 years), but may underperform over longer periods."
            });
        }

        // Very aggressive
        if ((pcts.stocks || 0) > 50 && (pcts.savings || 0) < 10) {
            messages.push({
                type: "info",
                icon: "\u{1F680}",
                text: "Your portfolio leans aggressive. This could deliver strong long-term returns, but expect some bumpy years. Make sure you won't need this money soon."
            });
        }

        // Well balanced
        var divScore = calcDiversification();
        if (divScore > 80 && total >= data.BUDGET * 0.5) {
            messages.push({
                type: "success",
                icon: "\u2705",
                text: "Great job! Your portfolio is well-diversified. This balanced approach helps manage risk while maintaining growth potential."
            });
        }

        // Budget fully allocated
        if (total === data.BUDGET) {
            messages.push({
                type: "success",
                icon: "\u{1F389}",
                text: "You've allocated your full $10,000 budget! Head over to the Simulate tab to see how your portfolio might perform over time."
            });
        }

        // Render
        if (messages.length === 0) {
            adviceList.innerHTML = '<p class="advice-empty">Looking good! Keep adjusting your allocation.</p>';
            return;
        }

        adviceList.innerHTML = messages.map(function (msg) {
            return '<div class="advice-item advice-' + msg.type + '">' +
                '<span class="advice-icon">' + msg.icon + '</span>' +
                '<span>' + msg.text + '</span>' +
            '</div>';
        }).join("");
    }

    /* --- Set allocations programmatically (used by Quiz) --- */
    function setAllocations(newAllocs) {
        data.investmentTypes.forEach(function (type) {
            var val = Math.round((newAllocs[type.id] / 100) * data.BUDGET);
            app.state.allocations[type.id] = val;

            var slider = app.el("slider-" + type.id);
            var input = app.el("input-" + type.id);
            if (slider) slider.value = val;
            if (input) input.value = val;
        });
        updateSummary();
    }

    return {
        init: init,
        setAllocations: setAllocations,
        getTotal: getTotal
    };
})();
