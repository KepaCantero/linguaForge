/**
 * TopicCardIcon Component
 * Displays the icon with progress ring
 */

import { motion } from 'framer-motion';
import type { UnifiedTopic } from '../types';
import type { TopicCardDataReturn } from '../hooks/useTopicCardData';

interface TopicCardIconProps {
  topic: UnifiedTopic;
  index: number;
  cardData: TopicCardDataReturn;
}

export function TopicCardIcon({ topic, index, cardData }: TopicCardIconProps) {
  const {
    iconBackgroundClass,
    iconStyle,
    iconContent,
    showProgressRing,
  } = cardData;

  return (
    <div className="relative">
      <motion.div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${iconBackgroundClass}`}
        style={iconStyle}
        whileHover={!topic.isLocked && topic.type !== 'coming-soon' ? { scale: 1.05, rotate: 5 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {iconContent === '✓' ? (
          <span className="text-calm-text-primary text-2xl">✓</span>
        ) : (
          <span className={topic.isLocked || topic.type === 'coming-soon' ? 'text-calm-text-muted' : ''}>
            {iconContent}
          </span>
        )}
      </motion.div>

      {/* Progress ring for non-locked topics */}
      {showProgressRing && (
        <svg className="absolute inset-0 rotate-[-90deg]" style={{ width: '100%', height: '100%' }}>
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="var(--sky-500)/20"
            strokeWidth="3"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="var(--sky-500)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: topic.progress / 100 }}
            transition={{ duration: 1, delay: index * 0.02 }}
            style={{ strokeDasharray: '282.74', strokeDashoffset: '0' }}
          />
        </svg>
      )}
    </div>
  );
}
