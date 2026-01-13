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
    <header className="bg-calm-bg-elevated border-b border-calm-warm-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={backUrl}
            className="text-calm-text-secondary hover:text-calm-text-primary"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-calm-text-primary">Repaso</h1>
            <p className="text-sm text-calm-text-muted">
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
                ? 'bg-accent-500 text-calm-text-primary'
                : 'bg-calm-bg-tertiary text-calm-text-secondary hover:bg-calm-warm-100'
            }`}
          >
            Clásico
          </button>
          <button
            onClick={() => reviewMode('memory-bank')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
              currentMode === 'memory-bank'
                ? 'bg-gradient-to-r from-sky-500 to-accent-500 text-calm-text-primary'
                : 'bg-calm-bg-tertiary text-calm-text-secondary hover:bg-calm-warm-100'
            }`}
          >
            <span>✨</span>Memory Bank
          </button>
        </div>
      </div>
    </header>
  );
}
