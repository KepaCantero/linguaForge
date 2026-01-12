import type { SRSCard } from '@/types/srs';
import type { MemoryBankCard } from '@/components/exercises/MemoryBank/MemoryBankSession';

export function convertToMemoryBankCards(srsCards: SRSCard[]): MemoryBankCard[] {
  return srsCards.map(card => {
    const difficulty: 'easy' | 'medium' | 'hard' =
      card.easeFactor <= 1.8 ? 'hard' :
      card.easeFactor <= 2.2 ? 'medium' : 'easy';

    return {
      id: card.id,
      front: {
        text: card.phrase,
        subtext: card.source.context || undefined,
      },
      back: {
        text: card.translation || card.phrase,
        subtext: card.tags.join(' • '),
      },
      context: 'vocabulary' as const,
      difficulty,
      reviewCount: card.reviewHistory.length,
      lastReviewedAt: card.nextReviewDate || undefined,
    };
  });
}

export function filterCardsForReview(
  allCards: SRSCard[],
  sourceType: string | null,
  sourceId: string | null,
  filterParam: string | null
): SRSCard[] {
  let cards = allCards;

  if (sourceType && sourceId) {
    cards = cards.filter(card =>
      card.source.type === sourceType && card.source.id === sourceId
    );
  }

  if (filterParam === 'new') {
    return cards.filter(card => card.status === 'new');
  }

  const today = new Date().toISOString().split('T')[0];
  return cards.filter(card =>
    card.status === 'new' ||
    (card.nextReviewDate && card.nextReviewDate <= today)
  );
}
