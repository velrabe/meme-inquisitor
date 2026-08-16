const MISSING_SDK_ERROR =
  'GamePushPlatform requires a GamePush SDK instance. Use LocalPlatform until the official SDK is configured.';

const UNIMPLEMENTED_ERROR =
  'GamePushPlatform is not connected to the official GamePush API yet. Do not invent SDK calls.';

export class GamePushPlatform {
  constructor(sdk) {
    if (!sdk) {
      throw new Error(MISSING_SDK_ERROR);
    }

    this.sdk = sdk;
  }

  async init() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  async gameReady() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  async gameplayStart() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  async gameplayStop() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  async loadProgress() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  async saveProgress() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  async showInterstitial() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  onPause() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  onResume() {
    this.#assertSdk();
    throw new Error(UNIMPLEMENTED_ERROR);
  }

  #assertSdk() {
    if (!this.sdk) {
      throw new Error(MISSING_SDK_ERROR);
    }
  }
}
