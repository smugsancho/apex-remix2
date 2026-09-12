import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Crosshair, 
  ShieldAlert, 
  Flame, 
  Building2, 
  Radio, 
  Save, 
  HelpCircle, 
  Cpu, 
  Coins, 
  Zap, 
  Snowflake, 
  Swords, 
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface InteractiveGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'missions' | 'events' | 'geopolitics' | 'infrastructure' | 'defense' | 'armory' | 'achievements' | 'system'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 crt-overlay">
      <div className="bg-black border-2 border-emerald-500 max-w-4xl w-full h-[85vh] flex flex-col shadow-[0_0_30px_rgba(16,185,129,0.25)] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 border-b-2 border-emerald-500/50 bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono tracking-widest text-emerald-400 glow-text flex items-center gap-2">
                APEX OPERATING SYSTEM // FIELD MANUAL & DOCS
              </h2>
              <p className="text-[11px] text-emerald-500/70 font-mono tracking-wider">
                TACTICAL MERCENARY PROTOCOLS // RESTRICTED ACCESS (LVL 4 CLEARANCE)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden font-mono">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-emerald-500/30 bg-zinc-950/80 p-3 space-y-1 overflow-y-auto shrink-0">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest px-2 py-1 font-bold">
              DOCUMENTATION INDEX
            </div>

            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'overview' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> 00. OVERVIEW</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('missions')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'missions' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><Crosshair className="w-3.5 h-3.5" /> 01. MISSIONS & TROOPS</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('events')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'events' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><Radio className="w-3.5 h-3.5" /> 02. WORLD CRISES & FREEZE</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('geopolitics')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'geopolitics' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><Swords className="w-3.5 h-3.5" /> 03. INCITE WAR & TENSION</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('infrastructure')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'infrastructure' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> 04. HQ INFRASTRUCTURE</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('defense')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'defense' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" /> 05. BASE DEFENSE (3-OP CYCLE)</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('armory')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'armory' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><Award className="w-3.5 h-3.5" /> 06. WEAPONS & CRATES</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('achievements')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'achievements' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 07. ACHIEVEMENTS & BUFFS</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('system')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-all ${
                activeSection === 'system' 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'border-transparent text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/5'
              }`}
            >
              <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> 08. SYS.SAVE & STORAGE</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>
          </div>

          {/* Section Content Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-emerald-400/90 leading-relaxed bg-black">
            
            {activeSection === 'overview' && (
              <div className="space-y-4">
                <div className="border border-emerald-500/40 p-4 bg-emerald-950/20">
                  <h3 className="text-base font-bold text-emerald-300 tracking-wider mb-2">SYNDICATE EXECUTIVE DIRECTIVE</h3>
                  <p className="text-emerald-400/80">
                    Welcome, Supreme Commander. As the director of Apex Mercenary Command, you operate outside international law during the escalating Cold War. Your objective is to build financial hegemony, maintain intelligence superiority, orchestrate proxy conflicts, and extract boundless wealth without succumbing to enemy raids.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950">
                    <div className="text-emerald-300 font-bold flex items-center gap-1.5 mb-1"><Coins className="w-4 h-4 text-emerald-400" /> LIQUID CREDITS</div>
                    <p className="text-[11px] text-emerald-500/70">Used for hiring mercenary squads, acquiring black-market arms crates, and investing in corporate front infrastructure.</p>
                  </div>
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950">
                    <div className="text-cyan-300 font-bold flex items-center gap-1.5 mb-1"><Zap className="w-4 h-4 text-cyan-400" /> INTEL (TB)</div>
                    <p className="text-[11px] text-emerald-500/70">Decryption bandwidth used to Incite Proxy Wars (-25% tension), Freeze World Crisis Lifespans (500 Intel), and launch counter-ops.</p>
                  </div>
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950">
                    <div className="text-red-400 font-bold flex items-center gap-1.5 mb-1"><Flame className="w-4 h-4 text-red-500" /> GLOBAL TENSION</div>
                    <p className="text-[11px] text-emerald-500/70">High tension increases contract hazard pay, but triggers high-level DEFCON threats. Manage it via Inciting Wars or Counter-Disinfo.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'missions' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  01. TACTICAL CONTRACTS & TROOP SYNERGIES
                </h3>
                <p>
                  Deploy specialized mercenary classes across global hot zones. Each class delivers unique operational passives:
                </p>

                <div className="space-y-2">
                  <div className="border border-emerald-500/30 p-2.5 bg-zinc-950 flex items-start gap-3">
                    <span className="px-2 py-0.5 border border-emerald-500 text-emerald-300 font-bold text-[10px]">ASSAULT</span>
                    <div>
                      <span className="font-bold text-emerald-200 block">+10% Combat Power</span>
                      <span className="text-[11px] text-emerald-500/70">Core frontline operators. High baseline damage output for clearing heavy fortifications.</span>
                    </div>
                  </div>

                  <div className="border border-emerald-500/30 p-2.5 bg-zinc-950 flex items-start gap-3">
                    <span className="px-2 py-0.5 border border-blue-500 text-blue-300 font-bold text-[10px]">SNIPER</span>
                    <div>
                      <span className="font-bold text-emerald-200 block">+15% Mission Success Probability</span>
                      <span className="text-[11px] text-emerald-500/70">Eliminates high-value targets prior to squad entry, boosting overall completion certainty.</span>
                    </div>
                  </div>

                  <div className="border border-emerald-500/30 p-2.5 bg-zinc-950 flex items-start gap-3">
                    <span className="px-2 py-0.5 border border-amber-500 text-amber-300 font-bold text-[10px]">JUGGERNAUT</span>
                    <div>
                      <span className="font-bold text-emerald-200 block">-50% Casualty Sustained</span>
                      <span className="text-[11px] text-emerald-500/70">Heavy armor shields the strike team, cutting mercenary deaths in half upon high-risk encounters.</span>
                    </div>
                  </div>

                  <div className="border border-emerald-500/30 p-2.5 bg-zinc-950 flex items-start gap-3">
                    <span className="px-2 py-0.5 border border-cyan-500 text-cyan-300 font-bold text-[10px]">HACKER</span>
                    <div>
                      <span className="font-bold text-emerald-200 block">+25% Intel Data Payout</span>
                      <span className="text-[11px] text-emerald-500/70">Infiltrates hostile data conduits, extracting bonus TB Intel upon contract completion.</span>
                    </div>
                  </div>

                  <div className="border border-emerald-500/30 p-2.5 bg-zinc-950 flex items-start gap-3">
                    <span className="px-2 py-0.5 border border-purple-500 text-purple-300 font-bold text-[10px]">MEDIC</span>
                    <div>
                      <span className="font-bold text-emerald-200 block">20% Revive Chance on Fallen Soldiers</span>
                      <span className="text-[11px] text-emerald-500/70">Trauma surgeons revive fallen operatives on-site before mission extraction.</span>
                    </div>
                  </div>
                </div>

                {/* Mission Tiers & Minigame Mechanics */}
                <div className="border border-emerald-500/40 p-3 bg-zinc-950/80 space-y-3 mt-4">
                  <div className="text-xs font-bold text-emerald-300 tracking-wider">
                    OPERATIONAL TIERS & TACTICAL MINIGAMES
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="border border-orange-500/40 p-2 bg-orange-950/20">
                      <div className="text-orange-400 font-bold flex justify-between">
                        <span>EXTREME CLASS</span>
                        <span>1 MINIGAME</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 mt-1">
                        Payout: <strong className="text-emerald-400">$19,000 - $35,000</strong> | Intel: <strong className="text-cyan-400">150 - 220 TB</strong>.
                      </div>
                    </div>

                    <div className="border border-red-500/50 p-2 bg-red-950/20">
                      <div className="text-red-400 font-bold flex justify-between">
                        <span>SUICIDE MISSION</span>
                        <span>2 MINIGAMES</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 mt-1">
                        Payout: <strong className="text-emerald-400">$60,000 - $150,000</strong> | Intel: <strong className="text-cyan-400">250 - 400 TB</strong>.
                      </div>
                    </div>

                    <div className="border border-purple-500/60 p-2 bg-purple-950/30 sm:col-span-2">
                      <div className="text-purple-300 font-bold flex justify-between">
                        <span>WARZONE CLASS // REBIRTH 2+ UNLOCKED</span>
                        <span className="text-red-400 animate-pulse">2-STAGE ASSAULT</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 mt-1">
                        Payout: <strong className="text-emerald-400">$200,000 - $400,000</strong> | Intel: <strong className="text-cyan-400">370 - 650 TB</strong>. Requires deep squad firepower and surviving multi-stage combat simulations.
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-500/80 leading-relaxed border-t border-emerald-500/20 pt-2">
                    <strong>Pre-Deployment Power Meter:</strong> As you allocate squad units, the live power gauge calculates weapon multipliers, base strength, and level scaling against estimated enemy defense to deliver exact win probabilities prior to launch.
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'events' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  02. GLOBAL WORLD EVENTS & CRISIS STABILIZATION
                </h3>
                <p>
                  Global macro events periodically intercept diplomatic channels, applying lucrative Credit and Intel reward multipliers (up to 2.25x).
                </p>

                <div className="border border-cyan-500/60 p-4 bg-cyan-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Snowflake className="w-5 h-5 text-cyan-400" /> CRISIS STABILIZATION FREEZE PROTOCOL (500 INTEL)
                  </div>
                  <p className="text-cyan-200/90 text-xs leading-relaxed">
                    When an exceptional event is active (e.g. Black Market Boom or Quantum AI Breakthrough), you can execute a <strong>Crisis Stabilization Freeze</strong> for <strong>500 Intel</strong>.
                  </p>
                  <ul className="list-disc list-inside text-cyan-300/80 space-y-1 text-[11px] pt-1">
                    <li>Stops the countdown timer completely from expiring while active.</li>
                    <li>Guarantees the crisis reward multipliers remain locked for your next <strong>3 completed missions</strong>.</li>
                    <li>Allows your syndicate to maximize high-yield contract profits without racing the clock.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'geopolitics' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  03. INCITING PROXY WARS & DEFLECTION MECHANICS
                </h3>
                <p>
                  In the <strong>GEOPOLITICS</strong> tab, you monitor four rival superpowers: Vorex Technocracy, Iron Directorate, Neo-Shanghai Conglomerate, and Aethelgard Republic.
                </p>

                <div className="border border-red-500/40 p-4 bg-red-950/20 space-y-2">
                  <div className="text-red-400 font-bold text-sm flex items-center gap-2">
                    <Swords className="w-4 h-4" /> INCITE WAR (-25% SYNDICATE TENSION // 100 INTEL)
                  </div>
                  <p className="text-red-200/90 text-xs">
                    Instead of committing your troops to fight for one nation, clicking <strong>[ INCITE WAR ]</strong> orchestrates false-flag operations between two rival nations.
                  </p>
                  <div className="bg-black/60 p-3 border border-red-500/30 text-[11px] space-y-1 text-red-300">
                    <div>{'>>'} <strong>Direct Effect:</strong> Spawns an Active Conflict between the target superpower and another rival bloc.</div>
                    <div>{'>>'} <strong>Tension Deflection:</strong> Reduces Apex Syndicate tension by <strong>25%</strong>, as international surveillance and military fleets redirect their resources towards each other.</div>
                  </div>
                </div>

                <div className="border border-emerald-500/30 p-3 bg-zinc-950">
                  <div className="font-bold text-emerald-300 mb-1">DYNAMIC ACTIVE CONFLICTS THEATER</div>
                  <p className="text-[11px] text-emerald-500/70">
                    Active Conflicts automatically appear whenever tension between two rival superpowers boils over, or when tension between a nation and the Apex Syndicate reaches critical levels.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'infrastructure' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  04. SYNDICATE HQ INFRASTRUCTURE
                </h3>
                <p>
                  Syndicate infrastructure nodes (such as Black Market Fronts, Offshore Server Farms, and Singularity Forges) operate on an active yield extraction cycle:
                </p>

                <div className="border border-emerald-500/50 p-4 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Building2 className="w-4 h-4 text-emerald-400" /> MANUAL REVENUE EXTRACTION
                  </div>
                  <p className="text-xs text-emerald-400/90">
                    Whenever an installed infrastructure node is ready, click <strong>[ EXTRACT REVENUE ]</strong> (or <strong>[ CLAIM ALL AVAILABLE YIELD ]</strong>) to instantly receive its full lumpsum payout into your treasury.
                  </p>
                  <div className="border border-emerald-500/30 bg-black p-3 text-[11px] space-y-1.5">
                    <div className="text-amber-400 font-bold">RECHARGE CYCLE: 2 MISSIONS PER HARVEST</div>
                    <p className="text-zinc-400">
                      Once claimed, the infrastructure node enters a cooldown and requires <strong>2 completed missions</strong> to recharge and produce revenue again. Complete contracts in the MISSIONS tab to reset your income nodes!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'defense' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  05. HQ BASE DEFENSE PROTOCOLS
                </h3>
                <p>
                  Enemy reconnaissance teams will occasionally locate your Syndicate Command Center and launch coordinated strike raids.
                </p>

                <div className="border border-red-500/50 p-4 bg-red-950/20 space-y-2">
                  <div className="text-red-400 font-bold text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> 3-MISSION RAID CADENCE
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed">
                    Raids do not interrupt your workflow at arbitrary random seconds. Instead, base raids are calculated and triggered <strong>strictly once every 3 completed missions</strong> when regional tension is elevated.
                  </p>
                  <div className="bg-black/60 p-3 border border-red-500/30 text-[11px] space-y-1">
                    <div className="text-emerald-400 font-bold">DEFENSIVE RESOLUTION:</div>
                    <p className="text-zinc-300">
                      When attacked, allocate garrison troops to meet or exceed the required enemy power. Successful defense rewards bonus bounty credits and boosts morale, while a breach results in treasury losses.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'armory' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  06. ARMORY, CRATES & RARITY TIERS
                </h3>
                <p>
                  Equip acquired weaponry onto mercenary squads in the ARMORY tab to multiply their combat efficiency. Weapons can be pulled from Standard, Advanced, or Prototype Crates.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="border border-zinc-600 p-2 bg-zinc-950 text-zinc-300">COMMON<br/><span className="text-emerald-400 font-bold">1.1x Power</span></div>
                  <div className="border border-blue-500/60 p-2 bg-blue-950/30 text-blue-300">RARE<br/><span className="text-emerald-400 font-bold">1.3x Power</span></div>
                  <div className="border border-purple-500/60 p-2 bg-purple-950/30 text-purple-300">EPIC<br/><span className="text-emerald-400 font-bold">1.6x Power</span></div>
                  <div className="border border-amber-500/60 p-2 bg-amber-950/30 text-amber-300">LEGENDARY<br/><span className="text-emerald-400 font-bold">2.0x Power</span></div>
                  <div className="border border-rose-500/60 p-2 bg-rose-950/30 text-rose-300">MYTHICAL<br/><span className="text-emerald-400 font-bold">2.6x Power</span></div>
                  <div className="border border-cyan-500/60 p-2 bg-cyan-950/30 text-cyan-300">EXOTIC<br/><span className="text-emerald-400 font-bold">3.5x Power</span></div>
                  <div className="border border-yellow-400/60 p-2 bg-yellow-950/30 text-yellow-300">DIVINE<br/><span className="text-emerald-400 font-bold">5.0x Power</span></div>
                  <div className="border border-red-500 p-2 bg-red-950/40 text-red-400 font-bold glow-text">BOUNDLESS<br/><span className="text-white font-bold">10.0x Power</span></div>
                </div>
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2 flex items-center justify-between">
                  <span>07. ACHIEVEMENTS & PERMANENT COMBAT BUFFS</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    PASSIVE STACKING
                  </span>
                </h3>
                
                <div className="border border-emerald-500/40 p-4 bg-emerald-950/20 space-y-2">
                  <div className="text-emerald-300 font-bold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> SQUAD POWER MULTIPLIER
                  </div>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    Accomplishing specific career milestones awards permanent percentage buffs to the combat power of <strong>all mercenary units</strong> across missions, base defense, and crisis operations.
                  </p>
                  <p className="text-xs text-zinc-400">
                    Unlike standard resources, achievement combat multipliers are persistent and continue to bolster your squad potency throughout all operations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950 space-y-1">
                    <div className="font-bold text-emerald-400 uppercase tracking-wider">CAREER CONTRACTS</div>
                    <p className="text-zinc-400 text-[11px]">
                      Awards stacking +2% to +15% power bonuses at 10, 25, 50, 100, and 250 completed military deployments.
                    </p>
                  </div>
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950 space-y-1">
                    <div className="font-bold text-emerald-400 uppercase tracking-wider">FINANCIAL & INTEL MILESTONES</div>
                    <p className="text-zinc-400 text-[11px]">
                      Reaching $100k, $1M, $10M and massive Intel Caches unlocks significant permanent squad power enhancements.
                    </p>
                  </div>
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950 space-y-1">
                    <div className="font-bold text-emerald-400 uppercase tracking-wider">ELITE SYNDICATE & PRESTIGE</div>
                    <p className="text-zinc-400 text-[11px]">
                      Upgrading all front infrastructure and undergoing system reboots confers apex veteran bonuses.
                    </p>
                  </div>
                  <div className="border border-emerald-500/30 p-3 bg-zinc-950 space-y-1">
                    <div className="font-bold text-emerald-400 uppercase tracking-wider">MINIGAME ACE & CRISIS CONTROL</div>
                    <p className="text-zinc-400 text-[11px]">
                      Mastering bullet hell evasions, minefield maneuvers, and cryogenic event freezes grants combat mastery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'system' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-emerald-300 tracking-widest border-b border-emerald-500/30 pb-2">
                  08. SYS.SAVE & LOCAL PERSISTENCE
                </h3>
                <div className="border border-emerald-500/50 p-4 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> SECURE LOCAL STORAGE ENGINE
                  </div>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    Clicking <strong>[ SYS.SAVE ]</strong> in the top header writes all syndicate resources, active and completed contracts, weapon inventories, troop rosters, infrastructure recharge timers, and geopolitical war states into persistent browser memory.
                  </p>
                  <p className="text-xs text-emerald-500/80">
                    Whenever you return to the simulator, your saved operations state will be seamlessly restored automatically.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 border-t border-emerald-500/30 bg-zinc-950 flex justify-between items-center text-xs font-mono">
          <span className="text-emerald-500/60">APEX_OS // DOC_VER: 2.4.0</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-emerald-500 text-black font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors"
          >
            [ CLOSE MANUAL ]
          </button>
        </div>

      </div>
    </div>
  );
};
