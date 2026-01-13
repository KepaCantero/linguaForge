import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClozeExercise } from '@/components/exercises/ClozeExercise';
import type { Phrase } from '@/types';
import type { SRSCard } from '@/types/srs';

interface ClassicReviewContentProps {
  currentCard: SRSCard;
  currentCardIndex: number;
  totalCards: number;
  exerciseType: 'cloze' | 'detection';
  currentExercise: Phrase;
  onComplete: (correct: boolean) => void;
  children: ReactNode;
}

export function ClassicReviewContent({
  currentCard,
  currentCardIndex,
  totalCards,
  exerciseType,
  currentExercise,
  onComplete,
  children,
}: ClassicReviewContentProps) {
  const progress = ((currentCardIndex + 1) / totalCards) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-calm-text-secondary dark:text-calm-text-muted mb-2">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-calm-bg-tertiary rounded-full h-2">
          <motion.div
            className="bg-accent-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-calm-bg-elevated rounded-lg border border-calm-warm-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-calm-text-primary dark:text-calm-text-primary">
            {currentCard.phrase}
          </span>
          {children}
        </div>
        {currentCard.source.context && (
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted italic">
            {currentCard.source.context}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {exerciseType === 'cloze' && currentExercise && (
          <motion.div
            key={`cloze-${currentCard.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ClozeExercise
              phrase={currentExercise}
              onComplete={onComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
