/* BrandGame_V3 - https://github.com/p-darksy-r/BrandGame_V3 - Copyright (c) darksy */

// --- AUDIO SYNTH ENGINE ---
class RetroAudioSynth {
    constructor() {
        this.ctx = null;
        this.volume = 0.5;
    }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    playCoin() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sine'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.frequency.setValueAtTime(587.33, now); osc.frequency.setValueAtTime(880, now + 0.1);
        osc.start(now); osc.stop(now + 0.3);
    }
    playWrong() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sawtooth'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(75, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    }
    playFanfare() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'triangle'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2); osc.frequency.setValueAtTime(1046.5, now + 0.3);
        osc.start(now); osc.stop(now + 0.6);
    }
}

const sfx = new RetroAudioSynth();
