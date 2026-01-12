import { motion } from 'framer-motion';
import Link from 'next/link';

interface DecksHeaderProps {
  dueCount: number;
  newCount: number;
}

export function DecksHeader({ dueCount, newCount }: DecksHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          Decks
        </h1>
        <p className="text-sm text-lf-muted">
          Gestiona tus tarjetas de estudio
        </p>
      </div>
      <div className="flex items-center gap-2">
        {dueCount > 0 && (
          <Link
            href="/decks/review"
            className="relative overflow-hidden px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-glass-xl hover:shadow-glow-accent transition-all"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              whileHover={{ x: ['100%', '-100%'] }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative flex items-center gap-2">
              <span>📚</span>
              <span>Repasar {dueCount}</span>
            </span>
          </Link>
        )}
        {newCount > 0 && (
          <Link
            href="/decks/review?filter=new"
            className="relative overflow-hidden px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-glass-xl hover:shadow-glow-accent transition-all"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              whileHover={{ x: ['100%', '-100%'] }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative flex items-center gap-2">
              <span>✨</span>
              <span>Estudiar {newCount}</span>
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
