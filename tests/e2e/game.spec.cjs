const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fileUrl = pathToFileURL(path.resolve(__dirname, '../../src/web/index.html')).href;
const url = 'http://127.0.0.1:8766/';

async function ready(page, target = url) {
    await page.goto(target);
    await page.waitForFunction(() => window.__brandGameReady);
}
async function start(page) {
    await page.locator('#btn-menu-start').click();
    await page.locator('#category-cards-grid button').first().click();
    await page.locator('#level-buttons-grid button').first().click();
}
async function playing(page) {
    await page.waitForFunction(() => GAME_STATE.roundStatus === 'playing');
    await expect(page.locator('#logo-image')).toBeVisible();
}
test.beforeEach(async ({ context }) => {
    await context.route(/^https?:\/\//, route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});

test('file distribution plays a full level with network offline, bundled fonts/logos and persistent progress', async ({ page, context }) => {
    const external = [], errors = [];
    page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    page.on('pageerror', error => errors.push(error.message));
    await context.setOffline(true);
    await ready(page, fileUrl);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('700 16px Orbitron') && document.fonts.check('500 16px Rajdhani'))).toBe(true);
    expect(await page.evaluate(async () => {
        const failed = [];
        await Promise.all([...LOCAL_LOGO_SLUGS].map(slug => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { if (!img.naturalWidth) failed.push(slug); resolve(); };
            img.onerror = () => { failed.push(slug); resolve(); };
            img.src = getLocalLogoPath(slug);
        })));
        return failed;
    })).toEqual([]);
    await start(page);
    for (let index = 0; index < 3; index++) {
        await playing(page);
        if (index === 0) {
            await page.locator('#btn-gameplay-hint').click();
            await expect(page.locator('#clue-text')).toBeVisible();
            await page.locator('#btn-pause-round').click();
            await expect(page.locator('#pause-overlay')).toBeVisible();
            const elapsed = await page.evaluate(() => GAME_STATE.elapsedTime);
            await page.clock.install();
            await page.clock.fastForward(5000);
            expect(await page.evaluate(() => GAME_STATE.elapsedTime)).toBe(elapsed);
            await page.locator('#btn-resume-round').click();
        }
        const answer = await page.evaluate(() => GAME_STATE.currentBrand.name);
        await page.locator('#input-guess').fill(answer);
        await page.locator('#btn-guess-submit').click();
        await expect(page.locator('#feedback-badge')).toHaveText('CORRECT!');
        await page.locator('#btn-feedback-next').click();
    }
    await expect(page.locator('#screen-report')).toBeVisible();
    await expect(page.locator('#report-correct-count')).toHaveText('3 / 3');
    await expect(page.locator('#report-stars')).toHaveText('★★★');
    const score = await page.evaluate(() => GAME_STATE.saveData.globalScore);
    expect(score).toBeGreaterThan(0);
    await page.reload();
    await page.waitForFunction(() => window.__brandGameReady);
    expect(await page.evaluate(() => GAME_STATE.saveData.levelsUnlocked.tech)).toBe(2);
    expect(await page.evaluate(() => GAME_STATE.saveData.globalScore)).toBe(score);
    await expect(page.locator('#global-stars')).toHaveText('3');
    expect(await page.evaluate(() => GAME_STATE.saveData.levelResults.tech[1].medium.stars)).toBe(3);
    await page.locator('#btn-menu-start').click();
    await page.locator('#category-cards-grid button').first().click();
    await expect(page.locator('#level-buttons-grid button').first()).toContainText('★★★');
    await expect(page.locator('#level-buttons-grid button').first()).toContainText('pts');
    await page.locator('#btn-levels-back').click();
    await page.locator('#btn-categories-back').click();
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: 'artifacts/qa/offline-menu.png', fullPage: true });
});

test('missing logo stops the clock, preserves lives and can be retried', async ({ page }) => {
    await page.route('**/assets/logos/*.svg', route => route.abort());
    await ready(page);
    await start(page);
    await expect(page.locator('#btn-retry-logo')).toBeVisible();
    expect(await page.evaluate(() => [GAME_STATE.elapsedTime, GAME_STATE.lives, GAME_STATE.roundStatus])).toEqual([0, 3, 'asset-error']);
    await expect(page.locator('#input-guess')).toBeDisabled();
    await page.unroute('**/assets/logos/*.svg');
    await page.locator('#btn-retry-logo').click();
    await playing(page);
    await expect(page.locator('#input-guess')).toBeEnabled();
});

test('quit during image loading ignores the late image response', async ({ page }) => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/assets/logos/*.svg', async route => { await gate; await route.continue(); });
    await ready(page);
    await start(page);
    await expect(page.locator('#round-load-status')).toHaveText('Loading logo…');
    await page.locator('#btn-gameplay-quit').click();
    release();
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => GAME_STATE.roundStatus)).toBe('idle');
    await expect(page.locator('#screen-levels')).toBeVisible();
});

test('three wrong answers fail the level without unlocking it', async ({ page }) => {
    await ready(page);
    await start(page);
    for (let i = 0; i < 3; i++) {
        await playing(page);
        await page.locator('#input-guess').fill('zzzzzzzzzzzzzzzz');
        await page.locator('#btn-guess-submit').click();
        await expect(page.locator('#feedback-badge')).toHaveText('INCORRECT');
        await page.locator('#btn-feedback-next').click();
    }
    await expect(page.locator('#screen-report h2')).toHaveText('LEVEL FAILED');
    expect(await page.evaluate(() => GAME_STATE.saveData.levelsUnlocked.tech)).toBe(1);
});

test('motion setting persists and native-only rendering controls are absent', async ({ page }) => {
    await ready(page);
    await page.locator('#btn-menu-settings').click();
    await expect(page.locator('[id^="btn-fps-"], [id^="btn-vsync-"]')).toHaveCount(0);
    await page.locator('#settings-reduced-motion').check();
    await expect(page.locator('body')).toHaveClass(/reduced-motion/);
    await page.reload();
    await page.waitForFunction(() => window.__brandGameReady);
    await expect(page.locator('body')).toHaveClass(/reduced-motion/);
    await page.locator('#btn-menu-settings').click();
    await expect(page.locator('#settings-reduced-motion')).toBeChecked();
    await page.screenshot({ path: 'artifacts/qa/settings.png', fullPage: true });
});

test('custom rooms require bundled logos and preserve unavailable legacy rooms', async ({ page }) => {
    await ready(page);
    await page.locator('#btn-menu-start').click();
    await page.locator('#btn-trigger-creator').click();
    await page.locator('#creator-level-name').fill('Offline room');
    await page.locator('#c-brand-1-name').fill('Apple');
    await page.locator('#c-brand-1-slug').fill('not-a-local-logo');
    page.once('dialog', async dialog => { expect(dialog.message()).toContain('offline'); await dialog.accept(); });
    await page.locator('#btn-save-custom-level').click();
    expect(await page.evaluate(() => GAME_STATE.saveData.customLevels.length)).toBe(0);
    await page.locator('#c-brand-1-slug').fill('apple');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#btn-save-custom-level').click();
    await page.locator('#category-cards-grid button').last().click();
    await page.locator('#level-buttons-grid button').first().click();
    await playing(page);
    await page.locator('#input-guess').fill('Apple');
    await page.locator('#btn-guess-submit').click();
    await expect(page.locator('#feedback-badge')).toHaveText('CORRECT!');
    await page.locator('#btn-feedback-next').click();
    expect(await page.evaluate(() => GAME_STATE.saveData.customScore)).toBeGreaterThan(0);
    expect(await page.evaluate(() => GAME_STATE.saveData.globalScore)).toBe(0);
    await page.evaluate(() => {
        GAME_STATE.saveData.customLevels[0].brands[0].slug = 'old-unavailable-icon';
        sendNativeRequest({ Action: 'write_save', Data: GAME_STATE.saveData });
    });
    await page.reload();
    await page.waitForFunction(() => window.__brandGameReady);
    await page.locator('#btn-menu-start').click();
    await page.locator('#category-cards-grid button').last().click();
    page.once('dialog', async dialog => { expect(dialog.message()).toContain('preserved'); await dialog.accept(); });
    await page.locator('#level-buttons-grid button').first().click();
    await expect(page.locator('#screen-levels')).toBeVisible();
    expect(await page.evaluate(() => GAME_STATE.saveData.customLevels[0].brands[0].slug)).toBe('old-unavailable-icon');
});

test('old saves keep scores and unlocks while showing unknown historical results honestly', async ({ page }) => {
    await ready(page);
    await page.evaluate(() => localStorage.setItem('brandgame_v3_savedata', JSON.stringify({
        gameVersion: '3.2.0', globalScore: 1250, levelsUnlocked: { tech: 4 }, categoryScores: { tech: 1250 }
    })));
    await page.reload();
    await page.waitForFunction(() => window.__brandGameReady);
    await expect(page.locator('#global-score')).toHaveText('1250');
    await expect(page.locator('#global-stars')).toHaveText('0');
    await expect(page.locator('#legacy-progress-note')).toBeVisible();
    await page.locator('#btn-menu-start').click();
    await page.locator('#category-cards-grid button').first().click();
    await expect(page.locator('#level-buttons-grid button').nth(0)).toContainText('Completed · no record');
    await expect(page.locator('#level-buttons-grid button').nth(3)).toBeEnabled();
    await expect(page.locator('#level-buttons-grid button').nth(4)).toBeDisabled();
    await page.screenshot({ path: 'artifacts/qa/legacy-level-records.png', fullPage: true });
});
