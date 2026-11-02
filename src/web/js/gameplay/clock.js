// Measure elapsed time, not the number of interval callbacks (which can be delayed).
function updateRoundClock() {
    if (GAME_STATE.roundStatus !== 'playing') return;
    GAME_STATE.elapsedTime = GAME_STATE.elapsedBeforePause + Math.max(0, performance.now() - GAME_STATE.roundStartedAt) / 1000;
    const remaining = Math.max(0, 1 - GAME_STATE.elapsedTime / GAME_STATE.timeLimit) * 100;
    const bar = document.getElementById('timer-bar');
    if (bar) {
        bar.style.width = `${remaining}%`;
        bar.style.backgroundColor = remaining < 30 ? '#ef4444' : remaining < 60 ? '#f59e0b' : '#3b82f6';
    }
    if (GAME_STATE.elapsedTime >= GAME_STATE.timeLimit) {
        clearInterval(GAME_STATE.timerInterval);
        processLossOfLife();
    }
}

function startRoundClock() {
    clearInterval(GAME_STATE.timerInterval);
    GAME_STATE.roundStartedAt = performance.now();
    GAME_STATE.roundStatus = 'playing';
    GAME_STATE.timerInterval = setInterval(updateRoundClock, 100);
    updateRoundClock();
}

function pauseRound() {
    if (GAME_STATE.roundStatus !== 'playing') return;
    updateRoundClock();
    if (GAME_STATE.roundStatus !== 'playing') return;
    clearInterval(GAME_STATE.timerInterval);
    GAME_STATE.elapsedBeforePause = GAME_STATE.elapsedTime;
    GAME_STATE.roundStatus = 'paused';
    document.getElementById('pause-overlay')?.classList.remove('hidden');
    document.getElementById('btn-resume-round')?.focus();
}

function resumeRound() {
    if (GAME_STATE.roundStatus !== 'paused' || document.hidden) return;
    document.getElementById('pause-overlay')?.classList.add('hidden');
    startRoundClock();
    document.getElementById('input-guess')?.focus();
}
