'use client';

import { motion } from 'framer-motion';
import { ClozeOption } from '@/types';

interface ClozeInputProps {
  showResult: boolean;
  isCorrect: boolean;
  selectedOption: ClozeOption | null;
  correctOption: ClozeOption | undefined;
}

const GAP_PLACEHOLDER = '?';

export function ClozeInput({
  showResult,
  isCorrect,
  selectedOption,
  correctOption,
}: ClozeInputProps) {
  const displayText = showResult
    ? isCorrect
      ? selectedOption?.text
      : correctOption?.text
    : selectedOption?.text || GAP_PLACEHOLDER;

  const getClassName = (): string => {
    const baseClasses =
      'inline-block min-w-24 mx-1 px-3 py-1 rounded-lg font-bold';

    if (showResult) {
      return isCorrect
        ? `${baseClasses} bg-accent-500/20 dark:bg-accent-500/30 text-accent-500 dark:text-accent-500`
        : `${baseClasses} bg-semantic-error/20 dark:bg-semantic-error/30 text-semantic-error dark:text-semantic-error`;
    }

    return `${baseClasses} bg-accent-500/20 dark:bg-accent-500/30 text-calm-text-primary dark:text-calm-text-primary`;
  };

  const getAnimationConfig = () => {
    if (showResult && isCorrect) {
      return {
        initial: { scale: 0.8 },
        animate: { scale: [0.8, 1.1, 1] },
        transition: { duration: 0.4 },
      };
    }
    return {};
  };

  const animationConfig = getAnimationConfig();

  return (
    <motion.span className={getClassName()} {...animationConfig}>
      {displayText}
    </motion.span>
  );
}
