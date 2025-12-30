'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phrase, ClozeOption } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useTTS } from '@/services/ttsService';
import { XP_RULES } from '@/lib/constants';

interface ClozeExerciseProps {
  phrase: Phrase;
  onComplete: (correct: boolean) => void;
}

export function ClozeExercise({ phrase, onComplete }: ClozeExerciseProps) {
  const { addXP } = useGamificationStore();
  const { speak, isSpeaking } = useTTS();
  const [selectedOption, setSelectedOption] = useState<ClozeOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Crear texto con hueco
  const textWithGap = phrase.text.replace(
    phrase.clozeWord,
    '______'
  );

  // Reproducir la frase completa con TTS
  const playPhrase = useCallback(() => {
    speak(phrase.text);
  }, [speak, phrase.text]);

  // Reproducir automáticamente cuando se muestra el resultado correcto
  useEffect(() => {
    if (showResult && isCorrect) {
      const timer = setTimeout(() => {
        speak(phrase.text);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showResult, isCorrect, speak, phrase.text]);

  const handleOptionSelect = useCallback((option: ClozeOption) => {
    if (showResult) return;

    setSelectedOption(option);
    setIsCorrect(option.isCorrect);
    setShowResult(true);

    // Dar XP
    addXP(option.isCorrect ? XP_RULES.clozeCorrect : XP_RULES.clozeIncorrect);

    // Esperar antes de continuar
    setTimeout(() => {
      onComplete(option.isCorrect);
    }, 1500);
  }, [showResult, addXP, onComplete]);

  const correctOption = phrase.clozeOptions.find(o => o.isCorrect);

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Completa la frase
        </span>
      </div>

      {/* Frase con hueco */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
          {textWithGap.split('______').map((part, index, array) => (
            <span key={index}>
              {part}
              {index < array.length - 1 && (
                <span className={`
                  inline-block min-w-24 mx-1 px-3 py-1 rounded-lg font-bold
                  ${showResult
                    ? isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  }
                `}>
                  {showResult
                    ? (isCorrect ? selectedOption?.text : correctOption?.text)
                    : (selectedOption?.text || '?')
                  }
                </span>
              )}
            </span>
          ))}
        </p>

        {/* Traducción */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {phrase.translation}
        </p>

        {/* Botón de audio */}
        <button
          onClick={playPhrase}
          disabled={isSpeaking}
          className={`
            mt-4 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all mx-auto
            ${isSpeaking
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          <motion.span
            animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {isSpeaking ? '🔊' : '🔈'}
          </motion.span>
          <span>{isSpeaking ? 'Reproduciendo...' : 'Escuchar'}</span>
        </button>
      </motion.div>

      {/* Opciones */}
      <div className="grid grid-cols-2 gap-3">
        {phrase.clozeOptions.map((option, index) => {
          const isSelected = selectedOption?.id === option.id;
          const showCorrect = showResult && option.isCorrect;
          const showIncorrect = showResult && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              disabled={showResult}
              className={`
                p-4 rounded-xl font-medium text-center transition-all
                ${showCorrect
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                  : showIncorrect
                    ? 'bg-red-500 text-white ring-4 ring-red-300'
                    : isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
                border border-gray-200 dark:border-gray-700
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
            >
              {option.text}
              {showCorrect && <span className="ml-2">✓</span>}
              {showIncorrect && <span className="ml-2">✗</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className={`
              p-4 rounded-xl text-center
              ${isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-2xl mr-2">
              {isCorrect ? '🎉' : '💡'}
            </span>
            <span className="font-medium">
              {isCorrect
                ? `¡Correcto! +${XP_RULES.clozeCorrect} XP`
                : `La respuesta correcta era: ${correctOption?.text}`
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
