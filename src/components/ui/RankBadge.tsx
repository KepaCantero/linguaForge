'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HUNTER_RANKS, type HunterRank } from '@/lib/constants';

interface RankBadgeProps {
  rank: HunterRank;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
};

export function RankBadge({ rank, showLabel = false, size = 'md', animated = false }: RankBadgeProps) {
  const rankInfo = HUNTER_RANKS.find(r => r.rank === rank) || HUNTER_RANKS[0];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`
          ${sizeClasses[size]}
          rounded-lg flex items-center justify-center font-bold text-white
          shadow-lg border-2 border-calm-warm-100/30
        `}
        style={{ backgroundColor: rankInfo.color }}
        animate={animated ? {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={animated ? {
          duration: 0.6,
          ease: 'easeOut',
        } : {}}
      >
        {rank}
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium text-calm-text-secondary dark:text-calm-text-tertiary">
          {rankInfo.name}
        </span>
      )}
    </div>
  );
}

interface RankBadgeWithTooltipProps extends RankBadgeProps {
  tooltip?: boolean;
}

export function RankBadgeWithTooltip({ rank, tooltip = true, ...props }: RankBadgeWithTooltipProps) {
  const rankInfo = HUNTER_RANKS.find(r => r.rank === rank) || HUNTER_RANKS[0];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => tooltip && setShowTooltip(false)}
      onFocus={() => tooltip && setShowTooltip(true)}
      onBlur={() => tooltip && setShowTooltip(false)}
      tabIndex={0}
    >
      <RankBadge rank={rank} {...props} />
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-calm-bg-primary dark:bg-calm-bg-elevated text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <div className="font-semibold">{rankInfo.name}</div>
            <div className="text-calm-text-muted text-[10px] mt-1">
              Rango {rank}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

