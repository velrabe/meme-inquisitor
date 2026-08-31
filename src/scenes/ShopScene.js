import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, REGISTRY_KEYS, SCENE_KEYS } from '../config/gameConfig.js';

const TITLE_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '36px',
  color: '#f4f4f4',
};

const COINS_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '22px',
  color: '#d8d8de',
};

const TAB_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '20px',
  color: '#f3f3f3',
};

const EMPTY_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '20px',
  color: '#9a9aa2',
  align: 'center',
  wordWrap: { width: 420 },
};

export class ShopScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.shop);
  }

  create() {
    const profile = this.registry.get(REGISTRY_KEYS.profile);
    this.activeTab = 'perks';

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x141418);
    this.add.text(GAME_WIDTH / 2, 80, 'Shop', TITLE_STYLE).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 130, `Coins ${profile.coins}`, COINS_STYLE).setOrigin(0.5);

    this.perkTab = this.#addTab(170, 200, 'Perks', () => this.#setTab('perks'));
    this.skinTab = this.#addTab(370, 200, 'Skins', () => this.#setTab('skins'));

    this.content = this.add.container(GAME_WIDTH / 2, 520);
    this.contentBackground = this.add.rectangle(0, 0, 460, 420, 0x1c1c22).setStrokeStyle(1, 0x3a3a44);
    this.contentLabel = this.add.text(0, 0, '', EMPTY_STYLE).setOrigin(0.5);
    this.content.add([this.contentBackground, this.contentLabel]);

    this.#addButton(GAME_WIDTH / 2, 880, 'Back', () => {
      this.scene.start(SCENE_KEYS.menu);
    });

    this.#setTab('perks');
  }

  #setTab(tab) {
    this.activeTab = tab;
    this.#paintTab(this.perkTab, tab === 'perks');
    this.#paintTab(this.skinTab, tab === 'skins');
    this.contentLabel.setText(
      tab === 'perks' ? 'Perks coming later' : 'Skins coming later',
    );
  }

  #addTab(x, y, label, onClick) {
    const background = this.add.rectangle(x, y, 180, 48, 0x2c2c34).setStrokeStyle(2, 0x8a8a96);
    const text = this.add.text(x, y, label, TAB_STYLE).setOrigin(0.5);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerup', onClick);
    return { background, text };
  }

  #paintTab(tab, active) {
    tab.background.setFillStyle(active ? 0x3f3f4a : 0x2c2c34);
  }

  #addButton(x, y, label, onClick) {
    const background = this.add.rectangle(x, y, 280, 56, 0x2c2c34).setStrokeStyle(2, 0x8a8a96);
    const text = this.add.text(x, y, label, TAB_STYLE).setOrigin(0.5);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', () => background.setFillStyle(0x3a3a44));
    background.on('pointerout', () => background.setFillStyle(0x2c2c34));
    background.on('pointerup', onClick);
    return { background, text };
  }
}
