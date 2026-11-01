/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

function launchLevel(levelNum) {
    GAME_STATE.currentLevel = levelNum;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    // Seeds our brand compiler dynamically
    GAME_STATE.activeBrands = getBrandsForLevel(GAME_STATE.currentCategory, levelNum);

    if (!GAME_STATE.activeBrands.length) return;
    showScreen("screen-gameplay");
    loadNextBrand();
}

function launchCustomLevel(customIndex) {
    const targetRoom = GAME_STATE.saveData.customLevels[customIndex];
    if (!targetRoom || !targetRoom.brands.length) return;
    GAME_STATE.currentLevel = customIndex;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    GAME_STATE.activeBrands = targetRoom.brands;

    clearCustomThemeClasses();
    if (targetRoom.theme) {
        document.body.classList.add(`theme-${targetRoom.theme}`);
    }

    showScreen("screen-gameplay");
    loadNextBrand();
}

function loadNextBrand() {
    clearInterval(GAME_STATE.timerInterval);
    const inputField = document.getElementById("input-guess");
    if (inputField) inputField.value = "";

    const clueText = document.getElementById("clue-text");
    if (clueText) clueText.classList.add("hidden");

    GAME_STATE.revealedIndices = [];
    GAME_STATE.clueCost = 0;
    GAME_STATE.hintUsed = false;
    GAME_STATE.roundStatus = "playing";
    document.getElementById("feedback-overlay")?.classList.add("hidden");

    GAME_STATE.currentBrand = GAME_STATE.activeBrands[GAME_STATE.currentBrandIndex];
    const brandIdx = document.getElementById("gameplay-brand-index");
    if (brandIdx) brandIdx.textContent = `${GAME_STATE.currentBrandIndex + 1} / ${GAME_STATE.activeBrands.length}`;

    let hearts = "";
    for (let i = 0; i < GAME_STATE.lives; i++) hearts += "❤";
    const livesEl = document.getElementById("gameplay-lives");
    if (livesEl) livesEl.textContent = hearts;

    renderRevealedLetters();

    const img = document.getElementById("logo-image");
    const placeholder = document.getElementById("logo-placeholder");
    if (img) {
        img.src = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${GAME_STATE.currentBrand.slug}.svg`;
        // Simple Icons uses black SVG paths; invert them against the dark board.
        img.style.filter = "grayscale(1) invert(1) brightness(0.8)";

        img.onerror = () => {
            img.classList.add("hidden");
            if (placeholder) placeholder.classList.remove("hidden");
        };
        img.onload = () => {
            img.classList.remove("hidden");
            if (placeholder) placeholder.classList.add("hidden");
        };
    }

    let timeLimit = 15;
    if (GAME_STATE.currentCategory === "custom") {
        const currentCustomRoom = GAME_STATE.saveData.customLevels[GAME_STATE.currentLevel];
        if (currentCustomRoom) {
            if (currentCustomRoom.timer) {
                timeLimit = currentCustomRoom.timer;
            } else {
                const diff = currentCustomRoom.difficulty || "medium";
                if (diff === "easy") timeLimit = 30;
                else if (diff === "hard") timeLimit = 8;
            }
        }
    } else {
        if (GAME_STATE.saveData.difficulty === "easy") timeLimit = 30;
        if (GAME_STATE.saveData.difficulty === "hard") timeLimit = 8;
    }

    GAME_STATE.elapsedTime = 0;
    const bar = document.getElementById("timer-bar");
    if (bar) {
        bar.style.width = "100%";
        bar.style.backgroundColor = "#3b82f6";
    }

    GAME_STATE.timerInterval = setInterval(() => {
        GAME_STATE.elapsedTime += 0.1;
        const rem = Math.max(((timeLimit - GAME_STATE.elapsedTime) / timeLimit) * 100, 0);
        if (bar) {
            bar.style.width = `${rem}%`;
            if (rem < 30) bar.style.backgroundColor = "#ef4444";
            else if (rem < 60) bar.style.backgroundColor = "#f59e0b";
        }

        if (GAME_STATE.elapsedTime >= timeLimit) {
            clearInterval(GAME_STATE.timerInterval);
            processLossOfLife();
        }
    }, 100);
}

function advanceTurn() {
    if (GAME_STATE.roundStatus !== "feedback") return;
    GAME_STATE.roundStatus = "idle";
    GAME_STATE.currentBrandIndex++;
    if (GAME_STATE.currentBrandIndex >= GAME_STATE.activeBrands.length) triggerLevelEnd(true);
    else loadNextBrand();
}
