const ANIMATION_CATALOG = [];

export function registerAnimations(scene, catalog = ANIMATION_CATALOG) {
  if (!scene?.anims) {
    return;
  }

  for (const definition of catalog) {
    if (!definition?.key) {
      continue;
    }

    if (scene.anims.exists(definition.key)) {
      continue;
    }

    scene.anims.create(definition);
  }
}

export function hasAnimation(scene, animationKey) {
  return Boolean(animationKey) && Boolean(scene?.anims?.exists(animationKey));
}

export function getAnimationCatalog() {
  return ANIMATION_CATALOG;
}
