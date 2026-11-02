function loadRoundLogo(token) {
    const img = document.getElementById('logo-image');
    const status = document.getElementById('round-load-status');
    const retry = document.getElementById('btn-retry-logo');
    const input = document.getElementById('input-guess');
    img.classList.add('hidden');
    retry.classList.add('hidden');
    input.disabled = true;
    status.textContent = 'Loading logo…';
    const source = getLocalLogoPath(GAME_STATE.currentBrand.slug);
    const pending = new Image();
    const active = () => token === GAME_STATE.roundToken && GAME_STATE.roundStatus === 'loading';
    const failed = () => {
        if (!active()) return;
        GAME_STATE.roundStatus = 'asset-error';
        status.textContent = 'The logo could not be loaded. No time or lives were lost. Retry or leave this level.';
        retry.classList.remove('hidden');
    };
    const timeout = setTimeout(failed, 10000);
    pending.onerror = () => { clearTimeout(timeout); failed(); };
    pending.onload = () => {
        clearTimeout(timeout);
        if (!active()) return;
        if (!pending.naturalWidth) { failed(); return; }
        img.src = source;
        img.style.filter = 'grayscale(1) invert(1) brightness(0.8)';
        img.classList.remove('hidden');
        status.textContent = '';
        input.disabled = false;
        startRoundClock();
        if (document.hidden) pauseRound();
        else input.focus();
    };
    if (source) pending.src = source;
    else { clearTimeout(timeout); failed(); }
}
