import { motion } from 'framer-motion';
import Link from 'next/link';
import { isDueForReview } from '@/lib/sm2';
import type { ContentSource, SRSCard } from '@/types/srs';
import { COLORS } from '@/constants/colors';

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
      return 'bg-sky-500/20 border-sky-500/30 text-sky-400';
    }
    if (status === 'graduated') {
      return 'bg-accent-500/20 border-accent-500/30 text-accent-400';
    }
    return 'bg-calm-bg-tertiary/30 border-calm-warm-100/20 text-calm-text-muted';
  };

  return (
    <motion.div
      key={`${group.source.type}-${group.source.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative group overflow-hidden rounded-2xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 shadow-calm-lg"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br to-accent-500/20 to-sky-500/20 to-amber-500/20"
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
        className="absolute inset-0 rounded-2xl shadow-inner-glow opacity-0 group-hover:opacity-60 transition-opacity duration-500"
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${COLORS.effects.whiteShine} 45%, transparent 50%)`,
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
                className="text-sm text-amber-500 hover:text-calm-text-secondary transition-colors"
              >
                Ver fuente original
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {dueCount > 0 && (
              <Link
                href={`/decks/review?sourceType=${group.source.type}&sourceId=${group.source.id}`}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-semantic-error text-white text-sm font-medium shadow-calm-lg hover:shadow-calm-md transition-all"
              >
                Repasar {dueCount}
              </Link>
            )}
            {newCount > 0 && (
              <Link
                href={`/decks/review?sourceType=${group.source.type}&sourceId=${group.source.id}&filter=new`}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-500 text-white text-sm font-medium shadow-calm-lg hover:shadow-calm-md transition-all"
              >
                Estudiar {newCount}
              </Link>
            )}
            {dueCount === 0 && newCount === 0 && (
              <span className="px-3 py-1.5 rounded-lg bg-calm-bg-tertiary/30 border border-calm-warm-100/20 text-calm-text-muted text-sm font-medium">
                Sin pendientes
              </span>
            )}
          </div>
        </div>

        {/* Estadísticas del deck */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 rounded-xl bg-calm-bg-tertiary/20 border border-calm-warm-100/20">
          <div>
            <p className="text-xs text-calm-text-muted">Total</p>
            <p className="text-lg font-bold text-white">
              {group.cards.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-calm-text-muted">Nuevas</p>
            <p className="text-lg font-bold text-sky-400">
              {newCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-calm-text-muted">Pendientes</p>
            <p className="text-lg font-bold text-amber-400">
              {dueCount}
            </p>
          </div>
        </div>

        {/* Lista de palabras */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-calm-text-muted mb-2">
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
              <span className="px-2 py-1 rounded-lg text-sm bg-calm-bg-tertiary/30 border border-calm-warm-100/20 text-calm-text-muted">
                +{group.cards.length - 20} más
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
