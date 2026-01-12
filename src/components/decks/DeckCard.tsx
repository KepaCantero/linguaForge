import { motion } from 'framer-motion';
import Link from 'next/link';
import { isDueForReview } from '@/lib/sm2';
import type { ContentSource, SRSCard } from '@/types/srs';

interface CardGroup {
  source: ContentSource;
  cards: SRSCard[];
}

interface DeckCardProps {
  group: CardGroup;
  index: number;
}

export function DeckCard({ group, index }: DeckCardProps) {
  const dueCount = group.cards.filter(c => isDueForReview(c)).length;
  const newCount = group.cards.filter(c => c.status === 'new').length;

  const icon = group.source.type === 'video' ? '🎬' : group.source.type === 'audio' ? '🎵' : '📄';
  const title = group.source.title || `${group.source.type} ${group.source.id}`;

  const getCardStatusStyle = (status: string) => {
    if (status === 'new') {
      return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    }
    if (status === 'graduated') {
      return 'bg-green-500/20 border-green-500/30 text-green-400';
    }
    return 'bg-lf-dark/30 border-white/10 text-lf-muted';
  };

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
                {icon}
              </motion.span>
              <h3 className="text-lg font-semibold text-white">
                {title}
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
                  getCardStatusStyle(card.status)
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
}
