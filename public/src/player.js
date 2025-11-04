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
        this.shootFlash = 0; // Таймер свечения при выстреле
        this.velocity = 0; // Текущая скорость для плавного ускорения
        this.chainAngle = 0; // Угол поворота цепи
    }
    
    update(dt, input) {
        const { w } = getSize();
        
        // Управление движением с плавным ускорением
        const acceleration = 1200; // Ускорение
        const deceleration = 800; // Замедление
        const maxSpeed = this.speed;
        
        let targetVelocity = 0;
        
        if (input.dragging) {
            // Drag режим - следуем за пальцем/мышью
            const targetX = input.dragX;
            const diff = targetX - this.x;
            
            if (Math.abs(diff) > 5) {
                targetVelocity = Math.sign(diff) * maxSpeed;
            }
        } else {
            // Клавиатура/стрелки
            if (input.left) targetVelocity = -maxSpeed;
            if (input.right) targetVelocity = maxSpeed;
        }
        
        // Плавное ускорение/замедление
        if (Math.abs(targetVelocity) > Math.abs(this.velocity)) {
            // Ускоряемся
            const change = acceleration * dt;
            if (targetVelocity > this.velocity) {
                this.velocity = Math.min(this.velocity + change, targetVelocity);
            } else {
                this.velocity = Math.max(this.velocity - change, targetVelocity);
            }
        } else {
            // Замедляемся
            const change = deceleration * dt;
            if (this.velocity > 0) {
                this.velocity = Math.max(0, this.velocity - change);
            } else if (this.velocity < 0) {
                this.velocity = Math.min(0, this.velocity + change);
            }
        }
        
        // Применяем скорость
        this.x += this.velocity * dt;
        
        // Ограничение в границах экрана
        if (this.x < this.radius) {
            this.x = this.radius;
            this.velocity = 0;
        }
        if (this.x > w - this.radius) {
            this.x = w - this.radius;
            this.velocity = 0;
        }
        
        // Анимация поворота цепи (плавно к целевому углу)
        const targetChainAngle = (this.velocity / maxSpeed) * 10; // -10 до +10 градусов
        const angleSpeed = 30; // градусов в секунду
        const angleDiff = targetChainAngle - this.chainAngle;
        
        if (Math.abs(angleDiff) > angleSpeed * dt) {
            this.chainAngle += Math.sign(angleDiff) * angleSpeed * dt;
        } else {
            this.chainAngle = targetChainAngle;
        }
        
        // Автоматическая стрельба
        this.fireTimer -= dt * 1000; // dt в секундах, timer в мс
        
        if (this.fireTimer <= 0) {
            this.fire();
            this.fireTimer = this.fireDelay;
        }
        
        // Обновление таймера свечения выстрела
        if (this.shootFlash > 0) {
            this.shootFlash -= dt * 1000; // dt в секундах, timer в мс
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
        
        // Активируем эффект свечения при выстреле (длительность 100мс)
        this.shootFlash = 100;
    }
    
    // Проверка, попал ли touch/click по игроку
    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return (dx * dx + dy * dy) <= (this.radius * this.radius * 4); // Увеличенная зона для удобства
    }
}

