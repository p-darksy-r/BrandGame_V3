const RESULT_DIFFICULTIES = ['easy', 'medium', 'hard'];
const RESULT_CATEGORIES = ['tech', 'auto', 'food', 'fashion', 'media'];

function emptyLevelResults() {
    return Object.fromEntries(RESULT_CATEGORIES.map(category => [category, {}]));
}

function normalizeDifficultyResults(value) {
    const output = {};
    for (const difficulty of RESULT_DIFFICULTIES) {
        const item = value?.[difficulty];
        if (!item || typeof item !== 'object') continue;
        const integer = (number, maximum) => Number.isFinite(number) ? Math.max(0, Math.min(maximum, Math.floor(number))) : 0;
        const wins = integer(item.wins, 1000000);
        output[difficulty] = {
            plays: Math.max(integer(item.plays, 1000000), wins), wins,
            stars: wins ? integer(item.stars, 3) : 0,
            bestScore: wins ? integer(item.bestScore, 1000000) : 0,
            bestTimeMs: wins && Number.isFinite(item.bestTimeMs) && item.bestTimeMs >= 0 ? Math.min(86400000, Math.round(item.bestTimeMs)) : null
        };
    }
    return output;
}

function customResultKey(room, index) {
    return `room:${typeof room?.id === 'string' && /^[\w-]{1,80}$/.test(room.id) ? room.id : `legacy-${index}`}`;
}

function normalizeProgressResults(data, result) {
    result.progressSchema = 2;
    result.levelResults = emptyLevelResults();
    result.customResults = {};
    for (const category of RESULT_CATEGORIES) {
        for (let level = 1; level <= 100; level++) {
            const record = normalizeDifficultyResults(data.levelResults?.[category]?.[level]);
            if (Object.keys(record).length) result.levelResults[category][level] = record;
        }
    }
    result.customLevels.forEach((room, index) => {
        const key = customResultKey(room, index);
        const record = normalizeDifficultyResults(data.customResults?.[key]);
        if (Object.keys(record).length) result.customResults[key] = record;
    });
}

function earnedStars(correct, total, completed) {
    if (!completed || !total || correct < Math.ceil(total * 0.75)) return 0;
    if (correct === total) return 3;
    return correct / total >= 0.9 ? 2 : 1;
}

function resultSummary(record) {
    const results = Object.values(record || {});
    const times = results.filter(item => item.wins && Number.isFinite(item.bestTimeMs)).map(item => item.bestTimeMs);
    return {
        stars: Math.max(0, ...results.map(item => item.stars)),
        bestScore: Math.max(0, ...results.map(item => item.bestScore)),
        bestTimeMs: times.length ? Math.min(...times) : null,
        wins: results.reduce((sum, item) => sum + item.wins, 0)
    };
}

function totalEarnedStars(save) {
    return [...Object.values(save.levelResults || {}).flatMap(category => Object.values(category)),
        ...Object.values(save.customResults || {})].reduce((total, record) => total + resultSummary(record).stars, 0);
}

function recordLevelResult(save, category, level, difficulty, correct, total, completed, score, elapsedMs) {
    const stars = earnedStars(correct, total, completed);
    const custom = category === 'custom';
    const room = custom ? save.customLevels[level] : null;
    if (!RESULT_DIFFICULTIES.includes(difficulty)) difficulty = 'medium';
    if (custom ? !room : !RESULT_CATEGORIES.includes(category) || !Number.isInteger(level) || level < 1 || level > 100)
        throw new Error('Invalid level result');
    const collection = custom ? save.customResults : save.levelResults[category];
    const key = custom ? customResultKey(room, level) : level;
    const record = collection[key] ||= {};
    const previous = record[difficulty] || { plays: 0, wins: 0, stars: 0, bestScore: 0, bestTimeMs: null };
    record[difficulty] = {
        plays: previous.plays + 1, wins: previous.wins + (stars ? 1 : 0),
        stars: Math.max(previous.stars, stars),
        bestScore: stars ? Math.max(previous.bestScore, score) : previous.bestScore,
        bestTimeMs: stars ? Math.min(previous.bestTimeMs ?? Infinity, Math.max(0, Math.round(elapsedMs))) : previous.bestTimeMs
    };
    return { stars, best: resultSummary(record) };
}

function formatBestTime(milliseconds) {
    return milliseconds == null ? '—' : `${(milliseconds / 1000).toFixed(1)}s`;
}

function hasLegacyCompletions(save) {
    return RESULT_CATEGORIES.some(category => {
        for (let level = 1; level < save.levelsUnlocked[category]; level++)
            if (!resultSummary(save.levelResults[category][level]).wins) return true;
        return false;
    });
}
