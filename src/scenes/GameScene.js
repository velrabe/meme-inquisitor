import Phaser from 'phaser';
import { REGISTRY_KEYS, SCENE_KEYS } from '../config/gameConfig.js';
import { GameSession } from '../game/GameSession.js';
import { getMission } from '../game/data/missions.js';
import { LAYOUT } from '../game/data/layout.js';
import { Hud } from '../ui/Hud.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.game);
    this.session = null;
    this.hud = null;
    this.unsubscribePause = null;
    this.unsubscribeResume = null;
  }

  init(data = {}) {
    this.missionId = data.missionId;
  }

  create() {
    const mission = getMission(this.missionId);
    const profile = this.registry.get(REGISTRY_KEYS.profile);
    const platform = this.registry.get(REGISTRY_KEYS.platform);
    const saveService = this.registry.get(REGISTRY_KEYS.saveService);
    const audio = this.registry.get(REGISTRY_KEYS.audio);

    this.background = this.add.image(
      LAYOUT.gameWidth / 2,
      LAYOUT.gameHeight / 2,
      mission.backgroundKey,
    );
    this.background.setDisplaySize(LAYOUT.gameWidth, LAYOUT.gameHeight);
    this.background.setDepth(0);

    this.session = new GameSession(this, {
      mission,
      profile,
      platform,
      saveService,
    });

    this.hud = new Hud(this);
    this.hud.bind(this.session);

    this.session.events.once('completed', (result) => {
      this.scene.start(SCENE_KEYS.result, result);
    });

    this.unsubscribePause = platform.onPause(() => {
      this.session?.pause();
      audio?.pauseAll();
    });

    this.unsubscribeResume = platform.onResume(() => {
      this.session?.resume();
      audio?.resumeAll();
    });

    this.game.events.on(Phaser.Core.Events.HIDDEN, this.#onHidden, this);
    this.game.events.on(Phaser.Core.Events.VISIBLE, this.#onVisible, this);
    this.events.once('shutdown', this.#onShutdown, this);

    this.session.start();
  }

  update(time, delta) {
    if (this.session) {
      this.session.update(delta);
    }
  }

  #onShutdown() {
    this.game.events.off(Phaser.Core.Events.HIDDEN, this.#onHidden, this);
    this.game.events.off(Phaser.Core.Events.VISIBLE, this.#onVisible, this);

    if (this.unsubscribePause) {
      this.unsubscribePause();
      this.unsubscribePause = null;
    }

    if (this.unsubscribeResume) {
      this.unsubscribeResume();
      this.unsubscribeResume = null;
    }

    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }

    if (this.session) {
      this.session.shutdown();
      this.session = null;
    }
  }

  #onHidden() {
    this.session?.pause();
    this.registry.get(REGISTRY_KEYS.audio)?.pauseAll();
  }

  #onVisible() {
    this.session?.resume();
    this.registry.get(REGISTRY_KEYS.audio)?.resumeAll();
  }
}
