'use client';

import { useState, useCallback, useEffect } from 'react';
import { Phrase, ClozeOption, ConversationalBlock } from '@/types';
import { XP_RULES } from '@/lib/constants';
import type { SoundId } from '@/lib/soundEffects';
import { useExerciseGamification, useExerciseUI, useKeyboardShortcuts, useExerciseAudio } from '../../hooks';

interface ClozeState {
  selectedOption: ClozeOption | null;
  showResult: boolean;
  isCorrect: boolean;
  showTranslation: boolean;
}

interface ClozeActions {
  selectOption: (option: ClozeOption) => void;
  toggleTranslation: () => void;
}

interface ClozeDerivedState {
  textWithGap: string;
  phrasesToShow: Phrase[];
  fullBlockText: string;
  correctOption: ClozeOption | undefined;
}

const AUTO_CONTINUE_DELAY = 2000;
const CORRECT_AUDIO_DELAY = 500;
const KEYBOARD_OPTIONS = 4;

interface UseClozeStateOptions {
  phrase: Phrase;
  block?: ConversationalBlock;
  onComplete: (correct: boolean) => void;
  speak: (text: string) => void;
  soundEnabled: boolean;
  play: (soundId: SoundId) => void;
  playCorrect: () => void;
  playIncorrect: () => void;
}

export function useClozeState({
  phrase,
  block,
  onComplete,
  speak,
  soundEnabled,
  play,
  playCorrect,
  playIncorrect,
}: UseClozeStateOptions): ClozeState & ClozeActions & ClozeDerivedState {
  // Use shared hooks
  const { grantReward } = useExerciseGamification();
  const { showTranslation, toggleTranslation } = useExerciseUI();

  // Local state
  const [selectedOption, setSelectedOption] = useState<ClozeOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Derived state
  const textWithGap = phrase.text.replace(phrase.clozeWord, '______');
  const phrasesToShow = block?.phrases || [phrase];
  const fullBlockText = block
    ? block.phrases.map((p) => p.text).join(' ')
    : phrase.text;
  const correctOption = phrase.clozeOptions.find((o) => o.isCorrect);

  // Handle option selection
  const selectOption = useCallback(
    (option: ClozeOption) => {
      if (showResult) return;

      // Haptic feedback on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Click sound
      if (soundEnabled) {
        play('click' as SoundId);
      }

      const isCorrectOption = option.isCorrect;

      setSelectedOption(option);
      setIsCorrect(isCorrectOption);
      setShowResult(true);

      // Correct/incorrect sound
      if (soundEnabled) {
        if (isCorrectOption) {
          playCorrect();
        } else {
          playIncorrect();
        }
      }

      // Grant rewards using shared hook
      grantReward({
        baseXP: isCorrectOption ? XP_RULES.clozeCorrect : XP_RULES.clozeIncorrect,
      });

      // Auto-continue after delay
      setTimeout(() => {
        onComplete(isCorrectOption);
      }, AUTO_CONTINUE_DELAY);
    },
    [showResult, soundEnabled, play, playCorrect, playIncorrect, grantReward, onComplete]
  );

  // Keyboard shortcuts (1-4 for options)
  useKeyboardShortcuts(
    phrase.clozeOptions.map((option, index) => ({
      key: String(index + 1),
      handler: () => selectOption(option),
      description: `Select option ${index + 1}`,
      enabled: !showResult,
    }))
  );

  // Auto-play audio on correct answer
  useEffect(() => {
    if (showResult && isCorrect) {
      const timer = setTimeout(() => {
        speak(fullBlockText);
      }, CORRECT_AUDIO_DELAY);
      return () => clearTimeout(timer);
    }
  }, [showResult, isCorrect, speak, fullBlockText]);

  return {
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
  };
}
