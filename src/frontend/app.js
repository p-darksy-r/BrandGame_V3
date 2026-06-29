// --- RETRO SFX SYNTHESIZER ---
class RetroAudioSynth {
    constructor() {
        this.ctx = null;
        this.volume = 0.5;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playCoin() {
        this.init();
        if (this.volume === 0) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.1); // A5

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playWrong() {
        this.init();
        if (this.volume === 0) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    playFanfare() {
        this.init();
        if (this.volume === 0) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6

        osc.start(now);
        osc.stop(now + 0.6);
    }
}

const sfx = new RetroAudioSynth();

// --- STATE MANAGER ---
const GAME_STATE = {
    saveData: {
        globalScore: 0,
        categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
        levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
        difficulty: "medium", // easy, medium, hard
        volume: 0.5
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
    lives: 3
};

// --- INITIALIZE VIEWS ---
document.addEventListener("DOMContentLoaded", () => {
    // Attempt load from C# Persistency
    sendNativeRequest({ Action: "load_save" });

    setupEventHandlers();
    showScreen("screen-main-menu");
});

// Native Host Communicator
function sendNativeRequest(payload) {
    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage(payload);
    } else {
        // Fallback inside normal testing browsers
        console.warn("Native bridge not found. Using browser simulated local state.");
        if (payload.Action === "load_save") {
            const localRaw = localStorage.getItem("brandgame_v3_savedata");
            if (localRaw) {
                GAME_STATE.saveData = JSON.parse(localRaw);
            }
            onSaveLoaded(GAME_STATE.saveData);
        } else if (payload.Action === "write_save") {
            localStorage.setItem("brandgame_v3_savedata", JSON.stringify(payload.Data));
        }
    }
}

// C# Event Trigger: loaded save data
function onSaveLoaded(data) {
    if (data) {
        GAME_STATE.saveData = data;
    }
    updateGlobalStatsHUD();
    renderMainMenuProgress();
    syncSettingsPanel();
}
window.onSaveLoaded = onSaveLoaded;

// --- ROUTER VIEW CONTROLLER ---
function showScreen(screenId) {
    const screens = ["screen-main-menu", "screen-categories", "screen-levels", "screen-gameplay", "screen-report", "screen-settings"];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (id === screenId) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });

    const header = document.getElementById("header-stats");
    if (screenId === "screen-main-menu" || screenId === "screen-categories") {
        header.classList.remove("hidden");
    } else {
        header.classList.add("hidden");
    }
}

// --- MAIN MENU RENDER ---
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
        const percent = Math.min(((unlocked - 1) / 10) * 100, 100);

        const item = document.createElement("div");
        item.className = "space-y-1";
        item.innerHTML = `
            <div class="flex justify-between text-xs font-bold uppercase tracking-wide">
                <span class="text-gray-300">${cat.label}</span>
                <span class="text-blue-400">Score: ${score}</span>
            </div>
            <div class="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800 flex">
                <div class="bg-blue-600 h-full" style="width: ${percent}%"></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500">
                <span>Progress: ${unlocked - 1}/10 Clean Clears</span>
                <span>Unlocked: Level ${unlocked}</span>
            </div>
        `;
        catList.appendChild(item);
    });
}

// --- SETUP EVENT INTERACTORS ---
function setupEventHandlers() {
    // Menu Buttons
    document.getElementById("btn-menu-start").addEventListener("click", () => {
        renderCategoryCards();
        showScreen("screen-categories");
    });
    document.getElementById("btn-menu-settings").addEventListener("click", () => {
        showScreen("screen-settings");
    });
    document.getElementById("btn-menu-reset").addEventListener("click", () => {
        if (confirm("Are you absolutely sure you want to erase all high scores and levels?")) {
            GAME_STATE.saveData = {
                globalScore: 0,
                categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
                levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
                difficulty: "medium",
                volume: 0.5
            };
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
            onSaveLoaded(GAME_STATE.saveData);
        }
    });

    // Navigation Backers
    document.getElementById("btn-categories-back").addEventListener("click", () => showScreen("screen-main-menu"));
    document.getElementById("btn-levels-back").addEventListener("click", () => showScreen("screen-categories"));
    document.getElementById("btn-gameplay-quit").addEventListener("click", () => {
        clearInterval(GAME_STATE.timerInterval);
        showScreen("screen-levels");
    });

    // Submit Guesses
    document.getElementById("btn-guess-submit").addEventListener("click", submitUserGuess);
    document.getElementById("input-guess").addEventListener("keypress", (e) => {
        if (e.key === "Enter") submitUserGuess();
    });

    // Help Clue Hint
    document.getElementById("btn-gameplay-hint").addEventListener("click", () => {
        const clueEl = document.getElementById("clue-text");
        clueEl.textContent = GAME_STATE.currentBrand.hint;
        clueEl.classList.remove("hidden");
        GAME_STATE.currentLevelScore = Math.max(GAME_STATE.currentLevelScore - 5, 10);
    });

    // Level Complete Report Continuer
    document.getElementById("btn-report-continue").addEventListener("click", () => {
        renderCategoryCards();
        showScreen("screen-categories");
    });

    // Close Settings
    document.getElementById("btn-settings-close").addEventListener("click", () => {
        GAME_STATE.saveData.volume = parseFloat(document.getElementById("settings-volume").value);
        sfx.volume = GAME_STATE.saveData.volume;
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        showScreen("screen-main-menu");
    });

    // Volume Slider Live feedback
    document.getElementById("settings-volume").addEventListener("input", (e) => {
        const val = Math.round(e.target.value * 100);
        document.getElementById("volume-label").textContent = `${val}%`;
    });

    // Difficulty Button Grid
    const diffs = ["easy", "medium", "hard"];
    diffs.forEach(df => {
        document.getElementById(`diff-${df}`).addEventListener("click", () => {
            GAME_STATE.saveData.difficulty = df;
            updateDifficultyToggles();
        });
    });
}

// --- RENDER CATEGORY SCREEN ---
function renderCategoryCards() {
    const grid = document.getElementById("category-cards-grid");
    grid.innerHTML = "";

    const categories = [
        { id: "tech", label: "Technology", desc: "Digital, processors, software networks.", bg: "from-blue-900 to-indigo-950" },
        { id: "auto", label: "Automotive", desc: "Supercars, sedans, hypercars.", bg: "from-red-950 to-orange-950" },
        { id: "food", label: "Food & Drink", desc: "Beverages, snacks, diners.", bg: "from-emerald-950 to-green-900" },
        { id: "fashion", label: "Fashion", desc: "Luxury, sportswear, jewelry.", bg: "from-pink-950 to-purple-950" },
        { id: "media", label: "Media & Fun", desc: "Movies, consoles, comics.", bg: "from-amber-950 to-yellow-950" }
    ];

    categories.forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat.id] || 1;
        const totalScore = GAME_STATE.saveData.categoryScores[cat.id] || 0;

        const card = document.createElement("button");
        card.className = `flex flex-col text-left p-5 rounded-2xl border border-gray-800 bg-gradient-to-br ${cat.bg} hover:border-gray-600 transition duration-150 transform hover:-translate-y-1 active:translate-y-0 h-48 justify-between relative overflow-hidden group`;
        card.innerHTML = `
            <div>
                <h3 class="gaming-font text-xl font-bold tracking-wide">${cat.label}</h3>
                <p class="text-xs text-gray-400 mt-1">${cat.desc}</p>
            </div>
            <div class="z-10">
                <div class="text-[10px] uppercase font-bold text-gray-500">Total Score</div>
                <div class="text-lg font-bold text-white">${totalScore} Points</div>
            </div>
            <span class="absolute right-3 bottom-3 text-5xl font-black text-white/5 group-hover:text-white/10 transition duration-300">
                ${unlocked}/10
            </span>
        `;
        card.addEventListener("click", () => {
            selectCategory(cat.id, cat.label);
        });
        grid.appendChild(card);
    });
}

// --- RENDER LEVELS SCREEN ---
function selectCategory(catId, catLabel) {
    GAME_STATE.currentCategory = catId;
    document.getElementById("level-category-title").textContent = catLabel;
    
    // Set matching colors for badge
    const badge = document.getElementById("level-category-badge");
    badge.textContent = catLabel;

    const grid = document.getElementById("level-buttons-grid");
    grid.innerHTML = "";

    const unlockedMax = GAME_STATE.saveData.levelsUnlocked[catId] || 1;

    for (let i = 1; i <= 10; i++) {
        const isLocked = i > unlockedMax;
        const btn = document.createElement("button");

        if (isLocked) {
            btn.className = "flex flex-col items-center justify-center p-6 bg-gray-950 border border-gray-900 rounded-xl opacity-40 cursor-not-allowed";
            btn.innerHTML = `
                <span class="text-gray-600 text-2xl">🔒</span>
                <span class="gaming-font text-xs font-bold text-gray-600 mt-2">LEVEL ${i}</span>
            `;
        } else {
            btn.className = "flex flex-col items-center justify-center p-6 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500 rounded-xl transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0 group";
            btn.innerHTML = `
                <span class="text-blue-400 text-lg group-hover:scale-110 transition duration-150">★</span>
                <span class="gaming-font text-sm font-black text-white mt-2">LEVEL ${i}</span>
            `;
            btn.addEventListener("click", () => {
                launchLevel(i);
            });
        }
        grid.appendChild(btn);
    }
    showScreen("screen-levels");
}

// --- LAUNCH GAMEPLAY ---
function launchLevel(levelNum) {
    GAME_STATE.currentLevel = levelNum;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    // Filter DB for matching category and level difficulty matching
    const pool = BRAND_DATABASE[GAME_STATE.currentCategory];
    GAME_STATE.activeBrands = pool.filter(b => b.difficulty === levelNum).slice(0, 4);

    if (GAME_STATE.activeBrands.length === 0) {
        alert("Engine Error: Levels configurations out of range.");
        return;
    }

    showScreen("screen-gameplay");
    loadNextBrand();
}

function loadNextBrand() {
    clearInterval(GAME_STATE.timerInterval);
    document.getElementById("input-guess").value = "";
    document.getElementById("clue-text").classList.add("hidden");

    GAME_STATE.currentBrand = GAME_STATE.activeBrands[GAME_STATE.currentBrandIndex];
    document.getElementById("gameplay-brand-index").textContent = `${GAME_STATE.currentBrandIndex + 1} / 4`;
    
    // Render Lives Display
    let hearts = "";
    for (let i = 0; i < GAME_STATE.lives; i++) hearts += "❤";
    document.getElementById("gameplay-lives").textContent = hearts;

    // Fetch and style matching Vector Logo
    const img = document.getElementById("logo-image");
    const placeholder = document.getElementById("logo-placeholder");

    // Dynamic simple-icons SVG loader
    img.src = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${GAME_STATE.currentBrand.slug}.svg`;
    img.style.filter = "grayscale(1) brightness(0.2)"; // Blinded starting state

    img.onerror = () => {
        // Safe typographic offline failover
        img.classList.add("hidden");
        placeholder.classList.remove("hidden");
    };
    img.onload = () => {
        img.classList.remove("hidden");
        placeholder.classList.add("hidden");
    };

    // Configure Difficulty parameters
    let timeLimit = 15; // default Medium
    if (GAME_STATE.saveData.difficulty === "easy") timeLimit = 30;
    if (GAME_STATE.saveData.difficulty === "hard") timeLimit = 8;

    GAME_STATE.elapsedTime = 0;
    const bar = document.getElementById("timer-bar");
    bar.style.width = "100%";
    bar.style.backgroundColor = "#3b82f6"; // blue

    // Start Clock Tick
    GAME_STATE.timerInterval = setInterval(() => {
        GAME_STATE.elapsedTime += 0.1;
        const remainingPercentage = Math.max(((timeLimit - GAME_STATE.elapsedTime) / timeLimit) * 100, 0);
        bar.style.width = `${remainingPercentage}%`;

        // Warning alerts
        if (remainingPercentage < 30) {
            bar.style.backgroundColor = "#ef4444"; // red
        } else if (remainingPercentage < 60) {
            bar.style.backgroundColor = "#f59e0b"; // amber
        }

        if (GAME_STATE.elapsedTime >= timeLimit) {
            clearInterval(GAME_STATE.timerInterval);
            processLossOfLife();
        }
    }, 100);
}

// --- GUESS VALDIATOR ---
function submitUserGuess() {
    const guess = document.getElementById("input-guess").value.trim();
    if (!guess) return;

    clearInterval(GAME_STATE.timerInterval);

    // Call Native Bridge to compute fuzzy match calculations
    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage({
            UserGuess: guess,
            CorrectAnswer: GAME_STATE.currentBrand.name,
            TimeElapsed: Math.round(GAME_STATE.elapsedTime)
        });
    } else {
        // Browser Simulated Match calculations (Simulating C# C++ calculations)
        const matchPct = (guess.toLowerCase() === GAME_STATE.currentBrand.name.toLowerCase()) ? 100 : 40;
        const isCorrect = matchPct >= 85;
        const score = isCorrect ? Math.max(50 - Math.round(GAME_STATE.elapsedTime) * 3, 10) : 0;
        onMatchResult({ match: matchPct, correct: isCorrect, score: score });
    }
}

// Result mapping return from C# engine
function onMatchResult(result) {
    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    overlay.classList.remove("hidden");
    textAns.textContent = GAME_STATE.currentBrand.name;

    // Transition image reveal to show brand visual colors
    const img = document.getElementById("logo-image");
    img.style.filter = "grayscale(0) brightness(1)";

    if (result.correct) {
        sfx.playCoin();
        badge.textContent = "CORRECT!";
        badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-emerald-400";
        document.getElementById("feedback-match").textContent = `${Math.round(result.match)}%`;
        document.getElementById("feedback-score").textContent = `+${result.score}`;
        statsCard.classList.remove("hidden");

        GAME_STATE.currentLevelScore += result.score;
        GAME_STATE.currentLevelCorrectCount++;
    } else {
        sfx.playWrong();
        badge.textContent = "INCORRECT";
        badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
        statsCard.classList.add("hidden");
        
        GAME_STATE.lives--;
    }

    document.getElementById("btn-feedback-next").onclick = () => {
        overlay.classList.add("hidden");
        if (GAME_STATE.lives <= 0) {
            triggerLevelEnd(false);
        } else {
            advanceTurn();
        }
    };
}
window.onMatchResult = onMatchResult;

function processLossOfLife() {
    sfx.playWrong();
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
        if (GAME_STATE.lives <= 0) {
            triggerLevelEnd(false);
        } else {
            advanceTurn();
        }
    };
}

function advanceTurn() {
    GAME_STATE.currentBrandIndex++;
    if (GAME_STATE.currentBrandIndex >= 4) {
        triggerLevelEnd(true);
    } else {
        loadNextBrand();
    }
}

// --- LEVEL CLEAR / GAME OVER SCREEN ---
function triggerLevelEnd(completed) {
    clearInterval(GAME_STATE.timerInterval);

    const screenReport = document.getElementById("screen-report");
    const starsEl = document.getElementById("report-stars");
    const correctCountEl = document.getElementById("report-correct-count");
    const scoreEl = document.getElementById("report-score");
    const highEl = document.getElementById("report-cat-high");

    correctCountEl.textContent = `${GAME_STATE.currentLevelCorrectCount} / 4`;
    scoreEl.textContent = GAME_STATE.currentLevelScore;

    if (completed && GAME_STATE.currentLevelCorrectCount >= 3) {
        sfx.playFanfare();
        document.querySelector("#screen-report h2").textContent = "LEVEL CLEAR!";
        document.querySelector("#screen-report h2").className = "gaming-font text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 uppercase tracking-widest";

        // Distribute Stars based on accuracy performance
        let stars = "★☆☆";
        if (GAME_STATE.currentLevelCorrectCount === 4) stars = "★★★";
        else if (GAME_STATE.currentLevelCorrectCount === 3) stars = "★★☆";
        starsEl.textContent = stars;
        starsEl.className = "text-yellow-400 text-6xl tracking-wider select-none py-2";

        // Unlock levels progression
        const currentCatUnlocked = GAME_STATE.saveData.levelsUnlocked[GAME_STATE.currentCategory] || 1;
        if (GAME_STATE.currentLevel === currentCatUnlocked && currentCatUnlocked < 10) {
            GAME_STATE.saveData.levelsUnlocked[GAME_STATE.currentCategory] = currentCatUnlocked + 1;
        }

        // Apply Points
        GAME_STATE.saveData.categoryScores[GAME_STATE.currentCategory] += GAME_STATE.currentLevelScore;
        GAME_STATE.saveData.globalScore += GAME_STATE.currentLevelScore;

    } else {
        sfx.playWrong();
        document.querySelector("#screen-report h2").textContent = "LEVEL FAILED";
        document.querySelector("#screen-report h2").className = "gaming-font text-3xl font-black text-red-500 uppercase tracking-widest";
        starsEl.textContent = "☆☆☆";
        starsEl.className = "text-gray-700 text-6xl tracking-wider select-none py-2";
    }

    highEl.textContent = GAME_STATE.saveData.categoryScores[GAME_STATE.currentCategory];

    // Persist new game progression straight to C# host engine
    sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    updateGlobalStatsHUD();

    showScreen("screen-report");
}

// --- UPDATE PROGRESS HUD ---
function updateGlobalStatsHUD() {
    let globalStars = 0;
    
    // Sum total stars based on locked achievements
    const categories = ["tech", "auto", "food", "fashion", "media"];
    categories.forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat] || 1;
        globalStars += (unlocked - 1) * 2; // Approximated index representation
    });

    document.getElementById("global-stars").textContent = globalStars;
    document.getElementById("global-score").textContent = GAME_STATE.saveData.globalScore;
}

// --- SYNC SETTINGS MODAL ---
function syncSettingsPanel() {
    document.getElementById("settings-volume").value = GAME_STATE.saveData.volume;
    sfx.volume = GAME_STATE.saveData.volume;
    document.getElementById("volume-label").textContent = `${Math.round(GAME_STATE.saveData.volume * 100)}%`;
    updateDifficultyToggles();
}

function updateDifficultyToggles() {
    const diffs = ["easy", "medium", "hard"];
    const descs = {
        easy: "Easy Mode: Relaxed 30-second timers. Forgiving calculations.",
        medium: "Medium Mode: Standard 15-second timers. Fuzzy matching accepts near typos.",
        hard: "Hard Mode: Brutal 8-second limits. Very strict brand string matching!"
    };

    diffs.forEach(df => {
        const btn = document.getElementById(`diff-${df}`);
        if (GAME_STATE.saveData.difficulty === df) {
            btn.className = "px-3 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white transition";
        } else {
            btn.className = "px-3 py-2 text-xs font-bold rounded-lg bg-gray-900 text-gray-400 hover:text-white transition";
        }
    });

    document.getElementById("difficulty-description").textContent = descs[GAME_STATE.saveData.difficulty];
}
