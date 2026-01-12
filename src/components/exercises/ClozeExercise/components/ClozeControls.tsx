'use client';

import { motion } from 'framer-motion';
import { ClozeOption } from '@/types';

interface ClozeControlsProps {
  options: ClozeOption[];
  selectedOption: ClozeOption | null;
  showResult: boolean;
  onOptionSelect: (option: ClozeOption) => void;
}

const OPTION_ANIMATION_DELAY_BASE = 0.1;

export function ClozeControls({
  options,
  selectedOption,
  showResult,
  onOptionSelect,
}: ClozeControlsProps) {
  const getButtonClassName = (
    option: ClozeOption,
    isSelected: boolean,
    showCorrect: boolean,
    showIncorrect: boolean
  ): string => {
    const baseClasses = 'p-4 rounded-aaa-xl font-medium text-center transition-all';

    if (showCorrect) {
      return `${baseClasses} bg-lf-success text-white shadow-glow-success ring-4 ring-lf-success/50`;
    }

    if (showIncorrect) {
      return `${baseClasses} bg-lf-error text-white shadow-glow-accent ring-4 ring-lf-error/50`;
    }

    if (isSelected) {
      return `${baseClasses} bg-lf-primary text-white shadow-resonance`;
    }

    return `${baseClasses} bg-glass-surface dark:bg-lf-soft/50 text-lf-dark dark:text-white hover:bg-lf-primary/10 dark:hover:bg-lf-primary/20 border border-lf-muted/30`;
  };

  const getCursorClassName = (showResult: boolean): string => {
    return showResult ? 'cursor-default opacity-50' : 'cursor-pointer';
  };

  const getAnimationConfig = (
    showCorrect: boolean,
    showIncorrect: boolean,
    index: number
  ) => {
    if (showCorrect) {
      return {
        animate: {
          scale: [1, 1.15, 1],
          boxShadow: [
            '0 0 0px rgba(34, 197, 94, 0)',
            '0 0 25px rgba(34, 197, 94, 0.6)',
            '0 0 15px rgba(34, 197, 94, 0.4)',
          ],
        },
        transition: { duration: 0.5 },
      };
    }

    if (showIncorrect) {
      return {
        animate: { x: [0, -8, 8, -8, 8, 0] },
        transition: { duration: 0.5 },
      };
    }

    return {
      animate: { opacity: 1, scale: 1 },
      transition: { delay: index * OPTION_ANIMATION_DELAY_BASE },
    };
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => {
        const isSelected = selectedOption?.id === option.id;
        const showCorrect = showResult && option.isCorrect;
        const showIncorrect = showResult && isSelected && !option.isCorrect;

        const animationConfig = getAnimationConfig(showCorrect, showIncorrect, index);

        return (
          <motion.button
            key={option.id}
            onClick={() => onOptionSelect(option)}
            disabled={showResult}
            className={`${getButtonClassName(option, isSelected, showCorrect, showIncorrect)} ${getCursorClassName(showResult)}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.95 } : {}}
            {...animationConfig}
          >
            {option.text}
            {showCorrect && <span className="ml-2">✓</span>}
            {showIncorrect && <span className="ml-2">✗</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
