const STORAGE_KEY = 'meme-inquisitor-progress';

export class LocalPlatform {
  constructor() {
    this.pauseCallbacks = [];
    this.resumeCallbacks = [];
    this.ready = false;
  }

  async init() {
    this.ready = true;
    return { ok: true, adapter: 'local' };
  }

  async gameReady() {
    return { ok: true };
  }

  async gameplayStart() {
    return { ok: true };
  }

  async gameplayStop() {
    return { ok: true };
  }

  async loadProgress() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch (error) {
      console.warn('LocalPlatform: failed to load progress', error);
      return null;
    }
  }

  async saveProgress(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (error) {
      console.warn('LocalPlatform: failed to save progress', error);
      return { ok: false, error };
    }
  }

  async showInterstitial() {
    return { shown: false, reason: 'local-noop' };
  }

  onPause(callback) {
    this.pauseCallbacks.push(callback);

    return () => {
      this.pauseCallbacks = this.pauseCallbacks.filter((item) => item !== callback);
    };
  }

  onResume(callback) {
    this.resumeCallbacks.push(callback);

    return () => {
      this.resumeCallbacks = this.resumeCallbacks.filter((item) => item !== callback);
    };
  }

  notifyPause() {
    for (const callback of this.pauseCallbacks) {
      callback();
    }
  }

  notifyResume() {
    for (const callback of this.resumeCallbacks) {
      callback();
    }
  }
}
