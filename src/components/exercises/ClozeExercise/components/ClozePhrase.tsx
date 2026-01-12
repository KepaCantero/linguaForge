'use client';

import { Phrase, ClozeOption } from '@/types';
import { ClozeInput } from './ClozeInput';

interface ClozePhraseProps {
  phrase: Phrase;
  textWithGap: string;
  isCurrentPhrase: boolean;
  showResult: boolean;
  isCorrect: boolean;
  selectedOption: ClozeOption | null;
  correctOption: ClozeOption | undefined;
  showTranslation: boolean;
}

const GAP_SEPARATOR = '______';

export function ClozePhrase({
  phrase,
  textWithGap,
  isCurrentPhrase,
  showResult,
  isCorrect,
  selectedOption,
  correctOption,
  showTranslation,
}: ClozePhraseProps) {
  const getContainerClassName = (): string => {
    if (!isCurrentPhrase) return '';

    return 'bg-lf-primary/10 dark:bg-lf-primary/20 rounded-lg p-3 border-2 border-lf-primary/30 dark:border-lf-primary/40';
  };

  const getTextClassName = (): string => {
    const baseClasses = 'text-lg font-medium leading-relaxed';
    const colorClasses = 'text-lf-dark dark:text-white';
    const opacityClasses = isCurrentPhrase ? '' : 'opacity-60';

    return `${baseClasses} ${colorClasses} ${opacityClasses}`;
  };

  const parts = textWithGap.split(GAP_SEPARATOR);

  return (
    <div className={getContainerClassName()}>
      <p className={getTextClassName()}>
        {parts.map((part, index, array) => (
          <span key={index}>
            {part}
            {index < array.length - 1 && (
              <ClozeInput
                showResult={showResult}
                isCorrect={isCorrect}
                selectedOption={selectedOption}
                correctOption={correctOption}
              />
            )}
          </span>
        ))}
      </p>
      {!isCurrentPhrase && showTranslation && (
        <p className="text-xs text-lf-muted dark:text-lf-muted/70 mt-1">
          {phrase.translation}
        </p>
      )}
    </div>
  );
}
