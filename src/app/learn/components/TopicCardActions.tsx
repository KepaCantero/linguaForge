/**
 * TopicCardActions Component
 * Displays the delete button for imported content and glow effects
 */

import { motion } from 'framer-motion';
import type { UnifiedTopic } from '../types';
import type { TopicCardDataReturn } from '../hooks/useTopicCardData';

interface TopicCardActionsProps {
  topic: UnifiedTopic;
  cardData: TopicCardDataReturn;
  onDelete: (e: React.MouseEvent, nodeId: string) => void;
}

export function TopicCardActions({ topic, cardData, onDelete }: TopicCardActionsProps) {
  const { showGlowEffect } = cardData;

  return (
    <>
      {/* Delete button for imported content */}
      {topic.type === 'imported' && (
        <motion.button
          onClick={(e) => onDelete(e, topic.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-lf-error/20 hover:bg-lf-error text-lf-error hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      )}

      {/* Glow effect for completed topics */}
      {showGlowEffect && (
        <motion.div
          className="absolute inset-0 rounded-aaa-xl bg-gradient-to-r from-lf-success/20 to-lf-success/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </>
  );
}
