'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSRSStore } from '@/store/useSRSStore';
import { useRouter } from 'next/navigation';
import { ContentSource } from '@/types/srs';
import { isDueForReview } from '@/lib/sm2';

interface QuickReviewButtonProps {
  source: ContentSource;
  className?: string;
}

export function QuickReviewButton({ source, className = '' }: QuickReviewButtonProps) {
  const { getCardsBySource } = useSRSStore();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Obtener cards de esta fuente que están pendientes de repaso
  const pendingCards = useMemo(() => {
    const cards = getCardsBySource(source.type, source.id);

    return cards.filter(card => {
      // Cards nuevas o que están listas para repaso
      return card.status === 'new' || isDueForReview(card);
    });
  }, [getCardsBySource, source.type, source.id]);

  const handleStartReview = () => {
    if (pendingCards.length === 0) return;
    
    // Navegar a la página de repaso con filtro por fuente
    router.push(`/decks/review?sourceType=${source.type}&sourceId=${source.id}`);
  };

  if (pendingCards.length === 0) {
    return null; // No mostrar botón si no hay cards pendientes
  }

  return (
    <motion.div
      className={`fixed bottom-24 right-4 z-50 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <button
        onClick={handleStartReview}
        className="bg-accent-600 hover:bg-accent-700 text-white rounded-full p-4 shadow-lg flex items-center gap-3 transition-colors"
      >
        <span className="text-2xl">📚</span>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-medium">
                Repasar {pendingCards.length} palabra{pendingCards.length !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {!isHovered && (
          <span className="absolute -top-1 -right-1 bg-semantic-error text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {pendingCards.length > 9 ? '9+' : pendingCards.length}
          </span>
        )}
      </button>
    </motion.div>
  );
}

