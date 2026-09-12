import React, { useState, useEffect, useRef } from 'react';
import { AssistantMessage, TabType } from '../types';
import { 
  Bot, 
  Radio, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  History, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Coins, 
  Crosshair,
  Zap
} from 'lucide-react';

interface TacticalAssistantProps {
  currentMessage: AssistantMessage | null;
  messageHistory: AssistantMessage[];
  onDismiss: () => void;
  onNavigateTab: (tab: TabType) => void;
  onRequestBriefing: () => void;
  unreadCount?: number;
}

// Procedural audio synthesizer chirp using Web Audio API
const playSynthChirp = (type: AssistantMessage['type']) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.04, now);

    if (type === 'alert') {
      // High alert dual-chirp
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'success') {
      // Triumphant ascending arpeggio
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Soft high-tech data telemetry chirp
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch {
    // Audio contexts may be blocked by autoplay policies until user interaction
  }
};

export const TacticalAssistant: React.FC<TacticalAssistantProps> = ({
  currentMessage,
  messageHistory,
  onDismiss,
  onNavigateTab,
  onRequestBriefing
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('apex_assistant_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const lastPlayedIdRef = useRef<string | null>(null);
  const lastDismissedIdRef = useRef<string | null>(null);

  // Play chirp on new transmission and reset timer
  useEffect(() => {
    if (currentMessage && currentMessage.id !== lastPlayedIdRef.current) {
      lastPlayedIdRef.current = currentMessage.id;
      setIsMinimized(false);
      setTimeRemaining(100);
      if (!isMuted) {
        playSynthChirp(currentMessage.type);
      }
    }
  }, [currentMessage, isMuted]);

  // Auto-dismiss countdown timer (pure state update, no side-effects in reducer)
  useEffect(() => {
    if (!currentMessage || isPaused || currentMessage.type === 'alert') {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 2));
    }, 240);

    return () => clearInterval(interval);
  }, [currentMessage, isPaused]);

  // Trigger onDismiss cleanly in an effect once countdown reaches zero
  useEffect(() => {
    if (
      timeRemaining <= 0 &&
      currentMessage &&
      currentMessage.type !== 'alert' &&
      lastDismissedIdRef.current !== currentMessage.id
    ) {
      lastDismissedIdRef.current = currentMessage.id;
      onDismiss();
    }
  }, [timeRemaining, currentMessage, onDismiss]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('apex_assistant_muted', String(next));
      } catch {}
      return next;
    });
  };

  const getBorderAndBadge = (type: AssistantMessage['type']) => {
    switch (type) {
      case 'alert':
        return {
          border: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/50',
          titleColor: 'text-red-400',
          icon: <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />,
          statusColor: 'text-red-400'
        };
      case 'success':
        return {
          border: 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          titleColor: 'text-emerald-300',
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
          statusColor: 'text-emerald-400'
        };
      case 'warning':
        return {
          border: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          titleColor: 'text-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          statusColor: 'text-amber-400'
        };
      case 'intel':
        return {
          border: 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
          titleColor: 'text-cyan-300',
          icon: <Radio className="w-4 h-4 text-cyan-400" />,
          statusColor: 'text-cyan-400'
        };
      default:
        return {
          border: 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
          titleColor: 'text-emerald-400',
          icon: <Bot className="w-4 h-4 text-emerald-400" />,
          statusColor: 'text-emerald-400'
        };
    }
  };

  const styleConfig = currentMessage 
    ? getBorderAndBadge(currentMessage.type) 
    : getBorderAndBadge('info');

  return (
    <aside 
      aria-label="Tactical Assistant"
      className="fixed left-3 sm:left-5 bottom-4 z-40 max-w-sm w-[calc(100vw-24px)] sm:w-[370px] font-mono select-none"
    >
      {/* Minimized Floating Widget Pill */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-black/95 border-2 border-emerald-500 p-2.5 px-4 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500/10 flex items-center gap-3 transition-all group"
          title="Open Tactical Assistant"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded border border-emerald-400/80 bg-emerald-950/60 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-emerald-400 tracking-wider">A.R.E.S. ADVISOR</div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {currentMessage ? currentMessage.title.slice(0, 24) + '...' : 'TRANSMISSION READY'}
            </div>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400 ml-auto opacity-70 group-hover:opacity-100" />
        </button>
      ) : (
        /* Full Terminal Assistant Panel */
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`bg-black/95 border-2 ${styleConfig.border} p-3.5 transition-all duration-300 relative backdrop-blur-md crt-overlay`}
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="relative">
                {/* Holographic animated AI avatar frame */}
                <div className="w-7 h-7 border border-emerald-400/60 bg-emerald-950/40 flex items-center justify-center relative overflow-hidden">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  {/* Subtle animated scanline */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-pulse" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300 tracking-widest flex items-center gap-1.5">
                  <span>A.R.E.S. // TACTICAL COMM</span>
                </div>
                <div className="text-[9px] text-emerald-500/70 tracking-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  SAT_LINK: SECURE // 256-BIT
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="p-1 text-zinc-400 hover:text-emerald-300 border border-transparent hover:border-emerald-500/30 transition-colors"
                title={isMuted ? "Enable Audio Transmission Beeps" : "Mute Transmission Beeps"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={() => setShowHistory(prev => !prev)}
                className={`p-1 text-xs border transition-colors ${showHistory ? 'border-emerald-400 text-emerald-300 bg-emerald-500/20' : 'border-transparent text-zinc-400 hover:text-emerald-300'}`}
                title="View Past Transmissions Log"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-zinc-400 hover:text-emerald-300 transition-colors"
                title="Minimize Assistant"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {currentMessage && (
                <button
                  onClick={onDismiss}
                  className="p-1 text-zinc-400 hover:text-rose-400 transition-colors ml-0.5"
                  title="Dismiss Message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* History Log Drawer View */}
          {showHistory ? (
            <div className="space-y-2 mb-2 max-h-56 overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
                <span>COMMUNICATION ARCHIVE</span>
                <span className="text-emerald-400">{messageHistory.length} TRANSMISSIONS</span>
              </div>
              {messageHistory.length === 0 ? (
                <div className="text-[11px] text-zinc-500 py-3 text-center">
                  No previous dispatches recorded.
                </div>
              ) : (
                messageHistory.slice(0, 10).map((msg) => (
                  <div 
                    key={msg.id} 
                    className="p-2 border border-zinc-800 hover:border-emerald-500/50 bg-black/60 text-xs space-y-1 transition-colors"
                  >
                    <div className="flex justify-between items-center text-[9px] text-zinc-500">
                      <span className="text-emerald-400 font-bold uppercase">{msg.tag}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-bold text-zinc-200 text-[11px]">{msg.title}</div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed line-clamp-2">{msg.message}</p>
                    {msg.action?.tab && (
                      <button
                        onClick={() => {
                          if (msg.action?.tab) onNavigateTab(msg.action.tab);
                          setShowHistory(false);
                        }}
                        className="text-[9px] text-emerald-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        [ NAVIGATE: {msg.action.label} ] <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Active Live Transmission Bubble */
            <div className="space-y-2">
              {currentMessage ? (
                <>
                  {/* Tag and Timestamp */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {styleConfig.icon}
                      <span className={`px-1.5 py-0.2 border text-[9px] uppercase tracking-wider font-bold ${styleConfig.badgeBg}`}>
                        {currentMessage.tag}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[9px]">
                      {new Date(currentMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${styleConfig.titleColor}`}>
                    {currentMessage.title}
                  </h4>

                  {/* Message body */}
                  <p className="text-zinc-300 text-[11px] leading-relaxed font-sans sm:font-mono">
                    {currentMessage.message}
                  </p>

                  {/* Action Button if attached */}
                  <div className="pt-1.5 flex flex-wrap gap-2">
                    {currentMessage.action && currentMessage.action.tab && (
                      <button
                        onClick={() => {
                          if (currentMessage.action?.tab) {
                            onNavigateTab(currentMessage.action.tab);
                          }
                          onDismiss();
                        }}
                        className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      >
                        <span>{currentMessage.action.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={onDismiss}
                      className="py-1.5 px-2.5 border border-zinc-700 hover:border-emerald-500/60 text-zinc-400 hover:text-emerald-300 text-[10px] tracking-widest uppercase transition-colors"
                    >
                      DISMISS
                    </button>
                  </div>
                </>
              ) : (
                /* Idle State */
                <div className="py-2 text-center space-y-2">
                  <div className="text-[11px] text-emerald-400/80">
                    {'>'} STANDBY // MONITORING ALL SYNDICATE TELEMETRY
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    A.R.E.S. will alert you automatically when contracts resolve, base raids trigger, crises break out, or assets ready.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Bar with Briefing Request & Dismiss Progress Indicator */}
          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[9px]">
            <button
              onClick={onRequestBriefing}
              className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-bold"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              [ REQUEST SITREP BRIEFING ]
            </button>

            {currentMessage && currentMessage.type !== 'alert' && (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="text-[8px]">EXPIRING</span>
                <div className="w-12 h-1 bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${timeRemaining}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
