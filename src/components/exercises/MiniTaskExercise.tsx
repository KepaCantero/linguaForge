'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MiniTask } from '@/types';
import { useInputStore } from '@/store/useInputStore';
import { XP_RULES, MINITASK_CONFIG } from '@/lib/constants';
import {
  useExerciseGamification,
  useExerciseUI,
  useFeedbackAnimation,
} from './hooks';

interface MiniTaskExerciseProps {
  miniTask: MiniTask;
  languageCode: string;
  levelCode: string;
  onComplete: (success: boolean) => void;
}

interface ExerciseResult {
  success: boolean;
  matchedKeywords: string[];
}

const COMPLETE_DELAY = 2500;

function calculateResult(
  checkKeywords: string[],
  totalKeywords: number
): ExerciseResult {
  const keywordPercentage = (checkKeywords.length / totalKeywords) * 100;
  const success = keywordPercentage >= MINITASK_CONFIG.minKeywordsPercent;
  return { success, matchedKeywords: checkKeywords };
}

function getKeywordClassName(isMatched: boolean): string {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium transition-all';
  
  if (isMatched) {
    return `${baseClasses} bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 ring-2 ring-accent-400`;
  }
  
  return `${baseClasses} bg-calm-bg-secondary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary`;
}

function getSubmitButtonClassName(canSubmit: boolean): string {
  const baseClasses = 'flex-1 py-3 rounded-2xl font-bold transition-all';
  
  if (canSubmit) {
    return `${baseClasses} bg-gradient-to-r from-accent-500 to-sky-500 text-white shadow-lg hover:shadow-xl`;
  }
  
  return `${baseClasses} bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-muted cursor-not-allowed`;
}

function getResultContainerClassName(isSuccess: boolean | undefined): string {
  const baseClasses = 'rounded-2xl p-6 text-center';
  
  if (isSuccess) {
    return `${baseClasses} bg-gradient-to-br from-accent-400 to-sky-500`;
  }
  
  return `${baseClasses} bg-gradient-to-br from-amber-400 to-semantic-error`;
}

function getResultKeywordClassName(isMatched: boolean): string {
  const baseClasses = 'px-2 py-1 rounded text-xs';
  
  if (isMatched) {
    return `${baseClasses} bg-white/30 text-white`;
  }
  
  return `${baseClasses} bg-white/10 text-white/50`;
}

function getResultTextContent(result: ExerciseResult | null): {
  emoji: string;
  title: string;
  message: string;
} {
  if (result?.success) {
    return {
      emoji: '🎉',
      title: '¡Excelente trabajo!',
      message: `+${XP_RULES.miniTaskComplete} XP y +20 monedas`,
    };
  }
  
  return {
    emoji: '💪',
    title: '¡Buen intento!',
    message: 'Intenta incluir más keywords la próxima vez',
  };
}

export function MiniTaskExercise({
  miniTask,
  languageCode,
  levelCode,
  onComplete,
}: MiniTaskExerciseProps) {
  // Use shared hooks
  const { grantReward } = useExerciseGamification();
  const { showHint, toggleHint } = useExerciseUI();
  const { showFeedback } = useFeedbackAnimation();

  // Local state
  const { addWordsSpoken } = useInputStore();
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const checkKeywords = useMemo(() => {
    if (!userInput.trim()) return [];

    const inputLower = userInput.toLowerCase();
    return miniTask.keywords.filter(keyword =>
      inputLower.includes(keyword.toLowerCase())
    );
  }, [userInput, miniTask.keywords]);

  const wordCount = useMemo(() => {
    return userInput.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [userInput]);

  const handleSuccess = useCallback(() => {
    grantReward({
      baseXP: XP_RULES.miniTaskComplete,
      coins: 20,
    });
    addWordsSpoken(
      languageCode as 'fr' | 'de',
      levelCode as 'A1' | 'A2',
      wordCount
    );
    showFeedback('success', `¡Excelente trabajo! +${XP_RULES.miniTaskComplete} XP y +20 monedas`);
    setTimeout(() => onComplete(true), COMPLETE_DELAY);
  }, [grantReward, addWordsSpoken, languageCode, levelCode, wordCount, onComplete, showFeedback]);

  const handleFailure = useCallback(() => {
    setTimeout(() => onComplete(false), COMPLETE_DELAY);
  }, [onComplete]);

  const handleSubmit = useCallback(() => {
    if (wordCount < miniTask.minWords) return;

    const exerciseResult = calculateResult(checkKeywords, miniTask.keywords.length);
    setResult(exerciseResult);
    setSubmitted(true);

    if (exerciseResult.success) {
      handleSuccess();
    } else {
      handleFailure();
    }
  }, [wordCount, miniTask, checkKeywords, handleSuccess, handleFailure]);

  const renderKeyword = (keyword: string) => {
    const isMatched = checkKeywords.includes(keyword);
    return (
      <span
        key={keyword}
        className={getKeywordClassName(isMatched)}
      >
        {isMatched && <span className="mr-1">✓</span>}
        {keyword}
      </span>
    );
  };

  const renderResultKeyword = (keyword: string) => {
    const isMatched = result?.matchedKeywords.includes(keyword) ?? false;
    return (
      <span
        key={keyword}
        className={getResultKeywordClassName(isMatched)}
      >
        {isMatched ? '✓' : '✗'} {keyword}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-br from-sky-500 to-accent-600 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">💬</span>
          <div>
            <p className="text-lg font-medium mb-2">{miniTask.prompt}</p>
            <p className="text-white/70 text-sm">{miniTask.promptTranslation}</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4">
        <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mb-3">
          Intenta incluir estas palabras:
        </p>
        <div className="flex flex-wrap gap-2">
          {miniTask.keywords.map(renderKeyword)}
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Escribe tu respuesta en francés..."
              className="w-full h-32 p-4 bg-white dark:bg-calm-bg-elevated border border-calm-warm-100 dark:border-calm-warm-200 rounded-2xl resize-none focus:ring-2 focus:ring-accent-500 focus:border-transparent text-calm-text-primary dark:text-white placeholder-calm-text-muted"
              disabled={submitted}
            />
            <div className="absolute bottom-3 right-3 text-sm text-calm-text-muted">
              {wordCount}/{miniTask.minWords} palabras mínimo
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-white dark:bg-calm-bg-elevated rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-calm-text-muted dark:text-calm-text-muted">Keywords</span>
                <span className={`font-bold ${checkKeywords.length > 0 ? 'text-accent-500' : 'text-calm-text-muted'}`}>
                  {checkKeywords.length}/{miniTask.keywords.length}
                </span>
              </div>
              <div className="w-full h-1.5 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all"
                  style={{ width: `${(checkKeywords.length / miniTask.keywords.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-calm-bg-elevated rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-calm-text-muted dark:text-calm-text-muted">Palabras</span>
                <span className={`font-bold ${wordCount >= miniTask.minWords ? 'text-accent-500' : 'text-calm-text-muted'}`}>
                  {wordCount}
                </span>
              </div>
              <div className="w-full h-1.5 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (wordCount / miniTask.minWords) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleHint}
              className="px-4 py-3 bg-calm-bg-secondary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary rounded-2xl hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary transition-all"
            >
              {showHint ? 'Ocultar ejemplo' : 'Ver ejemplo'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={wordCount < miniTask.minWords}
              className={getSubmitButtonClassName(wordCount >= miniTask.minWords)}
            >
              Enviar respuesta
            </button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                className="bg-sky-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800 rounded-2xl p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm text-accent-600 dark:text-accent-400 font-medium mb-1">
                  Ejemplo de respuesta:
                </p>
                <p className="text-calm-text-secondary dark:text-calm-text-tertiary italic">
                  {miniTask.exampleResponse}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          className={getResultContainerClassName(result?.success)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-5xl mb-4 block">
            {getResultTextContent(result).emoji}
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            {getResultTextContent(result).title}
          </h3>
          <p className="text-white/80 mb-4">
            {getResultTextContent(result).message}
          </p>

          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-sm mb-2">
              Keywords encontradas: {result?.matchedKeywords.length}/{miniTask.keywords.length}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {miniTask.keywords.map(renderResultKeyword)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
