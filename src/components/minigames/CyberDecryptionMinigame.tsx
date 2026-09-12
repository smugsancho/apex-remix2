import React, { useState, useEffect } from 'react';
import { TerminalSquare, Cpu, Key, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CyberDecryptionMinigameProps {
  onStageComplete: (scoreBonus: number, hpRemaining: number) => void;
  missionTitle: string;
  stageNumber?: number;
  totalStages?: number;
}

const HEX_CHARS = ['0x4F', '0x9A', '0xBC', '0x1D', '0x7E', '0x33', '0xEE', '0x5A'];

export const CyberDecryptionMinigame: React.FC<CyberDecryptionMinigameProps> = ({
  onStageComplete,
  missionTitle,
  stageNumber = 1,
  totalStages = 1,
}) => {
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [availableNodes, setAvailableNodes] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(14);
  const [status, setStatus] = useState<'hacking' | 'success' | 'failure'>('hacking');

  // Initialize targets and randomized choices
  useEffect(() => {
    const seqLength = 4;
    const seq: string[] = [];
    for (let i = 0; i < seqLength; i++) {
      seq.push(HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]);
    }
    setTargetSequence(seq);

    // Shuffle hex pool for nodes
    const pool = [...HEX_CHARS].sort(() => Math.random() - 0.5);
    setAvailableNodes(pool);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (status !== 'hacking') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setStatus('failure');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleSelectNode = (hex: string) => {
    if (status !== 'hacking') return;

    const nextSeq = [...playerSequence, hex];
    const currentIndex = playerSequence.length;

    // Check if correct hex chosen
    if (hex !== targetSequence[currentIndex]) {
      // Wrong hex -> Penalty: reset sequence or fail
      setPlayerSequence([]);
      setTimeLeft(t => Math.max(1, t - 2));
      return;
    }

    setPlayerSequence(nextSeq);

    if (nextSeq.length === targetSequence.length) {
      setStatus('success');
    }
  };

  const handleFinish = () => {
    const scoreBonus = status === 'success' ? (160 + timeLeft * 10) : 30;
    onStageComplete(scoreBonus, status === 'success' ? 95 : 30);
  };

  return (
    <div className="bg-black border-2 border-cyan-500/80 p-5 shadow-[0_0_25px_rgba(6,182,212,0.25)] font-mono text-xs select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
            <TerminalSquare className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <div className="font-bold tracking-widest text-cyan-400 text-sm">
              QUANTUM ICE DECRYPTION // CORE INFILTRATION
            </div>
            <div className="text-[10px] text-cyan-500/70">
              STAGE {stageNumber}/{totalStages} : {missionTitle.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="border border-cyan-500/50 px-3 py-1 bg-cyan-950/40 text-cyan-300 font-bold">
          FIREWALL BREACH IN: {timeLeft}s
        </div>
      </div>

      {/* Target Sequence Display */}
      <div className="mb-4 bg-zinc-950 border border-cyan-500/30 p-3 space-y-2">
        <div className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center justify-between">
          <span>REQUIRED CRYPTOGRAPHIC SEQUENCE:</span>
          <span>{playerSequence.length} / {targetSequence.length} MATCHED</span>
        </div>

        <div className="flex gap-2 justify-center py-2">
          {targetSequence.map((targetHex, idx) => {
            const isFilled = idx < playerSequence.length;
            const isCurrent = idx === playerSequence.length;

            return (
              <div
                key={idx}
                className={`px-4 py-2 border font-bold text-sm tracking-widest ${
                  isFilled
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_#10b981]'
                    : isCurrent
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300 animate-pulse'
                      : 'border-zinc-800 bg-black text-zinc-600'
                }`}
              >
                {isFilled ? targetHex : isCurrent ? '??' : '__'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Hex Nodes */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {availableNodes.map((hex, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectNode(hex)}
            disabled={status !== 'hacking'}
            className="py-3 px-2 bg-zinc-950 border border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-300 text-cyan-400 font-bold tracking-widest text-xs active:scale-95 transition-all shadow-[0_0_8px_rgba(6,182,212,0.1)]"
          >
            [ {hex} ]
          </button>
        ))}
      </div>

      {/* Outcome */}
      {status !== 'hacking' && (
        <div className="bg-zinc-950 border border-cyan-500/50 p-4 text-center space-y-2">
          {status === 'success' ? (
            <>
              <div className="text-emerald-400 font-bold text-base tracking-widest glow-text">
                [ QUANTUM ICE BREACHED // DATA CIPHER DECRYPTED ]
              </div>
              <div className="text-zinc-300 text-xs">
                Zero-day exploit successfully disabled automated defense protocols.
              </div>
              <div className="text-cyan-400 font-bold text-xs">
                +{(160 + timeLeft * 10)} SQUAD COMBAT POWER BONUS
              </div>
            </>
          ) : (
            <>
              <div className="text-red-500 font-bold text-base tracking-widest">
                [ ICE LOCKDOWN DETECTED // CIPHER TRACE COMPROMISED ]
              </div>
              <div className="text-zinc-400 text-xs">
                Emergency disconnect initiated to prevent counter-trace.
              </div>
            </>
          )}

          <button
            onClick={handleFinish}
            className="mt-3 px-6 py-2.5 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-cyan-400 text-xs transition-colors"
          >
            {stageNumber < totalStages ? `[ PROCEED TO STAGE ${stageNumber + 1} >> ]` : '[ ADVANCE SIMULATION >> ]'}
          </button>
        </div>
      )}
    </div>
  );
};
