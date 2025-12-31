'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockBuilder } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';

interface BlockBuilderExerciseProps {
  exercise: BlockBuilder;
  onComplete: (correct: boolean) => void;
}

type BlockBuilderPhase = 'building' | 'complete';

export function BlockBuilderExercise({ exercise, onComplete }: BlockBuilderExerciseProps) {
  const { addXP } = useGamificationStore();
  const [phase, setPhase] = useState<BlockBuilderPhase>('building');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Combinar componentes correctos con distractores
  const allComponents = useMemo(() => {
    const correct = exercise.components;
    const distractors = exercise.distractors || [];
    return [...correct, ...distractors].sort(() => Math.random() - 0.5);
  }, [exercise.components, exercise.distractors]);

  const handleComponentClick = useCallback((componentId: string) => {
    if (showResult) return;

    // Feedback háptico
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setSelectedComponents((prev) => {
      if (prev.includes(componentId)) {
        // Deseleccionar
        return prev.filter((id) => id !== componentId);
      } else {
        // Agregar en orden
        return [...prev, componentId];
      }
    });
  }, [showResult]);

  const handleConfirm = useCallback(() => {
    if (selectedComponents.length < 4) return;

    // Verificar si el orden es correcto
    const correctOrder = exercise.components
      .filter((c) => c.isCorrect)
      .sort((a, b) => a.position - b.position)
      .map((c) => c.id);

    const isOrderCorrect = JSON.stringify(selectedComponents) === JSON.stringify(correctOrder);
    setIsCorrect(isOrderCorrect);
    setShowResult(true);

    // Calcular XP
    if (isOrderCorrect) {
      addXP(XP_RULES.clozeCorrect || 20);
    } else {
      addXP(XP_RULES.clozeIncorrect || 5);
    }

    setTimeout(() => {
      onComplete(isOrderCorrect);
    }, 2000);
  }, [selectedComponents, exercise.components, addXP, onComplete]);

  const getComponentById = useCallback((id: string) => {
    return [...exercise.components, ...(exercise.distractors || [])].find((c) => c.id === id);
  }, [exercise.components, exercise.distractors]);

  const correctOrder = useMemo(() => {
    return exercise.components
      .filter((c) => c.isCorrect)
      .sort((a, b) => a.position - b.position);
  }, [exercise.components]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🧱 Construye el Bloque Conversacional
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Arrastra los componentes en el orden correcto: Inicio → Desarrollo → Resolución → Cierre
        </p>
      </div>

      {/* Área de construcción */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600">
        {selectedComponents.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            Arrastra los componentes aquí
          </div>
        ) : (
          <div className="space-y-2">
            {selectedComponents.map((componentId, index) => {
              const component = getComponentById(componentId);
              if (!component) return null;

              const isInCorrectPosition = correctOrder[index]?.id === componentId;
              const componentTypeLabels = {
                inicio: 'Inicio',
                desarrollo: 'Desarrollo',
                resolucion: 'Resolución',
                cierre: 'Cierre',
              };

              return (
                <motion.div
                  key={componentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${showResult
                      ? isInCorrectPosition
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {componentTypeLabels[component.componentType]} {index + 1}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {component.text}
                      </p>
                      {showResult && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {component.translation}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleComponentClick(componentId)}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Componentes disponibles */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Componentes disponibles:
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {allComponents
            .filter((c) => !selectedComponents.includes(c.id))
            .map((component) => {
              const componentTypeLabels = {
                inicio: 'Inicio',
                desarrollo: 'Desarrollo',
                resolucion: 'Resolución',
                cierre: 'Cierre',
              };

              return (
                <motion.button
                  key={component.id}
                  onClick={() => handleComponentClick(component.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                >
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    {componentTypeLabels[component.componentType]}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{component.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {component.translation}
                  </p>
                </motion.button>
              );
            })}
        </div>
      </div>

      {/* Botón de confirmar */}
      {selectedComponents.length >= 4 && !showResult && (
        <motion.button
          onClick={handleConfirm}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Confirmar Bloque
        </motion.button>
      )}

      {/* Resultado */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            rounded-xl p-6 text-center
            ${isCorrect
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : 'bg-gradient-to-br from-orange-400 to-red-500'
            }
          `}
        >
          <span className="text-5xl mb-2 block">
            {isCorrect ? '🎉' : '📝'}
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            {isCorrect ? '¡Bloque Correcto!' : 'Bloque Incorrecto'}
          </h3>
          <p className="text-white/90 text-sm">
            {isCorrect
              ? 'Has construido el bloque conversacional correctamente.'
              : 'Intenta de nuevo. Recuerda: Inicio → Desarrollo → Resolución → Cierre'}
          </p>
        </motion.div>
      )}
    </div>
  );
}

