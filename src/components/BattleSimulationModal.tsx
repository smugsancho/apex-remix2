import React, { useState, useEffect, useRef } from 'react';
import { ActiveMission, PlayerTroop, WeaponItem, MinigameType } from '../types';
import { BulletHellMinigame } from './minigames/BulletHellMinigame';
import { PowerClashMinigame } from './minigames/PowerClashMinigame';
import { MinefieldMinigame } from './minigames/MinefieldMinigame';
import { CyberDecryptionMinigame } from './minigames/CyberDecryptionMinigame';
import { Shield, Zap, Crosshair, AlertTriangle, Activity, CheckCircle2, Skull } from 'lucide-react';

interface BattleSimulationModalProps {
  activeMission: ActiveMission;
  troops: PlayerTroop[];
  weapons: WeaponItem[];
  achievementPowerMultiplier?: number;
  achievementBuffPercent?: number;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

export const BattleSimulationModal: React.FC<BattleSimulationModalProps> = ({
  activeMission,
  troops,
  weapons,
  achievementPowerMultiplier = 1,
  achievementBuffPercent = 0,
  onComplete,
  onClose
}) => {
  const [now, setNow] = useState(Date.now());
  const [minigameBonusPower, setMinigameBonusPower] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [stagesCompleted, setStagesCompleted] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Determine stage count and types
  const diff = activeMission.mission.difficulty;
  const isMultiStage = diff === 'Suicide Mission' || diff === 'Warzone';
  const totalStages = isMultiStage ? 2 : (activeMission.mission.requiresMinigame ? 1 : 0);

  // Assign or derive minigame types for the stages
  const stageMinigameTypes: MinigameType[] = React.useMemo(() => {
    if (activeMission.mission.minigameTypes && activeMission.mission.minigameTypes.length > 0) {
      return activeMission.mission.minigameTypes;
    }
    if (diff === 'Warzone') {
      return ['bullet_hell', 'power_clash'];
    }
    if (diff === 'Suicide Mission') {
      return ['minefield', 'power_clash'];
    }
    if (diff === 'Extreme') {
      return ['cyber_decryption'];
    }
    return [];
  }, [activeMission, diff]);

  // Real-time squad power calculation with weapon multiplier & passive achievement buff
  const baseSquadPower = Math.floor(activeMission.assignedTroops.reduce((acc, t) => {
    const troopInfo = troops.find(tr => tr.class === t.class);
    const base = (troopInfo?.basePower || 10) + ((troopInfo?.level || 1) * 2);
    
    let multiplier = 1;
    if (troopInfo?.equippedWeaponId) {
      const weaponObj = weapons.find(w => w.weapon.id === troopInfo.equippedWeaponId);
      if (weaponObj) multiplier = weaponObj.weapon.powerMultiplier;
    }
    
    return acc + (t.count * base * multiplier * achievementPowerMultiplier);
  }, 0));

  const totalEffectivePower = baseSquadPower + minigameBonusPower;
  const reqPower = activeMission.mission.recommendedPower;

  // Real-time operation progress (faster based on team power)
  const totalDuration = activeMission.durationSeconds || activeMission.mission.durationSeconds;
  const elapsed = (now - activeMission.startTime) / 1000;
  const progress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
  const isTimeComplete = progress >= 100;

  // Win probability math
  const powerRatio = totalEffectivePower / (reqPower || 1);
  const calculatedWinChance = Math.min(0.98, Math.max(0.15, powerRatio >= 1.0 ? 0.85 + (powerRatio - 1) * 0.2 : powerRatio * 0.8));
  const success = (powerRatio >= 0.85) || (Math.random() < calculatedWinChance);

  // Handle stage completion
  const handleStageComplete = (bonusScore: number, hpRemaining: number) => {
    setMinigameBonusPower(prev => prev + bonusScore);
    const nextStage = currentStageIndex + 1;
    setStagesCompleted(nextStage);
    setCurrentStageIndex(nextStage);

    setLogs(prev => [
      ...prev,
      `> STAGE ${nextStage}/${totalStages} EXECUTED. POWER BOOST: +${bonusScore} PWR. SQUAD VITALITY: ${hpRemaining}%.`
    ]);
  };

  // Telemetry logs generator
  useEffect(() => {
    const newLogs: string[] = [
      `> SAT_LINK // ESTABLISHED WITH CONTROLLER AT [${activeMission.mission.targetNation.toUpperCase()}]`,
      `> MISSION CLASS: [ ${diff.toUpperCase()} ] // TARGET: ${activeMission.mission.title.toUpperCase()}`,
      `> DEPLOYED SQUAD BASE POWER: ${baseSquadPower} PWR | ENEMY DEFENSE RATING: ${reqPower} PWR`,
      achievementBuffPercent > 0 ? `> PASSIVE SYNDICATE BUFF: +${achievementBuffPercent}% COMBAT MULTIPLIER [ ONLINE ]` : '',
      `> MINIGAME TACTICAL OVERRIDE: +${minigameBonusPower} PWR | TOTAL SQUAD POWER: ${totalEffectivePower} PWR`,
      `> COMBAT INGRESS INITIALIZED...`
    ].filter(Boolean);

    if (totalStages > 0 && stagesCompleted < totalStages) {
      newLogs.push(`> AWAITING MANUAL PILOT INTERCEPT FOR TACTICAL STAGE ${currentStageIndex + 1} OF ${totalStages}...`);
    }

    if (progress > 20) newLogs.push(`> FORWARD SQUAD PENETRATED OUTER SENTRY PERIMETER [ OK ]`);
    if (progress > 45) newLogs.push(`> FIREFIGHT ESCALATING. HEAVY ENEMY COUNTERMEASURES DETECTED.`);
    if (progress > 70) newLogs.push(`> TARGET ASSETS ENGAGED. CONVERTING LOCAL QUANTUM RELAYS...`);
    if (progress >= 100) {
      if (success) {
        newLogs.push(`> OBJECTIVES SECURED WITH DOMINANT FIREPOWER. CASUALTIES CONTROLLED.`);
        newLogs.push(`> READY FOR FINAL PROTOCOL DEBRIEF.`);
      } else {
        newLogs.push(`> CRITICAL MISSION DEFICIT DETECTED. ENEMY SQUADRON OVERWHELMED POSITION.`);
        newLogs.push(`> EMERGENCY EXTRACTION AND MEDEVAC DEPLOYED.`);
      }
    }

    setLogs(newLogs);
  }, [progress, totalEffectivePower, minigameBonusPower, stagesCompleted, currentStageIndex, totalStages, success, diff]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const currentMinigameType = stageMinigameTypes[currentStageIndex];
  const isPlayingMinigame = totalStages > 0 && currentStageIndex < totalStages;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border-2 border-emerald-500 max-w-3xl w-full p-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] crt-overlay font-mono max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-emerald-500/50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-emerald-400 tracking-widest flex items-center gap-2">
                {'>>'} COMBAT_TELEMETRY // {activeMission.mission.title.toUpperCase()}
              </h3>
              <div className="text-[10px] text-emerald-500/70">
                CLIENT: {activeMission.mission.client} | TARGET: {activeMission.mission.targetNation}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isMultiStage && (
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-[10px] tracking-wider animate-pulse">
                [ 2-STAGE COMBAT RUN ]
              </span>
            )}
            <div className="text-emerald-500 animate-pulse text-xs font-bold">● LIVE REC</div>
          </div>
        </div>

        {/* Combat Stats Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4 text-xs">
          <div className="bg-zinc-950 border border-emerald-500/30 p-2.5">
            <div className="text-[9px] text-zinc-400 uppercase tracking-widest">SQUAD POWER</div>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              {totalEffectivePower} PWR
            </div>
            {minigameBonusPower > 0 && (
              <div className="text-[9px] text-cyan-400">
                (+{minigameBonusPower} from minigames)
              </div>
            )}
          </div>

          <div className="bg-zinc-950 border border-emerald-500/30 p-2.5">
            <div className="text-[9px] text-zinc-400 uppercase tracking-widest">ENEMY DEFENSE</div>
            <div className="text-base font-bold text-amber-400 flex items-center gap-1">
              <Activity className="w-4 h-4 text-amber-500" />
              {reqPower} PWR
            </div>
          </div>

          <div className="bg-zinc-950 border border-emerald-500/30 p-2.5">
            <div className="text-[9px] text-zinc-400 uppercase tracking-widest">STAGE PROGRESS</div>
            <div className="text-base font-bold text-cyan-400">
              {totalStages > 0 ? `${stagesCompleted} / ${totalStages} CLEARED` : 'AUTOMATED'}
            </div>
          </div>

          <div className="bg-zinc-950 border border-emerald-500/30 p-2.5">
            <div className="text-[9px] text-zinc-400 uppercase tracking-widest">WIN PROBABILITY</div>
            <div className={`text-base font-bold ${
              powerRatio >= 1.0 ? 'text-emerald-400' : powerRatio >= 0.7 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {Math.round(calculatedWinChance * 100)}%
            </div>
          </div>
        </div>

        {/* Minigame Interactive Arena if Active */}
        {isPlayingMinigame && (
          <div className="mb-4">
            {currentMinigameType === 'bullet_hell' && (
              <BulletHellMinigame 
                missionTitle={activeMission.mission.title}
                stageNumber={currentStageIndex + 1}
                totalStages={totalStages}
                onStageComplete={handleStageComplete}
              />
            )}
            {currentMinigameType === 'power_clash' && (
              <PowerClashMinigame 
                missionTitle={activeMission.mission.title}
                stageNumber={currentStageIndex + 1}
                totalStages={totalStages}
                onStageComplete={handleStageComplete}
              />
            )}
            {currentMinigameType === 'minefield' && (
              <MinefieldMinigame 
                missionTitle={activeMission.mission.title}
                stageNumber={currentStageIndex + 1}
                totalStages={totalStages}
                onStageComplete={handleStageComplete}
              />
            )}
            {currentMinigameType === 'cyber_decryption' && (
              <CyberDecryptionMinigame 
                missionTitle={activeMission.mission.title}
                stageNumber={currentStageIndex + 1}
                totalStages={totalStages}
                onStageComplete={handleStageComplete}
              />
            )}
          </div>
        )}

        {/* Live Terminal Log Stream */}
        <div className="bg-zinc-950 border border-emerald-500/40 h-36 overflow-y-auto p-3 font-mono text-xs space-y-1.5 mb-4">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className={
                log.includes('CRITICAL') || log.includes('EMERGENCY') 
                  ? 'text-red-400 font-bold' 
                  : log.includes('BOOST') || log.includes('OBJECTIVES')
                    ? 'text-emerald-300 font-bold'
                    : 'text-emerald-500/90'
              }
            >
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-xs text-emerald-500/80 tracking-widest">
            <span className="flex items-center gap-1.5">
              OPERATION TIMELINE
              {totalDuration < activeMission.mission.durationSeconds && (
                <span className="text-[10px] text-cyan-300 font-bold px-1 bg-cyan-950/60 border border-cyan-500/40">
                  ⚡ ACCELERATED INFILTRATION
                </span>
              )}
            </span>
            <span>{progress}% [{Math.max(0, Math.ceil(totalDuration - elapsed))}s REMAINING]</span>
          </div>
          <div className="w-full bg-black h-3 border border-emerald-500/50 p-0.5">
            <div 
              className={`h-full transition-all duration-300 ${
                isTimeComplete 
                  ? (success ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]') 
                  : 'bg-emerald-500/70'
              }`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Action Controls */}
        {isTimeComplete ? (
          <button 
            onClick={() => onComplete(success)} 
            className="w-full py-4 bg-emerald-500 text-black font-extrabold tracking-widest uppercase hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all text-sm"
          >
            [ INITIATE MISSION DEBRIEF & CLAIM REWARDS ]
          </button>
        ) : (
          <button 
            onClick={onClose} 
            className="w-full py-3 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs tracking-widest uppercase"
          >
            [ MINIMIZE TO BACKGROUND OPERATION ]
          </button>
        )}
      </div>
    </div>
  );
};
