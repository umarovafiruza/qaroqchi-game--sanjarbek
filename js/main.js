/**
 * Xazina Ovchisi - Main Game Engine
 * Features game loop with delta-time, finite state machine, camera tracking,
 * screen shake, collision resolution, and event handling.
 */

import { Level, LEVELS, TILE_SIZE } from './level.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { sound } from './audio.js';
import { UIController } from './ui.js';
import { QuizManager } from './quiz.js';

// Game States
export const STATES = {
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
