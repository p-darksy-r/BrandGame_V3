// --- AUDIO SYSTEM ---
class RetroAudioSynth {
    constructor() {
        this.ctx = null;
        this.volume = 0.5;
    }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    playCoin() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sine'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.frequency.setValueAtTime(587.33, now); osc.frequency.setValueAtTime(880, now + 0.1);
        osc.start(now); osc.stop(now + 0.3);
    }
    playWrong() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sawtooth'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(75, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    }
    playFanfare() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'triangle'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2); osc.frequency.setValueAtTime(1046.5, now + 0.3);
        osc.start(now); osc.stop(now + 0.6);
    }
}

const sfx = new RetroAudioSynth();

const GAME_VERSION = "4.0.0";

// --- STATE MANAGEMENT ---
const GAME_STATE = {
    saveData: {
        gameVersion: GAME_VERSION,
        globalScore: 0,
        customScore: 0,
        categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
        levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
        customLevels: [], // Array of { id, name, theme, timer, brands: [ { name, hint, slug } ] }
        difficulty: "medium",
        volume: 0.5,
        resolution: "1024x768",
        quality: "high",
        vibration: true,
        brightness: 100, // percentage 50 - 150
        fpsLimit: "uncapped", // "30", "60", "uncapped"
        vsync: true
    },
    currentCategory: null,
    currentLevel: null,
    currentBrandIndex: 0,
    currentLevelCorrectCount: 0,
    currentLevelScore: 0,
    activeBrands: [],
    elapsedTime: 0,
    timerInterval: null,
    currentBrand: null,
    lives: 3,
    revealedIndices: [],
    levelSelectPage: 0 // Track level list paging (0-9 blocks of 10 levels)
};

// Target frame lock simulation variable
let gameLoopId = null;

document.addEventListener("DOMContentLoaded", () => {
    // Write static game version identifiers to indicators
    document.getElementById("header-version-badge").textContent = `v${GAME_VERSION}`;
    document.getElementById("footer-version-text").textContent = GAME_VERSION;

    sendNativeRequest({ Action: "load_save" });
    setupEventHandlers();
    populatePageSelectDropdown();
    showScreen("screen-main-menu");
});

function sendNativeRequest(payload) {
    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage(payload);
    } else {
        if (payload.Action === "load_save") {
            const raw = localStorage.getItem("brandgame_v4_savedata_custom");
            if (raw) GAME_STATE.saveData = JSON.parse(raw);
            
            // Check version upgrade block
            if (GAME_STATE.saveData.gameVersion !== GAME_VERSION) {
                GAME_STATE.saveData.gameVersion = GAME_VERSION;
                sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
            }
            onSaveLoaded(GAME_STATE.saveData);
        } else if (payload.Action === "write_save") {
            localStorage.setItem("brandgame_v4_savedata_custom", JSON.stringify(payload.Data));
        }
    }
}

function onSaveLoaded(data) {
    if (data) {
        // Enforce fallback structure integrity
        GAME_STATE.saveData = { ...GAME_STATE.saveData, ...data };
        if (!GAME_STATE.saveData.customLevels) GAME_STATE.saveData.customLevels = [];
        if (typeof GAME_STATE.saveData.customScore === 'undefined') GAME_STATE.saveData.customScore = 0;
    }
    updateGlobalStatsHUD();
    renderMainMenuProgress();
    syncSettingsPanel();
    applyVisualSettings();
}
window.onSaveLoaded = onSaveLoaded;

function showScreen(screenId) {
    const screens = ["screen-main-menu", "screen-categories", "screen-levels", "screen-gameplay", "screen-report", "screen-settings", "screen-creator"];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (id === screenId) el.classList.remove("hidden");
        else el.classList.add("hidden");
    });
    
    // Clear theme parameters if moving back to normal interface
    if (screenId !== "screen-gameplay") {
        clearCustomThemeClasses();
    }

    const header = document.getElementById("header-stats");
    if (screenId === "screen-main-menu" || screenId === "screen-categories") header.classList.remove("hidden");
    else header.classList.add("hidden");
}

function clearCustomThemeClasses() {
    document.body.classList.remove("theme-cyber-neon", "theme-retro-amber", "theme-matrix-green", "theme-midnight-blue");
}

function updateGlobalStatsHUD() {
    let globalStars = 0;
    ["tech", "auto", "food", "fashion", "media"].forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat] || 1;
        // 2 Stars earned per unlocked level progression step
        globalStars += (unlocked - 1) * 2;
    });
    const customCount = GAME_STATE.saveData.customLevels.length;
    globalStars += customCount * 2;

    document.getElementById("global-stars").textContent = globalStars;
    document.getElementById("global-score").textContent = GAME_STATE.saveData.globalScore + (GAME_STATE.saveData.customScore || 0);
}

function renderMainMenuProgress() {
    const catList = document.getElementById("category-summary-list");
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
                <span>Max: Level ${unlocked}</span>
            </div>
        `;
        catList.appendChild(item);
    });

    // Custom Category Summary Entry
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

function setupEventHandlers() {
    document.getElementById("btn-menu-start").addEventListener("click", () => {
        renderCategoryCards();
        showScreen("screen-categories");
    });
    document.getElementById("btn-menu-settings").addEventListener("click", () => showScreen("screen-settings"));
    
    document.getElementById("btn-menu-exit").addEventListener("click", () => {
        sendNativeRequest({ Action: "exit_app" });
    });

    document.getElementById("btn-menu-reset").addEventListener("click", () => {
        if (confirm("Permanently erase save progress and customized rooms?")) {
            GAME_STATE.saveData = {
                gameVersion: GAME_VERSION,
                globalScore: 0,
                customScore: 0,
                categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
                levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
                customLevels: [],
                difficulty: "medium", volume: 0.5, resolution: "1024x768", quality: "high", vibration: true, brightness: 100, fpsLimit: "uncapped", vsync: true
            };
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
            onSaveLoaded(GAME_STATE.saveData);
        }
    });

    document.getElementById("btn-categories-back").addEventListener("click", () => showScreen("screen-main-menu"));
    document.getElementById("btn-levels-back").addEventListener("click", () => showScreen("screen-categories"));
    document.getElementById("btn-settings-back").addEventListener("click", () => showScreen("screen-main-menu"));
    document.getElementById("btn-creator-back").addEventListener("click", () => showScreen("screen-categories"));

    document.getElementById("btn-gameplay-quit").addEventListener("click", () => {
        clearInterval(GAME_STATE.timerInterval);
        if (GAME_STATE.currentCategory === "custom") {
            renderCategoryCards();
            showScreen("screen-categories");
        } else {
            showScreen("screen-levels");
        }
    });

    document.getElementById("btn-guess-submit").addEventListener("click", submitUserGuess);
    document.getElementById("input-guess").addEventListener("keypress", (e) => {
        if (e.key === "Enter") submitUserGuess();
    });

    // Hints
    document.getElementById("btn-gameplay-hint").addEventListener("click", () => {
        const clueEl = document.getElementById("clue-text");
        clueEl.textContent = GAME_STATE.currentBrand.hint || "No clues available for this brand.";
        clueEl.classList.remove("hidden");
        GAME_STATE.currentLevelScore = Math.max(GAME_STATE.currentLevelScore - 5, 0);
    });

    document.getElementById("btn-gameplay-reveal-char").addEventListener("click", buyLetterClue);

    document.getElementById("btn-report-continue").addEventListener("click", () => {
        if (GAME_STATE.currentCategory === "custom") {
            selectCustomCategory();
        } else {
            selectCategory(GAME_STATE.currentCategory, document.getElementById("level-category-title").textContent);
        }
    });

    // Window Resolution commands
    ["sm", "md", "lg"].forEach(sz => {
        const mapping = { sm: { w: 800, h: 600 }, md: { w: 1024, h: 768 }, lg: { w: 1280, h: 960 } };
        document.getElementById(`btn-win-${sz}`).addEventListener("click", () => {
            GAME_STATE.saveData.resolution = `${mapping[sz].w}x${mapping[sz].h}`;
            updateResolutionButtons();
            sendNativeRequest({ Action: "resize_window", Width: mapping[sz].w, Height: mapping[sz].h });
        });
    });

    // Graphics Quality
    document.getElementById("btn-qual-low").addEventListener("click", () => {
        GAME_STATE.saveData.quality = "low";
        applyVisualSettings();
    });
    document.getElementById("btn-qual-high").addEventListener("click", () => {
        GAME_STATE.saveData.quality = "high";
        applyVisualSettings();
    });

    // Framerate Limits
    ["30", "60", "uncapped"].forEach(fps => {
        document.getElementById(`btn-fps-${fps}`).addEventListener("click", () => {
            GAME_STATE.saveData.fpsLimit = fps;
            applyFrameBudgeting();
        });
    });

    // Brightness Slider
    document.getElementById("settings-brightness").addEventListener("input", (e) => {
        const val = e.target.value;
        GAME_STATE.saveData.brightness = parseInt(val);
        document.getElementById("brightness-label").textContent = `${val}%`;
        applyVisualSettings();
    });

    // VSync Toggle
    document.getElementById("btn-vsync-off").addEventListener("click", () => {
        GAME_STATE.saveData.vsync = false;
        applyVSyncStatus();
    });
    document.getElementById("btn-vsync-on").addEventListener("click", () => {
        GAME_STATE.saveData.vsync = true;
        applyVSyncStatus();
    });

    // Vibration Toggle
    document.getElementById("btn-vibrate-toggle").addEventListener("click", () => {
        GAME_STATE.saveData.vibration = !GAME_STATE.saveData.vibration;
        updateVibrationButton();
    });

    // Settings Close
    document.getElementById("btn-settings-close").addEventListener("click", () => {
        GAME_STATE.saveData.volume = parseFloat(document.getElementById("settings-volume").value);
        sfx.volume = GAME_STATE.saveData.volume;
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        showScreen("screen-main-menu");
    });

    document.getElementById("settings-volume").addEventListener("input", (e) => {
        document.getElementById("volume-label").textContent = `${Math.round(e.target.value * 100)}%`;
    });

    ["easy", "medium", "hard"].forEach(df => {
        document.getElementById(`diff-${df}`).addEventListener("click", () => {
            GAME_STATE.saveData.difficulty = df;
            updateDifficultyToggles();
        });
    });

    // Trigger custom creator screen
    document.getElementById("btn-trigger-creator").addEventListener("click", () => {
        document.getElementById("creator-level-name").value = "";
        document.getElementById("creator-level-theme").value = "cyber-neon";
        document.getElementById("creator-level-timer").value = "15";

        for (let i = 1; i <= 4; i++) {
            document.getElementById(`c-brand-${i}-name`).value = "";
            document.getElementById(`c-brand-${i}-slug`).value = "";
            document.getElementById(`c-brand-${i}-hint`).value = "";
        }
        showScreen("screen-creator");
    });

    // Save Custom Level publish process
    document.getElementById("btn-save-custom-level").addEventListener("click", publishCustomLevelRoom);
}

// --- CLUE LETTER SYSTEM ---
function buyLetterClue() {
    const name = GAME_STATE.currentBrand.name.replace(/[^a-zA-Z0-9]/g, "");
    if (GAME_STATE.revealedIndices.length >= name.length) return;

    const possible = [];
    for (let i = 0; i < name.length; i++) {
        if (!GAME_STATE.revealedIndices.includes(i)) possible.push(i);
    }

    if (possible.length > 0) {
        const rand = possible[Math.floor(Math.random() * possible.length)];
        GAME_STATE.revealedIndices.push(rand);
        renderRevealedLetters();
        GAME_STATE.currentLevelScore = Math.max(GAME_STATE.currentLevelScore - 10, 0);
    }
}

function renderRevealedLetters() {
    const brandName = GAME_STATE.currentBrand.name;
    const hud = document.getElementById("revealed-letters-hud");
    
    let displayStr = "";
    let cleanCharIndex = 0;

    for (let i = 0; i < brandName.length; i++) {
        const char = brandName[i];
        if (char === " " || char === "-" || char === "&" || char === ".") {
            displayStr += char + " ";
        } else {
            if (GAME_STATE.revealedIndices.includes(cleanCharIndex)) {
                displayStr += char.toUpperCase() + " ";
            } else {
                displayStr += "_ ";
            }
            cleanCharIndex++;
        }
    }
    hud.textContent = displayStr.trim();
}

function triggerVibration() {
    if (!GAME_STATE.saveData.vibration) return;
    const el = document.getElementById("screen-gameplay");
    el.classList.add("shake-active");
    setTimeout(() => el.classList.remove("shake-active"), 400);
}

// --- CATEGORIES & ROOM RENDERERS ---
function renderCategoryCards() {
    const grid = document.getElementById("category-cards-grid");
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
                ${unlocked}/100
            </span>
        `;
        card.addEventListener("click", () => selectCategory(cat.id, cat.label));
        grid.appendChild(card);
    });

    // Custom Category Arena Dynamic Card
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
    document.getElementById("level-category-title").textContent = catLabel;
    document.getElementById("level-category-badge").textContent = catLabel;
    
    // Default to the page of the player's current progression level
    const maxUnlocked = GAME_STATE.saveData.levelsUnlocked[catId] || 1;
    GAME_STATE.levelSelectPage = Math.min(Math.floor((maxUnlocked - 1) / 10), 9);
    document.getElementById("select-level-page").value = GAME_STATE.levelSelectPage;

    // Show jump page selector for official runs
    document.getElementById("select-level-page").parentElement.classList.remove("hidden");

    renderLevelButtonsList();
    showScreen("screen-levels");
}

function renderLevelButtonsList() {
    const grid = document.getElementById("level-buttons-grid");
    grid.innerHTML = "";
    
    const catId = GAME_STATE.currentCategory;
    const unlockedMax = GAME_STATE.saveData.levelsUnlocked[catId] || 1;
    
    // Page offsets
    const startIdx = GAME_STATE.levelSelectPage * 10 + 1;
    const endIdx = startIdx + 9;

    for (let i = startIdx; i <= endIdx; i++) {
        const isLocked = i > unlockedMax;
        const btn = document.createElement("button");
        if (isLocked) {
            btn.className = "flex flex-col items-center justify-center p-6 bg-gray-950 border border-gray-900 rounded-xl opacity-40 cursor-not-allowed";
            btn.innerHTML = `<span class="text-gray-600 text-2xl">🔒</span><span class="gaming-font text-[10px] font-bold text-gray-600 mt-2">LVL ${i}</span>`;
        } else {
            btn.className = "flex flex-col items-center justify-center p-6 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500 rounded-xl transition group";
            btn.innerHTML = `<span class="text-blue-400 text-lg group-hover:scale-110 transition">★</span><span class="gaming-font text-xs font-black text-white mt-2">LEVEL ${i}</span>`;
            btn.addEventListener("click", () => launchLevel(i));
        }
        grid.appendChild(btn);
    }
}

function selectCustomCategory() {
    GAME_STATE.currentCategory = "custom";
    document.getElementById("level-category-title").textContent = "Custom Arena Rooms";
    document.getElementById("level-category-badge").textContent = "CUSTOM";

    // Hide jump page selector for custom lists
    document.getElementById("select-level-page").parentElement.classList.add("hidden");

    const grid = document.getElementById("level-buttons-grid");
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

    // Restore standard responsive grid class structure
    grid.className = "grid grid-cols-2 sm:grid-cols-5 gap-4";

    list.forEach((room, index) => {
        const btn = document.createElement("button");
        btn.className = "flex flex-col items-center justify-center p-6 bg-gray-900 hover:bg-emerald-950/40 border border-gray-800 hover:border-emerald-500 rounded-xl transition group text-center";
        btn.innerHTML = `
            <span class="text-emerald-400 text-lg group-hover:scale-110 transition">☄</span>
            <span class="gaming-font text-[10px] font-black text-white mt-2 line-clamp-2 uppercase">${room.name}</span>
        `;
        btn.addEventListener("click", () => launchCustomLevel(index));
        grid.appendChild(btn);
    });
    showScreen("screen-levels");
}

// --- CREATOR PUBLISH FLOW ---
function publishCustomLevelRoom() {
    const levelName = document.getElementById("creator-level-name").value.trim();
    const theme = document.getElementById("creator-level-theme").value;
    const timer = parseInt(document.getElementById("creator-level-timer").value);

    if (!levelName) {
        alert("Please enter a custom name for your Level Room!");
        return;
    }

    const customBrands = [];
    for (let i = 1; i <= 4; i++) {
        const bName = document.getElementById(`c-brand-${i}-name`).value.trim();
        const bSlug = document.getElementById(`c-brand-${i}-slug`).value.trim().toLowerCase();
        const bHint = document.getElementById(`c-brand-${i}-hint`).value.trim();

        if (!bName || !bSlug) {
            alert(`Brand #${i} requires at least a Name and an SVG Slug identifier (e.g. google, microsoft, apple)!`);
            return;
        }

        customBrands.push({
            name: bName,
            slug: bSlug,
            hint: bHint || "No clues defined."
        });
    }

    const newRoom = {
        id: "custom_" + Date.now(),
        name: levelName,
        theme: theme,
        timer: timer,
        brands: customBrands
    };

    if (!GAME_STATE.saveData.customLevels) GAME_STATE.saveData.customLevels = [];
    GAME_STATE.saveData.customLevels.push(newRoom);

    sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    updateGlobalStatsHUD();
    alert("Level Room Successfully Published to Custom Arena!");
    
    renderCategoryCards();
    showScreen("screen-categories");
}

function launchLevel(levelNum) {
    GAME_STATE.currentLevel = levelNum;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    // Use deterministic dynamic brand pool generator
    GAME_STATE.activeBrands = getBrandsForLevel(GAME_STATE.currentCategory, levelNum);

    showScreen("screen-gameplay");
    loadNextBrand();
}

function launchCustomLevel(customIndex) {
    const targetRoom = GAME_STATE.saveData.customLevels[customIndex];
    GAME_STATE.currentLevel = customIndex;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    // Apply custom settings and properties
    GAME_STATE.activeBrands = targetRoom.brands;

    // Inject custom sub-theme directly into body element
    clearCustomThemeClasses();
    if (targetRoom.theme) {
        document.body.classList.add(`theme-${targetRoom.theme}`);
    }

    showScreen("screen-gameplay");
    loadNextBrand();
}

function loadNextBrand() {
    clearInterval(GAME_STATE.timerInterval);
    document.getElementById("input-guess").value = "";
    document.getElementById("clue-text").classList.add("hidden");
    GAME_STATE.revealedIndices = [];

    GAME_STATE.currentBrand = GAME_STATE.activeBrands[GAME_STATE.currentBrandIndex];
    document.getElementById("gameplay-brand-index").textContent = `${GAME_STATE.currentBrandIndex + 1} / ${GAME_STATE.activeBrands.length}`;
    
    let hearts = "";
    for (let i = 0; i < GAME_STATE.lives; i++) hearts += "❤";
    document.getElementById("gameplay-lives").textContent = hearts;

    renderRevealedLetters();

    const img = document.getElementById("logo-image");
    const placeholder = document.getElementById("logo-placeholder");
    img.src = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${GAME_STATE.currentBrand.slug}.svg`;
    img.style.filter = "grayscale(1) brightness(0.15)";

    img.onerror = () => { img.classList.add("hidden"); placeholder.classList.remove("hidden"); };
    img.onload = () => { img.classList.remove("hidden"); placeholder.classList.add("hidden"); };

    // Determine custom timer limit
    let timeLimit = 15;
    if (GAME_STATE.currentCategory === "custom") {
        // Recover custom timer settings
        const currentCustomRoom = GAME_STATE.saveData.customLevels[GAME_STATE.currentLevel];
        if (currentCustomRoom && currentCustomRoom.timer) {
            timeLimit = currentCustomRoom.timer;
        }
    } else {
        if (GAME_STATE.saveData.difficulty === "easy") timeLimit = 30;
        if (GAME_STATE.saveData.difficulty === "hard") timeLimit = 8;
    }

    GAME_STATE.elapsedTime = 0;
    const bar = document.getElementById("timer-bar");
    bar.style.width = "100%";
    bar.style.backgroundColor = "#3b82f6";

    GAME_STATE.timerInterval = setInterval(() => {
        GAME_STATE.elapsedTime += 0.1;
        const rem = Math.max(((timeLimit - GAME_STATE.elapsedTime) / timeLimit) * 100, 0);
        bar.style.width = `${rem}%`;
        if (rem < 30) bar.style.backgroundColor = "#ef4444";
        else if (rem < 60) bar.style.backgroundColor = "#f59e0b";

        if (GAME_STATE.elapsedTime >= timeLimit) {
            clearInterval(GAME_STATE.timerInterval);
            processLossOfLife();
        }
    }, 100);
}

function submitUserGuess() {
    const guess = document.getElementById("input-guess").value.trim();
    if (!guess) return;
    clearInterval(GAME_STATE.timerInterval);

    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage({
            UserGuess: guess,
            CorrectAnswer: GAME_STATE.currentBrand.name,
            TimeElapsed: Math.round(GAME_STATE.elapsedTime)
        });
    } else {
        const matchPct = (guess.toLowerCase() === GAME_STATE.currentBrand.name.toLowerCase()) ? 100 : 30;
        const ok = matchPct >= 85;
        const points = ok ? Math.max(50 - Math.round(GAME_STATE.elapsedTime) * 3, 10) : 0;
        onMatchResult({ match: matchPct, correct: ok, score: points });
    }
}

function onMatchResult(result) {
    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    overlay.classList.remove("hidden");
    textAns.textContent = GAME_STATE.currentBrand.name;

    const img = document.getElementById("logo-image");
    img.style.filter = "grayscale(0) brightness(1)";

    if (result.correct) {
        sfx.playCoin();
        badge.textContent = "CORRECT!";
        badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-emerald-400";
        document.getElementById("feedback-match").textContent = `${Math.round(result.match)}%`;
        
        const finalScore = Math.max(result.score - (GAME_STATE.revealedIndices.length * 10), 5);
        document.getElementById("feedback-score").textContent = `+${finalScore}`;
        statsCard.classList.remove("hidden");

        GAME_STATE.currentLevelScore += finalScore;
        GAME_STATE.currentLevelCorrectCount++;
    } else {
        sfx.playWrong();
        triggerVibration();
        badge.textContent = "INCORRECT";
        badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
        statsCard.classList.add("hidden");
        GAME_STATE.lives--;
    }

    document.getElementById("btn-feedback-next").onclick = () => {
        overlay.classList.add("hidden");
        if (GAME_STATE.lives <= 0) triggerLevelEnd(false);
        else advanceTurn();
    };
}
window.onMatchResult = onMatchResult;

function processLossOfLife() {
    sfx.playWrong();
    triggerVibration();
    GAME_STATE.lives--;

    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    overlay.classList.remove("hidden");
    badge.textContent = "TIME OUT";
    badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
    textAns.textContent = GAME_STATE.currentBrand.name;
    statsCard.classList.add("hidden");

    document.getElementById("btn-feedback-next").onclick = () => {
        overlay.classList.add("hidden");
        if (GAME_STATE.lives <= 0) triggerLevelEnd(false);
        else advanceTurn();
    };
}

function advanceTurn() {
    GAME_STATE.currentBrandIndex++;
    if (GAME_STATE.currentBrandIndex >= GAME_STATE.activeBrands.length) triggerLevelEnd(true);
    else loadNextBrand();
}

function triggerLevelEnd(completed) {
    clearInterval(GAME_STATE.timerInterval);
    const screenReport = document.getElementById("screen-report");
    const starsEl = document.getElementById("report-stars");
    const correctCountEl = document.getElementById("report-correct-count");
    const scoreEl = document.getElementById("report-score");
    const highEl = document.getElementById("report-cat-high");

    const totalBrands = GAME_STATE.activeBrands.length;
    correctCountEl.textContent = `${GAME_STATE.currentLevelCorrectCount} / ${totalBrands}`;
    scoreEl.textContent = GAME_STATE.currentLevelScore;

    const isCustom = GAME_STATE.currentCategory === "custom";

    // Player must guess at least 75% correct to pass the level
    const passingThreshold = Math.ceil(totalBrands * 0.75);

    if (completed && GAME_STATE.currentLevelCorrectCount >= passingThreshold) {
        sfx.playFanfare();
        document.querySelector("#screen-report h2").textContent = "LEVEL CLEAR!";
        document.querySelector("#screen-report h2").className = "gaming-font text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 uppercase tracking-widest";

        let stars = "★☆☆";
        if (GAME_STATE.currentLevelCorrectCount === totalBrands) stars = "★★★";
        else if (GAME_STATE.currentLevelCorrectCount >= passingThreshold) stars = "★★☆";
        starsEl.textContent = stars;
        starsEl.className = "text-yellow-400 text-6xl tracking-wider select-none py-2";

        if (isCustom) {
            GAME_STATE.saveData.customScore = (GAME_STATE.saveData.customScore || 0) + GAME_STATE.currentLevelScore;
        } else {
            const currentCatUnlocked = GAME_STATE.saveData.levelsUnlocked[GAME_STATE.currentCategory] || 1;
            if (GAME_STATE.currentLevel === currentCatUnlocked && currentCatUnlocked < 100) {
                GAME_STATE.saveData.levelsUnlocked[GAME_STATE.currentCategory] = currentCatUnlocked + 1;
            }
            GAME_STATE.saveData.categoryScores[GAME_STATE.currentCategory] += GAME_STATE.currentLevelScore;
            GAME_STATE.saveData.globalScore += GAME_STATE.currentLevelScore;
        }
    } else {
        sfx.playWrong();
        triggerVibration();
        document.querySelector("#screen-report h2").textContent = "LEVEL FAILED";
        document.querySelector("#screen-report h2").className = "gaming-font text-3xl font-black text-red-500 uppercase tracking-widest";
        starsEl.textContent = "☆☆☆";
        starsEl.className = "text-gray-700 text-6xl tracking-wider select-none py-2";
    }

    if (isCustom) {
        highEl.textContent = `${GAME_STATE.saveData.customScore || 0} (Custom Arena Total)`;
    } else {
        highEl.textContent = GAME_STATE.saveData.categoryScores[GAME_STATE.currentCategory];
    }

    sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    updateGlobalStatsHUD();
    showScreen("screen-report");
}

// --- OPTIMIZATION & SYSTEM CODES ---
function applyVisualSettings() {
    const isLow = GAME_STATE.saveData.quality === "low";
    if (isLow) {
        document.body.classList.add("low-quality");
        document.getElementById("btn-qual-low").className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        document.getElementById("btn-qual-high").className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    } else {
        document.body.classList.remove("low-quality");
        document.getElementById("btn-qual-low").className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        document.getElementById("btn-qual-high").className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
    }

    // Brightness filter adjustment
    const rawBrightness = GAME_STATE.saveData.brightness || 100;
    document.body.style.filter = `brightness(${rawBrightness}%)`;
}

function applyFrameBudgeting() {
    const val = GAME_STATE.saveData.fpsLimit || "uncapped";
    ["30", "60", "uncapped"].forEach(fps => {
        const btn = document.getElementById(`btn-fps-${fps}`);
        if (val === fps) btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        else btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    });

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    if (val === "30") {
        lockAnimationFramerate(30);
    } else if (val === "60") {
        lockAnimationFramerate(60);
    }
}

function lockAnimationFramerate(fps) {
    let lastTime = performance.now();
    const interval = 1000 / fps;
    
    function loop(time) {
        gameLoopId = requestAnimationFrame(loop);
        const delta = time - lastTime;
        if (delta >= interval) {
            lastTime = time - (delta % interval);
        }
    }
    gameLoopId = requestAnimationFrame(loop);
}

function applyVSyncStatus() {
    const val = GAME_STATE.saveData.vsync;
    const btnOn = document.getElementById("btn-vsync-on");
    const btnOff = document.getElementById("btn-vsync-off");

    if (val) {
        btnOn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        btnOff.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    } else {
        btnOn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        btnOff.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
    }
    sendNativeRequest({ Action: "configure_vsync", Value: val });
}

function syncSettingsPanel() {
    document.getElementById("settings-volume").value = GAME_STATE.saveData.volume;
    sfx.volume = GAME_STATE.saveData.volume;
    document.getElementById("volume-label").textContent = `${Math.round(GAME_STATE.saveData.volume * 100)}%`;
    
    // Brightness input element sync
    const bright = GAME_STATE.saveData.brightness || 100;
    document.getElementById("settings-brightness").value = bright;
    document.getElementById("brightness-label").textContent = `${bright}%`;

    updateDifficultyToggles();
    updateResolutionButtons();
    updateVibrationButton();
    applyFrameBudgeting();
    applyVSyncStatus();
}

function updateResolutionButtons() {
    const res = GAME_STATE.saveData.resolution;
    ["800x600", "1024x768", "1280x960"].forEach(sz => {
        let btnId = "btn-win-sm";
        if (sz === "1024x768") btnId = "btn-win-md";
        if (sz === "1280x960") btnId = "btn-win-lg";
        
        const btn = document.getElementById(btnId);
        if (res === sz) btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        else btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    });
}

function updateVibrationButton() {
    const active = GAME_STATE.saveData.vibration;
    const btn = document.getElementById("btn-vibrate-toggle");
    if (active) {
        btn.textContent = "Enabled";
        btn.className = "px-4 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white uppercase";
    } else {
        btn.textContent = "Disabled";
        btn.className = "px-4 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 uppercase";
    }
}

function updateDifficultyToggles() {
    ["easy", "medium", "hard"].forEach(df => {
        const btn = document.getElementById(`diff-${df}`);
        if (GAME_STATE.saveData.difficulty === df) {
            btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        } else {
            btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        }
    });
}
