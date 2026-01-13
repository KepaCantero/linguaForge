'use client';

import { motion } from 'framer-motion';
import { ClozeOption } from '@/types';
import { COLORS } from '@/constants/colors';

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
    const baseClasses = 'p-4 rounded-2xl font-medium text-center transition-all';

    if (showCorrect) {
      return `${baseClasses} bg-accent-500 text-white shadow-calm-md ring-4 ring-accent-500/50`;
    }

    if (showIncorrect) {
      return `${baseClasses} bg-semantic-error text-white shadow-calm-md ring-4 ring-semantic-error/50`;
    }

    if (isSelected) {
      return `${baseClasses} bg-accent-500 text-white shadow-resonance`;
    }

    return `${baseClasses} bg-calm-bg-secondary dark:bg-calm-bg-secondary/50 text-calm-text-primary dark:text-white hover:bg-accent-500/10 dark:hover:bg-accent-500/20 border border-calm-warm-100/30`;
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
            COLORS.transparent.accent,
            '0 0 25px COLORS.accent[60]',
            '0 0 15px var(--accent-500)/40',
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
