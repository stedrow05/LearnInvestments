/* ===== Risk Tolerance Quiz ===== */
window.Quiz = (function () {
    "use strict";

    var data = window.AppData;
    var app;
    var currentQuestion = 0;
    var answers = [];

    function init() {
        app = window.App;
        answers = new Array(data.quizQuestions.length).fill(null);
        renderQuestion();
        app.el("quiz-next-btn").addEventListener("click", nextQuestion);
        app.el("quiz-prev-btn").addEventListener("click", prevQuestion);
    }

    function renderQuestion() {
        var q = data.quizQuestions[currentQuestion];
        var area = app.el("quiz-question-area");
        var total = data.quizQuestions.length;

        var pct = ((currentQuestion) / total) * 100;
        app.el("quiz-progress-fill").style.width = pct + "%";
        app.el("quiz-progress-text").textContent = "Question " + (currentQuestion + 1) + " of " + total;

        var html = '<div class="quiz-question-text">' + q.question + '</div><div class="quiz-options">';
        q.options.forEach(function (opt, i) {
            var selected = answers[currentQuestion] === i ? " selected" : "";
            html += '<button class="quiz-option' + selected + '" data-index="' + i + '">' +
                '<span class="quiz-option-radio"></span><span>' + opt.text + '</span></button>';
        });
        html += '</div>';
        area.innerHTML = html;

        app.qsa(".quiz-option", area).forEach(function (btn) {
            btn.addEventListener("click", function () {
                selectOption(parseInt(btn.dataset.index, 10));
            });
        });

        app.el("quiz-prev-btn").disabled = currentQuestion === 0;
        var nextBtn = app.el("quiz-next-btn");
        nextBtn.textContent = currentQuestion === total - 1 ? "See Results" : "Next";
        nextBtn.disabled = answers[currentQuestion] === null;
    }

    function selectOption(index) {
        answers[currentQuestion] = index;
        app.qsa(".quiz-option").forEach(function (btn, i) {
            btn.classList.toggle("selected", i === index);
        });
        app.el("quiz-next-btn").disabled = false;
    }

    function nextQuestion() {
        if (answers[currentQuestion] === null) return;
        if (currentQuestion === data.quizQuestions.length - 1) { showResults(); return; }
        currentQuestion++;
        renderQuestion();
    }

    function prevQuestion() {
        if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
    }

    function showResults() {
        var total = data.quizQuestions.length;
        var scoreSum = 0;
        answers.forEach(function (ansIdx, qIdx) {
            if (ansIdx !== null) scoreSum += data.quizQuestions[qIdx].options[ansIdx].score;
        });

        var avgScore = scoreSum / total;

        var profileKey = null;
        var profiles = data.riskProfiles;
        for (var key in profiles) {
            var p = profiles[key];
            if (avgScore >= p.range[0] && avgScore <= p.range[1]) { profileKey = key; break; }
        }
        if (!profileKey) profileKey = avgScore < 2.5 ? "conservative" : "aggressive";
        var profile = Object.assign({}, profiles[profileKey], { key: profileKey });

        app.el("quiz-container").style.display = "none";
        app.el("quiz-results").style.display = "block";

        var card = app.el("quiz-profile-card");
        var suggested = profile.suggestedHoldings;

        // Build stock list display
        var stocksHtml = '';
        if (suggested.stocks) {
            for (var ticker in suggested.stocks) {
                var stock = app.getStockByTicker(ticker);
                if (!stock) continue;
                var shares = suggested.stocks[ticker];
                var value = shares * stock.price;
                stocksHtml += '<div class="profile-holding-row">' +
                    '<span class="holding-ticker" style="color:' + stock.sectorColor + '">' + ticker + '</span>' +
                    '<span>' + stock.name + '</span>' +
                    '<span>' + shares + ' share' + (shares !== 1 ? 's' : '') + '</span>' +
                    '<span class="holding-value">$' + value.toLocaleString() + '</span>' +
                '</div>';
            }
        }

        var othersHtml = '';
        data.otherInvestments.forEach(function (inv) {
            var val = suggested[inv.id] || 0;
            if (val > 0) {
                othersHtml += '<div class="profile-holding-row">' +
                    '<span class="holding-ticker" style="color:' + inv.color + '">' + inv.icon + '</span>' +
                    '<span>' + inv.name + '</span>' +
                    '<span></span>' +
                    '<span class="holding-value">$' + val.toLocaleString() + '</span>' +
                '</div>';
            }
        });

        card.innerHTML =
            '<h3>Your Investor Profile</h3>' +
            '<div class="profile-badge ' + profile.key + '">' + profile.label + '</div>' +
            '<p class="profile-description">' + profile.description + '</p>' +
            '<h4 style="margin-bottom:0.75rem;">Suggested Portfolio</h4>' +
            '<div class="profile-holdings-list">' +
                stocksHtml + othersHtml +
            '</div>' +
            '<button class="btn btn-primary" id="apply-profile-btn" style="margin-top:1.5rem;">Apply to My Portfolio</button>' +
            '<span style="display:block; margin-top:0.5rem;">' +
                '<button class="btn btn-secondary" id="retake-quiz-btn">Retake Quiz</button>' +
            '</span>';

        app.el("apply-profile-btn").addEventListener("click", function () {
            var hasStocks = Object.keys(app.state.stockHoldings).length > 0;
            var hasOther = Object.keys(app.state.otherHoldings).some(function (k) {
                return app.state.otherHoldings[k] > 0;
            });
            if ((hasStocks || hasOther) && !confirm("This will replace your current portfolio. Continue?")) return;
            window.Portfolio.setHoldings(suggested);
            app.switchTab("portfolio");
        });

        app.el("retake-quiz-btn").addEventListener("click", function () {
            currentQuestion = 0;
            answers = new Array(data.quizQuestions.length).fill(null);
            app.el("quiz-container").style.display = "block";
            app.el("quiz-results").style.display = "none";
            renderQuestion();
        });
    }

    return { init: init };
})();
