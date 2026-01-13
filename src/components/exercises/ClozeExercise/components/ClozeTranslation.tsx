'use client';

import { motion } from 'framer-motion';
import { Phrase, ConversationalBlock } from '@/types';

interface ClozeTranslationProps {
  phrase: Phrase;
  block: ConversationalBlock | undefined;
  showTranslation: boolean;
  onToggle: () => void;
}

export function ClozeTranslation({
  phrase,
  block,
  showTranslation,
  onToggle,
}: ClozeTranslationProps) {
  return (
    <>
      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-calm-bg-secondary/50 dark:bg-calm-bg-tertiary/30 text-calm-text-muted dark:text-calm-text-muted/80 hover:bg-calm-bg-tertiary/20 dark:hover:bg-calm-bg-tertiary/40 border border-calm-warm-100/30"
        >
          <span>{showTranslation ? '👁️' : '👁️‍🗨️'}</span>
          <span>{showTranslation ? 'Ocultar traducción' : 'Mostrar traducción'}</span>
        </button>
      </div>

      {showTranslation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {block ? (
            <div className="space-y-1">
              {block.phrases.map((p) => (
                <p key={p.id} className="text-sm text-calm-text-muted dark:text-calm-text-muted/70">
                  <span className="font-medium">{p.text}:</span> {p.translation}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-calm-text-muted dark:text-calm-text-muted/70 text-center">
              {phrase.translation}
            </p>
          )}
        </motion.div>
      )}
    </>
  );
}
