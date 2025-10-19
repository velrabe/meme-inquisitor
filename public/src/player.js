// Логика игрока
import { CONFIG } from './config.js';
import { getSize } from './renderer.js';

export class Player {
    constructor(bulletPool, upgradeManager = null) {
        this.bulletPool = bulletPool;
        this.upgradeManager = upgradeManager;
        this.reset();
    }
    
    reset() {
        const { w, h } = getSize();
        this.x = w / 2;
        this.y = h - CONFIG.SAFE_ZONE_HEIGHT - 60; // Позиция над safe zone
        this.radius = CONFIG.PLAYER_RADIUS;
        this.speed = CONFIG.PLAYER_SPEED;
        this.fireTimer = 0;
        this.fireDelay = CONFIG.PLAYER_FIRE_DELAY;
    }
    
    update(dt, input) {
        const { w } = getSize();
        
        // Управление движением
        let dx = 0;
        
        if (input.dragging) {
            // Drag режим - следуем за пальцем/мышью
            const targetX = input.dragX;
            const diff = targetX - this.x;
            const moveSpeed = this.speed * dt;
            
            if (Math.abs(diff) > moveSpeed) {
                dx = Math.sign(diff) * moveSpeed;
            } else {
                dx = diff;
            }
        } else {
            // Клавиатура/стрелки
            if (input.left) dx -= this.speed * dt;
            if (input.right) dx += this.speed * dt;
        }
        
        this.x += dx;
        
        // Ограничение в границах экрана
        if (this.x < this.radius) this.x = this.radius;
        if (this.x > w - this.radius) this.x = w - this.radius;
        
        // Автоматическая стрельба
        this.fireTimer -= dt * 1000; // dt в секундах, timer в мс
        
        if (this.fireTimer <= 0) {
            this.fire();
            this.fireTimer = this.fireDelay;
        }
    }
    
    fire() {
        // Проверяем, не заблокирован ли огонь (например, лазером)
        if (this.upgradeManager && this.upgradeManager.isFireBlocked()) {
            return;
        }

        // Получаем мультипликатор скорости пули
        const speedMultiplier = this.upgradeManager 
            ? this.upgradeManager.multipliers.bulletSpeed 
            : 1;

        // Создаем базовую пулю
        const fireFn = (x, y, angle = -Math.PI / 2) => {
            const bullet = this.bulletPool.spawn(x, y, angle, speedMultiplier);
            if (bullet && this.upgradeManager) {
                this.upgradeManager.onBulletSpawn(bullet);
            }
        };

        // Создаем основную пулю
        fireFn(this.x, this.y - this.radius);

        // Вызываем хук для дополнительных пуль (например, triple shot)
        if (this.upgradeManager) {
            this.upgradeManager.onFire(fireFn, this.x, this.y - this.radius);
        }
    }
    
    // Проверка, попал ли touch/click по игроку
    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return (dx * dx + dy * dy) <= (this.radius * this.radius * 4); // Увеличенная зона для удобства
    }
}

