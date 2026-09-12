import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Roster } from './components/Roster';
import { Missions } from './components/Missions';
import { Academy } from './components/Academy';
import { Armory } from './components/Armory';
import { Geopolitics } from './components/Geopolitics';
import { Headquarters } from './components/Headquarters';
import { InteractiveGuide } from './components/InteractiveGuide';
import { BattleSimulationModal } from './components/BattleSimulationModal';
import { StoryMode } from './components/StoryMode';
import { StrategicMap } from './components/StrategicMap';
import { WarzoneSupportModal } from './components/WarzoneSupportModal';
import { CheatBoard } from './components/CheatBoard';
import { WorldEventsView } from './components/WorldEventsView';
import { HQRaidModal } from './components/HQRaidModal';
import { Achievements } from './components/Achievements';
import { TacticalAssistant } from './components/TacticalAssistant';
import { calculateTeamPower, calculateInfiltrationDuration } from './utils/infiltration';
import { 
  PlayerTroop, 
  Mission, 
  ActiveMission, 
  RivalNation, 
  TabType, 
  StoryChapter, 
  TerritoryNode, 
  WeaponItem, 
  WarEvent, 
  HQUpgrade, 
  WorldEvent, 
  HQRaid,
  MercenaryClass,
  PlayerStats,
  AssistantMessage 
} from './types';
import { generateRandomWorldEvent } from './data/worldEvents';
import { computeAchievements } from './data/achievements';
import { Save, CheckCircle2, ShieldAlert } from 'lucide-react';

const SAVE_KEY = 'apex_mercenary_save_v2';

const INITIAL_TROOPS: PlayerTroop[] = [
  { class: 'Assault', count: 10, level: 1, basePower: 10, equippedWeaponId: null, passiveDesc: '+10% Combat Power' },
  { class: 'Sniper', count: 5, level: 1, basePower: 15, equippedWeaponId: null, passiveDesc: '+15% Success Chance' },
  { class: 'Juggernaut', count: 2, level: 1, basePower: 25, equippedWeaponId: null, passiveDesc: '-50% Casualties' },
  { class: 'Hacker', count: 3, level: 1, basePower: 8, equippedWeaponId: null, passiveDesc: '+25% Intel Rewards' },
  { class: 'Medic', count: 4, level: 1, basePower: 5, equippedWeaponId: null, passiveDesc: '20% Revive Chance on Death' },
];

const INITIAL_HQ_UPGRADES: HQUpgrade[] = [
  { id: 'hq_1', name: 'Black Market Front', description: 'Fences high-grade smuggled military hardware and illicit contraband.', costCredits: 20000, costIntel: 50, requiredRebirths: 0, incomeBoost: 8000, owned: false, cooldownMissionsRemaining: 0 },
  { id: 'hq_2', name: 'Offshore Server Farm', description: 'Mines decentralized cryptocurrency and automates money laundering.', costCredits: 75000, costIntel: 200, requiredRebirths: 1, incomeBoost: 25000, owned: false, cooldownMissionsRemaining: 0 },
  { id: 'hq_3', name: 'Global Extortion Network', description: 'Extracts protection fees from transnational shipping cartels.', costCredits: 250000, costIntel: 800, requiredRebirths: 3, incomeBoost: 80000, owned: false, cooldownMissionsRemaining: 0 },
  { id: 'hq_4', name: 'Orbital Mining Claim', description: 'Harvests rare-earth asteroid isotopes in low earth orbit.', costCredits: 1000000, costIntel: 3000, requiredRebirths: 5, incomeBoost: 300000, owned: false, cooldownMissionsRemaining: 0 },
  { id: 'hq_5', name: 'Singularity Forge', description: 'Synthesizes boundless value from quantum vacuum fluctuations.', costCredits: 5000000, costIntel: 10000, requiredRebirths: 10, incomeBoost: 1500000, owned: false, cooldownMissionsRemaining: 0 },
];

const INITIAL_RIVAL_NATIONS: RivalNation[] = [
  { id: 'nat_1', name: 'The Technocratic Syndicate of Vorex', ideology: 'Cybernetic Transhumanism', tension: 65, power: 890, status: 'Proxy Clash' },
  { id: 'nat_2', name: 'The Iron Directorate', ideology: 'Brutalist Militarism', tension: 72, power: 950, status: 'Cold War' },
  { id: 'nat_3', name: 'Neo-Shanghai Conglomerate', ideology: 'Corporate Hyper-Capitalism', tension: 45, power: 810, status: 'Cold War' },
  { id: 'nat_4', name: 'Aethelgard Republic', ideology: 'Decayed Democracy', tension: 52, power: 760, status: 'Vulnerable' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [simulatingMission, setSimulatingMission] = useState<ActiveMission | null>(null);
  const [activeRaid, setActiveRaid] = useState<HQRaid | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  
  // Tactical Assistant (A.R.E.S.) State
  const [assistantMessage, setAssistantMessage] = useState<AssistantMessage | null>(null);
  const [assistantHistory, setAssistantHistory] = useState<AssistantMessage[]>([]);

  const notifyAssistant = (msg: Omit<AssistantMessage, 'id' | 'timestamp'>) => {
    const fullMsg: AssistantMessage = {
      ...msg,
      id: 'asst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };
    setAssistantMessage(fullMsg);
    setAssistantHistory(prev => [fullMsg, ...prev.slice(0, 29)]);
  };
  
  // Syndicate Core Resources
  const [credits, setCredits] = useState<number>(6500);
  const [intel, setIntel] = useState<number>(200);
  const [techLevel, setTechLevel] = useState<number>(1);
  const [morale, setMorale] = useState<number>(92);
  const [tension, setTension] = useState<number>(45);
  const [rebirths, setRebirths] = useState<number>(0);

  // Player Stats for Achievements tracking
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalMissionsCompleted: 0,
    totalCreditsEarned: 0,
    totalIntelEarned: 0,
    totalRaidsDefended: 0,
    totalWarsIncited: 0,
    totalCratesOpened: 0,
    maxCreditsHeld: 6500
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, number>>({});

  // Completed Missions Counter (for Raid Triggering strictly every 3 missions)
  const [completedMissionsCount, setCompletedMissionsCount] = useState<number>(0);

  // World Events System & Freeze State
  const [activeWorldEvent, setActiveWorldEvent] = useState<WorldEvent | null>(() => generateRandomWorldEvent());
  const [eventHistory, setEventHistory] = useState<WorldEvent[]>([]);
  const [nextEventTimestamp, setNextEventTimestamp] = useState<number>(0);
  const [eventFreezeMissionsRemaining, setEventFreezeMissionsRemaining] = useState<number>(0);

  // Weapons, Troops & Infrastructure
  const [weapons, setWeapons] = useState<WeaponItem[]>([]);
  const [troops, setTroops] = useState<PlayerTroop[]>(INITIAL_TROOPS);
  const [hqUpgrades, setHqUpgrades] = useState<HQUpgrade[]>(INITIAL_HQ_UPGRADES);

  // Compute Achievements & Permanent Combat Multipliers dynamically
  const { 
    achievements: achievementsList, 
    totalPowerBuffPercent: achievementPowerBuffPercent, 
    powerMultiplier: achievementPowerMultiplier, 
    newlyUnlocked 
  } = computeAchievements(
    playerStats,
    {
      credits,
      intel,
      rebirths,
      troops,
      weapons,
      hqUpgrades
    },
    unlockedAchievements
  );

  // Notify assistant when achievements unlock
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const now = Date.now();
      const newItems: Record<string, number> = {};
      newlyUnlocked.forEach(a => {
        if (!unlockedAchievements[a.id]) {
          newItems[a.id] = a.unlockedAt || now;
          notifyAssistant({
            type: 'success',
            tag: 'MILESTONE UNLOCKED',
            title: `ACHIEVEMENT: ${a.title.toUpperCase()}`,
            message: `Milestone completed! Awarded permanent passive buff: ${a.buffDescription} (+${a.buffPercentage}%).`,
            action: { label: 'VIEW ACHIEVEMENTS', tab: 'achievements' }
          });
        }
      });
      if (Object.keys(newItems).length > 0) {
        setUnlockedAchievements(prev => ({ ...prev, ...newItems }));
      }
    }
  }, [newlyUnlocked, unlockedAchievements]);

  // Tactical Briefing Request Handler
  const handleRequestBriefing = () => {
    const readyHqCount = hqUpgrades.filter(u => u.owned && (u.cooldownMissionsRemaining || 0) === 0).length;
    const readyMissionsCount = activeMissions.filter(m => (Date.now() - m.startTime) >= m.durationSeconds * 1000).length;

    let advice = '';
    let actionTab: TabType = 'dashboard';
    let actionLabel = 'VIEW DASHBOARD';

    if (activeRaid) {
      advice = `CRITICAL ALERT: Apex HQ is currently under attack by ${activeRaid.attacker}! Threat level is ${activeRaid.threatLevel}. Deploy garrison immediately!`;
      actionTab = 'dashboard';
      actionLabel = 'DEFEND BASE NOW';
    } else if (readyMissionsCount > 0) {
      advice = `We have ${readyMissionsCount} completed field operation(s) awaiting tactical extraction and resolution. Check Missions tab.`;
      actionTab = 'missions';
      actionLabel = 'RESOLVE MISSIONS';
    } else if (readyHqCount > 0) {
      advice = `${readyHqCount} corporate front node(s) have accumulated ready off-ledger revenue. Extract the funds in Headquarters.`;
      actionTab = 'headquarters';
      actionLabel = 'EXTRACT REVENUE';
    } else if (tension >= 70) {
      advice = `Global tension is at elevated DEFCON (${tension}%). Superpowers are watching us closely. Run a Disinformation campaign in World Events or incite a proxy war in Geopolitics to deflect heat.`;
      actionTab = 'geopolitics';
      actionLabel = 'INCITE WAR';
    } else if (credits >= 60000 && rebirths >= 2) {
      advice = `Treasury holds $${credits.toLocaleString()}. High-tier prototype weapon crates are available in the Armory to multiply squad lethality.`;
      actionTab = 'armory';
      actionLabel = 'OPEN ARMORY';
    } else if (activeMissions.length === 0) {
      advice = `All mercenary units are currently idle in the barracks. Deploy squads on high-yield contracts to grow our war chest and intel reserves.`;
      actionTab = 'missions';
      actionLabel = 'VIEW MISSIONS';
    } else {
      advice = `Operational status nominal. Treasury: $${credits.toLocaleString()} | Intel: ${intel} TB | Deployed Ops: ${activeMissions.length} | Permanent Combat Buff: +${achievementPowerBuffPercent}%. Keep expanding syndicate assets.`;
      actionTab = 'dashboard';
      actionLabel = 'STATUS OVERVIEW';
    }

    notifyAssistant({
      type: 'intel',
      tag: 'SITREP BRIEFING',
      title: 'A.R.E.S. TACTICAL ASSESSMENT',
      message: advice,
      action: { label: actionLabel, tab: actionTab }
    });
  };

  // Initial boot greeting message
  useEffect(() => {
    const timer = setTimeout(() => {
      notifyAssistant({
        type: 'info',
        tag: 'SYSTEM BOOT',
        title: 'A.R.E.S. TACTICAL LINK ONLINE',
        message: 'Greetings Commander. I am A.R.E.S., your Autonomous Tactical Logistics & Advisory System. I will monitor combat telemetry, base raids, market crises, and treasury feeds and alert you in real-time.',
        action: { label: 'CHECK DIRECTIVES', tab: 'missions' }
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Missions & Operations
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMissions, setActiveMissions] = useState<ActiveMission[]>([]);
  const [generatingMission, setGeneratingMission] = useState<boolean>(false);

  // Geopolitics & Dynamic Active Conflicts
  const [rivalNations, setRivalNations] = useState<RivalNation[]>(INITIAL_RIVAL_NATIONS);
  const [warEvents, setWarEvents] = useState<WarEvent[]>([
    {
      id: 'war_initial_1',
      name: 'Border Flashpoint: Iron Curtain',
      factionA: 'The Iron Directorate',
      factionB: 'The Technocratic Syndicate of Vorex',
      playerSide: 'None',
      status: 'Active',
      rewardCredits: 45000,
      rewardIntel: 350,
      requiredPower: 920
    }
  ]);

  // Debrief Modal
  const [debriefResult, setDebriefResult] = useState<{
    title: string;
    success: boolean;
    summary: string;
    rewards: { credits: number; intel: number; tech: number };
  } | null>(null);

  // Warzone Support Modal state (can be triggered from Map or Geopolitics)
  const [selectedWarzoneInApp, setSelectedWarzoneInApp] = useState<WarEvent | null>(null);

  // Load Saved Game on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.credits === 'number') setCredits(data.credits);
        if (typeof data.intel === 'number') setIntel(data.intel);
        if (typeof data.techLevel === 'number') setTechLevel(data.techLevel);
        if (typeof data.morale === 'number') setMorale(data.morale);
        if (typeof data.tension === 'number') setTension(data.tension);
        if (typeof data.rebirths === 'number') setRebirths(data.rebirths);
        if (typeof data.completedMissionsCount === 'number') setCompletedMissionsCount(data.completedMissionsCount);
        if (typeof data.eventFreezeMissionsRemaining === 'number') setEventFreezeMissionsRemaining(data.eventFreezeMissionsRemaining);
        if (Array.isArray(data.troops)) setTroops(data.troops);
        if (Array.isArray(data.weapons)) setWeapons(data.weapons);
        if (Array.isArray(data.hqUpgrades)) setHqUpgrades(data.hqUpgrades);
        if (Array.isArray(data.rivalNations)) setRivalNations(data.rivalNations);
        if (Array.isArray(data.warEvents)) setWarEvents(data.warEvents);
        if (Array.isArray(data.eventHistory)) setEventHistory(data.eventHistory);
        if (data.activeWorldEvent) setActiveWorldEvent(data.activeWorldEvent);
        if (data.playerStats && typeof data.playerStats === 'object') {
          setPlayerStats(data.playerStats);
        }
        if (data.unlockedAchievements && typeof data.unlockedAchievements === 'object') {
          setUnlockedAchievements(data.unlockedAchievements);
        }
        
        setSaveToast("LOCAL PROFILE RESTORED // SYNDICATE OPERATIONAL");
        setTimeout(() => setSaveToast(null), 3000);
      }
    } catch (e) {
      console.error("Failed to load save game:", e);
    }
  }, []);

  // System Save Handler
  const handleSaveGame = () => {
    try {
      const gameState = {
        credits,
        intel,
        techLevel,
        morale,
        tension,
        rebirths,
        completedMissionsCount,
        eventFreezeMissionsRemaining,
        troops,
        weapons,
        hqUpgrades,
        rivalNations,
        warEvents,
        activeWorldEvent,
        eventHistory,
        playerStats,
        unlockedAchievements,
        timestamp: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      setSaveToast("SYSTEM ENCRYPTION COMPLETE // ALL PROGRESS SECURELY SAVED");
      setTimeout(() => setSaveToast(null), 3500);
      notifyAssistant({
        type: 'success',
        tag: 'SYS.SAVE',
        title: 'ENCRYPTION SECURED',
        message: 'All syndicate personnel, assets, milestones, and armory records safely committed to storage.',
      });
    } catch (e) {
      console.error("Save error:", e);
      setSaveToast("SAVE ERROR: Local storage capacity or permission issue");
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  // World Events Interval Engine (Accounts for Freeze)
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const now = Date.now();

      // If active event is frozen, continuously extend its expiration time
      if (activeWorldEvent && eventFreezeMissionsRemaining > 0) {
        setActiveWorldEvent(prev => prev ? {
          ...prev,
          expiresAt: Math.max(prev.expiresAt, now + 60000)
        } : null);
        return;
      }

      // Check if current world event expired
      if (activeWorldEvent && now >= activeWorldEvent.expiresAt) {
        setActiveWorldEvent(null);
        const cooldownMs = (15 + Math.floor(Math.random() * 10)) * 1000;
        setNextEventTimestamp(now + cooldownMs);
      } 
      // Trigger next event if cooldown has passed
      else if (!activeWorldEvent) {
        if (nextEventTimestamp === 0 || now >= nextEventTimestamp) {
          const newEvent = generateRandomWorldEvent();
          setActiveWorldEvent(newEvent);
          setEventHistory(prev => [newEvent, ...prev.filter(e => e.id !== newEvent.id)].slice(0, 15));
          setTension(prev => Math.max(5, Math.min(100, prev + newEvent.tensionChange)));
          setRivalNations(prev => prev.map(n => ({
            ...n,
            tension: Math.max(10, Math.min(100, n.tension + Math.floor(newEvent.tensionChange * 0.7)))
          })));
          notifyAssistant({
            type: 'warning',
            tag: 'GLOBAL CRISIS',
            title: `CRISIS: ${newEvent.title.toUpperCase()}`,
            message: `${newEvent.headline}. Tension ${newEvent.tensionChange >= 0 ? '+' : ''}${newEvent.tensionChange}, Credit rewards x${newEvent.creditMultiplier}.`,
            action: { label: 'VIEW CRISIS', tab: 'events' }
          });
        }
      }
    }, 1000);

    return () => clearInterval(eventInterval);
  }, [activeWorldEvent, nextEventTimestamp, eventFreezeMissionsRemaining]);

  // World Event Freeze Handler (500 Intel for 3 Missions)
  const handleFreezeWorldEvent = () => {
    if (intel < 500) {
      setSaveToast("INSUFFICIENT INTEL: 500 TB required to freeze crisis lifespan");
      setTimeout(() => setSaveToast(null), 3500);
      return;
    }
    if (!activeWorldEvent) {
      setSaveToast("NO ACTIVE CRISIS TO STABILIZE");
      setTimeout(() => setSaveToast(null), 3500);
      return;
    }

    setIntel(prev => prev - 500);
    setEventFreezeMissionsRemaining(3);
    setSaveToast("CRISIS STABILIZED // LIFESPAN FROZEN FOR 3 MISSIONS");
    setTimeout(() => setSaveToast(null), 3500);
    notifyAssistant({
      type: 'intel',
      tag: 'CRYOGENIC FREEZE',
      title: 'CRISIS TIMELINE SUSPENDED',
      message: '500 TB Intel invested into quantum cooling servers. Crisis expiration clock frozen for 3 missions.',
      action: { label: 'VIEW CRISIS', tab: 'events' }
    });
  };

  const handleTriggerWorldEvent = () => {
    const newEvent = generateRandomWorldEvent(activeWorldEvent?.title);
    setActiveWorldEvent(newEvent);
    setEventFreezeMissionsRemaining(0);
    setEventHistory(prev => [newEvent, ...prev.filter(e => e.id !== newEvent.id)].slice(0, 15));
    setTension(prev => Math.max(5, Math.min(100, prev + newEvent.tensionChange)));
    setRivalNations(prev => prev.map(n => ({
      ...n,
      tension: Math.max(10, Math.min(100, n.tension + Math.floor(newEvent.tensionChange * 0.7)))
    })));
    notifyAssistant({
      type: 'warning',
      tag: 'GLOBAL CRISIS',
      title: `CRISIS: ${newEvent.title.toUpperCase()}`,
      message: `${newEvent.headline}. Tension ${newEvent.tensionChange >= 0 ? '+' : ''}${newEvent.tensionChange}, Credit rewards x${newEvent.creditMultiplier}.`,
      action: { label: 'VIEW CRISIS', tab: 'events' }
    });
  };

  const handleClearWorldEvent = () => {
    setActiveWorldEvent(null);
    setEventFreezeMissionsRemaining(0);
    setNextEventTimestamp(Date.now() + 20000);
    notifyAssistant({
      type: 'info',
      tag: 'CRISIS CLEARED',
      title: 'MARKET CONDITIONS NORMALIZED',
      message: 'Active world crisis resolved. Multipliers reset to standard syndicate baselines.',
      action: { label: 'VIEW EVENTS', tab: 'events' }
    });
  };

  const handleDisinformationCampaign = () => {
    if (intel >= 50) {
      setIntel(prev => prev - 50);
      setTension(prev => Math.max(5, prev - 15));
      setRivalNations(prev => prev.map(n => ({
        ...n,
        tension: Math.max(10, n.tension - 10)
      })));
      notifyAssistant({
        type: 'info',
        tag: 'DISINFORMATION',
        title: 'FALSE TELEMETRY SEEDED',
        message: 'Disinformation networks deployed. Superpowers duped by phantom signals. Apex tension reduced by 15%.',
        action: { label: 'VIEW GEOPOLITICS', tab: 'geopolitics' }
      });
    }
  };

  // Incite War Handler: Reduces Syndicate Tension by 25% and sparks war between rival superpowers
  const handleInciteWar = (targetNationId: string) => {
    if (intel < 100) {
      setSaveToast("INSUFFICIENT INTEL: 100 TB required to incite proxy war");
      setTimeout(() => setSaveToast(null), 3500);
      return;
    }

    const targetNation = rivalNations.find(n => n.id === targetNationId);
    if (!targetNation) return;

    // Pick another rival nation to clash with
    const otherNations = rivalNations.filter(n => n.id !== targetNationId);
    const opponentNation = otherNations[Math.floor(Math.random() * otherNations.length)] || rivalNations[0];

    // Deduct 100 Intel
    setIntel(prev => prev - 100);

    // Reduce Apex Syndicate tension by 25% (deflecting foreign attention)
    setTension(prev => Math.max(5, prev - 25));

    // Increase tension between the two rival superpowers
    setRivalNations(prev => prev.map(n => {
      if (n.id === targetNation.id || n.id === opponentNation.id) {
        return { ...n, tension: Math.min(100, n.tension + 25), status: 'At War' };
      }
      return n;
    }));

    // Update player stats for achievement tracking
    setPlayerStats(prev => ({
      ...prev,
      totalWarsIncited: prev.totalWarsIncited + 1
    }));

    // Create / escalate Active Conflict between the two factions
    const conflictNames = [
      'Operation False Dawn',
      'Sovereignty Severance War',
      'Orbital Corridor Flashpoint',
      'Cyber-Kinetic Border War',
      'Contested Uranium Skirmish'
    ];
    const newWar: WarEvent = {
      id: 'war_' + Date.now(),
      name: conflictNames[Math.floor(Math.random() * conflictNames.length)],
      factionA: targetNation.name,
      factionB: opponentNation.name,
      playerSide: 'None',
      status: 'Active',
      rewardCredits: 60000,
      rewardIntel: 500,
      requiredPower: 950
    };

    setWarEvents(prev => [newWar, ...prev.filter(w => w.status === 'Active')].slice(0, 6));

    notifyAssistant({
      type: 'intel',
      tag: 'BLACK OPS',
      title: 'PROXY WAR IGNITED',
      message: `False flag attack ignited conflict between ${targetNation.name} and ${opponentNation.name}! Apex tension reduced by 25%.`,
      action: { label: 'VIEW CONFLICTS', tab: 'geopolitics' }
    });

    setDebriefResult({
      title: "PROXY WAR INCITED // HEAT DEFLECTED",
      success: true,
      summary: `Covert black-ops provocateurs successfully staged a false-flag attack. War sparked between ${targetNation.name} and ${opponentNation.name}. International intelligence satellites redirected — Apex Syndicate tension dropped by 25%!`,
      rewards: { credits: 0, intel: 0, tech: 0 }
    });
  };

  // Dynamic Conflict Maintenance: when tensions rise, ensure active conflicts reflect reality
  useEffect(() => {
    // If high global tension, spawn syndicate standoff if none exists
    const hasSyndicateConflict = warEvents.some(w => w.factionA.includes('Apex') || w.factionB.includes('Apex'));
    if (tension >= 65 && !hasSyndicateConflict) {
      const hostileNation = rivalNations.reduce((prev, curr) => curr.tension > prev.tension ? curr : prev, rivalNations[0]);
      if (hostileNation) {
        const apexConflict: WarEvent = {
          id: 'war_apex_' + Date.now(),
          name: 'Hostile Recon & Border Probing',
          factionA: 'Apex Syndicate',
          factionB: hostileNation.name,
          playerSide: 'A',
          status: 'Active',
          rewardCredits: 75000,
          rewardIntel: 600,
          requiredPower: 1100
        };
        setWarEvents(prev => [apexConflict, ...prev].slice(0, 6));
      }
    }
  }, [tension, rivalNations]);

  // Infrastructure: Purchase Node
  const handlePurchaseHQUpgrade = (id: string) => {
    const upgrade = hqUpgrades.find(u => u.id === id);
    if (upgrade && credits >= upgrade.costCredits && intel >= upgrade.costIntel && !upgrade.owned) {
      setCredits(c => c - upgrade.costCredits);
      setIntel(i => i - upgrade.costIntel);
      setHqUpgrades(prev => prev.map(u => u.id === id ? { ...u, owned: true, cooldownMissionsRemaining: 0 } : u));
      setSaveToast(`ASSET ACQUIRED: ${upgrade.name.toUpperCase()} READY FOR EXTRACTION`);
      setTimeout(() => setSaveToast(null), 3000);
      notifyAssistant({
        type: 'info',
        tag: 'NODE ONLINE',
        title: `${upgrade.name.toUpperCase()} ACQUIRED`,
        message: `Corporate shell is operational. Will yield +$${upgrade.incomeBoost.toLocaleString()} every 2-mission extraction cycle.`,
        action: { label: 'VIEW HQ', tab: 'headquarters' }
      });
    }
  };

  // Infrastructure: Single Node Yield Harvest (Takes 2 missions to recharge)
  const handleHarvestHQUpgrade = (id: string) => {
    const upgrade = hqUpgrades.find(u => u.id === id);
    if (upgrade && upgrade.owned && (upgrade.cooldownMissionsRemaining || 0) === 0) {
      setCredits(c => c + upgrade.incomeBoost);
      setPlayerStats(prev => ({
        ...prev,
        totalCreditsEarned: prev.totalCreditsEarned + upgrade.incomeBoost,
        maxCreditsHeld: Math.max(prev.maxCreditsHeld, credits + upgrade.incomeBoost)
      }));
      setHqUpgrades(prev => prev.map(u => u.id === id ? { ...u, cooldownMissionsRemaining: 2 } : u));
      setSaveToast(`+$${upgrade.incomeBoost.toLocaleString()} EXTRACTED // RECHARGE INITIATED (2 OPS)`);
      setTimeout(() => setSaveToast(null), 3000);
      notifyAssistant({
        type: 'success',
        tag: 'OFF-LEDGER YIELD',
        title: 'REVENUE LIQUIDATED',
        message: `Harvested +$${upgrade.incomeBoost.toLocaleString()} from ${upgrade.name}. Node entering 2-operation recharge cycle.`,
        action: { label: 'VIEW HQ', tab: 'headquarters' }
      });
    }
  };

  // Infrastructure: Harvest All Ready Nodes
  const handleHarvestAllReadyHQUpgrades = () => {
    const readyUpgrades = hqUpgrades.filter(u => u.owned && (u.cooldownMissionsRemaining || 0) === 0);
    if (readyUpgrades.length === 0) return;

    const totalYield = readyUpgrades.reduce((sum, u) => sum + u.incomeBoost, 0);
    setCredits(c => c + totalYield);
    setPlayerStats(prev => ({
      ...prev,
      totalCreditsEarned: prev.totalCreditsEarned + totalYield,
      maxCreditsHeld: Math.max(prev.maxCreditsHeld, credits + totalYield)
    }));
    setHqUpgrades(prev => prev.map(u => (u.owned && (u.cooldownMissionsRemaining || 0) === 0) ? { ...u, cooldownMissionsRemaining: 2 } : u));
    setSaveToast(`+$${totalYield.toLocaleString()} CLAIMED ACROSS ${readyUpgrades.length} NODES // RECHARGING`);
    setTimeout(() => setSaveToast(null), 3500);
    notifyAssistant({
      type: 'success',
      tag: 'BATCH EXTRACTION',
      title: 'TREASURY INFUSION',
      message: `Extracted total +$${totalYield.toLocaleString()} across ${readyUpgrades.length} corporate fronts!`,
      action: { label: 'OPEN ARMORY', tab: 'armory' }
    });
  };

  // Missions Generation: Enhanced Rewards & Warzone Tier (Rebirth 2+)
  useEffect(() => {
    handleGenerateNewMission(true);
  }, [rebirths]);

  const handleGenerateNewMission = async (bypassRequirement: boolean = false) => {
    const totalBeaten = Math.max(playerStats.totalMissionsCompleted, completedMissionsCount);
    if (!bypassRequirement && totalBeaten < 2) {
      notifyAssistant({
        type: 'warning',
        tag: 'BROKER LOCKOUT',
        title: 'CLEARANCE RESTRICTED',
        message: `Underground broker refresh requires beating at least 2 missions (${totalBeaten}/2 cleared). Complete available contracts to unlock new signals.`,
        action: { label: 'VIEW MISSIONS', tab: 'missions' }
      });
      return;
    }

    setGeneratingMission(true);
    setTimeout(() => {
      const extremeCredits = Math.floor(Math.random() * (35000 - 19000 + 1)) + 19000;
      const extremeIntel = Math.floor(Math.random() * (220 - 150 + 1)) + 150;

      const suicideCredits = Math.floor(Math.random() * (150000 - 60000 + 1)) + 60000;
      const suicideIntel = Math.floor(Math.random() * (400 - 250 + 1)) + 250;

      const newMissions: Mission[] = [
        { 
          id: 'm_mod_' + Math.random().toString(36).substring(2, 7), 
          title: 'Covert Border Incursion', 
          client: 'Aethelgard Republic', 
          targetNation: 'The Technocratic Syndicate of Vorex', 
          description: 'Neutralize an automated surveillance redoubt and secure optical encryption drives.', 
          difficulty: 'Moderate', 
          recommendedPower: 180, 
          rewards: { credits: 6500, intel: 65, tech: 10 }, 
          durationSeconds: 25, 
          requiresMinigame: false 
        },
        { 
          id: 'm_ext_' + Math.random().toString(36).substring(2, 7), 
          title: 'Quantum Core Infiltration', 
          client: 'Neo-Shanghai Syndicate Broker', 
          targetNation: 'Neo-Shanghai Conglomerate', 
          description: 'Deploy cyber-warfare specialists to breach the core server room and extract proprietary weights.', 
          difficulty: 'Extreme', 
          recommendedPower: 520, 
          rewards: { credits: extremeCredits, intel: extremeIntel, tech: 30 }, 
          durationSeconds: 40, 
          requiresMinigame: true,
          minigamesCount: 1,
          minigameTypes: ['cyber_decryption']
        },
        { 
          id: 'm_sui_' + Math.random().toString(36).substring(2, 7), 
          title: 'Orbital Convoy Interdiction', 
          client: 'The Iron Directorate', 
          targetNation: 'Aethelgard Republic', 
          description: 'Multi-stage deep strike through subterranean minefields and heavy orbital armor convoys.', 
          difficulty: 'Suicide Mission', 
          recommendedPower: 1100, 
          rewards: { credits: suicideCredits, intel: suicideIntel, tech: 60 }, 
          durationSeconds: 60, 
          requiresMinigame: true,
          minigamesCount: 2,
          minigameTypes: ['minefield', 'power_clash']
        },
      ];

      // Rebirth 2+ unlocks Warzone Class Missions
      if (rebirths >= 2) {
        const warzoneCredits = Math.floor(Math.random() * (400000 - 200000 + 1)) + 200000;
        const warzoneIntel = Math.floor(Math.random() * (650 - 370 + 1)) + 370;

        newMissions.push({
          id: 'm_wz_' + Math.random().toString(36).substring(2, 7),
          title: 'Theater Decapitation // Warzone Siege',
          client: 'Apex Central Intelligence',
          targetNation: 'Global Contested Warzone',
          description: 'Catastrophic high-intensity warzone strike. Evade concentrated plasma barrage and crush hostile command armor in kinetic clash.',
          difficulty: 'Warzone',
          recommendedPower: 2600,
          rewards: { credits: warzoneCredits, intel: warzoneIntel, tech: 120 },
          durationSeconds: 85,
          requiresMinigame: true,
          minigamesCount: 2,
          minigameTypes: ['bullet_hell', 'power_clash']
        });
      }

      setMissions(newMissions);
      setGeneratingMission(false);
    }, 800);
  };

  const handleDeployMission = (mission: Mission, deployment: {class: string, count: number}[]) => {
    setTroops(prev => prev.map(t => {
      const dep = deployment.find(d => d.class === t.class);
      if (dep) return { ...t, count: Math.max(0, t.count - dep.count) };
      return t;
    }));
    setMissions(missions.filter((m) => m.id !== mission.id));

    // Dynamic Infiltration Speed based on team power
    const teamPower = calculateTeamPower(troops, weapons, achievementPowerMultiplier, deployment);
    const expeditedDuration = calculateInfiltrationDuration(mission.durationSeconds, teamPower, mission.recommendedPower);

    setActiveMissions([
      ...activeMissions, 
      { 
        missionId: mission.id, 
        mission, 
        assignedTroops: deployment as any, 
        startTime: Date.now(), 
        durationSeconds: expeditedDuration, 
        successProbability: 80 
      }
    ]);
    notifyAssistant({
      type: 'info',
      tag: 'DEPLOYMENT',
      title: `${mission.title.toUpperCase()}`,
      message: `Squad deployed against ${mission.targetNation}. Infiltration window: ${expeditedDuration}s (accelerated by ${teamPower} squad combat power).`,
      action: { label: 'TRACK OPS', tab: 'missions' }
    });
  };

  const handleDeployWarzoneOperation = (
    war: WarEvent,
    supportedSide: 'A' | 'B',
    deployment: { class: MercenaryClass; count: number }[],
    expeditedDuration: number
  ) => {
    // 1. Deduct troops
    setTroops(prev => prev.map(t => {
      const dep = deployment.find(d => d.class === t.class);
      if (dep) return { ...t, count: Math.max(0, t.count - dep.count) };
      return t;
    }));

    // 2. Set playerSide in warEvents
    setWarEvents(prev => prev.map(w => w.id === war.id ? { ...w, playerSide: supportedSide } : w));

    const supportedFaction = supportedSide === 'A' ? war.factionA : war.factionB;
    const enemyFaction = supportedSide === 'A' ? war.factionB : war.factionA;

    // 3. Create Warzone mission with expedited duration
    const warzoneMission: Mission = {
      id: 'm_wz_op_' + Date.now(),
      title: `Warzone Strike // Allied Offensive for ${supportedFaction}`,
      client: supportedFaction,
      targetNation: enemyFaction,
      description: `Allied warzone-level offensive into contested territory to crush ${enemyFaction} armor battalions and shatter their theater line.`,
      difficulty: 'Warzone',
      recommendedPower: war.requiredPower || 2400,
      rewards: {
        credits: war.rewardCredits || 280000,
        intel: war.rewardIntel || 450,
        tech: 120
      },
      durationSeconds: expeditedDuration,
      requiresMinigame: true,
      minigamesCount: 2,
      minigameTypes: ['bullet_hell', 'power_clash'],
      warId: war.id,
      supportedSide,
      supportedFaction,
      enemyFaction
    };

    setActiveMissions(prev => [
      ...prev,
      {
        missionId: warzoneMission.id,
        mission: warzoneMission,
        assignedTroops: deployment as any,
        startTime: Date.now(),
        durationSeconds: expeditedDuration,
        successProbability: 85
      }
    ]);

    notifyAssistant({
      type: 'warning',
      tag: 'WARZONE INTERVENTION',
      title: `ALLIED WITH ${supportedFaction.toUpperCase()}`,
      message: `Warzone strike force launched into active theater against ${enemyFaction}. High-speed infiltration duration: ${expeditedDuration}s.`,
      action: { label: 'STRATEGIC MAP', tab: 'map' }
    });
  };

  const handleResolveMission = (missionId: string) => {
    const active = activeMissions.find((a) => a.missionId === missionId);
    if (!active) return;
    setSimulatingMission(active);
  };

  // Complete Simulation: Updates Completed Count, Recharges HQ Nodes, decrements Event Freeze, and triggers Raids every 3 missions
  const handleCompleteSimulation = (success: boolean) => {
    if (!simulatingMission) return;
    const active = simulatingMission;
    setSimulatingMission(null);

    const hasJuggernaut = active.assignedTroops.some(d => d.class === 'Juggernaut' && d.count > 0);
    const hasMedic = active.assignedTroops.some(d => d.class === 'Medic' && d.count > 0);
    const hasHacker = active.assignedTroops.some(d => d.class === 'Hacker' && d.count > 0);

    // Return troops with class passive mechanics
    setTroops(prev => prev.map(t => {
      const dep = active.assignedTroops.find(d => d.class === t.class);
      if (dep) {
        let survived = success ? dep.count : Math.floor(dep.count * 0.5);
        let lost = dep.count - survived;
        
        // Juggernaut passive: -50% casualties
        if (hasJuggernaut && lost > 0) {
          const savedByJugg = Math.floor(lost * 0.5);
          survived += savedByJugg;
          lost -= savedByJugg;
        }
        
        // Medic passive: 20% flat chance to revive any fallen
        if (hasMedic && lost > 0) {
          const revived = Array.from({length: lost}).filter(() => Math.random() < 0.2).length;
          survived += revived;
        }

        return { ...t, count: t.count + survived };
      }
      return t;
    }));

    setActiveMissions(activeMissions.filter((a) => a.missionId !== active.missionId));

    // 1. Advance mission counter
    const nextCompletedCount = completedMissionsCount + 1;
    setCompletedMissionsCount(nextCompletedCount);

    // 2. Reduce HQ Infrastructure cooldowns by 1 mission
    setHqUpgrades(prev => prev.map(u => ({
      ...u,
      cooldownMissionsRemaining: Math.max(0, (u.cooldownMissionsRemaining || 0) - 1)
    })));

    // 3. Decrement Event Freeze if active
    if (eventFreezeMissionsRemaining > 0) {
      setEventFreezeMissionsRemaining(prev => Math.max(0, prev - 1));
    }

    // 4. Calculate Rewards & World Event Multipliers
    if (success) {
      const hackerBonus = hasHacker ? 1.25 : 1;
      const eventCreditMult = activeWorldEvent ? activeWorldEvent.creditMultiplier : 1.0;
      const eventIntelMult = activeWorldEvent ? activeWorldEvent.intelMultiplier : 1.0;
      
      const earnedCredits = Math.round(active.mission.rewards.credits * (1 + rebirths * 0.5) * eventCreditMult);
      const earnedIntel = Math.round(active.mission.rewards.intel * (1 + rebirths * 0.5) * hackerBonus * eventIntelMult);
      
      setCredits(c => c + earnedCredits);
      setIntel(i => i + earnedIntel);

      setPlayerStats(prev => ({
        ...prev,
        totalMissionsCompleted: prev.totalMissionsCompleted + 1,
        totalCreditsEarned: prev.totalCreditsEarned + earnedCredits,
        totalIntelEarned: prev.totalIntelEarned + earnedIntel,
        maxCreditsHeld: Math.max(prev.maxCreditsHeld, credits + earnedCredits)
      }));

      notifyAssistant({
        type: 'success',
        tag: 'MISSION CLEARED',
        title: `${active.mission.title.toUpperCase()}`,
        message: `Contract fulfilled with surgical precision! Extracted $${earnedCredits.toLocaleString()} Credits and ${earnedIntel} TB Intel. Squad safely exfiltrated.`,
        action: { label: 'CHECK BARRACKS', tab: 'roster' }
      });

      if (playerStats.totalMissionsCompleted + 1 === 2) {
        setTimeout(() => {
          notifyAssistant({
            type: 'info',
            tag: 'CLEARANCE UNLOCKED',
            title: 'BROKER REFRESH UPLINK ONLINE',
            message: 'You have beaten 2 missions! Underground contract broker refresh signals are now fully unlocked.',
            action: { label: 'VIEW CONTRACTS', tab: 'missions' }
          });
        }, 900);
      }

      const eventNote = activeWorldEvent 
        ? ` [Active Crisis '${activeWorldEvent.title}': x${eventCreditMult.toFixed(2)} Credits, x${eventIntelMult.toFixed(2)} Intel]` 
        : '';

      // If this was a warzone mission supporting a side:
      let warNote = '';
      if (active.mission.warId) {
        setWarEvents(prev => prev.map(w => w.id === active.mission.warId ? { ...w, status: 'Resolved' } : w));
        setTension(t => Math.max(0, t - 15));
        warNote = ` [ALLIED WARZONE VICTORY: Shattered hostile defense line for ${active.mission.supportedFaction || 'allied forces'}! Active conflict resolved and Syndicate heat lowered by 15%!]`;
      }

      setDebriefResult({ 
        title: active.mission.title, 
        success: true, 
        summary: `Contract fulfilled with surgical precision. Target assets retrieved and liquidated.${warNote}${eventNote}`, 
        rewards: { credits: earnedCredits, intel: earnedIntel, tech: active.mission.rewards.tech } 
      });
    } else {
      notifyAssistant({
        type: 'warning',
        tag: 'MISSION COMPROMISED',
        title: `${active.mission.title.toUpperCase()} // FAILED`,
        message: 'Hostile electronic countermeasures forced tactical extraction. Inspect barracks for casualties.',
        action: { label: 'VIEW BARRACKS', tab: 'roster' }
      });

      setDebriefResult({ 
        title: active.mission.title, 
        success: false, 
        summary: "Mission Compromised. Heavy enemy countermeasures forced tactical extraction.", 
        rewards: { credits: 0, intel: 0, tech: 0 } 
      });
    }

    // 5. BASE RAID TRIGGER: STRICTLY ONCE EVERY 3 MISSIONS COMPLETED
    if (nextCompletedCount % 3 === 0) {
      const hostileNation = rivalNations.reduce((prev, curr) => curr.tension > prev.tension ? curr : prev, rivalNations[0]);
      const attacker = hostileNation ? hostileNation.name : "Elite Black-Ops Strike Division";
      const level = tension > 75 ? 'Critical' : tension > 45 ? 'Severe' : 'Minor';
      const reqPower = Math.round(tension * 4.5 + Math.floor(Math.random() * 150) + 120);

      setTimeout(() => {
        const raidItem: HQRaid = {
          id: 'raid_' + Date.now(),
          attacker,
          threatLevel: level as any,
          requiredPower: reqPower,
          timeRemainingSeconds: 50,
          penaltyCredits: Math.min(credits, reqPower * 12),
          penaltyIntel: Math.min(intel, reqPower)
        };
        setActiveRaid(raidItem);
        notifyAssistant({
          type: 'alert',
          tag: 'RED ALERT',
          title: 'HQ RAID IMMINENT',
          message: `CRITICAL BREACH: ${attacker} strike team closing on Apex HQ! Est. power: ${reqPower} PWR. Deploy garrison immediately!`,
          action: { label: 'DEFEND BASE NOW', tab: 'dashboard' }
        });
      }, 1200);
    }
  };

  // Base Raid Defense
  const handleDefendRaid = (deployment: {class: MercenaryClass, count: number}[]) => {
    if (!activeRaid) return;
    
    let totalDefensePower = 0;
    deployment.forEach(d => {
      const troopType = troops.find(t => t.class === d.class);
      if (troopType) {
        const weaponItem = troopType.equippedWeaponId 
          ? weapons.find(w => w.weapon.id === troopType.equippedWeaponId)
          : null;
        const weaponMult = weaponItem ? weaponItem.weapon.powerMultiplier : 1;
        const singlePwr = Math.round((troopType.basePower + (troopType.level * 2)) * weaponMult * achievementPowerMultiplier);
        totalDefensePower += singlePwr * d.count;
      }
    });

    if (totalDefensePower >= activeRaid.requiredPower) {
      // Successfully defended
      const reward = Math.round(activeRaid.penaltyCredits * 0.4);
      setCredits(prev => prev + reward);
      setMorale(prev => Math.min(100, prev + 8));
      setPlayerStats(prev => ({
        ...prev,
        totalRaidsDefended: prev.totalRaidsDefended + 1,
        totalCreditsEarned: prev.totalCreditsEarned + reward,
        maxCreditsHeld: Math.max(prev.maxCreditsHeld, credits + reward)
      }));
      notifyAssistant({
        type: 'success',
        tag: 'DEFENSE HELD',
        title: 'HQ RAID REPELLED',
        message: `Garrison defenses held against ${activeRaid.attacker}! Base perimeter intact. Salvaged +$${reward.toLocaleString()} bounty.`,
        action: { label: 'CHECK BARRACKS', tab: 'roster' }
      });
      setDebriefResult({
        title: "HQ RAID REPELLED",
        success: true,
        summary: `Garrison defenses held against ${activeRaid.attacker}. Base perimeter secure. Awarded +$${reward.toLocaleString()} bounty salvage!`,
        rewards: { credits: reward, intel: 25, tech: 5 }
      });
    } else {
      // Failed to defend
      setCredits(prev => Math.max(0, prev - activeRaid.penaltyCredits));
      setIntel(prev => Math.max(0, prev - activeRaid.penaltyIntel));
      setMorale(prev => Math.max(0, prev - 15));
      notifyAssistant({
        type: 'alert',
        tag: 'DEFENSE BREACH',
        title: 'PERIMETER PENETRATED',
        message: `Hostile strike team bypassed outer walls! Vault lost $${activeRaid.penaltyCredits.toLocaleString()} Credits and ${activeRaid.penaltyIntel} TB Intel.`,
        action: { label: 'STATUS REPORT', tab: 'dashboard' }
      });
      setDebriefResult({
        title: "HQ DEFENSE BREACHED",
        success: false,
        summary: `Enemy breach team bypassed outer fortifications. Lost $${activeRaid.penaltyCredits.toLocaleString()} Credits and ${activeRaid.penaltyIntel} TB Intel.`,
        rewards: { credits: 0, intel: 0, tech: 0 }
      });
    }
    setActiveRaid(null);
  };

  // Raid Countdown Timer
  useEffect(() => {
    if (!activeRaid) return;

    if (activeRaid.timeRemainingSeconds <= 0) {
      // Breached on timeout
      const penaltyCredits = activeRaid.penaltyCredits;
      const penaltyIntel = activeRaid.penaltyIntel;
      setCredits(c => Math.max(0, c - penaltyCredits));
      setIntel(i => Math.max(0, i - penaltyIntel));
      setMorale(m => Math.max(0, m - 12));
      notifyAssistant({
        type: 'alert',
        tag: 'DEFENSE TIMEOUT',
        title: 'HQ PERIMETER OVERRUN',
        message: `Defense countdown elapsed without garrison deployment! Raiders breached the compound and stole $${penaltyCredits.toLocaleString()} Credits.`,
        action: { label: 'STATUS REPORT', tab: 'dashboard' }
      });
      setActiveRaid(null);
      return;
    }

    const interval = setInterval(() => {
      setActiveRaid(prev => {
        if (!prev) return null;
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRaid]);

  const handleRebirth = () => {
    setRebirths(rebirths + 1);
    setCredits(6500);
    setIntel(200);
    setTechLevel(1);
    setCompletedMissionsCount(0);
    setEventFreezeMissionsRemaining(0);
    setWeapons([]);
    setMissions([]);
    setActiveMissions([]);
    setTroops(INITIAL_TROOPS);
    setHqUpgrades(INITIAL_HQ_UPGRADES);
    setRivalNations(INITIAL_RIVAL_NATIONS);
    setSaveToast(`SYSTEM REBOOTED // REBIRTH LVL ${rebirths + 1} MULTIPLIERS ACTIVE`);
    setTimeout(() => setSaveToast(null), 3500);
    notifyAssistant({
      type: 'intel',
      tag: 'SYSTEM REBOOT',
      title: `REBIRTH LEVEL ${rebirths + 1} ONLINE`,
      message: `Prestige protocol complete. Global resource yields, contract tiers, and combat ratings elevated!`,
      action: { label: 'COMMAND DECK', tab: 'dashboard' }
    });
  };

  const handleHireTroop = (troopClass: string, amount: number) => {
    let cost = 1000;
    switch (troopClass) {
      case 'Assault': cost = 1500; break;
      case 'Sniper': cost = 2500; break;
      case 'Juggernaut': cost = 5000; break;
      case 'Hacker': cost = 3500; break;
      case 'Medic': cost = 2000; break;
    }
    const totalCost = cost * amount;
    if (credits >= totalCost) {
      setCredits(c => c - totalCost);
      setTroops(troops.map(t => t.class === troopClass ? { ...t, count: t.count + amount } : t));
      notifyAssistant({
        type: 'info',
        tag: 'RECRUITS ENLISTED',
        title: `${troopClass.toUpperCase()} MERCENARIES ENLISTED`,
        message: `Enlisted ${amount} new ${troopClass} mercenaries for $${totalCost.toLocaleString()}. Barracks strength augmented.`,
        action: { label: 'VIEW BARRACKS', tab: 'roster' }
      });
    }
  };

  const handleOpenCrate = (tier: number) => {
    let cost = 15000;
    let weaponTier: 'Standard' | 'Advanced' | 'Prototype' = 'Standard';
    if (tier === 2) { cost = 60000; weaponTier = 'Advanced'; }
    if (tier === 3) { cost = 300000; weaponTier = 'Prototype'; }
    
    if (credits >= cost) {
      setCredits(credits - cost);
      
      const rand = Math.random();
      let rarity: string = 'Common';
      let powerMultiplier = 1.1;

      if (Math.random() < 0.001) {
        rarity = 'Boundless';
        powerMultiplier = 10.0;
      } else {
        if (tier === 1) {
          if (rand < 0.5) { rarity = 'Common'; powerMultiplier = 1.1; }
          else if (rand < 0.8) { rarity = 'Rare'; powerMultiplier = 1.3; }
          else if (rand < 0.95) { rarity = 'Epic'; powerMultiplier = 1.6; }
          else { rarity = 'Legendary'; powerMultiplier = 2.0; }
        } else if (tier === 2) {
          if (rand < 0.6) { rarity = 'Epic'; powerMultiplier = 1.6; }
          else if (rand < 0.9) { rarity = 'Legendary'; powerMultiplier = 2.0; }
          else { rarity = 'Mythical'; powerMultiplier = 2.6; }
        } else if (tier === 3) {
          if (rand < 0.6) { rarity = 'Legendary'; powerMultiplier = 2.0; }
          else if (rand < 0.85) { rarity = 'Mythical'; powerMultiplier = 2.6; }
          else if (rand < 0.98) { rarity = 'Exotic'; powerMultiplier = 3.5; }
          else { rarity = 'Divine'; powerMultiplier = 5.0; }
        }
      }

      const weaponNamesByRarity: Record<string, string[]> = {
        'Common': ['AK-47 Tactical', 'M16A4 Carbine', 'Glock 19 Gen5', 'MP5-SD', 'Mossberg 500 Breacher'],
        'Rare': ['Vector CRB .45', 'SPAS-12 Urban', 'Desert Eagle .50', 'P90 Stealth', 'M4A1 SOPMOD'],
        'Epic': ['SCAR-H Heavy', 'Kriss Super V', 'Barrett M82 Anti-Materiel', 'AA-12 Auto', 'HK416 Spec-Ops'],
        'Legendary': ['Railgun Prototype Alpha', 'Plasma Rifle MK-IV', 'Gauss Cannon', 'Laser Gatling Pod', 'EMP Disruptor'],
        'Mythical': ['Dark Matter Singularity Blaster', 'Neutron Beam Repeater', 'Void Piercer Lance'],
        'Exotic': ['Quantum Destabilizer', 'Nanite Swarm Hive Cannon', 'Tachyon Hyper-Lance'],
        'Divine': ['Wrath of the Archons', 'Aegis Obliterator', 'Starfall Orbital Relic'],
        'Boundless': ['The Reality Fracture', 'Omega Singularity Protocol', 'Genesis Quantum Engine']
      };

      const pool = weaponNamesByRarity[rarity] || weaponNamesByRarity['Common'];
      const generatedName = pool[Math.floor(Math.random() * pool.length)];

      const weaponId = 'wpn_' + Math.random().toString(36).substring(2, 9);
      const newWeapon = {
        id: weaponId,
        name: generatedName,
        tier: weaponTier,
        rarity: rarity as any,
        powerMultiplier
      };
      
      setWeapons([...weapons, { weapon: newWeapon, count: 1 }]);
      setPlayerStats(prev => ({
        ...prev,
        totalCratesOpened: prev.totalCratesOpened + 1
      }));
      notifyAssistant({
        type: (rarity === 'Boundless' || rarity === 'Divine' || rarity === 'Exotic') ? 'success' : 'info',
        tag: 'ARMORY DECRYPTED',
        title: `${rarity.toUpperCase()} WEAPON DECRYPTED`,
        message: `Acquired ${newWeapon.name} (x${powerMultiplier} Squad Power Multiplier)! Equip to your soldiers in the Armory.`,
        action: { label: 'OPEN ARMORY', tab: 'armory' }
      });
      setDebriefResult({ 
        title: "CRATE DECRYPTED", 
        success: true, 
        summary: `Acquired ${rarity.toUpperCase()} gear: ${newWeapon.name} (x${powerMultiplier} Squad Power Multiplier)`, 
        rewards: { credits: 0, intel: 0, tech: 0 } 
      });
    }
  };

  const handleEquipWeapon = (weaponId: string, troopClass: string) => {
    setTroops(troops.map(t => t.class === troopClass ? { ...t, equippedWeaponId: weaponId } : t));
    const weapon = weapons.find(w => w.weapon.id === weaponId)?.weapon;
    notifyAssistant({
      type: 'info',
      tag: 'LOADOUT SYNCHRONIZED',
      title: 'WEAPON ASSIGNED',
      message: `Assigned ${weapon ? weapon.name : 'weapon'} to ${troopClass} division. Combat ratings recalibrated.`,
      action: { label: 'VIEW BARRACKS', tab: 'roster' }
    });
  };

  const handleCheatAddWeapon = () => {
    const weaponId = 'wpn_cheat_' + Math.random().toString(36).substring(2, 9);
    const newWeapon = {
      id: weaponId,
      name: `Boundless Reality Fracture`,
      tier: 'Prototype' as const,
      rarity: 'Boundless' as const,
      powerMultiplier: 10.0
    };
    setWeapons([...weapons, { weapon: newWeapon, count: 1 }]);
    setDebriefResult({ 
      title: "PROTOTYPE ACQUIRED", 
      success: true, 
      summary: "Boundless tier quantum weaponry injected into armory inventory.", 
      rewards: { credits: 0, intel: 0, tech: 0 } 
    });
  };

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono crt-overlay select-none pb-12">
      {/* Toast Banner */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 bg-black/95 border-2 border-emerald-400 p-3.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-3 text-xs animate-bounce font-mono">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-300 font-bold">{saveToast}</span>
        </div>
      )}

      {/* Main Global Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        credits={credits} 
        intel={intel} 
        techLevel={techLevel} 
        morale={morale} 
        tension={tension} 
        activeWorldEvent={activeWorldEvent}
        freezeMissionsRemaining={eventFreezeMissionsRemaining}
        achievementPowerBuffPercent={achievementPowerBuffPercent}
        onOpenGuide={() => setIsGuideOpen(true)} 
        onSaveGame={handleSaveGame} 
      />

      {/* Tab Router Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            troops={troops} 
            rebirths={rebirths} 
            onRebirth={handleRebirth} 
            missions={missions} 
            activeMissions={activeMissions} 
            credits={credits} 
            intel={intel} 
            tension={tension} 
            activeWorldEvent={activeWorldEvent}
            achievementPowerBuffPercent={achievementPowerBuffPercent}
            unlockedAchievementsCount={achievementsList.filter(a => a.unlocked).length}
            totalAchievementsCount={achievementsList.length}
            setActiveTab={setActiveTab} 
            onRefreshMissions={() => handleGenerateNewMission(false)} 
          />
        )}
        {activeTab === 'roster' && (
          <Roster 
            troops={troops} 
            weapons={weapons} 
            credits={credits} 
            achievementPowerMultiplier={achievementPowerMultiplier}
            achievementBuffPercent={achievementPowerBuffPercent}
            onHireTroop={handleHireTroop} 
            onUpgradeGear={() => {}} 
            onDischargeTroops={() => {}} 
          />
        )}
        {activeTab === 'missions' && (
          <Missions 
            missions={missions} 
            troops={troops} 
            weapons={weapons}
            rebirths={rebirths}
            activeMissions={activeMissions} 
            activeWorldEvent={activeWorldEvent}
            achievementPowerMultiplier={achievementPowerMultiplier}
            achievementBuffPercent={achievementPowerBuffPercent}
            completedMissionsCount={Math.max(playerStats.totalMissionsCompleted, completedMissionsCount)}
            onDeployMission={handleDeployMission} 
            onResolveMission={handleResolveMission} 
            onGenerateNewMission={() => handleGenerateNewMission(false)} 
            generatingMission={generatingMission} 
          />
        )}
        {activeTab === 'achievements' && (
          <Achievements 
            achievements={achievementsList}
            totalPowerBuffPercent={achievementPowerBuffPercent}
            stats={playerStats}
          />
        )}
        {activeTab === 'events' && (
          <WorldEventsView 
            activeEvent={activeWorldEvent} 
            eventHistory={eventHistory} 
            tension={tension} 
            intel={intel} 
            credits={credits} 
            freezeMissionsRemaining={eventFreezeMissionsRemaining}
            onTriggerEvent={handleTriggerWorldEvent} 
            onClearEvent={handleClearWorldEvent} 
            onDisinformationCampaign={handleDisinformationCampaign} 
            onFreezeEvent={handleFreezeWorldEvent}
          />
        )}
        {activeTab === 'armory' && (
          <Armory 
            rebirths={rebirths} 
            weapons={weapons} 
            troops={troops} 
            credits={credits} 
            onOpenCrate={handleOpenCrate} 
            onEquipWeapon={handleEquipWeapon} 
          />
        )}
        {activeTab === 'geopolitics' && (
          <Geopolitics 
            rivalNations={rivalNations} 
            intel={intel} 
            syndicateTension={tension}
            warEvents={warEvents} 
            onInciteWar={handleInciteWar} 
            onSelectWarzone={(war) => setSelectedWarzoneInApp(war)}
          />
        )}
        {activeTab === 'map' && (
          <StrategicMap 
            rivalNations={rivalNations} 
            activeMissions={activeMissions} 
            warEvents={warEvents}
            tension={tension}
            troops={troops}
            weapons={weapons}
            achievementPowerMultiplier={achievementPowerMultiplier}
            rebirths={rebirths}
            onDeployWarzoneOperation={handleDeployWarzoneOperation}
            onResolveMission={handleResolveMission}
          />
        )}
        {activeTab === 'headquarters' && (
          <Headquarters 
            upgrades={hqUpgrades} 
            credits={credits} 
            intel={intel} 
            rebirths={rebirths} 
            onPurchaseUpgrade={handlePurchaseHQUpgrade} 
            onHarvestUpgrade={handleHarvestHQUpgrade}
            onHarvestAllReady={handleHarvestAllReadyHQUpgrades}
          />
        )}
      </main>
      
      {/* Developer / Simulation Control Board */}
      <CheatBoard 
        onAddCredits={(amount) => setCredits(c => c + amount)}
        onAddIntel={(amount) => setIntel(i => i + amount)}
        onForceReboot={handleRebirth}
        onAddTestWeapon={handleCheatAddWeapon}
        onTriggerWorldEvent={handleTriggerWorldEvent}
        onClearWorldEvent={handleClearWorldEvent}
      />

      {/* Interactive Guide / Docs Modal */}
      <InteractiveGuide 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />

      {/* Base Defense Raid Modal */}
      {activeRaid && (
        <HQRaidModal 
          raid={activeRaid}
          troops={troops}
          achievementPowerMultiplier={achievementPowerMultiplier}
          achievementBuffPercent={achievementPowerBuffPercent}
          onDefend={handleDefendRaid}
        />
      )}

      {/* Global Warzone Support Modal (triggered from Geopolitics or Quick Alerts) */}
      {selectedWarzoneInApp && (
        <WarzoneSupportModal 
          war={selectedWarzoneInApp}
          troops={troops}
          weapons={weapons}
          rivalNations={rivalNations}
          achievementPowerMultiplier={achievementPowerMultiplier}
          rebirths={rebirths}
          onDeployWarzoneOperation={handleDeployWarzoneOperation}
          onClose={() => setSelectedWarzoneInApp(null)}
        />
      )}

      {/* Battle Simulation Modal */}
      {simulatingMission && (
        <BattleSimulationModal 
          activeMission={simulatingMission} 
          troops={troops} 
          weapons={weapons} 
          achievementPowerMultiplier={achievementPowerMultiplier}
          achievementBuffPercent={achievementPowerBuffPercent}
          onComplete={handleCompleteSimulation} 
          onClose={() => setSimulatingMission(null)} 
        />
      )}
      
      {/* Debrief & Notification Modal */}
      {debriefResult && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border-2 border-emerald-500 max-w-lg w-full p-6 shadow-[0_0_25px_rgba(16,185,129,0.3)] crt-overlay font-mono">
            <h3 className="text-lg font-bold tracking-widest text-emerald-400 mb-3 border-b border-emerald-500/50 pb-2">
              {'>>'} {debriefResult.title.toUpperCase()}
            </h3>
            <p className="text-emerald-400/90 text-xs leading-relaxed mb-6">
              {debriefResult.summary}
            </p>
            <button 
              onClick={() => setDebriefResult(null)} 
              className="w-full py-3 bg-emerald-500 text-black font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors text-xs"
            >
              [ ACKNOWLEDGE PROTOCOL ]
            </button>
          </div>
        </div>
      )}

      {/* Tactical Assistant (A.R.E.S. - Anchored on Left Side of Terminal) */}
      <TacticalAssistant 
        currentMessage={assistantMessage}
        messageHistory={assistantHistory}
        onDismiss={() => setAssistantMessage(null)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onRequestBriefing={handleRequestBriefing}
      />
    </div>
  );
}
