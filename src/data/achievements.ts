import { Achievement, PlayerStats, PlayerTroop, WeaponItem, HQUpgrade } from '../types';

export interface RawAchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: 'Operations' | 'Wealth' | 'Syndicate' | 'Armory' | 'Warfare';
  targetValue: number;
  buffType: 'global_combat_power' | 'assault_sniper_power' | 'juggernaut_medic_power' | 'hacker_power' | 'critical_power';
  buffPercentage: number;
  buffDescription: string;
  iconName: 'Trophy' | 'Target' | 'Shield' | 'Coins' | 'Sparkles' | 'Flame' | 'Skull' | 'Award' | 'Crosshair' | 'Zap' | 'Crown' | 'Radio' | 'Sword' | 'Cpu';
  getValue: (stats: PlayerStats, gameContext: {
    credits: number;
    intel: number;
    rebirths: number;
    troops: PlayerTroop[];
    weapons: WeaponItem[];
    hqUpgrades: HQUpgrade[];
  }) => number;
}

export const ACHIEVEMENTS_DEFINITIONS: RawAchievementDefinition[] = [
  // 1. OPERATIONS
  {
    id: 'ach_first_blood',
    title: 'First Strike',
    description: 'Execute and complete your very first tactical contractor operation.',
    category: 'Operations',
    targetValue: 1,
    buffType: 'global_combat_power',
    buffPercentage: 5,
    buffDescription: '+5% Global Troop Combat Power',
    iconName: 'Crosshair',
    getValue: (stats) => stats.totalMissionsCompleted
  },
  {
    id: 'ach_missions_10',
    title: 'Combat Specialist',
    description: 'Successfully complete 10 tactical missions across hostile territory.',
    category: 'Operations',
    targetValue: 10,
    buffType: 'global_combat_power',
    buffPercentage: 5,
    buffDescription: '+5% Global Troop Combat Power',
    iconName: 'Target',
    getValue: (stats) => stats.totalMissionsCompleted
  },
  {
    id: 'ach_missions_25',
    title: 'Black-Ops Veteran',
    description: 'Complete 25 high-stakes combat operations with minimal footprint.',
    category: 'Operations',
    targetValue: 25,
    buffType: 'global_combat_power',
    buffPercentage: 8,
    buffDescription: '+8% Global Troop Combat Power',
    iconName: 'Flame',
    getValue: (stats) => stats.totalMissionsCompleted
  },
  {
    id: 'ach_missions_50',
    title: 'Master of Shadows',
    description: 'Achieve 50 successful military contractor deployments.',
    category: 'Operations',
    targetValue: 50,
    buffType: 'global_combat_power',
    buffPercentage: 10,
    buffDescription: '+10% Global Troop Combat Power',
    iconName: 'Shield',
    getValue: (stats) => stats.totalMissionsCompleted
  },
  {
    id: 'ach_missions_100',
    title: '100th Mission Completed',
    description: 'Reach the century milestone of 100 tactical operations executed.',
    category: 'Operations',
    targetValue: 100,
    buffType: 'global_combat_power',
    buffPercentage: 15,
    buffDescription: '+15% Global Troop Combat Power',
    iconName: 'Trophy',
    getValue: (stats) => stats.totalMissionsCompleted
  },

  // 2. WEALTH & CAPITAL
  {
    id: 'ach_credits_50k',
    title: 'Seed Capital',
    description: 'Amass or earn over $50,000 in liquid Syndicate treasury funds.',
    category: 'Wealth',
    targetValue: 50000,
    buffType: 'global_combat_power',
    buffPercentage: 4,
    buffDescription: '+4% Global Troop Combat Power',
    iconName: 'Coins',
    getValue: (stats, ctx) => Math.max(stats.totalCreditsEarned, ctx.credits)
  },
  {
    id: 'ach_credits_250k',
    title: 'War Chest',
    description: 'Amass or earn over $250,000 in Syndicate funds.',
    category: 'Wealth',
    targetValue: 250000,
    buffType: 'global_combat_power',
    buffPercentage: 8,
    buffDescription: '+8% Global Troop Combat Power',
    iconName: 'Coins',
    getValue: (stats, ctx) => Math.max(stats.totalCreditsEarned, ctx.credits)
  },
  {
    id: 'ach_credits_1m',
    title: 'First Million Credits',
    description: 'Break into elite wealth by amassing or generating $1,000,000 Credits.',
    category: 'Wealth',
    targetValue: 1000000,
    buffType: 'global_combat_power',
    buffPercentage: 15,
    buffDescription: '+15% Global Troop Combat Power',
    iconName: 'Crown',
    getValue: (stats, ctx) => Math.max(stats.totalCreditsEarned, ctx.credits)
  },
  {
    id: 'ach_credits_10m',
    title: 'Syndicate Oligarch',
    description: 'Reach an astronomical $10,000,000 in lifetime Syndicate revenue.',
    category: 'Wealth',
    targetValue: 10000000,
    buffType: 'global_combat_power',
    buffPercentage: 25,
    buffDescription: '+25% Global Troop Combat Power',
    iconName: 'Sparkles',
    getValue: (stats, ctx) => Math.max(stats.totalCreditsEarned, ctx.credits)
  },

  // 3. SYNDICATE PRESTIGE & INFRASTRUCTURE
  {
    id: 'ach_first_rebirth',
    title: 'Quantum Reincarnation',
    description: 'Execute your 1st System Reboot / Rebirth to ascend your syndicate.',
    category: 'Syndicate',
    targetValue: 1,
    buffType: 'global_combat_power',
    buffPercentage: 10,
    buffDescription: '+10% Global Troop Combat Power',
    iconName: 'Zap',
    getValue: (_, ctx) => ctx.rebirths
  },
  {
    id: 'ach_rebirth_3',
    title: 'Elite Syndicate Status',
    description: 'Attain Rebirth Level 3 or higher to establish irreversible global hegemony.',
    category: 'Syndicate',
    targetValue: 3,
    buffType: 'global_combat_power',
    buffPercentage: 20,
    buffDescription: '+20% Global Troop Combat Power',
    iconName: 'Crown',
    getValue: (_, ctx) => ctx.rebirths
  },
  {
    id: 'ach_rebirth_5',
    title: 'Singularity Ascendance',
    description: 'Ascend to Rebirth Tier 5, unlocking boundless technological mastery.',
    category: 'Syndicate',
    targetValue: 5,
    buffType: 'global_combat_power',
    buffPercentage: 30,
    buffDescription: '+30% Global Troop Combat Power',
    iconName: 'Sparkles',
    getValue: (_, ctx) => ctx.rebirths
  },
  {
    id: 'ach_hq_nodes_3',
    title: 'Infrastructure Hegemony',
    description: 'Construct and control at least 3 Headquarter Infrastructure Nodes.',
    category: 'Syndicate',
    targetValue: 3,
    buffType: 'global_combat_power',
    buffPercentage: 10,
    buffDescription: '+10% Global Troop Combat Power',
    iconName: 'Cpu',
    getValue: (_, ctx) => ctx.hqUpgrades.filter(u => u.owned).length
  },

  // 4. ARMORY & ARSENAL
  {
    id: 'ach_weapons_5',
    title: 'Armed & Ready',
    description: 'Acquire 5 or more advanced firearms or energy weapons in your Armory.',
    category: 'Armory',
    targetValue: 5,
    buffType: 'global_combat_power',
    buffPercentage: 6,
    buffDescription: '+6% Global Troop Combat Power',
    iconName: 'Sword',
    getValue: (_, ctx) => ctx.weapons.reduce((sum, w) => sum + w.count, 0)
  },
  {
    id: 'ach_weapon_legendary',
    title: 'Prototype Lethality',
    description: 'Decrypt or forge a weapon of Legendary, Mythical, or Exotic caliber.',
    category: 'Armory',
    targetValue: 1,
    buffType: 'global_combat_power',
    buffPercentage: 12,
    buffDescription: '+12% Global Troop Combat Power',
    iconName: 'Sparkles',
    getValue: (_, ctx) => ctx.weapons.some(w => ['Legendary', 'Mythical', 'Exotic', 'Divine', 'Boundless'].includes(w.weapon.rarity)) ? 1 : 0
  },
  {
    id: 'ach_weapon_boundless',
    title: 'Reality Fracture',
    description: 'Harness a Divine or Boundless weapon that bends quantum spacetime.',
    category: 'Armory',
    targetValue: 1,
    buffType: 'global_combat_power',
    buffPercentage: 20,
    buffDescription: '+20% Global Troop Combat Power',
    iconName: 'Skull',
    getValue: (_, ctx) => ctx.weapons.some(w => ['Divine', 'Boundless'].includes(w.weapon.rarity)) ? 1 : 0
  },
  {
    id: 'ach_army_50',
    title: 'Private Military Legion',
    description: 'Command an active standing force of 50 or more elite mercenaries.',
    category: 'Armory',
    targetValue: 50,
    buffType: 'global_combat_power',
    buffPercentage: 10,
    buffDescription: '+10% Global Troop Combat Power',
    iconName: 'Shield',
    getValue: (_, ctx) => ctx.troops.reduce((sum, t) => sum + t.count, 0)
  },

  // 5. WARFARE & DEFENSE
  {
    id: 'ach_raids_3',
    title: 'Fortress Lockdown',
    description: 'Successfully repel 3 hostile HQ Base Raids without suffering breaches.',
    category: 'Warfare',
    targetValue: 3,
    buffType: 'global_combat_power',
    buffPercentage: 10,
    buffDescription: '+10% Global Troop Combat Power',
    iconName: 'Shield',
    getValue: (stats) => stats.totalRaidsDefended
  },
  {
    id: 'ach_raids_10',
    title: 'Unbreakable Citadel',
    description: 'Repel 10 enemy strike teams attempting to infiltrate Headquarters.',
    category: 'Warfare',
    targetValue: 10,
    buffType: 'global_combat_power',
    buffPercentage: 18,
    buffDescription: '+18% Global Troop Combat Power',
    iconName: 'Award',
    getValue: (stats) => stats.totalRaidsDefended
  },
  {
    id: 'ach_incite_wars_3',
    title: 'Puppet Master',
    description: 'Incite 3 covert proxy wars to pit rival global superpowers against each other.',
    category: 'Warfare',
    targetValue: 3,
    buffType: 'global_combat_power',
    buffPercentage: 12,
    buffDescription: '+12% Global Troop Combat Power',
    iconName: 'Radio',
    getValue: (stats) => stats.totalWarsIncited
  }
];

export function computeAchievements(
  stats: PlayerStats,
  gameContext: {
    credits: number;
    intel: number;
    rebirths: number;
    troops: PlayerTroop[];
    weapons: WeaponItem[];
    hqUpgrades: HQUpgrade[];
  },
  persistedUnlocked: Record<string, number> // id -> unlockedAt timestamp
): {
  achievements: Achievement[];
  totalPowerBuffPercent: number;
  powerMultiplier: number;
  newlyUnlocked: Achievement[];
} {
  const achievements: Achievement[] = [];
  const newlyUnlocked: Achievement[] = [];
  let totalPowerBuffPercent = 0;

  ACHIEVEMENTS_DEFINITIONS.forEach(def => {
    const rawVal = def.getValue(stats, gameContext);
    const currentValue = Math.min(def.targetValue, rawVal);
    const wasAlreadyUnlocked = Boolean(persistedUnlocked[def.id]);
    const isNowUnlocked = wasAlreadyUnlocked || (rawVal >= def.targetValue);

    const unlockedAt = isNowUnlocked 
      ? (persistedUnlocked[def.id] || Date.now())
      : undefined;

    const achievement: Achievement = {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      targetValue: def.targetValue,
      currentValue,
      unlocked: isNowUnlocked,
      unlockedAt,
      buffType: def.buffType,
      buffPercentage: def.buffPercentage,
      buffDescription: def.buffDescription,
      iconName: def.iconName
    };

    achievements.push(achievement);

    if (isNowUnlocked) {
      totalPowerBuffPercent += def.buffPercentage;
      if (!wasAlreadyUnlocked && rawVal >= def.targetValue) {
        newlyUnlocked.push(achievement);
      }
    }
  });

  const powerMultiplier = 1 + (totalPowerBuffPercent / 100);

  return {
    achievements,
    totalPowerBuffPercent,
    powerMultiplier,
    newlyUnlocked
  };
}
