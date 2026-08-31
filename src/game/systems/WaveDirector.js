import Phaser from 'phaser';
import { LAYOUT } from '../data/layout.js';

export class WaveDirector {
  constructor(mission, enemySystem) {
    this.mission = mission;
    this.enemySystem = enemySystem;
    this.elapsed = 0;
    this.nextWaveIndex = 0;
    this.waves = [...(mission.waves || [])].sort((a, b) => a.time - b.time);
    this.pending = [];
  }

  update(dt) {
    this.elapsed += dt;

    while (this.nextWaveIndex < this.waves.length) {
      const wave = this.waves[this.nextWaveIndex];

      if (wave.time > this.elapsed) {
        break;
      }

      for (const spawn of wave.spawns || []) {
        this.#queueOrSpawn(spawn.typeId);
      }

      this.nextWaveIndex += 1;
    }

    const stillPending = [];

    for (const item of this.pending) {
      if (item.dueAt > this.elapsed) {
        stillPending.push(item);
        continue;
      }

      if (!this.#trySpawn(item.typeId)) {
        stillPending.push(this.#defer(item.typeId));
      }
    }

    this.pending = stillPending;
  }

  #queueOrSpawn(typeId) {
    if (!this.#trySpawn(typeId)) {
      this.pending.push(this.#defer(typeId));
    }
  }

  #trySpawn(typeId) {
    const lateralPosition = this.#pickLateralPosition();

    if (lateralPosition === null) {
      return false;
    }

    return Boolean(this.enemySystem.spawn(typeId, lateralPosition));
  }

  #pickLateralPosition() {
    const occupied = this.enemySystem.getNearSpawnLaterals();
    const { minimumSpawnSeparation, spawnPlacementAttempts } = LAYOUT.perspective;

    for (let attempt = 0; attempt < spawnPlacementAttempts; attempt += 1) {
      const candidate = Phaser.Math.FloatBetween(-1, 1);
      const separated = occupied.every(
        (other) => Math.abs(other - candidate) >= minimumSpawnSeparation,
      );

      if (separated) {
        return candidate;
      }
    }

    return null;
  }

  #defer(typeId) {
    return {
      typeId,
      dueAt: this.elapsed + LAYOUT.perspective.spawnSeparationDelay,
    };
  }
}
