'use client';

import { useState } from 'react';
import { DecksHeader } from '@/components/decks/DecksHeader';
import { DecksStats } from '@/components/decks/DecksStats';
import { DecksFilters } from '@/components/decks/DecksFilters';
import { DeckCard } from '@/components/decks/DeckCard';
import { DecksEmptyState } from '@/components/decks/DecksEmptyState';
import { type FilterType, useDecksData, type SourceType } from './hooks/useDecksData';

export default function DecksPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { filteredCardsBySource, stats } = useDecksData(filter, sourceFilter, searchQuery);

  return (
    <div className="space-y-6">
      <DecksHeader dueCount={stats.due} newCount={stats.new} />

      <DecksStats
        total={stats.total}
        newCount={stats.new}
        dueCount={stats.due}
        masteredCount={stats.mastered}
        studiedWords={stats.studiedWords}
      />

      <DecksFilters
        searchQuery={searchQuery}
        sourceFilter={sourceFilter}
        filter={filter}
        onSearchChange={setSearchQuery}
        onSourceFilterChange={setSourceFilter}
        onFilterChange={setFilter}
      />

      {filteredCardsBySource.length === 0 ? (
        <DecksEmptyState />
      ) : (
        <div className="space-y-4">
          {filteredCardsBySource.map((group, index) => (
            <DeckCard key={`${group.source.type}-${group.source.id}`} group={group} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
