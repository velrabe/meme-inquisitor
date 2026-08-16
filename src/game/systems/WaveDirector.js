export class WaveDirector {
  constructor(mission, enemySystem) {
    this.mission = mission;
    this.enemySystem = enemySystem;
    this.elapsed = 0;
    this.nextWaveIndex = 0;
    this.waves = [...(mission.waves || [])].sort((a, b) => a.time - b.time);
  }

  update(dt) {
    this.elapsed += dt;

    while (this.nextWaveIndex < this.waves.length) {
      const wave = this.waves[this.nextWaveIndex];

      if (wave.time > this.elapsed) {
        break;
      }

      for (const spawn of wave.spawns || []) {
        this.enemySystem.spawn(spawn.typeId, spawn.x);
      }

      this.nextWaveIndex += 1;
    }
  }
}
