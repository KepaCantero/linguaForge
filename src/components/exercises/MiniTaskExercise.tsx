'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MiniTask } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useInputStore } from '@/store/useInputStore';
import { XP_RULES, MINITASK_CONFIG } from '@/lib/constants';

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

// Calcular resultado del ejercicio
function calculateResult(
  checkKeywords: string[],
  totalKeywords: number
): ExerciseResult {
  const keywordPercentage = (checkKeywords.length / totalKeywords) * 100;
  const success = keywordPercentage >= MINITASK_CONFIG.minKeywordsPercent;
  return { success, matchedKeywords: checkKeywords };
}

// Retraso para completar
const COMPLETE_DELAY = 2500;

export function MiniTaskExercise({
  miniTask,
  languageCode,
  levelCode,
  onComplete,
}: MiniTaskExerciseProps) {
  const { addXP, addCoins } = useGamificationStore();
  const { addWordsSpoken } = useInputStore();
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [showExample, setShowExample] = useState(false);

  // Verificar keywords encontradas
  const checkKeywords = useMemo(() => {
    if (!userInput.trim()) return [];

    const inputLower = userInput.toLowerCase();
    return miniTask.keywords.filter(keyword =>
      inputLower.includes(keyword.toLowerCase())
    );
  }, [userInput, miniTask.keywords]);

  // Contar palabras
  const wordCount = useMemo(() => {
    return userInput.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [userInput]);

  // Manejar respuesta exitosa
  const handleSuccess = useCallback(() => {
    addXP(XP_RULES.miniTaskComplete);
    addCoins(20);
    addWordsSpoken(
      languageCode as 'fr' | 'de',
      levelCode as 'A1' | 'A2',
      wordCount
    );
    setTimeout(() => onComplete(true), COMPLETE_DELAY);
  }, [addXP, addCoins, addWordsSpoken, languageCode, levelCode, wordCount, onComplete]);

  // Manejar respuesta fallida
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

  return (
    <div className="space-y-6">
      {/* Prompt */}
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

      {/* Keywords a incluir */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4">
        <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mb-3">
          Intenta incluir estas palabras:
        </p>
        <div className="flex flex-wrap gap-2">
          {miniTask.keywords.map((keyword) => {
            const isMatched = checkKeywords.includes(keyword);
            return (
              <span
                key={keyword}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-all
                  ${isMatched
                    ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 ring-2 ring-accent-400'
                    : 'bg-calm-bg-secondary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary'
                  }
                `}
              >
                {isMatched && <span className="mr-1">✓</span>}
                {keyword}
              </span>
            );
          })}
        </div>
      </div>

      {/* Área de texto */}
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

          {/* Indicadores */}
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

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowExample(!showExample)}
              className="px-4 py-3 bg-calm-bg-secondary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary rounded-2xl hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary transition-all"
            >
              {showExample ? 'Ocultar ejemplo' : 'Ver ejemplo'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={wordCount < miniTask.minWords}
              className={`
                flex-1 py-3 rounded-2xl font-bold transition-all
                ${wordCount >= miniTask.minWords
                  ? 'bg-gradient-to-r from-accent-500 to-sky-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-muted cursor-not-allowed'
                }
              `}
            >
              Enviar respuesta
            </button>
          </div>

          {/* Ejemplo */}
          <AnimatePresence>
            {showExample && (
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
        /* Resultado */
        <motion.div
          className={`
            rounded-2xl p-6 text-center
            ${result?.success
              ? 'bg-gradient-to-br from-accent-400 to-sky-500'
              : 'bg-gradient-to-br from-amber-400 to-semantic-error'
            }
          `}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-5xl mb-4 block">
            {result?.success ? '🎉' : '💪'}
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            {result?.success ? '¡Excelente trabajo!' : '¡Buen intento!'}
          </h3>
          <p className="text-white/80 mb-4">
            {result?.success
              ? `+${XP_RULES.miniTaskComplete} XP y +20 monedas`
              : 'Intenta incluir más keywords la próxima vez'
            }
          </p>

          {/* Keywords encontradas */}
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-sm mb-2">
              Keywords encontradas: {result?.matchedKeywords.length}/{miniTask.keywords.length}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {miniTask.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className={`
                    px-2 py-1 rounded text-xs
                    ${result?.matchedKeywords.includes(keyword)
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/50'
                    }
                  `}
                >
                  {result?.matchedKeywords.includes(keyword) ? '✓' : '✗'} {keyword}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
