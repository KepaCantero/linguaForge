import Link from 'next/link';
import { motion } from 'framer-motion';

interface SessionCompleteProps {
  sessionStats: { correct: number; incorrect: number };
  totalCards: number;
}

export function SessionComplete({ sessionStats, totalCards }: SessionCompleteProps) {
  return (
    <div className="min-h-screen bg-calm-bg-primary dark:bg-calm-bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-calm-bg-elevated dark:bg-calm-bg-elevated rounded-xl p-8 max-w-md w-full border border-calm-warm-100 dark:border-calm-warm-200 text-center"
      >
        <h2 className="text-2xl font-bold text-calm-text-primary dark:text-calm-text-primary mb-4">
          ¡Sesión completada!
        </h2>
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">Correctas</p>
            <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
              {sessionStats.correct}
            </p>
          </div>
          <div>
            <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">Incorrectas</p>
            <p className="text-3xl font-bold text-semantic-error dark:text-semantic-error">
              {sessionStats.incorrect}
            </p>
          </div>
          <div>
            <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">Total repasadas</p>
            <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              {totalCards}
            </p>
          </div>
        </div>
        <Link
          href="/decks"
          className="block w-full py-3 bg-accent-500 hover:bg-accent-600 text-calm-text-primary font-medium rounded-lg transition-colors"
        >
          Ver todos los decks
        </Link>
      </motion.div>
    </div>
  );
}
