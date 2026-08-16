import { LAYOUT } from '../data/layout.js';

export class InputSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.pointerDown = false;
    this.pointerX = player.x;
    this.keys = null;

    if (scene.input.keyboard) {
      this.keys = scene.input.keyboard.addKeys({
        a: 'A',
        d: 'D',
        left: 'LEFT',
        right: 'RIGHT',
      });
    }

    this.onPointerDown = (pointer) => {
      this.pointerDown = true;
      this.pointerX = this.#toWorldX(pointer);
    };

    this.onPointerMove = (pointer) => {
      if (!this.pointerDown && !pointer.isDown) {
        return;
      }

      this.pointerDown = true;
      this.pointerX = this.#toWorldX(pointer);
    };

    this.onPointerUp = () => {
      this.pointerDown = false;
    };

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointermove', this.onPointerMove);
    scene.input.on('pointerup', this.onPointerUp);
    scene.input.on('pointerupoutside', this.onPointerUp);
  }

  update(dt) {
    if (!this.player?.active) {
      return;
    }

    if (this.pointerDown) {
      this.player.setX(this.pointerX);
      return;
    }

    let direction = 0;

    if (this.keys) {
      if (this.keys.a.isDown || this.keys.left.isDown) {
        direction -= 1;
      }

      if (this.keys.d.isDown || this.keys.right.isDown) {
        direction += 1;
      }
    }

    if (direction !== 0) {
      this.player.setX(this.player.x + direction * LAYOUT.playerMoveSpeed * dt);
    }
  }

  shutdown() {
    this.scene.input.off('pointerdown', this.onPointerDown);
    this.scene.input.off('pointermove', this.onPointerMove);
    this.scene.input.off('pointerup', this.onPointerUp);
    this.scene.input.off('pointerupoutside', this.onPointerUp);

    if (this.keys) {
      this.keys = null;
    }
  }

  #toWorldX(pointer) {
    const point = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    return point.x;
  }
}
