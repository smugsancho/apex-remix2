import React, { useState } from 'react';
import { WarEvent, PlayerTroop, WeaponItem, RivalNation, MercenaryClass, Mission } from '../types';
import { 
  Swords, 
  Shield, 
  Crosshair, 
  Zap, 
  Coins, 
  Flame, 
  Clock, 
  ArrowRight, 
  Users, 
  X, 
  Gauge, 
  AlertTriangle,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { 
  calculateUnitPower, 
  calculateTeamPower, 
  calculateInfiltrationSpeed, 
  calculateInfiltrationDuration 
} from '../utils/infiltration';

interface WarzoneSupportModalProps {
  war: WarEvent;
  troops: PlayerTroop[];
  weapons: WeaponItem[];
  rivalNations: RivalNation[];
  achievementPowerMultiplier: number;
  rebirths: number;
  onDeployWarzoneOperation: (
    war: WarEvent,
    supportedSide: 'A' | 'B',
    deployment: { class: MercenaryClass; count: number }[],
    expeditedDuration: number
  ) => void;
  onClose: () => void;
}

export const WarzoneSupportModal: React.FC<WarzoneSupportModalProps> = ({
  war,
  troops,
  weapons,
  rivalNations,
  achievementPowerMultiplier,
  rebirths,
  onDeployWarzoneOperation,
  onClose
}) => {
  // If player already chose a side previously, default to it; otherwise step 1
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(
    war.playerSide === 'A' || war.playerSide === 'B' ? war.playerSide : null
  );

  // Troop allocations for this warzone operation
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const nationA = rivalNations.find(n => n.name === war.factionA || war.factionA.includes(n.name));
  const nationB = rivalNations.find(n => n.name === war.factionB || war.factionB.includes(n.name));

  const supportedFactionName = selectedSide === 'A' ? war.factionA : war.factionB;
  const enemyFactionName = selectedSide === 'A' ? war.factionB : war.factionA;

  // Base warzone mission parameters
  const baseDurationSeconds = 85;
  const recommendedPower = war.requiredPower || 2400;

  // Calculate live squad stats
  const allocatedPower = calculateTeamPower(troops, weapons, achievementPowerMultiplier, allocations);
  const allocatedCount: number = Object.values(allocations).reduce<number>((sum, c) => sum + (Number(c) || 0), 0);

  const { speedMultiplier, speedBonusPercent } = calculateInfiltrationSpeed(allocatedPower, recommendedPower);
  const expeditedDuration = calculateInfiltrationDuration(baseDurationSeconds, allocatedPower, recommendedPower);
  const timeSaved = Math.max(0, baseDurationSeconds - expeditedDuration);

  // Win probability
  const powerRatio = allocatedPower / Math.max(1, recommendedPower);
  let winChancePercent = 0;
  if (allocatedCount === 0) {
    winChancePercent = 0;
  } else if (powerRatio < 0.6) {
    winChancePercent = Math.max(10, Math.round(powerRatio * 45));
  } else if (powerRatio < 1.0) {
    winChancePercent = Math.round(50 + (powerRatio - 0.6) * 75);
  } else {
    winChancePercent = Math.min(99, Math.round(80 + (powerRatio - 1.0) * 15));
  }

  // Allocation handlers
  const handleSetTroopCount = (troopClass: string, count: number, max: number) => {
    const safe = Math.max(0, Math.min(max, count));
    setAllocations(prev => ({
      ...prev,
      [troopClass]: safe
    }));
  };

  const handleDeployAll = () => {
    const full: Record<string, number> = {};
    troops.forEach(t => {
      full[t.class] = t.count;
    });
    setAllocations(full);
  };

  const handleClearAll = () => {
    setAllocations({});
  };

  const handleLaunch = () => {
    if (!selectedSide || allocatedCount === 0) return;

    const deploymentList = (Object.entries(allocations) as [string, number][])
      .filter(([_, count]) => count > 0)
      .map(([cls, count]) => ({ class: cls as MercenaryClass, count }));

    if (deploymentList.length > 0) {
      onDeployWarzoneOperation(war, selectedSide, deploymentList, expeditedDuration);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-black border-2 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.3)] max-w-3xl w-full text-white font-mono p-5 sm:p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto crt-overlay relative">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-red-500/30 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/50 px-2 py-0.5 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                ACTIVE THEATER CONFLICT // WARZONE INTERVENTION
              </span>
              {war.playerSide !== 'None' && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 uppercase font-bold">
                  ALIGNED: {war.playerSide === 'A' ? war.factionA : war.factionB}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-red-400 glow-text">
              {war.name.toUpperCase()}
            </h2>
            <p className="text-xs text-zinc-400">
              Contested combat theater between <span className="text-red-300 font-bold">{war.factionA}</span> and <span className="text-red-300 font-bold">{war.factionB}</span>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHOOSE A SIDE */}
        {!selectedSide ? (
          <div className="space-y-5">
            <div className="bg-red-950/20 border border-red-500/40 p-3.5 text-xs text-red-300 flex items-center gap-2.5">
              <Swords className="w-5 h-5 text-red-400 shrink-0" />
              <span>
                Select which superpower faction you wish to support. Deploying your covert syndicate strike force will initiate a <strong>Warzone Tier Operation</strong> to break the enemy frontline.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FACTION A CARD */}
              <div className="bg-zinc-950 border-2 border-emerald-500/50 hover:border-emerald-400 p-4 flex flex-col justify-between space-y-4 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold uppercase">
                      FACTION [A]
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      DEFENSE: {war.requiredPower || 2400} PWR
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-emerald-300 tracking-wider">
                    {war.factionA.toUpperCase()}
                  </h3>

                  {nationA && (
                    <div className="text-xs text-zinc-400 space-y-1 bg-black/60 p-2.5 border border-emerald-500/20">
                      <div>IDEOLOGY: <span className="text-zinc-200">{nationA.ideology}</span></div>
                      <div>THEATER STRENGTH: <span className="text-white font-bold">{nationA.power} BATTALIONS</span></div>
                      <div>TENSION: <span className={nationA.tension > 60 ? 'text-red-400' : 'text-emerald-400'}>{nationA.tension}%</span></div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">ALLIED BOUNTY PAYOFF:</div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span className="font-bold">${(war.rewardCredits || 250000).toLocaleString()} Credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="font-bold">+{war.rewardIntel || 400} TB Classified Intel</span>
                    </div>
                    <div className="text-[11px] text-amber-400/90 pt-1">
                      ⚡ Victory reduces Syndicate Heat by 15%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSide('A')}
                  className="w-full py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-extrabold text-xs tracking-widest uppercase border border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  [ SUPPORT {war.factionA.toUpperCase()} ]
                </button>
              </div>

              {/* FACTION B CARD */}
              <div className="bg-zinc-950 border-2 border-purple-500/50 hover:border-purple-400 p-4 flex flex-col justify-between space-y-4 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 border border-purple-500/50 text-purple-300 font-bold uppercase">
                      FACTION [B]
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      DEFENSE: {war.requiredPower || 2400} PWR
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-purple-300 tracking-wider">
                    {war.factionB.toUpperCase()}
                  </h3>

                  {nationB && (
                    <div className="text-xs text-zinc-400 space-y-1 bg-black/60 p-2.5 border border-purple-500/20">
                      <div>IDEOLOGY: <span className="text-zinc-200">{nationB.ideology}</span></div>
                      <div>THEATER STRENGTH: <span className="text-white font-bold">{nationB.power} BATTALIONS</span></div>
                      <div>TENSION: <span className={nationB.tension > 60 ? 'text-red-400' : 'text-emerald-400'}>{nationB.tension}%</span></div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">ALLIED BOUNTY PAYOFF:</div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span className="font-bold">${(war.rewardCredits || 250000).toLocaleString()} Credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="font-bold">+{war.rewardIntel || 400} TB Classified Intel</span>
                    </div>
                    <div className="text-[11px] text-amber-400/90 pt-1">
                      ⚡ Victory reduces Syndicate Heat by 15%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSide('B')}
                  className="w-full py-3 px-4 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-black font-extrabold text-xs tracking-widest uppercase border border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  [ SUPPORT {war.factionB.toUpperCase()} ]
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: WARZONE OPERATION DEPLOYMENT & INFILTRATION SPEED GAUGES */
          <div className="space-y-5">
            {/* Alliance Banner & Back to Side Choice */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-zinc-950 p-3 border border-red-500/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSide(null)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 border border-zinc-700 px-2 py-1 bg-zinc-900 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> CHANGE SIDE
                </button>
                <div className="text-xs">
                  <span className="text-zinc-500">ALLIANCE:</span>{' '}
                  <span className="text-emerald-400 font-bold">{supportedFactionName.toUpperCase()}</span>{' '}
                  <span className="text-zinc-500">VS</span>{' '}
                  <span className="text-red-400 font-bold">{enemyFactionName.toUpperCase()}</span>
                </div>
              </div>

              <span className="text-[10px] px-2 py-0.5 bg-red-500/20 border border-red-500/60 text-red-300 font-bold uppercase tracking-widest self-start sm:self-center">
                DIFFICULTY: WARZONE [CLASS V]
              </span>
            </div>

            {/* Infiltration Speed & Squad Combat Telemetry */}
            <div className="bg-black border-2 border-emerald-500/50 p-4 space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Gauge className="w-4 h-4 text-emerald-400 animate-spin" />
                  INFILTRATION SPEED & COMBAT METRICS
                </span>
                <span className="text-zinc-400">
                  DEFENSE RATING: <strong className="text-red-400">{recommendedPower} PWR</strong>
                </span>
              </div>

              {/* Infiltration Speed Acceleration Callout */}
              <div className={`p-3 border transition-colors ${
                speedBonusPercent > 0 
                  ? 'border-cyan-400 bg-cyan-950/30 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${speedBonusPercent > 0 ? 'text-cyan-300 animate-pulse' : 'text-zinc-600'}`} />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      INFILTRATION ACCELERATION:
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 border ${
                      speedBonusPercent > 0 
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' 
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                    }`}>
                      {speedMultiplier.toFixed(2)}x SPEED {speedBonusPercent > 0 ? `(+${speedBonusPercent}% FASTER)` : '(STANDARD)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TIMELINE: </span>
                    <span className="line-through text-zinc-500">{baseDurationSeconds}s</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="text-white font-extrabold text-sm">{expeditedDuration}s</span>
                    {timeSaved > 0 && (
                      <span className="text-[10px] text-cyan-300 font-bold">
                        (-{timeSaved}s saved!)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-cyan-400/80 mt-2">
                  {allocatedCount > 0 ? (
                    <>Superior strike power rapidly punches through frontline air-defense and sensor arrays, dramatically reducing contract insertion time.</>
                  ) : (
                    <>Allocate operatives below to accelerate infiltration speed and maximize mission success probability.</>
                  )}
                </div>
              </div>

              {/* Power comparison meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span>DEPLOYED SQUAD POWER: <strong className="text-emerald-400">{allocatedPower} PWR</strong> ({allocatedCount} units)</span>
                  <span className={winChancePercent >= 80 ? 'text-cyan-400 font-bold' : winChancePercent >= 50 ? 'text-amber-400' : 'text-red-400'}>
                    EST. WIN CHANCE: {winChancePercent}%
                  </span>
                </div>

                <div className="w-full bg-zinc-950 h-2.5 border border-zinc-800 p-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      allocatedPower >= recommendedPower 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_#10b981]' 
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((allocatedPower / recommendedPower) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Troop Allocation Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" /> ALLOCATE WARZONE STRIKE SQUAD:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeployAll}
                    className="text-[11px] px-2.5 py-1 border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-300 transition-colors uppercase font-bold"
                  >
                    DEPLOY ALL
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] px-2.5 py-1 border border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-zinc-400 transition-colors uppercase"
                  >
                    CLEAR
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[36vh] overflow-y-auto pr-1">
                {troops.map(t => {
                  const singlePwr = calculateUnitPower(t, weapons, achievementPowerMultiplier);
                  const currentAlloc = allocations[t.class] || 0;
                  const available = t.count;

                  return (
                    <div 
                      key={t.class} 
                      className={`p-3 border text-xs flex flex-col justify-between gap-2 transition-colors ${
                        currentAlloc > 0 
                          ? 'border-emerald-500 bg-emerald-950/20' 
                          : 'border-zinc-800 bg-zinc-950/80'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-sm tracking-wider">
                            {t.class.toUpperCase()}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            LVL {t.level} // <span className="text-emerald-400 font-bold">{singlePwr} PWR/ea</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 border font-bold ${
                          available > 0 ? 'border-zinc-700 text-zinc-300' : 'border-red-500/40 text-red-400'
                        }`}>
                          {available} READY
                        </span>
                      </div>

                      {/* Stepper controls */}
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleSetTroopCount(t.class, currentAlloc - 1, available)}
                          disabled={currentAlloc <= 0}
                          className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-700 text-zinc-200 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center font-bold text-sm bg-black border border-zinc-800 py-0.5 text-emerald-400">
                          {currentAlloc}
                        </div>
                        <button
                          onClick={() => handleSetTroopCount(t.class, currentAlloc + 1, available)}
                          disabled={currentAlloc >= available}
                          className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-700 text-zinc-200 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleSetTroopCount(t.class, currentAlloc + 5, available)}
                          disabled={currentAlloc >= available}
                          className="px-1.5 h-7 text-[10px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-700 text-zinc-300 font-bold"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleSetTroopCount(t.class, available, available)}
                          disabled={currentAlloc >= available || available === 0}
                          className="px-2 h-7 text-[10px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-700 text-emerald-400 font-bold"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Launch Button */}
            <div className="pt-2 border-t border-red-500/30">
              <button
                onClick={handleLaunch}
                disabled={allocatedCount === 0}
                className={`w-full py-4 px-6 font-extrabold text-sm tracking-widest uppercase border transition-all flex items-center justify-center gap-2 ${
                  allocatedCount > 0
                    ? 'bg-red-600 hover:bg-red-500 text-black border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)] cursor-pointer'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Swords className="w-5 h-5" />
                {allocatedCount > 0 
                  ? `[ LAUNCH WARZONE DEPLOYMENT // ${expeditedDuration}s INFILTRATION (${allocatedCount} UNITS) ]` 
                  : `[ ALLOCATE OPERATIVES TO PROCEED ]`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
