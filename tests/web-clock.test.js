const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('delayed timer callbacks expire by elapsed time; pause excludes its duration', () => {
    let now = 1000, lost = 0;
    const ctx = vm.createContext({
        window: {}, performance: { now: () => now },
        document: { hidden: false, getElementById: () => null },
        setInterval() { return 1; }, clearInterval() {},
        processLossOfLife() { lost++; vm.runInContext('GAME_STATE.roundStatus="feedback"', ctx); }
    });
    for (const file of ['core/version', 'core/state', 'gameplay/clock'])
        vm.runInContext(fs.readFileSync(path.join(__dirname, `../src/web/js/${file}.js`), 'utf8'), ctx);
    ctx.startRoundClock();
    now = 4000;
    ctx.pauseRound();
    assert.equal(vm.runInContext('GAME_STATE.elapsedTime', ctx), 3);
    now = 60000;
    ctx.updateRoundClock();
    assert.equal(lost, 0);
    ctx.resumeRound();
    now = 71000;
    ctx.updateRoundClock();
    assert.equal(lost, 0);
    assert.equal(vm.runInContext('GAME_STATE.elapsedTime', ctx), 14);
    now = 73000;
    ctx.updateRoundClock();
    ctx.updateRoundClock();
    assert.equal(lost, 1);
});

test('legacy settings migrate without erasing scores, rooms or completed levels', () => {
    const ctx = vm.createContext({ window: {} });
    for (const file of ['version', 'state']) vm.runInContext(fs.readFileSync(path.join(__dirname, `../src/web/js/core/${file}.js`), 'utf8'), ctx);
    const old = { gameVersion: '3.1.1', globalScore: 1234, levelsUnlocked: { tech: 101 }, fpsLimit: '30', vsync: false,
        customLevels: [{ name: 'Old room', brands: [{ name: 'Old', slug: 'missing-old-icon' }] }] };
    const save = ctx.normalizeSaveData(old);
    assert.equal(save.globalScore, 1234);
    assert.equal(save.levelsUnlocked.tech, 101);
    assert.equal(save.customLevels.length, 1);
    assert.equal(save.reducedMotion, false);
    assert.equal(Object.hasOwn(save, 'fpsLimit'), false);
    assert.equal(Object.hasOwn(save, 'vsync'), false);
});
