'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useNodeProgressStore } from '@/store/useNodeProgressStore';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { getTranslations } from '@/i18n';
import { CourseMap, GUIDED_NODES } from '@/components/learn/CourseMap';

export default function LearnPage() {
  const router = useRouter();
  const { appLanguage, mode, hasCompletedOnboarding } = useUserStore();
  const { nodes, initGuidedNodes } = useNodeProgressStore();
  const t = getTranslations(appLanguage);

  // Redirigir al onboarding si no está completado
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  // Inicializar progreso de nodos
  useEffect(() => {
    if (hasCompletedOnboarding) {
      initGuidedNodes(GUIDED_NODES.map((n) => n.id));
    }
  }, [hasCompletedOnboarding, initGuidedNodes]);

  if (!hasCompletedOnboarding) {
    return null; // Mientras redirige
  }

  // Obtener progreso real del store
  const progress = GUIDED_NODES.map((node) => {
    const nodeProgress = nodes[node.id];
    return {
      nodeId: node.id,
      completed: nodeProgress?.percentage ?? 0,
      isLocked: !(nodeProgress?.isUnlocked ?? node.id === 'node-1'),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {t.app.name}
          </h1>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          >
            <span className="text-xl">👤</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-6">
        {mode === 'guided' ? (
          <CourseMap progress={progress} translations={t} />
        ) : (
          <AutonomousView translations={t} />
        )}
      </main>
    </div>
  );
}

// Vista para modo autónomo
function AutonomousView({ translations: t }: { translations: ReturnType<typeof getTranslations> }) {
  const router = useRouter();
  const { nodes, deleteNode } = useImportedNodesStore();

  const hasNodes = nodes.length > 0;

  const handleNodeClick = (nodeId: string) => {
    router.push(`/learn/imported/${nodeId}`);
  };

  const handleDeleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este nodo?')) {
      deleteNode(nodeId);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.learn.title}
        </h2>
        <Link
          href="/import"
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <span>+</span>
          <span>Importar</span>
        </Link>
      </div>

      {hasNodes ? (
        <div className="space-y-4">
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleNodeClick(node.id)}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
            >
              {/* Header del nodo */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">
                  {node.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {node.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {node.sourceType === 'podcast' && '🎙️ Podcast'}
                    {node.sourceType === 'article' && '📰 Artículo'}
                    {node.sourceType === 'youtube' && '▶️ Video'}
                    {' • '}
                    {node.subtopics.length} subtemas
                  </p>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={(e) => handleDeleteNode(e, node.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                  title="Eliminar nodo"
                >
                  🗑️
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="mb-2">
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${node.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{node.percentage}% completado</span>
                <span>
                  {node.completedSubtopics.length}/{node.subtopics.length} subtemas
                </span>
              </div>

              {/* Subtópicos preview */}
              {node.subtopics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {node.subtopics.slice(0, 3).map((subtopic) => (
                    <span
                      key={subtopic.id}
                      className={`text-xs px-2 py-1 rounded-full ${
                        node.completedSubtopics.includes(subtopic.id)
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {subtopic.title}
                    </span>
                  ))}
                  {node.subtopics.length > 3 && (
                    <span className="text-xs px-2 py-1 text-gray-400">
                      +{node.subtopics.length - 3} más
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          {/* Estado vacío */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu mapa está vacío. Importa contenido para crear tus primeros nodos de aprendizaje.
            </p>

            <Link
              href="/import"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              <span>+</span>
              <span>{t.import.title}</span>
            </Link>
          </div>

          {/* Sugerencias de fuentes */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-4">
              Fuentes recomendadas
            </h3>
            <div className="space-y-3">
              {[
                { icon: '🎙️', title: 'One Thing In A French Day', type: 'Podcast' },
                { icon: '📖', title: 'The French Experiment', type: 'Historias' },
                { icon: '📰', title: 'Lawless French', type: 'Artículos' },
              ].map((source, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl"
                >
                  <span className="text-2xl">{source.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{source.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{source.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
