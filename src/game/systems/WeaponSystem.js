import { getWeaponType } from '../data/weaponTypes.js';

export class WeaponSystem {
  constructor(player, projectileSystem) {
    this.player = player;
    this.projectileSystem = projectileSystem;
    this.cooldown = 0;
  }

  update(dt) {
    if (!this.player?.active) {
      return;
    }

    this.cooldown -= dt;

    if (this.cooldown > 0) {
      return;
    }

    const weapon = getWeaponType(this.player.weaponId);
    this.cooldown = weapon.fireInterval;
    this.player.playRecoil(weapon.fireInterval * 1000);
    this.projectileSystem.spawnFromWeapon(this.player.muzzleX, this.player.muzzleY, weapon);
  }
}
