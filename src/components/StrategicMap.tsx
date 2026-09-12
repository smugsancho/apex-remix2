import React, { useState } from 'react';
import { RivalNation, ActiveMission, WarEvent, PlayerTroop, WeaponItem, MercenaryClass } from '../types';
import { Target, Globe, AlertTriangle, Radio, Swords, Flame, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { WarzoneSupportModal } from './WarzoneSupportModal';

const FULL_ASCII_MAP = [
  "................................................................................................................",
  "..........▄████▄......................................▄▄▄▄▄...........▄▄▄▄▄▄....................................",
  "........▄████████▄..................................█████████▄.....▄████████████▄...............................",
  ".......████████████▄.........▄██▄▄................▄███████████████████████████████▄.............................",
  ".......██████████████▄.......██████..............██████████████████████████████████▄............................",
  "........███████████████......▀████▀.............█████████████████████████████████████...........................",
  ".........███████████████........................█████████████████████████████████████▄............▄▄▄...........",
  "...........████████████.........................██████████████████████████████████████▄.........▄████▄..........",
  ".............████████▀...........................██████████████████████████████████████........████████.........",
  "...............█████.............................███████████████████████████████▀▀▀████.......██████████........",
  "................████▄............................████████████████████████████▀▀......▀▀........▀███████▀........",
  "................█████.............................████████████████████████▀.......................▀▀▀...........",
  ".................█████............................██████████████████████▀.......................................",
  "..................█████............................███████████████████▀..........................▄████▄.........",
  "...................████▄............................████████████████▀..........................█████████▄.......",
  "....................████.............................▀████████████▀.............................█████████.......",
  ".....................███...............................▀███████▀.................................███████▀.......",
  ".......................█.................................▀███▀....................................▀███▀.........",
  "................................................................................................................",
  "................................................................................................................",
];

const NATION_PINS: Record<string, { x: number; y: number }> = {
  'Neo-Shanghai': { x: 85, y: 7 },
  'Vorex': { x: 80, y: 3 },
  'Aethelgard': { x: 55, y: 4 },
  'Iron Directorate': { x: 68, y: 4 },
  'Apex Syndicate': { x: 38, y: 10 }
};

interface StrategicMapProps {
  rivalNations: RivalNation[];
  activeMissions: ActiveMission[];
  warEvents: WarEvent[];
  tension: number;
  troops: PlayerTroop[];
  weapons: WeaponItem[];
  achievementPowerMultiplier: number;
  rebirths: number;
  onDeployWarzoneOperation: (
    war: WarEvent,
    supportedSide: 'A' | 'B',
    deployment: { class: MercenaryClass; count: number }[],
    expeditedDuration: number
  ) => void;
  onResolveMission: (missionId: string) => void;
}

export const StrategicMap: React.FC<StrategicMapProps> = ({ 
  rivalNations, 
  activeMissions, 
  warEvents, 
  tension,
  troops,
  weapons,
  achievementPowerMultiplier,
  rebirths,
  onDeployWarzoneOperation,
  onResolveMission
}) => {
  const [selectedWarForSupport, setSelectedWarForSupport] = useState<WarEvent | null>(null);

  const activeWars = warEvents.filter(w => w.status === 'Active');

  // Compute warzone pin between belligerents
  const getWarzonePin = (war: WarEvent): { x: number; y: number } => {
    const pinA = NATION_PINS[war.factionA] || { x: 60, y: 4 };
    const pinB = NATION_PINS[war.factionB] || { x: 75, y: 5 };
    return {
      x: Math.round((pinA.x + pinB.x) / 2),
      y: Math.max(1, Math.min(18, Math.round((pinA.y + pinB.y) / 2)))
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-emerald-500/30 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text">
            {'>>'} GLOBAL_STRATEGIC_UPLINK
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time orbital telemetry, geopolitical hotspots, and active warzone intervention grids.
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-500 border border-emerald-500/50 px-3 py-1 bg-emerald-500/10">
          <Globe className="w-4 h-4 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase">Live Satellite Uplink</span>
        </div>
      </div>

      {/* Active Warzone Notice Banner (if any wars active) */}
      {activeWars.length > 0 && (
        <div className="bg-red-950/40 border-2 border-red-500/80 p-3 text-xs text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.25)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
            <div>
              <div className="font-bold tracking-widest text-red-400 text-sm flex items-center gap-2">
                ACTIVE WARZONE THEATER DETECTED ({activeWars.length})
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5">
                Click any flashing <strong className="text-red-400">[W]</strong> warzone marker on the map to ally with a faction and deploy an accelerated assault squad!
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeWars.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWarForSupport(w)}
                className="px-3 py-1.5 bg-red-600/30 hover:bg-red-500 text-red-200 hover:text-black font-extrabold text-xs tracking-wider uppercase border border-red-400 transition-all flex items-center gap-1.5"
              >
                <Swords className="w-3.5 h-3.5" />
                [ INTERVENE: {w.name} ]
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Map & Telemetry Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <div className="bg-black/90 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] p-4 relative overflow-hidden crt-overlay">
            
            {/* Satellite coverage labels */}
            <div className="absolute top-4 left-4 text-emerald-500/70 text-xs font-mono flex items-center gap-2 z-20">
              <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>SIGINT_SAT_01 // ORBITAL SECTOR: GLOBAL CONTINENTAL</span>
            </div>
            
            <div className="absolute top-4 right-4 text-emerald-500/70 text-xs font-mono text-right z-20">
              <div className="text-[10px] text-zinc-400">DEFCON LEVEL</div>
              <div className={`font-bold text-base sm:text-lg ${tension > 80 ? 'text-red-500 glow-text' : tension > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {tension > 80 ? 'DEFCON 1 [CRITICAL]' : tension > 50 ? 'DEFCON 2 [ELEVATED]' : 'DEFCON 4 [NOMINAL]'}
              </div>
            </div>

            {/* ASCII Map Grid with Interactive Pins */}
            <div className="text-emerald-500/30 font-mono text-[10px] leading-[10px] sm:text-[12px] sm:leading-[12px] md:text-[14px] md:leading-[14px] whitespace-pre pt-12 pb-4 flex flex-col items-center overflow-x-auto relative z-10 select-none">
              {FULL_ASCII_MAP.map((row, y) => {
                let rowContent = [];
                for (let x = 0; x < row.length; x++) {
                  let isMarker = false;
                  let markerNode = null;

                  // 1. Check Contested Warzone Hotspots (between nations)
                  const warAtCoord = activeWars.find(w => {
                    const pin = getWarzonePin(w);
                    return pin.x === x && pin.y === y;
                  });

                  if (warAtCoord) {
                    isMarker = true;
                    markerNode = (
                      <span
                        key={`war_${x}_${y}`}
                        onClick={() => setSelectedWarForSupport(warAtCoord)}
                        className="text-red-400 font-extrabold animate-bounce glow-text relative group cursor-pointer bg-red-950/80 border border-red-500 px-0.5 z-30"
                      >
                        W
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border-2 border-red-500 p-2.5 text-red-400 text-[11px] hidden group-hover:block whitespace-nowrap z-50 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                          <div className="font-bold text-white border-b border-red-500/50 pb-1 mb-1 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-red-500" />
                            {warAtCoord.name.toUpperCase()}
                          </div>
                          <div className="text-zinc-300">{warAtCoord.factionA} vs {warAtCoord.factionB}</div>
                          <div className="text-yellow-400 mt-1 font-bold">▶ CLICK TO CHOOSE A SIDE & FIGHT</div>
                        </div>
                      </span>
                    );
                  }

                  // 2. Check Apex Syndicate HQ
                  if (!isMarker && x === NATION_PINS['Apex Syndicate']?.x && y === NATION_PINS['Apex Syndicate']?.y) {
                    isMarker = true;
                    markerNode = (
                      <span key={`hq_${x}_${y}`} className="text-cyan-400 font-bold animate-pulse glow-text relative group cursor-crosshair">
                        H
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-cyan-500 p-2 text-cyan-400 text-[10px] hidden group-hover:block whitespace-nowrap z-50">
                          <div className="font-bold text-white border-b border-cyan-500/50 pb-1 mb-1">APEX SYNDICATE COMMAND</div>
                          <div>Coordinates: 38°N, 10°W</div>
                          <div className="text-emerald-400 mt-1">Status: Fortified</div>
                        </div>
                      </span>
                    );
                  }

                  // 3. Check Rival Nations
                  if (!isMarker) {
                    for (const nation of rivalNations) {
                      const coord = NATION_PINS[nation.name] || { x: 5 + (nation.name.length * 3) % 90, y: 2 + (nation.name.length * 2) % 15 };
                      
                      if (x === coord.x && y === coord.y) {
                        isMarker = true;
                        
                        // Check if actively in war
                        const warInvolved = activeWars.find(w => w.factionA === nation.name || w.factionB === nation.name);
                        // Check if active mission deployed
                        const activeMissionCount = activeMissions.filter(a => a.mission.targetNation === nation.name).length;

                        let icon = 'O';
                        let colorClass = 'text-emerald-500';
                        if (warInvolved) {
                          icon = 'W';
                          colorClass = 'text-red-400 animate-pulse glow-text cursor-pointer hover:text-white';
                        } else if (activeMissionCount > 0) {
                          icon = 'X';
                          colorClass = 'text-amber-500 animate-pulse glow-text';
                        }

                        markerNode = (
                          <span 
                            key={`nation_${nation.name}_${x}_${y}`} 
                            onClick={() => {
                              if (warInvolved) {
                                setSelectedWarForSupport(warInvolved);
                              }
                            }}
                            className={`${colorClass} font-bold relative group ${warInvolved ? 'cursor-pointer' : 'cursor-crosshair'}`}
                          >
                            {icon}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-emerald-500 p-2.5 text-emerald-400 text-[10px] hidden group-hover:block whitespace-nowrap z-50 shadow-lg">
                              <div className="font-bold text-white border-b border-emerald-500/50 pb-1 mb-1">{nation.name.toUpperCase()}</div>
                              <div>Threat Rating: {nation.threatLevel}</div>
                              <div>Ideology: {nation.ideology}</div>
                              {warInvolved && (
                                <div className="text-red-400 mt-1 font-bold flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-red-500" />
                                  WARZONE CONFLICT: CLICK TO INTERVENE
                                </div>
                              )}
                              {activeMissionCount > 0 && (
                                <div className="text-amber-400 mt-1">{activeMissionCount} ACTIVE DEPLOYMENT(S)</div>
                              )}
                            </div>
                          </span>
                        );
                        break;
                      }
                    }
                  }

                  if (isMarker) {
                    rowContent.push(markerNode);
                  } else {
                    rowContent.push(<span key={x}>{row[x]}</span>);
                  }
                }
                return <div key={y} className="flex">{rowContent}</div>;
              })}
            </div>
            
            {/* Grid overlay lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none z-0" />
          </div>
          
          {/* Map Legend */}
          <div className="flex flex-wrap justify-between items-center mt-3 text-xs font-mono text-emerald-500/80 border border-emerald-500/30 bg-black/90 p-2.5 gap-2">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1"><span className="text-cyan-400 font-bold">H</span> = APEX HQ</span>
              <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">O</span> = RIVAL NATION</span>
              <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">X</span> = ACTIVE OP</span>
              <span className="flex items-center gap-1"><span className="text-red-400 font-extrabold bg-red-950/60 border border-red-500/60 px-1">W</span> = WARZONE (CLICK TO SUPPORT SIDE)</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              *Operative power speeds up infiltration duration
            </span>
          </div>
        </div>

        {/* Right Sidebar: Active Conflicts & Theater Briefing */}
        <div className="space-y-4">
          {/* Active Conflicts & Support Panel */}
          <div className="bg-black border-2 border-red-500/60 p-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <div className="flex justify-between items-center mb-3 border-b border-red-500/30 pb-2">
              <h3 className="text-sm font-bold tracking-widest text-red-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500 animate-pulse" /> ACTIVE_WARZONES
              </h3>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 border border-red-500/40 font-bold">
                {activeWars.length} ACTIVE
              </span>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              {activeWars.length > 0 ? (
                activeWars.map(w => {
                  const hasAligned = w.playerSide === 'A' || w.playerSide === 'B';
                  const alignedFaction = w.playerSide === 'A' ? w.factionA : w.factionB;

                  return (
                    <div key={w.id} className="border border-red-500/40 bg-red-950/20 p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-red-400 font-bold text-xs">{w.name}</span>
                        {hasAligned && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            ALIGNED
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-300">
                        <span className="text-emerald-400 font-bold">{w.factionA}</span> vs <span className="text-purple-400 font-bold">{w.factionB}</span>
                      </div>

                      {hasAligned ? (
                        <div className="text-[11px] text-cyan-300">
                          ALLIED WITH: <strong>{alignedFaction}</strong>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-400">
                          BOUNTY: ${(w.rewardCredits || 250000).toLocaleString()} + {w.rewardIntel || 400} TB Intel
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedWarForSupport(w)}
                        className="w-full py-2 px-3 bg-red-600/30 hover:bg-red-500 text-red-200 hover:text-black font-extrabold text-xs tracking-wider uppercase border border-red-400 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        {hasAligned ? '[ DEPLOY ALLIED STRIKE ]' : '[ CHOOSE SIDE & FIGHT ]'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-zinc-500 italic p-3 text-center border border-zinc-800">
                  No open theater warfare detected. Tension levels remain contained.
                </div>
              )}
            </div>
          </div>

          {/* Active Deployments Theater Briefing */}
          <div className="bg-black border border-emerald-500 p-4">
            <h3 className="text-sm font-bold tracking-widest text-emerald-400 mb-3 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> THEATER_BRIEFING
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              {activeMissions.length > 0 ? (
                activeMissions.map(act => {
                  const duration = act.durationSeconds || act.mission.durationSeconds;
                  const elapsed = (Date.now() - act.startTime) / 1000;
                  const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
                  const isComplete = progress >= 100;
                  const remaining = Math.max(0, Math.ceil(duration - elapsed));

                  return (
                    <div key={act.missionId} className="border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="text-amber-400 font-bold">{act.mission.title}</div>
                        {act.mission.difficulty === 'Warzone' && (
                          <span className="text-[9px] px-1 bg-red-500/30 text-red-300 border border-red-500/50 font-bold">
                            WARZONE
                          </span>
                        )}
                      </div>

                      <div className="text-zinc-300 text-[11px]">
                        Target: <strong className="text-white">{act.mission.targetNation}</strong>
                      </div>

                      {/* Timeline progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Infiltration</span>
                          <span>{isComplete ? 'READY FOR ASSAULT' : `${remaining}s remaining (${progress}%)`}</span>
                        </div>
                        <div className="w-full bg-black h-1.5 border border-amber-500/50">
                          <div
                            className={`h-full transition-all ${isComplete ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {isComplete && (
                        <button
                          onClick={() => onResolveMission(act.missionId)}
                          className="w-full py-1.5 bg-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase border border-emerald-400 hover:bg-emerald-400 transition-all"
                        >
                          [ RESOLVE ASSAULT ]
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-emerald-500/50 italic p-3 text-center border border-zinc-800">
                  No active operations deployed in field.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warzone Support Modal (Step 1: Choose Side, Step 2: Allocate & Deploy with Accelerated Speed) */}
      {selectedWarForSupport && (
        <WarzoneSupportModal
          war={selectedWarForSupport}
          troops={troops}
          weapons={weapons}
          rivalNations={rivalNations}
          achievementPowerMultiplier={achievementPowerMultiplier}
          rebirths={rebirths}
          onDeployWarzoneOperation={onDeployWarzoneOperation}
          onClose={() => setSelectedWarForSupport(null)}
        />
      )}
    </div>
  );
};
