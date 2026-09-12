import React, { useState } from 'react';
import { HQRaid, PlayerTroop, MercenaryClass } from '../types';
import { ShieldAlert, Crosshair, AlertTriangle } from 'lucide-react';

interface HQRaidModalProps {
  raid: HQRaid;
  troops: PlayerTroop[];
  achievementPowerMultiplier?: number;
  achievementBuffPercent?: number;
  onDefend: (deployment: {class: MercenaryClass, count: number}[]) => void;
}

export const HQRaidModal: React.FC<HQRaidModalProps> = ({ 
  raid, 
  troops, 
  achievementPowerMultiplier = 1,
  achievementBuffPercent = 0,
  onDefend 
}) => {
  const [deployments, setDeployments] = useState<{[key: string]: number}>({});

  const handleDeploy = () => {
    const deploymentList = Object.entries(deployments)
      .filter(([_, count]) => (count as number) > 0)
      .map(([c, count]) => ({ class: c as MercenaryClass, count: count as number }));
    onDefend(deploymentList);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'Minor': return 'text-amber-500 border-amber-500/50';
      case 'Severe': return 'text-orange-500 border-orange-500/50';
      case 'Critical': return 'text-red-500 border-red-500/50 glow-text';
      default: return 'text-emerald-500';
    }
  };

  const totalSelectedPower = Object.entries(deployments).reduce((sum: number, [cls, count]) => {
    const t = troops.find(tr => tr.class === cls);
    const numCount = Number(count) || 0;
    if (!t || numCount <= 0) return sum;
    const singlePwr = Math.round((t.basePower + (t.level * 2)) * achievementPowerMultiplier);
    return sum + (singlePwr * numCount);
  }, 0);

  const powerRatio = totalSelectedPower / (raid.requiredPower || 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 crt-overlay backdrop-blur-sm">
      <div className="bg-black border-2 border-red-500 p-6 max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-slow">
        <div className="flex items-center gap-3 mb-4 border-b border-red-500/30 pb-3">
          <ShieldAlert className="w-8 h-8 text-red-500 glow-text animate-pulse" />
          <div>
            <h2 className="text-xl font-bold tracking-widest text-red-500 glow-text">{'>>'} BASE UNDER ATTACK</h2>
            <div className="text-xs text-red-500/70 font-mono">EMERGENCY PROTOCOL ACTIVATED</div>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className={`border bg-black/50 p-3 ${getThreatColor(raid.threatLevel)}`}>
            <div className="font-bold mb-1 tracking-widest uppercase">Target: APEX SYNDICATE HQ</div>
            <div>Attacker: {raid.attacker}</div>
            <div>Threat Level: <span className="font-bold">{raid.threatLevel.toUpperCase()}</span></div>
            <div>Est. Enemy Power: {raid.requiredPower} PWR</div>
            <div className="text-red-400 mt-2 font-bold animate-pulse">
              TIME TO IMPACT: {raid.timeRemainingSeconds}s
            </div>
          </div>
          
          <div className="border border-red-500/30 p-3 bg-red-950/20">
            <div className="text-red-500 font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> PENALTY IF BREACHED
            </div>
            <ul className="text-red-400 list-disc list-inside space-y-1">
              <li>Loss of ${raid.penaltyCredits.toLocaleString()} Credits</li>
              <li>Loss of {raid.penaltyIntel} Intel</li>
              <li>-10% Base Morale</li>
            </ul>
          </div>

          <div className="space-y-2 border-t border-red-500/30 pt-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-red-500 tracking-widest">{'>'} GARRISON DEPLOYMENT:</div>
              <button 
                onClick={() => {
                  const allDeployments: {[key: string]: number} = {};
                  troops.forEach(t => allDeployments[t.class] = t.count);
                  setDeployments(allDeployments);
                }}
                className="text-[10px] px-2 py-0.5 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black transition-colors uppercase tracking-widest"
              >
                [ ALL_UNITS ]
              </button>
            </div>

            {/* Power Telemetry Bar */}
            <div className="bg-black border border-red-500/40 p-2 text-xs">
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>DEFENSE POWER:</span>
                <span className={`font-bold ${powerRatio >= 1.0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalSelectedPower} / {raid.requiredPower} PWR
                </span>
              </div>
              {achievementBuffPercent > 0 && (
                <div className="text-[10px] text-emerald-400">
                  +{achievementBuffPercent}% Passive Power Applied
                </div>
              )}
            </div>
            
            {troops.map(t => (
              <div key={t.class} className="flex justify-between items-center text-xs">
                <span className="text-red-400">{t.class.toUpperCase()} (Avail: {t.count})</span>
                <input type="number" min="0" max={t.count} 
                  className="w-16 bg-black border border-red-500/50 px-2 py-1 text-red-500 text-right focus:outline-none focus:border-red-400" 
                  value={deployments[t.class] || ''}
                  onChange={(e) => setDeployments({...deployments, [t.class]: parseInt(e.target.value) || 0})}
                />
              </div>
            ))}
            <button 
              onClick={handleDeploy} 
              className="w-full mt-4 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold text-sm tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Crosshair className="w-4 h-4" /> [ INITIATE_DEFENSE ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
