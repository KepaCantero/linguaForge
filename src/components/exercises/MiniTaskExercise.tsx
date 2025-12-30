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
  const [result, setResult] = useState<{ success: boolean; matchedKeywords: string[] } | null>(null);
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

  const handleSubmit = useCallback(() => {
    if (wordCount < miniTask.minWords) return;

    const matchedKeywords = checkKeywords;
    const keywordPercentage = (matchedKeywords.length / miniTask.keywords.length) * 100;
    const success = keywordPercentage >= MINITASK_CONFIG.minKeywordsPercent;

    setResult({ success, matchedKeywords });
    setSubmitted(true);

    if (success) {
      addXP(XP_RULES.miniTaskComplete);
      addCoins(20);
      // Registrar palabras habladas/escritas
      addWordsSpoken(
        languageCode as 'fr' | 'de',
        levelCode as 'A1' | 'A2',
        wordCount
      );
    }

    setTimeout(() => {
      onComplete(success);
    }, 2500);
  }, [wordCount, miniTask, checkKeywords, addXP, addCoins, addWordsSpoken, languageCode, levelCode, onComplete]);

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <motion.div
        className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
              className="w-full h-32 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              disabled={submitted}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-400">
              {wordCount}/{miniTask.minWords} palabras mínimo
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Keywords</span>
                <span className={`font-bold ${checkKeywords.length > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {checkKeywords.length}/{miniTask.keywords.length}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(checkKeywords.length / miniTask.keywords.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Palabras</span>
                <span className={`font-bold ${wordCount >= miniTask.minWords ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {wordCount}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (wordCount / miniTask.minWords) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowExample(!showExample)}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              {showExample ? 'Ocultar ejemplo' : 'Ver ejemplo'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={wordCount < miniTask.minWords}
              className={`
                flex-1 py-3 rounded-xl font-bold transition-all
                ${wordCount >= miniTask.minWords
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
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
                className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                  Ejemplo de respuesta:
                </p>
                <p className="text-gray-700 dark:text-gray-300 italic">
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
            rounded-xl p-6 text-center
            ${result?.success
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : 'bg-gradient-to-br from-orange-400 to-red-500'
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
