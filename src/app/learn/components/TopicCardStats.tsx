/**
 * TopicCardStats Component
 * Displays the progress bar, progress text, and action indicator
 */

import { motion } from 'framer-motion';
import type { UnifiedTopic } from '../types';
import type { TopicCardDataReturn } from '../hooks/useTopicCardData';

interface TopicCardStatsProps {
  topic: UnifiedTopic;
  index: number;
  cardData: TopicCardDataReturn;
}

export function TopicCardStats({ topic, index, cardData }: TopicCardStatsProps) {
  const { isComingSoon, progressBarClass, progressText, actionText, showActionButton } = cardData;

  if (isComingSoon) {
    return (
      <div className="flex items-center justify-center py-2">
        <span className="text-sm text-calm-text-muted/60">Próximamente</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="relative h-2 bg-calm-bg-tertiary/30 rounded-full overflow-hidden">
        <motion.div
          className={progressBarClass}
          initial={{ width: 0 }}
          animate={{ width: `${topic.progress}%` }}
          transition={{ duration: 0.8, delay: index * 0.02 }}
        />
      </div>

      {/* Progress text and action */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${topic.isCompleted ? 'text-accent-500' : 'text-calm-text-primary'}`}>
          {progressText}
        </span>
        {showActionButton && (
          <span className="text-calm-text-muted/60">
            {actionText} →
          </span>
        )}
      </div>
    </div>
  );
}
