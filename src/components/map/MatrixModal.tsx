'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Matrix } from '@/types';

interface MatrixModalProps {
  matrix: Matrix;
  worldId: string;
  onStart: (matrixId: string) => void;
  onClose: () => void;
}

const exerciseTypes = [
  { id: 'cloze', name: 'Cloze', icon: '📝', description: 'Completa las frases' },
  { id: 'shadowing', name: 'Shadowing', icon: '🎧', description: 'Repite en voz alta' },
  { id: 'variations', name: 'Variaciones', icon: '💬', description: 'Lee variantes' },
  { id: 'minitask', name: 'Mini Tarea', icon: '✍️', description: 'Producción escrita' },
  { id: 'shardDetection', name: 'Shard Detection', icon: '🔍', description: 'Comprensión flash' },
  { id: 'pragmaStrike', name: 'Pragma Strike', icon: '⚡', description: 'Competencia pragmática' },
  { id: 'resonancePath', name: 'Resonance Path', icon: '🎤', description: 'Entonación nativa' },
  { id: 'echoStream', name: 'Echo Stream', icon: '🌊', description: 'Seguimiento de audio' },
  { id: 'glyphWeaving', name: 'Glyph Weaving', icon: '🎵', description: 'Conexión rítmica' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MatrixModal({ matrix, worldId, onStart, onClose }: MatrixModalProps) {
  const handleStart = () => {
    onStart(matrix.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{matrix.title}</h2>
                <p className="text-indigo-100">{matrix.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Contexto */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contexto:</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{matrix.context}</p>
            </div>

            {/* Ejercicios disponibles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ejercicios disponibles ({matrix.phrases.length} frases)
              </h3>
              
              {/* Ejercicios clásicos */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Ejercicios principales:</p>
                <div className="grid grid-cols-2 gap-3">
                  {exerciseTypes.slice(0, 4).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{exercise.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {exercise.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ejercicios nuevos Core v2.0 */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Ejercicios avanzados (Core v2.0):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {exerciseTypes.slice(4).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{exercise.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {exercise.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {matrix.phrases.length} frases
                  </span>
                </div>
                {matrix.miniTask && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✍️</span>
                    <span className="text-gray-700 dark:text-gray-300">Mini tarea incluida</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleStart}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Comenzar lección
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

