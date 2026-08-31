import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../config/gameConfig.js';

const TITLE_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '40px',
  color: '#f4f4f4',
};

const BODY_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '24px',
  color: '#d8d8de',
  align: 'center',
};

const BUTTON_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '24px',
  color: '#f3f3f3',
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.result);
  }

  init(data = {}) {
    this.result = data;
  }

  create() {
    const won = this.result?.outcome === 'won' || this.result?.won === true;
    const score = this.result?.score ?? 0;
    const kills = this.result?.kills ?? 0;
    const elapsed = Math.floor(this.result?.elapsedTime ?? 0);
    const coins = this.result?.coinsEarned ?? 0;

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x141418);
    this.add
      .text(GAME_WIDTH / 2, 220, won ? 'Victory' : 'Defeat', TITLE_STYLE)
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        320,
        `Score ${score}\nKills ${kills}\nTime ${elapsed}s\nCoins +${coins}`,
        BODY_STYLE,
      )
      .setOrigin(0.5);

    this.#addButton(GAME_WIDTH / 2, 520, 'Retry', () => {
      this.scene.start(SCENE_KEYS.game);
    });

    this.#addButton(GAME_WIDTH / 2, 600, 'Menu', () => {
      this.scene.start(SCENE_KEYS.menu);
    });
  }

  #addButton(x, y, label, onClick) {
    const background = this.add.rectangle(x, y, 280, 56, 0x2c2c34).setStrokeStyle(2, 0x8a8a96);
    const text = this.add.text(x, y, label, BUTTON_STYLE).setOrigin(0.5);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', () => background.setFillStyle(0x3a3a44));
    background.on('pointerout', () => background.setFillStyle(0x2c2c34));
    background.on('pointerup', onClick);
    return { background, text };
  }
}
