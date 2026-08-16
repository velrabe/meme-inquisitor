import { PlayerProfile } from '../profile/PlayerProfile.js';
import { SAVE_VERSION, createDefaultSave } from './saveSchema.js';

export class SaveService {
  constructor(platform) {
    this.platform = platform;
  }

  async load() {
    const raw = await this.platform.loadProgress();

    if (!this.#isValid(raw)) {
      return PlayerProfile.fromSave(createDefaultSave());
    }

    return PlayerProfile.fromSave(raw);
  }

  async save(profile) {
    try {
      const payload = profile.toJSON();
      payload.version = SAVE_VERSION;
      return await this.platform.saveProgress(payload);
    } catch (error) {
      console.error('SaveService.save failed', error);
      return { ok: false, error };
    }
  }

  #isValid(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (typeof data.version !== 'number') {
      return false;
    }

    if (typeof data.coins !== 'number' && data.coins !== undefined) {
      return false;
    }

    if (data.settings !== undefined && typeof data.settings !== 'object') {
      return false;
    }

    if (data.purchasedPerks !== undefined && typeof data.purchasedPerks !== 'object') {
      return false;
    }

    if (data.ownedSkins !== undefined && !Array.isArray(data.ownedSkins)) {
      return false;
    }

    return true;
  }
}
