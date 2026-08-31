import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy.js';
import { getEnemyType } from '../data/enemyTypes.js';
import { LAYOUT } from '../data/layout.js';

export class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
  }

  spawn(typeId, lateralPosition) {
    const type = getEnemyType(typeId);

    if (!type) {
      console.warn(`EnemySystem: unknown enemy type "${typeId}"`);
      return null;
    }

    const enemy = new Enemy(this.scene, type, lateralPosition);
    this.enemies.push(enemy);
    return enemy;
  }

  update(dt) {
    const travel = Math.max(1, LAYOUT.barrierY - LAYOUT.spawnY);

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      if (!enemy.isDropping) {
        const speedScale = Phaser.Math.Linear(
          LAYOUT.farEnemySpeedScale,
          LAYOUT.nearEnemySpeedScale,
          Phaser.Math.Clamp(enemy.progress, 0, 1),
        );
        enemy.progress += (enemy.speed * speedScale * dt) / travel;
      }

      enemy.update(dt);
      enemy.applyProjection();
      enemy.setDepthProgress(enemy.progress);
    }
  }

  getActive() {
    return this.enemies.filter((enemy) => enemy.active);
  }

  getNearSpawnLaterals(maxProgress = 0.2) {
    return this.enemies
      .filter((enemy) => enemy.active && (enemy.isDropping || enemy.progress <= maxProgress))
      .map((enemy) => enemy.lateralPosition);
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
