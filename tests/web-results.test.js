const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function context() {
    const ctx = vm.createContext({ window: {} });
    for (const file of ['version', 'results', 'state']) vm.runInContext(fs.readFileSync(path.join(__dirname, `../src/web/js/core/${file}.js`), 'utf8'), ctx);
    return ctx;
}
test('legacy progress is preserved without inventing stars or level records', () => {
    const ctx = context();
    const save = ctx.normalizeSaveData({ globalScore: 999, customScore: 42, categoryScores: { tech: 999 }, levelsUnlocked: { tech: 101 }, customLevels: [{ name: 'Room', brands: [{ name: 'Apple', slug: 'apple' }] }] });
    assert.equal(save.globalScore, 999);
    assert.equal(save.levelsUnlocked.tech, 101);
    assert.equal(save.customScore, 42);
    assert.equal(ctx.totalEarnedStars(save), 0);
    assert.equal(ctx.hasLegacyCompletions(save), true);
    assert.equal(save.customLevels.length, 1);
    assert.deepEqual(ctx.normalizeSaveData(save), save);
});
test('replays retain each difficulty record and count the best stars only once', () => {
    const ctx = context(), save = ctx.createDefaultSaveData();
    ctx.recordLevelResult(save, 'tech', 1, 'medium', 4, 4, true, 180, 15000);
    ctx.recordLevelResult(save, 'tech', 1, 'medium', 3, 4, true, 100, 17000);
    ctx.recordLevelResult(save, 'tech', 1, 'hard', 3, 4, true, 120, 10000);
    ctx.recordLevelResult(save, 'tech', 1, 'medium', 0, 4, false, 0, 22000);
    const medium = save.levelResults.tech[1].medium;
    assert.equal(medium.plays, 3);
    assert.equal(medium.wins, 2);
    assert.equal(medium.stars, 3);
    assert.equal(medium.bestScore, 180);
    assert.equal(medium.bestTimeMs, 15000);
    assert.equal(save.levelResults.tech[1].hard.bestTimeMs, 10000);
    assert.equal(ctx.totalEarnedStars(save), 3);
    assert.equal(ctx.earnedStars(3, 4, true), 1);
    assert.equal(ctx.earnedStars(9, 10, true), 2);
    assert.equal(ctx.earnedStars(10, 10, true), 3);
    assert.equal(ctx.earnedStars(7, 10, true), 0);
});
test('creating custom rooms awards no stars; completed rooms contribute once', () => {
    const ctx = context(), save = ctx.createDefaultSaveData();
    save.customLevels.push({ id: 'custom_123', name: 'Room', brands: [{ name: 'Apple', slug: 'apple' }] });
    assert.equal(ctx.totalEarnedStars(save), 0);
    ctx.recordLevelResult(save, 'custom', 0, 'easy', 1, 1, true, 50, 1000);
    ctx.recordLevelResult(save, 'custom', 0, 'hard', 1, 1, true, 44, 2000);
    assert.equal(ctx.totalEarnedStars(save), 3);
    assert.equal(ctx.totalEarnedStars(ctx.normalizeSaveData(save)), 3);
});
test('malformed result fields are bounded and cannot count wins that did not happen', () => {
    const ctx = context();
    const save = ctx.normalizeSaveData({ levelResults: { tech: { 1: { medium: { plays: -1, wins: 0, stars: 3, bestScore: 50, bestTimeMs: -1 } }, 101: { medium: { wins: 1, stars: 3 } } } } });
    assert.equal(ctx.totalEarnedStars(save), 0);
    assert.equal(save.levelResults.tech[1].medium.bestScore, 0);
    assert.equal(save.levelResults.tech[1].medium.bestTimeMs, null);
    assert.equal(save.levelResults.tech[101], undefined);
});
