'use client';

import { RhythmSequenceWarmup } from '@/components/warmups/RhythmSequenceWarmup';
import { VisualMatchWarmup } from '@/components/warmups/VisualMatchWarmup';
import type {
  RhythmSequenceConfig,
  VisualMatchConfig,
  TouchAction
} from '@/schemas/warmup';
type WarmupType = 'rhythm' | 'visual' | null;

interface WarmupExerciseProps {
  selectedWarmup: WarmupType;
  onComplete: (score: number) => void;
  onSkip: () => void;
}

const RHYTHM_CONFIG: RhythmSequenceConfig = {
  sequences: [
    {
      pattern: ['tap', 'tap', 'tap'] as TouchAction[],
      duration: 2000,
      bpm: 80,
    },
    {
      pattern: ['tap', 'hold', 'tap'] as TouchAction[],
      duration: 3000,
      bpm: 80,
    },
    {
      pattern: ['swipe', 'tap', 'swipe'] as TouchAction[],
      duration: 2500,
      bpm: 80,
    },
  ],
  visualStyle: 'geometric',
  soundEnabled: true,
};

const VISUAL_CONFIG: VisualMatchConfig = {
  images: [
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🐱',
      category: 'animales',
      blurLevel: 5,
      correctAnswer: 'chat',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🍎',
      category: 'comida',
      blurLevel: 5,
      correctAnswer: 'pomme',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=📚',
      category: 'objetos',
      blurLevel: 5,
      correctAnswer: 'livre',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🏠',
      category: 'lugares',
      blurLevel: 5,
      correctAnswer: 'maison',
    },
    {
      url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=🚗',
      category: 'transporte',
      blurLevel: 5,
      correctAnswer: 'voiture',
    },
  ],
  focusSpeed: 500,
  recognitionThreshold: 0.5,
  speedIncrease: 1.1,
};

export function WarmupExercise({ selectedWarmup, onComplete, onSkip }: WarmupExerciseProps) {
  const getWarmupTitle = () => {
    switch (selectedWarmup) {
      case 'rhythm':
        return 'Ritmo y Memoria';
      case 'visual':
        return 'Asociación Visual';
      default:
        return 'Calentamiento mental';
    }
  };

  const getWarmupSubtitle = () => {
    switch (selectedWarmup) {
      case 'rhythm':
        return 'Repite secuencias rítmicas';
      case 'visual':
        return 'Encuentra las parejas';
      default:
        return 'Calentamiento mental';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onSkip}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-xl">✕</span>
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white">
              {getWarmupTitle()}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getWarmupSubtitle()}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        {selectedWarmup === 'rhythm' && (
          <RhythmSequenceWarmup
            config={RHYTHM_CONFIG}
            onComplete={onComplete}
            onSkip={onSkip}
          />
        )}
        {selectedWarmup === 'visual' && (
          <VisualMatchWarmup
            config={VISUAL_CONFIG}
            onComplete={onComplete}
            onSkip={onSkip}
          />
        )}
      </main>
    </div>
  );
}