import React, { useState, useEffect } from 'react';
import { WorldEvent } from '../types';
import { 
  Globe, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  ShieldAlert, 
  Radio, 
  Clock, 
  Zap, 
  Activity, 
  RadioTower, 
  Sparkles,
  History,
  Shield,
  FileText,
  Snowflake
} from 'lucide-react';

interface WorldEventsViewProps {
  activeEvent: WorldEvent | null;
  eventHistory: WorldEvent[];
  tension: number;
  intel: number;
  credits: number;
  freezeMissionsRemaining?: number;
  onTriggerEvent: () => void;
  onClearEvent: () => void;
  onDisinformationCampaign?: () => void;
  onFreezeEvent?: () => void;
}

export const WorldEventsView: React.FC<WorldEventsViewProps> = ({
  activeEvent,
  eventHistory,
  tension,
  intel,
  credits,
  freezeMissionsRemaining = 0,
  onTriggerEvent,
  onClearEvent,
  onDisinformationCampaign,
  onFreezeEvent
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const isFrozen = freezeMissionsRemaining > 0;

  useEffect(() => {
    if (!activeEvent) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((activeEvent.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeEvent]);

  const getCategoryTheme = (cat: WorldEvent['category']) => {
    switch (cat) {
      case 'Economic':
        return {
          border: 'border-amber-500/60',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
        };
      case 'Political':
        return {
          border: 'border-rose-500/60',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        };
      case 'Technological':
        return {
          border: 'border-cyan-500/60',
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
          icon: <Cpu className="w-5 h-5 text-cyan-400" />,
        };
      case 'Military':
        return {
          border: 'border-red-600/70',
          bg: 'bg-red-950/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/50',
          icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
        };
      case 'Covert':
      default:
        return {
          border: 'border-purple-500/60',
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          icon: <Globe className="w-5 h-5 text-purple-400" />,
        };
    }
  };

  const handleBroadcastDisinfo = () => {
    if (intel < 50) {
      setActionFeedback('INSUFFICIENT INTEL: 50 TB required for counter-intelligence broadcast.');
      setTimeout(() => setActionFeedback(null), 3500);
      return;
    }
    if (onDisinformationCampaign) {
      onDisinformationCampaign();
      setActionFeedback('SUCCESS: Counter-intelligence disinformation broadcasted worldwide. Tension mitigated.');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleExecuteFreeze = () => {
    if (intel < 500) {
      setActionFeedback('INSUFFICIENT INTEL: 500 TB required to freeze crisis lifespan.');
      setTimeout(() => setActionFeedback(null), 3500);
      return;
    }
    if (onFreezeEvent) {
      onFreezeEvent();
      setActionFeedback('SUCCESS: Crisis stabilized. Event lifespan frozen for the next 3 completed missions.');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text flex items-center gap-2">
            <RadioTower className="w-6 h-6 text-emerald-400" />
            {'>>'} GLOBAL_NEWSWIRE // CRISIS_DESK
          </h2>
          <p className="text-xs text-emerald-500/70 mt-1">
            Real-time geopolitical intercepts, macroeconomic shocks, and tactical multiplier management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTriggerEvent}
            className="px-3 py-1.5 border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> [ INTERCEPT TRANSMISSION ]
          </button>
          {activeEvent && (
            <button
              onClick={onClearEvent}
              className="px-3 py-1.5 border border-zinc-700 hover:border-red-500/60 text-zinc-400 hover:text-red-400 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              [ DISMISS EVENT ]
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500 text-emerald-300 text-xs animate-pulse">
          {'>'} {actionFeedback}
        </div>
      )}

      {/* Main Active Crisis Dossier */}
      {activeEvent ? (
        (() => {
          const theme = getCategoryTheme(activeEvent.category);
          const progressPercent = Math.min(
            100,
            Math.max(0, Math.floor((timeLeft / activeEvent.durationSeconds) * 100))
          );

          return (
            <div className={`relative bg-black border-2 ${isFrozen ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]' : theme.border} p-4 sm:p-5 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.8)]`}>
              {/* Event Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 border ${isFrozen ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : `${theme.border} ${theme.bg}`}`}>
                    {isFrozen ? <Snowflake className="w-5 h-5 text-cyan-400" /> : theme.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {isFrozen ? (
                        <span className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 border border-cyan-400 bg-cyan-500/20 text-cyan-200 flex items-center gap-1">
                          <Snowflake className="w-3 h-3" /> CRISIS FROZEN // {freezeMissionsRemaining} OPS BUFFER
                        </span>
                      ) : (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <span className={`text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 border ${theme.badge}`}>
                            LIVE CRISIS // {activeEvent.category.toUpperCase()} SECTOR
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold tracking-widest mt-1 ${isFrozen ? 'text-cyan-300 glow-text' : `${theme.text} glow-text`}`}>
                      {activeEvent.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-black border border-emerald-500/30 px-3 py-2 flex items-center gap-3 self-start md:self-center">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase tracking-widest">
                      {isFrozen ? 'STABILIZATION BUFFER' : 'TRANSMISSION WINDOW'}
                    </span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {isFrozen ? (
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <Snowflake className="w-3.5 h-3.5" /> {freezeMissionsRemaining} Missions Left
                        </span>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-emerald-400" /> {timeLeft}s remaining
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline and Sitrep */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 border border-emerald-500/20">
                <div className="text-[11px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-emerald-400" /> SITUATION REPORT:
                </div>
                <p className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide">
                  "{activeEvent.headline}"
                </p>
                <p className="text-xs text-emerald-400/80 leading-relaxed pt-0.5">
                  {activeEvent.description}
                </p>
              </div>

              {/* Global Modifiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-black border border-emerald-500/30 p-3">
                  <div className="text-[10px] text-zinc-400 tracking-widest uppercase">CONTRACT CREDIT YIELD</div>
                  <div className="flex items-center gap-2 mt-1">
                    {activeEvent.creditMultiplier >= 1 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-base font-bold ${activeEvent.creditMultiplier >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                      x{activeEvent.creditMultiplier.toFixed(2)} Multiplier
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {activeEvent.creditMultiplier >= 1 ? 'Increased bounty payouts' : 'Contract pay reduced by embargoes'}
                  </div>
                </div>

                <div className="bg-black border border-emerald-500/30 p-3">
                  <div className="text-[10px] text-zinc-400 tracking-widest uppercase">INTEL HARVEST RATE</div>
                  <div className="flex items-center gap-2 mt-1">
                    {activeEvent.intelMultiplier >= 1 ? (
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-base font-bold ${activeEvent.intelMultiplier >= 1 ? 'text-cyan-400' : 'text-red-400'}`}>
                      x{activeEvent.intelMultiplier.toFixed(2)} Multiplier
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {activeEvent.intelMultiplier >= 1 ? 'High data leak vulnerability' : 'Signal noise & decryption lag'}
                  </div>
                </div>

                <div className="bg-black border border-emerald-500/30 p-3">
                  <div className="text-[10px] text-zinc-400 tracking-widest uppercase">GLOBAL TENSION DELTA</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className={`w-4 h-4 ${activeEvent.tensionChange >= 0 ? 'text-amber-400' : 'text-blue-400'}`} />
                    <span className={`text-base font-bold ${activeEvent.tensionChange >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {activeEvent.tensionChange >= 0 ? `+${activeEvent.tensionChange}% Escalation` : `${activeEvent.tensionChange}% De-escalation`}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Direct impact on alert state
                  </div>
                </div>
              </div>

              {/* Progress Countdown Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                  <span>EVENT LIFESPAN</span>
                  <span>{isFrozen ? `STABILIZED (3-MISSION LOCK)` : `${progressPercent}% REMAINING`}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 overflow-hidden border border-emerald-500/30">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isFrozen ? 'bg-cyan-400' : progressPercent > 25 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${isFrozen ? 100 : progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Syndicate Tactical Actions */}
              <div className="border-t border-emerald-500/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-400">
                  TACTICAL RESPONSE PROTOCOLS:
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Freeze Button: 500 Intel */}
                  <button
                    onClick={handleExecuteFreeze}
                    disabled={intel < 500 || isFrozen}
                    className={`flex-1 sm:flex-initial px-4 py-2 border text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 ${
                      isFrozen 
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 opacity-80 cursor-default'
                        : intel >= 500 
                          ? 'border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                          : 'border-zinc-800 text-zinc-600 bg-zinc-950 cursor-not-allowed'
                    }`}
                  >
                    <Snowflake className="w-4 h-4" />
                    {isFrozen 
                      ? `[ CRISIS FROZEN: ${freezeMissionsRemaining} OPS REMAINING ]` 
                      : `[ FREEZE CRISIS // 3 OPS (500 INTEL) ]`}
                  </button>

                  {/* Disinfo Campaign Button */}
                  <button
                    onClick={handleBroadcastDisinfo}
                    disabled={intel < 50}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-blue-500/60 bg-blue-500/10 hover:bg-blue-500 hover:text-black text-blue-400 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    [ DISINFO CAMPAIGN (-50 INTEL) ]
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* Nominal State Card */
        <div className="bg-black border border-emerald-500/40 p-8 text-center space-y-4 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <div className="w-16 h-16 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto bg-emerald-500/10 text-emerald-400">
            <Radio className="w-8 h-8 animate-pulse text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-400 tracking-widest">
              GEOPOLITICAL FREQUENCIES NOMINAL
            </h3>
            <p className="text-xs text-emerald-500/70 mt-1 max-w-md mx-auto">
              No active global crisis is currently modifying mission multipliers. Standard economic reward baselines (1.0x) apply across all contracts.
            </p>
          </div>
          <button
            onClick={onTriggerEvent}
            className="px-6 py-2.5 border border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 font-bold text-xs tracking-widest uppercase transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> [ INTERCEPT TRANSMISSION NOW ]
          </button>
        </div>
      )}

      {/* Global Status Thermometer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black border border-emerald-500/30 p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" /> GLOBAL TENSION INDEX
            </span>
            <span className={`font-bold ${tension > 70 ? 'text-red-400' : tension > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {tension}%
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-2 border border-emerald-500/20">
            <div
              className={`h-full ${
                tension > 70 ? 'bg-red-500' : tension > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${tension}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500">
            Higher tension increases global contract frequency and hazard bonuses.
          </div>
        </div>

        <div className="bg-black border border-emerald-500/30 p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" /> SYNDICATE THREAT ASSESSMENT
            </span>
            <span className="font-bold text-cyan-400">DEFCON 3</span>
          </div>
          <p className="text-[11px] text-emerald-500/70">
            Active monitoring across 142 secure diplomatic cables. Black-market trade channels open.
          </p>
        </div>
      </div>

      {/* Historical Wire Log */}
      <div className="bg-black border border-emerald-500/30 p-5 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-500/20 pb-3">
          <History className="w-4 h-4" />
          <h3 className="font-bold text-sm tracking-widest uppercase">HISTORICAL CRISIS INTERCEPTS</h3>
        </div>

        {eventHistory.length > 0 ? (
          <div className="space-y-3">
            {eventHistory.slice(0, 8).map((evt, idx) => (
              <div
                key={evt.id + idx}
                className="bg-zinc-950/60 border border-emerald-500/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono hover:border-emerald-500/30 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 border border-emerald-500/30 text-[10px] text-emerald-400 bg-emerald-500/10">
                      {evt.category.toUpperCase()}
                    </span>
                    <span className="font-bold text-zinc-200">{evt.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">"{evt.headline}"</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center text-[10px]">
                  <span className="px-2 py-0.5 border border-emerald-500/30 text-emerald-300">
                    CR: x{evt.creditMultiplier.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 border border-cyan-500/30 text-cyan-300">
                    INT: x{evt.intelMultiplier.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600 italic">No past crisis events archived in current session.</p>
        )}
      </div>
    </div>
  );
};
