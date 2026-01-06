'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { useNodeProgressStore, useNodeProgress } from '@/store/useNodeProgressStore';
import { getTranslations } from '@/i18n';
import { GUIDED_NODES } from '@/components/learn/CourseMap';

// Definición de lecciones por nodo
// Los IDs deben coincidir con los archivos en public/content/fr/A0/base-absoluta/
interface LessonDef {
  id: string;
  title: string;
  titleFr?: string;
}

const NODE_LESSONS: Record<string, LessonDef[]> = {
  // ÁREA 0 - Base Absoluta (contenido real de A0)
  'node-1': [
    { id: 'nodo-0-1-saludos', title: 'Saludos y Despedidas', titleFr: 'Salutations et adieux' },
    { id: 'nodo-0-2-numeros-tiempo', title: 'Números y Tiempo', titleFr: 'Nombres et temps' },
  ],
  'node-2': [
    { id: 'nodo-0-3-verbos-clave', title: 'Verbos Clave', titleFr: 'Verbes clés' },
    { id: 'nodo-0-4-supervivencia-inmediata', title: 'Supervivencia Inmediata', titleFr: 'Survie immédiate' },
  ],
  'node-3': [
    { id: 'nodo-0-5-objetos-cotidianos', title: 'Objetos Cotidianos', titleFr: 'Objets quotidiens' },
  ],
  'node-4': [
    { id: 'nodo-0-6-recuperacion', title: 'Estrategias de Recuperación', titleFr: 'Stratégies de récupération' },
  ],
  'node-5': [
    { id: 'nodo-0-7-digital', title: 'Interacción Digital', titleFr: 'Interaction numérique' },
  ],
};

export default function NodePage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.nodeId as string;
  const { appLanguage } = useUserStore();
  const t = getTranslations(appLanguage);
  const nodeProgress = useNodeProgress(nodeId);
  const { initGuidedNodes, isNodeUnlocked } = useNodeProgressStore();

  // Inicializar progreso al cargar
  useEffect(() => {
    initGuidedNodes(GUIDED_NODES.map((n) => n.id));
  }, [initGuidedNodes]);

  // Encontrar el nodo
  const node = GUIDED_NODES.find((n) => n.id === nodeId);

  // Verificar acceso
  const hasAccess = isNodeUnlocked(nodeId);

  // Obtener lecciones del nodo
  const lessons = useMemo(() => {
    return NODE_LESSONS[nodeId] || [
      { id: `${nodeId}-lesson-1`, title: 'Lección 1' },
      { id: `${nodeId}-lesson-2`, title: 'Lección 2' },
      { id: `${nodeId}-lesson-3`, title: 'Lección 3' },
      { id: `${nodeId}-lesson-4`, title: 'Lección 4' },
    ];
  }, [nodeId]);

  // Verificar si una lección está completada
  const isLessonCompleted = (lessonId: string) => {
    return nodeProgress?.completedLessons.includes(lessonId) ?? false;
  };

  // Encontrar la primera lección no completada
  const nextLessonIndex = useMemo(() => {
    const completedLessons = nodeProgress?.completedLessons ?? [];
    for (let i = 0; i < lessons.length; i++) {
      if (!completedLessons.includes(lessons[i].id)) {
        return i;
      }
    }
    return lessons.length; // Todas completadas
  }, [lessons, nodeProgress?.completedLessons]);

  const handleContinue = () => {
    if (nextLessonIndex < lessons.length) {
      router.push(`/learn/node/${nodeId}/lesson/${lessons[nextLessonIndex].id}`);
    }
  };

  if (!node) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Nodo no encontrado</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Nodo bloqueado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Completa el nodo anterior para desbloquear este.
        </p>
        <Link
          href="/learn"
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          ← Volver al mapa
        </Link>
      </div>
    );
  }

  const nodeTranslations = t.learn.nodes[node.category as keyof typeof t.learn.nodes];
  const progress = nodeProgress?.percentage ?? 0;
  const isComplete = nodeProgress?.isComplete ?? false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/learn"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t.common.back}
          </Link>
        </div>
      </header>

      {/* Node header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
              isComplete
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-indigo-100 dark:bg-indigo-900/30'
            }`}>
              {isComplete ? '✓' : node.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {nodeTranslations.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {nodeTranslations.description}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{t.learn.progress}</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <main className="max-w-lg mx-auto px-4 pt-6">
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson.id);
            const isNext = index === nextLessonIndex;
            const isLocked = index > nextLessonIndex;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={isLocked ? '#' : `/learn/node/${nodeId}/lesson/${lesson.id}`}
                  onClick={(e) => isLocked && e.preventDefault()}
                  className={`block p-4 rounded-xl border-2 transition-all ${
                    completed
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : isNext
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-300 dark:ring-indigo-700'
                      : isLocked
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          completed
                            ? 'bg-green-500 text-white'
                            : isNext
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {completed ? '✓' : isLocked ? '🔒' : index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {lesson.title}
                      </span>
                    </div>
                    {!isLocked && <span className="text-gray-400">→</span>}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Continue button */}
        {!isComplete && (
          <div className="mt-8">
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              {progress > 0 ? t.learn.continue : t.learn.start} →
            </button>
          </div>
        )}

        {/* Completion message */}
        {isComplete && (
          <motion.div
            className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">
              ¡Nodo completado!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              Has desbloqueado el siguiente nodo.
            </p>
            <Link
              href="/learn"
              className="inline-block mt-4 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver el mapa
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
