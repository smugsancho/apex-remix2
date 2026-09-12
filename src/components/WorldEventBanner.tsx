import React, { useState, useEffect } from 'react';
import { WorldEvent } from '../types';
import { Globe, AlertTriangle, TrendingUp, TrendingDown, Cpu, ShieldAlert, Radio, Clock, Zap, Snowflake } from 'lucide-react';

interface WorldEventBannerProps {
  event: WorldEvent | null;
  compact?: boolean;
  freezeMissionsRemaining?: number;
  onFreezeEvent?: () => void;
  intel?: number;
}

export const WorldEventBanner: React.FC<WorldEventBannerProps> = ({ 
  event, 
  compact = false,
  freezeMissionsRemaining = 0,
  onFreezeEvent,
  intel = 0
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const isFrozen = freezeMissionsRemaining > 0;

  useEffect(() => {
    if (!event) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((event.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    if (compact) return null;
    return (
      <div className="bg-black border border-emerald-500/20 p-4 text-xs font-mono text-emerald-500/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 animate-pulse text-emerald-500/40" />
          <span>GEOPOLITICAL STATUS: NOMINAL // SCANNING FOR GLOBAL CRISES...</span>
        </div>
        <span className="text-zinc-600">[ ALL REWARD MULTIPLIERS NORMAL (1.0x) ]</span>
      </div>
    );
  }

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

  const theme = getCategoryTheme(event.category);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.floor((timeLeft / event.durationSeconds) * 100))
  );

  if (compact) {
    return (
      <div className={`border ${isFrozen ? 'border-cyan-400 bg-cyan-950/30' : `${theme.border} ${theme.bg}`} p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-[0_0_12px_rgba(0,0,0,0.5)]`}>
        <div className="flex items-center gap-2 min-w-[220px]">
          {isFrozen ? (
            <Snowflake className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
          <span className={`font-bold tracking-wider ${isFrozen ? 'text-cyan-300' : theme.text}`}>
            WORLD EVENT: {event.title}
          </span>
          {isFrozen && (
            <span className="text-[10px] px-1.5 py-0.5 border border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold">
              [ FROZEN: {freezeMissionsRemaining} MISSIONS ]
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 border text-[10px] font-bold ${
              event.creditMultiplier >= 1 ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' : 'border-red-500/50 text-red-300 bg-red-500/10'
            }`}>
              CREDITS: x{event.creditMultiplier.toFixed(2)}
            </span>
            <span className={`px-2 py-0.5 border text-[10px] font-bold ${
              event.intelMultiplier >= 1 ? 'border-blue-500/50 text-blue-300 bg-blue-500/10' : 'border-red-500/50 text-red-300 bg-red-500/10'
            }`}>
              INTEL: x{event.intelMultiplier.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
            {isFrozen ? (
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5" /> {freezeMissionsRemaining} Ops Left
              </span>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold text-white">{timeLeft}s</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black border-2 ${isFrozen ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]' : theme.border} p-5 font-mono shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 border ${isFrozen ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : `${theme.border} ${theme.bg}`}`}>
            {isFrozen ? <Snowflake className="w-5 h-5 text-cyan-400" /> : theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isFrozen ? (
                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 border border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold flex items-center gap-1">
                  <Snowflake className="w-3 h-3" /> STABILIZED CRISIS // {freezeMissionsRemaining} MISSIONS REMAINING
                </span>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className={`text-[10px] tracking-widest uppercase px-1.5 py-0.5 border ${theme.badge}`}>
                    {event.category} EVENT // LIVE INTERCEPT
                  </span>
                </>
              )}
            </div>
            <h3 className={`text-lg font-bold tracking-widest mt-1 ${isFrozen ? 'text-cyan-300 glow-text' : `${theme.text} glow-text`}`}>
              {event.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {onFreezeEvent && !isFrozen && (
            <button
              onClick={onFreezeEvent}
              disabled={intel < 500}
              className={`px-3 py-1.5 border font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                intel >= 500 
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                  : 'border-zinc-800 text-zinc-600 bg-zinc-950 cursor-not-allowed'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" /> [ FREEZE CRISIS // 3 OPS (500 INTEL) ]
            </button>
          )}

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-widest">
              {isFrozen ? 'STABILIZATION BUFFER' : 'CRISIS WINDOW'}
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-1 justify-end">
              {isFrozen ? (
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Snowflake className="w-4 h-4" /> {freezeMissionsRemaining} Missions
                </span>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-emerald-400" /> {timeLeft}s remaining
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Headline & Description */}
      <div className="mb-4">
        <p className="text-sm font-bold text-zinc-200 mb-1 tracking-wide">
          "{event.headline}"
        </p>
        <p className="text-xs text-emerald-500/70 leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Modifiers & Multipliers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950/60 p-3 border border-emerald-500/20">
        <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 bg-black border border-emerald-500/10">
          <span className="text-[10px] text-zinc-400 tracking-wider">MISSION CREDITS</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {event.creditMultiplier >= 1 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-bold ${event.creditMultiplier >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
              x{event.creditMultiplier.toFixed(2)} Multiplier
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 bg-black border border-emerald-500/10">
          <span className="text-[10px] text-zinc-400 tracking-wider">INTEL HARVEST</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {event.intelMultiplier >= 1 ? (
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-bold ${event.intelMultiplier >= 1 ? 'text-cyan-400' : 'text-red-400'}`}>
              x{event.intelMultiplier.toFixed(2)} Multiplier
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-start p-2 bg-black border border-emerald-500/10">
          <span className="text-[10px] text-zinc-400 tracking-wider">GLOBAL TENSION IMPACT</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Zap className={`w-4 h-4 ${event.tensionChange >= 0 ? 'text-amber-400' : 'text-blue-400'}`} />
            <span className={`text-sm font-bold ${event.tensionChange >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
              {event.tensionChange >= 0 ? `+${event.tensionChange}% Escalation` : `${event.tensionChange}% De-escalation`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1 mt-3 overflow-hidden border border-emerald-500/20">
        <div
          className={`h-full transition-all duration-1000 ${
            isFrozen 
              ? 'bg-cyan-400' 
              : progressPercent > 30 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
          }`}
          style={{ width: `${isFrozen ? 100 : progressPercent}%` }}
        />
      </div>
    </div>
  );
};
