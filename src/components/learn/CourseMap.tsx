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

const colorClasses: Record<string, { bg: string; border: string; ring: string; gradient: string; glow: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    ring: 'ring-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/50',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    ring: 'ring-orange-500',
    gradient: 'from-orange-500 to-yellow-500',
    glow: 'shadow-orange-500/50',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    ring: 'ring-green-500',
    gradient: 'from-green-500 to-emerald-500',
    glow: 'shadow-green-500/50',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    ring: 'ring-red-500',
    gradient: 'from-red-500 to-pink-500',
    glow: 'shadow-red-500/50',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    ring: 'ring-purple-500',
    gradient: 'from-purple-500 to-violet-500',
    glow: 'shadow-purple-500/50',
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
      {/* Header con título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-bold text-white mb-2">
          {t.learn.title}
        </h2>
        <p className="text-sm text-lf-muted">
          Tu camino guiado hacia el francés
        </p>
      </motion.div>

      {/* Nodos */}
      <div className="relative">
        {/* Línea conectora animada */}
        <div className="absolute left-8 top-16 bottom-16 w-1 bg-gradient-to-b from-lf-primary/50 via-lf-secondary/50 to-lf-accent/50 rounded-full">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-lf-primary via-lf-secondary to-lf-accent rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="space-y-5 relative">
          {GUIDED_NODES.map((node, index) => {
            const nodeProgress = getNodeProgress(node.id);
            const colors = colorClasses[node.color];
            const nodeTranslations = t.learn.nodes[node.category as NodeCategory];
            const isCompleted = nodeProgress.completed >= 100;
            const isActive = !nodeProgress.isLocked && !isCompleted;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              >
                <Link
                  href={nodeProgress.isLocked ? '#' : `/learn/node/${node.id}`}
                  onClick={(e) => nodeProgress.isLocked && e.preventDefault()}
                  className="block relative"
                >
                  {/* Glass card */}
                  <div
                    className={`
                      relative overflow-hidden rounded-aaa-xl border-2 transition-all duration-500
                      ${nodeProgress.isLocked
                        ? 'opacity-40 cursor-not-allowed border-white/10 bg-lf-dark/30'
                        : 'bg-glass-surface backdrop-blur-aaa border-white/20 shadow-glass-xl hover:border-white/30'
                      }
                    `}
                  >
                    {/* Animated gradient background */}
                    {!nodeProgress.isLocked && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10`}
                        animate={{
                          opacity: [0.05, 0.15, 0.05],
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.5,
                        }}
                      />
                    )}

                    {/* Inner glow on hover */}
                    {isActive && (
                      <motion.div
                        className={`absolute inset-0 rounded-aaa-xl shadow-${colors.glow} opacity-0 hover:opacity-30 transition-opacity duration-500`}
                      />
                    )}

                    {/* Content */}
                    <div className="relative p-5 pl-24">
                      {/* Icono del nodo */}
                      <motion.div
                        className={`
                          absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-aaa-xl
                          flex items-center justify-center text-3xl border-2
                          ${nodeProgress.isLocked
                            ? 'bg-lf-dark/50 border-white/10'
                            : isCompleted
                            ? 'bg-gradient-to-br from-lf-success to-lf-success-dark border-lf-success/30 shadow-glow-success'
                            : `${colors.bg} ${colors.border} shadow-depth-lg`
                          }
                        `}
                        whileHover={isActive ? { scale: 1.05, rotate: 5 } : {}}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {nodeProgress.isLocked ? (
                          <span className="text-lf-muted">🔒</span>
                        ) : isCompleted ? (
                          <span className="text-white text-2xl">✓</span>
                        ) : (
                          <>
                            <motion.div
                              className={`absolute inset-0 rounded-aaa-xl bg-gradient-to-br ${colors.gradient} opacity-30 blur-md`}
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                            <span className="relative">{node.icon}</span>
                          </>
                        )}
                      </motion.div>

                      {/* Contenido */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-xl text-white">
                            {nodeTranslations.title}
                          </h3>
                          {!nodeProgress.isLocked && (
                            <motion.span
                              className="text-2xl font-bold bg-gradient-to-r from-lf-accent to-lf-secondary bg-clip-text text-transparent"
                              animate={isActive ? {
                                scale: [1, 1.05, 1],
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {nodeProgress.completed}%
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-lf-muted mb-3">
                          {nodeTranslations.description}
                        </p>

                        {/* Barra de progreso */}
                        {!nodeProgress.isLocked && (
                          <div className="relative h-2 bg-lf-dark/50 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.gradient} rounded-full`}
                              style={{ backgroundSize: '200% 100%' }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${nodeProgress.completed}%`,
                                backgroundPosition: ['0% 50%', '100% 50%']
                              }}
                              transition={{
                                width: { duration: 0.8, delay: index * 0.1, ease: 'easeOut' },
                                backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Indicador de estado */}
                      <div className="absolute right-5 top-5">
                        {isActive && (
                          <motion.span
                            className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-lf-primary to-lf-secondary text-white rounded-lg shadow-glow-accent"
                            animate={{
                              scale: [1, 1.05, 1],
                              opacity: [0.8, 1, 0.8],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {nodeProgress.completed > 0 ? t.learn.continue : t.learn.start}
                          </motion.span>
                        )}
                        {isCompleted && (
                          <motion.span
                            className="text-4xl"
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            ✨
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Glow effect on bottom */}
                    {isActive && (
                      <motion.div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}
                        animate={{
                          opacity: [0.3, 0.8, 0.3],
                          scaleX: [0.8, 1, 0.8],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
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
