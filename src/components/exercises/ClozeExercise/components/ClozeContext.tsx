'use client';

import { motion } from 'framer-motion';
import { ConversationalBlock } from '@/types';

interface ClozeContextProps {
  block: ConversationalBlock;
}

export function ClozeContext({ block }: ClozeContextProps) {
  return (
    <motion.div
      className="bg-lf-info/10 dark:bg-lf-info/20 rounded-aaa-xl p-4 border border-lf-info/30 dark:border-lf-info/40 shadow-glass-xl backdrop-blur-aaa"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-xs font-semibold text-lf-info dark:text-lf-info/80 mb-2">
        {block.title}
      </div>
      <div className="text-xs text-lf-info/70 dark:text-lf-info/60">
        {block.context}
      </div>
    </motion.div>
  );
}
