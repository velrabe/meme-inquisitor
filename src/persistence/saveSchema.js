export const SAVE_VERSION = 1;

export const DEFAULT_SAVE = {
  version: SAVE_VERSION,
  coins: 0,
  bestScore: 0,
  unlockedMission: 1,
  purchasedPerks: {},
  ownedSkins: ['default'],
  selectedSkin: 'default',
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muted: false,
  },
};

export function createDefaultSave() {
  return structuredClone(DEFAULT_SAVE);
}
