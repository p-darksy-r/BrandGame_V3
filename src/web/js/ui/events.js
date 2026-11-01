/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

function safeAddEventListener(id, event, callback) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
}

function setupEventHandlers() {
    safeAddEventListener("btn-menu-start", "click", () => {
        renderCategoryCards();
        showScreen("screen-categories");
    });

    safeAddEventListener("btn-menu-settings", "click", () => {
        syncSettingsPanel();
        showScreen("screen-settings");
    });

    safeAddEventListener("btn-menu-exit", "click", () => {
        if (confirm("Are you sure you want to close the game?")) {
            sendNativeRequest({ Action: "exit_app" });
        }
    });

    safeAddEventListener("btn-menu-reset", "click", () => {
        if (confirm("Permanently erase save progress and customized rooms?")) {
            GAME_STATE.saveData = createDefaultSaveData();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
            onSaveLoaded(GAME_STATE.saveData);
        }
    });

    safeAddEventListener("btn-categories-back", "click", () => showScreen("screen-main-menu"));
    safeAddEventListener("btn-levels-back", "click", () => showScreen("screen-categories"));
    safeAddEventListener("btn-settings-back", "click", () => showScreen("screen-main-menu"));
    safeAddEventListener("btn-creator-back", "click", () => showScreen("screen-categories"));

    safeAddEventListener("btn-gameplay-quit", "click", () => {
        clearInterval(GAME_STATE.timerInterval);
        GAME_STATE.roundStatus = "idle";
        if (GAME_STATE.currentCategory === "custom") {
            renderCategoryCards();
            showScreen("screen-categories");
        } else {
            showScreen("screen-levels");
        }
    });

    safeAddEventListener("btn-guess-submit", "click", submitUserGuess);

    const inputGuess = document.getElementById("input-guess");
    if (inputGuess) {
        inputGuess.addEventListener("keypress", (e) => {
            if (e.key === "Enter") submitUserGuess();
        });
    }

    safeAddEventListener("btn-gameplay-hint", "click", () => {
        if (GAME_STATE.roundStatus !== "playing" || GAME_STATE.hintUsed) return;
        GAME_STATE.hintUsed = true;
        const clueEl = document.getElementById("clue-text");
        if (clueEl) {
            clueEl.textContent = GAME_STATE.currentBrand.hint || "No clues available.";
            clueEl.classList.remove("hidden");
        }
        GAME_STATE.clueCost += 5;
    });

    safeAddEventListener("btn-gameplay-reveal-char", "click", buyLetterClue);

    safeAddEventListener("btn-report-continue", "click", () => {
        if (GAME_STATE.currentCategory === "custom") {
            selectCustomCategory();
        } else {
            const catTitle = document.getElementById("level-category-title");
            selectCategory(GAME_STATE.currentCategory, catTitle ? catTitle.textContent : "");
        }
    });

    // Window Resolution Setup
    ["sm", "md", "lg"].forEach(sz => {
        const mapping = { sm: { w: 800, h: 600 }, md: { w: 1024, h: 768 }, lg: { w: 1280, h: 960 } };
        safeAddEventListener(`btn-win-${sz}`, "click", () => {
            GAME_STATE.saveData.resolution = `${mapping[sz].w}x${mapping[sz].h}`;
            updateResolutionButtons();
            applyWindowBounds();
            sendNativeRequest({ Action: "resize_window", Width: mapping[sz].w, Height: mapping[sz].h });
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    });

    // Rendering Quality Toggles
    safeAddEventListener("btn-qual-low", "click", () => {
        GAME_STATE.saveData.quality = "low";
        applyVisualSettings();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });
    safeAddEventListener("btn-qual-high", "click", () => {
        GAME_STATE.saveData.quality = "high";
        applyVisualSettings();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });

    // FPS Limiter Config
    ["30", "60", "uncapped"].forEach(fps => {
        safeAddEventListener(`btn-fps-${fps}`, "click", () => {
            GAME_STATE.saveData.fpsLimit = fps;
            applyFrameBudgeting();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    });

    // Integrated Brightness Slider
    const briInput = document.getElementById("settings-brightness") || document.getElementById("brightness-slider");
    if (briInput) {
        briInput.addEventListener("input", (e) => {
            const val = e.target.value;
            GAME_STATE.saveData.brightness = parseInt(val);
            const lbl = document.getElementById("brightness-label") || document.getElementById("lbl-brightness");
            if (lbl) lbl.textContent = `${val}%`;
            applyVisualSettings();
        });
        briInput.addEventListener("change", () => {
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    }

    // V-Sync Interface Toggles
    safeAddEventListener("btn-vsync-off", "click", () => {
        GAME_STATE.saveData.vsync = false;
        applyVSyncStatus();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });
    safeAddEventListener("btn-vsync-on", "click", () => {
        GAME_STATE.saveData.vsync = true;
        applyVSyncStatus();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });

    // Unified Vibration Trigger Hook
    const getVibElement = () => document.getElementById("btn-vibrate-toggle") || document.getElementById("vibration-toggle");
    const vibBtn = getVibElement();
    if (vibBtn) {
        vibBtn.addEventListener("click", () => {
            GAME_STATE.saveData.vibration = !GAME_STATE.saveData.vibration;
            updateVibrationButton();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    }

    safeAddEventListener("btn-settings-close", "click", () => {
        const volSlider = document.getElementById("settings-volume") || document.getElementById("volume-slider");
        if (volSlider) {
            GAME_STATE.saveData.volume = parseFloat(volSlider.value);
            sfx.volume = GAME_STATE.saveData.volume;
        }
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        showScreen("screen-main-menu");
    });

    // Master Volume Control Integration
    const volSlider = document.getElementById("settings-volume") || document.getElementById("volume-slider");
    if (volSlider) {
        volSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            GAME_STATE.saveData.volume = val;
            sfx.volume = val;
            const lbl = document.getElementById("volume-label") || document.getElementById("lbl-volume");
            if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
        });
        volSlider.addEventListener("change", () => {
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    }

    // Difficulty Select Buttons
    ["easy", "medium", "hard"].forEach(df => {
        safeAddEventListener(`diff-${df}`, "click", () => {
            GAME_STATE.saveData.difficulty = df;
            updateDifficultyToggles();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    });

    safeAddEventListener("btn-trigger-creator", "click", () => {
        const fields = {
            "creator-level-name": "",
            "creator-level-category": "tech",
            "creator-level-difficulty": "medium",
            "creator-level-theme": "cyber-neon",
            "creator-level-timer": "15"
        };
        for (const [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = value;
        }

        for (let i = 1; i <= 10; i++) {
            const nameEl = document.getElementById(`c-brand-${i}-name`);
            const slugEl = document.getElementById(`c-brand-${i}-slug`);
            const hintEl = document.getElementById(`c-brand-${i}-hint`);
            if (nameEl) nameEl.value = "";
            if (slugEl) slugEl.value = "";
            if (hintEl) hintEl.value = "";
        }
        showScreen("screen-creator");
    });

    safeAddEventListener("btn-save-custom-level", "click", publishCustomLevelRoom);
}
