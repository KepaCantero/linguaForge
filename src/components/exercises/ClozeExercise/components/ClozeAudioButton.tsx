'use client';

import { motion } from 'framer-motion';

interface ClozeAudioButtonProps {
  isSpeaking: boolean;
  hasBlock: boolean;
  onPlay: () => void;
}

export function ClozeAudioButton({
  isSpeaking,
  hasBlock,
  onPlay,
}: ClozeAudioButtonProps) {
  const getClassName = (): string => {
    const baseClasses = 'mt-4 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all mx-auto';

    if (isSpeaking) {
      return `${baseClasses} bg-lf-primary/20 dark:bg-lf-primary/30 text-lf-primary dark:text-lf-primary`;
    }

    return `${baseClasses} bg-lf-soft/50 dark:bg-lf-muted/30 text-lf-dark dark:text-lf-muted hover:bg-lf-muted/20 dark:hover:bg-lf-muted/40 border border-lf-muted/30`;
  };

  const getLabel = (): string => {
    if (isSpeaking) {
      return 'Reproduciendo...';
    }

    return hasBlock ? 'Escuchar bloque completo' : 'Escuchar';
  };

  const getIcon = (): string => {
    return isSpeaking ? '🔊' : '🔈';
  };

  return (
    <button onClick={onPlay} disabled={isSpeaking} className={getClassName()}>
      <motion.span
        animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {getIcon()}
      </motion.span>
      <span>{getLabel()}</span>
    </button>
  );
}
