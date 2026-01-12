/**
 * TopicRow Component (List View)
 * Refactored to reduce cyclomatic complexity by reusing components from TopicCard
 * and creating row-specific layout components
 */

import { motion } from 'framer-motion';
import type { UnifiedTopic } from '../types';
import { useTopicCardData } from '../hooks/useTopicCardData';
import { TopicCardIcon } from './TopicCardIcon';
import { TopicRowContent } from './TopicRowContent';
import { TopicRowProgress } from './TopicRowProgress';
import { TopicCardActions } from './TopicCardActions';

interface TopicRowProps {
  topic: UnifiedTopic;
  index: number;
  onDelete: (e: React.MouseEvent, nodeId: string) => void;
}

function getBorderClasses(topic: UnifiedTopic, isComingSoon: boolean): string {
  if (topic.isCompleted) {
    return 'border-lf-success/50 shadow-glow-success';
  }
  if (topic.isLocked || isComingSoon) {
    return 'border-lf-muted/30';
  }
  return 'border-lf-primary/30 hover:border-lf-primary/50';
}

export function TopicRow({ topic, index, onDelete }: TopicRowProps) {
  const cardData = useTopicCardData(topic);
  const { backgroundClass, handleClick, isComingSoon } = cardData;
  const borderClasses = getBorderClasses(topic, isComingSoon);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={handleClick}
      className={`
        relative group cursor-pointer overflow-hidden rounded-xl
        ${topic.isLocked || isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
          relative p-4 border-2 transition-all duration-300
          ${backgroundClass}
          ${borderClasses}
        `}
      >
        <div className="flex items-center gap-4">
          <TopicCardIcon topic={topic} index={index} cardData={cardData} />
          <TopicRowContent topic={topic} cardData={cardData} />
          <TopicRowProgress topic={topic} cardData={cardData} />
          <TopicCardActions topic={topic} cardData={cardData} onDelete={onDelete} />
        </div>
      </div>
    </motion.div>
  );
}
