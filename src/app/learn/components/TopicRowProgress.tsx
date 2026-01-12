/**
 * TopicRowProgress Component
 * Displays the horizontal progress bar and action indicator for row layout
 */

import { motion } from 'framer-motion';
import type { UnifiedTopic } from '../types';
import type { TopicCardDataReturn } from '../hooks/useTopicCardData';

interface TopicRowProgressProps {
  topic: UnifiedTopic;
  cardData: TopicCardDataReturn;
}

export function TopicRowProgress({ topic, cardData }: TopicRowProgressProps) {
  const { isComingSoon, progressBarClass, progressText } = cardData;

  if (isComingSoon) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-32">
        <div className="relative h-1.5 bg-lf-muted/20 rounded-full overflow-hidden">
          <motion.div
            className={progressBarClass}
            initial={{ width: 0 }}
            animate={{ width: `${topic.progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
      <span className={`text-sm font-semibold whitespace-nowrap ${
        topic.isCompleted ? 'text-lf-success' : 'text-lf-primary'
      }`}>
        {progressText}
      </span>
      {!topic.isLocked && (
        <span className="text-lf-primary">→</span>
      )}
    </div>
  );
}
