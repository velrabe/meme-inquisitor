// Управление активными эффектами и хуками
import { UPGRADES } from './upgrades.js';
import { CONFIG } from '../config.js';

export class UpgradeManager {
    constructor(world) {
        this.world = world;
        this.activeEffects = []; // { upgradeId, timeLeft, upgrade }
        this.multipliers = {
            bulletSpeed: 1,
        };
        this.weaponOverride = null; // для лазера и подобных
        this.ringEffects = []; // для визуальных эффектов взрывов
    }

    /**
     * Активировать улучшение (вызывается при добивании pickup)
     */
    activate(upgradeId, x, y) {
        const upgrade = UPGRADES[upgradeId];
        if (!upgrade) return;

        console.log('Activating upgrade:', upgradeId);

        if (upgrade.type === 'instant') {
            // Мгновенный эффект
            upgrade.onActivate?.(this, x, y);
        } else if (upgrade.type === 'timed') {
            // Проверяем, не активен ли уже этот эффект
            const existing = this.activeEffects.find(e => e.upgradeId === upgradeId);
            if (existing) {
                // Продлеваем время
                existing.timeLeft = upgrade.duration;
            } else {
                // Добавляем новый эффект
                this.activeEffects.push({
                    upgradeId,
                    timeLeft: upgrade.duration,
                    upgrade
                });

                // Применяем эффект
                upgrade.apply?.(this);
                upgrade.startWeaponOverride?.(this);
            }
        }
    }

    /**
     * Обновление таймеров
     */
    update(dt) {
        // Обновление weapon override (например, лазер)
        if (this.weaponOverride) {
            this.weaponOverride.update?.(dt, this.world);
        }

        // Обновление таймеров эффектов
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.timeLeft -= dt;

            if (effect.timeLeft <= 0) {
                // Эффект истек
                this.removeEffect(effect);
                this.activeEffects.splice(i, 1);
            }
        }

        // Обновление визуальных эффектов
        for (let i = this.ringEffects.length - 1; i >= 0; i--) {
            const fx = this.ringEffects[i];
            fx.time += dt;
            if (fx.time >= fx.duration) {
                this.ringEffects.splice(i, 1);
            }
        }
    }

    /**
     * Удаление эффекта
     */
    removeEffect(effect) {
        console.log('Removing upgrade:', effect.upgradeId);
        effect.upgrade.remove?.(this);
        effect.upgrade.endWeaponOverride?.(this);
    }

    /**
     * Хук: при создании пули
     */
    onBulletSpawn(bullet) {
        for (const effect of this.activeEffects) {
            effect.upgrade.onBulletSpawn?.(bullet);
        }
    }

    /**
     * Хук: при попадании пули во врага
     */
    onBulletHit(bullet, enemy) {
        for (const effect of this.activeEffects) {
            effect.upgrade.onBulletHit?.({ bullet, enemy });
        }
    }

    /**
     * Хук: при выстреле (для triple shot и т.п.)
     */
    onFire(fireFn, originX, originY) {
        for (const effect of this.activeEffects) {
            effect.upgrade.onFire?.(this, fireFn, originX, originY);
        }
    }

    /**
     * Проверка, заблокирован ли обычный огонь (например, при лазере)
     */
    isFireBlocked() {
        return this.weaponOverride?.fireBlocked === true;
    }

    /**
     * Убить всех врагов в радиусе (для bomb)
     */
    killEnemiesInRadius(x, y, radius) {
        const enemies = this.world.enemies.getActive();
        let killed = 0;
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
                const wasKilled = enemy.hit(); // используем правильный метод
                if (wasKilled) {
                    this.world.score += CONFIG.POINTS_PER_KILL;
                    killed++;
                }
            }
        }
        console.log('Bomb killed enemies:', killed);
    }

    /**
     * Создать визуальный эффект кольца (для bomb)
     */
    spawnRingFx(x, y, radius) {
        this.ringEffects.push({
            x, y, radius,
            time: 0,
            duration: 0.5
        });
    }

    /**
     * Отрисовка оверрайда оружия (лазер и т.п.)
     */
    drawWeaponOverride(ctx) {
        if (this.weaponOverride?.draw) {
            this.weaponOverride.draw(ctx, this.world);
        }
    }

    /**
     * Отрисовка визуальных эффектов (взрывы и т.п.)
     */
    drawEffects(ctx) {
        for (const fx of this.ringEffects) {
            const progress = fx.time / fx.duration;
            const alpha = 1 - progress;
            const currentRadius = fx.radius * (0.5 + progress * 0.5);

            ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    /**
     * Получить список активных эффектов для UI
     */
    getActiveEffects() {
        return this.activeEffects.map(e => ({
            label: e.upgrade.label,
            timeLeft: e.timeLeft
        }));
    }

    /**
     * Сброс при рестарте игры
     */
    reset() {
        // Удаляем все эффекты
        for (const effect of this.activeEffects) {
            this.removeEffect(effect);
        }
        this.activeEffects = [];
        this.multipliers = {
            bulletSpeed: 1,
        };
        this.weaponOverride = null;
        this.ringEffects = [];
    }
}