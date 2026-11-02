const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    workers: 1,
    retries: 0,
    reporter: 'list',
    use: { browserName: 'chromium', viewport: { width: 1024, height: 768 }, trace: 'retain-on-failure' },
    webServer: { command: 'node scripts/serve-web.mjs 8766', url: 'http://127.0.0.1:8766', reuseExistingServer: false }
});
