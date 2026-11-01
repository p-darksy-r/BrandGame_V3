/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

// --- RENDERERS ---
function renderCategoryCards() {
    const grid = document.getElementById("category-cards-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const categories = [
        { id: "tech", label: "Technology", desc: "Code and hardware masters.", bg: "from-blue-900 to-indigo-950" },
        { id: "auto", label: "Automotive", desc: "Supercar and speed engine marks.", bg: "from-red-950 to-orange-950" },
        { id: "food", label: "Food & Drink", desc: "Snack lines and beverage labels.", bg: "from-emerald-950 to-green-900" },
        { id: "fashion", label: "Fashion", desc: "Jewelry, styling and luxury icons.", bg: "from-pink-950 to-purple-950" },
        { id: "media", label: "Media & Fun", desc: "Entertainment, gaming, and logos.", bg: "from-amber-950 to-yellow-950" }
    ];

    categories.forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat.id] || 1;
        const totalScore = GAME_STATE.saveData.categoryScores[cat.id] || 0;
        const card = document.createElement("button");
        card.className = "flex flex-col text-left p-5 rounded-2xl border border-gray-800 bg-gradient-to-br " + cat.bg + " hover:border-gray-600 transition h-48 justify-between relative overflow-hidden group";
        card.innerHTML = `
            <div>
                <h3 class="gaming-font text-base font-bold tracking-wide">${cat.label}</h3>
                <p class="text-[10px] text-gray-400 mt-1 leading-normal">${cat.desc}</p>
            </div>
            <div class="z-10">
                <div class="text-[9px] uppercase font-bold text-gray-500">Accumulated score</div>
                <div class="text-xs font-bold text-white">${totalScore} Points</div>
            </div>
            <span class="absolute right-3 bottom-3 text-4xl font-black text-white/5 group-hover:text-white/10 transition">
                ${Math.min(unlocked, 100)}/100
            </span>
        `;
        card.addEventListener("click", () => selectCategory(cat.id, cat.label));
        grid.appendChild(card);
    });

    const customCount = GAME_STATE.saveData.customLevels ? GAME_STATE.saveData.customLevels.length : 0;
    const customScore = GAME_STATE.saveData.customScore || 0;
    const customCard = document.createElement("button");
    customCard.className = "flex flex-col text-left p-5 rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-950 hover:border-emerald-400 transition h-48 justify-between relative overflow-hidden group";
    customCard.innerHTML = `
        <div>
            <h3 class="gaming-font text-base font-bold tracking-wide text-emerald-400 flex items-center gap-1.5">
                <span>Custom Arena</span>
            </h3>
            <p class="text-[10px] text-gray-400 mt-1 leading-normal">Play community & custom made level designs.</p>
        </div>
        <div class="z-10">
            <div class="text-[9px] uppercase font-bold text-emerald-600">Total Custom Score</div>
            <div class="text-xs font-bold text-emerald-300">${customScore} CP</div>
        </div>
        <span class="absolute right-3 bottom-3 text-4xl font-black text-emerald-500/5 group-hover:text-emerald-500/10 transition">
            ${customCount} R
        </span>
    `;
    customCard.addEventListener("click", selectCustomCategory);
    grid.appendChild(customCard);
}

function selectCategory(catId, catLabel) {
    GAME_STATE.currentCategory = catId;
    GAME_STATE.levelSelectPage = 0;

    const catTitle = document.getElementById("level-category-title");
    if (catTitle) catTitle.textContent = catLabel;
    const catBadge = document.getElementById("level-category-badge");
    if (catBadge) catBadge.textContent = catLabel;

    const pageSelect = document.getElementById("select-level-page");
    if (pageSelect) {
        pageSelect.value = "0";
        if (pageSelect.parentElement) {
            pageSelect.parentElement.classList.remove("hidden");
        }
    }

    renderLevelButtonsList();
    showScreen("screen-levels");
}

function renderLevelButtonsList() {
    const grid = document.getElementById("level-buttons-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const catId = GAME_STATE.currentCategory;
    const unlockedMax = GAME_STATE.saveData.levelsUnlocked[catId] || 1;

    grid.className = "grid grid-cols-5 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar";
    grid.style.maxHeight = "360px";
    grid.style.overflowY = "auto";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(5, minmax(0, 1fr))";

    const startLevel = (GAME_STATE.levelSelectPage * 10) + 1;
    const endLevel = Math.min(startLevel + 9, 100);

    for (let i = startLevel; i <= endLevel; i++) {
        const isLocked = i > unlockedMax;
        const btn = document.createElement("button");

        if (isLocked) {
            btn.className = "flex flex-col items-center justify-center p-3 bg-gray-950/60 border border-gray-900 rounded-xl opacity-40 cursor-not-allowed aspect-square";
            btn.innerHTML = `<span class="text-gray-600 text-lg">🔒</span><span class="gaming-font text-[9px] font-bold text-gray-600 mt-1">LVL ${i}</span>`;
        } else {
            btn.className = "flex flex-col items-center justify-center p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500 rounded-xl transition group aspect-square";
            btn.innerHTML = `<span class="text-blue-400 text-sm group-hover:scale-110 transition">★</span><span class="gaming-font text-[10px] font-black text-white mt-1">LEVEL ${i}</span>`;
            btn.addEventListener("click", () => launchLevel(i));
        }
        grid.appendChild(btn);
    }
}
