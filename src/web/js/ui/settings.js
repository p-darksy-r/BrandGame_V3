/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

function applyWindowBounds() {
    const res = GAME_STATE.saveData.resolution || "1024x768";
    const parts = res.split("x");
    const width = parseInt(parts[0]);
    const height = parseInt(parts[1]);

    const mainContainer = document.querySelector("main");
    if (mainContainer) {
        mainContainer.style.maxWidth = `${width}px`;
        mainContainer.style.maxHeight = `${height}px`;
        mainContainer.style.width = "100%";
        mainContainer.style.height = "100%";
    }
}

function applyVisualSettings() {
    const isLow = GAME_STATE.saveData.quality === "low";
    const btnLow = document.getElementById("btn-qual-low");
    const btnHigh = document.getElementById("btn-qual-high");

    if (isLow) {
        document.body.classList.add("low-quality");
        if (btnLow) btnLow.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        if (btnHigh) btnHigh.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    } else {
        document.body.classList.remove("low-quality");
        if (btnLow) btnLow.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        if (btnHigh) btnHigh.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
    }

    const rawBrightness = GAME_STATE.saveData.brightness || 100;

    // Applying CSS Filter directly to `<main>` wrapper so UI dropdowns stay visible
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
        mainContainer.style.filter = `brightness(${rawBrightness}%)`;
    } else {
        document.body.style.filter = `brightness(${rawBrightness}%)`;
    }
}

function applyMotionSettings() {
    document.body.classList.toggle("reduced-motion", GAME_STATE.saveData.reducedMotion);
    const checkbox = document.getElementById("settings-reduced-motion");
    if (checkbox) checkbox.checked = GAME_STATE.saveData.reducedMotion;
}

function syncSettingsPanel() {
    // 1. Sync Volume Control Elements
    const volSlider = document.getElementById("settings-volume") || document.getElementById("volume-slider");
    if (volSlider) volSlider.value = GAME_STATE.saveData.volume;
    sfx.volume = GAME_STATE.saveData.volume;

    const volLabel = document.getElementById("volume-label") || document.getElementById("lbl-volume");
    if (volLabel) volLabel.textContent = `${Math.round(GAME_STATE.saveData.volume * 100)}%`;

    // 2. Sync Brightness Control Elements
    const briSlider = document.getElementById("settings-brightness") || document.getElementById("brightness-slider");
    const bright = GAME_STATE.saveData.brightness || 100;
    if (briSlider) briSlider.value = bright;

    const briLabel = document.getElementById("brightness-label") || document.getElementById("lbl-brightness");
    if (briLabel) briLabel.textContent = `${bright}%`;

    // 3. Sync Remaining Engine Profiles
    updateDifficultyToggles();
    updateResolutionButtons();
    updateVibrationButton();
    applyMotionSettings();
    applyWindowBounds();
}

function updateResolutionButtons() {
    const res = GAME_STATE.saveData.resolution;
    ["800x600", "1024x768", "1280x960"].forEach(sz => {
        let btnId = "btn-win-sm";
        if (sz === "1024x768") btnId = "btn-win-md";
        if (sz === "1280x960") btnId = "btn-win-lg";

        const btn = document.getElementById(btnId);
        if (btn) {
            if (res === sz) btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
            else btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        }
    });
}

function updateVibrationButton() {
    const active = GAME_STATE.saveData.vibration;
    const btn = document.getElementById("btn-vibrate-toggle") || document.getElementById("vibration-toggle");
    if (btn) {
        if (active) {
            btn.textContent = "Enabled";
            btn.className = "px-4 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white uppercase";
        } else {
            btn.textContent = "Disabled";
            btn.className = "px-4 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 uppercase";
        }
    }
}

function updateDifficultyToggles() {
    ["easy", "medium", "hard"].forEach(df => {
        const btn = document.getElementById(`diff-${df}`);
        if (btn) {
            if (GAME_STATE.saveData.difficulty === df) {
                btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
            } else {
                btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
            }
        }
    });
}
