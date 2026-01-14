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
  { id: 'node-5', icon: '🆘', category: 'recovery', color: 'sky' },
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
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    border: 'border-sky-300 dark:border-sky-700',
    ring: 'ring-sky-500',
    gradient: 'from-sky-500 to-sky-500',
    glow: 'shadow-blue-500/50',
  },
  orange: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-800',
    ring: 'ring-orange-500',
    gradient: 'from-amber-500 to-amber-500',
    glow: 'shadow-orange-500/50',
  },
  green: {
    bg: 'bg-accent-100 dark:bg-accent-900/30',
    border: 'border-accent-300 dark:border-accent-700',
    ring: 'ring-accent-500',
    gradient: 'from-accent-500 to-accent-500',
    glow: 'shadow-green-500/50',
  },
  red: {
    bg: 'bg-semantic-error-bg dark:bg-semantic-error-bg',
    border: 'border-semantic-error dark:border-semantic-error',
    ring: 'ring-semantic-error',
    gradient: 'from-semantic-error to-sky-500',
    glow: 'shadow-red-500/50',
  },
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    border: 'border-sky-300 dark:border-sky-700',
    ring: 'ring-sky-500',
    gradient: 'from-sky-500 to-sky-500',
    glow: 'shadow-sky-500/50',
  },
};

// Helper functions for complexity reduction
const LOCKED_NODE_STYLES = 'opacity-40 cursor-not-allowed border-calm-warm-100/20 bg-calm-bg-tertiary/30';
const UNLOCKED_NODE_STYLES = 'bg-calm-bg-secondary backdrop-blur-md border-calm-warm-100/30 shadow-calm-lg hover:border-calm-warm-100/40';

function getNodeCardStyles(isLocked: boolean): string {
  return isLocked ? LOCKED_NODE_STYLES : UNLOCKED_NODE_STYLES;
}

function getNodeIconStyles(isLocked: boolean, isCompleted: boolean, colors: typeof colorClasses[string]): string {
  if (isLocked) return 'bg-calm-bg-tertiary/50 border-calm-warm-100/20';
  if (isCompleted) return 'bg-gradient-to-br from-accent-500 to-accent-500-dark border-accent-500/30 shadow-calm-md';
  return `${colors.bg} ${colors.border} shadow-calm-lg`;
}

interface NodeRenderData {
  nodeProgress: NodeProgress;
  colors: typeof colorClasses[string];
  nodeTranslations: {
    title: string;
    description: string;
  };
  isCompleted: boolean;
  isActive: boolean;
}

function prepareNodeData(node: typeof GUIDED_NODES[number], progress: NodeProgress[], t: TranslationKeys): NodeRenderData {
  const nodeProgress = progress.find((p) => p.nodeId === node.id) || {
    nodeId: node.id,
    completed: 0,
    isLocked: node.id !== 'node-1',
  };
  const colors = colorClasses[node.color];
  const nodeTranslations = t.learn.nodes[node.category as NodeCategory];
  const isCompleted = nodeProgress.completed >= 100;
  const isActive = !nodeProgress.isLocked && !isCompleted;

  return { nodeProgress, colors, nodeTranslations, isCompleted, isActive };
}

// NodeIcon subcomponent
interface NodeIconProps {
  isLocked: boolean;
  isCompleted: boolean;
  isActive: boolean;
  icon: string;
  colors: typeof colorClasses[string];
}

function NodeIcon({ isLocked, isCompleted, icon, colors }: NodeIconProps) {
  if (isLocked) {
    return <span className="text-calm-text-muted">🔒</span>;
  }
  if (isCompleted) {
    return <span className="text-white text-2xl">✓</span>;
  }
  return (
    <>
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-30 blur-md`}
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
      <span className="relative">{icon}</span>
    </>
  );
}

// NodeStatusBadge subcomponent
interface NodeStatusBadgeProps {
  isActive: boolean;
  isCompleted: boolean;
  completed: number;
  startLabel: string;
  continueLabel: string;
}

function NodeStatusBadge({ isActive, isCompleted, completed, startLabel, continueLabel }: NodeStatusBadgeProps) {
  if (isActive) {
    return (
      <motion.span
        className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r to-accent-500 to-sky-500 text-white rounded-lg shadow-calm-md"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {completed > 0 ? continueLabel : startLabel}
      </motion.span>
    );
  }
  if (isCompleted) {
    return (
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
    );
  }
  return null;
}

// NodeProgressBar subcomponent
interface NodeProgressBarProps {
  isLocked: boolean;
  completed: number;
  colors: typeof colorClasses[string];
  index: number;
}

function NodeProgressBar({ isLocked, completed, colors, index }: NodeProgressBarProps) {
  if (isLocked) return null;

  return (
    <div className="relative h-2 bg-calm-bg-tertiary/50 rounded-full overflow-hidden shadow-inner">
      <motion.div
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.gradient} rounded-full`}
        style={{ backgroundSize: '200% 100%' }}
        initial={{ width: 0 }}
        animate={{
          width: `${completed}%`,
          backgroundPosition: ['0% 50%', '100% 50%']
        }}
        transition={{
          width: { duration: 0.8, delay: index * 0.1, ease: 'easeOut' },
          backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
        }}
      />
    </div>
  );
}

// CourseMapNode subcomponent
interface CourseMapNodeProps {
  node: typeof GUIDED_NODES[number];
  index: number;
  data: NodeRenderData;
  startLabel: string;
  continueLabel: string;
}

function CourseMapNode({ node, index, data, startLabel, continueLabel }: CourseMapNodeProps) {
  const { nodeProgress, colors, nodeTranslations, isCompleted, isActive } = data;
  const cardStyles = getNodeCardStyles(nodeProgress.isLocked);

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
        <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${cardStyles}`}>
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
              className={`absolute inset-0 rounded-2xl shadow-${colors.glow} opacity-0 hover:opacity-30 transition-opacity duration-500`}
            />
          )}

          {/* Content */}
          <div className="relative p-5 pl-24">
            {/* Icono del nodo */}
            <motion.div
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 ${getNodeIconStyles(nodeProgress.isLocked, isCompleted, colors)}`}
              whileHover={isActive ? { scale: 1.05, rotate: 5 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <NodeIcon
                isLocked={nodeProgress.isLocked}
                isCompleted={isCompleted}
                isActive={isActive}
                icon={node.icon}
                colors={colors}
              />
            </motion.div>

            {/* Contenido */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl text-white">
                  {nodeTranslations.title}
                </h3>
                {!nodeProgress.isLocked && (
                  <motion.span
                    className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-sky-500 bg-clip-text text-transparent"
                    animate={isActive ? {
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {nodeProgress.completed}%
                  </motion.span>
                )}
              </div>
              <p className="text-sm text-calm-text-muted mb-3">
                {nodeTranslations.description}
              </p>

              <NodeProgressBar
                isLocked={nodeProgress.isLocked}
                completed={nodeProgress.completed}
                colors={colors}
                index={index}
              />
            </div>

            {/* Indicador de estado */}
            <div className="absolute right-5 top-5">
              <NodeStatusBadge
                isActive={isActive}
                isCompleted={isCompleted}
                completed={nodeProgress.completed}
                startLabel={startLabel}
                continueLabel={continueLabel}
              />
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
}

export function CourseMap({ progress, translations }: CourseMapProps) {
  const t = translations;

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
        <p className="text-sm text-calm-text-muted">
          Tu camino guiado hacia el francés
        </p>
      </motion.div>

      {/* Nodos */}
      <div className="relative">
        {/* Línea conectora animada */}
        <div className="absolute left-8 top-16 bottom-16 w-1 bg-gradient-to-b to-accent-500/50 to-sky-500/50 to-amber-500/50 rounded-full">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b to-accent-500 to-sky-500 to-amber-500 rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="space-y-5 relative">
          {GUIDED_NODES.map((node, index) => {
            const data = prepareNodeData(node, progress, t);
            return (
              <CourseMapNode
                key={node.id}
                node={node}
                index={index}
                data={data}
                startLabel={t.learn.start}
                continueLabel={t.learn.continue}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
