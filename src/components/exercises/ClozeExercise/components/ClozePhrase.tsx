'use client';

import { Fragment } from 'react';
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

    return 'bg-accent-500/10 dark:bg-accent-500/20 rounded-lg p-3 border-2 border-accent-500/30 dark:border-accent-500/40';
  };

  const getTextClassName = (): string => {
    const baseClasses = 'text-lg font-medium leading-relaxed';
    const colorClasses = 'text-calm-text-primary dark:text-white';
    const opacityClasses = isCurrentPhrase ? '' : 'opacity-60';

    return `${baseClasses} ${colorClasses} ${opacityClasses}`;
  };

  const parts = textWithGap.split(GAP_SEPARATOR);

  return (
    <div className={getContainerClassName()}>
      <p className={getTextClassName()}>
        {parts.map((part, index, array) => (
          <Fragment key={`part-${index}-${part.slice(0, 10)}`}>
            {part}
            {index < array.length - 1 && (
              <ClozeInput
                showResult={showResult}
                isCorrect={isCorrect}
                selectedOption={selectedOption}
                correctOption={correctOption}
              />
            )}
          </Fragment>
        ))}
      </p>
      {!isCurrentPhrase && showTranslation && (
        <p className="text-xs text-calm-text-muted dark:text-calm-text-muted/70 mt-1">
          {phrase.translation}
        </p>
      )}
    </div>
  );
}
