import { GamePushPlatform } from './GamePushPlatform.js';
import { LocalPlatform } from './LocalPlatform.js';

export class PlatformService {
  constructor(adapter) {
    this.adapter = adapter;
  }

  static create(sdk = null) {
    if (sdk) {
      return new PlatformService(new GamePushPlatform(sdk));
    }

    return new PlatformService(new LocalPlatform());
  }

  init() {
    return this.adapter.init();
  }

  gameReady() {
    return this.#catch('gameReady', this.adapter.gameReady());
  }

  gameplayStart() {
    return this.#catch('gameplayStart', this.adapter.gameplayStart());
  }

  gameplayStop() {
    return this.#catch('gameplayStop', this.adapter.gameplayStop());
  }

  loadProgress() {
    return this.adapter.loadProgress();
  }

  saveProgress(data) {
    return this.adapter.saveProgress(data);
  }

  showInterstitial() {
    return this.adapter.showInterstitial();
  }

  onPause(callback) {
    return this.adapter.onPause(callback);
  }

  onResume(callback) {
    return this.adapter.onResume(callback);
  }

  #catch(methodName, promise) {
    const result = Promise.resolve(promise);
    result.catch((error) => {
      console.error(`PlatformService.${methodName} failed`, error);
    });
    return result;
  }
}
