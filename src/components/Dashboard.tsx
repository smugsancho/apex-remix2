import React, { useState } from 'react';
import { PlayerTroop, Mission, ActiveMission, TabType, WorldEvent } from '../types';
import { Shield, Zap, RefreshCw, Activity, Crosshair, AlertTriangle, Radio } from 'lucide-react';

interface DashboardProps {
  troops: PlayerTroop[];
  rebirths: number;
  onRebirth: () => void;
  missions: Mission[];
  activeMissions: ActiveMission[];
  credits: number;
  intel: number;
  tension: number;
  activeWorldEvent: WorldEvent | null;
  achievementPowerBuffPercent?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  setActiveTab: (tab: TabType) => void;
  onRefreshMissions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  troops, 
  rebirths, 
  onRebirth, 
  credits, 
  intel, 
  tension, 
  activeWorldEvent, 
  achievementPowerBuffPercent = 0,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 0,
  setActiveTab 
}) => {
  const [showRebootModal, setShowRebootModal] = useState(false);
  const totalTroops = troops.reduce((acc, t) => acc + t.count, 0);

  const REBOOT_COST_CREDITS = 100000 * Math.pow(2, rebirths);
  const REBOOT_COST_INTEL = 1000 * Math.pow(2, rebirths);
  const canReboot = credits >= REBOOT_COST_CREDITS && intel >= REBOOT_COST_INTEL;

  const handleConfirmReboot = () => {
    if (canReboot) {
      onRebirth();
      setShowRebootModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slim World Event Notification Bar if active */}
      {activeWorldEvent && (
        <div 
          onClick={() => setActiveTab('events')}
          className="cursor-pointer bg-red-950/20 border border-red-500/40 hover:border-red-500/70 py-1.5 px-3 flex items-center justify-between text-xs transition-colors group"
        >
          <div className="flex items-center gap-2 text-red-400 min-w-0">
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold tracking-wider uppercase truncate">
              CRISIS ALERT: {activeWorldEvent.title}
            </span>
          </div>
          <span className="text-emerald-400/80 group-hover:text-emerald-300 font-bold uppercase tracking-widest text-[10px] shrink-0 ml-3">
            [ DOSSIER {'>>'} ]
          </span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-black border border-emerald-500/50 p-5 flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div><div className="text-xs text-emerald-500/70 uppercase tracking-widest">Syndicate Funds</div><div className="text-2xl font-bold text-emerald-400 glow-text">${credits.toLocaleString()}</div></div>
          <div className="p-3 border border-emerald-500/30"><Zap className="w-6 h-6 text-emerald-500" /></div>
        </div>
        <div className="bg-black border border-emerald-500/50 p-5 flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div><div className="text-xs text-emerald-500/70 uppercase tracking-widest">Intel Cache</div><div className="text-2xl font-bold text-emerald-400 glow-text">{intel} TB</div></div>
          <div className="p-3 border border-emerald-500/30"><Activity className="w-6 h-6 text-emerald-500" /></div>
        </div>
        <div className="bg-black border border-emerald-500/50 p-5 flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div><div className="text-xs text-emerald-500/70 uppercase tracking-widest">Active Units</div><div className="text-2xl font-bold text-emerald-400 glow-text">{totalTroops}</div></div>
          <div className="p-3 border border-emerald-500/30"><Shield className="w-6 h-6 text-emerald-500" /></div>
        </div>
        <div 
          onClick={() => setActiveTab('achievements')}
          className="cursor-pointer bg-black border border-emerald-500/50 hover:border-emerald-400 p-5 flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-colors"
        >
          <div>
            <div className="text-xs text-emerald-500/70 uppercase tracking-widest">Passive Buff</div>
            <div className="text-2xl font-bold text-emerald-300 glow-text">+{achievementPowerBuffPercent}% PWR</div>
            <div className="text-[10px] text-emerald-500/60 font-mono mt-0.5">{unlockedAchievementsCount}/{totalAchievementsCount} Milestones</div>
          </div>
          <div className="p-3 border border-emerald-500/30 bg-emerald-500/10"><Crosshair className="w-6 h-6 text-emerald-400" /></div>
        </div>
        <div className="bg-black border border-emerald-500/50 p-5 flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div><div className="text-xs text-emerald-500/70 uppercase tracking-widest">System Rebirths</div><div className="text-2xl font-bold text-purple-400 glow-text">{rebirths}</div></div>
          <div className="p-3 border border-purple-500/30"><RefreshCw className="w-6 h-6 text-purple-500" /></div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setActiveTab('missions')} className="px-6 py-4 bg-emerald-500 text-black hover:bg-emerald-400 font-bold tracking-widest uppercase transition-colors">
          <Crosshair className="w-5 h-5 inline mr-2" /> [ INITIATE MISSIONS ]
        </button>
        <button onClick={() => setActiveTab('achievements')} className="px-6 py-4 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold tracking-widest uppercase transition-colors">
          <Shield className="w-5 h-5 inline mr-2" /> [ VIEW ACHIEVEMENTS (+{achievementPowerBuffPercent}% PWR) ]
        </button>
        <button onClick={() => setShowRebootModal(true)} className="px-6 py-4 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-black font-bold tracking-widest uppercase transition-colors">
          <RefreshCw className="w-5 h-5 inline mr-2" /> [ PRESTIGE / REBOOT ]
        </button>
      </div>

      {showRebootModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-purple-500 max-w-lg w-full p-6 shadow-[0_0_15px_rgba(168,85,247,0.2)] crt-overlay">
            <h3 className="text-2xl font-bold tracking-widest text-purple-400 mb-2 border-b border-purple-500/50 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> SYSTEM REBOOT
            </h3>
            
            <p className="text-red-400/90 mb-4 font-bold uppercase text-sm mt-4">
              WARNING: Initiating a System Reboot will permanently reset all syndicate funds, intel, troops, weapons, and territory progress. Only your Rebirth Points (Prestige Level) will be retained.
            </p>
            
            <div className="bg-purple-500/10 border border-purple-500/30 p-4 mb-6">
              <h4 className="text-purple-300 font-bold mb-2">REBOOT REQUIREMENTS:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className={credits >= REBOOT_COST_CREDITS ? "text-emerald-400" : "text-zinc-500"}>${REBOOT_COST_CREDITS.toLocaleString()} Credits</span>
                  <span className={credits >= REBOOT_COST_CREDITS ? "text-emerald-400" : "text-red-400"}>
                    {credits >= REBOOT_COST_CREDITS ? "[ MET ]" : `[ NEED ${(REBOOT_COST_CREDITS - credits).toLocaleString()} ]`}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className={intel >= REBOOT_COST_INTEL ? "text-emerald-400" : "text-zinc-500"}>{REBOOT_COST_INTEL.toLocaleString()} TB Intel</span>
                  <span className={intel >= REBOOT_COST_INTEL ? "text-emerald-400" : "text-red-400"}>
                    {intel >= REBOOT_COST_INTEL ? "[ MET ]" : `[ NEED ${(REBOOT_COST_INTEL - intel).toLocaleString()} ]`}
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowRebootModal(false)} className="flex-1 py-3 border border-zinc-500 text-zinc-400 font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                [ ABORT ]
              </button>
              <button 
                onClick={handleConfirmReboot} 
                disabled={!canReboot}
                className="flex-1 py-3 bg-purple-500 text-black font-bold uppercase tracking-widest hover:bg-purple-400 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors">
                [ INITIATE REBOOT ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
