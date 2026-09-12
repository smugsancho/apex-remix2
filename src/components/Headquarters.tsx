import React from 'react';
import { HQUpgrade } from '../types';
import { Building2, TrendingUp, Cpu, Lock, Check, Zap, Coins, Clock, Sparkles } from 'lucide-react';

interface HeadquartersProps {
  upgrades: HQUpgrade[];
  credits: number;
  intel: number;
  rebirths: number;
  onPurchaseUpgrade: (id: string) => void;
  onHarvestUpgrade: (id: string) => void;
  onHarvestAllReady: () => void;
}

export const Headquarters: React.FC<HeadquartersProps> = ({ 
  upgrades, 
  credits, 
  intel, 
  rebirths, 
  onPurchaseUpgrade,
  onHarvestUpgrade,
  onHarvestAllReady
}) => {
  const ownedUpgrades = upgrades.filter(u => u.owned);
  const readyToHarvest = ownedUpgrades.filter(u => (u.cooldownMissionsRemaining || 0) === 0);
  const totalReadyYield = readyToHarvest.reduce((sum, u) => sum + u.incomeBoost, 0);
  const totalInstalledCapacity = ownedUpgrades.reduce((sum, u) => sum + u.incomeBoost, 0);

  return (
    <div className="space-y-6">
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text flex items-center gap-2">
            <Building2 className="w-6 h-6" /> {'>>'} HQ_COMMAND_CENTER
          </h2>
          <p className="text-xs text-emerald-500/70 mt-1 font-mono">
            Black-market shell companies, quantum computing nodes, and covert revenue generators.
          </p>
        </div>

        {/* Global Harvest Summary */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-zinc-950 border border-emerald-500/40 p-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <div className="text-[10px] text-zinc-400 tracking-widest uppercase">READY TO HARVEST</div>
            <div className="text-lg font-bold text-emerald-300 flex items-center gap-1.5 glow-text">
              <Coins className="w-4 h-4 text-emerald-400" />
              ${totalReadyYield.toLocaleString()}
            </div>
          </div>

          {readyToHarvest.length > 0 && (
            <button
              onClick={onHarvestAllReady}
              className="px-4 py-3 bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
            >
              <Sparkles className="w-4 h-4" /> [ CLAIM ALL READY (${totalReadyYield.toLocaleString()}) ]
            </button>
          )}
        </div>
      </div>

      {/* Overview Notice */}
      <div className="border border-emerald-500/30 bg-emerald-950/20 p-4 font-mono text-xs text-emerald-400/90 flex flex-col md:flex-row justify-between gap-3 items-start md:items-center">
        <div>
          <span className="font-bold text-emerald-300">OPERATIONAL PROTOCOL:</span> Click installed assets below to extract revenue. Each extraction initiates a <span className="text-amber-300 font-bold">2-Mission Recharge Cycle</span> before payout is ready again.
        </div>
        <div className="text-[11px] text-zinc-400 shrink-0">
          INSTALLED ASSETS: <span className="text-emerald-300 font-bold">{ownedUpgrades.length} / {upgrades.length}</span> | MAX CAPACITY: <span className="text-emerald-300 font-bold">${totalInstalledCapacity.toLocaleString()}</span>
        </div>
      </div>

      {/* Upgrades List */}
      <div className="bg-black border border-emerald-500/30 p-6 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
        <h3 className="text-lg font-bold text-emerald-400 mb-4 tracking-widest font-mono">
          SYNDICATE INFRASTRUCTURE ASSETS
        </h3>
        
        <div className="space-y-4 font-mono">
          {upgrades.map((upgrade) => {
            const meetsRebirths = rebirths >= upgrade.requiredRebirths;
            const canAfford = credits >= upgrade.costCredits && intel >= upgrade.costIntel;
            const isOwned = upgrade.owned;
            const cooldownRemaining = upgrade.cooldownMissionsRemaining || 0;
            const isReadyToHarvest = isOwned && cooldownRemaining === 0;
            
            return (
              <div 
                key={upgrade.id} 
                className={`border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isReadyToHarvest
                    ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : isOwned 
                      ? 'border-amber-500/40 bg-zinc-950/80' 
                      : meetsRebirths 
                        ? 'border-emerald-500/40 bg-black hover:bg-emerald-500/5' 
                        : 'border-zinc-800 bg-zinc-900/50 opacity-60'
                }`}
              >
                {/* Left Description */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold tracking-wider text-base ${
                      isReadyToHarvest 
                        ? 'text-emerald-300 glow-text' 
                        : isOwned 
                          ? 'text-zinc-200' 
                          : meetsRebirths 
                            ? 'text-emerald-400' 
                            : 'text-zinc-500'
                    }`}>
                      {upgrade.name}
                    </h4>
                    {!meetsRebirths && <Lock className="w-4 h-4 text-rose-500" />}
                    {isOwned && (
                      <span className={`text-[10px] px-2 py-0.5 border uppercase font-bold ${
                        isReadyToHarvest 
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 animate-pulse' 
                          : 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                      }`}>
                        {isReadyToHarvest ? 'YIELD READY' : `RECHARGING (${cooldownRemaining} OPS)`}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs ${isOwned ? 'text-zinc-300' : meetsRebirths ? 'text-emerald-500/80' : 'text-zinc-600'}`}>
                    {upgrade.description}
                  </p>

                  <div className="text-xs mt-2 flex flex-wrap items-center gap-4">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Payout: +${upgrade.incomeBoost.toLocaleString()}
                    </span>
                    <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recharge: 2 Missions
                    </span>
                    {!meetsRebirths && (
                      <span className="text-rose-500 font-bold flex items-center gap-1 text-[11px]">
                        REQUIRES REBOOT LVL {upgrade.requiredRebirths}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Right Action Block */}
                <div className="flex md:flex-col items-center gap-3 min-w-[220px]">
                  
                  {/* Purchase Cost Display if not owned */}
                  {!isOwned && meetsRebirths && (
                    <div className="flex gap-4 text-xs font-mono w-full justify-between pb-1">
                      <span className={credits >= upgrade.costCredits ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                        ${upgrade.costCredits.toLocaleString()}
                      </span>
                      <span className={intel >= upgrade.costIntel ? "text-cyan-400 font-bold flex items-center gap-1" : "text-rose-500 font-bold flex items-center gap-1"}>
                        <Cpu className="w-3 h-3" /> {upgrade.costIntel} TB
                      </span>
                    </div>
                  )}

                  {/* Owned State: Harvest or Cooldown */}
                  {isOwned ? (
                    isReadyToHarvest ? (
                      <button
                        onClick={() => onHarvestUpgrade(upgrade.id)}
                        className="w-full py-2.5 bg-emerald-500 text-black font-bold tracking-widest text-xs uppercase hover:bg-emerald-400 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> [ CLAIM +${upgrade.incomeBoost.toLocaleString()} ]
                      </button>
                    ) : (
                      <div className="w-full">
                        <div className="w-full py-2 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-center font-bold tracking-widest text-xs flex items-center justify-center gap-2">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>COOLDOWN: {cooldownRemaining} OP{cooldownRemaining > 1 ? 'S' : ''}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1 mt-1 border border-zinc-800">
                          <div 
                            className="bg-amber-400 h-full transition-all" 
                            style={{ width: `${((2 - cooldownRemaining) / 2) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    /* Not Owned: Purchase Button */
                    <button
                      onClick={() => onPurchaseUpgrade(upgrade.id)}
                      disabled={!meetsRebirths || !canAfford}
                      className={`w-full py-2.5 font-bold tracking-widest uppercase border text-xs transition-colors ${
                        !meetsRebirths
                          ? 'border-zinc-800 text-zinc-600 bg-transparent'
                          : canAfford
                            ? 'border-emerald-500 text-black bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'border-rose-500/50 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                      }`}
                    >
                      {!meetsRebirths ? '[ LOCKED ]' : canAfford ? '[ PURCHASE NODE ]' : '[ INSUFFICIENT FUNDS ]'}
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
