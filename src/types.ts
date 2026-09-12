export type MercenaryClass = 'Assault' | 'Sniper' | 'Juggernaut' | 'Hacker' | 'Medic';

export interface PlayerTroop {
  class: MercenaryClass;
  count: number;
  level: number;
  basePower: number;
  equippedWeaponId: string | null;
  passiveDesc?: string;
}

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Exotic' | 'Divine' | 'Boundless';

export interface Weapon {
  id: string;
  name: string;
  tier: 'Standard' | 'Advanced' | 'Prototype';
  rarity: Rarity;
  powerMultiplier: number; 
}

export interface HQUpgrade {
  id: string;
  name: string;
  description: string;
  costCredits: number;
  costIntel: number;
  requiredRebirths: number;
  incomeBoost: number;
  owned: boolean;
  cooldownMissionsRemaining?: number; // 0 = ready, 1 or 2 = cooling down
  lastHarvestedAmount?: number;
}

export interface WeaponItem {
  weapon: Weapon;
  count: number;
}

export type MissionDifficulty = 'Easy' | 'Moderate' | 'Extreme' | 'Suicide Mission' | 'Warzone' | 'Nightmare';
export type MinigameType = 'bullet_hell' | 'power_clash' | 'minefield' | 'cyber_decryption';

export interface Mission {
  id: string;
  title: string;
  client: string;
  targetNation: string;
  description: string;
  difficulty: MissionDifficulty;
  recommendedPower: number;
  rewards: {
    credits: number;
    intel: number;
    tech: number;
  };
  durationSeconds: number;
  requiresMinigame: boolean;
  minigamesCount?: number;
  minigameTypes?: MinigameType[];
  warId?: string;
  supportedSide?: 'A' | 'B';
  supportedFaction?: string;
  enemyFaction?: string;
}

export interface ActiveMission {
  missionId: string;
  mission: Mission;
  assignedTroops: { class: MercenaryClass; count: number }[];
  startTime: number;
  durationSeconds: number;
  successProbability: number;
  minigameScore?: number; // modifier from playing the minigame
  stagesCompleted?: number;
}

export interface WorldEvent {
  id: string;
  title: string;
  category: 'Economic' | 'Political' | 'Technological' | 'Military' | 'Covert';
  headline: string;
  description: string;
  creditMultiplier: number;
  intelMultiplier: number;
  tensionChange: number;
  durationSeconds: number;
  startTime: number;
  expiresAt: number;
}

export interface WarEvent {
  id: string;
  name: string;
  factionA: string;
  factionB: string;
  playerSide: 'A' | 'B' | 'None';
  status: 'Active' | 'Resolved';
  rewardCredits: number;
  rewardIntel: number;
  requiredPower: number;
}

export interface HQRaid {
  id: string;
  attacker: string;
  threatLevel: 'Minor' | 'Severe' | 'Critical';
  requiredPower: number;
  timeRemainingSeconds: number;
  penaltyCredits: number;
  penaltyIntel: number;
}

export interface RivalNation {
  id: string;
  name: string;
  ideology: string;
  tension: number; // 0 - 100
  power: number;
  status: 'Cold War' | 'Proxy Clash' | 'Subversive Hostility' | 'Vulnerable' | 'At War';
}

export type TabType = 'dashboard' | 'roster' | 'missions' | 'achievements' | 'armory' | 'geopolitics' | 'headquarters' | 'events' | 'academy' | 'story' | 'map' | 'war';

export type AchievementCategory = 'Operations' | 'Wealth' | 'Syndicate' | 'Armory' | 'Warfare';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: number;
  buffType: 'global_combat_power' | 'assault_sniper_power' | 'juggernaut_medic_power' | 'hacker_power' | 'critical_power';
  buffPercentage: number; // e.g. 5 for +5%, 10 for +10%
  buffDescription: string; // e.g. "+10% Global Troop Combat Power"
  iconName: string;
}

export interface PlayerStats {
  totalMissionsCompleted: number;
  totalCreditsEarned: number;
  totalIntelEarned: number;
  totalRaidsDefended: number;
  totalWarsIncited: number;
  totalCratesOpened: number;
  maxCreditsHeld: number;
}

export interface StoryChapter {
  id: string;
  actNumber: number;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  rewardCredits: number;
  rewardIntel: number;
  unlocked: boolean;
  completed: boolean;
}

export interface TerritoryNode {
  id: string;
  name: string;
  type: 'Apex Command' | 'Rival Capital' | 'Contested Warzone' | 'Black Market Outpost' | 'Neural Relay';
  coordinates: { x: number; y: number }; // percentage 0-100
  controller: string;
  garrisonPower: number;
  status: 'Secure' | 'Contested' | 'Hostile' | 'Infiltrated';
  description: string;
}

export interface AssistantMessage {
  id: string;
  type: 'alert' | 'success' | 'warning' | 'info' | 'intel';
  tag: string;
  title: string;
  message: string;
  timestamp: number;
  action?: {
    label: string;
    tab?: TabType;
  };
}

