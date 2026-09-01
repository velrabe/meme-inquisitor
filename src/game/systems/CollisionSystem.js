export class CollisionSystem {
  constructor(session) {
    this.session = session;
  }

  update() {
    this.#resolveProjectilesVsEnemies();
    this.#resolveEnemiesVsWorld();
  }

  #resolveProjectilesVsEnemies() {
    const projectiles = this.session.projectileSystem.getActive();
    const enemies = this.session.enemySystem.getActive();

    for (const projectile of projectiles) {
      const hits = [];

      for (const enemy of enemies) {
        if (!enemy.active) {
          continue;
        }

        if (this.#projectileHitsEnemy(projectile, enemy)) {
          hits.push(enemy);
        }
      }

      if (hits.length === 0) {
        continue;
      }

      hits.sort((a, b) => b.y - a.y);
      const target = hits[0];
      projectile.deactivate();

      const killed = target.takeDamage(projectile.damage);

      if (killed) {
        this.session.notifyEnemyKilled(target);
      }
    }
  }

  #resolveEnemiesVsWorld() {
    const enemies = this.session.enemySystem.getActive();
    const barrier = this.session.barrier;

    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }

      if (this.#crossed(enemy.previousY, enemy.y, barrier.barrierY)) {
        const hitbox = enemy.getHitbox();
        const block = barrier.findBlockForRange(hitbox.left, hitbox.right);

        if (block && !block.broken) {
          enemy.active = false;
          enemy.destroyed = true;
          barrier.takeHit(block);
          this.session.notifyBarrierHit();
          continue;
        }
      }

      if (this.#crossed(enemy.previousY, enemy.y, barrier.lossLineY)) {
        enemy.active = false;
        enemy.destroyed = true;
        this.session.notifyLoss();
        continue;
      }
    }
  }

  #projectileHitsEnemy(projectile, enemy) {
    const hitbox = enemy.getHitbox();

    if (projectile.x < hitbox.left || projectile.x > hitbox.right) {
      return false;
    }

    const segmentTop = Math.min(projectile.previousY, projectile.y);
    const segmentBottom = Math.max(projectile.previousY, projectile.y);

    return segmentTop <= hitbox.bottom && segmentBottom >= hitbox.top;
  }

  #crossed(previousY, currentY, lineY) {
    return previousY < lineY && currentY >= lineY;
  }
}
