'use client';

import { motion } from 'framer-motion';
import { NodeStatus } from '@/types';

interface MapNodeProps {
  title: string;
  order: number;
  status: NodeStatus;
  isJanus?: boolean;
  onClick: () => void;
}

const statusStyles: Record<NodeStatus, { bg: string; border: string; text: string; icon: string }> = {
  locked: {
    bg: 'bg-gray-200 dark:bg-gray-700',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-400 dark:text-gray-500',
    icon: '🔒',
  },
  active: {
    bg: 'bg-indigo-500',
    border: 'border-indigo-600',
    text: 'text-white',
    icon: '▶️',
  },
  completed: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    icon: '✓',
  },
};

export function MapNode({ title, order, status, isJanus = false, onClick }: MapNodeProps) {
  const styles = statusStyles[status];
  const isClickable = status !== 'locked';

  return (
    <motion.button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        relative flex flex-col items-center gap-2
        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
    >
      {/* Nodo circular */}
      <motion.div
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          border-4 ${styles.bg} ${styles.border} ${styles.text}
          shadow-lg
          ${isJanus ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
        `}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: order * 0.1, type: 'spring', stiffness: 200 }}
      >
        {isJanus ? (
          <span className="text-2xl">🧩</span>
        ) : status === 'completed' ? (
          <span className="text-2xl font-bold">{styles.icon}</span>
        ) : status === 'locked' ? (
          <span className="text-xl">{styles.icon}</span>
        ) : (
          <span className="text-lg font-bold">{order}</span>
        )}

        {/* Indicador de activo */}
        {status === 'active' && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>

      {/* Título */}
      <motion.span
        className={`
          text-xs font-medium text-center max-w-20 leading-tight
          ${status === 'locked' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: order * 0.1 + 0.1 }}
      >
        {isJanus ? 'Janus Matrix' : title}
      </motion.span>
    </motion.button>
  );
}
