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
    const baseClasses = 'p-4 rounded-xl text-center shadow-glass-xl backdrop-blur-aaa';

    if (isCorrect) {
      return `${baseClasses} bg-lf-success/20 dark:bg-lf-success/30 text-lf-success dark:text-lf-success border border-lf-success/40`;
    }

    return `${baseClasses} bg-lf-error/20 dark:bg-lf-error/30 text-lf-error dark:text-lf-error border border-lf-error/40`;
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
