'use client';

import { useCallback, useEffect } from 'react';
import { Phrase, ConversationalBlock } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useTTS } from '@/services/ttsService';
import { useSoundEffects, useSoundEffectsInit } from '@/hooks/useSoundEffects';
import { useClozeState } from './hooks/useClozeState';
import { ClozeControls } from './components/ClozeControls';
import { ClozeFeedback } from './components/ClozeFeedback';
import { ClozeContext } from './components/ClozeContext';
import { ClozePhrasesContainer } from './components/ClozePhrasesContainer';

interface ClozeExerciseProps {
  phrase: Phrase;
  block?: ConversationalBlock;
  onComplete: (correct: boolean) => void;
}

export function ClozeExercise({ phrase, block, onComplete }: ClozeExerciseProps) {
  const { addXP } = useGamificationStore();
  const { speak, isSpeaking } = useTTS();
  const { play, playCorrect, playIncorrect, enabled: soundEnabled } = useSoundEffects();

  useSoundEffectsInit();

  const {
    selectedOption,
    showResult,
    isCorrect,
    showTranslation,
    selectOption,
    toggleTranslation,
    textWithGap,
    phrasesToShow,
    fullBlockText,
    correctOption,
  } = useClozeState({
    phrase,
    block,
    onComplete,
    speak,
    addXP,
    soundEnabled,
    play,
    playCorrect,
    playIncorrect,
  });

  const handleToggleTranslation = useCallback(() => {
    if (soundEnabled) {
      play('whoosh' as any);
    }
    toggleTranslation();
  }, [soundEnabled, play, toggleTranslation]);

  const playPhrase = useCallback(() => {
    speak(fullBlockText);
  }, [speak, fullBlockText]);

  // Keyboard shortcut: SPACE to play audio
  useEffect(() => {
    if (showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isSpeaking) {
        e.preventDefault();
        playPhrase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, isSpeaking, playPhrase]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {block ? 'Completa la palabra faltante en el contexto' : 'Completa la frase'}
        </span>
      </div>

      {block && <ClozeContext block={block} />}

      <ClozePhrasesContainer
        phrase={phrase}
        block={block}
        phrasesToShow={phrasesToShow}
        textWithGap={textWithGap}
        showResult={showResult}
        isCorrect={isCorrect}
        selectedOption={selectedOption}
        correctOption={correctOption}
        showTranslation={showTranslation}
        fullBlockText={fullBlockText}
        isSpeaking={isSpeaking}
        onToggleTranslation={handleToggleTranslation}
      />

      <ClozeControls
        options={phrase.clozeOptions}
        selectedOption={selectedOption}
        showResult={showResult}
        onOptionSelect={selectOption}
      />

      <ClozeFeedback
        showResult={showResult}
        isCorrect={isCorrect}
        correctOption={correctOption}
      />
    </div>
  );
}
