'use client';

/**
 * EmptyState - Componente reutilizable para estados vacíos
 * Proporciona feedback visual cuando no hay contenido disponible
 */

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actions = [],
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        text-center
        ${isCompact ? 'py-8' : 'py-12'}
        ${isCard ? 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6' : ''}
        ${className}
      `}
    >
      <div className={`${isCompact ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>
        {icon}
      </div>
      <h3 className={`
        font-bold text-gray-900 dark:text-white
        ${isCompact ? 'text-lg mb-2' : 'text-xl mb-3'}
      `}>
        {title}
      </h3>
      <p className={`
        text-gray-500 dark:text-gray-400 max-w-md mx-auto
        ${isCompact ? 'text-sm mb-4' : 'mb-6'}
      `}>
        {description}
      </p>
      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action, index) => {
            const isPrimary = action.variant === 'primary' || index === 0;
            const buttonClass = isPrimary
              ? 'px-4 py-2 bg-lf-primary hover:bg-lf-primary/90 text-white font-medium rounded-lg transition-colors'
              : 'px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors';

            if (action.href) {
              return (
                <Link key={`action-${action.label}-${action.href}`} href={action.href} className={buttonClass}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={`action-${action.label}-${index}`}
                onClick={action.onClick}
                className={buttonClass}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// Presets para casos comunes
export const EMPTY_STATE_PRESETS = {
  noCards: {
    icon: '📚',
    title: 'No hay tarjetas',
    description: 'Aún no tienes tarjetas para estudiar. Importa contenido desde videos, audios o textos para crear tus primeras tarjetas.',
    actions: [{ label: 'Importar contenido', href: '/input' }],
  },
  noMissions: {
    icon: '🎯',
    title: 'Sin misiones disponibles',
    description: 'Las misiones se generan diariamente. Vuelve mañana para nuevos desafíos o completa ejercicios para desbloquear más.',
    actions: [{ label: 'Explorar contenido', href: '/learn' }],
  },
  noProgress: {
    icon: '🌱',
    title: 'Comienza tu aventura',
    description: 'Aún no has empezado a aprender. Elige un tema para comenzar tu viaje de aprendizaje de francés.',
    actions: [{ label: 'Empezar a aprender', href: '/learn' }],
  },
  noResults: {
    icon: '🔍',
    title: 'Sin resultados',
    description: 'No encontramos nada con estos filtros. Intenta con otros criterios de búsqueda.',
    actions: [],
  },
  noContent: {
    icon: '📭',
    title: 'Sin contenido',
    description: 'Esta sección está vacía. Importa contenido para empezar.',
    actions: [{ label: 'Importar', href: '/import' }],
  },
  error: {
    icon: '⚠️',
    title: 'Algo salió mal',
    description: 'Hubo un problema al cargar el contenido. Por favor, inténtalo de nuevo.',
    actions: [{ label: 'Reintentar', onClick: () => window.location.reload() }],
  },
} as const;

export default EmptyState;
