import { useMemo } from 'react';
import { useSRSStore } from '@/store/useSRSStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import type { ContentSource, SRSCard } from '@/types/srs';
import { isDueForReview } from '@/lib/sm2';

export type FilterType = 'all' | 'new' | 'due' | 'mastered';
export type SourceType = ContentSource['type'] | 'all';

export interface CardGroup {
  source: ContentSource;
  cards: SRSCard[];
}

export interface DecksStats {
  total: number;
  new: number;
  due: number;
  mastered: number;
  studiedWords: number;
}

export function useDecksData(
  filter: FilterType,
  sourceFilter: SourceType,
  searchQuery: string
) {
  const { cards } = useSRSStore();
  const { getStudiedWords } = useWordDictionaryStore();

  // Agrupar cards por fuente
  const cardsBySource = useMemo((): CardGroup[] => {
    const grouped: Record<string, CardGroup> = {};

    cards.forEach(card => {
      const key = `${card.source.type}-${card.source.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          source: card.source,
          cards: [],
        };
      }
      grouped[key].cards.push(card);
    });

    return Object.values(grouped);
  }, [cards]);

  // Filtrar cards según filtros
  const filteredCardsBySource = useMemo(() => {
    let filtered = cardsBySource;

    // Filtrar por tipo de fuente
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(group => group.source.type === sourceFilter);
    }

    // Filtrar por estado
    filtered = filtered.map(group => ({
      ...group,
      cards: group.cards.filter(card => {
        if (filter === 'new') return card.status === 'new';
        if (filter === 'due') return isDueForReview(card);
        if (filter === 'mastered') return card.status === 'graduated';
        return true;
      }),
    })).filter(group => group.cards.length > 0);

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.map(group => ({
        ...group,
        cards: group.cards.filter(card =>
          card.phrase.toLowerCase().includes(query) ||
          card.translation.toLowerCase().includes(query)
        ),
      })).filter(group => group.cards.length > 0);
    }

    return filtered;
  }, [cardsBySource, filter, sourceFilter, searchQuery]);

  // Estadísticas
  const stats = useMemo((): DecksStats => {
    const studiedWords = getStudiedWords();

    return {
      total: cards.length,
      new: cards.filter(c => c.status === 'new').length,
      due: cards.filter(c => isDueForReview(c)).length,
      mastered: cards.filter(c => c.status === 'graduated').length,
      studiedWords: studiedWords.length,
    };
  }, [cards, getStudiedWords]);

  return {
    filteredCardsBySource,
    stats,
  };
}
