// Пул бонусов (pickups), которые летят сверху вниз и их нужно расстрелять
import { UPGRADES } from './upgrades.js';
import { getSize } from '../renderer.js';

class Pickup {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.radius = 20;
        this.speed = 80; // медленнее врагов
        this.hp = 1;
        this.maxHp = 1;
        this.upgradeId = null;
        this.color = '#FFFFFF';
    }

    activate(x, y, upgradeId) {
        const upgrade = UPGRADES[upgradeId];
        if (!upgrade) return;

        this.active = true;
        this.x = x;
        this.y = y;
        this.upgradeId = upgradeId;
        this.hp = upgrade.hitsToActivate || 1;
        this.maxHp = this.hp;
        this.color = upgrade.color || '#FFFFFF';
    }

    deactivate() {
        this.active = false;
        this.upgradeId = null;
    }

    update(dt) {
        if (!this.active) return;

        // Движение вниз
        this.y += this.speed * dt;

        // Деактивация при выходе за экран
        const { h } = getSize();
        if (this.y > h + this.radius) {
            this.deactivate();
        }
    }

    hit() {
        if (!this.active) return false;

        this.hp--;
        if (this.hp <= 0) {
            return true; // Готов к активации
        }
        return false;
    }

    getUpgrade() {
        return UPGRADES[this.upgradeId];
    }
}

export class PickupPool {
    constructor(size = 20) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new Pickup());
        }
    }

    spawn(x, y, upgradeId) {
        const pickup = this.pool.find(p => !p.active);
        if (pickup) {
            pickup.activate(x, y, upgradeId);
            return pickup;
        }
        return null;
    }

    /**
     * Спавнить случайный бонус в случайной позиции
     */
    spawnRandom() {
        const { w } = getSize();
        const x = Math.random() * (w - 100) + 50;
        const y = -30;

        // Выбираем случайный апгрейд
        const upgradeIds = Object.keys(UPGRADES);
        const randomId = upgradeIds[Math.floor(Math.random() * upgradeIds.length)];

        return this.spawn(x, y, randomId);
    }

    update(dt) {
        for (const pickup of this.pool) {
            if (pickup.active) {
                pickup.update(dt);
            }
        }
    }

    getActive() {
        return this.pool.filter(p => p.active);
    }

    reset() {
        for (const pickup of this.pool) {
            pickup.deactivate();
        }
    }
}