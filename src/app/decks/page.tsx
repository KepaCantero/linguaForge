'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSRSStore } from '@/store/useSRSStore';
import { useWordDictionaryStore } from '@/store/useWordDictionaryStore';
import { ContentSource, SRSCard } from '@/types/srs';
import { isDueForReview } from '@/lib/sm2';

export default function DecksPage() {
  const { cards } = useSRSStore();
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
  const stats = useMemo(() => {
    const studiedWords = getStudiedWords();

    return {
      total: cards.length,
      new: cards.filter(c => c.status === 'new').length,
      due: cards.filter(c => isDueForReview(c)).length,
      mastered: cards.filter(c => c.status === 'graduated').length,
      studiedWords: studiedWords.length,
    };
  }, [cards, getStudiedWords]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
          {stats.due > 0 && (
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
                <span>Repasar {stats.due}</span>
              </span>
            </Link>
          )}
          {stats.new > 0 && (
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
                <span>Estudiar {stats.new}</span>
              </span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="relative">
            <p className="text-xs text-lf-muted">Total</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
          <div className="relative">
            <p className="text-xs text-blue-400">Nuevas</p>
            <p className="text-xl font-bold text-blue-400">{stats.new}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          <div className="relative">
            <p className="text-xs text-orange-400">Pendientes</p>
            <p className="text-xl font-bold text-orange-400">{stats.due}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
          />
          <div className="relative">
            <p className="text-xs text-green-400">Dominadas</p>
            <p className="text-xl font-bold text-green-400">{stats.mastered}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
          <div className="relative">
            <p className="text-xs text-purple-400">Palabras</p>
            <p className="text-xl font-bold text-purple-400">{stats.studiedWords}</p>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar palabras..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as 'all' | 'video' | 'audio' | 'text')}
          className="px-4 py-2.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white focus:ring-2 focus:ring-lf-accent focus:border-transparent"
        >
          <option value="all">Todas las fuentes</option>
          <option value="video">Videos</option>
          <option value="audio">Audios</option>
          <option value="text">Textos</option>
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'new' | 'due' | 'mastered')}
          className="px-4 py-2.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white focus:ring-2 focus:ring-lf-accent focus:border-transparent"
        >
          <option value="all">Todas</option>
          <option value="new">Nuevas</option>
          <option value="due">Pendientes</option>
          <option value="mastered">Dominadas</option>
        </select>
      </motion.div>

      {/* Lista de decks */}
      {filteredCardsBySource.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border-2 border-dashed border-white/20 p-12 text-center"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="relative">
            <motion.div
              className="text-6xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              📭
            </motion.div>
            <p className="text-lf-muted mb-4">
              No hay cards disponibles con estos filtros.
            </p>
            <Link
              href="/input"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-medium shadow-glass-xl hover:shadow-glow-accent transition-all"
            >
              <span>Ir a Input</span>
              <span>→</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredCardsBySource.map((group, index) => {
            const dueCount = group.cards.filter(c => isDueForReview(c)).length;
            const newCount = group.cards.filter(c => c.status === 'new').length;

            return (
              <motion.div
                key={`${group.source.type}-${group.source.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="relative group overflow-hidden rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 shadow-glass-xl"
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-lf-primary/20 via-lf-secondary/20 to-lf-accent/20"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.5,
                  }}
                />

                {/* Inner glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-aaa-xl shadow-inner-glow opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, transparent 50%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />

                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.span
                          className="text-2xl"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {group.source.type === 'video' ? '🎬' : group.source.type === 'audio' ? '🎵' : '📄'}
                        </motion.span>
                        <h3 className="text-lg font-semibold text-white">
                          {group.source.title || `${group.source.type} ${group.source.id}`}
                        </h3>
                      </div>
                      {group.source.url && (
                        <a
                          href={group.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-lf-accent hover:text-lf-secondary transition-colors"
                        >
                          Ver fuente original
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dueCount > 0 && (
                        <Link
                          href={`/decks/review?sourceType=${group.source.type}&sourceId=${group.source.id}`}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow-depth-lg hover:shadow-glow-accent transition-all"
                        >
                          Repasar {dueCount}
                        </Link>
                      )}
                      {newCount > 0 && (
                        <Link
                          href={`/decks/review?sourceType=${group.source.type}&sourceId=${group.source.id}&filter=new`}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium shadow-depth-lg hover:shadow-glow-accent transition-all"
                        >
                          Estudiar {newCount}
                        </Link>
                      )}
                      {dueCount === 0 && newCount === 0 && (
                        <span className="px-3 py-1.5 rounded-lg bg-lf-dark/30 border border-white/10 text-lf-muted text-sm font-medium">
                          Sin pendientes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estadísticas del deck */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 rounded-xl bg-lf-dark/20 border border-white/10">
                    <div>
                      <p className="text-xs text-lf-muted">Total</p>
                      <p className="text-lg font-bold text-white">
                        {group.cards.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-lf-muted">Nuevas</p>
                      <p className="text-lg font-bold text-blue-400">
                        {newCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-lf-muted">Pendientes</p>
                      <p className="text-lg font-bold text-orange-400">
                        {dueCount}
                      </p>
                    </div>
                  </div>

                  {/* Lista de palabras */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-lf-muted mb-2">
                      Palabras ({group.cards.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.cards.slice(0, 20).map((card) => (
                        <span
                          key={card.id}
                          className={`px-2 py-1 rounded-lg text-sm border transition-all ${
                            card.status === 'new'
                              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                              : card.status === 'graduated'
                              ? 'bg-green-500/20 border-green-500/30 text-green-400'
                              : 'bg-lf-dark/30 border-white/10 text-lf-muted'
                          }`}
                        >
                          {card.phrase}
                        </span>
                      ))}
                      {group.cards.length > 20 && (
                        <span className="px-2 py-1 rounded-lg text-sm bg-lf-dark/30 border border-white/10 text-lf-muted">
                          +{group.cards.length - 20} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
