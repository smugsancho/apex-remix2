import React, { useState } from 'react';
import { Achievement, AchievementCategory, PlayerStats } from '../types';
import { 
  Trophy, 
  Target, 
  Shield, 
  Coins, 
  Sparkles, 
  Flame, 
  Skull, 
  Award, 
  Crosshair, 
  Zap, 
  Crown, 
  Radio, 
  Sword, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  Search,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
  totalPowerBuffPercent: number;
  stats: PlayerStats;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  Coins: <Coins className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Skull: <Skull className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Crosshair: <Crosshair className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  Radio: <Radio className="w-6 h-6" />,
  Sword: <Sword className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />
};

export const Achievements: React.FC<AchievementsProps> = ({
  achievements,
  totalPowerBuffPercent,
  stats
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / (totalCount || 1)) * 100);

  const categories: (AchievementCategory | 'All')[] = [
    'All',
    'Operations',
    'Wealth',
    'Syndicate',
    'Armory',
    'Warfare'
  ];

  const filteredAchievements = achievements.filter(a => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesQuery = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.buffDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Sort: Unlocked first, then by progress percentage descending
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    const progA = a.currentValue / a.targetValue;
    const progB = b.currentValue / b.targetValue;
    return progB - progA;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-emerald-400 glow-text flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-400" />
            {'>>'} SYNDICATE_MILESTONES & ACHIEVEMENTS
          </h2>
          <p className="text-xs text-emerald-500/70 mt-1">
            Complete strategic directives to award permanent passive combat power multipliers to all active mercenary troops.
          </p>
        </div>

        {/* Global Multiplier Pill */}
        <div className="bg-black border-2 border-emerald-500/80 px-4 py-2.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-emerald-500/70 tracking-widest uppercase">Permanent Squad Buff</div>
            <div className="text-lg font-bold text-emerald-300 glow-text">
              +{totalPowerBuffPercent}% COMBAT POWER
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Milestone Completion Progress */}
        <div className="bg-black border border-emerald-500/40 p-4 shadow-[0_0_10px_rgba(16,185,129,0.08)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-emerald-500/70 uppercase tracking-widest">Protocol Completion</span>
            <span className="text-sm font-bold text-emerald-400">{unlockedCount} / {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-emerald-950/40 border border-emerald-500/30 h-3 overflow-hidden p-0.5">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-emerald-500/60 mt-2 flex justify-between">
            <span>UNLOCKED: {unlockedCount}</span>
            <span>LOCKED: {totalCount - unlockedCount}</span>
          </div>
        </div>

        {/* Cumulative Combat Multiplier */}
        <div className="bg-black border border-emerald-500/40 p-4 shadow-[0_0_10px_rgba(16,185,129,0.08)] flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-500/70 uppercase tracking-widest">Active Passive Multiplier</div>
            <div className="text-2xl font-bold text-emerald-300 glow-text">
              {(1 + totalPowerBuffPercent / 100).toFixed(2)}x POWER
            </div>
            <div className="text-[10px] text-emerald-500/60 mt-1">Applied across all deployments & base defense</div>
          </div>
          <div className="p-3 border border-emerald-500/30 bg-emerald-500/10">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Lifetime Telemetry Highlights */}
        <div className="bg-black border border-emerald-500/40 p-4 shadow-[0_0_10px_rgba(16,185,129,0.08)]">
          <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-2">Syndicate Telemetry</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-emerald-500/60 text-[10px] block">MISSIONS WON:</span>
              <span className="font-bold text-emerald-400">{stats.totalMissionsCompleted}</span>
            </div>
            <div>
              <span className="text-emerald-500/60 text-[10px] block">RAIDS REPELLED:</span>
              <span className="font-bold text-emerald-400">{stats.totalRaidsDefended}</span>
            </div>
            <div>
              <span className="text-emerald-500/60 text-[10px] block">LIFETIME EARNED:</span>
              <span className="font-bold text-emerald-400">${stats.totalCreditsEarned.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-emerald-500/60 text-[10px] block">WARS INCITED:</span>
              <span className="font-bold text-emerald-400">{stats.totalWarsIncited}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border border-emerald-500/30 bg-black/60 p-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const count = cat === 'All' 
              ? achievements.length 
              : achievements.filter(a => a.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs uppercase font-bold tracking-wider border transition-all ${
                  isSelected 
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                    : 'bg-black text-emerald-500/70 border-emerald-500/30 hover:border-emerald-400 hover:text-emerald-400'
                }`}
              >
                [ {cat} ({count}) ]
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-emerald-500/50 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-emerald-500/40 pl-8 pr-3 py-1.5 text-xs text-emerald-300 placeholder-emerald-500/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
          />
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAchievements.map(achievement => {
          const isUnlocked = achievement.unlocked;
          const current = achievement.currentValue;
          const target = achievement.targetValue;
          const pct = Math.min(100, Math.round((current / (target || 1)) * 100));
          const icon = ICON_MAP[achievement.iconName] || <Trophy className="w-6 h-6" />;

          return (
            <div 
              key={achievement.id}
              className={`border p-4 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isUnlocked 
                  ? 'bg-emerald-950/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-300' 
                  : 'bg-black/80 border-emerald-500/20 opacity-80 hover:opacity-100 hover:border-emerald-500/40'
              }`}
            >
              {/* Corner Watermark Tag */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <span className="text-[9px] px-1.5 py-0.5 border uppercase font-mono tracking-widest border-emerald-500/30 text-emerald-500/60 bg-black">
                  {achievement.category}
                </span>
              </div>

              <div>
                {/* Header with Icon & Title */}
                <div className="flex items-start gap-3 mb-3 pr-16">
                  <div className={`w-10 h-10 border flex items-center justify-center shrink-0 ${
                    isUnlocked 
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                      : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500/40'
                  }`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm tracking-wider uppercase ${
                      isUnlocked ? 'text-emerald-300 glow-text' : 'text-zinc-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <div className="text-[10px] text-emerald-500/70 mt-0.5">
                      {isUnlocked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> UNLOCKED
                        </span>
                      ) : (
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-zinc-500 inline" /> IN PROGRESS
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  {achievement.description}
                </p>
              </div>

              <div>
                {/* Progress Bar & Numeric Target */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-500/70">PROGRESS:</span>
                    <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                      {typeof current === 'number' && current >= 1000 ? current.toLocaleString() : current} / {typeof target === 'number' && target >= 1000 ? target.toLocaleString() : target} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-black border border-emerald-500/30 h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isUnlocked ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-emerald-600/70'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Permanent Passive Buff Footer */}
                <div className={`border p-2 flex items-center justify-between text-xs ${
                  isUnlocked 
                    ? 'bg-emerald-950/40 border-emerald-400/60 text-emerald-300' 
                    : 'bg-black border-emerald-500/20 text-zinc-400'
                }`}>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Zap className={`w-3.5 h-3.5 ${isUnlocked ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                    <span className="font-bold">{achievement.buffDescription}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 border uppercase font-mono ${
                    isUnlocked 
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' 
                      : 'border-zinc-800 text-zinc-600'
                  }`}>
                    {isUnlocked ? 'ACTIVE' : 'LOCKED'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="bg-black border border-emerald-500/30 p-8 text-center text-emerald-500/60">
          No achievements match the selected filter criteria.
        </div>
      )}
    </div>
  );
};
