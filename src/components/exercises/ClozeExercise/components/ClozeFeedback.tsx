'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ClozeOption } from '@/types';
import { XP_RULES } from '@/lib/constants';

interface ClozeFeedbackProps {
  showResult: boolean;
  isCorrect: boolean;
  correctOption: ClozeOption | undefined;
}

export function ClozeFeedback({
  showResult,
  isCorrect,
  correctOption,
}: ClozeFeedbackProps) {
  const getContainerClassName = (): string => {
    const baseClasses = 'p-4 rounded-xl text-center shadow-calm-lg backdrop-blur-md';

    if (isCorrect) {
      return `${baseClasses} bg-semantic-success-bg text-semantic-success-text border border-semantic-success`;
    }

    return `${baseClasses} bg-semantic-error-bg text-semantic-error-text border border-semantic-error`;
  };

  const getEmoji = (): string => {
    return isCorrect ? '🎉' : '💡';
  };

  const getMessage = (): string => {
    if (isCorrect) {
      return `¡Correcto! +${XP_RULES.clozeCorrect} XP`;
    }

    return `La respuesta correcta era: ${correctOption?.text}`;
  };

  return (
    <AnimatePresence>
      {showResult && (
        <motion.div
          className={getContainerClassName()}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-2xl mr-2">{getEmoji()}</span>
          <span className="font-medium">{getMessage()}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
