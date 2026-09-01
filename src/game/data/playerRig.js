export const PLAYER_FRAME_SIZE = 1500;

export const PLAYER_WALK = {
  cycleMs: 200,
  stepAtMs: 70,
};

export const PLAYER_RECOIL = {
  downRatio: 0.35,
  offsetY: {
    torso: 10,
    butt: 5,
    tail: 2,
  },
};

export const PLAYER_MUZZLE = {
  x: 738.5,
  y: 44,
};

export const PLAYER_PART_IDS = ['torso', 'butt', 'rLeg', 'lLeg', 'tail'];

export const PLAYER_PARTS = {
  tail: {
    textureKey: 'player-cat-part-tail',
    layout: { x: 587, y: 1062, width: 173, height: 394 },
    origin: { x: 0.7, y: 0.072 },
    originPosition: { x: 708, y: 1090 },
    stepRight: { scaleX: 1, scaleY: 1, angle: 3 },
  },
  lLeg: {
    textureKey: 'player-cat-part-l-leg',
    layout: { x: 414, y: 1017, width: 224, height: 358 },
    originPosition: { x: 566, y: 1106 },
    stepRight: { scaleX: 1, scaleY: 1, angle: 3 },
  },
  rLeg: {
    textureKey: 'player-cat-part-r-leg',
    layout: { x: 838, y: 1064, width: 239, height: 322 },
    originPosition: { x: 920, y: 1119 },
    stepRight: { scaleX: 1, scaleY: 0.94, angle: 17 },
  },
  butt: {
    textureKey: 'player-cat-part-butt',
    layout: { x: 528, y: 895, width: 450, height: 324 },
    originPosition: { x: 720, y: 1026 },
    stepRight: { scaleX: 1.06, scaleY: 0.99, angle: 3 },
  },
  torso: {
    textureKey: 'player-cat-part-torso',
    layout: { x: 553, y: 44, width: 371, height: 929 },
    originPosition: { x: 718, y: 915 },
    stepRight: { scaleX: 1, scaleY: 1, angle: -1 },
  },
};

const STEP_PART_SWAP = {
  tail: 'tail',
  butt: 'butt',
  torso: 'torso',
  lLeg: 'rLeg',
  rLeg: 'lLeg',
};

export function getPartOrigin(part) {
  if (part.origin) {
    return part.origin;
  }

  return {
    x: (part.originPosition.x - part.layout.x) / part.layout.width,
    y: (part.originPosition.y - part.layout.y) / part.layout.height,
  };
}

export function getRestPose() {
  const pose = {};

  for (const id of PLAYER_PART_IDS) {
    pose[id] = toLocalPose(PLAYER_PARTS[id].originPosition, 1, 1, 0);
  }

  return pose;
}

export function getStepPose(direction) {
  const pose = {};

  for (const id of PLAYER_PART_IDS) {
    const sourceId = direction < 0 ? STEP_PART_SWAP[id] : id;
    const step = PLAYER_PARTS[sourceId].stepRight;
    const angle = direction < 0 ? -step.angle : step.angle;

    pose[id] = toLocalPose(
      PLAYER_PARTS[id].originPosition,
      step.scaleX,
      step.scaleY,
      angle,
    );
  }

  return pose;
}

export function getWalkBlend(elapsedMs) {
  if (elapsedMs <= 0) {
    return 0;
  }

  const cycle = elapsedMs % PLAYER_WALK.cycleMs;
  const stepAt = PLAYER_WALK.stepAtMs;

  if (cycle <= stepAt) {
    return cycle / stepAt;
  }

  return 1 - (cycle - stepAt) / (PLAYER_WALK.cycleMs - stepAt);
}

function toLocalPose(originPosition, scaleX, scaleY, angle) {
  return {
    x: originPosition.x - PLAYER_FRAME_SIZE / 2,
    y: originPosition.y - PLAYER_FRAME_SIZE,
    scaleX,
    scaleY,
    angle,
  };
}
