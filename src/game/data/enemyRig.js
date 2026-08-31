export const SAHUR_FRAME_SIZE = 1500;

export const SAHUR_WALK = {
  cycleMs: 400,
  stepAtMs: 200,
};

export const SAHUR_PART_IDS = ['rLeg', 'lLeg', 'rHand', 'lHand', 'body'];

export const SAHUR_PARTS = {
  body: {
    textureKey: 'enemy-sahur-part-body',
    origin: { x: 0.495, y: 0.965 },
    rest: { x: 748, y: 899, scaleX: 1, scaleY: 1, angle: 0 },
    step: { x: 748, y: 916, scaleX: 1, scaleY: 1, angle: 0 },
  },
  lHand: {
    textureKey: 'enemy-sahur-part-l-hand',
    origin: { x: 0.965, y: 0.065 },
    rest: { x: 566, y: 630, scaleX: 1, scaleY: 1, angle: 0 },
    step: { x: 566, y: 640, scaleX: 1, scaleY: 0.95, angle: 0 },
  },
  rHand: {
    textureKey: 'enemy-sahur-part-r-hand',
    origin: { x: 0.055, y: 0.105 },
    rest: { x: 936, y: 623, scaleX: 1, scaleY: 1, angle: 0 },
    step: { x: 936, y: 634, scaleX: 1, scaleY: 0.95, angle: 0 },
  },
  lLeg: {
    textureKey: 'enemy-sahur-part-l-leg',
    origin: { x: 0.515, y: 0.045 },
    rest: { x: 661, y: 911, scaleX: 1, scaleY: 0.8, angle: 0 },
    step: { x: 661, y: 911, scaleX: 1, scaleY: 1, angle: 0 },
  },
  rLeg: {
    textureKey: 'enemy-sahur-part-r-leg',
    origin: { x: 0.475, y: 0.05 },
    rest: { x: 843, y: 908, scaleX: 1, scaleY: 1, angle: 0 },
    step: { x: 843, y: 908, scaleX: 1, scaleY: 0.8, angle: 0 },
  },
};

export function getSahurRestPose() {
  const pose = {};

  for (const id of SAHUR_PART_IDS) {
    pose[id] = toLocalPose(SAHUR_PARTS[id].rest);
  }

  return pose;
}

export function getSahurStepPose() {
  const pose = {};

  for (const id of SAHUR_PART_IDS) {
    pose[id] = toLocalPose(SAHUR_PARTS[id].step);
  }

  return pose;
}

export function getSahurWalkBlend(elapsedMs) {
  if (elapsedMs <= 0) {
    return 0;
  }

  const cycle = elapsedMs % SAHUR_WALK.cycleMs;
  const stepAt = SAHUR_WALK.stepAtMs;

  if (cycle <= stepAt) {
    return cycle / stepAt;
  }

  return 1 - (cycle - stepAt) / (SAHUR_WALK.cycleMs - stepAt);
}

function toLocalPose(pose) {
  return {
    x: pose.x - SAHUR_FRAME_SIZE / 2,
    y: pose.y - SAHUR_FRAME_SIZE,
    scaleX: pose.scaleX,
    scaleY: pose.scaleY,
    angle: pose.angle,
  };
}
