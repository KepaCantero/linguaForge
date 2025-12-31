'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockSwap } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';

interface BlockSwapExerciseProps {
  exercise: BlockSwap;
  onComplete: (createsValidBlock: boolean) => void;
}

export function BlockSwapExercise({ exercise, onComplete }: BlockSwapExerciseProps) {
  const { addXP } = useGamificationStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = useCallback((optionId: string) => {
    if (showResult) return;

    // Feedback háptico
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setSelectedOption(optionId);
    const option = exercise.swapOptions.find((opt) => opt.id === optionId);
    
    if (option) {
      setShowResult(true);
      const isValid = option.createsValidBlock;

      // Calcular XP
      if (isValid) {
        addXP(XP_RULES.variationRead || 15);
      } else {
        addXP(XP_RULES.clozeIncorrect || 5);
      }

      setTimeout(() => {
        onComplete(isValid);
      }, 2000);
    }
  }, [exercise.swapOptions, showResult, addXP, onComplete]);

  const componentTypeLabels = {
    inicio: 'Inicio',
    desarrollo: 'Desarrollo',
    resolucion: 'Resolución',
    cierre: 'Cierre',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🔄 Cambia el Componente
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cambia el componente <strong>{componentTypeLabels[exercise.componentToSwap]}</strong> para crear una nueva situación
        </p>
      </div>

      {/* Opciones */}
      <div className="space-y-3">
        {exercise.swapOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isValid = option.createsValidBlock;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={showResult}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${showResult
                  ? isValid
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {option.text}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {option.translation}
                  </p>
                  {showResult && option.newContext && (
                    <p className={`text-xs font-medium ${
                      isValid
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {option.newContext}
                    </p>
                  )}
                </div>
                {showResult && (
                  <span className="text-2xl ml-2">
                    {isValid ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Resultado */}
      {showResult && selectedOption && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            rounded-xl p-6 text-center
            ${exercise.swapOptions.find((opt) => opt.id === selectedOption)?.createsValidBlock
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : 'bg-gradient-to-br from-orange-400 to-red-500'
            }
          `}
        >
          <span className="text-5xl mb-2 block">
            {exercise.swapOptions.find((opt) => opt.id === selectedOption)?.createsValidBlock
              ? '✨'
              : '💡'
            }
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            {exercise.swapOptions.find((opt) => opt.id === selectedOption)?.createsValidBlock
              ? '¡Nueva Situación Creada!'
              : 'No es una combinación válida'
            }
          </h3>
          <p className="text-white/90 text-sm">
            {exercise.swapOptions.find((opt) => opt.id === selectedOption)?.newContext || ''}
          </p>
        </motion.div>
      )}
    </div>
  );
}

