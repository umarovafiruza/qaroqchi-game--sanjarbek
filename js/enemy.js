/**
 * Xazina Ovchisi - Pirate Enemy AI & Character Physics
 * Features:
 * - Dynamic AI: Patrol -> Detect Player -> Alert Emote (!) -> Chase mode
 * - Return to Patrol with Lost Emote (?) when player escapes
 * - Highly optimized rendering without heavy shadowBlur for 60 FPS on low-end PCs
 * - Fantastic Ghost Pirate ethereal variant
 */

import { COLORS } from './level.js';

export class Enemy {
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
