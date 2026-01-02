'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSRSStore } from '@/store/useSRSStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { ContentSource, SRSCard } from '@/types/srs';
import { isDueForReview } from '@/lib/sm2';

export default function DecksPage() {
  const { cards, getCardsBySource } = useSRSStore();
  const { getStudiedWords } = useWordDictionaryStore();
  
  const [filter, setFilter] = useState<'all' | 'new' | 'due' | 'mastered'>('all');
  const [sourceFilter, setSourceFilter] = useState<ContentSource['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Agrupar cards por fuente
  const cardsBySource = useMemo(() => {
    const grouped: Record<string, { source: ContentSource; cards: SRSCard[] }> = {};
    
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
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.map(group => ({
      ...group,
      cards: group.cards.filter(card => {
        if (filter === 'new') return card.status === 'new';
        if (filter === 'due') return isDueForReview(card, today);
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
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const studiedWords = getStudiedWords();
    
    return {
      total: cards.length,
      new: cards.filter(c => c.status === 'new').length,
      due: cards.filter(c => isDueForReview(c, today)).length,
      mastered: cards.filter(c => c.status === 'graduated').length,
      studiedWords: studiedWords.length,
    };
  }, [cards, getStudiedWords]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Decks
            </h1>
            <div className="flex items-center gap-2">
              {stats.due > 0 && (
                <Link
                  href="/decks/review"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📚</span>
                  <span>Repasar {stats.due} pendiente{stats.due !== 1 ? 's' : ''}</span>
                </Link>
              )}
              {stats.new > 0 && (
                <Link
                  href="/decks/review?filter=new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>Estudiar {stats.new} nueva{stats.new !== 1 ? 's' : ''}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400">Nuevas</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.new}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
              <p className="text-xs text-orange-600 dark:text-orange-400">Pendientes</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{stats.due}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <p className="text-xs text-green-600 dark:text-green-400">Dominadas</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{stats.mastered}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-purple-600 dark:text-purple-400">Palabras</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{stats.studiedWords}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar palabras..."
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Todas las fuentes</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
              <option value="text">Textos</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Todas</option>
              <option value="new">Nuevas</option>
              <option value="due">Pendientes</option>
              <option value="mastered">Dominadas</option>
            </select>
          </div>
        </div>
      </header>

      {/* Lista de decks */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredCardsBySource.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay cards disponibles con estos filtros.
            </p>
            <Link
              href="/input"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Ir a Input para crear nuevas cards
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCardsBySource.map((group) => {
              const today = new Date().toISOString().split('T')[0];
              const dueCount = group.cards.filter(c => isDueForReview(c, today)).length;
              const newCount = group.cards.filter(c => c.status === 'new').length;
              
              return (
                <motion.div
                  key={`${group.source.type}-${group.source.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {group.source.type === 'video' ? '🎬' : group.source.type === 'audio' ? '🎵' : '📄'}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.source.title || `${group.source.type} ${group.source.id}`}
                        </h3>
                      </div>
                      {group.source.url && (
                        <a
                          href={group.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Ver fuente original
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dueCount > 0 && (
                        <Link
                          href={`/decks/review?sourceType=${group.source.type}&sourceId=${group.source.id}`}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Repasar {dueCount}
                        </Link>
                      )}
                      {newCount > 0 && (
                        <Link
                          href={`/decks/review?sourceType=${group.source.type}&sourceId=${group.source.id}&filter=new`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Estudiar {newCount}
                        </Link>
                      )}
                      {dueCount === 0 && newCount === 0 && (
                        <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-lg">
                          Sin pendientes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estadísticas del deck */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {group.cards.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nuevas</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {newCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pendientes</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {dueCount}
                      </p>
                    </div>
                  </div>

                  {/* Lista de palabras */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Palabras ({group.cards.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.cards.slice(0, 20).map((card) => (
                        <span
                          key={card.id}
                          className={`px-2 py-1 rounded text-sm ${
                            card.status === 'new'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : card.status === 'graduated'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {card.phrase}
                        </span>
                      ))}
                      {group.cards.length > 20 && (
                        <span className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          +{group.cards.length - 20} más
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

