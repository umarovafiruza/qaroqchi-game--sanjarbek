/**
 * Xazina Ovchisi - Audio System (Web Audio API)
 * Synthesizes sound effects procedurally without any external audio files.
 */

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('xazina_sound_muted') === 'true';
    }

    /**
     * Initializes or resumes the Web Audio context after a user interaction.
     */
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Toggles sound on/off and persists preference in localStorage.
     * @returns {boolean} New muted state
     */
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('xazina_sound_muted', String(this.muted));
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    /**
     * Helper to play a tone or frequency sweep.
     */
    playTone(startFreq, endFreq, duration, type = 'sine', gainLevel = 0.2, delay = 0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime + delay;
        const endTime = startTime + duration;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, startTime);
        if (endFreq && endFreq !== startFreq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), endTime);
        }

        gain.gain.setValueAtTime(gainLevel, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(endTime);
    }

    /**
     * Sound effect for collecting a coin (+10 pts).
     */
    playCoin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Two bright ascending pings
        this.playTone(987.77, 1318.51, 0.08, 'sine', 0.25, 0);       // B5 -> E6
        this.playTone(1318.51, 1567.98, 0.12, 'triangle', 0.2, 0.06); // E6 -> G6
    }

    /**
     * Sound effect for opening a treasure chest (+50 pts).
     */
    playChest() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Triumphant chest fanfare chord
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            this.playTone(freq, freq * 1.05, 0.3, 'triangle', 0.25, idx * 0.07);
        });
    }

    /**
     * Sound effect for collecting the exit key.
     */
    playKey() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Mystical rising chime
        const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
        notes.forEach((freq, idx) => {
            this.playTone(freq, freq * 1.02, 0.25, 'sine', 0.22, idx * 0.06);
        });
    }

    /**
     * Sound effect for taking damage (trap or enemy).
     */
    playDamage() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime;
        const duration = 0.25;

        // Low pitch saw drop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, startTime);
        osc.frequency.exponentialRampToValueAtTime(35, startTime + duration);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);

        // Add short noise crunch
        this.playNoise(0.12, 0.2);
    }

    /**
     * Procedural short noise burst for punchy impacts.
     */
    playNoise(duration, gainLevel = 0.15) {
        if (this.muted || !this.ctx) return;

        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    /**
     * Sound effect for completing a level.
     */
    playLevelWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const melody = [
            { f: 523.25, d: 0.1 },  // C5
            { f: 659.25, d: 0.1 },  // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.35 } // C6
        ];

        let timeOffset = 0;
        melody.forEach(item => {
            this.playTone(item.f, item.f, item.d, 'triangle', 0.25, timeOffset);
            timeOffset += item.d + 0.02;
        });
    }

    /**
     * Sound effect when player loses all lives (Game Over).
     */
    playGameOver() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [
            { f: 440.00, d: 0.22 }, // A4
            { f: 415.30, d: 0.22 }, // G#4
            { f: 392.00, d: 0.24 }, // G4
            { f: 349.23, d: 0.5 }   // F4
        ];

        let timeOffset = 0;
        notes.forEach(item => {
            this.playTone(item.f, item.f * 0.96, item.d, 'sawtooth', 0.22, timeOffset);
            timeOffset += item.d + 0.03;
        });
    }

    /**
     * UI button click sound.
     */
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.playTone(600, 800, 0.05, 'sine', 0.15, 0);
    }

    /**
     * Fantastic sound: Portal Teleportation Warp.
     */
    playPortal() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Ascending & descending cosmic frequency sweep
        this.playTone(280, 880, 0.22, 'sine', 0.28, 0);
        this.playTone(880, 440, 0.25, 'triangle', 0.22, 0.12);
        this.playNoise(0.2, 0.12);
    }

    /**
     * Fantastic sound: Magic Energy Shield activated.
     */
    playShield() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Ethereal crystal chord
        [659.25, 830.61, 987.77, 1318.51].forEach((freq, i) => {
            this.playTone(freq, freq * 1.02, 0.35, 'sine', 0.18, i * 0.05);
        });
    }

    /**
     * Fantastic sound: Magic Shield absorbs damage & shatters.
     */
    playShieldBreak() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        this.playTone(1200, 300, 0.2, 'triangle', 0.3, 0);
        this.playNoise(0.18, 0.25);
    }

    /**
     * Fantastic sound: Arcane Magic Blast / Fireball fired.
     */
    playBlast() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Punchy sci-fi laser blast
        this.playTone(880, 150, 0.15, 'sawtooth', 0.24, 0);
        this.playTone(1200, 400, 0.12, 'sine', 0.2, 0);
    }

    /**
     * Fantastic sound: Enemy defeated by magic explosion.
     */
    playEnemyDefeat() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        this.playTone(220, 80, 0.25, 'triangle', 0.35, 0);
        this.playNoise(0.28, 0.3);
        // Bright rewarding chime
        this.playTone(880, 1320, 0.18, 'sine', 0.25, 0.08);
    }

    /**
     * Fantastic sound: Chrono Hourglass Slow-Motion activated.
     */
    playSlowMotion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Deep cosmic time-warp pulse
        this.playTone(160, 90, 0.6, 'sine', 0.35, 0);
        this.playTone(320, 180, 0.5, 'triangle', 0.2, 0.05);
    }

    /**
     * Fantastic sound: Phantom Dash whoosh.
     */
    playDash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        this.playTone(600, 1200, 0.12, 'sine', 0.22, 0);
        this.playNoise(0.12, 0.15);
    }

    /**
     * Alert sound when enemy spots the player (!).
     */
    playAlert() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Sharp double beep alert!
        this.playTone(850, 950, 0.08, 'sawtooth', 0.25, 0);
        this.playTone(950, 1150, 0.12, 'sawtooth', 0.28, 0.07);
    }

    /**
     * Fantastic sound: Frost Nova ice blast freeze!
     */
    playFreeze() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Crystalline ice shatter + frosty resonance
        this.playTone(1800, 2400, 0.15, 'triangle', 0.25, 0);
        this.playTone(1200, 600, 0.22, 'sine', 0.28, 0.04);
        this.playNoise(0.2, 0.2);
    }

    /**
     * Fantastic sound: Cosmic Gold Magnet activated.
     */
    playMagnet() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Cosmic warble & rising magnetic chime
        this.playTone(330, 660, 0.35, 'sine', 0.28, 0);
        this.playTone(550, 1100, 0.28, 'triangle', 0.22, 0.08);
        this.playTone(880, 1760, 0.22, 'sine', 0.20, 0.16);
    }

    /**
     * Fantastic sound: Ethereal Invisibility Shroud activated.
     */
    playInvisibility() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Ethereal mystical shimmer chime
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
            this.playTone(freq, freq * 1.04, 0.4, 'sine', 0.18, idx * 0.05);
        });
    }
}

export const sound = new SoundController();

