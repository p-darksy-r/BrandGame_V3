/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

function selectCustomCategory() {
    GAME_STATE.currentCategory = "custom";

    const catTitle = document.getElementById("level-category-title");
    if (catTitle) catTitle.textContent = "Custom Arena Rooms";
    const catBadge = document.getElementById("level-category-badge");
    if (catBadge) catBadge.textContent = "CUSTOM";

    const parentSel = document.getElementById("select-level-page");
    if (parentSel && parentSel.parentElement) {
        parentSel.parentElement.classList.add("hidden");
    }

    const grid = document.getElementById("level-buttons-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const list = GAME_STATE.saveData.customLevels || [];
    if (list.length === 0) {
        grid.className = "flex flex-col items-center justify-center col-span-5 py-12 text-center text-gray-500";
        grid.innerHTML = `
            <div class="text-4xl mb-2">☄</div>
            <p class="text-sm font-semibold uppercase tracking-wider">No Custom Levels Added</p>
            <p class="text-[11px] text-gray-600 mt-1 max-w-xs">Tap the '+ BUILD CUSTOM LEVEL' button in the header right corner to publish your first challenge playroom!</p>
        `;
        showScreen("screen-levels");
        return;
    }

    grid.className = "grid grid-cols-5 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar";
    grid.style.maxHeight = "360px";
    grid.style.overflowY = "auto";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(5, minmax(0, 1fr))";

    list.forEach((room, index) => {
        const btn = document.createElement("button");
        btn.className = "flex flex-col items-center justify-center p-3 bg-gray-900 hover:bg-emerald-950/40 border border-gray-800 hover:border-emerald-500 rounded-xl transition group text-center aspect-square";
        btn.innerHTML = `
            <span class="text-emerald-400 text-base group-hover:scale-110 transition">☄</span>
            <span class="gaming-font text-[9px] font-black text-white mt-1 line-clamp-2 uppercase"></span>
        `;
        btn.querySelector("span:last-child").textContent = room.name;
        btn.addEventListener("click", () => launchCustomLevel(index));
        grid.appendChild(btn);
    });
    showScreen("screen-levels");
}

function publishCustomLevelRoom() {
    const levelNameEl = document.getElementById("creator-level-name");
    const levelName = levelNameEl ? levelNameEl.value.trim() : "";

    if (!levelName) {
        alert("Please enter a custom name for your Level Room!");
        return;
    }

    const catEl = document.getElementById("creator-level-category");
    const category = catEl ? catEl.value : "tech";

    const diffEl = document.getElementById("creator-level-difficulty");
    const difficulty = diffEl ? diffEl.value : "medium";

    const themeEl = document.getElementById("creator-level-theme");
    const theme = themeEl ? themeEl.value : "cyber-neon";

    const timerEl = document.getElementById("creator-level-timer");
    const timer = Math.max(5, Math.min(120, timerEl ? (parseInt(timerEl.value) || 15) : 15));

    const customBrands = [];
    for (let i = 1; i <= 10; i++) {
        const nameEl = document.getElementById(`c-brand-${i}-name`);
        const slugEl = document.getElementById(`c-brand-${i}-slug`);
        const hintEl = document.getElementById(`c-brand-${i}-hint`);

        if (!nameEl || !slugEl) continue;

        const bName = nameEl.value.trim();
        const bSlug = slugEl.value.trim().toLowerCase();
        const bHint = hintEl ? hintEl.value.trim() : "";

        if (!bName && !bSlug) continue;

        if (!bName || !bSlug) {
            alert(`Brand #${i} requires both a Name and an SVG Slug.`);
            return;
        }

        customBrands.push({
            name: bName,
            slug: bSlug,
            hint: bHint || "No clues defined."
        });
    }

    if (customBrands.length === 0) {
        alert("Please add at least one valid Brand (Name + Slug)!");
        return;
    }

    const newRoom = {
        id: "custom_" + Date.now(),
        name: levelName,
        category: category,
        difficulty: difficulty,
        theme: theme,
        timer: timer,
        brands: customBrands
    };

    if (!GAME_STATE.saveData.customLevels) GAME_STATE.saveData.customLevels = [];
    GAME_STATE.saveData.customLevels.push(newRoom);

    sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    updateGlobalStatsHUD();
    alert("Level Room Successfully Published!");

    renderCategoryCards();
    showScreen("screen-categories");
}
