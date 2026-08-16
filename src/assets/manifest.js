export const IMAGE_ASSETS = [
  {
    type: 'image',
    key: 'background-rooftop-night',
    path: 'assets/backgrounds/rooftop-night.png',
    required: true,
  },
  {
    type: 'image',
    key: 'player-cat-rifle-idle',
    path: 'assets/player/cat-rifle-idle.png',
    required: true,
  },
  {
    type: 'image',
    key: 'enemy-sahur-basic-idle',
    path: 'assets/enemies/sahur-basic-idle.png',
    required: true,
  },
  {
    type: 'image',
    key: 'barrier-block-intact',
    path: 'assets/barrier/barrier-block-intact.png',
    required: true,
  },
  {
    type: 'image',
    key: 'barrier-block-damaged',
    path: 'assets/barrier/barrier-block-damaged.png',
    required: true,
  },
  {
    type: 'image',
    key: 'barrier-block-broken',
    path: 'assets/barrier/barrier-block-broken.png',
    required: true,
  },
];

export const SPRITESHEET_ASSETS = [];

export const MUSIC_ASSETS = [];

export const SFX_ASSETS = [];

export const ASSET_MANIFEST = {
  images: IMAGE_ASSETS,
  spritesheets: SPRITESHEET_ASSETS,
  music: MUSIC_ASSETS,
  sfx: SFX_ASSETS,
};

export function queueManifest(loader, manifest = ASSET_MANIFEST) {
  for (const asset of manifest.images) {
    loader.image(asset.key, asset.path);
  }

  for (const asset of manifest.spritesheets) {
    loader.spritesheet(asset.key, asset.path, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
    });
  }

  for (const asset of manifest.music) {
    loader.audio(asset.key, asset.path);
  }

  for (const asset of manifest.sfx) {
    loader.audio(asset.key, asset.path);
  }
}
