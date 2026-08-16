import { hasAnimation } from '../../assets/animations.js';
import { LAYOUT } from '../data/layout.js';

export class Enemy {
  constructor(scene, type, x, y) {
    this.scene = scene;
    this.typeId = type.id;
    this.textureKey = type.textureKey;
    this.animationKey = type.animationKey || null;
    this.maxHp = type.maxHp;
    this.hp = type.maxHp;
    this.speed = type.speed;
    this.reward = type.reward;
    this.displayWidth = type.displayWidth;
    this.hitboxWidthRatio = type.hitboxWidthRatio;
    this.hitboxHeightRatio = type.hitboxHeightRatio;
    this.x = x;
    this.y = y;
    this.previousY = y;
    this.active = true;
    this.destroyed = false;

    this.sprite = scene.add.sprite(this.x, this.y, this.textureKey);
    this.sprite.setOrigin(0.5, 1);

    if (this.animationKey && hasAnimation(scene, this.animationKey)) {
      this.sprite.play(this.animationKey);
    }

    this.setDepthProgress(0);
  }

  updatePosition(nextY) {
    this.previousY = this.y;
    this.y = nextY;
    this.sprite.setPosition(this.x, this.y);
  }

  takeDamage(amount) {
    if (!this.active) {
      return false;
    }

    this.hp -= amount;

    if (this.hp <= 0) {
      this.active = false;
      this.destroyed = true;
      return true;
    }

    return false;
  }

  setDepthProgress(progress) {
    const t = Math.min(1, Math.max(0, progress));
    const scale = LAYOUT.farEnemyScale + (LAYOUT.nearEnemyScale - LAYOUT.farEnemyScale) * t;
    const alpha = LAYOUT.farEnemyAlpha + (LAYOUT.nearEnemyAlpha - LAYOUT.farEnemyAlpha) * t;
    const shade = Math.round(0x77 + (0xff - 0x77) * t);

    const frame = this.sprite.frame;
    const aspect = frame.height / Math.max(frame.width, 1);
    const width = this.displayWidth * scale;
    this.sprite.setDisplaySize(width, width * aspect);
    this.sprite.setAlpha(alpha);
    this.sprite.setTint((shade << 16) | (shade << 8) | shade);
    this.sprite.setDepth(this.y);
  }

  getHitbox() {
    const width = this.sprite.displayWidth * this.hitboxWidthRatio;
    const height = this.sprite.displayHeight * this.hitboxHeightRatio;

    return {
      left: this.x - width / 2,
      right: this.x + width / 2,
      top: this.y - height,
      bottom: this.y,
    };
  }

  destroy() {
    this.active = false;
    this.destroyed = true;

    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
