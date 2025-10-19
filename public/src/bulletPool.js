// Object pool для пуль
import { CONFIG } from './config.js';
import { getSize } from './renderer.js';

class Bullet {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.radius = CONFIG.BULLET_RADIUS;
        this.speed = CONFIG.BULLET_SPEED;
        this.color = CONFIG.BULLET_COLOR;
        this.angle = -Math.PI / 2; // угол по умолчанию - вверх
        this.vx = 0;
        this.vy = 0;
        this.pierceLeft = 0; // сколько врагов может пробить
        this._keepAlive = false; // флаг для системы столкновений
    }
    
    activate(x, y, angle = -Math.PI / 2, speedMultiplier = 1) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.angle = angle;
        
        // Рассчитываем скорость с учётом угла и мультипликатора
        const finalSpeed = this.speed * speedMultiplier;
        this.vx = Math.cos(angle) * finalSpeed;
        this.vy = Math.sin(angle) * finalSpeed;
        
        // Сбрасываем флаги
        this.pierceLeft = 0;
        this._keepAlive = false;
    }
    
    deactivate() {
        this.active = false;
        this.pierceLeft = 0;
        this._keepAlive = false;
    }
    
    update(dt) {
        if (!this.active) return;
        
        // Движение по вектору скорости
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Деактивация при выходе за экран
        const { w, h } = getSize();
        if (this.y < -this.radius || this.y > h + this.radius || 
            this.x < -this.radius || this.x > w + this.radius) {
            this.deactivate();
        }
    }
}

export class BulletPool {
    constructor(size = CONFIG.BULLET_POOL_SIZE) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new Bullet());
        }
    }
    
    spawn(x, y, angle = -Math.PI / 2, speedMultiplier = 1) {
        // Ищем неактивную пулю
        const bullet = this.pool.find(b => !b.active);
        if (bullet) {
            bullet.activate(x, y, angle, speedMultiplier);
            return bullet;
        }
        return null;
    }
    
    update(dt) {
        for (const bullet of this.pool) {
            if (bullet.active) {
                bullet.update(dt);
            }
        }
    }
    
    getActive() {
        return this.pool.filter(b => b.active);
    }
    
    reset() {
        for (const bullet of this.pool) {
            bullet.deactivate();
        }
    }
}

