/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

function showScreen(screenId) {
    const screens = ["screen-main-menu", "screen-categories", "screen-levels", "screen-gameplay", "screen-report", "screen-settings", "screen-creator"];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === screenId) el.classList.remove("hidden");
            else el.classList.add("hidden");
        }
    });

    if (screenId !== "screen-gameplay") {
        clearCustomThemeClasses();
    }

    const header = document.getElementById("header-stats");
    if (header) {
        if (screenId === "screen-main-menu" || screenId === "screen-categories") header.classList.remove("hidden");
        else header.classList.add("hidden");
    }
}

function clearCustomThemeClasses() {
    document.body.classList.remove("theme-cyber-neon", "theme-retro-amber", "theme-matrix-green", "theme-midnight-blue");
}

function updateGlobalStatsHUD() {
    let globalStars = 0;
    ["tech", "auto", "food", "fashion", "media"].forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat] || 1;
        globalStars += (unlocked - 1) * 2;
    });
    const customCount = GAME_STATE.saveData.customLevels.length;
    globalStars += customCount * 2;

    const starsEl = document.getElementById("global-stars");
    if (starsEl) starsEl.textContent = globalStars;
    const scoreEl = document.getElementById("global-score");
    if (scoreEl) scoreEl.textContent = GAME_STATE.saveData.globalScore + (GAME_STATE.saveData.customScore || 0);
}

function renderMainMenuProgress() {
    const catList = document.getElementById("category-summary-list");
    if (!catList) return;

    catList.innerHTML = "";
    const categories = [
        { id: "tech", label: "Technology" },
        { id: "auto", label: "Automotive" },
        { id: "food", label: "Food & Beverage" },
        { id: "fashion", label: "Fashion & Luxury" },
        { id: "media", label: "Media & Entertain" }
    ];
    categories.forEach(cat => {
        const score = GAME_STATE.saveData.categoryScores[cat.id] || 0;
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat.id] || 1;
        const percent = Math.min(((unlocked - 1) / 100) * 100, 100);

        const item = document.createElement("div");
        item.className = "space-y-1";
        item.innerHTML = `
            <div class="flex justify-between text-xs font-bold uppercase tracking-wide">
                <span class="text-gray-300">${cat.label}</span>
                <span class="text-blue-400">Score: ${score}</span>
            </div>
            <div class="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800 flex">
                <div class="bg-blue-600 h-full" style="width: ${percent}%"></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500">
                <span>Progress: ${unlocked - 1}/100 Levels</span>
                <span>Max: Level ${Math.min(unlocked, 100)}</span>
            </div>
        `;
        catList.appendChild(item);
    });

    const customScore = GAME_STATE.saveData.customScore || 0;
    const customCount = GAME_STATE.saveData.customLevels.length;
    const customItem = document.createElement("div");
    customItem.className = "space-y-1 pt-2 border-t border-gray-800/60";
    customItem.innerHTML = `
        <div class="flex justify-between text-xs font-bold uppercase tracking-wide text-emerald-400">
            <span>Custom Arenas</span>
            <span>Score: ${customScore}</span>
        </div>
        <div class="flex justify-between text-[10px] text-gray-500">
            <span>Created Level Rooms: ${customCount}</span>
        </div>
    `;
    catList.appendChild(customItem);
}

function populatePageSelectDropdown() {
    const sel = document.getElementById("select-level-page");
    if (!sel) return;
    sel.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Levels ${i * 10 + 1} - ${i * 10 + 10}`;
        sel.appendChild(opt);
    }
    sel.addEventListener("change", (e) => {
        GAME_STATE.levelSelectPage = parseInt(e.target.value);
        renderLevelButtonsList();
    });
}
