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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-lf-soft/50 dark:bg-lf-muted/30 text-lf-muted dark:text-lf-muted/80 hover:bg-lf-muted/20 dark:hover:bg-lf-muted/40 border border-lf-muted/30"
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
                <p key={p.id} className="text-sm text-lf-muted dark:text-lf-muted/70">
                  <span className="font-medium">{p.text}:</span> {p.translation}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lf-muted dark:text-lf-muted/70 text-center">
              {phrase.translation}
            </p>
          )}
        </motion.div>
      )}
    </>
  );
}
