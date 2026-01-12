'use client';

import { motion } from 'framer-motion';

export interface ImportSourceOption {
  id: 'podcast' | 'article' | 'youtube';
  icon: string;
  label: string;
}

interface ImportSourceSelectorProps {
  sources: ImportSourceOption[];
  onSelectSource: (source: ImportSourceOption['id']) => void;
}

/**
 * Import Source Selector Component
 * First step of the import wizard - allows user to select content source type
 * Reduces complexity of main import page component
 */
export function ImportSourceSelector({
  sources,
  onSelectSource,
}: ImportSourceSelectorProps) {
  return (
    <motion.div
      key="source"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white"
      >
        ¿Qué quieres importar?
      </motion.h2>
      <div className="grid grid-cols-1 gap-4">
        {sources.map((source, index) => (
          <motion.button
            key={source.id}
            onClick={() => onSelectSource(source.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 shadow-glass-xl p-5 text-left"
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-lf-primary/20 via-lf-secondary/20 to-lf-accent/20"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.5,
              }}
            />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, transparent 50%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              <motion.div
                className="text-4xl"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {source.icon}
              </motion.div>
              <div className="flex-1">
                <div className="font-bold text-lg text-white mb-1">
                  {source.label}
                </div>
                <div className="text-sm text-lf-muted">
                  {source.id === 'article' && 'Pega el texto de un artículo'}
                  {source.id === 'podcast' && 'Pega la transcripción del podcast'}
                  {source.id === 'youtube' && 'Pega los subtítulos del video'}
                </div>
              </div>
              <motion.span
                className="text-lf-accent text-2xl"
                whileHover={{ x: 5 }}
              >
                →
              </motion.span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
