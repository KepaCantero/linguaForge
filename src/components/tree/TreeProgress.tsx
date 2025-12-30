'use client';

import { motion } from 'framer-motion';

interface TreeProgressProps {
  completed: number;
  total: number;
}

export function TreeProgress({ completed, total }: TreeProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      className="glass rounded-xl p-4 card-glow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-atkinson text-sm font-medium text-gray-300">
          Progreso del árbol A1
        </span>
        <span className="font-rajdhani text-sm font-bold text-lf-secondary">
          {completed} / {total} hojas
        </span>
      </div>
      <div className="w-full h-3 bg-lf-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-lf-primary via-lf-secondary to-emerald-500 rounded-full progress-particles"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500 font-atkinson">
        <span>🌱 Principiante</span>
        <motion.span
          className="text-lf-accent font-rajdhani font-bold"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span>🌳 A1 Completo</span>
      </div>
    </motion.div>
  );
}
