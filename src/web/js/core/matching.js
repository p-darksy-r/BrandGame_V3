/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

// --- WEB COMPATIBLE LEVENSHTEIN SIMILARITY ENGINE ---
function cleanStringForMatch(str) {
    return String(str ?? '').toLowerCase().replace(/[^a-z0-9]/g, "");
}

function calculateGuessResult(guess, answer, elapsedSeconds) {
    const match = calculateMatchPercentage(guess, answer);
    const correct = match >= 80;
    const seconds = Number.isFinite(elapsedSeconds) ? Math.max(0, Math.round(elapsedSeconds)) : 0;
    return { match, correct, score: correct ? Math.max(50 - seconds * 3, 10) : 0 };
}

function calculateMatchPercentage(str1, str2) {
    const s1 = cleanStringForMatch(str1);
    const s2 = cleanStringForMatch(str2);
    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;
    if (s1.includes(s2) || s2.includes(s1)) {
        return (Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)) * 100;
    }

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // insertion
                matrix[j - 1][i] + 1, // deletion
                matrix[j - 1][i - 1] + cost // substitution
            );
        }
    }

    const distance = matrix[s2.length][s1.length];
    const longest = Math.max(s1.length, s2.length);
    return ((longest - distance) / longest) * 100;
}
