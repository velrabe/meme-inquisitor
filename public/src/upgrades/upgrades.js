// Реестр всех улучшений (powerups)
import { CONFIG } from '../config.js';

export const UPGRADES = {
  // 1) Скорость пули x2 (5 сек)
  bulletSpeedX2: {
    id: 'bulletSpeedX2',
    label: 'Speed++',
    type: 'timed',
    duration: 5,
    hitsToActivate: 1,
    color: '#00FFFF',
    apply(mgr) {
      mgr.multipliers.bulletSpeed *= 2;
    },
    remove(mgr) {
      mgr.multipliers.bulletSpeed /= 2;
    },
  },

  // 2) Пирсинг 1 враг (пробивает одного, исчезает на втором)
  pierce1: {
    id: 'pierce1',
    label: 'Pierce',
    type: 'timed',
    duration: 5,
    hitsToActivate: 1,
    color: '#FF00FF',
    onBulletSpawn(b) {
      b.pierceLeft = Math.max(1, (b.pierceLeft || 0));
    },
    onBulletHit({ bullet }) {
      if (bullet.pierceLeft > 0) {
        bullet.pierceLeft--;
        bullet._keepAlive = true;
      }
    },
  },

  // 3) Трипл-шот (0°, -5°, +5°)
  triple: {
    id: 'triple',
    label: 'Triple',
    type: 'timed',
    duration: 5,
    hitsToActivate: 1,
    color: '#FFFF00',
    onFire(mgr, fireFn, originX, originY) {
      // базовую пулю уже создаст обычный огонь — мы добавим 2 доп.:
      // Углы должны быть относительно вертикали вверх (-90°)
      fireFn(originX, originY, -Math.PI / 2 - 5 * Math.PI / 180); // -95°
      fireFn(originX, originY, -Math.PI / 2 + 5 * Math.PI / 180); // -85°
    }
  },

  // 4) Взрыв при активации (AoE) — срабатывает один раз в момент добивания бонуса
  bomb: {
    id: 'bomb',
    label: 'Boom',
    type: 'instant',
    hitsToActivate: 1,
    color: '#FF0000',
    onActivate(mgr, x, y) {
      const R = 320; // увеличен в 2 раза (было 160)
      mgr.killEnemiesInRadius(x, y, R);
      mgr.spawnRingFx?.(x, y, R); // опц: визуальный круг
    }
  },

  // 5) Лазер — замена оружия на луч, который прожигает всё (5 сек)
  laser: {
    id: 'laser',
    label: 'Laser',
    type: 'timed',
    duration: 5,
    hitsToActivate: 2, // нужно 2 попадания в бонус
    color: '#FFFFFF',
    startWeaponOverride(mgr) {
      mgr.weaponOverride = {
        type: 'laser',
        t: 0,
        update(dt, world) {
          // держим непрерывный луч от дула вверх
          this.t += dt;
          const x = world.player.x;
          const y1 = world.player.y - 60;
          const y0 = -50;
          // пересекаем «линию» с окружностями врагов
          const enemies = world.enemies.getActive();
          for (const e of enemies) {
            if (!e || !e.active) continue;
            const dx = e.x - x;
            // Проверяем коллизию с учетом радиуса врага
            if (Math.abs(dx) < (12 + e.radius) && e.y < world.player.y && e.y > y0) {
              const killed = e.hit(); // используем правильный метод
              if (killed) {
                world.score += CONFIG.POINTS_PER_KILL; // используем константу
              }
            }
          }
        },
        draw(ctx, world) {
          const x = world.player.x;
          const y = world.player.y - 60;
          ctx.strokeStyle = '#fff8c6';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, -40);
          ctx.stroke();
        },
        fireBlocked: true // чтобы обычные пули не летели
      };
    },
    endWeaponOverride(mgr) {
      mgr.weaponOverride = null;
    },
  },
};