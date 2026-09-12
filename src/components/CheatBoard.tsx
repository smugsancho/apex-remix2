import React, { useState } from 'react';
import { Terminal, X, DollarSign, Brain, RefreshCw, Crosshair, Globe, Radio } from 'lucide-react';

interface CheatBoardProps {
  onAddCredits: (amount: number) => void;
  onAddIntel: (amount: number) => void;
  onForceReboot: () => void;
  onAddTestWeapon: () => void;
  onTriggerWorldEvent: () => void;
  onClearWorldEvent: () => void;
}

export const CheatBoard: React.FC<CheatBoardProps> = ({ 
  onAddCredits, 
  onAddIntel, 
  onForceReboot, 
  onAddTestWeapon,
  onTriggerWorldEvent,
  onClearWorldEvent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-500/20 border border-red-500 text-red-500 p-2 hover:bg-red-500 hover:text-black transition-colors rounded-none"
        title="Open Cheat Board"
      >
        <Terminal className="w-5 h-5" />
      </button>
    );
  }

  const handleAuth = () => {
    if (passwordInput === 'sanchoandduck') {
      setIsAuthenticated(true);
      setErrorMsg(false);
    } else {
      setErrorMsg(true);
      setPasswordInput('');
      setTimeout(() => setErrorMsg(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black border-2 border-red-500 w-72 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
      <div className="bg-red-500 text-black px-3 py-2 flex justify-between items-center font-bold tracking-widest uppercase text-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>Dev_Terminal</span>
        </div>
        <button onClick={() => { setIsOpen(false); setIsAuthenticated(false); setPasswordInput(''); setErrorMsg(false); }} className="hover:bg-red-700 p-0.5 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {!isAuthenticated ? (
        <div className="p-4 font-mono space-y-4">
          <div className="text-red-500 text-xs tracking-widest uppercase">
            {errorMsg ? (
              <span className="text-red-600 animate-pulse">{'>'} ACCESS DENIED</span>
            ) : (
              <span className="animate-pulse">{'>'} AUTHENTICATION REQUIRED</span>
            )}
          </div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAuth();
            }}
            placeholder="ENTER PASSWORD"
            className="w-full bg-black border border-red-500/50 text-red-500 p-2 focus:outline-none focus:border-red-500 text-sm placeholder:text-red-900"
            autoFocus
          />
          <button 
            onClick={handleAuth}
            className="w-full py-2 bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors uppercase tracking-widest text-xs font-bold"
          >
            [ LOGIN ]
          </button>
        </div>
      ) : (
      <div className="p-4 space-y-3 font-mono">
        <button 
          onClick={() => onAddCredits(1000000)}
          className="w-full bg-black border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black p-2 flex items-center gap-2 transition-colors text-sm"
        >
          <DollarSign className="w-4 h-4" /> +1,000,000 Credits
        </button>
        
        <button 
          onClick={() => onAddIntel(5000)}
          className="w-full bg-black border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black p-2 flex items-center gap-2 transition-colors text-sm"
        >
          <Brain className="w-4 h-4" /> +5,000 Intel
        </button>
        
        <button 
          onClick={onAddTestWeapon}
          className="w-full bg-black border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black p-2 flex items-center gap-2 transition-colors text-sm"
        >
          <Crosshair className="w-4 h-4" /> Spawn Boundless Wpn
        </button>

        <button 
          onClick={onTriggerWorldEvent}
          className="w-full bg-black border border-amber-500/60 text-amber-400 hover:bg-amber-500 hover:text-black p-2 flex items-center gap-2 transition-colors text-sm"
        >
          <Globe className="w-4 h-4" /> Trigger World Event
        </button>

        <button 
          onClick={onClearWorldEvent}
          className="w-full bg-black border border-zinc-500/60 text-zinc-400 hover:bg-zinc-600 hover:text-white p-2 flex items-center gap-2 transition-colors text-sm"
        >
          <Radio className="w-4 h-4" /> Clear World Event
        </button>
        
        <button 
          onClick={onForceReboot}
          className="w-full bg-black border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-black p-2 flex items-center gap-2 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Force System Reboot
        </button>
      </div>
      )}
    </div>
  );
};

