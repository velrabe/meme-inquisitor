export const ENEMY_TYPES = {
  basic: {
    id: 'basic',
    textureKey: 'enemy-sahur-basic-idle',
    animationKey: null,
    maxHp: 1,
    speed: 42,
    reward: 5,
    displayWidth: 96,
    hitboxWidthRatio: 0.62,
    hitboxHeightRatio: 0.82,
  },
};

export function getEnemyType(typeId) {
  return ENEMY_TYPES[typeId] || null;
}
