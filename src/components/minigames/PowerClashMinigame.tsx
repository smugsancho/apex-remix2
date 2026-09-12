import React, { useState, useEffect, useRef } from 'react';
import { Swords, ShieldAlert, Zap, Target } from 'lucide-react';

interface PowerClashMinigameProps {
  onStageComplete: (scoreBonus: number, hpRemaining: number) => void;
  missionTitle: string;
  stageNumber?: number;
  totalStages?: number;
}

export const PowerClashMinigame: React.FC<PowerClashMinigameProps> = ({
  onStageComplete,
  missionTitle,
  stageNumber = 1,
  totalStages = 1,
}) => {
  // Phase 1: Precision Timing Strikes (3 rounds)
  // Phase 2: Overpower Mash Surge (push power bar past 100%)
  const [phase, setPhase] = useState<'parry' | 'overpower' | 'finished'>('parry');
  const [parryHits, setParryHits] = useState<number>(0);
  const [parryTargetPos, setParryTargetPos] = useState<number>(50); // sweet spot target %
  const [indicatorPos, setIndicatorPos] = useState<number>(0);
  const [indicatorDir, setIndicatorDir] = useState<number>(1);
  const [overpowerProgress, setOverpowerProgress] = useState<number>(35); // 0 to 100
  const [mashTimer, setMashTimer] = useState<number>(6);
  const [flashFeedback, setFlashFeedback] = useState<'hit' | 'miss' | null>(null);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Oscillating indicator for Phase 1 (Parry / Precision Strike)
  useEffect(() => {
    if (phase !== 'parry') return;

    const interval = setInterval(() => {
      setIndicatorPos(prev => {
        let next = prev + indicatorDir * 2.8;
        if (next >= 100) {
          setIndicatorDir(-1);
          return 100;
        } else if (next <= 0) {
          setIndicatorDir(1);
          return 0;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [phase, indicatorDir]);

  // Handle precision strike click / space
  const handleStrike = () => {
    if (phase !== 'parry') return;

    const diff = Math.abs(indicatorPos - parryTargetPos);
    if (diff < 12) {
      // Direct hit in sweet spot!
      setFlashFeedback('hit');
      setTimeout(() => setFlashFeedback(null), 200);
      const nextHits = parryHits + 1;
      setParryHits(nextHits);

      if (nextHits >= 3) {
        setPhase('overpower');
        setParryTargetPos(50);
      } else {
        // Randomize next target position
        setParryTargetPos(Math.floor(Math.random() * 60) + 20);
      }
    } else {
      setFlashFeedback('miss');
      setTimeout(() => setFlashFeedback(null), 200);
    }
  };

  // Phase 2: Rapid mash mechanic with enemy resistance decay
  useEffect(() => {
    if (phase !== 'overpower') return;

    // Enemy continuously pushes back
    const decayInterval = setInterval(() => {
      setOverpowerProgress(prev => Math.max(5, prev - 2.2));
    }, 80);

    // Countdown
    const timerInterval = setInterval(() => {
      setMashTimer(prev => {
        if (prev <= 1) {
          setPhase('finished');
          setIsWon(overpowerProgress >= 80);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(decayInterval);
      clearInterval(timerInterval);
    };
  }, [phase, overpowerProgress]);

  // Check if player reaches 100% in Phase 2
  const handleMash = () => {
    if (phase !== 'overpower') return;
    setOverpowerProgress(prev => {
      const next = prev + 8;
      if (next >= 100) {
        setPhase('finished');
        setIsWon(true);
        return 100;
      }
      return next;
    });
  };

  // Spacebar triggers strike or mash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'parry') handleStrike();
        else if (phase === 'overpower') handleMash();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, indicatorPos, parryTargetPos]);

  const handleFinish = () => {
    const scoreBonus = isWon ? 240 : 40;
    onStageComplete(scoreBonus, isWon ? 90 : 25);
  };

  return (
    <div className="bg-black border-2 border-amber-500/80 p-5 shadow-[0_0_25px_rgba(245,158,11,0.25)] font-mono text-xs select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-amber-500/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-500/20 text-amber-400 border border-amber-500/50">
            <Swords className="w-4 h-4 animate-bounce" />
          </span>
          <div>
            <div className="font-bold tracking-widest text-amber-400 text-sm">
              TACTICAL POWER CLASH // ELITE INTERCEPT
            </div>
            <div className="text-[10px] text-amber-500/70">
              STAGE {stageNumber}/{totalStages} : {missionTitle.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest">CLASH PHASE: </span>
          <span className="font-bold text-amber-300">
            {phase === 'parry' ? `TARGET LOCK (${parryHits}/3)` : phase === 'overpower' ? `OVERPOWER SURGE` : 'RESOLVED'}
          </span>
        </div>
      </div>

      {/* Main Arena */}
      <div className="relative bg-zinc-950 border border-amber-500/30 p-6 min-h-[220px] flex flex-col justify-center items-center">
        {phase === 'parry' && (
          <div className="w-full max-w-lg space-y-6 text-center">
            <div className="text-amber-300 text-xs tracking-wider flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-emerald-400 animate-spin" />
              TIMING LOCK: ALIGN OSCILLATOR WITH GREEN CRITICAL ZONE (STRIKES: {parryHits}/3)
            </div>

            {/* Oscillating Bar */}
            <div className={`relative h-12 bg-black border-2 transition-colors ${
              flashFeedback === 'hit' ? 'border-emerald-400 bg-emerald-950/40' : flashFeedback === 'miss' ? 'border-red-500 bg-red-950/40' : 'border-amber-500/50'
            }`}>
              {/* Sweet spot target */}
              <div 
                className="absolute top-0 bottom-0 bg-emerald-500/40 border-x-2 border-emerald-400 flex items-center justify-center"
                style={{ left: `${parryTargetPos - 8}%`, width: '16%' }}
              >
                <span className="text-[8px] text-emerald-300 font-bold uppercase tracking-tighter">CRIT ZONE</span>
              </div>

              {/* Moving Indicator */}
              <div 
                className="absolute top-0 bottom-0 w-3 bg-amber-400 border border-white shadow-[0_0_12px_#f59e0b] -translate-x-1/2"
                style={{ left: `${indicatorPos}%` }}
              />
            </div>

            <button
              onClick={handleStrike}
              className="w-full py-4 bg-amber-500 text-black font-bold uppercase tracking-widest text-sm hover:bg-amber-400 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
            >
              [ ENGAGE TACTICAL PARRY // PRESS SPACEBAR ]
            </button>
          </div>
        )}

        {phase === 'overpower' && (
          <div className="w-full max-w-lg space-y-4 text-center">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-400 font-bold tracking-wider flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-300 animate-pulse" /> SQUAD KINETIC OVERLOAD
              </span>
              <span className="border border-red-500/50 px-2 py-0.5 text-red-400 font-bold">
                BURST TIMER: {mashTimer}s
              </span>
            </div>

            {/* Overpower Bar */}
            <div className="h-8 w-full bg-black border-2 border-amber-500/60 p-1 relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] transition-all duration-75"
                style={{ width: `${overpowerProgress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white drop-shadow">
                {Math.round(overpowerProgress)}% OVERPOWER GAUGE
              </div>
            </div>

            <button
              onClick={handleMash}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 text-black font-extrabold uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-transform animate-pulse"
            >
              [ MASH TO OVERPOWER // SPACEBAR OR CLICK ]
            </button>
          </div>
        )}

        {phase === 'finished' && (
          <div className="text-center space-y-4 py-4">
            {isWon ? (
              <>
                <div className="text-emerald-400 font-bold text-base tracking-widest glow-text">
                  [ ENEMY COMMANDER NEUTRALIZED // ARMOR BREACHED ]
                </div>
                <div className="text-zinc-300 text-xs">
                  Flawless parry and kinetic overload crushed defensive perimeter.
                </div>
                <div className="text-cyan-400 font-bold text-xs">
                  +240 SQUAD COMBAT POWER BONUS
                </div>
              </>
            ) : (
              <>
                <div className="text-red-500 font-bold text-base tracking-widest">
                  [ KINETIC STALEMATE // RETREAT TO COVER ]
                </div>
                <div className="text-zinc-400 text-xs">
                  Overpower threshold not met. Defensive line fell back safely.
                </div>
              </>
            )}

            <button
              onClick={handleFinish}
              className="mt-4 px-6 py-2.5 bg-amber-500 text-black font-bold uppercase tracking-widest hover:bg-amber-400 text-xs transition-colors"
            >
              {stageNumber < totalStages ? `[ PROCEED TO STAGE ${stageNumber + 1} >> ]` : '[ ADVANCE SIMULATION >> ]'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
