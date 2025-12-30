'use client';

import { motion } from 'framer-motion';
import { JanusCell as JanusCellType } from '@/types';

interface JanusCellProps {
  cell: JanusCellType;
  isSelected: boolean;
  usageCount: number;
  columnIndex: number;
  cellIndex: number;
  onClick: () => void;
}

export function JanusCell({
  cell,
  isSelected,
  usageCount,
  columnIndex,
  cellIndex,
  onClick,
}: JanusCellProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative p-3 rounded-lg text-left transition-all
        ${isSelected
          ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
        }
        border border-gray-200 dark:border-gray-700
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: columnIndex * 0.1 + cellIndex * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Texto principal */}
      <span className="block font-medium text-sm leading-tight">
        {cell.text}
      </span>

      {/* Traducción */}
      <span className={`
        block text-xs mt-1 leading-tight
        ${isSelected ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}
      `}>
        {cell.translation}
      </span>

      {/* Contador de uso */}
      {usageCount > 0 && (
        <motion.div
          className={`
            absolute -top-2 -right-2 w-6 h-6 rounded-full
            flex items-center justify-center text-xs font-bold
            ${usageCount >= 25
              ? 'bg-emerald-500 text-white'
              : 'bg-yellow-400 text-gray-900'
            }
          `}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          {usageCount}
        </motion.div>
      )}
    </motion.button>
  );
}
