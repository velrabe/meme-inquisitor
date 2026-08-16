import Phaser from 'phaser';

export const GAME_WIDTH = 540;
export const GAME_HEIGHT = 960;
export const GAME_PARENT_ID = 'game-container';
export const GAME_BACKGROUND_COLOR = '#1a1a1e';

export const REGISTRY_KEYS = {
  platform: 'platform',
  profile: 'profile',
  saveService: 'saveService',
  audio: 'audio',
  gameReadySent: 'gameReadySent',
};

export const SCENE_KEYS = {
  boot: 'BootScene',
  menu: 'MenuScene',
  shop: 'ShopScene',
  game: 'GameScene',
  result: 'ResultScene',
};

export function createGameConfig(scenes) {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: GAME_PARENT_ID,
    backgroundColor: GAME_BACKGROUND_COLOR,
    banner: false,
    disableContextMenu: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: GAME_PARENT_ID,
    },
    input: {
      activePointers: 2,
    },
    scene: scenes,
  };
}
