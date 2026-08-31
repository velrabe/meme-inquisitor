import Phaser from 'phaser';
import { LAYOUT } from '../data/layout.js';
import {
  PLAYER_FRAME_SIZE,
  PLAYER_MUZZLE,
  PLAYER_PART_IDS,
  PLAYER_PARTS,
  PLAYER_RECOIL,
  PLAYER_WALK,
  getPartOrigin,
  getRestPose,
  getStepPose,
  getWalkBlend,
} from '../data/playerRig.js';

const MOVE_EPSILON = 0.1;

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

    this.moveDirection = 0;
    this.walkDirection = 1;
    this.walkElapsedMs = 0;
    this.recoilElapsedMs = 0;
    this.recoilDurationMs = 0;
    this.recoilBlend = 0;

    this.restPose = getRestPose();
    this.stepRightPose = getStepPose(1);
    this.stepLeftPose = getStepPose(-1);

    const scale = this.displayWidth / PLAYER_FRAME_SIZE;
    this.container = scene.add.container(this.x, this.y);
    this.container.setSize(PLAYER_FRAME_SIZE, PLAYER_FRAME_SIZE);
    this.container.setScale(scale);
    this.container.setDepth(this.y);
    this.sprite = this.container;

    this.parts = {};

    for (const id of PLAYER_PART_IDS) {
      const definition = PLAYER_PARTS[id];
      const origin = getPartOrigin(definition);
      const rest = this.restPose[id];
      const image = scene.add.image(rest.x, rest.y, definition.textureKey);

      image.setOrigin(origin.x, origin.y);
      image.setScale(rest.scaleX, rest.scaleY);
      image.setAngle(rest.angle);
      this.container.add(image);
      this.parts[id] = image;
    }
  }

  get muzzleX() {
    const scale = this.container.scaleX;
    return this.x + (PLAYER_MUZZLE.x - PLAYER_FRAME_SIZE / 2) * scale;
  }

  get muzzleY() {
    const scale = this.container.scaleY;
    return this.y + (PLAYER_MUZZLE.y - PLAYER_FRAME_SIZE + this.#recoilOffsetY('torso')) * scale;
  }

  setX(nextX) {
    const previousX = this.x;
    this.x = Math.min(this.maxX, Math.max(this.minX, nextX));

    const delta = this.x - previousX;
    this.moveDirection = delta > MOVE_EPSILON ? 1 : delta < -MOVE_EPSILON ? -1 : 0;

    this.container.setPosition(this.x, this.y);
    this.container.setDepth(this.y);
  }

  playRecoil(durationMs) {
    this.recoilElapsedMs = 0;
    this.recoilDurationMs = durationMs;
    this.recoilBlend = 0;
  }

  update(dt) {
    if (!this.active) {
      return;
    }

    this.#updateWalk(dt * 1000);
    this.#updateRecoil(dt * 1000);
    this.#applyPose();
    this.moveDirection = 0;
  }

  destroy() {
    this.active = false;

    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }

    this.sprite = null;
    this.parts = null;
  }

  #updateWalk(dtMs) {
    if (this.moveDirection !== 0) {
      this.walkDirection = this.moveDirection;
      this.walkElapsedMs += dtMs;
      return;
    }

    if (this.walkElapsedMs <= 0) {
      return;
    }

    let cycle = this.walkElapsedMs % PLAYER_WALK.cycleMs;

    if (cycle === 0) {
      this.walkElapsedMs = 0;
      return;
    }

    if (cycle > 0 && cycle < PLAYER_WALK.stepAtMs) {
      const blend = cycle / PLAYER_WALK.stepAtMs;
      cycle = PLAYER_WALK.stepAtMs + (1 - blend) * (PLAYER_WALK.cycleMs - PLAYER_WALK.stepAtMs);
    }

    cycle += dtMs;

    if (cycle >= PLAYER_WALK.cycleMs) {
      this.walkElapsedMs = 0;
      return;
    }

    this.walkElapsedMs = cycle;
  }

  #updateRecoil(dtMs) {
    if (this.recoilDurationMs <= 0) {
      this.recoilBlend = 0;
      return;
    }

    this.recoilElapsedMs += dtMs;

    if (this.recoilElapsedMs >= this.recoilDurationMs) {
      this.recoilElapsedMs = 0;
      this.recoilDurationMs = 0;
      this.recoilBlend = 0;
      return;
    }

    const downMs = this.recoilDurationMs * PLAYER_RECOIL.downRatio;

    if (this.recoilElapsedMs <= downMs) {
      this.recoilBlend = this.recoilElapsedMs / downMs;
      return;
    }

    this.recoilBlend =
      1 - (this.recoilElapsedMs - downMs) / (this.recoilDurationMs - downMs);
  }

  #applyPose() {
    const blend = getWalkBlend(this.walkElapsedMs);
    const stepPose = this.walkDirection < 0 ? this.stepLeftPose : this.stepRightPose;

    for (const id of PLAYER_PART_IDS) {
      const rest = this.restPose[id];
      const step = stepPose[id];
      const extraY = this.#recoilOffsetY(id);

      this.parts[id].setPosition(
        Phaser.Math.Linear(rest.x, step.x, blend),
        Phaser.Math.Linear(rest.y, step.y, blend) + extraY,
      );
      this.parts[id].setScale(
        Phaser.Math.Linear(rest.scaleX, step.scaleX, blend),
        Phaser.Math.Linear(rest.scaleY, step.scaleY, blend),
      );
      this.parts[id].setAngle(Phaser.Math.Linear(rest.angle, step.angle, blend));
    }
  }

  #recoilOffsetY(partId) {
    return (PLAYER_RECOIL.offsetY[partId] ?? 0) * this.recoilBlend;
  }
}
