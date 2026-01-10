'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PragmaStrike, PragmaStrikeOption } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';
import Image from 'next/image';

interface PragmaStrikeExerciseProps {
  exercise: PragmaStrike;
  onComplete: (correct: boolean, timeSpent: number) => void;
  mode?: 'academia' | 'desafio';
}

export function PragmaStrikeExercise({ exercise, onComplete, mode = 'desafio' }: PragmaStrikeExerciseProps) {
  const { addXP } = useGamificationStore();
  const [selectedOption, setSelectedOption] = useState<PragmaStrikeOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const timerEnabled = mode === 'desafio';
  const [timeRemaining, setTimeRemaining] = useState(timerEnabled ? exercise.timeLimit : 0);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const handleOptionSelect = useCallback((option: PragmaStrikeOption) => {
    if (showResult) return;

    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    setSelectedOption(option);
    setIsCorrect(option.isCorrect);
    setShowResult(true);
    setTimeSpent(finalTime);
    setTimeRemaining(0);

    // Detener timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calcular XP según velocidad y precisión
    let xpEarned = 0;
    if (option.isCorrect) {
      if (finalTime < 3) {
        xpEarned = XP_RULES.pragmaStrikeFast;
      } else {
        xpEarned = XP_RULES.pragmaStrikeNormal;
      }
    } else {
      xpEarned = XP_RULES.pragmaStrikeIncorrect;
    }

    addXP(xpEarned);

    // Esperar antes de continuar (estandarizado a 2s, explicación en overlay no bloqueante)
    setTimeout(() => {
      onComplete(option.isCorrect, finalTime);
    }, 2000);
  }, [showResult, addXP, onComplete]);

  // Timer countdown (solo en modo desafío)
  useEffect(() => {
    if (showResult) return;

    startTimeRef.current = Date.now();

    // Solo iniciar timer si está habilitado (modo desafío)
    if (timerEnabled) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0.1) {
            // Tiempo agotado - seleccionar automáticamente la primera opción (incorrecta)
            if (!selectedOption) {
              handleOptionSelect(exercise.options[0]);
            }
            return 0;
          }
          return prev - 0.1;
        });
        setTimeSpent((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } else {
      // En modo academia, solo rastrear tiempo transcurrido
      timerRef.current = setInterval(() => {
        setTimeSpent((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showResult, exercise.options, selectedOption, handleOptionSelect, timerEnabled]);

  const correctOption = exercise.options.find(o => o.isCorrect);

  // Presión visual del timer (solo en modo desafío)
  const timerPressure = timerEnabled ? timeRemaining / exercise.timeLimit : 1;
  const isUrgent = timerEnabled && timerPressure < 0.3;

  return (
    <motion.div 
      className="space-y-6"
      animate={isUrgent ? { borderColor: ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.5)", "rgba(239, 68, 68, 0)"] } : {}}
      style={{ borderWidth: isUrgent ? 2 : 0, borderRadius: 16, padding: isUrgent ? 8 : 0 }}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      {/* Instrucción */}
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Selecciona la frase más cortés para esta situación
        </span>
      </div>

      {/* Timer con presión visual (solo en modo desafío) */}
      {timerEnabled && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-xs h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isUrgent ? "bg-red-500" : "bg-indigo-500"
              }`}
              initial={{ width: "100%" }}
              animate={isUrgent ? {
                width: `${timerPressure * 100}%`,
                opacity: [1, 0.6, 1]
              } : { width: `${timerPressure * 100}%` }}
              transition={isUrgent ? { duration: 0.3, repeat: Infinity } : { duration: 0.1, ease: "linear" }}
            />
          </div>
          <motion.div
            className={`text-2xl font-bold ${
              isUrgent ? "text-red-500" : "text-gray-700 dark:text-gray-300"
            }`}
            animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
            transition={isUrgent ? { duration: 0.3, repeat: Infinity } : {}}
          >
            {timeRemaining.toFixed(1)}s
          </motion.div>
          {showResult && timeSpent < 3 && (
            <motion.div
              className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              ⚡ RÁPIDO
            </motion.div>
          )}
        </div>
      )}

      {/* Imagen de situación */}
      <div className="relative w-full h-48 rounded-aaa-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={exercise.situationImage}
          alt={exercise.situationDescription}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {/* Descripción de situación */}
      <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {exercise.situationDescription}
        </p>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 gap-3">
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
                p-4 rounded-aaa-xl font-medium text-left transition-all
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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

      {/* Explicación (solo cuando se muestra resultado) */}
      <AnimatePresence>
        {showResult && selectedOption && (
          <motion.div
            className={`
              p-4 rounded-aaa-xl
              ${isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {isCorrect ? '✅' : '💡'}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isCorrect ? '¡Correcto!' : 'Explicación'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedOption.explanation}
                </p>
                {!isCorrect && correctOption && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-2 font-medium">
                    La respuesta más cortés es: &ldquo;{correctOption.text}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultado final */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className={`
              p-4 rounded-aaa-xl text-center
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
              {isCorrect ? '🎉' : '📚'}
            </span>
            <span className="font-medium">
              {isCorrect
                ? `¡Correcto! +${timeSpent < 3 ? XP_RULES.pragmaStrikeFast : XP_RULES.pragmaStrikeNormal} XP`
                : `Aprendiste algo nuevo! +${XP_RULES.pragmaStrikeIncorrect} XP`
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

