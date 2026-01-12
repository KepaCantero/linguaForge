'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MemoryBankSession } from '@/components/exercises/MemoryBank/MemoryBankSession';
import { useReviewSession } from './hooks/useReviewSession';
import { SessionComplete } from './components/SessionComplete';
import { ReviewHeader } from './components/ReviewHeader';
import { ClassicReviewContent } from './components/ClassicReviewContent';
import { CardTags } from './components/CardTags';

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const sourceType = searchParams.get('sourceType');
  const sourceId = searchParams.get('sourceId');
  const filterParam = searchParams.get('filter');
  const modeParam = searchParams.get('mode');

  const [sessionData, sessionActions] = useReviewSession(sourceType, sourceId, filterParam);
  const { cardsToReview, currentCard, currentExercise, sessionComplete, sessionStats, memoryBankCards, exerciseType, reviewMode } = sessionData;
  const { setReviewMode, handleExerciseComplete, handleMemoryBankComplete, handleMemoryBankCardReview } = sessionActions;

  // Set initial mode from URL param
  useMemo(() => {
    if (modeParam === 'memory-bank') {
      setReviewMode('memory-bank');
    }
  }, [modeParam, setReviewMode]);

  if (sessionComplete || cardsToReview.length === 0) {
    return <SessionComplete sessionStats={sessionStats} totalCards={cardsToReview.length} />;
  }

  if (!currentExercise || !currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando ejercicio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <ReviewHeader
        sourceType={sourceType}
        sourceId={sourceId}
        reviewMode={setReviewMode}
        currentMode={reviewMode}
        currentIndex={cardsToReview.indexOf(currentCard)}
        totalCards={cardsToReview.length}
      />

      {/* Memory Bank Mode */}
      {reviewMode === 'memory-bank' && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <MemoryBankSession
            cards={memoryBankCards}
            context="vocabulary"
            onComplete={handleMemoryBankComplete}
            onCardReview={handleMemoryBankCardReview}
            title="Memory Bank AAA"
            showProgress
          />
        </div>
      )}

      {/* Classic Mode */}
      {reviewMode === 'classic' && (
        <ClassicReviewContent
          currentCard={currentCard}
          currentCardIndex={cardsToReview.indexOf(currentCard)}
          totalCards={cardsToReview.length}
          exerciseType={exerciseType}
          currentExercise={currentExercise}
          onComplete={handleExerciseComplete}
        >
          <CardTags tags={currentCard.tags} />
        </ClassicReviewContent>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
