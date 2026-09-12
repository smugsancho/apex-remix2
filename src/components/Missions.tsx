import React, { useState, useEffect } from 'react';
import { PlayerTroop, Mission, ActiveMission, MercenaryClass, WorldEvent, WeaponItem } from '../types';
import { Play, CheckCircle2, Crosshair, TerminalSquare, Coins, Zap, Shield, AlertTriangle, Flame, ShieldAlert, Sparkles, Clock, Lock, RefreshCw } from 'lucide-react';
import { calculateInfiltrationSpeed, calculateInfiltrationDuration } from '../utils/infiltration';

const TACTICAL_MAP = [
  "........................................",
  "...▄██▄...............▄▄▄▄▄▄▄...........",
  "..██████▄...▄.......▄██████████▄........",
  "..████████.........██████████████.......",
  "...███████.........███████████████......",
  ".....████▀.........██████████████▀......",
  "......███..........███████████▀▀........",
  "......███..........████████▀............",
  ".......██...........██████▀......▄██▄...",
  ".......▀█............███▀.......██████..",
  "......................▀..........▀██▀...",
  "........................................",
];

const TARGET_COORDS: Record<string, {x: number, y: number}> = {
  'Neo-Shanghai': {x: 30, y: 5},
  'Vorex': {x: 28, y: 2},
  'Aethelgard': {x: 20, y: 3},
  'Iron Directorate': {x: 25, y: 3},
  'Global Contested Warzone': {x: 22, y: 4}
};

const TacticalMap = ({ target }: { target: string }) => {
  const defaultX = 5 + (target.length * 3) % 30;
  const defaultY = 2 + (target.length * 2) % 8;
  const coord = TARGET_COORDS[target] || { x: defaultX, y: defaultY };

  return (
    <div className="bg-black/50 border border-emerald-500/30 p-2 font-mono text-[8px] leading-[8px] select-none overflow-hidden relative mb-4">
      <div className="absolute top-1 left-2 text-emerald-500/50 text-[10px] tracking-widest uppercase z-20">SAT_UPLINK // {target}</div>
      <div className="text-emerald-500/30 whitespace-pre pt-4 pb-2 flex flex-col items-center">
        {TACTICAL_MAP.map((row, y) => {
          let rowContent = [];
          for (let x = 0; x < row.length; x++) {
            const isTarget = x === coord.x && y === coord.y;
            if (isTarget) {
              rowContent.push(<span key={x} className="text-red-500 font-bold animate-pulse text-[12px] leading-[8px] relative z-10 glow-text">{'X'}</span>);
            } else {
              rowContent.push(<span key={x}>{row[x]}</span>);
            }
          }
          return <div key={y} className="flex h-[8px]">{rowContent}</div>;
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-50 animate-pulse pointer-events-none" />
    </div>
  );
};

interface MissionsProps {
  missions: Mission[];
  troops: PlayerTroop[];
  weapons?: WeaponItem[];
  activeMissions: ActiveMission[];
  activeWorldEvent?: WorldEvent | null;
  rebirths?: number;
  achievementPowerMultiplier?: number;
  achievementBuffPercent?: number;
  completedMissionsCount?: number;
  onDeployMission: (m: Mission, d: {class: string, count: number}[]) => void;
  onResolveMission: (id: string) => void;
  onGenerateNewMission: () => void;
  generatingMission: boolean;
}

export const Missions: React.FC<MissionsProps> = ({ 
  missions, 
  troops, 
  weapons = [],
  activeMissions, 
  activeWorldEvent, 
  rebirths = 0,
  achievementPowerMultiplier = 1,
  achievementBuffPercent = 0,
  completedMissionsCount = 0,
  onDeployMission, 
  onResolveMission, 
  onGenerateNewMission, 
  generatingMission 
}) => {
  // Mission allocations per mission ID: { [missionId]: { [class]: count } }
  const [allocations, setAllocations] = useState<{ [missionId: string]: { [troopClass: string]: number } }>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to calculate individual unit power with weapon multiplier and permanent achievement buffs
  const getSingleUnitPower = (troop: PlayerTroop) => {
    const base = troop.basePower + (troop.level * 2);
    let mult = 1;
    if (troop.equippedWeaponId) {
      const weaponItem = weapons.find(w => w.weapon.id === troop.equippedWeaponId);
      if (weaponItem) mult = weaponItem.weapon.powerMultiplier;
    }
    return Math.round(base * mult * achievementPowerMultiplier);
  };

  // Helper to get total allocated power for a specific mission
  const getMissionAllocatedPower = (missionId: string) => {
    const missionAlloc = allocations[missionId] || {};
    let totalPwr = 0;

    troops.forEach(t => {
      const count = missionAlloc[t.class] || 0;
      if (count > 0) {
        totalPwr += count * getSingleUnitPower(t);
      }
    });

    return totalPwr;
  };

  // Helper to get total count of deployed units for a mission
  const getMissionAllocatedCount = (missionId: string) => {
    const missionAlloc = allocations[missionId] || {};
    return Object.values(missionAlloc).reduce((sum: number, count: number) => sum + (count || 0), 0);
  };

  const handleSetTroopCount = (missionId: string, troopClass: string, count: number, max: number) => {
    const safeCount = Math.max(0, Math.min(max, count));
    setAllocations(prev => ({
      ...prev,
      [missionId]: {
        ...(prev[missionId] || {}),
        [troopClass]: safeCount
      }
    }));
  };

  const handleDeployAllForMission = (missionId: string) => {
    const fullAlloc: { [key: string]: number } = {};
    troops.forEach(t => {
      fullAlloc[t.class] = t.count;
    });
    setAllocations(prev => ({ ...prev, [missionId]: fullAlloc }));
  };

  const handleClearAllocation = (missionId: string) => {
    setAllocations(prev => ({ ...prev, [missionId]: {} }));
  };

  const handleDeploy = (mission: Mission) => {
    const missionAlloc = allocations[mission.id] || {};
    const deploymentList = Object.entries(missionAlloc)
      .filter(([_, count]) => (count as number) > 0)
      .map(([c, count]) => ({ class: c as MercenaryClass, count: count as number }));

    if (deploymentList.length > 0) {
      onDeployMission(mission, deploymentList);
      setAllocations(prev => {
        const next = { ...prev };
        delete next[mission.id];
        return next;
      });
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      case 'Moderate': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case 'Extreme': return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
      case 'Suicide Mission': return 'text-red-400 border-red-500/50 bg-red-500/10 font-bold';
      case 'Warzone': return 'text-purple-400 border-purple-500/60 bg-purple-950/40 font-bold glow-text';
      case 'Nightmare': return 'text-pink-400 border-pink-500/50 bg-pink-500/10 font-bold';
      default: return 'text-emerald-500 border-emerald-500/30';
    }
  };

  const creditMult = activeWorldEvent ? activeWorldEvent.creditMultiplier : 1.0;
  const intelMult = activeWorldEvent ? activeWorldEvent.intelMultiplier : 1.0;
  const isRefreshUnlocked = completedMissionsCount >= 2;
  const missionsRemainingToUnlock = Math.max(0, 2 - completedMissionsCount);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-500/30 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-emerald-400" />
            {'>>'} ACTIVE_CONTRACT_BROKERAGE
          </h2>
          <p className="text-xs text-emerald-500/70 font-mono mt-0.5">
            REBIRTH TIER {rebirths} {rebirths >= 2 ? '// WARZONE THEATER ACCESS UNLOCKED' : '// REACH REBIRTH 2 FOR WARZONE OPERATIONS'}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
          <button 
            onClick={onGenerateNewMission} 
            disabled={!isRefreshUnlocked || generatingMission} 
            title={!isRefreshUnlocked 
              ? `Clear at least 2 successful operations to unlock broker signals refresh (${completedMissionsCount}/2 completed).` 
              : 'Contact underground syndicate brokers for a fresh batch of mercenary contracts.'}
            className={`w-full sm:w-auto px-4 py-2.5 border font-mono font-bold uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 ${
              !isRefreshUnlocked
                ? 'border-zinc-700/80 bg-zinc-900/60 text-zinc-500 cursor-not-allowed opacity-80'
                : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black disabled:opacity-50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
            }`}
          >
            {!isRefreshUnlocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>[ LOCKED // BEAT 2 MISSIONS ({completedMissionsCount}/2) ]</span>
              </>
            ) : generatingMission ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>[ DECRYPTING CONTRACTS... ]</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>[ REFRESH BROKER SIGNALS ]</span>
              </>
            )}
          </button>
          {!isRefreshUnlocked && (
            <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 self-start sm:self-end">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse" />
              BROKER SIGNAL LOCKOUT // CLEAR {missionsRemainingToUnlock} MORE {missionsRemainingToUnlock === 1 ? 'OPERATION' : 'OPERATIONS'} TO UNLOCK
            </div>
          )}
        </div>
      </div>

      {/* Active Missions In Progress */}
      {activeMissions.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            OPERATIONS CURRENTLY DEPLOYED ({activeMissions.length}):
          </div>
          {activeMissions.map((act) => {
            const duration = act.durationSeconds || act.mission.durationSeconds;
            const elapsed = (now - act.startTime) / 1000;
            const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
            const isComplete = progress >= 100;
            const isMultiStage = act.mission.difficulty === 'Suicide Mission' || act.mission.difficulty === 'Warzone';
            const remainingSecs = Math.max(0, Math.ceil(duration - elapsed));
            const isExpedited = duration < act.mission.durationSeconds;
            
            return (
              <div key={act.missionId} className="bg-black border-2 border-emerald-500 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-emerald-400 tracking-widest">{act.mission.title.toUpperCase()}</span>
                    {isExpedited && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> ACCELERATED INFILTRATION ({duration}s)
                      </span>
                    )}
                    {isMultiStage && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 border border-red-500/50 text-red-400 font-bold">
                        2-STAGE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-xs text-emerald-500 bg-black h-2.5 flex-1 max-w-md border border-emerald-500/50 p-0.5">
                      <div className={`h-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-emerald-500/60'}`} style={{width: `${progress}%`}} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                      {isComplete ? (
                        <span className="text-emerald-400 font-bold">INFILTRATION COMPLETE</span>
                      ) : (
                        <span>{remainingSecs}s REMAINING ({progress}%)</span>
                      )}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onResolveMission(act.missionId)} 
                  className={`w-full sm:w-auto px-5 py-2.5 font-bold tracking-widest border transition-all text-xs uppercase ${
                    isComplete ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_#10b981]' : 'text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10'
                  }`}
                >
                  {isComplete ? '[ RESOLVE OPERATION ]' : '[ TACTICAL MONITOR ]'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Mission Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {missions.map((m) => {
          const estCredits = Math.round(m.rewards.credits * creditMult);
          const estIntel = Math.round(m.rewards.intel * intelMult);
          const allocatedPower = getMissionAllocatedPower(m.id);
          const allocatedCount = getMissionAllocatedCount(m.id);
          const powerRatio = allocatedPower / (m.recommendedPower || 1);

          // Win probability calculation indicator
          let winChanceText = '[ NO TROOPS ALLOCATED ]';
          let winBadgeColor = 'text-zinc-500 border-zinc-800 bg-zinc-950';
          let winChancePercent = 0;

          if (allocatedPower > 0) {
            if (powerRatio < 0.5) {
              winChancePercent = Math.round(powerRatio * 50);
              winChanceText = `[ CRITICAL DEFICIT: ~${winChancePercent}% WIN CHANCE ]`;
              winBadgeColor = 'text-red-400 border-red-500/60 bg-red-950/40 animate-pulse';
            } else if (powerRatio < 0.8) {
              winChancePercent = Math.round(50 + (powerRatio - 0.5) * 60);
              winChanceText = `[ HIGH COMBAT RISK: ~${winChancePercent}% WIN CHANCE ]`;
              winBadgeColor = 'text-amber-400 border-amber-500/60 bg-amber-950/40';
            } else if (powerRatio < 1.15) {
              winChancePercent = Math.round(75 + (powerRatio - 0.8) * 45);
              winChanceText = `[ COMBAT READY: ~${Math.min(92, winChancePercent)}% WIN CHANCE ]`;
              winBadgeColor = 'text-emerald-400 border-emerald-500/60 bg-emerald-950/40';
            } else {
              winChancePercent = Math.min(99, Math.round(92 + (powerRatio - 1.15) * 8));
              winChanceText = `[ OVERWHELMING SUPERIORITY: ~${winChancePercent}% WIN CHANCE ]`;
              winBadgeColor = 'text-cyan-400 border-cyan-500/60 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
            }
          }

          const isTwoStage = m.difficulty === 'Suicide Mission' || m.difficulty === 'Warzone';

          return (
            <div 
              key={m.id} 
              className={`bg-black border-2 p-4 flex flex-col gap-4 shadow-[0_0_12px_rgba(16,185,129,0.06)] transition-all ${
                m.difficulty === 'Warzone' 
                  ? 'border-purple-500/70 hover:border-purple-400 bg-purple-950/10' 
                  : m.difficulty === 'Suicide Mission'
                    ? 'border-red-500/60 hover:border-red-400 bg-red-950/10'
                    : 'border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/5'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className={`text-xs tracking-widest px-2 py-0.5 border ${getDifficultyColor(m.difficulty)}`}>
                    CLASS: {m.difficulty.toUpperCase()}
                  </div>
                  {isTwoStage ? (
                    <span className="text-[10px] text-red-400 border border-red-500/40 px-1.5 py-0.5 bg-red-950/30 font-bold animate-pulse">
                      ⚡ 2-STAGE MINIGAME
                    </span>
                  ) : m.requiresMinigame ? (
                    <span className="text-[10px] text-orange-400 border border-orange-500/40 px-1.5 py-0.5 bg-orange-950/30 font-bold">
                      ⚡ 1-STAGE MINIGAME
                    </span>
                  ) : null}
                </div>

                <div className="font-bold text-emerald-300 tracking-wider text-base">{m.title}</div>
                <div className="text-xs text-emerald-500/70 mt-1 mb-3">{m.description}</div>
              </div>

              <TacticalMap target={m.targetNation} />

              {/* Target & Est Defense Target Rating */}
              <div className="bg-emerald-950/20 p-2.5 border border-emerald-500/30 text-xs space-y-1">
                <div className="text-red-400">{'>'} CLIENT / TARGET: {m.client} {'->'} {m.targetNation.toUpperCase()}</div>
                <div className="text-amber-400 font-bold flex justify-between">
                  <span>{'>'} EST_ENEMY_DEFENSE:</span>
                  <span>{m.recommendedPower} PWR</span>
                </div>
              </div>

              {/* Reward Breakdown with Event Multipliers */}
              <div className="bg-black border border-emerald-500/30 p-2.5 text-xs font-mono space-y-1">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest">CONTRACT REWARDS:</div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> Credits:</span>
                  <span className="font-bold">
                    ${estCredits.toLocaleString()}
                    {creditMult !== 1.0 && (
                      <span className={`text-[10px] ml-1.5 px-1 ${creditMult > 1 ? 'text-emerald-300 bg-emerald-500/20' : 'text-red-300 bg-red-500/20'}`}>
                        ({creditMult.toFixed(2)}x)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-cyan-400">
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Intel:</span>
                  <span className="font-bold">
                    {estIntel} TB
                    {intelMult !== 1.0 && (
                      <span className={`text-[10px] ml-1.5 px-1 ${intelMult > 1 ? 'text-cyan-300 bg-cyan-500/20' : 'text-red-300 bg-red-500/20'}`}>
                        ({intelMult.toFixed(2)}x)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* REAL-TIME DEPLOYED POWER METER & WIN PROBABILITY (Requested Feature) */}
              <div className="bg-zinc-950 border border-emerald-500/40 p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> DEPLOYED SQUAD POWER:
                  </span>
                  <div className="flex items-center gap-2">
                    {achievementBuffPercent > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" title="Permanent power boost from unlocked Achievements">
                        +{achievementBuffPercent}% ACHIEVEMENTS BUFF
                      </span>
                    )}
                    <span className="font-bold text-emerald-400 text-sm">
                      {allocatedPower} PWR <span className="text-[10px] text-zinc-500 font-normal">({allocatedCount} units)</span>
                    </span>
                  </div>
                </div>

                {/* Relative Power Bar Comparison */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-black border border-emerald-500/30 p-0.5">
                    <div 
                      className={`h-full transition-all duration-200 ${
                        powerRatio >= 1.0 
                          ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                          : powerRatio >= 0.6 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round(powerRatio * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Power Ratio: {Math.round(powerRatio * 100)}%</span>
                    <span>Target: {m.recommendedPower} PWR</span>
                  </div>
                </div>

                {/* Win Probability Badge */}
                <div className={`p-1.5 border text-center text-xs font-bold ${winBadgeColor}`}>
                  {winChanceText}
                </div>

                {/* Infiltration Speed Metric */}
                {(() => {
                  const { speedMultiplier, speedBonusPercent } = calculateInfiltrationSpeed(allocatedPower, m.recommendedPower);
                  const expeditedDuration = calculateInfiltrationDuration(m.durationSeconds, allocatedPower, m.recommendedPower);
                  const timeSaved = Math.max(0, m.durationSeconds - expeditedDuration);

                  return (
                    <div className="bg-black/70 border border-emerald-500/30 p-2 flex justify-between items-center text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> INFILTRATION TIME:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {speedBonusPercent > 0 ? (
                          <>
                            <span className="line-through text-zinc-600 text-[10px]">{m.durationSeconds}s</span>
                            <span className="text-cyan-300 font-bold text-xs">{expeditedDuration}s</span>
                            <span className="text-[9px] text-cyan-300 font-bold px-1 py-0.2 bg-cyan-950/60 border border-cyan-500/40">
                              +{speedBonusPercent}% SPD (-{timeSaved}s)
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-300 font-bold text-xs">{m.durationSeconds}s (Standard)</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Unit Allocation Controls */}
              <div className="space-y-2 border-t border-emerald-500/30 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-emerald-500/70 tracking-widest">{'>'} ALLOCATE TROOPS:</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleClearAllocation(m.id)}
                      className="text-[10px] px-2 py-0.5 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors uppercase"
                    >
                      [ CLEAR ]
                    </button>
                    <button 
                      onClick={() => handleDeployAllForMission(m.id)}
                      className="text-[10px] px-2 py-0.5 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors uppercase tracking-widest"
                    >
                      [ DEPLOY_ALL ]
                    </button>
                  </div>
                </div>

                {troops.map(t => {
                  const singlePwr = getSingleUnitPower(t);
                  const currentAlloc = (allocations[m.id] && allocations[m.id][t.class]) || 0;

                  return (
                    <div key={t.class} className="flex justify-between items-center text-xs bg-zinc-950/60 p-1.5 border border-emerald-500/20">
                      <div>
                        <div className="text-emerald-400 font-bold">
                          {t.class.toUpperCase()} <span className="text-[10px] text-zinc-400">({t.count} avail)</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {singlePwr} PWR/ea {t.equippedWeaponId ? '⚡' : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number" 
                          min="0" 
                          max={t.count} 
                          className="w-16 bg-black border border-emerald-500/50 px-2 py-1 text-emerald-400 text-right focus:outline-none focus:border-emerald-400 font-mono font-bold" 
                          value={currentAlloc || ''}
                          placeholder="0"
                          onChange={(e) => handleSetTroopCount(m.id, t.class, parseInt(e.target.value) || 0, t.count)}
                        />
                      </div>
                    </div>
                  );
                })}

                {(() => {
                  const expeditedDuration = calculateInfiltrationDuration(m.durationSeconds, allocatedPower, m.recommendedPower);
                  return (
                    <button 
                      onClick={() => handleDeploy(m)} 
                      disabled={allocatedCount === 0}
                      className="w-full mt-3 py-3 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-extrabold text-xs tracking-widest uppercase transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-emerald-400 flex items-center justify-center gap-2"
                    >
                      <Crosshair className="w-4 h-4" />
                      [ EXECUTE DEPLOYMENT // {expeditedDuration}s ({allocatedPower} PWR) ]
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
