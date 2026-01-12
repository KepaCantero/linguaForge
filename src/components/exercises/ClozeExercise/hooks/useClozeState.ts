'use client';

import { useState, useCallback, useEffect } from 'react';
import { Phrase, ClozeOption, ConversationalBlock } from '@/types';
import { XP_RULES } from '@/lib/constants';
import type { SoundId } from '@/lib/soundEffects';

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
  addXP: (amount: number) => void;
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
  addXP,
  soundEnabled,
  play,
  playCorrect,
  playIncorrect,
}: UseClozeStateOptions): ClozeState & ClozeActions & ClozeDerivedState {
  const [state, setState] = useState<ClozeState>({
    selectedOption: null,
    showResult: false,
    isCorrect: false,
    showTranslation: false,
  });

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
      if (state.showResult) return;

      // Haptic feedback on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Click sound
      if (soundEnabled) {
        play('click' as SoundId);
      }

      const isCorrectOption = option.isCorrect;

      setState((prev) => ({
        ...prev,
        selectedOption: option,
        isCorrect: isCorrectOption,
        showResult: true,
      }));

      // Correct/incorrect sound
      if (soundEnabled) {
        if (isCorrectOption) {
          playCorrect();
        } else {
          playIncorrect();
        }
      }

      // Award XP
      addXP(isCorrectOption ? XP_RULES.clozeCorrect : XP_RULES.clozeIncorrect);

      // Auto-continue after delay
      setTimeout(() => {
        onComplete(isCorrectOption);
      }, AUTO_CONTINUE_DELAY);
    },
    [state.showResult, soundEnabled, play, playCorrect, playIncorrect, addXP, onComplete]
  );

  // Toggle translation
  const toggleTranslation = useCallback(() => {
    setState((prev) => ({ ...prev, showTranslation: !prev.showTranslation }));
  }, []);

  // Keyboard shortcuts (1-4 for options, SPACE for audio)
  useEffect(() => {
    if (state.showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyNum = Number.parseInt(e.key, 10);
      if (
        keyNum >= 1 &&
        keyNum <= KEYBOARD_OPTIONS &&
        phrase.clozeOptions[keyNum - 1]
      ) {
        e.preventDefault();
        selectOption(phrase.clozeOptions[keyNum - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.showResult, phrase.clozeOptions, selectOption]);

  // Auto-play audio on correct answer
  useEffect(() => {
    if (state.showResult && state.isCorrect) {
      const timer = setTimeout(() => {
        speak(fullBlockText);
      }, CORRECT_AUDIO_DELAY);
      return () => clearTimeout(timer);
    }
  }, [state.showResult, state.isCorrect, speak, fullBlockText]);

  return {
    ...state,
    selectOption,
    toggleTranslation,
    textWithGap,
    phrasesToShow,
    fullBlockText,
    correctOption,
  };
}
