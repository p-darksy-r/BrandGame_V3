/* BrandGame_V3 - Copyright (c) darksy */

function hashString(value) {
    let hash = 0;
    for (const character of value) hash = Math.imul(hash, 31) + character.charCodeAt(0) | 0;
    return hash >>> 0;
}

// Integer arithmetic gives repeatable selections in browsers and WebView2.
function seededShuffle(array, seed) {
    let state = seed >>> 0;
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        const j = state % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getBrandsForLevel(category, level) {
    if (!Object.hasOwn(BRAND_DATABASE, category) || !Number.isInteger(level) || level < 1 || level > 100) return [];
    const pool = BRAND_DATABASE[category];
    // Retain the existing progression: 3 brands at levels 1-10, up to 12 at 91-100.
    const count = Math.floor((level - 1) / 10) + 3;
    return seededShuffle(pool, hashString(category) + level * 7919).slice(0, count);
}

window.getBrandsForLevel = getBrandsForLevel;
