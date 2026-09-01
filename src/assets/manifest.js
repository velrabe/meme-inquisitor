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
    key: 'player-cat-part-tail',
    path: 'assets/player/cat-parts/tail.png',
    required: true,
  },
  {
    type: 'image',
    key: 'player-cat-part-l-leg',
    path: 'assets/player/cat-parts/l-leg.png',
    required: true,
  },
  {
    type: 'image',
    key: 'player-cat-part-r-leg',
    path: 'assets/player/cat-parts/r-leg.png',
    required: true,
  },
  {
    type: 'image',
    key: 'player-cat-part-butt',
    path: 'assets/player/cat-parts/butt.png',
    required: true,
  },
  {
    type: 'image',
    key: 'player-cat-part-torso',
    path: 'assets/player/cat-parts/torso.png',
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
    key: 'enemy-sahur-part-body',
    path: 'assets/enemies/sahur-parts/body.png',
    required: true,
  },
  {
    type: 'image',
    key: 'enemy-sahur-part-l-hand',
    path: 'assets/enemies/sahur-parts/l-hand.png',
    required: true,
  },
  {
    type: 'image',
    key: 'enemy-sahur-part-r-hand',
    path: 'assets/enemies/sahur-parts/r-hand.png',
    required: true,
  },
  {
    type: 'image',
    key: 'enemy-sahur-part-l-leg',
    path: 'assets/enemies/sahur-parts/l-leg.png',
    required: true,
  },
  {
    type: 'image',
    key: 'enemy-sahur-part-r-leg',
    path: 'assets/enemies/sahur-parts/r-leg.png',
    required: true,
  },
];

export const SPRITESHEET_ASSETS = [
  {
    type: 'spritesheet',
    key: 'barrier-block-states',
    path: 'assets/barrier/barrier-block-states.png',
    frameWidth: 350,
    frameHeight: 180,
    required: true,
  },
];

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
