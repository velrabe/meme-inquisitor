import Phaser from 'phaser';

export const LAYOUT = {
  gameWidth: 540,
  gameHeight: 960,
  spawnY: 110,
  spawnDropFromY: 0,
  spawnDropDuration: 0.3,
  playerY: 950,
  barrierY: 750,
  lossLineY: 790,
  playableMinX: 70,
  playableMaxX: 470,
  perspective: {
    vanishingPointX: 270,
    farMinXPercent: 0.37,
    farMaxXPercent: 0.63,
    nearMinXPercent: 0.074,
    nearMaxXPercent: 0.926,
    minimumSpawnSeparation: 0.12,
    spawnPlacementAttempts: 8,
    spawnSeparationDelay: 0.2,
  },
  farEnemyScale: 0.5,
  midEnemyScale: 1.5,
  midEnemyScaleAt: 0.6,
  nearEnemyScale: 2,
  farEnemySpeedScale: 1,
  nearEnemySpeedScale: 2,
  farEnemyTint: 0.3,
  nearEnemyTint: 1,
  nearEnemyTintAt: 0.3,
  playerDisplayWidth: 300,
  playerMoveSpeed: 280,
  projectileColor: 0xf6e27a,
};

export function getEnemyScale(progress) {
  const t = Phaser.Math.Clamp(progress, 0, 1);
  const split = LAYOUT.midEnemyScaleAt;

  if (split <= 0) {
    return Phaser.Math.Linear(LAYOUT.farEnemyScale, LAYOUT.nearEnemyScale, t);
  }

  if (t <= split) {
    return Phaser.Math.Linear(LAYOUT.farEnemyScale, LAYOUT.midEnemyScale, t / split);
  }

  return Phaser.Math.Linear(
    LAYOUT.midEnemyScale,
    LAYOUT.nearEnemyScale,
    (t - split) / (1 - split),
  );
}

export function getPerspectiveHalfWidth(minPercent, maxPercent) {
  return ((maxPercent - minPercent) / 2) * LAYOUT.gameWidth;
}

export function projectGroundPosition(
  lateralPosition,
  progress,
  perspective = LAYOUT.perspective,
) {
  const visualProgress = Phaser.Math.Clamp(progress, 0, 1);
  const farHalfWidth = getPerspectiveHalfWidth(
    perspective.farMinXPercent,
    perspective.farMaxXPercent,
  );
  const nearHalfWidth = getPerspectiveHalfWidth(
    perspective.nearMinXPercent,
    perspective.nearMaxXPercent,
  );
  const halfWidth = Phaser.Math.Linear(farHalfWidth, nearHalfWidth, visualProgress);

  return {
    x: perspective.vanishingPointX + lateralPosition * halfWidth,
    y: Phaser.Math.Linear(LAYOUT.spawnY, LAYOUT.barrierY, progress),
  };
}
