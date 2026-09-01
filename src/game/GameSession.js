import Phaser from 'phaser';
import { Player } from './entities/Player.js';
import { Barrier } from './entities/Barrier.js';
import { InputSystem } from './systems/InputSystem.js';
import { EnemySystem } from './systems/EnemySystem.js';
import { WeaponSystem } from './systems/WeaponSystem.js';
import { ProjectileSystem } from './systems/ProjectileSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { WaveDirector } from './systems/WaveDirector.js';
import { LAYOUT } from './data/layout.js';

const SCORE_PER_KILL = 100;

export class GameSession {
  constructor(scene, options) {
    this.scene = scene;
    this.mission = options.mission;
    this.profile = options.profile;
    this.platform = options.platform;
    this.saveService = options.saveService;
    this.events = new Phaser.Events.EventEmitter();

    this.status = 'ready';
    this.elapsedTime = 0;
    this.remainingTime = this.mission.duration;
    this.score = 0;
    this.kills = 0;
    this.coinsEarned = 0;
    this.lossRequested = false;
    this.resultEmitted = false;
    this.gameplayActive = false;
    this.outcome = null;

    this.player = new Player(scene, {
      x: LAYOUT.gameWidth / 2,
      y: LAYOUT.playerY,
      minX: LAYOUT.playableMinX,
      maxX: LAYOUT.playableMaxX,
      weaponId: 'rifle',
    });

    this.barrier = new Barrier(scene, {
      barrierY: LAYOUT.barrierY,
      lossLineY: LAYOUT.lossLineY,
      maxDurability: this.mission.barrierDurability,
      gameWidth: LAYOUT.gameWidth,
    });

    this.enemySystem = new EnemySystem(scene);
    this.projectileSystem = new ProjectileSystem(scene);
    this.inputSystem = new InputSystem(scene, this.player);
    this.weaponSystem = new WeaponSystem(this.player, this.projectileSystem);
    this.waveDirector = new WaveDirector(this.mission, this.enemySystem);
    this.collisionSystem = new CollisionSystem(this);
  }

  start() {
    this.status = 'running';
    this.#setGameplay(true);
    this.#emitHud();
  }

  pause() {
    if (this.status !== 'running') {
      return;
    }

    this.status = 'paused';
    this.#setGameplay(false);
    this.#emitHud();
  }

  resume() {
    if (this.status !== 'paused') {
      return;
    }

    this.status = 'running';
    this.#setGameplay(true);
    this.#emitHud();
  }

  update(delta) {
    if (this.status !== 'running') {
      return;
    }

    const dt = delta / 1000;
    this.elapsedTime += dt;
    this.remainingTime = Math.max(0, this.mission.duration - this.elapsedTime);

    this.inputSystem.update(dt);
    this.player.update(dt);
    this.weaponSystem.update(dt);
    this.waveDirector.update(dt);
    this.enemySystem.update(dt);
    this.projectileSystem.update(dt);
    this.collisionSystem.update();
    this.enemySystem.cleanup();
    this.projectileSystem.cleanup();

    this.#checkOutcome();
    this.#emitHud();
  }

  notifyEnemyKilled(enemy) {
    this.kills += 1;
    this.score += SCORE_PER_KILL;
    this.coinsEarned += enemy.reward || 0;
    this.events.emit('enemyKilled', {
      typeId: enemy.typeId,
      kills: this.kills,
      score: this.score,
      coinsEarned: this.coinsEarned,
    });
  }

  notifyBarrierHit() {
    this.events.emit('barrierHit', {
      durabilities: this.barrier.getDurabilities(),
      maxDurability: this.barrier.maxDurability,
    });
  }

  notifyLoss() {
    this.lossRequested = true;
  }

  getHudState() {
    return {
      remainingTime: this.remainingTime,
      elapsedTime: this.elapsedTime,
      score: this.score,
      kills: this.kills,
      barrierDurabilities: this.barrier.getDurabilities(),
      barrierMax: this.barrier.maxDurability,
      status: this.status,
    };
  }

  getResult() {
    const outcome = this.outcome || (this.status === 'won' ? 'won' : 'lost');

    return {
      outcome,
      won: outcome === 'won',
      lost: outcome === 'lost',
      score: this.score,
      kills: this.kills,
      elapsedTime: this.elapsedTime,
      coinsEarned: this.coinsEarned,
    };
  }

  shutdown() {
    this.#setGameplay(false);
    this.inputSystem.shutdown();
    this.enemySystem.shutdown();
    this.projectileSystem.shutdown();
    this.player.destroy();
    this.barrier.destroy();
    this.events.removeAllListeners();
  }

  #checkOutcome() {
    if (this.lossRequested) {
      this.#finish('lost');
      return;
    }

    if (this.remainingTime <= 0) {
      this.#finish('won');
    }
  }

  #finish(outcome) {
    if (this.resultEmitted) {
      return;
    }

    this.outcome = outcome;
    this.status = outcome;
    this.resultEmitted = true;
    this.#setGameplay(false);

    this.profile.addCoins(this.coinsEarned);
    this.profile.updateBestScore(this.score);
    this.saveService.save(this.profile);

    const result = {
      outcome,
      won: outcome === 'won',
      lost: outcome === 'lost',
      score: this.score,
      kills: this.kills,
      elapsedTime: this.elapsedTime,
      coinsEarned: this.coinsEarned,
    };

    this.status = 'finished';
    this.events.emit('completed', result);
  }

  #emitHud() {
    this.events.emit('hud', this.getHudState());
  }

  #setGameplay(active) {
    if (active === this.gameplayActive) {
      return;
    }

    this.gameplayActive = active;

    if (active) {
      this.platform.gameplayStart();
    } else {
      this.platform.gameplayStop();
    }
  }
}
