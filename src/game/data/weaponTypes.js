export const WEAPON_TYPES = {
  rifle: {
    id: 'rifle',
    fireInterval: 0.2,
    damage: 1,
    projectileSpeed: 1100,
    projectileWidth: 4,
    projectileHeight: 18,
    criticalChance: 0,
  },
};

export function getWeaponType(weaponId) {
  return WEAPON_TYPES[weaponId] || WEAPON_TYPES.rifle;
}
