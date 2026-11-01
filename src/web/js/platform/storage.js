/* BrandGame_V3 - Copyright (c) darksy */

const SAVE_STORAGE_KEY = 'brandgame_v3_savedata';

function sendNativeRequest(payload) {
    if (window.chrome?.webview?.postMessage) {
        window.chrome.webview.postMessage(payload);
        return;
    }
    if (payload.Action === 'load_save') {
        let saved = null;
        try { saved = window.localStorage.getItem(SAVE_STORAGE_KEY); }
        catch (error) { console.warn('Save storage unavailable; using this session only.', error); }
        onSaveLoaded(saved);
    } else if (payload.Action === 'write_save') {
        try { window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload.Data)); }
        catch (error) { console.warn('Could not persist this session.', error); }
    } else if (payload.Action === 'exit_app') {
        window.close();
    }
}

function onSaveLoaded(data) {
    GAME_STATE.saveData = normalizeSaveData(data);
    sfx.volume = GAME_STATE.saveData.volume;
    updateGlobalStatsHUD();
    renderMainMenuProgress();
    syncSettingsPanel();
    applyVisualSettings();
    const [width, height] = GAME_STATE.saveData.resolution.split('x').map(Number);
    sendNativeRequest({ Action: 'resize_window', Width: width, Height: height });
}

window.onSaveLoaded = onSaveLoaded;
