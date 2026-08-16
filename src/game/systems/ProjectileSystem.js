import { Projectile } from '../entities/Projectile.js';

export class ProjectileSystem {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
  }

  spawnFromWeapon(x, y, weapon) {
    const isCritical = Math.random() < weapon.criticalChance;
    const projectile = new Projectile(this.scene, {
      x,
      y,
      speed: weapon.projectileSpeed,
      damage: isCritical ? weapon.damage * 2 : weapon.damage,
      width: weapon.projectileWidth,
      height: weapon.projectileHeight,
    });

    this.projectiles.push(projectile);
    return projectile;
  }

  update(dt) {
    for (const projectile of this.projectiles) {
      if (!projectile.active) {
        continue;
      }

      projectile.updatePosition(projectile.y - projectile.speed * dt);

      if (projectile.y < -projectile.height) {
        projectile.deactivate();
      }
    }
  }

  getActive() {
    return this.projectiles.filter((projectile) => projectile.active);
  }

  cleanup() {
    const remaining = [];

    for (const projectile of this.projectiles) {
      if (projectile.active) {
        remaining.push(projectile);
      } else {
        projectile.destroy();
      }
    }

    this.projectiles = remaining;
  }

  shutdown() {
    for (const projectile of this.projectiles) {
      projectile.destroy();
    }

    this.projectiles = [];
  }
}
