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
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentCard.phrase}
          </span>
          {children}
        </div>
        {currentCard.source.context && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
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
