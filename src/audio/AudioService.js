function clampVolume(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, number));
}

export class AudioService {
  constructor() {
    this.soundManager = null;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.muted = false;
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  bind(soundManager) {
    this.soundManager = soundManager;
    this.#applyMute();
    return this;
  }

  applyProfile(profile) {
    if (!profile?.settings) {
      return this;
    }

    this.setMusicVolume(profile.settings.musicVolume);
    this.setSfxVolume(profile.settings.sfxVolume);
    this.setMuted(profile.settings.muted);
    return this;
  }

  playMusic(key, options = {}) {
    if (!this.#ensureReady('playMusic', key)) {
      return null;
    }

    if (!this.#hasAudio(key)) {
      console.warn(`AudioService: music key "${key}" is not loaded`);
      return null;
    }

    if (this.currentMusicKey === key && this.currentMusic) {
      if (!this.currentMusic.isPlaying && !this.currentMusic.isPaused) {
        this.currentMusic.play({
          loop: options.loop !== false,
          volume: this.musicVolume,
          ...options,
        });
      }
      return this.currentMusic;
    }

    this.stopMusic();

    this.currentMusic = this.soundManager.add(key, {
      loop: options.loop !== false,
      volume: this.musicVolume,
      ...options,
    });
    this.currentMusicKey = key;
    this.currentMusic.play();
    return this.currentMusic;
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentMusicKey = null;
    }
  }

  playSfx(key, options = {}) {
    if (!this.#ensureReady('playSfx', key)) {
      return null;
    }

    if (!this.#hasAudio(key)) {
      console.warn(`AudioService: sfx key "${key}" is not loaded`);
      return false;
    }

    return this.soundManager.play(key, {
      volume: this.sfxVolume,
      ...options,
    });
  }

  setMusicVolume(value) {
    this.musicVolume = clampVolume(value, this.musicVolume);

    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
  }

  setSfxVolume(value) {
    this.sfxVolume = clampVolume(value, this.sfxVolume);
  }

  setMuted(value) {
    this.muted = Boolean(value);
    this.#applyMute();
  }

  pauseAll() {
    if (!this.soundManager) {
      return;
    }

    this.soundManager.pauseAll();
  }

  resumeAll() {
    if (!this.soundManager) {
      return;
    }

    this.soundManager.resumeAll();
  }

  #applyMute() {
    if (!this.soundManager) {
      return;
    }

    this.soundManager.mute = this.muted;
  }

  #hasAudio(key) {
    return Boolean(this.soundManager?.game?.cache?.audio?.exists(key));
  }

  #ensureReady(methodName, key) {
    if (!this.soundManager) {
      console.warn(`AudioService.${methodName}: sound manager is not bound`);
      return false;
    }

    if (!key) {
      console.warn(`AudioService.${methodName}: audio key is missing`);
      return false;
    }

    return true;
  }
}
