const TEXTURE_BY_STATE = {
  intact: 'barrier-block-intact',
  damaged: 'barrier-block-damaged',
  broken: 'barrier-block-broken',
};

export class Barrier {
  constructor(scene, options) {
    this.scene = scene;
    this.barrierY = options.barrierY;
    this.lossLineY = options.lossLineY;
    this.maxDurability = options.maxDurability;
    this.currentDurability = options.maxDurability;
    this.broken = false;
    this.blocks = [];

    const blockCount = 3;
    const blockWidth = options.blockWidth ?? 140;
    const gap = options.gap ?? 12;
    const totalWidth = blockCount * blockWidth + (blockCount - 1) * gap;
    const startX = (options.gameWidth - totalWidth) / 2 + blockWidth / 2;

    for (let index = 0; index < blockCount; index += 1) {
      const x = startX + index * (blockWidth + gap);
      const sprite = scene.add.image(x, this.barrierY, TEXTURE_BY_STATE.intact);
      sprite.setOrigin(0.5, 1);
      sprite.setDisplaySize(blockWidth, options.blockHeight ?? 48);
      sprite.setDepth(this.barrierY);
      this.blocks.push(sprite);
    }

    this.#refreshVisuals();
  }

  takeHit() {
    if (this.broken) {
      return false;
    }

    this.currentDurability = Math.max(0, this.currentDurability - 1);
    this.#refreshVisuals();

    if (this.currentDurability <= 0) {
      this.broken = true;
    }

    return true;
  }

  destroy() {
    for (const block of this.blocks) {
      block.destroy();
    }

    this.blocks = [];
  }

  #refreshVisuals() {
    const state = this.#visualState();
    const textureKey = TEXTURE_BY_STATE[state];

    for (const block of this.blocks) {
      if (block.texture.key !== textureKey) {
        block.setTexture(textureKey);
      }
    }
  }

  #visualState() {
    if (this.currentDurability <= 0) {
      return 'broken';
    }

    if (this.currentDurability >= this.maxDurability) {
      return 'intact';
    }

    return 'damaged';
  }
}
