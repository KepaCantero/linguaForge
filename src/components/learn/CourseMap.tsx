'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { TranslationKeys } from '@/i18n';

// Los 5 nodos del modo guiado (A0 francés)
export const GUIDED_NODES = [
  { id: 'node-1', icon: '🏠', category: 'accommodation', color: 'blue' },
  { id: 'node-2', icon: '🍽️', category: 'food', color: 'orange' },
  { id: 'node-3', icon: '🚇', category: 'transport', color: 'green' },
  { id: 'node-4', icon: '🏥', category: 'health', color: 'red' },
  { id: 'node-5', icon: '🆘', category: 'recovery', color: 'purple' },
] as const;

type NodeCategory = typeof GUIDED_NODES[number]['category'];

interface NodeProgress {
  nodeId: string;
  completed: number; // 0-100
  isLocked: boolean;
}

interface CourseMapProps {
  progress: NodeProgress[];
  translations: TranslationKeys;
}

const colorClasses: Record<string, { bg: string; border: string; ring: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    ring: 'ring-blue-500',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    ring: 'ring-orange-500',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    ring: 'ring-green-500',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    ring: 'ring-red-500',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    ring: 'ring-purple-500',
  },
};

export function CourseMap({ progress, translations }: CourseMapProps) {
  const t = translations;

  const getNodeProgress = (nodeId: string): NodeProgress => {
    return progress.find((p) => p.nodeId === nodeId) || {
      nodeId,
      completed: 0,
      isLocked: nodeId !== 'node-1', // Solo el primero desbloqueado por defecto
    };
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Título */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {t.learn.title}
      </h2>

      {/* Nodos */}
      <div className="relative">
        {/* Línea conectora */}
        <div className="absolute left-8 top-12 bottom-12 w-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

        <div className="space-y-4 relative">
          {GUIDED_NODES.map((node, index) => {
            const nodeProgress = getNodeProgress(node.id);
            const colors = colorClasses[node.color];
            const nodeTranslations = t.learn.nodes[node.category as NodeCategory];
            const isCompleted = nodeProgress.completed >= 100;
            const isActive = !nodeProgress.isLocked && !isCompleted;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={nodeProgress.isLocked ? '#' : `/learn/node/${node.id}`}
                  className={`
                    block relative pl-20 pr-4 py-4 rounded-2xl border-2 transition-all
                    ${nodeProgress.isLocked
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                      : `${colors.bg} ${colors.border} hover:ring-2 ${colors.ring}`
                    }
                  `}
                  onClick={(e) => nodeProgress.isLocked && e.preventDefault()}
                >
                  {/* Icono del nodo */}
                  <div
                    className={`
                      absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                      flex items-center justify-center text-2xl
                      ${nodeProgress.isLocked
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : `${colors.bg} border-2 ${colors.border}`
                      }
                    `}
                  >
                    {nodeProgress.isLocked ? '🔒' : isCompleted ? '✓' : node.icon}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {nodeTranslations.title}
                      </h3>
                      {!nodeProgress.isLocked && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {nodeProgress.completed}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {nodeTranslations.description}
                    </p>

                    {/* Barra de progreso */}
                    {!nodeProgress.isLocked && (
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-green-500' : 'bg-indigo-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${nodeProgress.completed}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Indicador de estado */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isActive && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {nodeProgress.completed > 0 ? t.learn.continue : t.learn.start}
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
