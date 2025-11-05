// Object pool для врагов
import { CONFIG } from './config.js';

class Enemy {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.radius = CONFIG.ENEMY_RADIUS;
        this.speed = CONFIG.ENEMY_SPEED;
        this.hp = CONFIG.ENEMY_HP;
        this.maxHp = CONFIG.ENEMY_HP; // для отображения полоски HP
        this.isFast = false; // быстрый враг
        this.id = Math.random(); // уникальный ID для стабильной сортировки
        
        // Анимация
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = CONFIG.ENEMY_ANIMATION_SPEED;
        this.animationFrames = CONFIG.ENEMY_ANIMATION_FRAMES;
    }
    
    activate(x, y, speed, depth = 0, hp = CONFIG.ENEMY_HP, isFast = false) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.hp = hp;
        this.maxHp = hp;
        this.isFast = isFast;
        this.depth = depth; // глубина для z-index
    }
    
    deactivate() {
        this.active = false;
    }
    
    update(dt) {
        if (!this.active) return;
        
        // Движение вниз
        this.y += this.speed * dt;
        
        // Обновление анимации
        this.animationTimer += dt * 1000; // dt в секундах, timer в мс
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % this.animationFrames;
            this.animationTimer = 0;
        }
    }
    
    hit(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.deactivate();
            return true; // Враг убит
        }
        return false;
    }
}

export class EnemyPool {
    constructor(size = CONFIG.ENEMY_POOL_SIZE) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new Enemy());
        }
    }
    
    spawn(x, y, speed, depth = 0, hp = CONFIG.ENEMY_HP, isFast = false) {
        // Ищем неактивного врага
        const enemy = this.pool.find(e => !e.active);
        if (enemy) {
            enemy.activate(x, y, speed, depth, hp, isFast);
        }
    }
    
    update(dt) {
        for (const enemy of this.pool) {
            if (enemy.active) {
                enemy.update(dt);
            }
        }
    }
    
    getActive() {
        return this.pool.filter(e => e.active);
    }
    
    reset() {
        for (const enemy of this.pool) {
            enemy.deactivate();
        }
    }
}

