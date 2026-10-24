/** Xazina Ovchisi - Standalone Fallback Bundle for direct file:// launch **/
(function() {
"use strict";

/* ==================== Module: audio.js ==================== */

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

const sound = new SoundController();



/* ==================== Module: level.js ==================== */

/**
 * Xazina Ovchisi - Level System & Map Definitions
 * 5 levels with increasing difficulty, defined as 2D arrays.
 */

const TILE_SIZE = 40;

// Color Palette specified in design requirements
const COLORS = {
    sand: '#F4D58D',
    sandDark: '#E4BF72',
    sea: '#2A9D8F',
    seaDeep: '#1F756B',
    seaWave: '#48CAE4',
    grass: '#6BA368',
    grassDark: '#548252',
    soil: '#8B5E3C',
    soilDark: '#674226',
    soilLight: '#A67852',
    gold: '#FFC93C',
    goldLight: '#FFE17D',
    goldDark: '#D49B1E',
    dangerRed: '#E63946',
    darkUI: '#1D3557',
    // Fantastic Supernatural Palette
    portalCyan: '#00F5D4',
    portalPurple: '#7B2CBF',
    magicViolet: '#9D4EDD',
    magicBlue: '#48CAE4',
    magicPink: '#F72585'
};

/**
 * 5 Pre-defined levels with 2D character arrays:
 * 'W' = Wall / Rock / Barrier (solid)
 * '.' = Sand / Walkable path
 * 'P' = Player spawn
 * 'K' = Exactly one Key (unlocks the door)
 * 'D' = Exit Door
 * 'C' = Coin (+10 points)
 * 'T' = Treasure chest (+50 points)
 * 'S' = Spike trap (-1 life)
 * 'E' = Patrolling pirate enemy (-1 life)
 * 'G' = Ghost Pirate (Fantastic floating ethereal enemy)
 * '1','2' = Astral Teleportation Portals (warps player instantly)
 * 'O' = Magic Shield Crystal (absorbs 1 damage hit)
 * 'B' = Chrono Hourglass (slows time for 5 seconds)
 * 'A' = Arcane Amulet (+2 Magic Fireball ammo)
 */
const LEVELS = [
    // Level 1: Sohilga qadam (Beach Landing) - 16x11
    {
        id: 1,
        name: "1-bosqich: Sohilga qadam",
        enemySpeed: 38,
        detectionRadius: 85,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','C','.','C','.','C','.','C','.','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','.','W'],
            ['W','.','W','.','O','.','W','.','W','.','.','A','.','W','.','W'],
            ['W','.','W','.','T','.','W','.','W','.','K','.','.','W','.','W'],
            ['W','.','W','.','.','.','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','W','W','.','W','W','.','.','.','.','.','.','W','.','W'],
            ['W','.','.','C','.','.','.','.','E','.','.','C','.','.','.','W'],
            ['W','W','W','W','W','W','W','.','W','W','W','W','W','W','.','W'],
            ['W','.','.','S','.','.','.','C','.','.','C','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 2: Qaroqchi Qoyalari (Pirate Coves) - 17x11
    {
        id: 2,
        name: "2-bosqich: Qaroqchi Qoyalari",
        enemySpeed: 42,
        detectionRadius: 90,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','C','.','.','.','W','.','C','.','C','.','.','2','W'],
            ['W','.','W','W','W','.','W','.','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','M','W','.','W','.','.','.','W','.','.','.','T','.','W'],
            ['W','W','W','.','W','.','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','C','.','.','.','.','.','O','.','C','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','.','W','.','W'],
            ['W','.','W','.','.','.','W','.','E','.','.','.','W','.','W','.','W'],
            ['W','.','W','.','T','.','W','.','W','W','W','.','W','.','K','.','W'],
            ['W','.','.','.','C','.','.','.','.','.','S','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 3: Sirli G'or (Mysterious Cave) - 18x12
    {
        id: 3,
        name: "3-bosqich: Sirli G'or",
        enemySpeed: 46,
        detectionRadius: 95,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','C','.','W','.','.','.','C','.','C','.','.','C','.','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','W','W','W','.','W'],
            ['W','.','O','.','W','.','.','.','W','.','.','B','.','T','.','W','.','W'],
            ['W','W','W','.','W','W','W','W','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','.','.','C','.','.','.','E','.','.','.','.','C','.','.','.','W'],
            ['W','.','W','W','W','W','W','W','.','S','.','W','W','W','W','W','.','W'],
            ['W','.','W','.','M','.','.','W','.','.','.','W','.','.','.','W','.','W'],
            ['W','.','W','.','T','.','.','W','W','W','W','W','.','K','.','W','.','W'],
            ['W','.','W','.','.','.','.','.','.','.','.','E','.','.','.','W','.','W'],
            ['W','.','.','.','S','.','.','W','W','W','W','W','W','W','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 4: Qadimiy Harobalar (Ancient Ruins) - 20x13
    {
        id: 4,
        name: "4-bosqich: Qadimiy Harobalar",
        enemySpeed: 50,
        detectionRadius: 100,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','C','.','.','.','C','.','.','.','W','.','O','.','.','T','.','W'],
            ['W','W','W','W','W','W','W','.','W','W','W','.','W','.','W','W','W','W','.','W'],
            ['W','.','.','.','C','.','W','.','.','.','W','.','W','.','C','.','.','W','.','W'],
            ['W','.','W','.','I','.','W','W','.','.','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','W','.','T','.','.','E','.','.','W','.','.','.','.','W','.','W','.','W'],
            ['W','.','W','W','W','W','W','W','W','.','W','.','.','S','.','W','.','W','.','W'],
            ['W','.','W','.','.','.','K','.','W','.','.','.','W','W','.','.','.','W','2','W'],
            ['W','.','W','.','W','W','W','.','W','W','W','W','W','.','W','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','E','.','.','.','W','.','G','.','.','.','.','W'],
            ['W','W','W','.','W','.','S','.','W','W','W','.','W','.','S','.','W','W','W','W'],
            ['W','A','.','.','C','.','.','.','.','.','W','.','B','.','C','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 5: Yashirin Zindon (Sunken Dungeon) - 22x13
    {
        id: 5,
        name: "5-bosqich: Yashirin Zindon",
        enemySpeed: 54,
        detectionRadius: 105,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','.','.','W','.','.','.','C','.','.','.','.','W','.','.','.','T','.','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','W','W','.','W','W','W','W','W','.','S','.','.','W','W','W','W','W','.','W','W','W'],
            ['W','.','.','.','C','.','.','.','E','.','.','.','.','C','.','.','.','E','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','.','T','.','W','.','.','.','K','.','.','.','.','W','.','T','.','.','.','W'],
            ['W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','W','W'],
            ['W','.','.','.','W','.','.','.','W','.','S','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','.','E','.','W','.','W','W','W','.','.','.','.','W','W','W','.','W','.','G','.','W'],
            ['W','.','A','.','C','.','.','.','S','.','.','.','C','.','.','.','.','S','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 6: Qaroqchilar Qal'asi (Pirate Fortress) - 22x14
    {
        id: 6,
        name: "6-bosqich: Qaroqchilar Qal'asi",
        enemySpeed: 58,
        detectionRadius: 110,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','O','.','W','.','.','.','C','.','.','.','.','W','.','.','.','T','.','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','W','W','.','W','W','W','W','W','.','S','.','.','W','W','W','W','W','.','W','W','W'],
            ['W','.','.','.','C','.','.','.','E','.','.','.','.','C','.','.','.','E','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','.','T','.','W','.','.','.','K','.','.','.','.','W','.','T','.','.','2','W'],
            ['W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','W','W'],
            ['W','.','.','.','W','.','.','.','W','.','S','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','.','G','.','W','.','W','W','W','.','.','.','.','W','W','W','.','W','.','G','.','W'],
            ['W','.','A','.','W','.','.','.','W','.','B','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','.','C','.','.','.','S','.','.','.','C','.','.','.','.','S','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 7: Sharpalar Qabristoni (Phantom Graveyard) - 24x14
    {
        id: 7,
        name: "7-bosqich: Sharpalar Qabristoni",
        enemySpeed: 62,
        detectionRadius: 115,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','.','.','.','.','W','.','.','.','C','.','.','.','.','W','.','.','.','.','2','W'],
            ['W','W','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','T','.','W','.','.','.','W','.','T','.','.','W','.','.','.','W','.','T','.','W'],
            ['W','.','W','W','W','.','W','W','W','W','W','.','W','W','.','W','W','W','W','W','.','W','.','W'],
            ['W','.','O','.','W','.','.','.','G','.','.','.','.','W','.','.','.','E','.','.','.','W','.','W'],
            ['W','W','W','.','W','.','S','.','W','W','W','W','W','W','W','W','W','W','.','S','.','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','K','.','.','.','W','.','.','.','W','.','W'],
            ['W','.','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','G','.','.','.','W','.','.','.','G','.','.','.','.','W','.','.','.','G','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','W','.','.','.','W','.','A','.','S','.','.','S','.','.','B','W','.','.','.','W','.','W'],
            ['W','.','A','.','C','.','.','.','.','.','.','.','C','.','.','.','.','.','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 8: Lava Qoyalari (Molten Cavern) - 24x15
    {
        id: 8,
        name: "8-bosqich: Lava Qoyalari",
        enemySpeed: 66,
        detectionRadius: 120,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','C','.','.','.','W','.','C','.','.','.','W','.','.','.','C','.','T','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','.','W','W','W','.','W','.','W','W','W','W','W','W','.','W'],
            ['W','.','W','.','.','.','W','.','.','.','W','.','.','.','W','.','W','.','.','.','O','.','.','W'],
            ['W','.','W','.','T','.','W','W','W','W','W','.','T','.','W','.','W','.','K','.','W','W','.','W'],
            ['W','.','W','W','.','W','W','.','.','.','W','W','.','W','W','.','W','W','W','W','W','.','.','W'],
            ['W','.','.','.','S','.','.','.','E','.','.','.','S','.','.','.','E','.','.','.','W','.','.','W'],
            ['W','W','W','W','W','W','W','.','W','W','W','W','W','W','W','.','W','W','W','.','W','.','.','W'],
            ['W','.','.','.','.','.','W','.','W','.','.','.','.','.','W','.','W','.','.','.','W','.','.','W'],
            ['W','.','G','.','.','.','W','.','W','.','B','.','.','.','W','.','W','.','G','.','W','.','.','W'],
            ['W','W','W','W','W','.','W','.','W','W','W','W','W','.','W','.','W','.','W','W','W','.','.','W'],
            ['W','.','.','.','W','.','.','.','.','.','.','.','W','.','.','.','W','.','W','.','.','.','.','W'],
            ['W','.','A','.','W','W','W','W','W','.','S','.','W','W','W','W','W','.','W','.','S','.','.','W'],
            ['W','.','C','.','.','.','.','.','C','.','.','.','.','.','.','.','C','.','.','.','D','.','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 9: Kapitan Qo'rg'oni (Captain's Keep) - 26x15
    {
        id: 9,
        name: "9-bosqich: Kapitan Qo'rg'oni",
        enemySpeed: 70,
        detectionRadius: 125,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','C','.','W','.','.','.','.','.','W','.','.','.','.','W','.','.','.','C','.','.','2','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','.','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','.','W','.','W','.','W','.','.','.','W','.','W','.','.','.','.','W','.','.','.','T','.','W'],
            ['W','W','W','.','W','.','W','.','W','.','T','.','W','.','W','.','T','.','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','C','.','.','.','W','W','.','W','W','.','W','W','.','W','W','W','.','W','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','.','.','E','.','.','.','.','.','E','.','.','.','.','W','.','W','.','W'],
            ['W','.','W','.','.','.','W','W','W','W','W','.','W','W','W','W','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','W','.','O','.','.','.','.','.','W','.','W','.','.','.','.','.','W','.','.','.','.','W','.','W'],
            ['W','.','W','W','W','W','W','.','G','.','W','.','W','.','G','.','.','.','W','.','K','.','.','W','.','W'],
            ['W','.','.','.','.','.','W','W','W','.','W','.','W','.','W','W','W','W','W','.','W','W','W','W','.','W'],
            ['W','W','W','.','S','.','.','.','W','.','.','.','.','.','W','.','.','.','S','.','W','.','.','.','.','W'],
            ['W','.','.','.','C','.','A','.','W','W','W','W','W','W','W','.','B','.','C','.','W','.','S','.','.','W'],
            ['W','.','C','.','.','.','S','.','.','.','.','.','.','.','.','.','.','.','S','.','.','.','D','.','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 10: Afsonaviy Xazinaxona (The Legendary Vault) - 28x16 (Final Boss Realm)
    {
        id: 10,
        name: "10-bosqich: Afsonaviy Xazinaxona",
        enemySpeed: 75,
        detectionRadius: 130,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','.','.','.','.','W','.','.','.','C','.','.','.','.','W','.','.','.','.','.','W','.','.','2','W'],
            ['W','W','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W','.','W','W','W'],
            ['W','.','.','.','T','.','W','.','.','.','W','.','T','.','.','W','.','.','.','W','.','T','.','W','.','.','.','W'],
            ['W','.','W','W','W','.','W','W','W','W','W','.','W','W','.','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','O','.','W','.','.','.','G','.','.','.','.','W','.','.','.','E','.','.','.','W','.','.','.','O','.','W'],
            ['W','W','W','.','W','.','S','.','W','W','W','W','W','W','W','W','W','W','.','S','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','K','.','.','.','W','.','.','.','W','.','W','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W','.','W','W','W'],
            ['W','.','.','.','G','.','.','.','W','.','.','.','G','.','.','.','.','W','.','.','.','G','.','W','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','W','W','.','W','W','W','W','W','.','W','W','W','.','W'],
            ['W','.','W','.','.','.','W','.','A','.','S','.','.','S','.','.','B','W','.','.','.','W','.','.','.','A','.','W'],
            ['W','.','W','.','T','.','W','W','W','W','W','W','W','W','W','W','W','W','.','T','.','W','W','W','W','W','.','W'],
            ['W','.','W','.','.','.','.','.','.','C','.','.','.','.','C','.','.','.','.','.','.','W','.','.','.','.','.','W'],
            ['W','.','.','.','C','.','S','.','.','.','T','.','T','.','T','.','.','.','S','.','.','.','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    }
];


class Level {
    constructor() {
        this.currentLevelIndex = 0;
        this.name = "";
        this.cols = 0;
        this.rows = 0;
        this.pixelWidth = 0;
        this.pixelHeight = 0;

        this.grid = [];
        this.playerSpawn = { x: 0, y: 0 };
        this.key = null;
        this.exitDoor = null;
        this.coins = [];
        this.chests = [];
        this.spikes = [];
        this.rawEnemyData = [];

        // === FANTASTIC SUPERNATURAL OBJECTS ===
        this.portals = [];
        this.shields = [];
        this.timeArtifacts = [];
        this.magicAmulets = [];
        this.magnets = [];
        this.invisibilityCloaks = [];
        this.portalAnimAngle = 0;

        this.animTime = 0;
    }

    /**
     * Loads a level by index (0-based: 0 to 4).
     */
    load(index) {
        if (index < 0 || index >= LEVELS.length) {
            index = 0;
        }
        this.currentLevelIndex = index;
        const levelData = LEVELS[index];

        this.name = levelData.name;
        this.rows = levelData.grid.length;
        this.cols = levelData.grid[0].length;
        this.pixelWidth = this.cols * TILE_SIZE;
        this.pixelHeight = this.rows * TILE_SIZE;

        this.grid = [];
        this.coins = [];
        this.chests = [];
        this.spikes = [];
        this.rawEnemyData = [];
        this.portals = [];
        this.shields = [];
        this.timeArtifacts = [];
        this.magicAmulets = [];
        this.magnets = [];
        this.invisibilityCloaks = [];
        this.key = null;
        this.exitDoor = null;

        for (let r = 0; r < this.rows; r++) {
            const rowArr = [];
            for (let c = 0; c < this.cols; c++) {
                const cell = levelData.grid[r][c];
                const cx = c * TILE_SIZE + TILE_SIZE / 2;
                const cy = r * TILE_SIZE + TILE_SIZE / 2;

                if (cell === 'W') {
                    rowArr.push('W');
                } else {
                    rowArr.push('.'); // Walkable floor base
                }

                if (cell === 'P') {
                    this.playerSpawn = { x: cx, y: cy };
                } else if (cell === 'K') {
                    this.key = {
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        width: 24,
                        height: 24,
                        collected: false,
                        floatTimer: 0
                    };
                } else if (cell === 'D') {
                    this.exitDoor = {
                        col: c,
                        row: r,
                        x: c * TILE_SIZE,
                        y: r * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        unlocked: false
                    };
                } else if (cell === 'C') {
                    this.coins.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 10,
                        collected: false,
                        spinAngle: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'T') {
                    this.chests.push({
                        col: c,
                        row: r,
                        x: c * TILE_SIZE + 4,
                        y: r * TILE_SIZE + 6,
                        width: 32,
                        height: 28,
                        opened: false,
                        openProgress: 0, // 0 = closed, 1 = fully open
                        glowTimer: 0
                    });
                } else if (cell === 'S') {
                    this.spikes.push({
                        col: c,
                        row: r,
                        x: c * TILE_SIZE,
                        y: r * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        timer: (c + r) * 0.4 % 3.0, // Stagger spikes naturally
                        cycleTime: 3.0,             // 3s full cycle
                        activeDuration: 1.6,        // Extended for 1.6s
                        warningDuration: 0.5,       // Warning gleam for 0.5s before
                        state: 'down'               // 'down', 'warning', 'up'
                    });
                } else if (cell === '1' || cell === '2') {
                    this.portals.push({
                        id: cell,
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 16,
                        target: null
                    });
                } else if (cell === 'O') {
                    this.shields.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'B') {
                    this.timeArtifacts.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'A') {
                    this.magicAmulets.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'M') {
                    this.magnets.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'I') {
                    this.invisibilityCloaks.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'E' || cell === 'G') {
                    // Determine natural patrol bounds based on corridor
                    let leftBound = c;
                    while (leftBound > 0 && levelData.grid[r][leftBound - 1] !== 'W') {
                        leftBound--;
                    }
                    let rightBound = c;
                    while (rightBound < this.cols - 1 && levelData.grid[r][rightBound + 1] !== 'W') {
                        rightBound++;
                    }

                    let topBound = r;
                    while (topBound > 0 && levelData.grid[topBound - 1][c] !== 'W') {
                        topBound--;
                    }
                    let bottomBound = r;
                    while (bottomBound < this.rows - 1 && levelData.grid[bottomBound + 1][c] !== 'W') {
                        bottomBound++;
                    }

                    const horizRange = rightBound - leftBound;
                    const vertRange = bottomBound - topBound;

                    // Choose axis with longer walking corridor
                    const axis = horizRange >= vertRange ? 'horizontal' : 'vertical';
                    const minCoord = (axis === 'horizontal' ? leftBound : topBound) * TILE_SIZE + 20;
                    const maxCoord = (axis === 'horizontal' ? rightBound : bottomBound) * TILE_SIZE + 20;

                    this.rawEnemyData.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        axis,
                        minCoord,
                        maxCoord,
                        detectionRadius: cell === 'G' ? 95 : (levelData.detectionRadius || 100),
                        isGhost: (cell === 'G'),
                        speed: cell === 'G' ? (levelData.enemySpeed || 50) * 0.85 : (levelData.enemySpeed || 50)
                    });
                }
            }
            this.grid.push(rowArr);
        }

        // Link portal pairs
        const p1 = this.portals.find(p => p.id === '1');
        const p2 = this.portals.find(p => p.id === '2');
        if (p1 && p2) {
            p1.target = p2;
            p2.target = p1;
        }

        // Pre-render static tilemap onto offscreen canvas for solid 60 FPS on low-end hardware
        this.buildTilemapCache();
    }

    /**
     * Pre-renders all static sand and wall tiles to an offscreen canvas.
     * Eliminates 2,000+ per-frame fillRect calls down to 1 single hardware blit!
     */
    buildTilemapCache() {
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.pixelWidth;
        this.bgCanvas.height = this.pixelHeight;
        const bgCtx = this.bgCanvas.getContext('2d');
        bgCtx.imageSmoothingEnabled = false;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const px = c * TILE_SIZE;
                const py = r * TILE_SIZE;
                if (this.grid[r][c] === 'W') {
                    this.drawWallTile(bgCtx, px, py, c, r);
                } else {
                    this.drawSandTile(bgCtx, px, py, c, r);
                }
            }
        }
    }

    /**
     * Checks if a point or grid coordinate is a solid wall.
     */
    isSolidTile(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return true;
        }
        return this.grid[row][col] === 'W';
    }

    /**
     * Checks if an AABB rectangle overlaps any solid wall tiles.
     */
    checkWallCollision(box) {
        const minCol = Math.floor(box.x / TILE_SIZE);
        const maxCol = Math.floor((box.x + box.width - 0.01) / TILE_SIZE);
        const minRow = Math.floor(box.y / TILE_SIZE);
        const maxRow = Math.floor((box.y + box.height - 0.01) / TILE_SIZE);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.isSolidTile(c, r)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Updates animations for level objects.
     */
    update(dt) {
        this.animTime += dt;

        // Animate coins (spinning)
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.spinAngle = (coin.spinAngle + dt * 4.5) % (Math.PI * 2);
            }
        });

        // Animate key floating bob
        if (this.key && !this.key.collected) {
            this.key.floatTimer += dt * 3.5;
        }

        // Animate chests opening
        this.chests.forEach(chest => {
            if (chest.opened && chest.openProgress < 1) {
                chest.openProgress = Math.min(1, chest.openProgress + dt * 3.5);
            }
            if (chest.opened) {
                chest.glowTimer += dt * 4;
            }
        });

        // Animate periodic spike traps
        this.spikes.forEach(spike => {
            spike.timer = (spike.timer + dt) % spike.cycleTime;
            const warningStart = spike.cycleTime - spike.activeDuration - spike.warningDuration;
            const upStart = spike.cycleTime - spike.activeDuration;

            if (spike.timer >= upStart) {
                spike.state = 'up';
            } else if (spike.timer >= warningStart) {
                spike.state = 'warning';
            } else {
                spike.state = 'down';
            }
        });

        // === FANTASTIC OBJECT ANIMATIONS ===
        // 1. Animate Astral Portals
        this.portalAnimAngle = (this.portalAnimAngle + dt * 4.5) % (Math.PI * 2);

        // 2. Animate Magic Shield Crystals
        this.shields.forEach(s => {
            if (!s.collected) {
                s.floatTimer += dt * 3.5;
            }
        });

        // 3. Animate Chrono Hourglasses
        this.timeArtifacts.forEach(t => {
            if (!t.collected) {
                t.floatTimer += dt * 3.5;
            }
        });

        // 4. Animate Arcane Amulets
        this.magicAmulets.forEach(a => {
            if (!a.collected) {
                a.floatTimer += dt * 3.5;
            }
        });

        // 5. Animate Cosmic Magnets
        this.magnets.forEach(m => {
            if (!m.collected) {
                m.floatTimer += dt * 3.5;
            }
        });

        // 6. Animate Invisibility Cloaks
        this.invisibilityCloaks.forEach(ic => {
            if (!ic.collected) {
                ic.floatTimer += dt * 3.5;
            }
        });
    }

    /**
     * Unlocks the exit door when key is picked up.
     */
    unlockExitDoor() {
        if (this.exitDoor) {
            this.exitDoor.unlocked = true;
        }
    }

    /**
     * Renders the tilemap and static/animated level entities.
     */
    render(ctx, camera) {
        // 1. Draw Animated Tropical Ocean Viewport (Fills whole screen seamless)
        ctx.fillStyle = '#1D7068';
        ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

        // Gentle animated waves (ultra-fast, zero CPU lag)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        const waveY = (this.animTime * 20) % 50;
        for (let wy = -50 + waveY; wy < camera.viewportHeight + 50; wy += 35) {
            ctx.beginPath();
            ctx.moveTo(0, wy);
            ctx.quadraticCurveTo(camera.viewportWidth * 0.5, wy + 6, camera.viewportWidth, wy);
            ctx.stroke();
        }

        // 2. Draw Island Sandy Shoreline & Sea Foam Border
        const ix = -camera.x;
        const iy = -camera.y;
        const iw = this.pixelWidth;
        const ih = this.pixelHeight;

        // Sea foam fringe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(ix - 8, iy - 8, iw + 16, ih + 16);

        // Shallow water halo
        ctx.fillStyle = 'rgba(42, 157, 143, 0.5)';
        ctx.fillRect(ix - 4, iy - 4, iw + 8, ih + 8);

        // 3. Draw Static Island Tilemap (Single GPU hardware blit - 60 FPS!)
        if (this.bgCanvas) {
            ctx.drawImage(this.bgCanvas, ix, iy);
        } else {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const px = c * TILE_SIZE + ix;
                    const py = r * TILE_SIZE + iy;
                    if (this.grid[r][c] === 'W') {
                        this.drawWallTile(ctx, px, py, c, r);
                    } else {
                        this.drawSandTile(ctx, px, py, c, r);
                    }
                }
            }
        }

        // 2. Draw Astral Teleportation Portals
        this.portals.forEach(portal => {
            const px = portal.x - camera.x;
            const py = portal.y - camera.y;
            if (this.isInView(px - 25, py - 25, 50, camera)) {
                this.drawPortal(ctx, px, py, portal);
            }
        });

        // 3. Draw Spike Traps
        this.spikes.forEach(spike => {
            const px = spike.x - camera.x;
            const py = spike.y - camera.y;
            if (this.isInView(px, py, TILE_SIZE, camera)) {
                this.drawSpikeTrap(ctx, px, py, spike);
            }
        });

        // 4. Draw Exit Door
        if (this.exitDoor) {
            const px = this.exitDoor.x - camera.x;
            const py = this.exitDoor.y - camera.y;
            if (this.isInView(px, py, TILE_SIZE, camera)) {
                this.drawExitDoor(ctx, px, py, this.exitDoor);
            }
        }

        // 5. Draw Treasure Chests
        this.chests.forEach(chest => {
            const px = chest.x - camera.x;
            const py = chest.y - camera.y;
            if (this.isInView(px, py, chest.width, camera)) {
                this.drawChest(ctx, px, py, chest);
            }
        });

        // 6. Draw Coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const px = coin.x - camera.x;
                const py = coin.y - camera.y;
                if (this.isInView(px - 15, py - 15, 30, camera)) {
                    this.drawCoin(ctx, px, py, coin);
                }
            }
        });

        // 7. Draw Magic Shield Crystals
        this.shields.forEach(s => {
            if (!s.collected) {
                const px = s.x - camera.x;
                const py = s.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawShieldOrb(ctx, px, py, s);
                }
            }
        });

        // 8. Draw Chrono Hourglasses
        this.timeArtifacts.forEach(t => {
            if (!t.collected) {
                const px = t.x - camera.x;
                const py = t.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawChronoHourglass(ctx, px, py, t);
                }
            }
        });

        // 9. Draw Arcane Amulets
        this.magicAmulets.forEach(a => {
            if (!a.collected) {
                const px = a.x - camera.x;
                const py = a.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawArcaneAmulet(ctx, px, py, a);
                }
            }
        });

        // 10. Draw Key (if not yet collected)
        if (this.key && !this.key.collected) {
            const bob = Math.sin(this.key.floatTimer) * 4;
            const px = this.key.x - camera.x;
            const py = this.key.y + bob - camera.y;
            if (this.isInView(px - 20, py - 20, 40, camera)) {
                this.drawKey(ctx, px, py);
            }
        }

        // 11. Draw Cosmic Gold Magnets
        this.magnets.forEach(m => {
            if (!m.collected) {
                const px = m.x - camera.x;
                const py = m.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawMagnet(ctx, px, py, m);
                }
            }
        });

        // 12. Draw Ethereal Invisibility Cloaks
        this.invisibilityCloaks.forEach(ic => {
            if (!ic.collected) {
                const px = ic.x - camera.x;
                const py = ic.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawInvisibilityCloak(ctx, px, py, ic);
                }
            }
        });
    }

    isInView(px, py, size, camera) {
        return (
            px + size >= -10 &&
            px <= camera.viewportWidth + 10 &&
            py + size >= -10 &&
            py <= camera.viewportHeight + 10
        );
    }

    /**
     * Draws warm cartoon sand ground tile with subtle texture dots.
     */
    drawSandTile(ctx, x, y, c, r) {
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Subtle decorative pebbles/dune speckles
        const hash = ((c * 37) ^ (r * 101)) % 100;
        if (hash < 35) {
            ctx.fillStyle = COLORS.sandDark;
            const ox = (hash * 7) % (TILE_SIZE - 6) + 3;
            const oy = (hash * 13) % (TILE_SIZE - 6) + 3;
            ctx.fillRect(x + ox, y + oy, 3, 2);
        } else if (hash > 80) {
            // Little green grass sprout on the island
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(x + 18, y + 26, 4, 3);
            ctx.fillRect(x + 20, y + 23, 2, 3);
        }
    }

    /**
     * Draws 2.5D styled cartoon wall/rock barrier with beveling.
     */
    drawWallTile(ctx, x, y, c, r) {
        // Deep soil/stone base
        ctx.fillStyle = COLORS.soilDark;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Top face block
        ctx.fillStyle = COLORS.soil;
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 6);

        // Light top highlight
        ctx.fillStyle = COLORS.soilLight;
        ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, 4);

        // Brick/stone groove detail
        ctx.fillStyle = COLORS.soilDark;
        ctx.fillRect(x + 4, y + 16, TILE_SIZE - 8, 2);
        const hash = ((c * 17) ^ (r * 43)) % 2;
        if (hash === 0) {
            ctx.fillRect(x + 18, y + 4, 2, 12);
        } else {
            ctx.fillRect(x + 12, y + 18, 2, 14);
        }
    }

    /**
     * Draws sharp metal spike hazard with warning telegraphs.
     */
    drawSpikeTrap(ctx, x, y, spike) {
        // Trap base plate (grate)
        ctx.fillStyle = '#4A4E69';
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

        ctx.fillStyle = '#22223B';
        ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);

        if (spike.state === 'down') {
            // Hole holes visible
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(x + 13, y + 13, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 27, y + 13, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 27, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (spike.state === 'warning') {
            // Gleaming tips poking out (warning the player!)
            ctx.fillStyle = COLORS.dangerRed;
            ctx.beginPath();
            ctx.arc(x + 13, y + 13, 3, 0, Math.PI * 2);
            ctx.arc(x + 27, y + 13, 3, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 27, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (spike.state === 'up') {
            // Lethal extended spikes drawn as sharp metallic triangles
            const spikePositions = [
                { bx: x + 8, by: y + 22, tx: x + 14, ty: y + 6, rx: x + 20, ry: y + 22 },
                { bx: x + 20, by: y + 22, tx: x + 26, ty: y + 6, rx: x + 32, ry: y + 22 },
                { bx: x + 14, by: y + 34, tx: x + 20, ty: y + 18, rx: x + 26, ry: y + 34 }
            ];

            spikePositions.forEach(sp => {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.moveTo(sp.bx + 2, sp.by + 2);
                ctx.lineTo(sp.tx + 4, sp.ty + 2);
                ctx.lineTo(sp.rx + 2, sp.ry + 2);
                ctx.fill();

                // Blade body (metallic silver)
                ctx.fillStyle = '#E0E1DD';
                ctx.beginPath();
                ctx.moveTo(sp.bx, sp.by);
                ctx.lineTo(sp.tx, sp.ty);
                ctx.lineTo(sp.rx, sp.ry);
                ctx.closePath();
                ctx.fill();

                // Blade highlight edge
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sp.bx + 1, sp.by);
                ctx.lineTo(sp.tx, sp.ty);
                ctx.stroke();

                // Blood/Danger tip
                ctx.fillStyle = COLORS.dangerRed;
                ctx.beginPath();
                ctx.moveTo(sp.tx - 2, sp.ty + 4);
                ctx.lineTo(sp.tx, sp.ty);
                ctx.lineTo(sp.tx + 2, sp.ty + 4);
                ctx.fill();
            });
        }
    }

    /**
     * Draws the Exit Door (locked iron door vs open magical portal).
     */
    drawExitDoor(ctx, x, y, door) {
        if (!door.unlocked) {
            // Locked wooden reinforced door
            ctx.fillStyle = '#4A2810';
            ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);

            // Iron bands
            ctx.fillStyle = '#3D405B';
            ctx.fillRect(x + 3, y + 8, TILE_SIZE - 6, 4);
            ctx.fillRect(x + 3, y + 24, TILE_SIZE - 6, 4);

            // Big padlock icon
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        } else {
            // Unlocked glowing exit gate
            ctx.fillStyle = '#1D3557';
            ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);

            // Pulsing portal light inside
            const pulse = 0.6 + 0.4 * Math.sin(this.animTime * 5);
            ctx.fillStyle = `rgba(72, 202, 228, ${pulse})`;
            ctx.fillRect(x + 6, y + 5, TILE_SIZE - 12, TILE_SIZE - 10);

            // Open door emoji / glowing stars
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚪', x + TILE_SIZE / 2, y + TILE_SIZE / 2);

            // Sparkle halo
            ctx.strokeStyle = COLORS.gold;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 1, TILE_SIZE - 4, TILE_SIZE - 2);
        }
    }

    /**
     * Draws animated 3D spinning gold coin.
     */
    drawCoin(ctx, cx, cy, coin) {
        const radius = coin.radius;
        const scaleX = Math.cos(coin.spinAngle); // -1 to 1 for 3D flip effect

        ctx.save();
        ctx.translate(cx, cy);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 8, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer rim
        ctx.fillStyle = COLORS.goldDark;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1.5, Math.abs(scaleX) * radius), radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner face
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1, Math.abs(scaleX) * (radius - 2.5)), radius - 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shiny gleam
        if (scaleX > 0.3) {
            ctx.fillStyle = COLORS.goldLight;
            ctx.beginPath();
            ctx.ellipse(-scaleX * 2, -2, Math.max(0.8, scaleX * 2), 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draws treasure chest with lid opening animation & treasure glow.
     */
    drawChest(ctx, x, y, chest) {
        const w = chest.width;
        const h = chest.height;

        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x + 2, y + h - 2, w - 4, 4);

        if (!chest.opened) {
            // Closed Wooden Chest
            // Base
            ctx.fillStyle = '#6F4E37';
            ctx.fillRect(x + 2, y + 10, w - 4, h - 10);

            // Metal reinforcement brackets
            ctx.fillStyle = COLORS.goldDark;
            ctx.fillRect(x + 2, y + 10, 5, h - 10);
            ctx.fillRect(x + w - 7, y + 10, 5, h - 10);

            // Lid
            ctx.fillStyle = '#8B5E3C';
            ctx.beginPath();
            ctx.roundRect(x, y + 2, w, 11, [4, 4, 0, 0]);
            ctx.fill();

            // Gold lock latch
            ctx.fillStyle = COLORS.gold;
            ctx.fillRect(x + w / 2 - 4, y + 8, 8, 7);
            ctx.fillStyle = '#222';
            ctx.fillRect(x + w / 2 - 1, y + 11, 2, 3);
        } else {
            // Opened Chest
            // Chest interior (dark brown)
            ctx.fillStyle = '#4A2E18';
            ctx.fillRect(x + 2, y + 12, w - 4, h - 12);

            // Glowing gold & gems inside
            ctx.fillStyle = COLORS.gold;
            ctx.beginPath();
            ctx.arc(x + 10, y + 16, 5, 0, Math.PI * 2);
            ctx.arc(x + 18, y + 14, 6, 0, Math.PI * 2);
            ctx.arc(x + 24, y + 16, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#48CAE4'; // Ruby/Gem gleam
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 3, 0, Math.PI * 2);
            ctx.fill();

            // Open lid tilted back (openProgress from 0 to 1)
            const lidOffset = chest.openProgress * 8;
            ctx.fillStyle = '#8B5E3C';
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 2 - lidOffset, w - 2, 9, [3, 3, 1, 1]);
            ctx.fill();

            ctx.fillStyle = COLORS.gold;
            ctx.fillRect(x + w / 2 - 3, y + 6 - lidOffset, 6, 3);

            // Subtle sparkle emitted
            const sparkle = Math.sin(chest.glowTimer);
            if (sparkle > 0.4) {
                ctx.fillStyle = '#FFF';
                ctx.fillRect(x + 14, y + 4, 3, 3);
            }
        }
        ctx.restore();
    }

    /**
     * Draws golden antique skeleton key with gentle bob & sparkle.
     */
    drawKey(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Key loop (head)
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(0, -6, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.sand;
        ctx.beginPath();
        ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Key stem
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(-2, 0, 4, 12);

        // Key teeth
        ctx.fillRect(1, 4, 5, 2.5);
        ctx.fillRect(1, 8, 4, 2.5);

        // Bright gleam
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-2, -8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws fantastic Astral Teleportation Portal with spiral vortex & cosmic runes.
     * Optimized for 60 FPS on low-end machines.
     */
    drawPortal(ctx, x, y, portal) {
        ctx.save();
        ctx.translate(x, y);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight outer cosmic halo (no heavy shadowBlur)
        ctx.fillStyle = 'rgba(0, 245, 212, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Dark abyss center
        ctx.fillStyle = '#0B091A';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Spiral Neon Ring 1 (Cyan)
        ctx.strokeStyle = COLORS.portalCyan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 9, this.portalAnimAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Spiral Neon Ring 2 (Purple)
        ctx.strokeStyle = COLORS.portalPurple;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 9, -this.portalAnimAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing center warp star
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(0, 0, 3 + Math.sin(this.portalAnimAngle * 2) * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Portal ID rune marker (1 or 2)
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = COLORS.portalCyan;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(portal.id, 0, -17);

        ctx.restore();
    }

    /**
     * Draws floating Magic Shield Crystal (Mystic Arcane Orb).
     * Optimized for 60 FPS.
     */
    drawShieldOrb(ctx, x, y, orb) {
        const bob = Math.sin(orb.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight cyan halo
        ctx.fillStyle = 'rgba(0, 245, 212, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Diamond gem body
        ctx.fillStyle = COLORS.portalCyan;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(9, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(-9, 0);
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#E0FBFC';
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();

        // Sparkle glint
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-2, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws Chrono Hourglass (Supernatural Time-Slow Artifact).
     * Optimized for 60 FPS.
     */
    drawChronoHourglass(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight golden halo
        ctx.fillStyle = 'rgba(255, 209, 102, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Wooden/Golden Plates (top & bottom)
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(-8, -12, 16, 3);
        ctx.fillRect(-8, 9, 16, 3);

        // Glass Bulbs (top & bottom triangles)
        ctx.fillStyle = 'rgba(72, 202, 228, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-7, -9);
        ctx.lineTo(7, -9);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-7, 9);
        ctx.lineTo(7, 9);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Magic violet sands flowing
        ctx.fillStyle = '#9D4EDD';
        ctx.beginPath();
        ctx.moveTo(-4, -8);
        ctx.lineTo(4, -8);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-5, 8);
        ctx.lineTo(5, 8);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();

        // Sand trickle
        ctx.strokeStyle = '#9D4EDD';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(0, 3);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draws Arcane Pirate Amulet (+2 Magic Fireball Ammo).
     * Optimized for 60 FPS.
     */
    drawArcaneAmulet(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight fiery halo
        ctx.fillStyle = 'rgba(255, 0, 127, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Circular Medallion base
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Inner ruby/magic core
        ctx.fillStyle = '#7209B7';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Golden Lightning / Flame emblem
        ctx.fillStyle = '#FFE17D';
        ctx.beginPath();
        ctx.moveTo(1, -7);
        ctx.lineTo(-4, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(-2, 7);
        ctx.lineTo(4, -1);
        ctx.lineTo(0, -1);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws Cosmic Gold Magnet (+15 pts & Attracts all coins for 8s).
     * 60 FPS optimized without shadowBlur.
     */
    drawMagnet(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Magnetic energy halo
        ctx.fillStyle = 'rgba(255, 201, 60, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Horseshoe magnet body (Red / Blue poles)
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';

        // U-arc curve
        ctx.strokeStyle = '#E63946';
        ctx.beginPath();
        ctx.arc(0, 2, 8, Math.PI * 0.9, Math.PI * 2.1);
        ctx.stroke();

        // Silver/Cyan pole tips
        ctx.fillStyle = '#00F5D4';
        ctx.fillRect(-10, -5, 4, 4);
        ctx.fillRect(6, -5, 4, 4);

        // Central attraction spark
        ctx.fillStyle = '#FFC93C';
        ctx.beginPath();
        ctx.arc(0, -1, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws Ethereal Invisibility Cloak (+20 pts & 6s undetected/intangible).
     * 60 FPS optimized without shadowBlur.
     */
    drawInvisibilityCloak(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ethereal purple phantom halo
        ctx.fillStyle = 'rgba(157, 78, 221, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering hood/cloak shape
        ctx.fillStyle = '#7B2CBF';
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.quadraticCurveTo(11, -8, 8, 8);
        ctx.lineTo(-8, 8);
        ctx.quadraticCurveTo(-11, -8, 0, -11);
        ctx.closePath();
        ctx.fill();

        // Inner glowing ethereal phantom eye/gem
        ctx.fillStyle = '#00F5D4';
        ctx.beginPath();
        ctx.arc(0, -1, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}



/* ==================== Module: player.js ==================== */

/**
 * Xazina Ovchisi - Player Controller & Character Physics
 * Handles smooth movement, wall sliding, invulnerability, and character rendering.
 */


class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 155; // pixels per second

        // Hitbox dimensions (smaller than 40px tile for smooth corridor navigation)
        this.width = 24;
        this.height = 24;

        this.lives = 3;
        this.maxLives = 3;
        this.hasKey = false;

        // Invulnerability after hazard damage (1.5 seconds)
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 1.5;

        // Facing direction: 'down', 'up', 'left', 'right'
        this.facing = 'down';
        this.isMoving = false;
        this.walkCycle = 0;

        // Footstep dust particle trigger
        this.stepTimer = 0;

        // === FANTASTIC SUPERNATURAL ABILITIES ===
        this.hasShield = false;        // Magic energy shield (absorbs 1 hit)
        this.magicCharges = 2;         // Magic Arcane Blast ammo
        this.maxMagicCharges = 5;
        this.frostCharges = 2;         // Frost Nova Blizzard spell ammo
        this.maxFrostCharges = 4;
        this.magnetTimer = 0;          // Cosmic Gold Magnet active timer
        this.invisibilityTimer = 0;    // Ethereal Invisibility Shroud timer
        this.dashCooldown = 0;         // Phantom Dash cooldown timer
        this.dashDuration = 0;         // Active dash time
        this.isDashing = false;
        this.dashSpeed = 440;
        this.portalCooldown = 0;       // Cooldown to prevent portal loops
        this.phantomTrails = [];       // Dash after-image shadows
        this.shieldAngle = 0;          // Rotating shield particles
        this.magnetRingAngle = 0;      // Rotating magnet particles
    }

    /**
     * Resets player position, key, and statuses for a new level or retry.
     */
    reset(x, y, resetLives = false) {
        this.x = x;
        this.y = y;
        this.hasKey = false;
        this.invulnerableTimer = 0;
        this.magnetTimer = 0;
        this.invisibilityTimer = 0;
        this.facing = 'down';
        this.isMoving = false;
        this.walkCycle = 0;
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashCooldown = 0;
        this.portalCooldown = 0;
        this.phantomTrails = [];
        if (resetLives) {
            this.lives = this.maxLives;
            this.hasShield = false;
            this.magicCharges = 2;
            this.frostCharges = 2;
        }
    }

    /**
     * Activates fantastic Phantom Dash!
     */
    triggerDash() {
        if (this.dashCooldown > 0 || this.isDashing) {
            return false;
        }
        this.isDashing = true;
        this.dashDuration = 0.20;
        this.dashCooldown = 0.85;
        return true;
    }

    /**
     * Returns the bounding box used for collision resolution.
     */
    getCollisionBox(x = this.x, y = this.y) {
        return {
            x: x - this.width / 2,
            y: y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Updates player position and handles axis-separated wall collision.
     * @param {number} dt Delta time in seconds
     * @param {object} input Directional vector { x, y }
     * @param {Level} level Current level instance
     * @param {function} onDust Particle spawn callback
     */
    update(dt, input, level, onDust) {
        // Decrease invulnerability timer
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
        }

        // Decrease fantastic timers
        if (this.magnetTimer > 0) {
            this.magnetTimer = Math.max(0, this.magnetTimer - dt);
        }
        if (this.invisibilityTimer > 0) {
            this.invisibilityTimer = Math.max(0, this.invisibilityTimer - dt);
        }
        this.magnetRingAngle = (this.magnetRingAngle + dt * 4.5) % (Math.PI * 2);

        // Decrease cooldown timers
        if (this.portalCooldown > 0) {
            this.portalCooldown = Math.max(0, this.portalCooldown - dt);
        }
        if (this.dashCooldown > 0) {
            this.dashCooldown = Math.max(0, this.dashCooldown - dt);
        }

        // Shield rotation animation
        this.shieldAngle = (this.shieldAngle + dt * 3.5) % (Math.PI * 2);

        // Update phantom trails
        for (let i = this.phantomTrails.length - 1; i >= 0; i--) {
            const tr = this.phantomTrails[i];
            tr.alpha -= dt * 4.5;
            if (tr.alpha <= 0) {
                this.phantomTrails.splice(i, 1);
            }
        }

        // Active Dash handling
        let moveSpeed = this.speed;
        if (this.isDashing) {
            this.dashDuration -= dt;
            moveSpeed = this.dashSpeed;

            // Spawn phantom trail
            this.phantomTrails.push({
                x: this.x,
                y: this.y,
                facing: this.facing,
                alpha: 0.65
            });

            if (this.dashDuration <= 0) {
                this.isDashing = false;
            }
        }

        let dirX = 0;
        let dirY = 0;

        // Check analog joystick input first
        if (input.joystickActive && (Math.abs(input.joystickX) > 0.04 || Math.abs(input.joystickY) > 0.04)) {
            dirX = input.joystickX;
            dirY = input.joystickY;
            const mag = Math.hypot(dirX, dirY);
            if (mag > 1) {
                dirX /= mag;
                dirY /= mag;
            }
        } else {
            if (input.left) dirX -= 1;
            if (input.right) dirX += 1;
            if (input.up) dirY -= 1;
            if (input.down) dirY += 1;

            // Normalize diagonal movement speed
            if (dirX !== 0 && dirY !== 0) {
                const invSqrt2 = 0.70710678;
                dirX *= invSqrt2;
                dirY *= invSqrt2;
            }
        }

        this.isMoving = (dirX !== 0 || dirY !== 0);

        if (this.isMoving) {
            // Update facing direction
            if (Math.abs(dirX) > Math.abs(dirY)) {
                this.facing = dirX > 0 ? 'right' : 'left';
            } else {
                this.facing = dirY > 0 ? 'down' : 'up';
            }

            // Animate walking bob
            this.walkCycle += dt * 10;

            // Dust particles when walking (not during dash)
            this.stepTimer += dt;
            if (this.stepTimer > 0.18 && onDust && !this.isDashing) {
                this.stepTimer = 0;
                onDust(this.x, this.y + 12);
            }

            // --- Separate X and Y Axis Movement & Collision Resolution ---
            // 1. Move along X axis
            const newX = this.x + dirX * moveSpeed * dt;
            const boxX = this.getCollisionBox(newX, this.y);
            if (!level.checkWallCollision(boxX)) {
                this.x = newX;
            }

            // 2. Move along Y axis
            const newY = this.y + dirY * moveSpeed * dt;
            const boxY = this.getCollisionBox(this.x, newY);
            if (!level.checkWallCollision(boxY)) {
                this.y = newY;
            }

            // Clamp player within level boundaries
            const halfW = this.width / 2;
            const halfH = this.height / 2;
            this.x = Math.max(halfW, Math.min(level.pixelWidth - halfW, this.x));
            this.y = Math.max(halfH, Math.min(level.pixelHeight - halfH, this.y));
        } else {
            this.walkCycle = 0;
        }
    }

    /**
     * Applies damage to player with 1.5 seconds of invulnerability.
     * Absorbed by Magic Shield if active!
     * @returns {string|boolean} 'shield' if absorbed, true if life lost, false if invulnerable
     */
    takeDamage() {
        if (this.invulnerableTimer > 0 || this.isDashing || this.invisibilityTimer > 0) {
            return false; // Immune while dashing or invisible
        }

        if (this.hasShield) {
            this.hasShield = false;
            this.invulnerableTimer = 1.2;
            return 'shield';
        }

        this.lives = Math.max(0, this.lives - 1);
        this.invulnerableTimer = this.invulnerableDuration;
        return true;
    }

    /**
     * Renders the cute cartoon adventurer player.
     * Includes blinking effect during invulnerability.
     */
    render(ctx, camera) {
        const renderX = Math.round(this.x - camera.x);
        const renderY = Math.round(this.y - camera.y);

        // Blinking effect during invulnerability (10 Hz blink)
        if (this.invulnerableTimer > 0) {
            const blinkPhase = Math.floor(this.invulnerableTimer * 12) % 2;
            if (blinkPhase === 1) {
                return; // Skip rendering frame to produce blink
            }
        }

        ctx.save();
        ctx.translate(renderX, renderY);

        // Ethereal Invisibility Shroud transparency
        if (this.invisibilityTimer > 0) {
            ctx.globalAlpha = 0.45;
        }

        // Swirling Cosmic Magnet Rings
        if (this.magnetTimer > 0) {
            ctx.strokeStyle = 'rgba(255, 201, 60, 0.75)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 22, this.magnetRingAngle, this.magnetRingAngle + Math.PI * 1.4);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(157, 78, 221, 0.75)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 18, -this.magnetRingAngle, -this.magnetRingAngle + Math.PI * 1.4);
            ctx.stroke();
        }

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Walking bob offset
        const bob = this.isMoving ? Math.sin(this.walkCycle) * 2 : 0;
        const tilt = this.isMoving ? Math.cos(this.walkCycle) * 0.08 : 0;

        ctx.rotate(tilt);

        // Feet (animated alternate steps)
        if (this.isMoving) {
            const footOffset = Math.sin(this.walkCycle) * 4;
            ctx.fillStyle = '#4A2810';
            ctx.fillRect(-7, 10 + footOffset, 5, 4);
            ctx.fillRect(2, 10 - footOffset, 5, 4);
        } else {
            ctx.fillStyle = '#4A2810';
            ctx.fillRect(-7, 11, 5, 4);
            ctx.fillRect(2, 11, 5, 4);
        }

        // Body / Shirt (bright adventurer teal/blue)
        ctx.fillStyle = '#2A9D8F';
        ctx.beginPath();
        ctx.roundRect(-9, -2 + bob, 18, 14, 4);
        ctx.fill();

        // Leather belt
        ctx.fillStyle = '#674226';
        ctx.fillRect(-9, 7 + bob, 18, 3);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(-2, 7 + bob, 4, 3);

        // Backpack on back/side
        ctx.fillStyle = '#8B5E3C';
        if (this.facing === 'left') {
            ctx.fillRect(5, 0 + bob, 5, 9);
        } else if (this.facing === 'right') {
            ctx.fillRect(-10, 0 + bob, 5, 9);
        } else if (this.facing === 'up') {
            ctx.fillRect(-6, 0 + bob, 12, 9);
        }

        // Head (warm peach skin)
        ctx.fillStyle = '#F8D2B0';
        ctx.beginPath();
        ctx.arc(0, -7 + bob, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Adventurer Straw / Safari Hat
        ctx.fillStyle = '#E4BF72';
        ctx.beginPath();
        ctx.ellipse(0, -11 + bob, 14, 5, 0, 0, Math.PI * 2); // Hat brim
        ctx.fill();

        ctx.fillStyle = '#C89D42';
        ctx.beginPath();
        ctx.ellipse(0, -13 + bob, 8, 5, 0, 0, Math.PI * 2); // Hat dome
        ctx.fill();

        // Hat ribbon band
        ctx.fillStyle = COLORS.dangerRed;
        ctx.fillRect(-7, -13 + bob, 14, 2);

        // Eyes (drawn based on facing direction)
        if (this.facing !== 'up') {
            ctx.fillStyle = '#222';
            let eyeX1 = -3.5;
            let eyeX2 = 3.5;

            if (this.facing === 'left') {
                eyeX1 = -6;
                eyeX2 = -2;
            } else if (this.facing === 'right') {
                eyeX1 = 2;
                eyeX2 = 6;
            }

            ctx.beginPath();
            ctx.arc(eyeX1, -6 + bob, 1.5, 0, Math.PI * 2);
            ctx.arc(eyeX2, -6 + bob, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Rosy cheeks
            ctx.fillStyle = 'rgba(230, 57, 70, 0.4)';
            ctx.beginPath();
            ctx.arc(eyeX1, -4 + bob, 1.5, 0, Math.PI * 2);
            ctx.arc(eyeX2, -4 + bob, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // ================= FANTASTIC MAGIC SHIELD RENDERING (OPTIMIZED) =================
        if (this.hasShield) {
            ctx.save();
            // Outer lightweight aura halo
            ctx.fillStyle = 'rgba(0, 245, 212, 0.22)';
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#00F5D4';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 21, 0, Math.PI * 2);
            ctx.stroke();

            // Shimmering shield dome
            ctx.fillStyle = 'rgba(0, 245, 212, 0.16)';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // 3 Orbiting Mystic Runes / Crystal Orbs
            for (let i = 0; i < 3; i++) {
                const angle = this.shieldAngle + (i * Math.PI * 2) / 3;
                const ox = Math.cos(angle) * 21;
                const oy = Math.sin(angle) * 21;

                ctx.fillStyle = '#9D4EDD';
                ctx.beginPath();
                ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#E0FBFC';
                ctx.beginPath();
                ctx.arc(ox, oy, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.restore();

        // ================= DRAW PHANTOM DASH AFTER-IMAGES (OPTIMIZED) =================
        if (this.phantomTrails.length > 0) {
            this.phantomTrails.forEach(tr => {
                ctx.save();
                ctx.translate(Math.round(tr.x - camera.x), Math.round(tr.y - camera.y));
                ctx.globalAlpha = tr.alpha * 0.7;

                ctx.fillStyle = '#7B2CBF';
                ctx.beginPath();
                ctx.arc(0, 0, 13, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#00F5D4';
                ctx.beginPath();
                ctx.arc(0, -3, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });
        }
    }
}



/* ==================== Module: enemy.js ==================== */

/**
 * Xazina Ovchisi - Pirate Enemy AI & Character Physics
 * Features:
 * - Dynamic AI: Patrol -> Detect Player -> Alert Emote (!) -> Chase mode
 * - Return to Patrol with Lost Emote (?) when player escapes
 * - Highly optimized rendering without heavy shadowBlur for 60 FPS on low-end PCs
 * - Fantastic Ghost Pirate ethereal variant
 */


class Enemy {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.homeX = config.x;
        this.homeY = config.y;
        this.axis = config.axis || 'horizontal';
        this.minCoord = config.minCoord;
        this.maxCoord = config.maxCoord;
        this.speed = config.speed || 75;
        this.isGhost = config.isGhost || false;
        this.alive = true;

        // Direction: +1 (right/down) or -1 (left/up)
        this.direction = 1;

        // Hitbox dimensions
        this.width = 24;
        this.height = 24;

        // AI States: 'patrol', 'chase', 'lost'
        this.state = 'patrol';
        this.detectionRadius = this.isGhost ? 95 : (config.detectionRadius || 100);
        this.chaseSpeedMultiplier = this.isGhost ? 1.15 : 1.20; // Realistic running speed (not hyperspeed)
        this.alertTimer = 0;
        this.reactionTimer = 0;
        this.lostTimer = 0;
        this.spottedSoundPlayed = false;
        this.frozenTimer = 0; // Frozen by Frost Nova spell

        this.walkCycle = Math.random() * Math.PI * 2;
        this.ghostGlowTimer = Math.random() * Math.PI * 2;
    }

    /**
     * Updates enemy patrol / chase AI.
     * @param {number} dt Delta time
     * @param {Player} player Player instance
     * @param {Level} level Current level map
     * @param {number} speedMultiplier Multiplier for slow-motion effect
     * @param {function} onSpotPlayer Callback when player is detected
     */
    update(dt, player, level, speedMultiplier = 1, onSpotPlayer = null) {
        if (!this.alive) return;

        // Frozen status by Frost Nova spell
        if (this.frozenTimer > 0) {
            this.frozenTimer = Math.max(0, this.frozenTimer - dt);
            return; // Completely frozen in ice block, cannot move
        }

        const effectiveDt = dt * speedMultiplier;
        this.walkCycle += effectiveDt * 8;
        this.ghostGlowTimer += dt * 4;

        if (this.alertTimer > 0) {
            this.alertTimer = Math.max(0, this.alertTimer - dt);
        }

        // Distance to player (if player is invisible, cannot be seen)
        let distToPlayer = 999999;
        if (player && (!player.invisibilityTimer || player.invisibilityTimer <= 0)) {
            distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
        } else if (this.state === 'chase') {
            // Player vanished into thin air!
            this.state = 'lost';
            this.lostTimer = 0.9;
            this.spottedSoundPlayed = false;
        }

        // --- AI State Transition ---
        if (player && player.lives > 0 && distToPlayer < this.detectionRadius) {
            if (this.state !== 'chase') {
                this.state = 'chase';
                this.alertTimer = 1.0;
                this.reactionTimer = 0.45; // 0.45s human reaction pause when spotting player
                if (!this.spottedSoundPlayed) {
                    this.spottedSoundPlayed = true;
                    if (onSpotPlayer) onSpotPlayer(this);
                }
            }
        } else if (this.state === 'chase' && distToPlayer > this.detectionRadius * 1.35) {
            // Player escaped out of sight
            this.state = 'lost';
            this.lostTimer = 0.9;
            this.spottedSoundPlayed = false;
        }

        // --- Execute Movement based on AI State ---
        if (this.state === 'chase' && player) {
            // Natural human reaction pause before charging
            if (this.reactionTimer > 0) {
                this.reactionTimer -= dt;
                return;
            }

            // Chase Player with wall sliding
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            const len = Math.hypot(dx, dy);

            if (len > 2) {
                dx /= len;
                dy /= len;

                this.direction = (dx >= 0) ? 1 : -1;
                const chaseStep = this.speed * this.chaseSpeedMultiplier * effectiveDt;

                if (this.isGhost) {
                    // Ghost glides smoothly towards player
                    this.x += dx * chaseStep;
                    this.y += dy * chaseStep;
                } else if (level) {
                    // Physical pirate: Axis-separated wall collision
                    const nextX = this.x + dx * chaseStep;
                    const boxX = { x: nextX - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
                    if (!level.checkWallCollision(boxX)) {
                        this.x = nextX;
                    }

                    const nextY = this.y + dy * chaseStep;
                    const boxY = { x: this.x - this.width / 2, y: nextY - this.height / 2, width: this.width, height: this.height };
                    if (!level.checkWallCollision(boxY)) {
                        this.y = nextY;
                    }
                }
            }
        } else if (this.state === 'lost') {
            // Confused pause before resuming patrol
            this.lostTimer -= dt;
            if (this.lostTimer <= 0) {
                this.state = 'patrol';
            }
        } else {
            // Standard Corridor Patrol Movement
            const moveStep = this.direction * this.speed * effectiveDt;

            if (this.axis === 'horizontal') {
                this.x += moveStep;
                if (this.direction > 0 && this.x >= this.maxCoord) {
                    this.x = this.maxCoord;
                    this.direction = -1;
                } else if (this.direction < 0 && this.x <= this.minCoord) {
                    this.x = this.minCoord;
                    this.direction = 1;
                }
            } else {
                this.y += moveStep;
                if (this.direction > 0 && this.y >= this.maxCoord) {
                    this.y = this.maxCoord;
                    this.direction = -1;
                } else if (this.direction < 0 && this.y <= this.minCoord) {
                    this.y = this.minCoord;
                    this.direction = 1;
                }
            }
        }
    }

    /**
     * Returns bounding box for player overlap checking.
     */
    getHitbox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Checks AABB collision with player.
     */
    checkCollision(player) {
        if (!this.alive) return false;
        if (this.frozenTimer > 0) return false; // Frozen enemies cannot harm player
        if (player.invisibilityTimer > 0) return false; // Invisible player cannot be touched

        const pBox = player.getCollisionBox();
        const eBox = this.getHitbox();

        return (
            pBox.x < eBox.x + eBox.width &&
            pBox.x + pBox.width > eBox.x &&
            pBox.y < eBox.y + eBox.height &&
            pBox.y + pBox.height > eBox.y
        );
    }

    /**
     * Highly optimized rendering for 60 FPS on low-end machines.
     * Uses lightweight alpha layers instead of heavy Gaussian blur filters.
     */
    render(ctx, camera) {
        if (!this.alive) return;

        const renderX = Math.round(this.x - camera.x);
        const renderY = Math.round(this.y - camera.y);

        ctx.save();
        ctx.translate(renderX, renderY);

        // --- Alert / Emote Indicators above head ---
        if (this.state === 'chase' || this.alertTimer > 0) {
            // Red "!" detection bubble
            ctx.fillStyle = '#E63946';
            ctx.beginPath();
            ctx.arc(0, -26, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.fillRect(-1.5, -30, 3, 5);
            ctx.fillRect(-1.5, -23, 3, 2.5);
        } else if (this.state === 'lost') {
            // Yellow "?" confused bubble
            ctx.fillStyle = '#FFC93C';
            ctx.beginPath();
            ctx.arc(0, -26, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1D3557';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 0, -26);
        }

        if (this.isGhost) {
            // ================= GHOST PIRATE (OPTIMIZED) =================
            if (this.direction < 0) {
                ctx.scale(-1, 1);
            }

            const floatBob = Math.sin(this.walkCycle) * 3;
            ctx.translate(0, floatBob);

            // Lightweight ambient halo (no shadowBlur lag)
            ctx.fillStyle = 'rgba(0, 245, 212, 0.18)';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.85;

            // Ghost mist tail
            ctx.fillStyle = '#00F5D4';
            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.quadraticCurveTo(-11, 16, 0, 15);
            ctx.quadraticCurveTo(11, 16, 8, 8);
            ctx.closePath();
            ctx.fill();

            // Robe
            ctx.fillStyle = '#103947';
            ctx.beginPath();
            ctx.roundRect(-9, -2, 18, 14, 4);
            ctx.fill();

            // Belt
            ctx.fillStyle = '#7B2CBF';
            ctx.fillRect(-9, 6, 18, 3);

            // Cutlass
            ctx.fillStyle = '#48CAE4';
            ctx.fillRect(7, 3, 3, 10);

            // Skull Head
            ctx.fillStyle = '#E0FBFC';
            ctx.beginPath();
            ctx.arc(0, -7, 8.5, 0, Math.PI * 2);
            ctx.fill();

            // Tricorn Hat
            ctx.fillStyle = '#240046';
            ctx.beginPath();
            ctx.roundRect(-11, -15, 22, 9, [6, 6, 0, 0]);
            ctx.fill();

            // Glowing Piercing Eyes
            ctx.fillStyle = '#00F5D4';
            ctx.beginPath();
            ctx.arc(-3.5, -7, 2, 0, Math.PI * 2);
            ctx.arc(3.5, -7, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            return;
        }

        // ================= REGULAR CARTOON PIRATE (OPTIMIZED) =================
        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Facing flip
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }

        const bob = Math.sin(this.walkCycle) * 2;
        const tilt = Math.cos(this.walkCycle) * 0.08;
        ctx.rotate(tilt);

        // Boots
        const footOffset = Math.sin(this.walkCycle) * 3;
        ctx.fillStyle = '#1D1E2C';
        ctx.fillRect(-7, 10 + footOffset, 5, 4);
        ctx.fillRect(2, 10 - footOffset, 5, 4);

        // Pirate Coat
        ctx.fillStyle = (this.state === 'chase') ? '#780000' : '#1D3557';
        ctx.beginPath();
        ctx.roundRect(-9, -2 + bob, 18, 14, 3);
        ctx.fill();

        // Belt & Buckle
        ctx.fillStyle = COLORS.dangerRed;
        ctx.fillRect(-9, 6 + bob, 18, 3.5);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(-2, 6 + bob, 4, 3.5);

        // Cutlass on side
        ctx.fillStyle = '#A8DADC';
        ctx.fillRect(7, 4 + bob, 4, 8);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(6, 3 + bob, 6, 2);

        // Face / Head
        ctx.fillStyle = '#E8BE96';
        ctx.beginPath();
        ctx.arc(0, -7 + bob, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Bandana
        ctx.fillStyle = COLORS.dangerRed;
        ctx.beginPath();
        ctx.roundRect(-10, -14 + bob, 20, 8, [5, 5, 0, 0]);
        ctx.fill();

        // Bandana knot
        ctx.fillStyle = '#C1121F';
        ctx.beginPath();
        ctx.moveTo(-9, -9 + bob);
        ctx.lineTo(-14, -5 + bob);
        ctx.lineTo(-11, -3 + bob);
        ctx.closePath();
        ctx.fill();

        // Skull pin
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(0, -11 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eye Patch
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-8, -10 + bob);
        ctx.lineTo(8, -4 + bob);
        ctx.stroke();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-3, -7 + bob, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Good Eye (angry red pupil when chasing!)
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(3.5, -7 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = (this.state === 'chase') ? '#E63946' : '#111';
        ctx.beginPath();
        ctx.arc(4, -7 + bob, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Mustache
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(1, -3 + bob, 2.5, 0, Math.PI);
        ctx.fill();

        // Fantastic Frost Nova Ice Prison
        if (this.frozenTimer > 0) {
            // Translucent cyan crystalline ice block
            ctx.fillStyle = 'rgba(0, 245, 212, 0.45)';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.fillRect(-16, -20, 32, 34);
            ctx.strokeRect(-16, -20, 32, 34);

            // Ice specular sparkle highlights
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(-12, -16);
            ctx.lineTo(-4, -16);
            ctx.lineTo(-12, -8);
            ctx.closePath();
            ctx.fill();

            // Floating ice badge
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧊', 0, -25);
        }

        ctx.restore();
    }
}


/* ==================== Module: quiz.js ==================== */

/**
 * Xazina Ovchisi - Revive Quiz System (Matematika, Ingliz tili, Geografiya)
 * Gives defeated players an educational second chance to revive with +1 heart!
 */

const QUIZ_CATEGORIES = {
    MATH: {
        id: 'math',
        name: 'Matematika',
        icon: '🔢',
        badgeClass: 'category-math'
    },
    ENGLISH: {
        id: 'english',
        name: 'Ingliz tili',
        icon: '🇬🇧',
        badgeClass: 'category-english'
    },
    GEOGRAPHY: {
        id: 'geography',
        name: 'Geografiya',
        icon: '🌍',
        badgeClass: 'category-geography'
    }
};

const QUIZ_QUESTIONS = {
    math: [
        { q: "7 + 8 = ?", correct: "15", options: ["14", "15", "16", "17"] },
        { q: "10 - 4 = ?", correct: "6", options: ["5", "6", "7", "4"] },
        { q: "3 × 4 = ?", correct: "12", options: ["10", "11", "12", "14"] },
        { q: "9 + 9 = ?", correct: "18", options: ["17", "18", "19", "20"] },
        { q: "20 - 7 = ?", correct: "13", options: ["12", "13", "14", "15"] },
        { q: "5 × 5 = ?", correct: "25", options: ["20", "24", "25", "30"] },
        { q: "16 ÷ 4 = ?", correct: "4", options: ["3", "4", "5", "8"] },
        { q: "15 + 15 = ?", correct: "30", options: ["25", "28", "30", "35"] },
        { q: "6 × 3 = ?", correct: "18", options: ["16", "18", "21", "24"] },
        { q: "50 - 20 = ?", correct: "30", options: ["20", "25", "30", "35"] },
        { q: "4 × 6 = ?", correct: "24", options: ["20", "22", "24", "28"] },
        { q: "18 ÷ 2 = ?", correct: "9", options: ["7", "8", "9", "10"] },
        { q: "12 + 8 = ?", correct: "20", options: ["19", "20", "21", "22"] },
        { q: "2 × 9 = ?", correct: "18", options: ["16", "17", "18", "20"] },
        { q: "100 - 40 = ?", correct: "60", options: ["50", "60", "70", "40"] },
        { q: "8 × 5 = ?", correct: "40", options: ["35", "40", "45", "50"] },
        { q: "25 + 25 = ?", correct: "50", options: ["40", "45", "50", "55"] },
        { q: "14 - 8 = ?", correct: "6", options: ["5", "6", "7", "8"] },
        { q: "7 × 2 = ?", correct: "14", options: ["12", "13", "14", "16"] },
        { q: "30 ÷ 5 = ?", correct: "6", options: ["4", "5", "6", "7"] }
    ],
    english: [
        { q: "'Olma' so'zining inglizchasi nima?", correct: "Apple", options: ["Apple", "Banana", "Orange", "Grape"] },
        { q: "'Kitob' so'zining inglizchasi nima?", correct: "Book", options: ["Pen", "Book", "Bag", "Desk"] },
        { q: "'Quyosh' so'zining inglizchasi nima?", correct: "Sun", options: ["Moon", "Star", "Sun", "Sky"] },
        { q: "'Suv' so'zining inglizchasi nima?", correct: "Water", options: ["Milk", "Tea", "Juice", "Water"] },
        { q: "'Mushuk' so'zining inglizchasi nima?", correct: "Cat", options: ["Dog", "Cat", "Bird", "Fish"] },
        { q: "'It' (kuchuk) so'zining inglizchasi nima?", correct: "Dog", options: ["Cat", "Dog", "Fox", "Bear"] },
        { q: "'Maktab' so'zining inglizchasi nima?", correct: "School", options: ["House", "Park", "School", "Shop"] },
        { q: "'Do'st' so'zining inglizchasi nima?", correct: "Friend", options: ["Brother", "Friend", "Family", "Teacher"] },
        { q: "'Qizil' rangining inglizchasi nima?", correct: "Red", options: ["Blue", "Green", "Yellow", "Red"] },
        { q: "'Yashil' rangining inglizchasi nima?", correct: "Green", options: ["Green", "Black", "White", "Pink"] },
        { q: "'Moviy' (ko'k) rangining inglizchasi nima?", correct: "Blue", options: ["Red", "Blue", "Brown", "Orange"] },
        { q: "'Rahmat' ingliz tilida qanday bo'ladi?", correct: "Thank you", options: ["Hello", "Goodbye", "Thank you", "Please"] },
        { q: "'Salom' ingliz tilida qanday bo'ladi?", correct: "Hello", options: ["Hello", "Bye", "Good night", "Sorry"] },
        { q: "'Katta' so'zining inglizchasi nima?", correct: "Big", options: ["Small", "Big", "Fast", "Little"] },
        { q: "'Kichik' so'zining inglizchasi nima?", correct: "Small", options: ["Big", "Small", "Tall", "Long"] },
        { q: "'Qalam' so'zining inglizchasi nima?", correct: "Pencil", options: ["Pencil", "Eraser", "Ruler", "Book"] },
        { q: "'Oila' so'zining inglizchasi nima?", correct: "Family", options: ["Friend", "Family", "People", "Child"] },
        { q: "'Xayr' so'zining inglizchasi nima?", correct: "Goodbye", options: ["Welcome", "Sorry", "Goodbye", "Good morning"] },
        { q: "'Besh' soni inglizcha qanday bo'ladi?", correct: "Five", options: ["Four", "Five", "Six", "Seven"] },
        { q: "'Dengiz' so'zining inglizchasi nima?", correct: "Sea", options: ["Sea", "River", "Lake", "Mountain"] }
    ],
    geography: [
        { q: "O'zbekistonning poytaxti qaysi shahar?", correct: "Toshkent", options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"] },
        { q: "Dunyoning eng katta okeani qaysi?", correct: "Tinch okeani", options: ["Atlantika okeani", "Tinch okeani", "Hind okeani", "Shimoliy Muz okeani"] },
        { q: "Samarqanddagi mashhur tarixiy maydon qaysi?", correct: "Registon", options: ["Registon", "Qizil maydon", "Eyfel maydoni", "Toj Mahal"] },
        { q: "Fransiyaning poytaxti qaysi shahar?", correct: "Parij", options: ["London", "Rim", "Berlin", "Parij"] },
        { q: "Yer sayyorasida nechta qit'a bor?", correct: "6 ta", options: ["4 ta", "5 ta", "6 ta", "8 ta"] },
        { q: "O'zbekistonda nechta viloyat bor (Qoraqalpog'iston Respublikasidan tashqari)?", correct: "12 ta", options: ["10 ta", "12 ta", "14 ta", "16 ta"] },
        { q: "Dunyoning eng baland tog' cho'qqisi qaysi?", correct: "Everest", options: ["Elbrus", "Everest", "Monblan", "Kilimanjaro"] },
        { q: "Qadimiy Buxoro shahrining mashhur minorasi qaysi?", correct: "Kalon minorasi", options: ["Kalon minorasi", "Eyfel minorasi", "Piza minorasi", "Qutb minorasi"] },
        { q: "Amudaryo va Sirdaryo qaysi dengizga quyilgan?", correct: "Orol dengizi", options: ["Kaspiy dengizi", "Qora dengiz", "Orol dengizi", "Baykal"] },
        { q: "Italiyaning poytaxti qaysi shahar?", correct: "Rim", options: ["Milan", "Venetsiya", "Rim", "Florensiya"] },
        { q: "Quyosh sistemasida Quyoshga eng yaqin sayyora qaysi?", correct: "Merkuriy", options: ["Venera", "Merkuriy", "Mars", "Yer"] },
        { q: "Misr davlatidagi eng mashhur qadimiy obidalar nima?", correct: "Piramidalar", options: ["Piramidalar", "Kolizey", "Buyuk Xitoy devori", "Big Ben"] },
        { q: "O'zbekiston qaysi qit'ada joylashgan?", correct: "Osiyo", options: ["Yevropa", "Osiyo", "Afrika", "Amerika"] },
        { q: "Yaponiyaning poytaxti qaysi shahar?", correct: "Tokio", options: ["Kioto", "Seul", "Pekin", "Tokio"] },
        { q: "Yer yuzidagi eng sovuq qit'a qaysi?", correct: "Antarktida", options: ["Afrika", "Avstraliya", "Antarktida", "Janubiy Amerika"] },
        { q: "Ichan Qal'a qaysi qadimiy shaharda joylashgan?", correct: "Xiva", options: ["Qarshi", "Termiz", "Xiva", "Qo'qon"] },
        { q: "Rossiyaning poytaxti qaysi shahar?", correct: "Moskva", options: ["Sankt-Peterburg", "Moskva", "Qozon", "Sochi"] },
        { q: "Buyuk Britaniyaning poytaxti qaysi shahar?", correct: "London", options: ["London", "Parij", "Liverpul", "Dublin"] }
    ]
};

class QuizManager {
    constructor() {
        this.categoryKeys = ['math', 'english', 'geography'];
        this.lastCategoryIndex = 0;
        this.recentQuestionIndices = {
            math: [],
            english: [],
            geography: []
        };
    }

    /**
     * Generates a fresh dynamic math question for endless variety.
     */
    generateDynamicMathQuestion() {
        const types = ['add', 'sub', 'mul'];
        const type = types[Math.floor(Math.random() * types.length)];
        let a, b, ans, op;

        if (type === 'add') {
            a = Math.floor(Math.random() * 18) + 4;
            b = Math.floor(Math.random() * 18) + 3;
            ans = a + b;
            op = '+';
        } else if (type === 'sub') {
            b = Math.floor(Math.random() * 12) + 3;
            ans = Math.floor(Math.random() * 15) + 2;
            a = ans + b;
            op = '-';
        } else {
            a = Math.floor(Math.random() * 8) + 2;
            b = Math.floor(Math.random() * 7) + 2;
            ans = a * b;
            op = '×';
        }

        // Generate 3 plausible distractors
        const set = new Set([ans]);
        const offsets = [-2, -1, 1, 2, 3, -3, 10, -10];
        while (set.size < 4) {
            const off = offsets[Math.floor(Math.random() * offsets.length)];
            const val = ans + off;
            if (val > 0 && val !== ans) {
                set.add(val);
            }
        }

        const options = Array.from(set).map(String);
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return {
            q: `${a} ${op} ${b} = ?`,
            correct: String(ans),
            options
        };
    }

    /**
     * Retrieves a random question from math, english or geography.
     */
    getRandomQuestion() {
        // Rotate categories fairly: math -> english -> geography
        const catKey = this.categoryKeys[this.lastCategoryIndex % this.categoryKeys.length];
        this.lastCategoryIndex++;

        const categoryInfo = QUIZ_CATEGORIES[catKey.toUpperCase()];

        // 35% chance of dynamic math for infinite freshness
        if (catKey === 'math' && Math.random() < 0.35) {
            const dynamicQ = this.generateDynamicMathQuestion();
            return {
                category: categoryInfo,
                ...dynamicQ
            };
        }

        const bank = QUIZ_QUESTIONS[catKey];
        const recent = this.recentQuestionIndices[catKey];

        // Pick index not recently used
        let idx = Math.floor(Math.random() * bank.length);
        if (recent.includes(idx) && bank.length > 5) {
            idx = Math.floor(Math.random() * bank.length);
        }
        recent.push(idx);
        if (recent.length > 6) recent.shift();

        const item = bank[idx];

        // Shuffle options
        const shuffled = [...item.options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return {
            category: categoryInfo,
            q: item.q,
            correct: item.correct,
            options: shuffled
        };
    }
}


/* ==================== Module: ui.js ==================== */

/**
 * Xazina Ovchisi - UI, HUD, Screens, Overlays & Particle System
 * Manages menus, overlays, floating score popups, and high scores.
 */


class UIController {
    constructor() {
        // High score management in localStorage
        this.highScoreKey = 'xazina_ovchisi_highscore';
        this.highScore = parseInt(localStorage.getItem(this.highScoreKey) || '0', 10);

        // Floating text notifications (+10, +50, damage, key)
        this.floatingTexts = [];

        // Visual particle effects (dust, sparkles, stars)
        this.particles = [];

        // Cache DOM elements
        this.dom = {
            // HUD
            hudContainer: document.getElementById('hud'),
            hudHearts: document.getElementById('hud-hearts'),
            hudScore: document.getElementById('hud-score'),
            hudLevel: document.getElementById('hud-level'),
            hudKey: document.getElementById('hud-key'),
            hudShield: document.getElementById('hud-shield'),
            hudShieldContainer: document.getElementById('hud-shield-container'),
            hudMagic: document.getElementById('hud-magic'),
            hudMagicContainer: document.getElementById('hud-magic-container'),
            hudFrost: document.getElementById('hud-frost'),
            hudFrostContainer: document.getElementById('hud-frost-container'),
            hudMagnet: document.getElementById('hud-magnet'),
            hudMagnetContainer: document.getElementById('hud-magnet-container'),
            hudInvis: document.getElementById('hud-invis'),
            hudInvisContainer: document.getElementById('hud-invis-container'),
            hudSlowMoContainer: document.getElementById('hud-slowmo-container'),
            btnMute: document.getElementById('btn-mute'),
            btnFullscreen: document.getElementById('btn-fullscreen'),
            btnPause: document.getElementById('btn-pause'),

            // Overlays
            screenMenu: document.getElementById('screen-menu'),
            screenHowToPlay: document.getElementById('screen-how-to-play'),
            screenPause: document.getElementById('screen-pause'),
            screenLevelComplete: document.getElementById('screen-level-complete'),
            screenGameOver: document.getElementById('screen-game-over'),
            screenVictory: document.getElementById('screen-victory'),
            screenQuiz: document.getElementById('screen-quiz'),

            // Quiz elements
            quizCategoryBadge: document.getElementById('quiz-category-badge'),
            quizQuestionText: document.getElementById('quiz-question-text'),
            quizOptionsContainer: document.getElementById('quiz-options-container'),
            quizFeedback: document.getElementById('quiz-feedback'),
            btnQuizSkip: document.getElementById('btn-quiz-skip'),

            // Menu elements
            menuHighScore: document.getElementById('menu-highscore'),
            btnStart: document.getElementById('btn-start'),
            btnHowToPlay: document.getElementById('btn-how-to-play'),
            btnCloseHowToPlay: document.getElementById('btn-close-how-to-play'),

            // Pause elements
            btnResume: document.getElementById('btn-resume'),
            btnRestartLevel: document.getElementById('btn-restart-level'),
            btnPauseQuit: document.getElementById('btn-pause-quit'),

            // Level Complete elements
            levelCompleteTitle: document.getElementById('level-complete-title'),
            levelCompleteScore: document.getElementById('level-complete-score'),
            btnNextLevel: document.getElementById('btn-next-level'),

            // Game Over elements
            gameOverScore: document.getElementById('game-over-score'),
            gameOverHighScore: document.getElementById('game-over-highscore'),
            btnPlayAgain: document.getElementById('btn-play-again'),
            btnGameOverMenu: document.getElementById('btn-game-over-menu'),

            // Victory elements
            victoryScore: document.getElementById('victory-score'),
            victoryHighScore: document.getElementById('victory-highscore'),
            btnVictoryPlayAgain: document.getElementById('btn-victory-play-again'),

            // Mobile Burger Menu Drawer
            btnBurger: document.getElementById('btn-burger'),
            burgerDrawer: document.getElementById('burger-drawer'),
            btnBurgerClose: document.getElementById('btn-burger-close'),
            burgerDrawerBackdrop: document.getElementById('burger-drawer-backdrop'),
            burgerBtnResume: document.getElementById('burger-btn-resume'),
            burgerBtnMute: document.getElementById('burger-btn-mute'),
            burgerMuteIcon: document.getElementById('burger-mute-icon'),
            burgerMuteText: document.getElementById('burger-mute-text'),
            burgerBtnFullscreen: document.getElementById('burger-btn-fullscreen'),
            burgerBtnRestart: document.getElementById('burger-btn-restart'),
            burgerBtnGuide: document.getElementById('burger-btn-guide'),
            burgerBtnQuit: document.getElementById('burger-btn-quit'),
            burgerLevelDisplay: document.getElementById('burger-level-display'),
            burgerScoreDisplay: document.getElementById('burger-score-display'),

            // Virtual Touch Controls / Joystick Controller
            touchControls: document.getElementById('touch-controls'),
            btnJoystickToggle: document.getElementById('btn-joystick'),
            burgerBtnJoystick: document.getElementById('burger-btn-joystick'),
            burgerJoystickText: document.getElementById('burger-joystick-text'),
            joystickZone: document.getElementById('joystick-zone'),
            joystickBase: document.getElementById('joystick-base'),
            joystickStick: document.getElementById('joystick-stick'),
            pipN: document.querySelector('.pip-n'),
            pipS: document.querySelector('.pip-s'),
            pipE: document.querySelector('.pip-e'),
            pipW: document.querySelector('.pip-w'),
            btnTouchMagic: document.getElementById('touch-magic'),
            btnTouchFreeze: document.getElementById('touch-freeze'),
            btnTouchDash: document.getElementById('touch-dash'),
            touchMagicAmmo: document.getElementById('touch-magic-ammo'),
            touchFreezeAmmo: document.getElementById('touch-freeze-ammo')
        };

        this.updateHighScoreDisplay();
        this.updateMuteIcon();
    }

    /**
     * Gets current high score.
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Updates and saves high score if beaten.
     * @returns {boolean} True if new high score was set
     */
    checkAndUpdateHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem(this.highScoreKey, String(this.highScore));
            this.updateHighScoreDisplay();
            return true;
        }
        return false;
    }

    /**
     * Refreshes high score text in menus.
     */
    updateHighScoreDisplay() {
        if (this.dom.menuHighScore) {
            this.dom.menuHighScore.textContent = String(this.highScore);
        }
        if (this.dom.gameOverHighScore) {
            this.dom.gameOverHighScore.textContent = String(this.highScore);
        }
        if (this.dom.victoryHighScore) {
            this.dom.victoryHighScore.textContent = String(this.highScore);
        }
    }

    /**
     * Updates the sound mute button visual state (🔊 / 🔇).
     */
    updateMuteIcon() {
        const isMuted = sound.isMuted();
        if (this.dom.btnMute) {
            this.dom.btnMute.textContent = isMuted ? '🔇' : '🔊';
            this.dom.btnMute.title = isMuted ? "Ovozni yoqish" : "Ovozni o'chirish";
        }
        if (this.dom.burgerMuteIcon) {
            this.dom.burgerMuteIcon.textContent = isMuted ? '🔇' : '🔊';
        }
        if (this.dom.burgerMuteText) {
            this.dom.burgerMuteText.textContent = isMuted ? "Ovoz: O'chirilgan" : "Ovoz: Yoqilgan";
        }
    }

    /**
     * Renders HUD data (hearts, score, level index, key, magic shield, ammo, slowmo, frost, magnet, invis).
     */
    updateHUD(lives, score, currentLevelIdx, totalLevels, hasKey, hasShield = false, magicCharges = 2, isSlowMo = false, frostCharges = 2, magnetTimer = 0, invisibilityTimer = 0) {
        // Render hearts
        if (this.dom.hudHearts) {
            let hearts = '';
            for (let i = 0; i < 3; i++) {
                hearts += (i < lives) ? '❤️ ' : '🖤 ';
            }
            this.dom.hudHearts.textContent = hearts.trim();
        }

        // Render score
        if (this.dom.hudScore) {
            this.dom.hudScore.textContent = `Ball: ${score}`;
        }

        // Render level
        if (this.dom.hudLevel) {
            this.dom.hudLevel.textContent = `Bosqich: ${currentLevelIdx + 1}/${totalLevels}`;
        }

        // Render key status
        if (this.dom.hudKey) {
            if (hasKey) {
                this.dom.hudKey.classList.add('has-key');
                this.dom.hudKey.title = "Kalit yig'ilgan!";
            } else {
                this.dom.hudKey.classList.remove('has-key');
                this.dom.hudKey.title = "Kalit topilmadi";
            }
        }

        // Render Magic Shield badge
        if (this.dom.hudShield) {
            if (hasShield) {
                this.dom.hudShield.classList.remove('hud-dimmed');
                this.dom.hudShield.classList.add('hud-shield-active');
                this.dom.hudShield.title = "Sehrli Qalqon: FAOL";
            } else {
                this.dom.hudShield.classList.add('hud-dimmed');
                this.dom.hudShield.classList.remove('hud-shield-active');
                this.dom.hudShield.title = "Sehrli Qalqon yo'q";
            }
        }

        // Render Magic Fireball Ammo
        if (this.dom.hudMagic) {
            this.dom.hudMagic.textContent = `⚡ ${magicCharges}`;
            if (magicCharges > 0) {
                this.dom.hudMagic.classList.remove('hud-dimmed');
                this.dom.hudMagic.title = `Sehrli O'q: ${magicCharges} ta (F / SPACE / ⚡)`;
            } else {
                this.dom.hudMagic.classList.add('hud-dimmed');
                this.dom.hudMagic.title = "Sehrli o'q tugadi! Tumorlarni qidiring.";
            }
        }

        // Render Frost Blizzard Ammo
        if (this.dom.hudFrost) {
            this.dom.hudFrost.textContent = `❄️ ${frostCharges}`;
            if (frostCharges > 0) {
                this.dom.hudFrost.classList.remove('hud-dimmed');
                this.dom.hudFrost.title = `Muz Blizzard: ${frostCharges} ta (Q / ❄️)`;
            } else {
                this.dom.hudFrost.classList.add('hud-dimmed');
                this.dom.hudFrost.title = "Muz blizzard sehri tugadi!";
            }
        }

        // Render Cosmic Magnet Timer Badge
        if (this.dom.hudMagnetContainer) {
            if (magnetTimer > 0) {
                this.dom.hudMagnetContainer.classList.remove('hidden');
                if (this.dom.hudMagnet) {
                    this.dom.hudMagnet.textContent = `🧲 ${Math.ceil(magnetTimer)}s`;
                }
            } else {
                this.dom.hudMagnetContainer.classList.add('hidden');
            }
        }

        // Render Invisibility Cloak Timer Badge
        if (this.dom.hudInvisContainer) {
            if (invisibilityTimer > 0) {
                this.dom.hudInvisContainer.classList.remove('hidden');
                if (this.dom.hudInvis) {
                    this.dom.hudInvis.textContent = `👻 ${Math.ceil(invisibilityTimer)}s`;
                }
            } else {
                this.dom.hudInvisContainer.classList.add('hidden');
            }
        }

        // Render Slow-Motion Indicator
        if (this.dom.hudSlowMoContainer) {
            if (isSlowMo) {
                this.dom.hudSlowMoContainer.classList.remove('hidden');
            } else {
                this.dom.hudSlowMoContainer.classList.add('hidden');
            }
        }

        // Update Touch Ammo Badges
        if (this.dom.touchMagicAmmo) {
            this.dom.touchMagicAmmo.textContent = String(magicCharges);
            if (this.dom.btnTouchMagic) {
                if (magicCharges === 0) {
                    this.dom.btnTouchMagic.classList.add('hud-dimmed');
                } else {
                    this.dom.btnTouchMagic.classList.remove('hud-dimmed');
                }
            }
        }
        if (this.dom.touchFreezeAmmo) {
            this.dom.touchFreezeAmmo.textContent = String(frostCharges);
            if (this.dom.btnTouchFreeze) {
                if (frostCharges === 0) {
                    this.dom.btnTouchFreeze.classList.add('hud-dimmed');
                } else {
                    this.dom.btnTouchFreeze.classList.remove('hud-dimmed');
                }
            }
        }

        // Update Burger stats display
        if (this.dom.burgerLevelDisplay) {
            this.dom.burgerLevelDisplay.textContent = `${currentLevelIdx + 1}/${totalLevels}`;
        }
        if (this.dom.burgerScoreDisplay) {
            this.dom.burgerScoreDisplay.textContent = String(score);
        }
    }

    /**
     * Shows a given screen overlay, hiding all others.
     */
    showScreen(screenName) {
        this.closeBurgerMenu();

        const screens = [
            this.dom.screenMenu,
            this.dom.screenHowToPlay,
            this.dom.screenPause,
            this.dom.screenLevelComplete,
            this.dom.screenGameOver,
            this.dom.screenVictory,
            this.dom.screenQuiz
        ];

        screens.forEach(s => {
            if (s) s.classList.add('hidden');
        });

        if (screenName === 'menu' && this.dom.screenMenu) {
            this.dom.screenMenu.classList.remove('hidden');
            this.dom.hudContainer.classList.add('hidden');
        } else if (screenName === 'howToPlay' && this.dom.screenHowToPlay) {
            this.dom.screenHowToPlay.classList.remove('hidden');
        } else if (screenName === 'pause' && this.dom.screenPause) {
            this.dom.screenPause.classList.remove('hidden');
        } else if (screenName === 'levelComplete' && this.dom.screenLevelComplete) {
            this.dom.screenLevelComplete.classList.remove('hidden');
        } else if (screenName === 'gameOver' && this.dom.screenGameOver) {
            this.dom.screenGameOver.classList.remove('hidden');
        } else if (screenName === 'victory' && this.dom.screenVictory) {
            this.dom.screenVictory.classList.remove('hidden');
        } else if (screenName === 'quiz' && this.dom.screenQuiz) {
            this.dom.screenQuiz.classList.remove('hidden');
        } else if (screenName === 'playing') {
            // In game: show HUD
            if (this.dom.hudContainer) {
                this.dom.hudContainer.classList.remove('hidden');
            }
        }
    }

    /**
     * Renders the educational second-chance revive quiz (Math, English, Geography).
     */
    showReviveQuiz(questionData, onComplete) {
        if (!this.dom.screenQuiz) {
            onComplete(false);
            return;
        }

        // 1. Show quiz screen
        this.showScreen('quiz');

        // 2. Set Category Badge
        const badge = this.dom.quizCategoryBadge;
        if (badge && questionData.category) {
            badge.className = `quiz-badge ${questionData.category.badgeClass || ''}`;
            badge.textContent = `${questionData.category.icon} ${questionData.category.name}`;
        }

        // 3. Set Question Text
        if (this.dom.quizQuestionText) {
            this.dom.quizQuestionText.textContent = questionData.q;
        }

        // 4. Clear and hide feedback
        if (this.dom.quizFeedback) {
            this.dom.quizFeedback.className = 'quiz-feedback hidden';
            this.dom.quizFeedback.textContent = '';
        }

        // 5. Build Options Grid
        const container = this.dom.quizOptionsContainer;
        if (!container) return;
        container.innerHTML = '';

        const letters = ['A', 'B', 'C', 'D'];
        let hasAnswered = false;

        questionData.options.forEach((optText, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerHTML = `<span class="quiz-option-prefix">${letters[idx]}</span> <span>${optText}</span>`;

            btn.addEventListener('click', () => {
                if (hasAnswered) return;
                hasAnswered = true;

                // Disable all option buttons
                const allButtons = container.querySelectorAll('.quiz-option-btn');
                allButtons.forEach(b => b.disabled = true);
                if (this.dom.btnQuizSkip) this.dom.btnQuizSkip.disabled = true;

                const isCorrect = (String(optText).trim().toLowerCase() === String(questionData.correct).trim().toLowerCase());

                if (isCorrect) {
                    btn.classList.add('correct');
                    sound.playTone(523, 784, 0.2, 'triangle', 0.25);
                    if (this.dom.quizFeedback) {
                        this.dom.quizFeedback.className = 'quiz-feedback success';
                        this.dom.quizFeedback.textContent = '🎉 Barakalla! To\'g\'ri javob! +1 ❤️ bilan qayta tirildingiz!';
                    }
                    setTimeout(() => {
                        if (this.dom.btnQuizSkip) this.dom.btnQuizSkip.disabled = false;
                        onComplete(true);
                    }, 1000);
                } else {
                    btn.classList.add('wrong');
                    sound.playTone(200, 140, 0.25, 'sawtooth', 0.2);
                    // Find and highlight correct answer
                    allButtons.forEach(b => {
                        const span = b.querySelector('span:last-child');
                        if (span && span.textContent.trim().toLowerCase() === String(questionData.correct).trim().toLowerCase()) {
                            b.classList.add('correct');
                        }
                    });

                    if (this.dom.quizFeedback) {
                        this.dom.quizFeedback.className = 'quiz-feedback fail';
                        this.dom.quizFeedback.textContent = `❌ Noto'g'ri! To'g'ri javob: "${questionData.correct}"`;
                    }
                    setTimeout(() => {
                        if (this.dom.btnQuizSkip) this.dom.btnQuizSkip.disabled = false;
                        onComplete(false);
                    }, 1600);
                }
            });

            container.appendChild(btn);
        });

        // Skip Button
        if (this.dom.btnQuizSkip) {
            this.dom.btnQuizSkip.onclick = () => {
                if (hasAnswered) return;
                hasAnswered = true;
                onComplete(false);
            };
        }
    }

    /**
     * Mobile Burger Menu Drawer Controls
     */
    openBurgerMenu() {
        if (this.dom.burgerDrawer) {
            this.dom.burgerDrawer.classList.remove('hidden');
        }
    }

    closeBurgerMenu() {
        if (this.dom.burgerDrawer) {
            this.dom.burgerDrawer.classList.add('hidden');
        }
    }

    toggleBurgerMenu() {
        if (this.isBurgerMenuOpen()) {
            this.closeBurgerMenu();
            return false;
        } else {
            this.openBurgerMenu();
            return true;
        }
    }

    isBurgerMenuOpen() {
        return this.dom.burgerDrawer && !this.dom.burgerDrawer.classList.contains('hidden');
    }

    /**
     * Spawns a floating score/message text pop-up.
     */
    spawnFloatingText(text, x, y, color = '#FFC93C', size = 16) {
        this.floatingTexts.push({
            text,
            x,
            y,
            startY: y,
            color,
            size,
            alpha: 1.0,
            duration: 0.9,
            elapsed: 0
        });
    }

    /**
     * Spawns sparkling reward particles (e.g. on chest open or coin pickup).
     */
    spawnSparkles(x, y, count = 8, color = '#FFC93C') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                radius: 2 + Math.random() * 3,
                color,
                alpha: 1.0,
                life: 0.4 + Math.random() * 0.4,
                maxLife: 0.8
            });
        }
    }

    /**
     * Spawns subtle ground dust when player is moving.
     */
    spawnDust(x, y) {
        this.particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 15,
            vy: -10 - Math.random() * 10,
            radius: 2 + Math.random() * 2,
            color: '#E4BF72',
            alpha: 0.6,
            life: 0.35,
            maxLife: 0.35
        });
    }

    /**
     * Updates and animates floating texts and particles.
     */
    update(dt) {
        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.elapsed += dt;
            ft.y -= dt * 35; // rise upwards
            ft.alpha = Math.max(0, 1 - (ft.elapsed / ft.duration));

            if (ft.elapsed >= ft.duration) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Renders world-space floating texts and particles.
     */
    renderWorldUI(ctx, camera) {
        // Draw Particles
        this.particles.forEach(p => {
            const rx = p.x - camera.x;
            const ry = p.y - camera.y;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(rx, ry, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw Floating Texts
        this.floatingTexts.forEach(ft => {
            const rx = ft.x - camera.x;
            const ry = ft.y - camera.y;

            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = `bold ${ft.size}px 'Press Start 2P', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text outline for high legibility
            ctx.strokeStyle = '#1D3557';
            ctx.lineWidth = 4;
            ctx.strokeText(ft.text, rx, ry);

            // Inner text fill
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, rx, ry);
            ctx.restore();
        });
    }
}


/* ==================== Module: main.js ==================== */

/**
 * Xazina Ovchisi - Main Game Engine
 * Features game loop with delta-time, finite state machine, camera tracking,
 * screen shake, collision resolution, and event handling.
 */


// Game States
const STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAME_OVER: 'GAME_OVER',
    VICTORY: 'VICTORY'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Internal rendering resolution
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.state = STATES.MENU;
        this.currentLevelIndex = 0;
        this.score = 0;

        // Core systems
        this.level = new Level();
        this.player = new Player(0, 0);
        this.enemies = [];
        this.ui = new UIController();
        this.quiz = new QuizManager();

        // Fantastic Supernatural Systems
        this.projectiles = [];
        this.slowMoTimer = 0;
        this.slowMoDuration = 5.0;

        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            viewportWidth: this.width,
            viewportHeight: this.height
        };
        this.zoom = 1.0;

        // Screen shake on damage
        this.shakeTimer = 0;
        this.shakeDuration = 0;
        this.shakeMagnitude = 0;

        // Input state
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            joystickActive: false,
            joystickX: 0,
            joystickY: 0
        };

        // Timing
        this.lastTime = 0;
        this.doorMessageCooldown = 0;

        this.initEventListeners();
        this.loadLevel(0);
        this.state = STATES.MENU;
        this.ui.showScreen('menu');
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Start game loop
        requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * Initializes keyboard, touch, and UI button event listeners.
     */
    initEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            // Audio init on user gesture
            sound.init();

            // Toggle pause with Escape or P key
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (this.state === STATES.PLAYING) {
                    this.pauseGame();
                } else if (this.state === STATES.PAUSED) {
                    this.resumeGame();
                }
                return;
            }

            if (this.state !== STATES.PLAYING) return;

            // Fantastic Spacebar or F: Cast Magic Arcane Blast / Fireball!
            if (e.code === 'Space' || e.code === 'KeyF') {
                this.castMagicBlast();
                e.preventDefault();
                return;
            }

            // Fantastic Q: Frost Nova Blizzard (Freezes all active enemies!)
            if (e.code === 'KeyQ') {
                this.castFrost();
                e.preventDefault();
                return;
            }

            // Fantastic Shift: Phantom Dash!
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.triggerDash();
                e.preventDefault();
                return;
            }

            if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.input.up = true;
                e.preventDefault();
            }
            if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                this.input.down = true;
                e.preventDefault();
            }
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.input.left = true;
                e.preventDefault();
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.input.right = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.input.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.input.down = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
        });

        // 360° Analog Virtual Joystick Controller & Action Controls
        this.setupJoystick();
        this.setupJoystickToggle();

        // Mobile Fantastic Touch Buttons (Magic, Freeze, Dash)
        if (this.ui.dom.btnTouchMagic) {
            const cast = (e) => {
                e.preventDefault();
                sound.init();
                this.castMagicBlast();
            };
            this.ui.dom.btnTouchMagic.addEventListener('touchstart', cast, { passive: false });
            this.ui.dom.btnTouchMagic.addEventListener('click', cast);
        }

        if (this.ui.dom.btnTouchFreeze) {
            const freeze = (e) => {
                e.preventDefault();
                sound.init();
                this.castFrost();
            };
            this.ui.dom.btnTouchFreeze.addEventListener('touchstart', freeze, { passive: false });
            this.ui.dom.btnTouchFreeze.addEventListener('click', freeze);
        }

        if (this.ui.dom.btnTouchDash) {
            const dash = (e) => {
                e.preventDefault();
                sound.init();
                this.triggerDash();
            };
            this.ui.dom.btnTouchDash.addEventListener('touchstart', dash, { passive: false });
            this.ui.dom.btnTouchDash.addEventListener('click', dash);
        }

        // Mobile Burger Menu Actions
        if (this.ui.dom.btnBurger) {
            this.ui.dom.btnBurger.addEventListener('click', () => {
                sound.playClick();
                if (this.state === STATES.PLAYING) {
                    this.pauseGame();
                }
                this.ui.openBurgerMenu();
            });
        }
        if (this.ui.dom.btnBurgerClose) {
            this.ui.dom.btnBurgerClose.addEventListener('click', () => {
                sound.playClick();
                this.ui.closeBurgerMenu();
            });
        }
        if (this.ui.dom.burgerDrawerBackdrop) {
            this.ui.dom.burgerDrawerBackdrop.addEventListener('click', () => {
                sound.playClick();
                this.ui.closeBurgerMenu();
            });
        }
        if (this.ui.dom.burgerBtnResume) {
            this.ui.dom.burgerBtnResume.addEventListener('click', () => {
                sound.playClick();
                this.ui.closeBurgerMenu();
                if (this.state === STATES.PAUSED) {
                    this.resumeGame();
                }
            });
        }
        if (this.ui.dom.burgerBtnMute) {
            this.ui.dom.burgerBtnMute.addEventListener('click', () => {
                sound.toggleMute();
                this.ui.updateMuteIcon();
            });
        }
        if (this.ui.dom.burgerBtnFullscreen) {
            this.ui.dom.burgerBtnFullscreen.addEventListener('click', () => {
                sound.playClick();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }
        if (this.ui.dom.burgerBtnRestart) {
            this.ui.dom.burgerBtnRestart.addEventListener('click', () => {
                sound.playClick();
                this.ui.closeBurgerMenu();
                this.loadLevel(this.currentLevelIndex);
                this.state = STATES.PLAYING;
                this.ui.showScreen('playing');
            });
        }
        if (this.ui.dom.burgerBtnGuide) {
            this.ui.dom.burgerBtnGuide.addEventListener('click', () => {
                sound.playClick();
                this.ui.closeBurgerMenu();
                this.ui.showScreen('howToPlay');
            });
        }
        if (this.ui.dom.burgerBtnQuit) {
            this.ui.dom.burgerBtnQuit.addEventListener('click', () => {
                sound.playClick();
                this.ui.closeBurgerMenu();
                this.state = STATES.MENU;
                this.ui.showScreen('menu');
            });
        }

        // UI Buttons
        // Start Game
        if (this.ui.dom.btnStart) {
            this.ui.dom.btnStart.addEventListener('click', () => {
                sound.playClick();
                this.startNewGame();
            });
        }

        // How to play modal
        if (this.ui.dom.btnHowToPlay) {
            this.ui.dom.btnHowToPlay.addEventListener('click', () => {
                sound.playClick();
                this.ui.showScreen('howToPlay');
            });
        }
        if (this.ui.dom.btnCloseHowToPlay) {
            this.ui.dom.btnCloseHowToPlay.addEventListener('click', () => {
                sound.playClick();
                this.ui.showScreen('menu');
            });
        }

        // Pause controls
        if (this.ui.dom.btnPause) {
            this.ui.dom.btnPause.addEventListener('click', () => {
                sound.playClick();
                this.pauseGame();
            });
        }
        if (this.ui.dom.btnResume) {
            this.ui.dom.btnResume.addEventListener('click', () => {
                sound.playClick();
                this.resumeGame();
            });
        }
        if (this.ui.dom.btnRestartLevel) {
            this.ui.dom.btnRestartLevel.addEventListener('click', () => {
                sound.playClick();
                this.loadLevel(this.currentLevelIndex);
                this.state = STATES.PLAYING;
                this.ui.showScreen('playing');
            });
        }
        if (this.ui.dom.btnPauseQuit) {
            this.ui.dom.btnPauseQuit.addEventListener('click', () => {
                sound.playClick();
                this.state = STATES.MENU;
                this.ui.showScreen('menu');
            });
        }

        // Level Complete: Next Level
        if (this.ui.dom.btnNextLevel) {
            this.ui.dom.btnNextLevel.addEventListener('click', () => {
                sound.playClick();
                this.nextLevel();
            });
        }

        // Game Over: Play Again
        if (this.ui.dom.btnPlayAgain) {
            this.ui.dom.btnPlayAgain.addEventListener('click', () => {
                sound.playClick();
                this.startNewGame();
            });
        }
        if (this.ui.dom.btnGameOverMenu) {
            this.ui.dom.btnGameOverMenu.addEventListener('click', () => {
                sound.playClick();
                this.state = STATES.MENU;
                this.ui.showScreen('menu');
            });
        }

        // Victory: Play Again
        if (this.ui.dom.btnVictoryPlayAgain) {
            this.ui.dom.btnVictoryPlayAgain.addEventListener('click', () => {
                sound.playClick();
                this.startNewGame();
            });
        }

        // Mute toggle
        if (this.ui.dom.btnMute) {
            this.ui.dom.btnMute.addEventListener('click', () => {
                sound.toggleMute();
                this.ui.updateMuteIcon();
            });
        }

        // Fullscreen toggle (⛶)
        if (this.ui.dom.btnFullscreen) {
            this.ui.dom.btnFullscreen.addEventListener('click', () => {
                sound.playClick();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }
    }

    setupJoystick() {
        const zone = this.ui.dom.joystickZone;
        const base = this.ui.dom.joystickBase;
        const stick = this.ui.dom.joystickStick;
        if (!zone || !base || !stick) return;

        let activePointerId = null;
        let baseRect = null;

        const updatePips = (normX, normY, active) => {
            const { pipN, pipS, pipE, pipW } = this.ui.dom;
            if (pipN) pipN.classList.toggle('active', active && normY < -0.3);
            if (pipS) pipS.classList.toggle('active', active && normY > 0.3);
            if (pipE) pipE.classList.toggle('active', active && normX > 0.3);
            if (pipW) pipW.classList.toggle('active', active && normX < -0.3);
        };

        const onPointerMove = (e) => {
            if (e.pointerId !== activePointerId) return;
            if (!baseRect) baseRect = base.getBoundingClientRect();

            const centerX = baseRect.left + baseRect.width / 2;
            const centerY = baseRect.top + baseRect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const dist = Math.hypot(dx, dy);

            const stickW = stick.offsetWidth || 56;
            const maxRadius = Math.max(20, (baseRect.width / 2) - (stickW / 2));
            const angle = Math.atan2(dy, dx);
            const clampedDist = Math.min(dist, maxRadius);

            const stickX = Math.cos(angle) * clampedDist;
            const stickY = Math.sin(angle) * clampedDist;
            stick.style.transform = `translate(${stickX.toFixed(1)}px, ${stickY.toFixed(1)}px)`;

            // Deadzone check (5px)
            if (dist < 5) {
                this.input.joystickActive = false;
                this.input.joystickX = 0;
                this.input.joystickY = 0;
                this.input.up = false;
                this.input.down = false;
                this.input.left = false;
                this.input.right = false;
                updatePips(0, 0, false);
                return;
            }

            const intensity = clampedDist / maxRadius;
            const normX = (stickX / maxRadius) * intensity;
            const normY = (stickY / maxRadius) * intensity;

            this.input.joystickActive = true;
            this.input.joystickX = Math.max(-1, Math.min(1, normX));
            this.input.joystickY = Math.max(-1, Math.min(1, normY));

            // Directional flags for discrete listeners
            const isRight = (angle >= -Math.PI * 0.35 && angle <= Math.PI * 0.35);
            const isLeft = (angle >= Math.PI * 0.65 || angle <= -Math.PI * 0.65);
            const isDown = (angle >= Math.PI * 0.15 && angle <= Math.PI * 0.85);
            const isUp = (angle <= -Math.PI * 0.15 && angle >= -Math.PI * 0.85);

            this.input.right = isRight;
            this.input.left = isLeft;
            this.input.down = isDown;
            this.input.up = isUp;

            updatePips(normX, normY, true);
        };

        const onPointerDown = (e) => {
            if (activePointerId !== null) return;
            activePointerId = e.pointerId;
            sound.init();

            try {
                zone.setPointerCapture(e.pointerId);
            } catch (_) {}

            base.classList.add('active');
            stick.style.transition = 'none';
            baseRect = base.getBoundingClientRect();
            onPointerMove(e);
        };

        const onPointerEnd = (e) => {
            if (e.pointerId !== activePointerId) return;
            try {
                zone.releasePointerCapture(e.pointerId);
            } catch (_) {}

            activePointerId = null;
            baseRect = null;
            base.classList.remove('active');

            // Smooth spring return animation
            stick.style.transition = 'transform 0.16s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            stick.style.transform = 'translate(0px, 0px)';

            this.input.joystickActive = false;
            this.input.joystickX = 0;
            this.input.joystickY = 0;
            this.input.up = false;
            this.input.down = false;
            this.input.left = false;
            this.input.right = false;
            updatePips(0, 0, false);
        };

        zone.addEventListener('pointerdown', onPointerDown, { passive: false });
        zone.addEventListener('pointermove', onPointerMove, { passive: false });
        zone.addEventListener('pointerup', onPointerEnd, { passive: false });
        zone.addEventListener('pointercancel', onPointerEnd, { passive: false });
    }

    setupJoystickToggle() {
        const toggleBtn = this.ui.dom.btnJoystickToggle;
        const burgerBtn = this.ui.dom.burgerBtnJoystick;
        const controls = this.ui.dom.touchControls;
        if (!controls) return;

        const updateVisibility = (visible) => {
            if (visible) {
                controls.classList.remove('touch-controls-hidden');
            } else {
                controls.classList.add('touch-controls-hidden');
            }
            if (toggleBtn) {
                toggleBtn.classList.toggle('active', visible);
                toggleBtn.title = visible ? "Jostikni yashirish (🎮)" : "Jostikni ko'rsatish (🎮)";
            }
            if (this.ui.dom.burgerJoystickText) {
                this.ui.dom.burgerJoystickText.textContent = visible ? "Jostik: Ko'rsatilgan" : "Jostik: Yashirilgan";
            }
            try {
                localStorage.setItem('game_show_joystick', visible ? 'true' : 'false');
            } catch (_) {}
        };

        const toggle = (e) => {
            if (e) e.preventDefault();
            sound.init();
            sound.playClick();
            const isHidden = controls.classList.contains('touch-controls-hidden');
            updateVisibility(isHidden);
        };

        if (toggleBtn) toggleBtn.addEventListener('click', toggle);
        if (burgerBtn) burgerBtn.addEventListener('click', toggle);

        // Check stored preference (default is true - shown!)
        let shouldShow = true;
        try {
            const stored = localStorage.getItem('game_show_joystick');
            if (stored === 'false') shouldShow = false;
        } catch (_) {}
        updateVisibility(shouldShow);
    }

    /**
     * True Fullsize Screen Responsive Canvas.
     * Canvas dynamically spans 100% of the screen with adaptive scaling and 60 FPS capping.
     */
    handleResize() {
        const container = document.getElementById('canvas-container');
        const w = container && container.clientWidth > 0 ? container.clientWidth : window.innerWidth;
        const h = container && container.clientHeight > 0 ? container.clientHeight : (window.innerHeight - 52);

        // Cap backing canvas resolution on ultra-high res screens (4K) for guaranteed 60 FPS on weak GPUs
        const maxResolution = 1920;
        let canvasW = w;
        let canvasH = h;
        if (canvasW > maxResolution) {
            const aspect = canvasW / canvasH;
            canvasW = maxResolution;
            canvasH = Math.round(maxResolution / aspect);
        }

        this.width = canvasW;
        this.height = canvasH;
        this.canvas.width = canvasW;
        this.canvas.height = canvasH;

        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        // Nearest neighbor rendering for pixel art sharpness and 5x faster draw calls
        this.ctx.imageSmoothingEnabled = false;

        this.updateZoomAndCamera(true);
    }

    /**
     * Recalculates adaptive zoom so each stage comfortably fills the full screen.
     */
    updateZoomAndCamera(instant = false) {
        if (!this.level) return;

        // Calculate zoom so level fits screen nicely, filling ~94% of available space
        const fitZoomX = (this.width * 0.94) / this.level.pixelWidth;
        const fitZoomY = (this.height * 0.94) / this.level.pixelHeight;
        let optimalZoom = Math.min(fitZoomX, fitZoomY);

        // Clamp zoom: min 1.0 (never shrink below native size), max 2.5
        this.zoom = Math.max(1.0, Math.min(2.5, optimalZoom));

        // Viewport dimensions in world coordinates
        this.camera.viewportWidth = this.width / this.zoom;
        this.camera.viewportHeight = this.height / this.zoom;

        this.updateCamera(instant);
    }

    /**
     * Starts a brand new game from Level 1 with 3 lives and 0 score.
     */
    startNewGame() {
        this.score = 0;
        this.currentLevelIndex = 0;
        this.player.lives = 3;
        this.player.hasShield = false;
        this.player.magicCharges = 2;
        this.player.frostCharges = 2;
        this.player.magnetTimer = 0;
        this.player.invisibilityTimer = 0;
        this.projectiles = [];
        this.slowMoTimer = 0;
        this.loadLevel(0);
        this.state = STATES.PLAYING;
        this.ui.showScreen('playing');
        this.updateHUD();
    }

    /**
     * Loads level data, initializes player, enemies and camera.
     */
    loadLevel(index) {
        this.currentLevelIndex = index;
        this.level.load(index);
        this.projectiles = [];
        this.slowMoTimer = 0;

        // Position player at level spawn
        this.player.reset(this.level.playerSpawn.x, this.level.playerSpawn.y, false);

        // Spawn patrolling enemies (including fantastic Ghost Pirates)
        this.enemies = this.level.rawEnemyData.map(cfg => new Enemy(cfg));

        // Clear input
        this.input.up = false;
        this.input.down = false;
        this.input.left = false;
        this.input.right = false;
        this.input.joystickActive = false;
        this.input.joystickX = 0;
        this.input.joystickY = 0;

        this.updateZoomAndCamera(true);
        this.updateHUD();
    }

    /**
     * Advances to the next level or finishes the game on Victory.
     */
    nextLevel() {
        const nextIdx = this.currentLevelIndex + 1;
        if (nextIdx < LEVELS.length) {
            this.loadLevel(nextIdx);
            this.state = STATES.PLAYING;
            this.ui.showScreen('playing');
        } else {
            this.triggerVictory();
        }
    }

    pauseGame() {
        if (this.state !== STATES.PLAYING) return;
        this.state = STATES.PAUSED;
        this.ui.showScreen('pause');
    }

    resumeGame() {
        if (this.state !== STATES.PAUSED) return;
        this.state = STATES.PLAYING;
        this.ui.showScreen('playing');
    }

    /**
     * Triggers screen shake on hazard collision.
     */
    triggerScreenShake(magnitude = 8, duration = 0.25) {
        this.shakeMagnitude = magnitude;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    /**
     * Synchronizes HUD state with UIController.
     */
    updateHUD() {
        this.ui.updateHUD(
            this.player.lives,
            this.score,
            this.currentLevelIndex,
            LEVELS.length,
            this.player.hasKey,
            this.player.hasShield,
            this.player.magicCharges,
            this.slowMoTimer > 0,
            this.player.frostCharges,
            this.player.magnetTimer,
            this.player.invisibilityTimer
        );
    }

    /**
     * Fantastic Spell: Frost Nova Blizzard (Freezes all active enemies for 4.5 seconds)
     */
    castFrost() {
        if (this.state !== STATES.PLAYING) return;

        if (this.player.frostCharges <= 0) {
            sound.playTone(180, 100, 0.1, 'sawtooth', 0.15);
            this.ui.spawnFloatingText('❄️ Muz zaryadi yo\'q!', this.player.x, this.player.y - 16, '#48CAE4', 13);
            return;
        }

        this.player.frostCharges--;
        sound.playFreeze();

        let frozenCount = 0;
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.frozenTimer = 4.5;
                this.ui.spawnSparkles(enemy.x, enemy.y, 16, '#48CAE4');
                this.ui.spawnFloatingText('❄️ Muzlatildi!', enemy.x, enemy.y - 20, '#00F5D4', 15);
                frozenCount++;
            }
        });

        this.triggerScreenShake(5, 0.2);
        this.ui.spawnSparkles(this.player.x, this.player.y, 22, '#48CAE4');
        this.ui.spawnFloatingText('❄️ Muz Blizzard!', this.player.x, this.player.y - 18, '#48CAE4', 16);
        this.updateHUD();
    }

    /**
     * Fantastic Spell: Casts Arcane Magic Blast / Fireball!
     */
    castMagicBlast() {
        if (this.state !== STATES.PLAYING) return;

        if (this.player.magicCharges <= 0) {
            sound.playTone(180, 100, 0.1, 'sawtooth', 0.15);
            this.ui.spawnFloatingText('⚡ Zaryad yo\'q!', this.player.x, this.player.y - 16, '#FF007F', 13);
            return;
        }

        this.player.magicCharges--;

        let vx = 0;
        let vy = 0;
        const blastSpeed = 390;

        if (this.player.facing === 'left') vx = -blastSpeed;
        else if (this.player.facing === 'right') vx = blastSpeed;
        else if (this.player.facing === 'up') vy = -blastSpeed;
        else vy = blastSpeed;

        this.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx,
            vy,
            radius: 8,
            life: 1.5,
            trailTimer: 0
        });

        sound.playBlast();
        this.ui.spawnSparkles(this.player.x, this.player.y, 10, '#00F5D4');
        this.updateHUD();
    }

    /**
     * Fantastic Move: Phantom Dash across corridors!
     */
    triggerDash() {
        if (this.state !== STATES.PLAYING) return;

        if (this.player.triggerDash()) {
            sound.playDash();
            this.ui.spawnSparkles(this.player.x, this.player.y, 12, '#9D4EDD');
            this.ui.spawnFloatingText('💨 Dash!', this.player.x, this.player.y - 18, '#9D4EDD', 14);
        }
    }

    /**
     * Level Complete celebration state.
     */
    triggerLevelComplete() {
        sound.playLevelWin();
        this.state = STATES.LEVEL_COMPLETE;

        if (this.ui.dom.levelCompleteTitle) {
            this.ui.dom.levelCompleteTitle.textContent = `${this.currentLevelIndex + 1}-bosqich yakunlandi!`;
        }
        if (this.ui.dom.levelCompleteScore) {
            this.ui.dom.levelCompleteScore.textContent = `Jami ball: ${this.score}`;
        }

        this.ui.showScreen('levelComplete');
    }

    /**
     * Victory state after completing all 5 levels.
     */
    triggerVictory() {
        sound.playLevelWin();
        this.state = STATES.VICTORY;

        const isNewRecord = this.ui.checkAndUpdateHighScore(this.score);

        if (this.ui.dom.victoryScore) {
            this.ui.dom.victoryScore.textContent = `Yakuniy ball: ${this.score}`;
        }
        if (this.ui.dom.victoryHighScore) {
            this.ui.dom.victoryHighScore.textContent = String(this.ui.getHighScore());
        }

        this.ui.showScreen('victory');
    }

    /**
     * Game Over state when lives hit 0.
     */
    /**
     * Triggered on defeat (lives <= 0).
     * Offers an educational second chance revive question (Matematika, Ingliz tili, Geografiya).
     */
    triggerGameOver() {
        this.openReviveQuiz();
    }

    /**
     * Opens the Second-Chance Revive Quiz modal.
     */
    openReviveQuiz() {
        sound.playDamage();
        this.state = STATES.PAUSED;

        const question = this.quiz.getRandomQuestion();
        this.currentQuizQuestion = question;
        this.ui.showReviveQuiz(question, (revived) => {
            if (revived) {
                // Correct answer: Revive player with +1 heart and temporary invulnerability shield!
                this.player.lives = 1;
                this.player.invulnerableTimer = 2.5;
                this.state = STATES.PLAYING;
                this.ui.showScreen('playing');
                this.ui.spawnFloatingText('❤️ Tirildingiz! (+1 Jon)', this.player.x, this.player.y - 20, '#00F5D4', 16);
                this.ui.spawnSparkles(this.player.x, this.player.y, 25, '#00F5D4');
                this.updateHUD();
            } else {
                // Incorrect answer or skipped: proceed to standard Game Over screen
                this.reallyGameOver();
            }
        });
    }

    /**
     * Game Over state when quiz is failed or skipped.
     */
    reallyGameOver() {
        sound.playGameOver();
        this.state = STATES.GAME_OVER;

        const isNewRecord = this.ui.checkAndUpdateHighScore(this.score);

        if (this.ui.dom.gameOverScore) {
            this.ui.dom.gameOverScore.textContent = `To'plangan ball: ${this.score}`;
        }
        if (this.ui.dom.gameOverHighScore) {
            this.ui.dom.gameOverHighScore.textContent = String(this.ui.getHighScore());
        }

        this.ui.showScreen('gameOver');
    }

    /**
     * Smooth camera tracking centered on player, clamped to map borders.
     */
    updateCamera(instant = false) {
        let targetX = this.player.x - this.camera.viewportWidth / 2;
        let targetY = this.player.y - this.camera.viewportHeight / 2;

        const maxCamX = Math.max(0, this.level.pixelWidth - this.camera.viewportWidth);
        const maxCamY = Math.max(0, this.level.pixelHeight - this.camera.viewportHeight);

        targetX = Math.max(0, Math.min(maxCamX, targetX));
        targetY = Math.max(0, Math.min(maxCamY, targetY));

        // Center map if it's smaller than viewport
        if (this.level.pixelWidth < this.camera.viewportWidth) {
            targetX = -(this.camera.viewportWidth - this.level.pixelWidth) / 2;
        }
        if (this.level.pixelHeight < this.camera.viewportHeight) {
            targetY = -(this.camera.viewportHeight - this.level.pixelHeight) / 2;
        }

        if (instant) {
            this.camera.x = targetX;
            this.camera.y = targetY;
        } else {
            // Smooth lerp camera
            this.camera.x += (targetX - this.camera.x) * 0.15;
            this.camera.y += (targetY - this.camera.y) * 0.15;
        }
    }

    /**
     * Main update function running at variable frame rate via delta-time.
     */
    update(dt) {
        if (this.state !== STATES.PLAYING) {
            // Keep UI particles updating during screen transitions
            this.ui.update(dt);
            return;
        }

        if (this.doorMessageCooldown > 0) {
            this.doorMessageCooldown -= dt;
        }

        // Screen shake timer
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        // Slow-Motion timer handling
        if (this.slowMoTimer > 0) {
            this.slowMoTimer = Math.max(0, this.slowMoTimer - dt);
            if (this.slowMoTimer === 0) {
                this.updateHUD();
            }
        }
        if (this.player.magnetTimer > 0 || this.player.invisibilityTimer > 0) {
            this.updateHUD();
        }
        const enemySpeedMultiplier = this.slowMoTimer > 0 ? 0.35 : 1.0;

        // Update Level animations (spinning coins, spikes, chests, portals)
        this.level.update(dt);

        // Update Player movement & collision
        this.player.update(dt, this.input, this.level, (dx, dy) => this.ui.spawnDust(dx, dy));

        // Cosmic Magnet Coin Pulling
        if (this.player.magnetTimer > 0) {
            this.level.coins.forEach(coin => {
                if (!coin.collected) {
                    const dx = this.player.x - coin.x;
                    const dy = this.player.y - coin.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 190 && dist > 1) {
                        coin.x += (dx / dist) * 280 * dt;
                        coin.y += (dy / dist) * 280 * dt;
                    }
                }
            });
        }

        // Update Enemies with intelligent Detection & Chase AI + slow-motion modifier
        this.enemies.forEach(enemy => {
            enemy.update(dt, this.player, this.level, enemySpeedMultiplier, (spottedEnemy) => {
                sound.playAlert();
                this.triggerScreenShake(5, 0.18);
                this.ui.spawnFloatingText('! SEZDI !', spottedEnemy.x, spottedEnemy.y - 22, '#E63946', 16);
            });
        });

        // --- Collectibles & Hazards Collision Checks ---
        const playerBox = this.player.getCollisionBox();

        // 1. Coin Collection (+10 points)
        this.level.coins.forEach(coin => {
            if (!coin.collected) {
                const distSq = (this.player.x - coin.x) ** 2 + (this.player.y - coin.y) ** 2;
                if (distSq < (coin.radius + 14) ** 2) {
                    coin.collected = true;
                    this.score += 10;
                    sound.playCoin();
                    this.ui.spawnFloatingText('+10', coin.x, coin.y - 10, '#FFC93C', 14);
                    this.ui.spawnSparkles(coin.x, coin.y, 6, '#FFC93C');
                    this.updateHUD();
                }
            }
        });

        // 2. Treasure Chest Collection (+50 points)
        this.level.chests.forEach(chest => {
            if (!chest.opened) {
                if (
                    playerBox.x < chest.x + chest.width &&
                    playerBox.x + playerBox.width > chest.x &&
                    playerBox.y < chest.y + chest.height &&
                    playerBox.y + playerBox.height > chest.y
                ) {
                    chest.opened = true;
                    this.score += 50;
                    sound.playChest();
                    this.ui.spawnFloatingText('+50 💰', chest.x + chest.width / 2, chest.y - 12, '#FFC93C', 18);
                    this.ui.spawnSparkles(chest.x + chest.width / 2, chest.y, 16, '#FFE17D');
                    this.updateHUD();
                }
            }
        });

        // 3. Key Collection
        if (this.level.key && !this.level.key.collected && !this.player.hasKey) {
            const k = this.level.key;
            const distSq = (this.player.x - k.x) ** 2 + (this.player.y - k.y) ** 2;
            if (distSq < (18 + 14) ** 2) {
                k.collected = true;
                this.player.hasKey = true;
                this.level.unlockExitDoor();
                sound.playKey();
                this.ui.spawnFloatingText('🗝️ Kalit topildi!', k.x, k.y - 15, '#FFC93C', 15);
                this.ui.spawnSparkles(k.x, k.y, 12, '#FFC93C');
                this.updateHUD();
            }
        }

        // ================= FANTASTIC SUPERNATURAL COLLISIONS =================
        // 4. Astral Teleportation Portals
        if (this.player.portalCooldown <= 0) {
            for (const portal of this.level.portals) {
                const distSq = (this.player.x - portal.x) ** 2 + (this.player.y - portal.y) ** 2;
                if (distSq < (portal.radius + 12) ** 2 && portal.target) {
                    this.player.x = portal.target.x;
                    this.player.y = portal.target.y;
                    this.player.portalCooldown = 1.0;
                    sound.playPortal();
                    this.triggerScreenShake(7, 0.22);
                    this.ui.spawnFloatingText('🌀 Teleportatsiya!', this.player.x, this.player.y - 18, '#00F5D4', 16);
                    this.ui.spawnSparkles(portal.x, portal.y, 18, '#00F5D4');
                    this.ui.spawnSparkles(portal.target.x, portal.target.y, 18, '#7B2CBF');
                    break;
                }
            }
        }

        // 5. Magic Shield Crystal Pickups (+25 pts & Shield)
        this.level.shields.forEach(s => {
            if (!s.collected) {
                const distSq = (this.player.x - s.x) ** 2 + (this.player.y - s.y) ** 2;
                if (distSq < (s.radius + 14) ** 2) {
                    s.collected = true;
                    this.player.hasShield = true;
                    this.score += 25;
                    sound.playShield();
                    this.ui.spawnFloatingText('🛡️ Sehrli Qalqon! (+25)', s.x, s.y - 14, '#00F5D4', 15);
                    this.ui.spawnSparkles(s.x, s.y, 16, '#00F5D4');
                    this.updateHUD();
                }
            }
        });

        // 6. Chrono Hourglasses (+25 pts & 5s Slow-Motion)
        this.level.timeArtifacts.forEach(t => {
            if (!t.collected) {
                const distSq = (this.player.x - t.x) ** 2 + (this.player.y - t.y) ** 2;
                if (distSq < (t.radius + 14) ** 2) {
                    t.collected = true;
                    this.slowMoTimer = this.slowMoDuration;
                    this.score += 25;
                    sound.playSlowMotion();
                    this.ui.spawnFloatingText('⏳ Vaqt Sekinlashdi! (+25)', t.x, t.y - 14, '#FFD166', 15);
                    this.ui.spawnSparkles(t.x, t.y, 18, '#FFD166');
                    this.updateHUD();
                }
            }
        });

        // 7. Arcane Amulets (+25 pts & +2 Magic Fireballs)
        this.level.magicAmulets.forEach(a => {
            if (!a.collected) {
                const distSq = (this.player.x - a.x) ** 2 + (this.player.y - a.y) ** 2;
                if (distSq < (a.radius + 14) ** 2) {
                    a.collected = true;
                    this.player.magicCharges = Math.min(this.player.maxMagicCharges, this.player.magicCharges + 2);
                    this.score += 25;
                    sound.playTone(880, 1320, 0.2, 'triangle', 0.25);
                    this.ui.spawnFloatingText('⚡ +2 Sehrli O\'q! (+25)', a.x, a.y - 14, '#FF007F', 15);
                    this.ui.spawnSparkles(a.x, a.y, 16, '#FF007F');
                    this.updateHUD();
                }
            }
        });

        // 7b. Cosmic Magnets (+25 pts & 8s Magnet attraction)
        this.level.magnets.forEach(m => {
            if (!m.collected) {
                const distSq = (this.player.x - m.x) ** 2 + (this.player.y - m.y) ** 2;
                if (distSq < (m.radius + 14) ** 2) {
                    m.collected = true;
                    this.player.magnetTimer = 8.0;
                    this.score += 25;
                    sound.playTone(600, 950, 0.25, 'sine', 0.25);
                    this.ui.spawnFloatingText('🧲 Kosmik Magnit! (+25)', m.x, m.y - 14, '#FFC93C', 15);
                    this.ui.spawnSparkles(m.x, m.y, 18, '#FFC93C');
                    this.updateHUD();
                }
            }
        });

        // 7c. Ethereal Invisibility Cloaks (+25 pts & 6s Invisibility)
        this.level.invisibilityCloaks.forEach(ic => {
            if (!ic.collected) {
                const distSq = (this.player.x - ic.x) ** 2 + (this.player.y - ic.y) ** 2;
                if (distSq < (ic.radius + 14) ** 2) {
                    ic.collected = true;
                    this.player.invisibilityTimer = 6.0;
                    this.score += 25;
                    sound.playTone(400, 800, 0.3, 'triangle', 0.25);
                    this.ui.spawnFloatingText('👻 Ko\'rinmaslik Mantiyasi! (+25)', ic.x, ic.y - 14, '#9D4EDD', 15);
                    this.ui.spawnSparkles(ic.x, ic.y, 20, '#9D4EDD');
                    this.updateHUD();
                }
            }
        });

        // 8. Magic Arcane Blast Projectiles Physics & Collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;

            // Trail particles
            p.trailTimer = (p.trailTimer || 0) + dt;
            if (p.trailTimer > 0.05) {
                p.trailTimer = 0;
                this.ui.spawnSparkles(p.x, p.y, 1, '#00F5D4');
            }

            // Wall collision check
            if (this.level.checkWallCollision({ x: p.x - 4, y: p.y - 4, width: 8, height: 8 })) {
                this.ui.spawnSparkles(p.x, p.y, 8, '#00F5D4');
                this.projectiles.splice(i, 1);
                continue;
            }

            // Enemy collision check
            let enemyHit = false;
            for (const enemy of this.enemies) {
                if (enemy.alive) {
                    const distSq = (p.x - enemy.x) ** 2 + (p.y - enemy.y) ** 2;
                    if (distSq < (enemy.width / 2 + p.radius + 4) ** 2) {
                        enemy.alive = false;
                        enemyHit = true;
                        this.score += 100;
                        sound.playEnemyDefeat();
                        this.triggerScreenShake(8, 0.25);
                        this.ui.spawnFloatingText('+100 💥 Magiya!', enemy.x, enemy.y - 16, '#00F5D4', 18);
                        this.ui.spawnSparkles(enemy.x, enemy.y, 22, '#00F5D4');
                        this.ui.spawnSparkles(enemy.x, enemy.y, 16, '#FF007F');
                        this.updateHUD();
                        break;
                    }
                }
            }

            if (enemyHit || p.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }

        // 9. Spike Traps Collision (-1 life or Absorbed by Magic Shield)
        this.level.spikes.forEach(spike => {
            if (spike.state === 'up') {
                if (
                    playerBox.x < spike.x + spike.width - 6 &&
                    playerBox.x + playerBox.width > spike.x + 6 &&
                    playerBox.y < spike.y + spike.height - 6 &&
                    playerBox.y + playerBox.height > spike.y + 6
                ) {
                    const dmg = this.player.takeDamage();
                    if (dmg === 'shield') {
                        sound.playShieldBreak();
                        this.triggerScreenShake(7, 0.2);
                        this.ui.spawnFloatingText('🛡️ Qalqon himoya qildi!', this.player.x, this.player.y - 16, '#00F5D4', 15);
                        this.ui.spawnSparkles(this.player.x, this.player.y, 16, '#00F5D4');
                        this.updateHUD();
                    } else if (dmg === true) {
                        sound.playDamage();
                        this.triggerScreenShake(10, 0.3);
                        this.ui.spawnFloatingText('-1 ❤️', this.player.x, this.player.y - 16, '#E63946', 16);
                        this.updateHUD();

                        if (this.player.lives <= 0) {
                            this.triggerGameOver();
                        }
                    }
                }
            }
        });

        // 10. Pirate Enemy Collision (Normal & Ghost)
        this.enemies.forEach(enemy => {
            if (enemy.checkCollision(this.player)) {
                const dmg = this.player.takeDamage();
                if (dmg === 'shield') {
                    sound.playShieldBreak();
                    this.triggerScreenShake(8, 0.22);
                    this.ui.spawnFloatingText('🛡️ Qalqon himoya qildi!', this.player.x, this.player.y - 16, '#00F5D4', 15);
                    this.ui.spawnSparkles(this.player.x, this.player.y, 16, '#00F5D4');
                    this.updateHUD();
                } else if (dmg === true) {
                    sound.playDamage();
                    this.triggerScreenShake(10, 0.3);
                    this.ui.spawnFloatingText('-1 ❤️', this.player.x, this.player.y - 16, '#E63946', 16);
                    this.updateHUD();

                    if (this.player.lives <= 0) {
                        this.triggerGameOver();
                    }
                }
            }
        });

        // 11. Exit Door Reach Check
        if (this.level.exitDoor) {
            const door = this.level.exitDoor;
            if (
                playerBox.x < door.x + door.width - 4 &&
                playerBox.x + playerBox.width > door.x + 4 &&
                playerBox.y < door.y + door.height - 4 &&
                playerBox.y + playerBox.height > door.y + 4
            ) {
                if (this.player.hasKey) {
                    this.triggerLevelComplete();
                } else if (this.doorMessageCooldown <= 0) {
                    this.doorMessageCooldown = 1.2;
                    sound.playTone(300, 200, 0.1, 'square', 0.1);
                    this.ui.spawnFloatingText('🔒 Kalit kerak!', door.x + door.width / 2, door.y - 10, '#E63946', 13);
                }
            }
        }

        // Update Camera
        this.updateCamera();

        // Update UI floating elements and particles
        this.ui.update(dt);
    }

    /**
     * Renders the game scene, entities, camera shake, and UI.
     */
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();

        // 1. Scale context by zoom for fullsize screen display
        this.ctx.scale(this.zoom, this.zoom);

        // 2. Apply screen shake offset if active
        if (this.shakeTimer > 0) {
            const factor = this.shakeTimer / this.shakeDuration;
            const currentMag = this.shakeMagnitude * factor;
            const offsetX = (Math.random() - 0.5) * 2 * currentMag;
            const offsetY = (Math.random() - 0.5) * 2 * currentMag;
            this.ctx.translate(offsetX, offsetY);
        }

        // 3. Render Level Tiles, Pickups, Portals, and Obstacles
        this.level.render(this.ctx, this.camera);

        // 4. Render Patrolling Enemies (Regular & Ghost Pirates)
        this.enemies.forEach(enemy => enemy.render(this.ctx, this.camera));

        // 5. Render Player Adventurer
        this.player.render(this.ctx, this.camera);

        // 6. Render Fantastic Arcane Blast Projectiles (60 FPS optimized)
        this.projectiles.forEach(p => {
            const px = Math.round(p.x - this.camera.x);
            const py = Math.round(p.y - this.camera.y);

            // Fast outer aura halo
            this.ctx.fillStyle = 'rgba(0, 245, 212, 0.25)';
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.radius + 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Outer plasma ring
            this.ctx.fillStyle = '#7B2CBF';
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.radius + 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner cyan core
            this.ctx.fillStyle = '#00F5D4';
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Center hot white spark
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.radius * 0.45, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 7. Render World-space UI (floating text numbers, particles)
        this.ui.renderWorldUI(this.ctx, this.camera);

        // 8. Chrono Slow-Motion Screen Distortion Vignette
        if (this.slowMoTimer > 0) {
            const vignetteIntensity = Math.min(1, this.slowMoTimer);
            const grad = this.ctx.createRadialGradient(
                this.camera.viewportWidth / 2, this.camera.viewportHeight / 2, this.camera.viewportHeight * 0.35,
                this.camera.viewportWidth / 2, this.camera.viewportHeight / 2, this.camera.viewportHeight * 0.75
            );
            grad.addColorStop(0, 'rgba(0, 245, 212, 0)');
            grad.addColorStop(1, `rgba(123, 44, 191, ${0.35 * vignetteIntensity})`);
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
        }

        this.ctx.restore();
    }


    /**
     * Main animation loop utilizing requestAnimationFrame and delta-time.
     */
    loop(currentTime) {
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }

        // Compute delta-time in seconds (clamped to prevent spiral of death)
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }
}

// Start game instance when DOM is ready (or immediately if already loaded)
function initGame() {
    if (!window.game) {
        window.game = new Game();
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}


})();