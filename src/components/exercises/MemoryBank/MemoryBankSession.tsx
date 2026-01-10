'use client';

/**
 * MemoryBankSession - Sesión completa de Memory Bank AAA
 * Integra todos los subsistemas: texturas, física, sonido, háptico
 * + Focus Mode + AAA Visual Design
 *
 * TAREA 2.8.5: MemoryBankSession Component
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EpisodicCard, type EpisodicCardContent } from './EpisodicCard';
import { type LearningContext, getTextureForContext } from '@/lib/textures';
import { useHaptic } from '@/lib/haptic';
import { useSoundEngine } from '@/lib/soundEngine';
import { X } from 'lucide-react';

// ============================================
// TIPOS
// ============================================

export interface MemoryBankCard extends EpisodicCardContent {
  isKnown?: boolean;
  reviewCount: number;
  lastReviewedAt?: string;
}

export interface SessionMetrics {
  totalCards: number;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  sessionDuration: number;
  accuracy: number;
}

export interface MemoryBankSessionProps {
  cards: MemoryBankCard[];
  context: LearningContext;
  onComplete: (metrics: SessionMetrics) => void;
  onCardReview?: (cardId: string, isCorrect: boolean) => void;
  title?: string;
  showProgress?: boolean;
}

// ============================================
// CONSTANTES
// ============================================

const ANIMATION_DURATION = 0.3;

// ============================================
// COMPONENTE
// ============================================

export function MemoryBankSession({
  cards,
  context,
  onComplete,
  onCardReview,
  title = 'Memory Bank',
  showProgress = true,
}: MemoryBankSessionProps) {
  // Estado
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState<MemoryBankCard[]>([]);
  const [responses, setResponses] = useState<{ cardId: string; isCorrect: boolean; responseTime: number }[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [cardStartTime, setCardStartTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Hooks
  const haptic = useHaptic();
  const sound = useSoundEngine();
  const texture = getTextureForContext(context);

  // Inicializar sesión
  useEffect(() => {
    if (cards.length > 0 && !isInitialized) {
      // Mezclar tarjetas
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setSessionCards(shuffled);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
      setIsInitialized(true);

      // Inicializar sonido (requiere interacción)
      sound.initialize();
    }
  }, [cards, isInitialized, sound]);

  // Tarjeta actual
  const currentCard = sessionCards[currentIndex];

  // Métricas calculadas
  const metrics = useMemo((): SessionMetrics => {
    const totalCards = sessionCards.length;
    const cardsReviewed = responses.length;
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const incorrectAnswers = cardsReviewed - correctAnswers;
    const totalResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0);
    const averageResponseTime = cardsReviewed > 0 ? totalResponseTime / cardsReviewed : 0;
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    const accuracy = cardsReviewed > 0 ? (correctAnswers / cardsReviewed) * 100 : 0;

    return {
      totalCards,
      cardsReviewed,
      correctAnswers,
      incorrectAnswers,
      averageResponseTime,
      sessionDuration,
      accuracy,
    };
  }, [sessionCards.length, responses, sessionStartTime]);

  // Progreso
  const progress = sessionCards.length > 0
    ? ((currentIndex) / sessionCards.length) * 100
    : 0;

  // ============================================
  // HANDLERS
  // ============================================

  const handleResponse = useCallback((isCorrect: boolean) => {
    if (!currentCard || isComplete) return;

    const responseTime = Date.now() - cardStartTime;

    // Registrar respuesta
    setResponses(prev => [
      ...prev,
      { cardId: currentCard.id, isCorrect, responseTime },
    ]);

    // Callback
    onCardReview?.(currentCard.id, isCorrect);

    // Siguiente tarjeta o completar
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCardStartTime(Date.now());
    } else {
      setIsComplete(true);
      haptic.milestone();
      sound.playCelebration();
    }
  }, [currentCard, currentIndex, sessionCards.length, cardStartTime, isComplete, haptic, sound, onCardReview]);

  const handleSwipeRight = useCallback(() => {
    handleResponse(true); // Correcto
  }, [handleResponse]);

  const handleSwipeLeft = useCallback(() => {
    handleResponse(false); // Incorrecto
  }, [handleResponse]);

  const handleComplete = useCallback(() => {
    onComplete(metrics);
  }, [onComplete, metrics]);

  // ============================================
  // RENDER: Estado de carga
  // ============================================

  if (!isInitialized || sessionCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: texture.accentColor, borderTopColor: 'transparent' }}
          />
          <p className="text-gray-500">Preparando sesión...</p>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // RENDER: Sesión completada
  // ============================================

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto p-6"
      >
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: texture.gradient,
            boxShadow: texture.shadow,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {metrics.accuracy >= 80 ? '🏆' : metrics.accuracy >= 60 ? '🎯' : '📚'}
          </motion.div>

          <h2 className="text-2xl font-bold mb-6" style={{ color: texture.accentColor }}>
            Sesión Completada
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <MetricCard
              label="Precisión"
              value={`${Math.round(metrics.accuracy)}%`}
              color={metrics.accuracy >= 80 ? 'green' : metrics.accuracy >= 60 ? 'yellow' : 'red'}
            />
            <MetricCard
              label="Tarjetas"
              value={`${metrics.cardsReviewed}/${metrics.totalCards}`}
              color="blue"
            />
            <MetricCard
              label="Correctas"
              value={metrics.correctAnswers.toString()}
              color="green"
            />
            <MetricCard
              label="Tiempo Promedio"
              value={`${(metrics.averageResponseTime / 1000).toFixed(1)}s`}
              color="purple"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white"
            style={{ backgroundColor: texture.accentColor }}
          >
            Continuar
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ============================================
  // RENDER: Sesión activa
  // ============================================

  return (
    <div className={`relative min-h-screen transition-all duration-500 ${isFocusMode ? 'bg-black/80 backdrop-blur-sm' : ''}`}>
      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center"
          >
            {/* Close Focus Mode Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsFocusMode(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-glass-surface backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-lf-accent"
              aria-label="Salir del modo focus"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Card in Focus Mode */}
            <div className="relative scale-110">
              <EpisodicCard
                content={currentCard}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-md mx-auto p-4 transition-all duration-500 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Header with Focus Mode Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>

            {/* Barra de progreso premium */}
            {showProgress && (
              <div className="relative h-3 bg-lf-dark/50 rounded-full overflow-hidden shadow-inner border border-white/10">
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-lf-primary via-lf-secondary to-lf-accent opacity-20"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-lf-primary via-lf-secondary to-lf-accent shadow-glow-accent"
                  style={{ backgroundSize: '200% 100%' }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ['0% 50%', '100% 50%'],
                  }}
                  transition={{
                    width: { duration: ANIMATION_DURATION },
                    backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </div>
            )}

            {/* Contador premium */}
            <div className="text-center text-sm text-lf-muted mt-2 font-rajdhani">
              <span className="text-lf-accent font-bold">{currentIndex + 1}</span>
              <span className="mx-1">/</span>
              <span>{sessionCards.length}</span>
            </div>
          </div>

          {/* Focus Mode Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFocusMode(true)}
            className="ml-4 px-4 py-2 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-lf-accent"
            aria-label="Activar modo focus"
          >
            🎯 Focus
          </motion.button>
        </div>

        {/* Área de tarjetas con ambient glow */}
        <div className="relative h-[340px] flex items-center justify-center">
          {/* Ambient glow behind card */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lf-primary/20 via-lf-secondary/20 to-lf-accent/20 blur-3xl"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ duration: ANIMATION_DURATION }}
                className="relative z-10"
              >
                <EpisodicCard
                  content={currentCard}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instrucciones premium */}
        <div className="mt-8 flex justify-between items-center px-4">
          <motion.div
            className="flex items-center gap-2 text-red-400 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="text-xl">←</span>
            <span className="font-semibold">No lo sé</span>
          </motion.div>

          <div className="text-center">
            <p className="text-xs text-lf-muted">Desliza la tarjeta para responder</p>
          </div>

          <motion.div
            className="flex items-center gap-2 text-green-400 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="font-semibold">Lo sé</span>
            <span className="text-xl">→</span>
          </motion.div>
        </div>

        {/* Estadísticas en tiempo real premium */}
        <div className="mt-6 flex justify-center gap-6">
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20"
            animate={{
              boxShadow: metrics.correctAnswers > 0
                ? ['0 0 0px rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.3)', '0 0 0px rgba(34, 197, 94, 0)']
                : '0 0 0px rgba(34, 197, 94, 0)',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-white font-bold font-rajdhani">{metrics.correctAnswers}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
            animate={{
              boxShadow: metrics.incorrectAnswers > 0
                ? ['0 0 0px rgba(239, 68, 68, 0)', '0 0 20px rgba(239, 68, 68, 0.3)', '0 0 0px rgba(239, 68, 68, 0)']
                : '0 0 0px rgba(239, 68, 68, 0)',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-red-400 text-lg">✗</span>
            <span className="text-white font-bold font-rajdhani">{metrics.incorrectAnswers}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface MetricCardProps {
  label: string;
  value: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}

function MetricCard({ label, value, color }: MetricCardProps) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default MemoryBankSession;
