import React, { useState } from 'react';
import { RivalNation, WarEvent } from '../types';
import { Globe, Swords, AlertTriangle, Zap, Shield, Flame, Activity, Crosshair, ChevronRight } from 'lucide-react';

interface GeopoliticsProps {
  rivalNations: RivalNation[];
  intel: number;
  syndicateTension: number;
  warEvents: WarEvent[];
  onInciteWar: (nationId: string) => void;
  onSelectWarzone?: (war: WarEvent) => void;
}

export const Geopolitics: React.FC<GeopoliticsProps> = ({ 
  rivalNations, 
  intel, 
  syndicateTension, 
  warEvents, 
  onInciteWar,
  onSelectWarzone
}) => {
  const [selectedNation, setSelectedNation] = useState<RivalNation | null>(null);

  const activeWars = warEvents.filter(w => w.status === 'Active');

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-emerald-500/30 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            {'>>'} GEOPOLITICAL_THEATER // SHADOW DIPLOMACY
          </h2>
          <p className="text-xs text-emerald-500/70 mt-1">
            Manipulate superpower proxy tensions, orchestrate clandestine wars, and defuse global hostility from the shadows.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black border border-emerald-500/30 px-3 py-1.5 self-start sm:self-center">
          <span className="text-[11px] text-zinc-400">SYNDICATE HEAT:</span>
          <span className={`text-xs font-bold ${syndicateTension > 70 ? 'text-red-400 animate-pulse glow-text' : syndicateTension > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {syndicateTension}% TENSION
          </span>
        </div>
      </div>

      {/* Strategic Doctrine Notice */}
      <div className="border border-red-500/40 bg-red-950/20 p-4 text-xs text-red-300/90 space-y-2">
        <div className="font-bold flex items-center gap-2 text-red-400">
          <Swords className="w-4 h-4" /> DOCTRINE OF ASYMMETRIC DESTABILIZATION:
        </div>
        <p className="leading-relaxed">
          When international intelligence agencies apply heavy pressure on the Apex Syndicate, use <strong>[ INCITE WAR ]</strong> (100 Intel). Spies will fabricate border provocations between rival superpowers. As they clash, international satellite arrays and security fleets pivot to fight each other, <strong>reducing your Syndicate tension by 25%</strong> without embroiling your operatives directly.
        </p>
      </div>

      {/* Active Conflicts Panel */}
      <div className="bg-black p-6 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] space-y-4">
        <div className="flex justify-between items-center border-b border-red-500/30 pb-3">
          <h3 className="font-bold text-red-400 tracking-widest flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            {'>>'} ACTIVE_CONFLICTS & WARZONES ({activeWars.length})
          </h3>
          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 uppercase tracking-widest">
            LIVE WAR TELEMETRY
          </span>
        </div>

        {activeWars.length === 0 ? (
          <div className="text-emerald-500/50 text-xs tracking-widest py-6 text-center border border-dashed border-emerald-500/20">
            {'>'} NO OPEN MILITARY WARS DETECTED. ALL SUPERPOWERS IN SUBVERSIVE COLD WAR POSTURE.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWars.map(w => {
              const isApexInvolved = w.factionA.includes('Apex') || w.factionB.includes('Apex');

              return (
                <div 
                  key={w.id} 
                  className={`p-4 border ${
                    isApexInvolved 
                      ? 'border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'border-red-500/40 bg-zinc-950/90'
                  } space-y-3 relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-base text-red-300 tracking-wider">
                        {w.name.toUpperCase()}
                      </div>
                      <div className="text-xs text-red-400/80 font-bold mt-0.5">
                        {w.factionA.toUpperCase()} <span className="text-zinc-500">VS</span> {w.factionB.toUpperCase()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold border border-red-500/60 bg-red-500/20 text-red-200 uppercase">
                      {isApexInvolved ? 'SYNDICATE FLASHPOINT' : 'INTER-NATION WAR'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/60 p-2.5 border border-red-500/20">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">THEATER COMBAT INTENSITY</span>
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-500" /> DEFCON 1 ACTIVE
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">EST. COMBAT POWER</span>
                      <span className="text-zinc-200 font-bold">
                        {w.requiredPower ? `${w.requiredPower} MW` : 'HIGH-INTENSITY'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-red-400/70 italic">
                    {isApexInvolved 
                      ? 'Hostile intelligence units and covert hunter-killer cells are probing Apex Syndicate borders.' 
                      : 'Superpower forces are actively locked in attritional combat. International surveillance distracted.'}
                  </div>

                  {onSelectWarzone && (
                    <button
                      onClick={() => onSelectWarzone(w)}
                      className="w-full py-2.5 px-3 bg-red-600/20 hover:bg-red-500 text-red-300 hover:text-black font-extrabold text-xs tracking-wider uppercase border border-red-500/80 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      {w.playerSide !== 'None' 
                        ? `[ ALLIED: ${w.playerSide === 'A' ? w.factionA : w.factionB} // DEPLOY ASSAULT ]` 
                        : `[ ⚔️ CHOOSE SIDE & INTERVENE IN WARZONE ]`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rival Nations Dossiers */}
      <div>
        <h3 className="text-base font-bold text-emerald-400 tracking-widest mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          {'>>'} SUPERPOWER SURVEILLANCE & PROXY TARGETS
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rivalNations.map(n => {
            const hasEnoughIntel = intel >= 100;
            const isTargetInActiveWar = activeWars.some(w => w.factionA === n.name || w.factionB === n.name);

            return (
              <div 
                key={n.id} 
                className={`bg-black p-5 border transition-all ${
                  isTargetInActiveWar 
                    ? 'border-red-500/60 bg-red-950/10' 
                    : 'border-emerald-500/40 hover:border-emerald-400'
                } shadow-[0_0_15px_rgba(16,185,129,0.05)] space-y-4`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-emerald-300 tracking-wider">
                      {n.name.toUpperCase()}
                    </h4>
                    <div className="text-xs text-emerald-500/70 mt-0.5">
                      IDEOLOGY: <span className="text-zinc-300">{n.ideology}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase ${
                    n.tension > 75 
                      ? 'border-red-500 bg-red-500/20 text-red-300 animate-pulse' 
                      : n.tension > 50 
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                        : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {n.status}
                  </span>
                </div>

                {/* Tension & Power Stats */}
                <div className="space-y-2 bg-zinc-950 p-3 border border-emerald-500/20">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> SUPERPOWER TENSION:
                    </span>
                    <span className={`font-bold ${n.tension > 70 ? 'text-red-400' : n.tension > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {n.tension}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-900 h-1.5 border border-zinc-800">
                    <div 
                      className={`h-full ${n.tension > 70 ? 'bg-red-500' : n.tension > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${n.tension}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
                    <span>ESTIMATED MILITARY STRENGTH:</span>
                    <span className="text-white font-bold">{n.power} BATTERY DIVISIONS</span>
                  </div>
                </div>

                {/* Action Button: Incite War */}
                <div>
                  <button 
                    onClick={() => onInciteWar(n.id)}
                    disabled={!hasEnoughIntel}
                    className={`w-full py-3 px-4 border font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${
                      hasEnoughIntel
                        ? 'border-red-500/80 bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <Swords className="w-4 h-4" />
                    {hasEnoughIntel 
                      ? `[ INCITE PROXY WAR // -25% TENSION (100 INTEL) ]` 
                      : `[ INSUFFICIENT INTEL (100 TB REQUIRED) ]`}
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-1.5">
                    Instigates false-flag border clashes with a rival nation, reducing Apex Syndicate tension.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
