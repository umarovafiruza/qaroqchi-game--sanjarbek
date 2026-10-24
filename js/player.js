/**
 * Xazina Ovchisi - Player Controller & Character Physics
 * Handles smooth movement, wall sliding, invulnerability, and character rendering.
 */

import { TILE_SIZE, COLORS } from './level.js';

export class Player {
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

