import { PlayerTroop, WeaponItem, MercenaryClass } from '../types';

/**
 * Calculates power for an individual unit taking into account level, weapon multiplier, and achievement bonuses
 */
export const calculateUnitPower = (
  troop: PlayerTroop,
  weapons: WeaponItem[],
  achievementPowerMultiplier: number = 1.0
): number => {
  const base = troop.basePower + (troop.level * 2);
  let weaponMult = 1.0;
  if (troop.equippedWeaponId) {
    const item = weapons.find(w => w.weapon.id === troop.equippedWeaponId);
    if (item) weaponMult = item.weapon.powerMultiplier;
  }
  return Math.round(base * weaponMult * achievementPowerMultiplier);
};

/**
 * Calculates total combat power for an allocated squad
 */
export const calculateTeamPower = (
  troops: PlayerTroop[],
  weapons: WeaponItem[],
  achievementPowerMultiplier: number = 1.0,
  allocation: { class: string; count: number }[] | Record<string, number>
): number => {
  let total = 0;
  const allocMap: Record<string, number> = Array.isArray(allocation)
    ? allocation.reduce((acc, curr) => ({ ...acc, [curr.class]: curr.count }), {})
    : allocation;

  for (const troop of troops) {
    const count = allocMap[troop.class] || 0;
    if (count > 0) {
      const unitPwr = calculateUnitPower(troop, weapons, achievementPowerMultiplier);
      total += count * unitPwr;
    }
  }

  return total;
};

/**
 * Calculates infiltration speed multiplier and bonus percentage based on team combat power vs recommended power.
 * Higher team power suppresses hostile defenses faster and dramatically reduces mission timeline.
 */
export const calculateInfiltrationSpeed = (
  teamPower: number,
  recommendedPower: number
): { speedMultiplier: number; speedBonusPercent: number } => {
  if (teamPower <= 0) {
    return { speedMultiplier: 1.0, speedBonusPercent: 0 };
  }

  const req = Math.max(1, recommendedPower);
  const ratio = teamPower / req;

  let speedMultiplier = 1.0;
  if (ratio >= 1.0) {
    // Scales smoothly up to 3.0x speed for overwhelming strike forces
    // 1.0x ratio = 1.0x speed (+0%)
    // 1.5x ratio = 1.35x speed (+35%)
    // 2.0x ratio = 1.70x speed (+70%)
    // 3.0x ratio = 2.40x speed (+140%)
    // 3.86x+ ratio = 3.00x speed (+200% max speed)
    speedMultiplier = Math.min(3.0, 1.0 + (ratio - 1.0) * 0.7);
  } else {
    // Under-strength penalty down to 0.75x
    speedMultiplier = Math.max(0.75, 1.0 - (1.0 - ratio) * 0.4);
  }

  const speedBonusPercent = Math.round((speedMultiplier - 1.0) * 100);
  return { speedMultiplier, speedBonusPercent };
};

/**
 * Calculates dynamic expedited duration in seconds for a mission based on team combat power.
 * Minimum duration is enforced (6 seconds) to maintain suspense and ensure gameplay visibility.
 */
export const calculateInfiltrationDuration = (
  baseDurationSeconds: number,
  teamPower: number,
  recommendedPower: number
): number => {
  const { speedMultiplier } = calculateInfiltrationSpeed(teamPower, recommendedPower);
  const calculated = Math.max(6, Math.round(baseDurationSeconds / speedMultiplier));
  return calculated;
};
