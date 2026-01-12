/**
 * TopicCardMetadata Component
 * Displays level, phrases, subtopics, and exercises count
 */

import type { UnifiedTopic } from '../types';

interface TopicCardMetadataProps {
  topic: UnifiedTopic;
}

export function TopicCardMetadata({ topic }: TopicCardMetadataProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-lf-muted/60">
      <span className="px-2 py-0.5 rounded-md bg-lf-muted/30">
        {topic.level}
      </span>
      {topic.metadata?.phrases && (
        <>
          <span>{topic.metadata.phrases} frases</span>
          <span>•</span>
          <span>{topic.metadata.subtopics} bloques</span>
        </>
      )}
      {topic.totalExercises && topic.type !== 'coming-soon' && (
        <span>
          {topic.completedExercises}/{topic.totalExercises} ejercicios
        </span>
      )}
    </div>
  );
}
