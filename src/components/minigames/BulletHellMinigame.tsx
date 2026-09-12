import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, AlertOctagon, Crosshair } from 'lucide-react';

interface Bullet {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  vx: number;
  vy: number;
  radius: number;
  type: 'plasma' | 'laser' | 'missile';
  color: string;
}

interface PowerOrb {
  x: number;
  y: number;
  id: number;
}

interface BulletHellMinigameProps {
  onStageComplete: (scoreBonus: number, hpRemaining: number) => void;
  missionTitle: string;
  stageNumber?: number;
  totalStages?: number;
}

export const BulletHellMinigame: React.FC<BulletHellMinigameProps> = ({
  onStageComplete,
  missionTitle,
  stageNumber = 1,
  totalStages = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 80 });
  const [shieldHp, setShieldHp] = useState<number>(100);
  const [energyCores, setEnergyCores] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [powerOrbs, setPowerOrbs] = useState<PowerOrb[]>([]);
  const [hitFlash, setHitFlash] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<'won' | 'lost' | null>(null);

  // Handle Mouse / Touch movement across the radar screen
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isGameOver) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setPlayerPos({ x, y });
  };

  // Keyboard controls support (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      setPlayerPos(prev => {
        let { x, y } = prev;
        const step = 4;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') y = Math.max(5, y - step);
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') y = Math.min(95, y + step);
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') x = Math.max(5, x - step);
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') x = Math.min(95, x + step);
        return { x, y };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  // Main Game Loop: Spawn patterns and advance physics
  useEffect(() => {
    if (isGameOver) return;

    let frameId: number;
    let lastSpawn = Date.now();
    let lastOrbSpawn = Date.now();
    let tickCount = 0;

    const gameLoop = () => {
      const now = Date.now();
      tickCount++;

      // Spawn bullet waves
      if (now - lastSpawn > 220) {
        lastSpawn = now;
        const newBullets: Bullet[] = [];
        const patternType = Math.random();

        if (patternType < 0.35) {
          // Circular radial burst from top-center
          const count = 7;
          const originX = 50 + Math.sin(tickCount * 0.1) * 30;
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 0.2) + (i / count) * (Math.PI * 0.6);
            const speed = 1.2 + Math.random() * 0.6;
            newBullets.push({
              x: originX,
              y: 5,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: 2.2,
              type: 'plasma',
              color: '#ef4444' // red
            });
          }
        } else if (patternType < 0.7) {
          // Aimed sniper beam at player's position
          const startX = Math.random() * 90 + 5;
          const dx = playerPos.x - startX;
          const dy = playerPos.y - 5;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = 1.8;
          newBullets.push({
            x: startX,
            y: 5,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            radius: 2.8,
            type: 'laser',
            color: '#f97316' // orange
          });
        } else {
          // Sweeping perimeter barrage from sides
          const fromLeft = Math.random() > 0.5;
          newBullets.push({
            x: fromLeft ? 5 : 95,
            y: Math.random() * 50 + 5,
            vx: fromLeft ? 1.4 : -1.4,
            vy: 0.8 + Math.random() * 0.8,
            radius: 2.5,
            type: 'missile',
            color: '#a855f7' // purple
          });
        }

        setBullets(prev => [...prev, ...newBullets]);
      }

      // Spawn repair energy cores occasionally
      if (now - lastOrbSpawn > 2500) {
        lastOrbSpawn = now;
        setPowerOrbs(prev => [
          ...prev.slice(-3),
          { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, id: Date.now() }
        ]);
      }

      // Update bullets and check collisions
      setBullets(prev => {
        const next: Bullet[] = [];
        let hitOccurred = false;

        for (const b of prev) {
          const nx = b.x + b.vx;
          const ny = b.y + b.vy;

          // Check collision with player
          const distToPlayer = Math.sqrt(Math.pow(nx - playerPos.x, 2) + Math.pow(ny - playerPos.y, 2));
          if (distToPlayer < 4.2) {
            hitOccurred = true;
            continue; // bullet destroyed on hit
          }

          // Keep in bounds
          if (nx >= 0 && nx <= 100 && ny >= 0 && ny <= 100) {
            next.push({ ...b, x: nx, y: ny });
          }
        }

        if (hitOccurred) {
          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 150);
          setShieldHp(hp => {
            const nextHp = Math.max(0, hp - 18);
            if (nextHp <= 0) {
              setIsGameOver(true);
              setOutcome('lost');
            }
            return nextHp;
          });
        }

        return next;
      });

      // Check power orb pickups
      setPowerOrbs(prev => {
        return prev.filter(orb => {
          const dist = Math.sqrt(Math.pow(orb.x - playerPos.x, 2) + Math.pow(orb.y - playerPos.y, 2));
          if (dist < 6.0) {
            setEnergyCores(c => c + 1);
            setShieldHp(hp => Math.min(100, hp + 12));
            return false;
          }
          return true;
        });
      });

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [isGameOver, playerPos]);

  // Countdown Timer
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          setOutcome('won');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleFinish = () => {
    const powerBonus = outcome === 'won' ? (150 + energyCores * 30 + Math.floor(shieldHp * 1.5)) : 20;
    onStageComplete(powerBonus, shieldHp);
  };

  return (
    <div className="bg-black border-2 border-red-500/80 p-5 shadow-[0_0_25px_rgba(239,68,68,0.25)] font-mono text-xs select-none">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-red-500/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-red-500/20 text-red-400 border border-red-500/50">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <div className="font-bold tracking-widest text-red-400 text-sm">
              TACTICAL COMBAT // EVASION RUN
            </div>
            <div className="text-[10px] text-red-500/70">
              STAGE {stageNumber}/{totalStages} : {missionTitle.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>CORES: <strong className="text-white">{energyCores}</strong></span>
          </div>
          <div className="border border-red-500/50 px-3 py-1 bg-red-950/40 text-red-300 font-bold tracking-widest">
            T-MINUS: {timeLeft}s
          </div>
        </div>
      </div>

      {/* Shield HP Bar */}
      <div className="mb-3 space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3 h-3" /> SQUAD KINETIC SHIELD
          </span>
          <span className={shieldHp < 35 ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'}>
            {shieldHp}%
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-950 border border-emerald-500/40 p-0.5">
          <div 
            className={`h-full transition-all duration-150 ${
              shieldHp < 35 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
            }`} 
            style={{ width: `${shieldHp}%` }} 
          />
        </div>
      </div>

      {/* Radar Combat Arena */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`relative h-64 w-full bg-zinc-950 border-2 overflow-hidden cursor-crosshair transition-colors ${
          hitFlash ? 'border-red-500 bg-red-950/40' : 'border-red-500/40 bg-zinc-950'
        }`}
      >
        {/* Radar grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
        
        {/* Radar concentric target circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-red-500/15" />
          <div className="w-24 h-24 rounded-full border border-red-500/20" />
        </div>

        {/* Energy Cores / Pickups */}
        {powerOrbs.map(orb => (
          <div
            key={orb.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400/90 border border-white flex items-center justify-center shadow-[0_0_12px_#22d3ee] animate-pulse"
            style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
          >
            <Zap className="w-2.5 h-2.5 text-black" />
          </div>
        ))}

        {/* Bullets */}
        {bullets.map((b, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.radius * 2.5}px`,
              height: `${b.radius * 2.5}px`,
              backgroundColor: b.color,
              boxShadow: `0 0 8px ${b.color}`
            }}
          />
        ))}

        {/* Player Squad Craft / Reticle */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 pointer-events-none z-10"
          style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-6 h-6 border border-emerald-400 rounded-sm rotate-45 bg-emerald-500/30 flex items-center justify-center shadow-[0_0_10px_#10b981]" />
            <Crosshair className="w-4 h-4 text-emerald-300 absolute" />
          </div>
        </div>

        {/* Overlay Instructions when starting */}
        {timeLeft > 10 && (
          <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 border border-red-500/40 text-[9px] text-red-300 pointer-events-none tracking-wider">
            [ GUIDE: MOVE CURSOR / WASD TO DODGE RED BARRAGE. COLLECT BLUE CORES. ]
          </div>
        )}

        {/* Game End Banner Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20">
            {outcome === 'won' ? (
              <div className="text-center space-y-2">
                <div className="text-emerald-400 font-bold text-base tracking-widest glow-text">
                  [ EVASION VECTOR CLEARED // SURVIVED ]
                </div>
                <div className="text-zinc-300 text-xs">
                  Shield Remaining: {shieldHp}% | Cores Recovered: {energyCores}
                </div>
                <div className="text-cyan-400 font-bold text-xs">
                  +{(150 + energyCores * 30 + Math.floor(shieldHp * 1.5))} SQUAD COMBAT POWER BONUS
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-red-500 font-bold text-base tracking-widest">
                  [ SHIELD COLLAPSE // HULL CRITICAL ]
                </div>
                <div className="text-zinc-400 text-xs">
                  Countermeasures sustained heavy damage. Tactical extraction underway.
                </div>
              </div>
            )}
            <button
              onClick={handleFinish}
              className="mt-4 px-6 py-2.5 bg-emerald-500 text-black font-bold uppercase tracking-widest hover:bg-emerald-400 text-xs transition-colors"
            >
              {stageNumber < totalStages ? `[ PROCEED TO STAGE ${stageNumber + 1} >> ]` : '[ ADVANCE SIMULATION >> ]'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
