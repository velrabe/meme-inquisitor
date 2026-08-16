import { Enemy } from '../entities/Enemy.js';
import { getEnemyType } from '../data/enemyTypes.js';
import { LAYOUT } from '../data/layout.js';

export class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
  }

  spawn(typeId, x) {
    const type = getEnemyType(typeId);

    if (!type) {
      console.warn(`EnemySystem: unknown enemy type "${typeId}"`);
      return null;
    }

    const clampedX = Math.min(LAYOUT.playableMaxX, Math.max(LAYOUT.playableMinX, x));
    const enemy = new Enemy(this.scene, type, clampedX, LAYOUT.spawnY);
    this.enemies.push(enemy);
    return enemy;
  }

  update(dt) {
    const travel = Math.max(1, LAYOUT.barrierY - LAYOUT.spawnY);

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      enemy.updatePosition(enemy.y + enemy.speed * dt);
      const progress = (enemy.y - LAYOUT.spawnY) / travel;
      enemy.setDepthProgress(progress);
    }
  }

  getActive() {
    return this.enemies.filter((enemy) => enemy.active);
  }

  cleanup() {
    const remaining = [];

    for (const enemy of this.enemies) {
      if (enemy.active) {
        remaining.push(enemy);
      } else {
        enemy.destroy();
      }
    }

    this.enemies = remaining;
  }

  shutdown() {
    for (const enemy of this.enemies) {
      enemy.destroy();
    }

    this.enemies = [];
  }
}
