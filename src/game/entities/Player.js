import { LAYOUT } from '../data/layout.js';

export class Player {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.x = options.x ?? LAYOUT.gameWidth / 2;
    this.y = options.y ?? LAYOUT.playerY;
    this.minX = options.minX ?? LAYOUT.playableMinX;
    this.maxX = options.maxX ?? LAYOUT.playableMaxX;
    this.weaponId = options.weaponId ?? 'rifle';
    this.active = true;
    this.displayWidth = options.displayWidth ?? LAYOUT.playerDisplayWidth;
    this.muzzleOffsetY = options.muzzleOffsetY ?? 0.72;

    this.sprite = scene.add.sprite(this.x, this.y, options.textureKey ?? 'player-cat-rifle-idle');
    this.sprite.setOrigin(0.5, 1);
    this.#applyDisplaySize();
    this.sprite.setDepth(this.y);
  }

  get muzzleX() {
    return this.x;
  }

  get muzzleY() {
    return this.y - this.sprite.displayHeight * this.muzzleOffsetY;
  }

  setX(nextX) {
    this.x = Math.min(this.maxX, Math.max(this.minX, nextX));
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setDepth(this.y);
  }

  destroy() {
    this.active = false;

    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  #applyDisplaySize() {
    const frame = this.sprite.frame;
    const aspect = frame.height / Math.max(frame.width, 1);
    this.sprite.setDisplaySize(this.displayWidth, this.displayWidth * aspect);
  }
}
