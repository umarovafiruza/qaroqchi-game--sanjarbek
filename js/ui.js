/**
 * Xazina Ovchisi - UI, HUD, Screens, Overlays & Particle System
 * Manages menus, overlays, floating score popups, and high scores.
 */

import { sound } from './audio.js';

export class UIController {
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
