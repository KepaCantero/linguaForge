'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';

type LessonMode = 'academia' | 'desafio';

function PracticeModeSelection() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');

  const { nodes } = useImportedNodesStore();
  const node = nodes.find((n) => n.id === nodeId);
  const subtopic = node?.subtopics.find((s) => s.id === subtopicId);

  if (!node || !subtopic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Subtema no encontrado</p>
          <Link
            href={`/learn/imported/${nodeId}`}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver al nodo
          </Link>
        </div>
      </div>
    );
  }

  const handleModeSelect = (mode: LessonMode) => {
    // Redirigir a la página de ejercicios con el modo seleccionado
    router.push(`/learn/imported/${nodeId}/exercises?subtopic=${subtopicId}&mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/learn/imported/${nodeId}`}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">{node.icon}</span>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {subtopic.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subtopic.phrases.length} frases
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Elige tu modo de práctica
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona cómo quieres practicar estas frases
          </p>
        </div>

        {/* Mode selection */}
        <div className="space-y-4">
          {/* Academia Mode */}
          <motion.button
            onClick={() => handleModeSelect('academia')}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-indigo-500 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Academia
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modo de entrenamiento
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                Recomendado
              </span>
            </div>
            <div className="mt-4 pl-12 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>✓</span>
                <span>Sin límite de tiempo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>✓</span>
                <span>Con pistas y explicaciones</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>✓</span>
                <span>Reintentos ilimitados</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>✓</span>
                <span>XP 1.0x</span>
              </div>
            </div>
          </motion.button>

          {/* Desafío Mode */}
          <motion.button
            onClick={() => handleModeSelect('desafio')}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left border-2 border-transparent hover:border-purple-500 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Desafío
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modo competitivo
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
                Difícil
              </span>
            </div>
            <div className="mt-4 pl-12 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>⏱️</span>
                <span>Límite de tiempo: 15 minutos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>🚫</span>
                <span>Sin pistas ni explicaciones</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>🚫</span>
                <span>Sin reintentos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>💎</span>
                <span>XP 1.5x + Gemas</span>
              </div>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <PracticeModeSelection />
    </Suspense>
  );
}

