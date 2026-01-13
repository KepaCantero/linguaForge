'use client';

import { motion } from 'framer-motion';
import { ConversationalBlock } from '@/types';

interface ClozeContextProps {
  block: ConversationalBlock;
}

export function ClozeContext({ block }: ClozeContextProps) {
  return (
    <motion.div
      className="bg-sky-100/dark:bg-sky-900/20 dark:bg-sky-100/dark:bg-sky-900/30 rounded-2xl p-4 border border-sky-300 dark:border-sky-400 shadow-calm-lg backdrop-blur-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-xs font-semibold text-sky-500 dark:text-sky-500/80 mb-2">
        {block.title}
      </div>
      <div className="text-xs text-sky-500/70 dark:text-sky-500/60">
        {block.context}
      </div>
    </motion.div>
  );
}
