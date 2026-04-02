/* ===== Chart Manager (Chart.js wrapper) ===== */
window.ChartManager = (function () {
    "use strict";

    var app;
    var growthChart = null;
    var pieChart = null;
    var data = window.AppData;

    function init() {
        app = window.App;
    }

    /* --- Get color for an allocation key --- */
    function getColor(key) {
        // Check if it's a stock ticker
        var stock = app.getStockByTicker(key);
        if (stock) return stock.sectorColor;

        // Check other investments
        for (var i = 0; i < data.otherInvestments.length; i++) {
            if (data.otherInvestments[i].id === key) return data.otherInvestments[i].color;
        }

        return "#999";
    }

    /* --- Get display name for an allocation key --- */
    function getName(key) {
        var stock = app.getStockByTicker(key);
        if (stock) return stock.ticker + " (" + stock.name + ")";

        for (var i = 0; i < data.otherInvestments.length; i++) {
            if (data.otherInvestments[i].id === key) return data.otherInvestments[i].name;
        }

        return key;
    }

    /* --- Allocation Pie Chart --- */
    function updateAllocationPie(allocMap) {
        var canvas = app.el("allocation-pie");
        if (!canvas) return;

        var labels = [];
        var values = [];
        var colors = [];

        for (var key in allocMap) {
            if (allocMap[key] > 0) {
                labels.push(getName(key));
                values.push(allocMap[key]);
                colors.push(getColor(key));
            }
        }

        if (values.length === 0) {
            if (pieChart) { pieChart.destroy(); pieChart = null; }
            return;
        }

        if (pieChart) {
            pieChart.data.labels = labels;
            pieChart.data.datasets[0].data = values;
            pieChart.data.datasets[0].backgroundColor = colors;
            pieChart.update();
            return;
        }

        pieChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: "#fff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: "60%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 10,
                            usePointStyle: true,
                            pointStyle: "circle",
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                var pct = ((ctx.parsed / total) * 100).toFixed(0);
                                return ctx.label + ": $" + ctx.parsed.toLocaleString() + " (" + pct + "%)";
                            }
                        }
                    }
                }
            }
        });
    }

    /* --- Growth Chart (simulation results) --- */
    function renderGrowthChart(userP, consP, aggP, initialTotal) {
        var canvas = app.el("sim-chart");
        if (!canvas) return;

        if (growthChart) { growthChart.destroy(); growthChart = null; }

        var years = userP.length;
        var labels = ["Start"];
        for (var i = 1; i <= years; i++) labels.push("Year " + i);

        var userMedian = [initialTotal].concat(userP.map(function (p) { return p.p50; }));
        var userLow = [initialTotal].concat(userP.map(function (p) { return p.p10; }));
        var userHigh = [initialTotal].concat(userP.map(function (p) { return p.p90; }));
        var consMedian = [initialTotal].concat(consP.map(function (p) { return p.p50; }));
        var aggMedian = [initialTotal].concat(aggP.map(function (p) { return p.p50; }));

        growthChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Your Portfolio (Median)",
                        data: userMedian,
                        borderColor: "#2C6FBB",
                        backgroundColor: "rgba(44, 111, 187, 0.05)",
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        tension: 0.3,
                        fill: false,
                        order: 1
                    },
                    {
                        label: "Optimistic (90th %ile)",
                        data: userHigh,
                        borderColor: "rgba(44, 111, 187, 0.25)",
                        backgroundColor: "rgba(44, 111, 187, 0.08)",
                        borderWidth: 1,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        tension: 0.3,
                        fill: "+1",
                        order: 3
                    },
                    {
                        label: "Pessimistic (10th %ile)",
                        data: userLow,
                        borderColor: "rgba(44, 111, 187, 0.25)",
                        backgroundColor: "rgba(44, 111, 187, 0.08)",
                        borderWidth: 1,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        tension: 0.3,
                        fill: false,
                        order: 4
                    },
                    {
                        label: "Conservative Benchmark",
                        data: consMedian,
                        borderColor: "#50C878",
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        tension: 0.3,
                        fill: false,
                        order: 2
                    },
                    {
                        label: "Aggressive Benchmark",
                        data: aggMedian,
                        borderColor: "#F5A623",
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        tension: 0.3,
                        fill: false,
                        order: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function (val) {
                                if (val >= 1000000) return "$" + (val / 1000000).toFixed(1) + "M";
                                if (val >= 1000) return "$" + (val / 1000).toFixed(0) + "K";
                                return "$" + val;
                            },
                            font: { size: 12 }
                        },
                        grid: { color: "rgba(0,0,0,0.05)" }
                    },
                    x: {
                        ticks: { font: { size: 12 }, maxTicksLimit: 15 },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { padding: 16, usePointStyle: true, pointStyle: "line", font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ctx.dataset.label + ": $" + Math.round(ctx.parsed.y).toLocaleString();
                            }
                        }
                    }
                },
                layout: { padding: { top: 10, bottom: 10 } }
            }
        });

        canvas.parentElement.style.minHeight = "400px";
    }

    return {
        init: init,
        updateAllocationPie: updateAllocationPie,
        renderGrowthChart: renderGrowthChart
    };
})();
