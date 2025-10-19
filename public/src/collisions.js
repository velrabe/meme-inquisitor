// Система столкновений
import { CONFIG } from './config.js';
import { getSize } from './renderer.js';
import { setState, GameState } from './state.js';

export class CollisionSystem {
    constructor(world) {
        this.world = world;
    }
    
    update() {
        this.checkBulletEnemyCollisions();
        this.checkBulletPickupCollisions();
        this.checkEnemySafeZoneCollisions();
    }
    
    checkBulletEnemyCollisions() {
        const bullets = this.world.bullets.getActive();
        const enemies = this.world.enemies.getActive();
        
        for (const bullet of bullets) {
            bullet._keepAlive = false; // Сброс флага
            
            for (const enemy of enemies) {
                if (this.circleCollision(bullet, enemy)) {
                    // Столкновение!
                    const killed = enemy.hit();
                    
                    if (killed) {
                        // Враг убит, добавляем очки
                        this.world.score += CONFIG.POINTS_PER_KILL;
                    }
                    
                    // Вызываем хук для обработки попадания (пирсинг и т.п.)
                    if (this.world.upgradeManager) {
                        this.world.upgradeManager.onBulletHit(bullet, enemy);
                    }
                    
                    // Проверяем, должна ли пуля остаться активной (пирсинг)
                    if (!bullet._keepAlive) {
                        bullet.deactivate();
                        break;
                    }
                }
            }
        }
    }
    
    checkBulletPickupCollisions() {
        if (!this.world.pickups) return;
        
        const bullets = this.world.bullets.getActive();
        const pickups = this.world.pickups.getActive();
        
        for (const bullet of bullets) {
            for (const pickup of pickups) {
                if (this.circleCollision(bullet, pickup)) {
                    // Столкновение с бонусом
                    bullet.deactivate();
                    
                    const ready = pickup.hit();
                    if (ready) {
                        // Бонус готов к активации
                        if (this.world.upgradeManager) {
                            this.world.upgradeManager.activate(pickup.upgradeId, pickup.x, pickup.y);
                        }
                        pickup.deactivate();
                    }
                    
                    break;
                }
            }
        }
    }
    
    checkEnemySafeZoneCollisions() {
        const { h } = getSize();
        const safeZoneY = h - CONFIG.SAFE_ZONE_HEIGHT;
        const enemies = this.world.enemies.getActive();
        
        for (const enemy of enemies) {
            // Если центр + радиус врага пересекает safe zone
            if (enemy.y + enemy.radius >= safeZoneY) {
                // GAME OVER
                setState(GameState.LOSE);
                return;
            }
        }
    }
    
    circleCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = obj1.radius + obj2.radius;
        
        return distance < minDistance;
    }
}

