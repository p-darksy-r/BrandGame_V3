using System.Text.Json;
using Microsoft.Web.WebView2.Core;

namespace BrandGame.Services;

// Runs only with --smoke-test and an isolated BRANDGAME_PROFILE_ROOT.
internal static class SmokeScenario
{
    internal static async Task<bool> RunAsync(CoreWebView2 view)
    {
        await view.ExecuteScriptAsync("""
            window.__nativeSmoke = 'running';
            (async () => {
                const wait = async predicate => {
                    for (let n = 0; n < 200; n++) {
                        if (predicate()) return;
                        await new Promise(resolve => setTimeout(resolve, 25));
                    }
                    throw new Error('Timed out waiting for native game flow: ' + GAME_STATE.roundStatus);
                };
                const click = id => document.getElementById(id).click();
                await wait(() => window.__brandGameReady);
                click('btn-menu-start');
                document.querySelector('#category-cards-grid button').click();
                document.querySelector('#level-buttons-grid button').click();
                for (let round = 0; round < 3; round++) {
                    await wait(() => GAME_STATE.roundStatus === 'playing');
                    const logo = document.getElementById('logo-image');
                    await wait(() => logo.complete && logo.naturalWidth > 0);
                    if (round === 0) click('btn-gameplay-hint');
                    document.getElementById('input-guess').value = GAME_STATE.currentBrand.name;
                    click('btn-guess-submit');
                    await wait(() => GAME_STATE.roundStatus === 'feedback');
                    if (document.getElementById('feedback-badge').textContent !== 'CORRECT!')
                        throw new Error('Native answer evaluation failed');
                    click('btn-feedback-next');
                }
                if (GAME_STATE.saveData.levelsUnlocked.tech !== 2 || GAME_STATE.saveData.globalScore <= 0 ||
                    GAME_STATE.saveData.levelResults.tech[1].medium.stars !== 3 || totalEarnedStars(GAME_STATE.saveData) !== 3)
                    throw new Error('Level progress was not awarded');
                window.__nativeSmoke = 'passed';
            })().catch(error => { window.__nativeSmoke = error.message; });
            """);
        for (int attempt = 0; attempt < 150; attempt++)
        {
            string result = await view.ExecuteScriptAsync("window.__nativeSmoke");
            if (result == "\"passed\"")
            {
                // The web message write is asynchronous: wait for the actual persisted save.
                for (int saveAttempt = 0; saveAttempt < 50; saveAttempt++)
                {
                    string json = await new SaveStore(AppPaths.SaveFile).LoadAsync();
                    using var save = JsonDocument.Parse(json);
                    if (save.RootElement.ValueKind == JsonValueKind.Object &&
                        save.RootElement.TryGetProperty("levelsUnlocked", out var levels) &&
                        levels.GetProperty("tech").GetInt32() == 2 &&
                        save.RootElement.GetProperty("globalScore").GetInt32() > 0 &&
                        save.RootElement.GetProperty("levelResults").GetProperty("tech").GetProperty("1").GetProperty("medium").GetProperty("stars").GetInt32() == 3) return true;
                    await Task.Delay(100);
                }
                throw new InvalidOperationException("Native save was not persisted.");
            }
            if (result != "\"running\"") throw new InvalidOperationException(result);
            await Task.Delay(100);
        }
        return false;
    }
}
