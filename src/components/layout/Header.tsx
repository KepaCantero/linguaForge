'use client';

import { useGamificationStore } from '@/store/useGamificationStore';
import { getLevelProgress } from '@/lib/constants';

export function Header() {
  const { xp, coins, streak } = useGamificationStore();
  const progress = getLevelProgress(xp);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-lf-soft border-b border-lf-primary/20 z-50">
      <div className="h-full max-w-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-resonance-gradient flex items-center justify-center shadow-resonance">
            <span className="text-sm font-rajdhani font-bold text-white">LF</span>
          </div>
          <span className="font-rajdhani font-bold text-lf-secondary tracking-wide">LinguaForge</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {/* Resonance (XP) */}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-lf-accent/20 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-lf-accent rounded-sm animate-resonance-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-rajdhani font-semibold text-lf-accent text-xs">{xp}</span>
              <div className="w-10 h-1 bg-lf-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-resonance-gradient rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Shards (Coins) */}
          <div className="flex items-center gap-1">
            <span className="text-lf-secondary text-sm">◈</span>
            <span className="font-rajdhani font-medium text-white">{coins}</span>
          </div>

          {/* Forge Streak */}
          <div className="flex items-center gap-1">
            <span className={`text-sm ${streak > 0 ? 'animate-resonance-pulse text-lf-accent' : 'text-lf-muted'}`}>
              ⬡
            </span>
            <span className="font-rajdhani font-medium text-white">{streak}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
