import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, REGISTRY_KEYS, SCENE_KEYS } from '../config/gameConfig.js';
import { ASSET_MANIFEST, queueManifest } from '../assets/manifest.js';
import { registerAnimations } from '../assets/animations.js';
import { AudioService } from '../audio/AudioService.js';
import { PlatformService } from '../platform/PlatformService.js';
import { SaveService } from '../persistence/SaveService.js';

const TITLE_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '28px',
  color: '#f4f4f4',
  align: 'center',
  wordWrap: { width: 480 },
};

const BODY_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  color: '#d0d0d4',
  align: 'left',
  wordWrap: { width: 480 },
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
    this.bootStarted = false;
  }

  create() {
    if (this.input.mouse) {
      this.input.mouse.disableContextMenu();
    }

    this.statusText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Loading...', TITLE_STYLE)
      .setOrigin(0.5);

    this.boot().catch((error) => {
      this.#fail('Failed to start the game', [String(error)]);
    });
  }

  async boot() {
    if (this.bootStarted) {
      return;
    }

    this.bootStarted = true;

    try {
      const platform = PlatformService.create();
      await platform.init();

      const saveService = new SaveService(platform);
      const profile = await saveService.load();
      const audio = new AudioService();
      audio.bind(this.sound);
      audio.applyProfile(profile);

      this.registry.set(REGISTRY_KEYS.platform, platform);
      this.registry.set(REGISTRY_KEYS.saveService, saveService);
      this.registry.set(REGISTRY_KEYS.profile, profile);
      this.registry.set(REGISTRY_KEYS.audio, audio);

      const loadErrors = [];

      this.load.once('complete', () => {
        if (loadErrors.length > 0) {
          this.#fail(
            'Failed to load assets',
            loadErrors.map((file) => file.key || file.src || file.url),
          );
          return;
        }

        this.#finishBoot();
      });

      this.load.on('loaderror', (file) => {
        loadErrors.push(file);
      });

      queueManifest(this.load, ASSET_MANIFEST);
      this.load.start();
    } catch (error) {
      this.#fail('Failed to start the game', [String(error)]);
    }
  }

  #finishBoot() {
    try {
      registerAnimations(this);
      this.statusText.setText('Ready');
      this.scene.start(SCENE_KEYS.menu);
    } catch (error) {
      this.#fail('Failed to prepare the game', [String(error)]);
    }
  }

  #fail(title, details) {
    const list = details.filter(Boolean);

    console.error(`[BootScene] ${title}`);
    for (const item of list) {
      console.error(`[BootScene] missing or failed: ${item}`);
    }

    if (this.statusText) {
      this.statusText.destroy();
      this.statusText = null;
    }

    this.add
      .text(GAME_WIDTH / 2, 220, title, TITLE_STYLE)
      .setOrigin(0.5, 0);

    this.add
      .text(
        GAME_WIDTH / 2,
        300,
        list.length > 0 ? list.map((item) => `• ${item}`).join('\n') : 'Unknown error',
        BODY_STYLE,
      )
      .setOrigin(0.5, 0);
  }
}
