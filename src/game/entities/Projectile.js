import { LAYOUT } from '../data/layout.js';

export class Projectile {
  constructor(scene, options) {
    this.scene = scene;
    this.x = options.x;
    this.y = options.y;
    this.previousY = options.y;
    this.speed = options.speed;
    this.damage = options.damage;
    this.width = options.width;
    this.height = options.height;
    this.active = true;

    this.visual = scene.add.rectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      options.color ?? LAYOUT.projectileColor,
    );
    this.visual.setOrigin(0.5, 1);
    this.visual.setDepth(this.y + 20);
  }

  updatePosition(nextY) {
    this.previousY = this.y;
    this.y = nextY;
    this.visual.setPosition(this.x, this.y);
    this.visual.setDepth(this.y + 20);
  }

  deactivate() {
    this.active = false;
  }

  destroy() {
    this.active = false;

    if (this.visual) {
      this.visual.destroy();
      this.visual = null;
    }
  }
}
