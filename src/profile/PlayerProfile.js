import { createDefaultSave } from '../persistence/saveSchema.js';

export class PlayerProfile {
  constructor(data = {}) {
    const defaults = createDefaultSave();
    const settings = {
      ...defaults.settings,
      ...(data.settings && typeof data.settings === 'object' ? data.settings : {}),
    };

    this.version = typeof data.version === 'number' ? data.version : defaults.version;
    this.coins = typeof data.coins === 'number' ? data.coins : defaults.coins;
    this.bestScore = typeof data.bestScore === 'number' ? data.bestScore : defaults.bestScore;
    this.unlockedMission =
      typeof data.unlockedMission === 'number' ? data.unlockedMission : defaults.unlockedMission;
    this.purchasedPerks =
      data.purchasedPerks && typeof data.purchasedPerks === 'object'
        ? { ...data.purchasedPerks }
        : { ...defaults.purchasedPerks };
    this.ownedSkins = Array.isArray(data.ownedSkins)
      ? [...data.ownedSkins]
      : [...defaults.ownedSkins];
    this.selectedSkin =
      typeof data.selectedSkin === 'string' ? data.selectedSkin : defaults.selectedSkin;
    this.settings = {
      musicVolume: typeof settings.musicVolume === 'number' ? settings.musicVolume : defaults.settings.musicVolume,
      sfxVolume: typeof settings.sfxVolume === 'number' ? settings.sfxVolume : defaults.settings.sfxVolume,
      muted: typeof settings.muted === 'boolean' ? settings.muted : defaults.settings.muted,
    };

    if (!this.ownedSkins.includes('default')) {
      this.ownedSkins.unshift('default');
    }

    if (!this.ownsSkin(this.selectedSkin)) {
      this.selectedSkin = 'default';
    }
  }

  static fromSave(data) {
    return new PlayerProfile(data || {});
  }

  addCoins(amount) {
    const value = Math.max(0, Number(amount) || 0);
    this.coins += value;
    return this.coins;
  }

  spendCoins(amount) {
    const value = Math.max(0, Number(amount) || 0);

    if (this.coins < value) {
      return false;
    }

    this.coins -= value;
    return true;
  }

  hasPerk(perkId) {
    return Boolean(this.purchasedPerks[perkId]);
  }

  purchasePerk(perkId, cost = 0) {
    if (!perkId || this.hasPerk(perkId)) {
      return false;
    }

    if (!this.spendCoins(cost)) {
      return false;
    }

    this.purchasedPerks[perkId] = true;
    return true;
  }

  ownsSkin(skinId) {
    return this.ownedSkins.includes(skinId);
  }

  selectSkin(skinId) {
    if (!this.ownsSkin(skinId)) {
      return false;
    }

    this.selectedSkin = skinId;
    return true;
  }

  updateBestScore(score) {
    const value = Number(score) || 0;

    if (value > this.bestScore) {
      this.bestScore = value;
      return true;
    }

    return false;
  }

  toJSON() {
    return {
      version: this.version,
      coins: this.coins,
      bestScore: this.bestScore,
      unlockedMission: this.unlockedMission,
      purchasedPerks: { ...this.purchasedPerks },
      ownedSkins: [...this.ownedSkins],
      selectedSkin: this.selectedSkin,
      settings: { ...this.settings },
    };
  }
}
