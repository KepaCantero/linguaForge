'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vocabulary, VocabularyOption } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';
import Image from 'next/image';

interface VocabularyExerciseProps {
  exercise: Vocabulary;
  onComplete: (correct: boolean) => void;
}

export function VocabularyExercise({ exercise, onComplete }: VocabularyExerciseProps) {
  const { addXP } = useGamificationStore();
  const [selectedOption, setSelectedOption] = useState<VocabularyOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = useCallback(
    (option: VocabularyOption) => {
      if (showResult) return;

      // Feedback háptico en móviles
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }

      setSelectedOption(option);
      setIsCorrect(option.isCorrect);
      setShowResult(true);

      // Dar XP
      addXP(option.isCorrect ? XP_RULES.vocabularyCorrect : XP_RULES.vocabularyIncorrect);

      // Esperar antes de continuar
      setTimeout(() => {
        onComplete(option.isCorrect);
      }, 2000);
    },
    [showResult, addXP, onComplete]
  );

  const correctOption = exercise.options.find((o) => o.isCorrect);

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Selecciona la palabra que corresponde a la imagen
        </span>
      </div>

      {/* Imagen */}
      <motion.div
        className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={exercise.imageUrl}
          alt={exercise.word}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </motion.div>

      {/* Opciones */}
      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((option, index) => {
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
                ${
                  showCorrect
                    ? "bg-emerald-500 text-white ring-4 ring-emerald-300"
                    : showIncorrect
                    ? "bg-red-500 text-white ring-4 ring-red-300"
                    : isSelected
                    ? "bg-indigo-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }
                ${showResult ? "cursor-default opacity-50" : "cursor-pointer"}
                border border-gray-200 dark:border-gray-700
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
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
              ${
                isCorrect
                  ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-2xl mr-2">{isCorrect ? "🎉" : "💡"}</span>
            <span className="font-medium">
              {isCorrect
                ? `¡Correcto! "${exercise.word}" = "${exercise.translation}" (+${XP_RULES.vocabularyCorrect} XP)`
                : `La respuesta correcta es: "${correctOption?.text}" = "${exercise.translation}" (+${XP_RULES.vocabularyIncorrect} XP)`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

