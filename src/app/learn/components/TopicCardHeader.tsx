/**
 * TopicCardHeader Component
 * Displays the icon, title, description, and type badge
 */

import type { UnifiedTopic } from '../types';
import type { TopicCardDataReturn } from '../hooks/useTopicCardData';
import { TopicCardIcon } from './TopicCardIcon';
import { TopicCardMetadata } from './TopicCardMetadata';

interface TopicCardHeaderProps {
  topic: UnifiedTopic;
  index: number;
  cardData: TopicCardDataReturn;
}

export function TopicCardHeader({ topic, index, cardData }: TopicCardHeaderProps) {
  const { typeBadgeClass, typeBadgeContent } = cardData;

  return (
    <div className="flex items-start gap-4 mb-4">
      {/* Icon */}
      <TopicCardIcon topic={topic} index={index} cardData={cardData} />

      {/* Title and info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-lg text-white truncate">
            {topic.title}
          </h3>
          {/* Type badge */}
          <span className={typeBadgeClass}>
            {typeBadgeContent}
          </span>
        </div>

        {topic.description && (
          <p className="text-sm text-lf-muted/70 line-clamp-1 mb-2">
            {topic.description}
          </p>
        )}

        {/* Metadata */}
        <TopicCardMetadata topic={topic} />
      </div>
    </div>
  );
}
