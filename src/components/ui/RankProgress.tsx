'use client';

import { getRankProgress, HUNTER_RANKS, type HunterRank } from '@/lib/constants';

interface RankProgressProps {
  xp: number;
  currentRank: HunterRank;
  showNextRank?: boolean;
}

export function RankProgress({ xp, currentRank, showNextRank = true }: RankProgressProps) {
  const progress = getRankProgress(xp);
  const currentRankInfo = HUNTER_RANKS.find(r => r.rank === currentRank) || HUNTER_RANKS[0];
  const currentRankIndex = HUNTER_RANKS.findIndex(r => r.rank === currentRank);
  const nextRank = currentRankIndex < HUNTER_RANKS.length - 1 
    ? HUNTER_RANKS[currentRankIndex + 1] 
    : null;

  const xpInCurrentRank = xp - currentRankInfo.xpRequired;
  const xpNeededForNext = nextRank ? nextRank.xpRequired - currentRankInfo.xpRequired : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-calm-text-secondary dark:text-calm-text-muted">
          {xpInCurrentRank} / {xpNeededForNext || 'MAX'} XP
        </span>
        {showNextRank && nextRank && (
          <span className="text-calm-text-muted dark:text-calm-text-muted">
            Próximo: {nextRank.rank}
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: currentRankInfo.color,
          }}
        />
      </div>
    </div>
  );
}

