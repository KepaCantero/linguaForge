import Link from 'next/link';
import { motion } from 'framer-motion';

interface SessionCompleteProps {
  sessionStats: { correct: number; incorrect: number };
  totalCards: number;
}

export function SessionComplete({ sessionStats, totalCards }: SessionCompleteProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ¡Sesión completada!
        </h2>
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Correctas</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {sessionStats.correct}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Incorrectas</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {sessionStats.incorrect}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total repasadas</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalCards}
            </p>
          </div>
        </div>
        <Link
          href="/decks"
          className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Ver todos los decks
        </Link>
      </motion.div>
    </div>
  );
}
