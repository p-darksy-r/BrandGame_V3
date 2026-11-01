/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

function submitUserGuess() {
    if (GAME_STATE.roundStatus !== "playing") return;
    const inputField = document.getElementById("input-guess");
    const guess = inputField ? inputField.value.trim() : "";
    if (!guess) return;
    GAME_STATE.roundStatus = "pending";
    clearInterval(GAME_STATE.timerInterval);

    const result = calculateGuessResult(guess, GAME_STATE.currentBrand.name, GAME_STATE.elapsedTime);

    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage({
            UserGuess: guess,
            CorrectAnswer: GAME_STATE.currentBrand.name,
            TimeElapsed: Math.round(GAME_STATE.elapsedTime)
        });
    } else {
        onMatchResult(result);
    }
}

function onMatchResult(result) {
    if (GAME_STATE.roundStatus !== "pending") return;
    GAME_STATE.roundStatus = "feedback";
    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    if (overlay) overlay.classList.remove("hidden");
    if (textAns) textAns.textContent = GAME_STATE.currentBrand.name;

    const img = document.getElementById("logo-image");
    if (img) img.style.filter = "invert(1)";

    if (result.correct) {
        sfx.playCoin();
        if (badge) {
            badge.textContent = "CORRECT!";
            badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-emerald-400";
        }
        const matchEl = document.getElementById("feedback-match");
        if (matchEl) matchEl.textContent = `${Math.round(result.match)}%`;

        const finalScore = Math.max(result.score - GAME_STATE.clueCost, 5);
        const scoreEl = document.getElementById("feedback-score");
        if (scoreEl) scoreEl.textContent = `+${finalScore}`;
        if (statsCard) statsCard.classList.remove("hidden");

        GAME_STATE.currentLevelScore += finalScore;
        GAME_STATE.currentLevelCorrectCount++;
    } else {
        sfx.playWrong();
        triggerVibration();
        if (badge) {
            badge.textContent = "INCORRECT";
            badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
        }
        if (statsCard) statsCard.classList.add("hidden");
        GAME_STATE.lives--;
    }

    const nextBtn = document.getElementById("btn-feedback-next");
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (GAME_STATE.roundStatus !== "feedback") return;
            if (overlay) overlay.classList.add("hidden");
            if (GAME_STATE.lives <= 0) triggerLevelEnd(false);
            else advanceTurn();
        };
    }
}
window.onMatchResult = onMatchResult;

function processLossOfLife() {
    if (GAME_STATE.roundStatus !== "playing") return;
    GAME_STATE.roundStatus = "feedback";
    sfx.playWrong();
    triggerVibration();
    GAME_STATE.lives--;

    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    if (overlay) overlay.classList.remove("hidden");
    if (badge) {
        badge.textContent = "TIME OUT";
        badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
    }
    if (textAns) textAns.textContent = GAME_STATE.currentBrand.name;
    if (statsCard) statsCard.classList.add("hidden");

    const nextBtn = document.getElementById("btn-feedback-next");
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (GAME_STATE.roundStatus !== "feedback") return;
            if (overlay) overlay.classList.add("hidden");
            if (GAME_STATE.lives <= 0) triggerLevelEnd(false);
            else advanceTurn();
        };
    }
}
