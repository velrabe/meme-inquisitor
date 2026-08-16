const BASIC = 'basic';

export const MISSIONS = {
  'rooftop-1': {
    id: 'rooftop-1',
    duration: 90,
    backgroundKey: 'background-rooftop-night',
    barrierDurability: 3,
    enemyTypes: [BASIC],
    waves: [
      { time: 2, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 6, spawns: [{ typeId: BASIC, x: 170 }] },
      { time: 10, spawns: [{ typeId: BASIC, x: 370 }] },
      { time: 14, spawns: [{ typeId: BASIC, x: 220 }] },
      { time: 18, spawns: [{ typeId: BASIC, x: 320 }] },
      { time: 22, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 22.8, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 27, spawns: [{ typeId: BASIC, x: 150 }, { typeId: BASIC, x: 390 }] },
      { time: 32, spawns: [{ typeId: BASIC, x: 200 }] },
      { time: 36, spawns: [{ typeId: BASIC, x: 340 }] },
      { time: 40, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 44, spawns: [{ typeId: BASIC, x: 180 }] },
      { time: 47, spawns: [{ typeId: BASIC, x: 360 }] },
      { time: 51, spawns: [{ typeId: BASIC, x: 230 }, { typeId: BASIC, x: 310 }] },
      { time: 55, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 58, spawns: [{ typeId: BASIC, x: 160 }] },
      { time: 61, spawns: [{ typeId: BASIC, x: 380 }] },
      { time: 64, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 67, spawns: [{ typeId: BASIC, x: 190 }, { typeId: BASIC, x: 350 }] },
      { time: 70, spawns: [{ typeId: BASIC, x: 240 }] },
      { time: 71, spawns: [{ typeId: BASIC, x: 370 }] },
      { time: 72, spawns: [{ typeId: BASIC, x: 270 }] },
      { time: 73, spawns: [{ typeId: BASIC, x: 300 }] },
      { time: 74, spawns: [{ typeId: BASIC, x: 210 }, { typeId: BASIC, x: 330 }] },
      { time: 75, spawns: [{ typeId: BASIC, x: 150 }] },
      { time: 76, spawns: [{ typeId: BASIC, x: 170 }] },
      { time: 76, spawns: [{ typeId: BASIC, x: 390 }] },
    ],
  },
};

export const DEFAULT_MISSION_ID = 'rooftop-1';

export function getMission(missionId = DEFAULT_MISSION_ID) {
  return MISSIONS[missionId] || MISSIONS[DEFAULT_MISSION_ID];
}
