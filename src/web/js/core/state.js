/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

const GAME_VERSION = "3.1.0";

// --- GAME STATE SYSTEM ---
function createDefaultSaveData() {
    return {
        gameVersion: GAME_VERSION,
        globalScore: 0,
        customScore: 0,
        categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
        levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
        customLevels: [],
        difficulty: "medium",
        volume: 0.5,
        resolution: "1024x768",
        quality: "high",
        vibration: true,
        brightness: 100,
        fpsLimit: "uncapped",
        vsync: true
    };
}

function normalizeSaveData(value) {
    let data = value;
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { data = null; }
    }
    const defaults = createDefaultSaveData();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return defaults;
    const result = { ...defaults, ...data, gameVersion: GAME_VERSION };
    const finite = (value, fallback, min, max) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
    result.globalScore = finite(data.globalScore, 0, 0, Number.MAX_SAFE_INTEGER);
    result.customScore = finite(data.customScore, 0, 0, Number.MAX_SAFE_INTEGER);
    result.categoryScores = { ...defaults.categoryScores };
    result.levelsUnlocked = { ...defaults.levelsUnlocked };
    for (const category of Object.keys(defaults.categoryScores)) {
        result.categoryScores[category] = finite(data.categoryScores?.[category], 0, 0, Number.MAX_SAFE_INTEGER);
        result.levelsUnlocked[category] = Math.floor(finite(data.levelsUnlocked?.[category], 1, 1, 101));
    }
    result.customLevels = Array.isArray(data.customLevels) ? data.customLevels.filter(room =>
        room && typeof room.name === 'string' && Array.isArray(room.brands) && room.brands.length > 0 &&
        room.brands.every(brand => brand && typeof brand.name === 'string' && brand.name.trim() && typeof brand.slug === 'string')
    ) : [];
    result.volume = finite(data.volume, defaults.volume, 0, 1);
    result.brightness = finite(data.brightness, defaults.brightness, 10, 150);
    for (const [key, choices] of Object.entries({ difficulty: ['easy', 'medium', 'hard'], resolution: ['800x600', '1024x768', '1280x960'], quality: ['low', 'high'], fpsLimit: ['30', '60', 'uncapped'] })) {
        result[key] = choices.includes(data[key]) ? data[key] : defaults[key];
    }
    for (const key of ['vibration', 'vsync']) result[key] = typeof data[key] === 'boolean' ? data[key] : defaults[key];
    return result;
}

const GAME_STATE = {
    saveData: createDefaultSaveData(),
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
    levelSelectPage: 0,
    roundStatus: 'idle',
    clueCost: 0,
    hintUsed: false
};

let gameLoopId = null;
