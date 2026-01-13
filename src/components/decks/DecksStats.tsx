import { motion } from 'framer-motion';

interface DecksStatsProps {
  total: number;
  newCount: number;
  dueCount: number;
  masteredCount: number;
  studiedWords: number;
}

export function DecksStats({ total, newCount, dueCount, masteredCount, studiedWords }: DecksStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-5 gap-3"
    >
      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br to-accent-500/10 to-sky-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <p className="text-xs text-calm-text-muted">Total</p>
          <p className="text-xl font-bold text-white">{total}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-sky-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
        <div className="relative">
          <p className="text-xs text-sky-400">Nuevas</p>
          <p className="text-xl font-bold text-sky-400">{newCount}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-semantic-error/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <div className="relative">
          <p className="text-xs text-amber-400">Pendientes</p>
          <p className="text-xl font-bold text-amber-400">{dueCount}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-accent-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        />
        <div className="relative">
          <p className="text-xs text-accent-400">Dominadas</p>
          <p className="text-xl font-bold text-accent-400">{masteredCount}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-sky-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <div className="relative">
          <p className="text-xs text-sky-400">Palabras</p>
          <p className="text-xl font-bold text-sky-400">{studiedWords}</p>
        </div>
      </div>
    </motion.div>
  );
}
