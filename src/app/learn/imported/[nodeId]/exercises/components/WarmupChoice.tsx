'use client';

import { motion } from 'framer-motion';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
type WarmupType = 'rhythm' | 'visual' | null;

interface WarmupChoiceProps {
  subtopicId: string | null;
  nodeId: string;
  onSelectWarmup: (warmup: WarmupType) => void;
  onSkipWarmup: () => void;
}

export function WarmupChoice({ subtopicId, nodeId, onSelectWarmup, onSkipWarmup }: WarmupChoiceProps) {
  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = node?.subtopics.find((s) => s.id === subtopicId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {subtopic?.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Calentamiento mental (opcional)
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¿Quieres calentar tu cerebro?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Prepara tu mente con un ejercicio rápido antes de comenzar
          </p>
        </div>

        <div className="space-y-4">
          {/* Ritmo y Memoria */}
          <motion.button
            onClick={() => onSelectWarmup('rhythm')}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-indigo-500 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎵</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ritmo y Memoria</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Repite secuencias rítmicas
                </p>
              </div>
            </div>
            <div className="pl-12 text-sm text-gray-500 dark:text-gray-400">
              ⏱️ 1-2 minutos • 🧠 Mejora atención auditiva
            </div>
          </motion.button>

          {/* Asociación Visual */}
          <motion.button
            onClick={() => onSelectWarmup('visual')}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-indigo-500 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asociación Visual</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Encuentra las parejas
                </p>
              </div>
            </div>
            <div className="pl-12 text-sm text-gray-500 dark:text-gray-400">
              ⏱️ 1-2 minutos • 👁️ Activa visión espacial
            </div>
          </motion.button>

          {/* Saltar warmup */}
          <motion.button
            onClick={onSkipWarmup}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 text-center border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-600 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">▶️</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Saltar al menú de ejercicios
              </span>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}