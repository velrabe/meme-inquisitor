const BASIC = 'basic';
const WAVE_TIME_SCALE = 0.2;
const WAVE_SPAWN_SCALE = 1;

const ROOFTOP_WAVES = [
  { time: 2, spawns: [{ typeId: BASIC }] },
  { time: 6, spawns: [{ typeId: BASIC }] },
  { time: 10, spawns: [{ typeId: BASIC }] },
  { time: 14, spawns: [{ typeId: BASIC }] },
  { time: 18, spawns: [{ typeId: BASIC }] },
  { time: 22, spawns: [{ typeId: BASIC }] },
  { time: 22.8, spawns: [{ typeId: BASIC }] },
  { time: 27, spawns: [{ typeId: BASIC }, { typeId: BASIC }] },
  { time: 32, spawns: [{ typeId: BASIC }] },
  { time: 36, spawns: [{ typeId: BASIC }] },
  { time: 40, spawns: [{ typeId: BASIC }] },
  { time: 44, spawns: [{ typeId: BASIC }] },
  { time: 47, spawns: [{ typeId: BASIC }] },
  { time: 51, spawns: [{ typeId: BASIC }, { typeId: BASIC }] },
  { time: 55, spawns: [{ typeId: BASIC }] },
  { time: 58, spawns: [{ typeId: BASIC }] },
  { time: 61, spawns: [{ typeId: BASIC }] },
  { time: 64, spawns: [{ typeId: BASIC }] },
  { time: 67, spawns: [{ typeId: BASIC }, { typeId: BASIC }] },
  { time: 70, spawns: [{ typeId: BASIC }] },
  { time: 71, spawns: [{ typeId: BASIC }] },
  { time: 72, spawns: [{ typeId: BASIC }] },
  { time: 73, spawns: [{ typeId: BASIC }] },
  { time: 74, spawns: [{ typeId: BASIC }, { typeId: BASIC }] },
  { time: 75, spawns: [{ typeId: BASIC }] },
  { time: 76, spawns: [{ typeId: BASIC }] },
  { time: 76, spawns: [{ typeId: BASIC }] },
];

export const MISSIONS = {
  'rooftop-1': {
    id: 'rooftop-1',
    duration: 90,
    backgroundKey: 'background-rooftop-night',
    barrierDurability: 2,
    enemyTypes: [BASIC],
    waves: ROOFTOP_WAVES.map((wave) => ({
      ...wave,
      time: wave.time * WAVE_TIME_SCALE,
      spawns: wave.spawns.flatMap((spawn) =>
        Array.from({ length: WAVE_SPAWN_SCALE }, () => spawn),
      ),
    })),
  },
};

export const DEFAULT_MISSION_ID = 'rooftop-1';

export function getMission(missionId = DEFAULT_MISSION_ID) {
  return MISSIONS[missionId] || MISSIONS[DEFAULT_MISSION_ID];
}
