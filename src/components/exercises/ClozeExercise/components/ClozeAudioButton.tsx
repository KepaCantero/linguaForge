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
      return `${baseClasses} bg-accent-500/20 dark:bg-accent-500/30 text-calm-text-primary dark:text-calm-text-primary`;
    }

    return `${baseClasses} bg-calm-bg-secondary/50 dark:bg-calm-bg-tertiary/30 text-calm-text-primary dark:text-calm-text-muted hover:bg-calm-bg-tertiary/20 dark:hover:bg-calm-bg-tertiary/40 border border-calm-warm-100/30`;
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
