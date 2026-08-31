import Phaser from 'phaser';
import { LAYOUT, getEnemyScale, projectGroundPosition } from '../data/layout.js';
import {
  SAHUR_FRAME_SIZE,
  SAHUR_PART_IDS,
  SAHUR_PARTS,
  getSahurRestPose,
  getSahurStepPose,
  getSahurWalkBlend,
} from '../data/enemyRig.js';

export class Enemy {
  constructor(scene, type, lateralPosition) {
    this.scene = scene;
    this.typeId = type.id;
    this.maxHp = type.maxHp;
    this.hp = type.maxHp;
    this.speed = type.speed;
    this.reward = type.reward;
    this.displayWidth = type.displayWidth;
    this.hitboxWidthRatio = type.hitboxWidthRatio;
    this.hitboxHeightRatio = type.hitboxHeightRatio;
    this.lateralPosition = Phaser.Math.Clamp(lateralPosition, -1, 1);
    this.progress = 0;

    const start = projectGroundPosition(this.lateralPosition, 0);
    this.x = start.x;
    this.dropFromY = LAYOUT.spawnDropFromY;
    this.dropToY = start.y;
    this.dropDuration = LAYOUT.spawnDropDuration;
    this.dropElapsed = 0;
    this.y = this.dropFromY;
    this.previousY = this.dropFromY;
    this.active = true;
    this.destroyed = false;
    this.walkElapsedMs = 0;

    this.restPose = getSahurRestPose();
    this.stepPose = getSahurStepPose();

    this.container = scene.add.container(this.x, this.y);
    this.container.setSize(SAHUR_FRAME_SIZE, SAHUR_FRAME_SIZE);
    this.container.setScale(this.displayWidth / SAHUR_FRAME_SIZE);
    this.sprite = this.container;
    this.parts = {};

    for (const id of SAHUR_PART_IDS) {
      const definition = SAHUR_PARTS[id];
      const rest = this.restPose[id];
      const image = scene.add.image(rest.x, rest.y, definition.textureKey);

      image.setOrigin(definition.origin.x, definition.origin.y);
      image.setScale(rest.scaleX, rest.scaleY);
      image.setAngle(rest.angle);
      this.container.add(image);
      this.parts[id] = image;
    }

    this.setDepthProgress(0);
  }

  get isDropping() {
    return this.dropElapsed < this.dropDuration;
  }

  update(dt) {
    if (!this.active) {
      return;
    }

    if (this.isDropping) {
      this.#updateDrop(dt);
    }

    this.walkElapsedMs += dt * 1000;
    this.#applyPose();
  }

  applyProjection() {
    const projected = projectGroundPosition(this.lateralPosition, this.progress);

    this.previousY = this.y;
    this.x = projected.x;

    if (!this.isDropping) {
      this.y = projected.y;
    }

    this.container.setPosition(this.x, this.y);
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
    const perspective = getEnemyScale(t);
    const tintT = Math.min(1, t / LAYOUT.nearEnemyTintAt);
    const tintAmount = LAYOUT.farEnemyTint + (LAYOUT.nearEnemyTint - LAYOUT.farEnemyTint) * tintT;
    const shade = Math.round(0xff * tintAmount);
    const tint = (shade << 16) | (shade << 8) | shade;

    this.container.setScale((this.displayWidth / SAHUR_FRAME_SIZE) * perspective);
    this.container.setAlpha(1);
    this.container.setDepth(this.y);

    for (const id of SAHUR_PART_IDS) {
      this.parts[id].setTint(tint);
    }
  }

  getHitbox() {
    const width = this.container.displayWidth * this.hitboxWidthRatio;
    const height = this.container.displayHeight * this.hitboxHeightRatio;

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

    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }

    this.sprite = null;
    this.parts = null;
  }

  #updateDrop(dt) {
    this.dropElapsed += dt;
    const t = Math.min(1, this.dropElapsed / this.dropDuration);

    this.previousY = this.y;
    this.y = Phaser.Math.Linear(this.dropFromY, this.dropToY, t);
  }

  #applyPose() {
    const blend = getSahurWalkBlend(this.walkElapsedMs);

    for (const id of SAHUR_PART_IDS) {
      const rest = this.restPose[id];
      const step = this.stepPose[id];

      this.parts[id].setPosition(
        Phaser.Math.Linear(rest.x, step.x, blend),
        Phaser.Math.Linear(rest.y, step.y, blend),
      );
      this.parts[id].setScale(
        Phaser.Math.Linear(rest.scaleX, step.scaleX, blend),
        Phaser.Math.Linear(rest.scaleY, step.scaleY, blend),
      );
      this.parts[id].setAngle(Phaser.Math.Linear(rest.angle, step.angle, blend));
    }
  }
}
