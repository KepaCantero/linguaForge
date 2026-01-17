'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BlockSelector } from '@/components/input/text/BlockSelector';
import type { TextBlock } from '@/hooks/input/useTextImport';

interface BlockSelectionSectionProps {
  blocks: TextBlock[];
  selectedBlocksCount: number;
  hasSelection: boolean;
  isImporting: boolean;
  onSelectionChange: (blocks: TextBlock[]) => void;
  onImportSelected: () => void;
}

export function BlockSelectionSection({
  blocks,
  selectedBlocksCount,
  hasSelection,
  isImporting,
  onSelectionChange,
  onImportSelected,
}: BlockSelectionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="pt-6 border-t border-calm-warm-200/30"
    >
      <BlockSelector
        blocks={blocks}
        onSelectionChange={onSelectionChange}
        showExercisePreview
      />

      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <button
              onClick={onImportSelected}
              disabled={isImporting}
              className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
            >
              {isImporting
                ? '⏳ Importando...'
                : `📦 Importar ${selectedBlocksCount} bloque${selectedBlocksCount > 1 ? 's' : ''}`
              }
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
