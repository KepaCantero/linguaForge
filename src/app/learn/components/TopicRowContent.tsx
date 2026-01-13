/**
 * TopicRowContent Component
 * Displays the title, description, and type badge in a row layout
 */

import type { UnifiedTopic } from '../types';
import type { TopicCardDataReturn } from '../hooks/useTopicCardData';

interface TopicRowContentProps {
  topic: UnifiedTopic;
  cardData: TopicCardDataReturn;
}

export function TopicRowContent({ topic, cardData }: TopicRowContentProps) {
  const { typeBadgeClass, typeBadgeContent } = cardData;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-calm-text-primary truncate">
          {topic.title}
        </h3>
        <span className={typeBadgeClass}>
          {typeBadgeContent}
        </span>
      </div>

      {topic.description && (
        <p className="text-sm text-calm-text-muted/70 truncate">
          {topic.description}
        </p>
      )}
    </div>
  );
}
