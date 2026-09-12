import React, { useState } from 'react';
import { WeaponItem, PlayerTroop } from '../types';
import { Crosshair } from 'lucide-react';

interface ArmoryProps {
  rebirths: number;
  weapons: WeaponItem[];
  troops: PlayerTroop[];
  credits: number;
  onOpenCrate: (tier: number) => void;
  onEquipWeapon: (weaponId: string, troopClass: string) => void;
}

export const Armory: React.FC<ArmoryProps> = ({ rebirths, weapons, troops, onOpenCrate, onEquipWeapon }) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-zinc-400 border-zinc-500/50 bg-zinc-500/10';
      case 'Rare': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      case 'Epic': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
      case 'Legendary': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case 'Mythical': return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
      case 'Exotic': return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10';
      case 'Divine': return 'text-emerald-300 border-emerald-400/50 bg-emerald-400/10 glow-text';
      case 'Boundless': return 'text-white border-white bg-white/20 glow-text font-bold';
      default: return 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text">{'>>'} ARMORY_ACCESS</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black border border-emerald-500/50 p-6 text-center shadow-[0_0_10px_rgba(16,185,129,0.05)] flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">TIER_1_CRATE</h3>
            <p className="text-xs text-emerald-500/70 mb-2">REQ: 0 REBOOTS. STD MUNITIONS.</p>
            <div className="text-[10px] text-zinc-400 mb-4 bg-zinc-900/50 p-2 rounded">
              <span className="text-emerald-500">POSSIBLE DROPS:</span><br/>
              Common (50%) <br/>
              Rare (30%) <br/>
              Epic (15%) <br/>
              Legendary (5%) <br/>
              <span className="text-white">Boundless (0.1%)</span>
            </div>
          </div>
          <button onClick={() => onOpenCrate(1)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold w-full uppercase tracking-widest transition-colors">[ DECRYPT: $15,000 ]</button>
        </div>
        <div className="bg-black border border-emerald-500/50 p-6 text-center shadow-[0_0_10px_rgba(16,185,129,0.05)] opacity-80 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">TIER_2_CRATE</h3>
            <p className="text-xs text-emerald-500/70 mb-2">REQ: 2 REBOOTS. ADV EXPERIMENTAL TECH.</p>
            <div className="text-[10px] text-zinc-400 mb-4 bg-zinc-900/50 p-2 rounded">
              <span className="text-emerald-500">POSSIBLE DROPS:</span><br/>
              Epic (60%) <br/>
              Legendary (30%) <br/>
              Mythical (10%) <br/>
              <span className="text-white">Boundless (0.1%)</span>
            </div>
          </div>
          <button onClick={() => onOpenCrate(2)} disabled={rebirths < 2} className="px-4 py-2 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold w-full disabled:border-zinc-800 disabled:text-zinc-600 disabled:bg-black uppercase tracking-widest transition-colors">
            {rebirths < 2 ? '[ LOCKED ]' : '[ DECRYPT: $60,000 ]'}
          </button>
        </div>
        <div className="bg-black border border-emerald-500/50 p-6 text-center shadow-[0_0_10px_rgba(16,185,129,0.05)] opacity-80 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-rose-500 mb-2 glow-text">TIER_3_CRATE</h3>
            <p className="text-xs text-emerald-500/70 mb-2">REQ: 4 REBOOTS. PROTOTYPE ORBITAL WEAPONS.</p>
            <div className="text-[10px] text-zinc-400 mb-4 bg-zinc-900/50 p-2 rounded">
              <span className="text-emerald-500">POSSIBLE DROPS:</span><br/>
              Legendary (60%) <br/>
              Mythical (25%) <br/>
              Exotic (13%) <br/>
              Divine (2%) <br/>
              <span className="text-white">Boundless (0.1%)</span>
            </div>
          </div>
          <button onClick={() => onOpenCrate(3)} disabled={rebirths < 4} className="px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-black font-bold w-full disabled:border-zinc-800 disabled:text-zinc-600 disabled:bg-black uppercase tracking-widest transition-colors">
            {rebirths < 4 ? '[ LOCKED ]' : '[ DECRYPT: $300,000 ]'}
          </button>
        </div>
      </div>
      
      <div className="mt-8 border-t border-emerald-500/30 pt-8">
        <h2 className="text-xl font-bold tracking-widest text-emerald-500 glow-text mb-4">{'>>'} LOCAL_INVENTORY</h2>
        {weapons.length === 0 ? (
          <div className="bg-black border border-emerald-500/30 p-8 text-center text-emerald-500/50 tracking-widest">
            {'>'} EMPTY. ACQUIRE CRATES TO EXPAND INVENTORY.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weapons.map(w => {
              const isSelected = selectedWeaponId === w.weapon.id;
              const equippedBy = troops.filter(t => t.equippedWeaponId === w.weapon.id).map(t => t.class);
              
              return (
                <div key={w.weapon.id} className="bg-black border border-emerald-500/40 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-emerald-300 tracking-wider flex-1">{w.weapon.name}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] px-2 py-0.5 tracking-widest border ${getRarityColor(w.weapon.rarity)}`}>
                          {w.weapon.rarity.toUpperCase()}
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 tracking-widest ${
                          w.weapon.tier === 'Prototype' ? 'text-rose-400' :
                          w.weapon.tier === 'Advanced' ? 'text-amber-400' :
                          'text-emerald-500'
                        }`}>
                          {w.weapon.tier.toUpperCase()} TIER
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-500/70 mt-2 flex items-center gap-2">
                      <Crosshair className="w-3 h-3" /> MULTIPLIER: x{w.weapon.powerMultiplier}
                    </div>
                    {equippedBy.length > 0 && (
                      <div className="mt-3 text-xs text-emerald-400">
                        {'>'} EQUIPPED: {equippedBy.join(', ').toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    {isSelected ? (
                      <div className="space-y-2">
                        <div className="text-xs text-emerald-500/70 tracking-widest mb-2">TARGET UNIT:</div>
                        <div className="flex flex-wrap gap-2">
                          {troops.map(t => (
                            <button 
                              key={t.class}
                              onClick={() => {
                                onEquipWeapon(w.weapon.id, t.class);
                                setSelectedWeaponId(null);
                              }}
                              className={`text-[10px] px-2 py-1 tracking-widest ${t.equippedWeaponId === w.weapon.id ? 'bg-emerald-500 text-black font-bold' : 'border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20'}`}
                            >
                              [ {t.class.toUpperCase()} ]
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setSelectedWeaponId(null)} className="w-full mt-2 py-1 text-xs text-rose-500 hover:bg-rose-500/10 border border-rose-500/20">[ CANCEL ]</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedWeaponId(w.weapon.id)}
                        className="w-full py-2 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black text-emerald-500 text-xs tracking-widest transition-colors"
                      >
                        [ EQUIP WPN ]
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
