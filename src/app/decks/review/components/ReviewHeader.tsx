import Link from 'next/link';
import type { ReviewMode } from '../hooks/useReviewSession';

interface ReviewHeaderProps {
  sourceType: string | null;
  sourceId: string | null;
  reviewMode: (mode: ReviewMode) => void;
  currentMode: ReviewMode;
  currentIndex: number;
  totalCards: number;
}

export function ReviewHeader({ sourceType, sourceId, reviewMode, currentMode, currentIndex, totalCards }: ReviewHeaderProps) {
  const backUrl = sourceType && sourceId ? `/input/${sourceType}` : '/decks';

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={backUrl}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Repaso</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentMode === 'memory-bank' ? `${totalCards} tarjetas` : `${currentIndex + 1} de ${totalCards}`}
            </p>
          </div>
          <div className="w-8" />
        </div>

        <div className="flex justify-center mt-3 gap-2">
          <button
            onClick={() => reviewMode('classic')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentMode === 'classic'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Clásico
          </button>
          <button
            onClick={() => reviewMode('memory-bank')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
              currentMode === 'memory-bank'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span>✨</span> Memory Bank
          </button>
        </div>
      </div>
    </header>
  );
}
