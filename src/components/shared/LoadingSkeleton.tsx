'use client';

/**
 * LoadingSkeleton - Componentes de carga esquemática
 * Proporciona feedback visual durante la carga de contenido
 */

import { motion, Transition, Easing } from 'framer-motion';

// Animación base para el shimmer
const shimmerAnimation: {
  animate: { backgroundPosition: string[] };
  transition: Transition;
} = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: [0, 0, 1, 1] as Easing,
  },
};

interface SkeletonProps {
  className?: string;
}

// Skeleton base con shimmer
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded ${className}`}
      style={{ backgroundSize: '200% 100%' }}
      animate={shimmerAnimation.animate}
      transition={shimmerAnimation.transition}
    />
  );
}

// Skeleton para texto
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`text-line-${i}`}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Skeleton para tarjetas
export function CardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <TextSkeleton lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton para lista de items
export function ListSkeleton({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={`list-item-${i}`} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-16 h-6 rounded" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para estadísticas/métricas
export function StatsSkeleton({ stats = 4, className = '' }: { stats?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${stats} gap-4 ${className}`}>
      {Array.from({ length: stats }).map((_, i) => (
        <div key={`stat-item-${i}`} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <Skeleton className="h-3 w-1/2 mb-2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para el dashboard neural
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatsSkeleton stats={4} />
      <div className="grid md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
    </div>
  );
}

// Skeleton para la página de decks
export function DecksSkeleton() {
  return (
    <div className="space-y-4">
      <StatsSkeleton stats={5} />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={`deck-${i}`} />
      ))}
    </div>
  );
}

// Skeleton para misiones
export function MissionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`mission-${i}`} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-2/3 mb-1" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para página de input
export function InputSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`input-option-${i}`} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <Skeleton className="w-16 h-16 mx-auto rounded-full mb-3" />
            <Skeleton className="h-5 w-2/3 mx-auto mb-2" />
            <Skeleton className="h-3 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
      <CardSkeleton />
    </div>
  );
}

// Skeleton para página de aprendizaje
export function LearnSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`learn-item-${i}`} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXERCISE SKELETONS (GS-2.1)
// ============================================

// Skeleton para ejercicios de tipo fill-in-the-blank
export function ExerciseSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Tipo de ejercicio */}
      <div className="flex justify-center mb-4">
        <Skeleton className="h-6 w-32 rounded-full bg-lf-primary/20" />
      </div>

      {/* Frase con hueco */}
      <div className="bg-lf-dark/50 rounded-2xl p-6 mb-6 border border-lf-primary/10">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <Skeleton className="h-8 w-16 bg-lf-muted/30" />
          <Skeleton className="h-8 w-20 bg-lf-muted/30" />
          <Skeleton className="h-10 w-24 rounded-lg bg-lf-primary/30" />
          <Skeleton className="h-8 w-24 bg-lf-muted/30" />
          <Skeleton className="h-8 w-12 bg-lf-muted/30" />
        </div>
        {/* Traducción */}
        <Skeleton className="h-4 w-48 mx-auto bg-lf-muted/20" />
      </div>

      {/* Opciones 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={`exercise-option-${i}`}
            className="h-14 rounded-xl bg-lf-soft border border-lf-primary/10"
          />
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-8 bg-lf-muted/20" />
        <Skeleton className="h-2 flex-1 rounded-full bg-lf-muted/20" />
        <Skeleton className="h-4 w-8 bg-lf-muted/20" />
      </div>
    </div>
  );
}

// Skeleton para ejercicio de audio/listening
export function ListeningExerciseSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Audio player */}
      <div className="bg-lf-dark/50 rounded-2xl p-8 mb-6 border border-lf-primary/10">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full bg-lf-primary/20" />
          <Skeleton className="h-2 w-48 rounded-full bg-lf-muted/20" />
          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-lf-muted/30" />
            <Skeleton className="w-14 h-14 rounded-full bg-lf-primary/30" />
            <Skeleton className="w-10 h-10 rounded-full bg-lf-muted/30" />
          </div>
        </div>
      </div>

      {/* Opciones */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={`listening-option-${i}`}
            className="h-16 rounded-xl bg-lf-soft border border-lf-primary/10"
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton para tarjeta SRS
export function SRSCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Contador de tarjetas */}
      <div className="flex justify-center gap-4 mb-4">
        <Skeleton className="h-6 w-16 rounded-full bg-green-500/20" />
        <Skeleton className="h-6 w-16 rounded-full bg-yellow-500/20" />
        <Skeleton className="h-6 w-16 rounded-full bg-red-500/20" />
      </div>

      {/* Tarjeta principal */}
      <div className="bg-lf-soft rounded-2xl p-8 shadow-lg border border-lf-primary/20">
        {/* Contenido frontal */}
        <div className="text-center mb-6">
          <Skeleton className="h-8 w-3/4 mx-auto mb-4 bg-lf-muted/30" />
          <Skeleton className="h-5 w-1/2 mx-auto bg-lf-muted/20" />
        </div>

        {/* Divider */}
        <Skeleton className="h-px w-full my-6 bg-lf-primary/10" />

        {/* Botón mostrar */}
        <Skeleton className="h-12 w-full rounded-xl bg-lf-primary/20" />
      </div>

      {/* Botones de respuesta (ocultos hasta mostrar) */}
      <div className="grid grid-cols-4 gap-2 mt-4 opacity-30">
        {['Again', 'Hard', 'Good', 'Easy'].map((label) => (
          <Skeleton
            key={label}
            className="h-12 rounded-lg bg-lf-muted/20"
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton para tarjeta SRS revelada
export function SRSCardRevealedSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Contador de tarjetas */}
      <div className="flex justify-center gap-4 mb-4">
        <Skeleton className="h-6 w-16 rounded-full bg-green-500/20" />
        <Skeleton className="h-6 w-16 rounded-full bg-yellow-500/20" />
        <Skeleton className="h-6 w-16 rounded-full bg-red-500/20" />
      </div>

      {/* Tarjeta principal */}
      <div className="bg-lf-soft rounded-2xl p-8 shadow-lg border border-lf-primary/20">
        {/* Frase original */}
        <div className="text-center mb-4">
          <Skeleton className="h-8 w-3/4 mx-auto mb-2 bg-lf-muted/30" />
          <Skeleton className="h-4 w-1/4 mx-auto bg-lf-muted/20" />
        </div>

        {/* Divider */}
        <Skeleton className="h-px w-full my-4 bg-lf-primary/10" />

        {/* Traducción */}
        <div className="text-center">
          <Skeleton className="h-6 w-2/3 mx-auto mb-2 bg-lf-accent/20" />
          <Skeleton className="h-4 w-1/2 mx-auto bg-lf-muted/20" />
        </div>
      </div>

      {/* Botones de respuesta */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-10 w-full rounded-lg bg-red-500/20" />
          <Skeleton className="h-3 w-12 bg-lf-muted/20" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-10 w-full rounded-lg bg-orange-500/20" />
          <Skeleton className="h-3 w-12 bg-lf-muted/20" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-10 w-full rounded-lg bg-green-500/20" />
          <Skeleton className="h-3 w-12 bg-lf-muted/20" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-10 w-full rounded-lg bg-blue-500/20" />
          <Skeleton className="h-3 w-12 bg-lf-muted/20" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para transición entre ejercicios
export function ExerciseTransitionSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex flex-col items-center justify-center py-12">
        {/* Icono de carga animado */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-lf-primary/30 border-t-lf-primary mb-4"
        />
        <Skeleton className="h-5 w-32 bg-lf-muted/30" />
      </div>
    </div>
  );
}

// Skeleton para resultados de sesión
export function SessionResultsSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto p-6">
      {/* Título */}
      <div className="text-center mb-8">
        <Skeleton className="h-16 w-16 mx-auto rounded-full bg-lf-accent/20 mb-4" />
        <Skeleton className="h-8 w-48 mx-auto mb-2 bg-lf-muted/30" />
        <Skeleton className="h-4 w-32 mx-auto bg-lf-muted/20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={`dashboard-stat-${i}`} className="bg-lf-dark/30 rounded-xl p-4 text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2 bg-lf-muted/30" />
            <Skeleton className="h-4 w-16 mx-auto bg-lf-muted/20" />
          </div>
        ))}
      </div>

      {/* XP ganado */}
      <div className="bg-lf-primary/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24 bg-lf-muted/30" />
          <Skeleton className="h-8 w-20 bg-lf-accent/30" />
        </div>
      </div>

      {/* Botones */}
      <div className="space-y-3">
        <Skeleton className="h-14 w-full rounded-xl bg-lf-primary/30" />
        <Skeleton className="h-12 w-full rounded-xl bg-lf-muted/20" />
      </div>
    </div>
  );
}

// Componente de página completa con skeleton
export function PageSkeleton({ type }: { type: 'decks' | 'missions' | 'dashboard' | 'input' | 'learn' | 'exercise' | 'srs' }) {
  const skeletons = {
    decks: DecksSkeleton,
    missions: MissionsSkeleton,
    dashboard: DashboardSkeleton,
    input: InputSkeleton,
    learn: LearnSkeleton,
    exercise: ExerciseSkeleton,
    srs: SRSCardSkeleton,
  };

  const SkeletonComponent = skeletons[type];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SkeletonComponent />
      </div>
    </div>
  );
}

export default Skeleton;
