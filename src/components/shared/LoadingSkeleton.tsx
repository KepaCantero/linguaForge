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
          key={i}
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
        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
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
        <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
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
        <CardSkeleton key={i} />
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
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
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
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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

// Componente de página completa con skeleton
export function PageSkeleton({ type }: { type: 'decks' | 'missions' | 'dashboard' | 'input' | 'learn' }) {
  const skeletons = {
    decks: DecksSkeleton,
    missions: MissionsSkeleton,
    dashboard: DashboardSkeleton,
    input: InputSkeleton,
    learn: LearnSkeleton,
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
