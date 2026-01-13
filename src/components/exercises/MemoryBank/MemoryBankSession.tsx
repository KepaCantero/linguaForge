'use client';

/**
 * MemoryBankSession - Sesión completa de Memory Bank AAA
 * Integra todos los subsistemas: texturas, física, sonido, háptico
 * + Focus Mode + AAA Visual Design + Fixed transparency
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

  // Helpers para calcular métricas
  const calculateAccuracy = useCallback((cardsReviewed: number, correctAnswers: number): number => {
    return cardsReviewed > 0 ? (correctAnswers / cardsReviewed) * 100 : 0;
  }, []);

  const calculateAverageResponseTime = useCallback((responseList: { responseTime: number }[], cardsReviewed: number): number => {
    if (cardsReviewed === 0) return 0;
    const totalResponseTime = responseList.reduce((sum, r) => sum + r.responseTime, 0);
    return totalResponseTime / cardsReviewed;
  }, []);

  // Métricas calculadas
  const metrics = useMemo((): SessionMetrics => {
    const totalCards = sessionCards.length;
    const cardsReviewed = responses.length;
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const incorrectAnswers = cardsReviewed - correctAnswers;
    const averageResponseTime = calculateAverageResponseTime(responses, cardsReviewed);
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    const accuracy = calculateAccuracy(cardsReviewed, correctAnswers);

    return {
      totalCards,
      cardsReviewed,
      correctAnswers,
      incorrectAnswers,
      averageResponseTime,
      sessionDuration,
      accuracy,
    };
  }, [sessionCards.length, responses, sessionStartTime, calculateAverageResponseTime, calculateAccuracy]);

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

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev);
    haptic.tap();
  }, [haptic]);

  // ============================================
  // RENDER: Estado de carga
  // ============================================

  if (!isInitialized || sessionCards.length === 0) {
    return <LoadingState texture={texture} />;
  }

  // ============================================
  // RENDER: Sesión completada
  // ============================================

  if (isComplete) {
    return (
      <CompletionState
        metrics={metrics}
        onComplete={handleComplete}
      />
    );
  }

  // ============================================
  // RENDER: Sesión activa
  // ============================================

  return (
    <div className="relative min-h-screen bg-lf-dark">
      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <FocusModeView
            currentCard={currentCard}
            currentIndex={currentIndex}
            totalCards={sessionCards.length}
            progress={progress}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onExit={toggleFocusMode}
          />
        )}
      </AnimatePresence>

      {/* Normal Mode */}
      <NormalModeView
        isFocusMode={isFocusMode}
        title={title}
        showProgress={showProgress}
        currentIndex={currentIndex}
        totalCards={sessionCards.length}
        progress={progress}
        currentCard={currentCard}
        metrics={metrics}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onToggleFocus={toggleFocusMode}
      />
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

// ============================================
// TIPOS PARA SUBCOMPONENTES
// ============================================

interface LoadingStateProps {
  texture: ReturnType<typeof getTextureForContext>;
}

interface CompletionStateProps {
  metrics: SessionMetrics;
  onComplete: () => void;
}

interface FocusModeViewProps {
  currentCard: MemoryBankCard;
  currentIndex: number;
  totalCards: number;
  progress: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onExit: () => void;
}

interface NormalModeViewProps {
  isFocusMode: boolean;
  title: string;
  showProgress: boolean;
  currentIndex: number;
  totalCards: number;
  progress: number;
  currentCard: MemoryBankCard;
  metrics: SessionMetrics;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onToggleFocus: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}

// ============================================
// SUBCOMPONENTES EXTRACTIDOS
// ============================================

function LoadingState({ texture }: LoadingStateProps) {
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
        <p className="text-white/60">Preparando sesión...</p>
      </motion.div>
    </div>
  );
}

function CompletionState({ metrics, onComplete }: CompletionStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6"
    >
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '2px solid rgba(99, 102, 241, 0.5)',
          boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.3)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-6xl mb-4"
        >
          {getCompletionEmoji(metrics.accuracy)}
        </motion.div>

        <h2 className="text-2xl font-bold mb-6 text-white">
          Sesión Completada
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <MetricCard
            label="Precisión"
            value={`${Math.round(metrics.accuracy)}%`}
            color={getAccuracyColor(metrics.accuracy)}
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
          onClick={onComplete}
          className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-lf-primary to-lf-secondary shadow-lg"
        >
          Continuar
        </motion.button>
      </div>
    </motion.div>
  );
}

function getCompletionEmoji(accuracy: number): string {
  if (accuracy >= 80) return '🏆';
  if (accuracy >= 60) return '🎯';
  return '📚';
}

function getAccuracyColor(accuracy: number): 'green' | 'yellow' | 'red' {
  if (accuracy >= 80) return 'green';
  if (accuracy >= 60) return 'yellow';
  return 'red';
}

function FocusModeView({
  currentCard,
  currentIndex,
  totalCards,
  progress,
  onSwipeLeft,
  onSwipeRight,
  onExit,
}: FocusModeViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Animated particles */}
      <FocusModeParticles />

      {/* Top Bar - Focus Mode */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <FocusModeHeader />
        <FocusModeExitButton onExit={onExit} />
      </div>

      {/* Card Area - Centered */}
      <FocusModeCardArea
        currentCard={currentCard}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
      />

      {/* Bottom Bar - Progress */}
      <FocusModeProgressBar
        currentIndex={currentIndex}
        totalCards={totalCards}
        progress={progress}
      />
    </motion.div>
  );
}

function FocusModeParticles() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={`focus-particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${20 + i * 12}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, (i % 2 === 0 ? 50 : -50), 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </>
  );
}

function FocusModeHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lf-primary to-lf-secondary flex items-center justify-center">
        <span className="text-lg">🎯</span>
      </div>
      <div>
        <h3 className="text-white font-bold">Modo Focus</h3>
        <p className="text-sm text-white/60">Sin distracciones</p>
      </div>
    </div>
  );
}

function FocusModeExitButton({ onExit }: { onExit: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onExit}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
    >
      <X className="w-5 h-5" />
      <span className="font-medium">Salir</span>
    </motion.button>
  );
}

function FocusModeCardArea({
  currentCard,
  onSwipeLeft,
  onSwipeRight,
}: Pick<FocusModeViewProps, 'currentCard' | 'onSwipeLeft' | 'onSwipeRight'>) {
  return (
    <div className="relative z-10 flex-1 flex items-center justify-center px-4">
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lf-primary/30 via-lf-secondary/30 to-lf-accent/30 blur-3xl"
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1.1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: ANIMATION_DURATION }}
          className="relative"
        >
          <EpisodicCard
            content={currentCard}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            isFocusMode={true}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FocusModeProgressBar({ currentIndex, totalCards, progress }: Pick<FocusModeViewProps, 'currentIndex' | 'totalCards' | 'progress'>) {
  return (
    <div className="relative z-10 px-6 py-4">
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-lf-primary via-lf-secondary to-lf-accent rounded-full"
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

      <div className="flex items-center justify-between text-sm text-white/60">
        <span>Tarjeta {currentIndex + 1} de {totalCards}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

function NormalModeView({
  isFocusMode,
  title,
  showProgress,
  currentIndex,
  totalCards,
  progress,
  currentCard,
  metrics,
  onSwipeLeft,
  onSwipeRight,
  onToggleFocus,
}: NormalModeViewProps) {
  return (
    <div className={`max-w-md mx-auto p-4 transition-all duration-500 ${isFocusMode ? 'opacity-0 pointer-events-none fixed inset-0' : ''}`}>
      {/* Header */}
      <NormalModeHeader
        title={title}
        showProgress={showProgress}
        currentIndex={currentIndex}
        totalCards={totalCards}
        progress={progress}
        onToggleFocus={onToggleFocus}
      />

      {/* Card Area */}
      <NormalModeCardArea
        currentCard={currentCard}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
      />

      {/* Instructions */}
      <NormalModeInstructions />

      {/* Stats */}
      <NormalModeStats metrics={metrics} />
    </div>
  );
}

interface NormalModeHeaderProps {
  title: string;
  showProgress: boolean;
  currentIndex: number;
  totalCards: number;
  progress: number;
  onToggleFocus: () => void;
}

function NormalModeHeader({
  title,
  showProgress,
  currentIndex,
  totalCards,
  progress,
  onToggleFocus,
}: NormalModeHeaderProps) {
  return (
    <div className="mb-6">
      {/* Title Row with Focus Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFocus}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-lf-primary/20 to-lf-secondary/20 border border-lf-primary/30 text-white hover:border-lf-primary/50 transition-all"
        >
          <span className="text-lg">🎯</span>
          <span className="font-semibold text-sm">Focus</span>
        </motion.button>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="relative h-3 bg-lf-dark/50 rounded-full overflow-hidden shadow-inner border border-white/10">
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

      {/* Counter */}
      <div className="text-center text-sm text-lf-muted mt-2 font-rajdhani">
        <span className="text-lf-accent font-bold text-lg">{currentIndex + 1}</span>
        <span className="mx-1">/</span>
        <span className="text-lg">{totalCards}</span>
      </div>
    </div>
  );
}

interface NormalModeCardAreaProps {
  currentCard: MemoryBankCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function NormalModeCardArea({ currentCard, onSwipeLeft, onSwipeRight }: NormalModeCardAreaProps) {
  return (
    <div className="relative h-[340px] flex items-center justify-center">
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
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function NormalModeInstructions() {
  return (
    <div className="mt-8 flex justify-between items-center px-4">
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="text-xl">←</span>
        <span className="font-semibold">No lo sé</span>
      </motion.div>

      <div className="text-center">
        <p className="text-xs text-lf-muted">Desliza para responder • Doble click para voltear</p>
      </div>

      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="font-semibold">Lo sé</span>
        <span className="text-xl">→</span>
      </motion.div>
    </div>
  );
}

interface NormalModeStatsProps {
  metrics: SessionMetrics;
}

function NormalModeStats({ metrics }: NormalModeStatsProps) {
  return (
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
  );
}

// ============================================
// METRIC CARD (EXISTENTE)
// ============================================

function MetricCard({ label, value, color }: MetricCardProps) {
  const colors = {
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default MemoryBankSession;
