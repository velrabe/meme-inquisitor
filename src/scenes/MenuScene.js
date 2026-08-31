import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, REGISTRY_KEYS, SCENE_KEYS } from '../config/gameConfig.js';

const TITLE_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '42px',
  color: '#f4f4f4',
};

const COINS_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '22px',
  color: '#d8d8de',
};

const BUTTON_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '24px',
  color: '#f3f3f3',
};

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.menu);
  }

  create() {
    const profile = this.registry.get(REGISTRY_KEYS.profile);
    const platform = this.registry.get(REGISTRY_KEYS.platform);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x141418);

    this.add.text(GAME_WIDTH / 2, 220, 'Meme Inquisitor', TITLE_STYLE).setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 290, `Coins ${profile.coins}`, COINS_STYLE)
      .setOrigin(0.5);

    this.#addButton(GAME_WIDTH / 2, 430, 'Play', () => {
      this.scene.start(SCENE_KEYS.game);
    });

    this.#addButton(GAME_WIDTH / 2, 510, 'Shop', () => {
      this.scene.start(SCENE_KEYS.shop);
    });

    if (!this.registry.get(REGISTRY_KEYS.gameReadySent)) {
      this.registry.set(REGISTRY_KEYS.gameReadySent, true);
      platform.gameReady();
    }
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
