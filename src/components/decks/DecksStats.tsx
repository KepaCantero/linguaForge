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
      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <p className="text-xs text-lf-muted">Total</p>
          <p className="text-xl font-bold text-white">{total}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
        <div className="relative">
          <p className="text-xs text-blue-400">Nuevas</p>
          <p className="text-xl font-bold text-blue-400">{newCount}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <div className="relative">
          <p className="text-xs text-orange-400">Pendientes</p>
          <p className="text-xl font-bold text-orange-400">{dueCount}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        />
        <div className="relative">
          <p className="text-xs text-green-400">Dominadas</p>
          <p className="text-xl font-bold text-green-400">{masteredCount}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <div className="relative">
          <p className="text-xs text-purple-400">Palabras</p>
          <p className="text-xl font-bold text-purple-400">{studiedWords}</p>
        </div>
      </div>
    </motion.div>
  );
}
