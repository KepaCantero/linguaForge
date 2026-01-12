import { motion } from 'framer-motion';
import Link from 'next/link';

export function DecksEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border-2 border-dashed border-white/20 p-12 text-center"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative">
        <motion.div
          className="text-6xl mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          📭
        </motion.div>
        <p className="text-lf-muted mb-4">
          No hay cards disponibles con estos filtros.
        </p>
        <Link
          href="/input"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-medium shadow-glass-xl hover:shadow-glow-accent transition-all"
        >
          <span>Ir a Input</span>
          <span>→</span>
        </Link>
      </div>
    </motion.div>
  );
}
