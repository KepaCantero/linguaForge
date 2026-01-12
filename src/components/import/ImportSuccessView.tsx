'use client';

import { motion } from 'framer-motion';

interface ImportSuccessViewProps {
  topicTitle: string;
  onGoToLearn: () => void;
  onCreateAnother: () => void;
}

/**
 * Import Success View Component
 * Step 4 of the import wizard - displays success message and actions
 * Reduces complexity of main import page component
 */
export function ImportSuccessView({
  topicTitle,
  onGoToLearn,
  onCreateAnother,
}: ImportSuccessViewProps) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <motion.div
        className="text-7xl mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
      >
        🎉
      </motion.div>

      <h2 className="text-3xl font-bold text-white mb-3">
        ¡Nodo creado!
      </h2>

      <p className="text-lf-muted mb-8">
        Tu contenido &quot;{topicTitle}&quot; está listo para practicar.
      </p>

      <div className="space-y-3">
        <motion.button
          onClick={onGoToLearn}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-bold shadow-glass-xl hover:shadow-glow-accent transition-all"
        >
          Ir al mapa →
        </motion.button>

        <motion.button
          onClick={onCreateAnother}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white font-medium hover:bg-lf-dark/30 transition-all"
        >
          Importar otro contenido
        </motion.button>
      </div>
    </motion.div>
  );
}
