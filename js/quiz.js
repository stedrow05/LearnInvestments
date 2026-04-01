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

        // Progress
        var pct = ((currentQuestion) / total) * 100;
        app.el("quiz-progress-fill").style.width = pct + "%";
        app.el("quiz-progress-text").textContent = "Question " + (currentQuestion + 1) + " of " + total;

        // Question
        var html = '<div class="quiz-question-text">' + q.question + '</div>';
        html += '<div class="quiz-options">';

        q.options.forEach(function (opt, i) {
            var selected = answers[currentQuestion] === i ? " selected" : "";
            html += '<button class="quiz-option' + selected + '" data-index="' + i + '">' +
                '<span class="quiz-option-radio"></span>' +
                '<span>' + opt.text + '</span>' +
            '</button>';
        });

        html += '</div>';
        area.innerHTML = html;

        // Bind option clicks
        app.qsa(".quiz-option", area).forEach(function (btn) {
            btn.addEventListener("click", function () {
                selectOption(parseInt(btn.dataset.index, 10));
            });
        });

        // Nav buttons
        app.el("quiz-prev-btn").disabled = currentQuestion === 0;

        var nextBtn = app.el("quiz-next-btn");
        if (currentQuestion === total - 1) {
            nextBtn.textContent = "See Results";
        } else {
            nextBtn.textContent = "Next";
        }
        nextBtn.disabled = answers[currentQuestion] === null;
    }

    function selectOption(index) {
        answers[currentQuestion] = index;

        // Update visual
        app.qsa(".quiz-option").forEach(function (btn, i) {
            btn.classList.toggle("selected", i === index);
        });

        app.el("quiz-next-btn").disabled = false;
    }

    function nextQuestion() {
        if (answers[currentQuestion] === null) return;

        var total = data.quizQuestions.length;

        if (currentQuestion === total - 1) {
            showResults();
            return;
        }

        currentQuestion++;
        renderQuestion();
    }

    function prevQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    }

    function showResults() {
        var total = data.quizQuestions.length;
        var scoreSum = 0;

        answers.forEach(function (ansIdx, qIdx) {
            if (ansIdx !== null) {
                scoreSum += data.quizQuestions[qIdx].options[ansIdx].score;
            }
        });

        var avgScore = scoreSum / total;

        // Determine profile
        var profile = null;
        var profiles = data.riskProfiles;
        for (var key in profiles) {
            var p = profiles[key];
            if (avgScore >= p.range[0] && avgScore <= p.range[1]) {
                profile = p;
                profile.key = key;
                break;
            }
        }

        if (!profile) {
            profile = avgScore < 2.5 ? profiles.conservative : profiles.aggressive;
            profile.key = avgScore < 2.5 ? "conservative" : "aggressive";
        }

        // Hide quiz, show results
        app.el("quiz-container").style.display = "none";
        app.el("quiz-results").style.display = "block";

        // Update progress to 100%
        app.el("quiz-progress-fill").style.width = "100%";

        var card = app.el("quiz-profile-card");
        var alloc = profile.suggestedAllocation;

        card.innerHTML =
            '<h3>Your Investor Profile</h3>' +
            '<div class="profile-badge ' + profile.key + '">' + profile.label + '</div>' +
            '<p class="profile-description">' + profile.description + '</p>' +
            '<h4 style="margin-bottom: 0.75rem;">Suggested Allocation</h4>' +
            '<div class="profile-allocation">' +
                allocItem("Stocks", alloc.stocks, data.investmentTypes[0].color) +
                allocItem("Bonds", alloc.bonds, data.investmentTypes[1].color) +
                allocItem("ETFs", alloc.etfs, data.investmentTypes[2].color) +
                allocItem("Savings", alloc.savings, data.investmentTypes[3].color) +
            '</div>' +
            '<button class="btn btn-primary" id="apply-profile-btn">Apply to Portfolio</button>' +
            '<span style="display:block; margin-top:0.5rem;">' +
                '<button class="btn btn-secondary" id="retake-quiz-btn">Retake Quiz</button>' +
            '</span>';

        // Bind apply button
        app.el("apply-profile-btn").addEventListener("click", function () {
            window.Portfolio.setAllocations(alloc);
            app.switchTab("portfolio");
        });

        // Bind retake button
        app.el("retake-quiz-btn").addEventListener("click", function () {
            currentQuestion = 0;
            answers = new Array(data.quizQuestions.length).fill(null);
            app.el("quiz-container").style.display = "block";
            app.el("quiz-results").style.display = "none";
            renderQuestion();
        });
    }

    function allocItem(label, pct, color) {
        return '<div class="profile-alloc-item">' +
            '<div class="profile-alloc-pct" style="color:' + color + '">' + pct + '%</div>' +
            '<div class="profile-alloc-label">' + label + '</div>' +
        '</div>';
    }

    return {
        init: init
    };
})();
