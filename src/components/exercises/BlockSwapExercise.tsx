'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
        <h3 className="text-lg font-bold text-calm-text-primary dark:text-white mb-2">
          🔄 Cambia el Componente
        </h3>
        <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">
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
                    ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-300 dark:border-accent-700'
                    : 'bg-semantic-error-bg dark:bg-semantic-error-bg/20 border-semantic-error dark:border-semantic-error'
                  : isSelected
                    ? 'bg-sky-50 dark:bg-accent-900/20 border-accent-400 dark:border-accent-600'
                    : 'bg-white dark:bg-calm-bg-elevated border-calm-warm-100 dark:border-calm-warm-200 hover:border-accent-400 dark:hover:border-accent-600'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-calm-text-primary dark:text-white mb-1">
                    {option.text}
                  </p>
                  <p className="text-xs text-calm-text-secondary dark:text-calm-text-muted mb-2">
                    {option.translation}
                  </p>
                  {showResult && option.newContext && (
                    <p className={`text-xs font-medium ${
                      isValid
                        ? 'text-accent-700 dark:text-accent-300'
                        : 'text-semantic-error-text dark:text-semantic-error-text'
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
            rounded-2xl p-6 text-center
            ${exercise.swapOptions.find((opt) => opt.id === selectedOption)?.createsValidBlock
              ? 'bg-gradient-to-br from-accent-400 to-sky-500'
              : 'bg-gradient-to-br from-amber-400 to-semantic-error'
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

