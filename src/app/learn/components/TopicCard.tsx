/**
 * TopicCard Component (Grid View)
 * Refactored to reduce cyclomatic complexity by extracting sub-components
 * and custom hook for state management
 */

import { motion } from 'framer-motion';
import type { UnifiedTopic } from '../types';
import { useTopicCardData } from '../hooks/useTopicCardData';
import { TopicCardHeader } from './TopicCardHeader';
import { TopicCardStats } from './TopicCardStats';
import { TopicCardActions } from './TopicCardActions';

interface TopicCardProps {
  topic: UnifiedTopic;
  index: number;
  onDelete: (e: React.MouseEvent, nodeId: string) => void;
}

export function TopicCard({ topic, index, onDelete }: TopicCardProps) {
  const cardData = useTopicCardData(topic);
  const {
    backgroundClass,
    showCompletedBorder,
    showInProgressBorder,
    showLockedBorder,
    handleClick,
  } = cardData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 150 }}
      onClick={handleClick}
      className={`
        relative group cursor-pointer overflow-hidden rounded-aaa-xl
        ${topic.isLocked || topic.type === 'coming-soon' ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Background gradient based on completion */}
      <div className={`absolute inset-0 transition-all duration-500 ${backgroundClass}`} />

      {/* Animated border for completed topics */}
      {showCompletedBorder && (
        <motion.div
          className="absolute inset-0 rounded-aaa-xl border-2 border-lf-success"
          animate={{
            boxShadow: [
              '0 0 10px rgba(34, 197, 94, 0.3)',
              '0 0 20px rgba(34, 197, 94, 0.5)',
              '0 0 10px rgba(34, 197, 94, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Border for in-progress topics */}
      {showInProgressBorder && (
        <div className="absolute inset-0 rounded-aaa-xl border-2 border-lf-primary/40" />
      )}

      {/* Border for locked topics */}
      {showLockedBorder && (
        <div className="absolute inset-0 rounded-aaa-xl border border-lf-muted/40" />
      )}

      {/* Content */}
      <div className="relative p-5">
        {/* Header with icon and title */}
        <TopicCardHeader topic={topic} index={index} cardData={cardData} />

        {/* Stats with progress bar */}
        <TopicCardStats topic={topic} index={index} cardData={cardData} />

        {/* Actions (delete button, glow effects) */}
        <TopicCardActions topic={topic} cardData={cardData} onDelete={onDelete} />
      </div>
    </motion.div>
  );
}
