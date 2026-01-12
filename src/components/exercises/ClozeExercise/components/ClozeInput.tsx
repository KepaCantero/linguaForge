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
        ? `${baseClasses} bg-lf-success/20 dark:bg-lf-success/30 text-lf-success dark:text-lf-success`
        : `${baseClasses} bg-lf-error/20 dark:bg-lf-error/30 text-lf-error dark:text-lf-error`;
    }

    return `${baseClasses} bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary`;
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
