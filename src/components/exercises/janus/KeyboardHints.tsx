import { motion, AnimatePresence } from 'framer-motion';

export function KeyboardHints() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4 bg-calm-bg-secondary dark:bg-calm-bg-elevated rounded-lg px-3 py-2"
      >
        <div className="flex items-center justify-center gap-4 text-xs text-calm-text-secondary dark:text-calm-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-calm-bg-tertiary rounded border border-calm-warm-200 dark:border-calm-warm-200 font-mono">←→</kbd>
            <span>Columnas</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-calm-bg-tertiary rounded border border-calm-warm-200 dark:border-calm-warm-200 font-mono">↑↓</kbd>
            <span>Opciones</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-calm-bg-tertiary rounded border border-calm-warm-200 dark:border-calm-warm-200 font-mono">Enter</kbd>
            <span>Seleccionar</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-calm-bg-tertiary rounded border border-calm-warm-200 dark:border-calm-warm-200 font-mono">ESC</kbd>
            <span>Limpiar</span>
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
