import React, { useState, useEffect } from 'react';
import { ShieldAlert, Compass, Footprints, AlertTriangle, CheckCircle2, Skull } from 'lucide-react';

interface MinefieldMinigameProps {
  onStageComplete: (scoreBonus: number, hpRemaining: number) => void;
  missionTitle: string;
  stageNumber?: number;
  totalStages?: number;
}

const GRID_SIZE = 5; // 5x5 grid

export const MinefieldMinigame: React.FC<MinefieldMinigameProps> = ({
  onStageComplete,
  missionTitle,
  stageNumber = 1,
  totalStages = 1,
}) => {
  // Start at bottom row (4, 2), Goal is any tile on top row (0, x)
  const [squadPos, setSquadPos] = useState<{ r: number; c: number }>({ r: 4, c: 2 });
  const [squadHp, setSquadHp] = useState<number>(100);
  const [disarmKits, setDisarmKits] = useState<number>(2);
  const [timeRemaining, setTimeRemaining] = useState<number>(25);
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({ '4-2': true });
  const [mines, setMines] = useState<{ [key: string]: boolean }>({});
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Initialize mines (random 6 mines avoiding start tile)
  useEffect(() => {
    const newMines: { [key: string]: boolean } = {};
    let placed = 0;
    while (placed < 6) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const key = `${r}-${c}`;
      if (key !== '4-2' && !newMines[key]) {
        newMines[key] = true;
        placed++;
      }
    }
    setMines(newMines);
  }, []);

  // Proximity sensor: count mines in adjacent tiles
  const getProximitySensor = (r: number, c: number) => {
    let count = 0;
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    deltas.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        if (mines[`${nr}-${nc}`]) count++;
      }
    });
    return count;
  };

  // Move squad to adjacent cell
  const handleMove = (targetR: number, targetC: number) => {
    if (status !== 'playing') return;

    // Check if tile is orthogonally adjacent to current position
    const dist = Math.abs(targetR - squadPos.r) + Math.abs(targetC - squadPos.c);
    if (dist !== 1) return;

    const key = `${targetR}-${targetC}`;
    setSquadPos({ r: targetR, c: targetC });
    setRevealed(prev => ({ ...prev, [key]: true }));

    // Check mine hit
    if (mines[key]) {
      if (disarmKits > 0) {
        // Disarmed using Sapper kit!
        setDisarmKits(k => k - 1);
        setSquadHp(hp => Math.max(0, hp - 15));
      } else {
        // Full detonation damage
        const nextHp = Math.max(0, squadHp - 45);
        setSquadHp(nextHp);
        if (nextHp <= 0) {
          setStatus('lost');
          return;
        }
      }
    }

    // Check victory condition (reached extraction row 0)
    if (targetR === 0) {
      setStatus('won');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          setStatus('lost');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleFinish = () => {
    const scoreBonus = status === 'won' ? (180 + disarmKits * 40 + Math.floor(squadHp * 1.2)) : 30;
    onStageComplete(scoreBonus, squadHp);
  };

  const currentProximity = getProximitySensor(squadPos.r, squadPos.c);

  return (
    <div className="bg-black border-2 border-emerald-500/80 p-5 shadow-[0_0_25px_rgba(16,185,129,0.25)] font-mono text-xs select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-emerald-500/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
            <Footprints className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <div className="font-bold tracking-widest text-emerald-400 text-sm">
              TACTICAL MINEFIELD ROUTING // SAPPER ADVANCE
            </div>
            <div className="text-[10px] text-emerald-500/70">
              STAGE {stageNumber}/{totalStages} : {missionTitle.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-cyan-400">
            DISARM KITS: <strong className="text-white">{disarmKits}</strong>
          </div>
          <div className="border border-emerald-500/50 px-3 py-1 bg-emerald-950/40 text-emerald-300 font-bold">
            SCANNER T-MINUS: {timeRemaining}s
          </div>
        </div>
      </div>

      {/* Proximity Telemetry Bar */}
      <div className="mb-4 bg-zinc-950 border border-emerald-500/30 p-2.5 flex justify-between items-center text-xs">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin" /> PROXIMITY SONAR READING:
        </span>
        <span className={`px-2 py-0.5 font-bold uppercase tracking-wider ${
          currentProximity === 0 ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/50' :
          currentProximity === 1 ? 'text-amber-400 bg-amber-500/20 border border-amber-500/50' :
          'text-red-400 bg-red-500/20 border border-red-500/50 animate-pulse'
        }`}>
          {currentProximity === 0 ? '● SAFE CORRIDOR (0 MINES)' : currentProximity === 1 ? '▲ WARNING: 1 ADJACENT MINE' : '☠ CRITICAL: MULTIPLE MINES NEARBY'}
        </span>
      </div>

      {/* Minefield Grid */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="text-[10px] text-emerald-400/80 uppercase tracking-widest">
          ▲ EXTRACTION ZONE (TOP ROW) ▲
        </div>

        <div className="grid grid-cols-5 gap-2 bg-zinc-950 p-4 border-2 border-emerald-500/40">
          {Array.from({ length: GRID_SIZE }).map((_, r) => (
            <div key={r} className="contents">
              {Array.from({ length: GRID_SIZE }).map((_, c) => {
                const key = `${r}-${c}`;
                const isSquad = squadPos.r === r && squadPos.c === c;
                const isAdjacent = Math.abs(r - squadPos.r) + Math.abs(c - squadPos.c) === 1;
                const isRevealed = revealed[key];
                const hasMine = mines[key];
                const prox = getProximitySensor(r, c);

                return (
                  <button
                    key={key}
                    onClick={() => handleMove(r, c)}
                    disabled={!isAdjacent || status !== 'playing'}
                    className={`w-14 h-14 border flex flex-col items-center justify-center transition-all relative ${
                      isSquad 
                        ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-[0_0_12px_#10b981] z-10' 
                        : isAdjacent 
                          ? 'border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-500/20 hover:border-emerald-300 cursor-pointer animate-pulse'
                          : isRevealed 
                            ? 'border-zinc-800 bg-zinc-900/60 opacity-60' 
                            : 'border-zinc-800/80 bg-black/80'
                    }`}
                  >
                    {isSquad ? (
                      <div className="flex flex-col items-center">
                        <Footprints className="w-5 h-5 text-emerald-300" />
                        <span className="text-[8px] font-bold">SQUAD</span>
                      </div>
                    ) : isRevealed ? (
                      hasMine ? (
                        <Skull className="w-5 h-5 text-red-500 animate-bounce" />
                      ) : (
                        <span className={`text-xs font-bold ${prox === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {prox}
                        </span>
                      )
                    ) : isAdjacent ? (
                      <span className="text-[9px] text-emerald-400/80 font-mono tracking-tighter">[STEP]</span>
                    ) : (
                      <span className="text-zinc-800 text-[9px] font-mono">·</span>
                    )}

                    {r === 0 && (
                      <div className="absolute top-0.5 right-0.5 text-[6px] text-emerald-500/60">GOAL</div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
          ▼ SQUAD INGRESS DEPLOYMENT (ROW 4) ▼
        </div>
      </div>

      {/* Outcome Banner */}
      {status !== 'playing' && (
        <div className="bg-zinc-950 border border-emerald-500/50 p-4 text-center space-y-2">
          {status === 'won' ? (
            <>
              <div className="text-emerald-400 font-bold text-base tracking-widest glow-text">
                [ EXTRACTION LINE SECURED // FIELD CLEARED ]
              </div>
              <div className="text-zinc-300 text-xs">
                Sapper team navigated the seismic minefield safely with minimal casualties.
              </div>
              <div className="text-cyan-400 font-bold text-xs">
                +{(180 + disarmKits * 40 + Math.floor(squadHp * 1.2))} SQUAD COMBAT POWER BONUS
              </div>
            </>
          ) : (
            <>
              <div className="text-red-500 font-bold text-base tracking-widest">
                [ DETONATION CASUALTIES // EXTRACTION ABORTED ]
              </div>
              <div className="text-zinc-400 text-xs">
                Squad triggered seismic charges. Emergency medevac initiated.
              </div>
            </>
          )}

          <button
            onClick={handleFinish}
            className="mt-3 px-6 py-2.5 bg-emerald-500 text-black font-bold uppercase tracking-widest hover:bg-emerald-400 text-xs transition-colors"
          >
            {stageNumber < totalStages ? `[ PROCEED TO STAGE ${stageNumber + 1} >> ]` : '[ ADVANCE SIMULATION >> ]'}
          </button>
        </div>
      )}
    </div>
  );
};
