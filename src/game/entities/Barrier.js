const BARRIER_TEXTURE_KEY = 'barrier-block-states';

const FRAME_BY_STATE = {
  intact: 0,
  damaged: 1,
  broken: 2,
};

export class Barrier {
  constructor(scene, options) {
    this.scene = scene;
    this.barrierY = options.barrierY;
    this.lossLineY = options.lossLineY;
    this.blockMaxDurability = options.maxDurability;
    this.blocks = [];

    const blockCount = 4;
    const gap = 0;
    const blockWidth = options.blockWidth ?? options.gameWidth / blockCount;
    const totalWidth = blockCount * blockWidth + (blockCount - 1) * gap;
    const startX = (options.gameWidth - totalWidth) / 2 + blockWidth / 2;

    for (let index = 0; index < blockCount; index += 1) {
      const x = startX + index * (blockWidth + gap);
      const sprite = scene.add.image(x, this.barrierY, BARRIER_TEXTURE_KEY, FRAME_BY_STATE.intact);
      const blockHeight = options.blockHeight ?? blockWidth * (sprite.height / sprite.width);

      sprite.setOrigin(0.5, 1);
      sprite.setDisplaySize(blockWidth, blockHeight);
      sprite.setDepth(this.barrierY);
      this.blocks.push({
        sprite,
        x,
        width: blockWidth,
        currentDurability: this.blockMaxDurability,
        broken: false,
      });
    }

    this.#refreshVisuals();
  }

  findBlockForRange(left, right) {
    let bestMatch = null;
    let bestOverlap = 0;

    for (const block of this.blocks) {
      const blockLeft = block.x - block.width / 2;
      const blockRight = block.x + block.width / 2;
      const overlap = Math.max(0, Math.min(right, blockRight) - Math.max(left, blockLeft));

      if (overlap > bestOverlap) {
        bestMatch = block;
        bestOverlap = overlap;
      }
    }

    return bestMatch;
  }

  takeHit(block) {
    if (!block || block.broken) {
      return false;
    }

    block.currentDurability = Math.max(0, block.currentDurability - 1);
    block.broken = block.currentDurability <= 0;
    this.#refreshBlockVisual(block);

    return true;
  }

  getDurabilities() {
    return this.blocks.map((block) => block.currentDurability);
  }

  get maxDurability() {
    return this.blockMaxDurability;
  }

  destroy() {
    for (const block of this.blocks) {
      block.sprite.destroy();
    }

    this.blocks = [];
  }

  #refreshVisuals() {
    for (const block of this.blocks) {
      this.#refreshBlockVisual(block);
    }
  }

  #refreshBlockVisual(block) {
    const state = this.#visualState(block);
    const frame = FRAME_BY_STATE[state];

    if (block.sprite.frame.name !== frame) {
      block.sprite.setFrame(frame);
    }
  }

  #visualState(block) {
    if (block.currentDurability <= 0) {
      return 'broken';
    }

    if (block.currentDurability >= this.blockMaxDurability) {
      return 'intact';
    }

    return 'damaged';
  }
}
