'use client';

/**
 * ContinueCard - Tarjeta para retomar sesión
 *
 * Muestra al usuario la opción de continuar donde lo dejó:
 * - Ejercicios en progreso
 * - Repaso SRS parcial
 * - Input de contenido
 */

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSessionStore, type SessionType } from '@/store/useSessionStore';

// ============================================
// CONSTANTS
// ============================================

const SESSION_ICONS: Record<SessionType, string> = {
  exercise: '📝',
  lesson: '📚',
  srs: '🔄',
  input: '📥',
};

const SESSION_LABELS: Record<SessionType, string> = {
  exercise: 'Ejercicios',
  lesson: 'Lección',
  srs: 'Repaso de tarjetas',
  input: 'Input comprensible',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  return 'Hace más de un día';
}

// ============================================
// COMPONENT
// ============================================

interface ContinueCardProps {
  className?: string;
}

export function ContinueCard({ className = '' }: ContinueCardProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const { lastSession, clearSession, hasRecentSession } = useSessionStore();

  // No mostrar si no hay sesión reciente
  if (!lastSession || !hasRecentSession()) {
    return null;
  }

  const handleContinue = () => {
    router.push(lastSession.resumeUrl);
  };

  const handleDismiss = () => {
    clearSession();
  };

  const icon = SESSION_ICONS[lastSession.type];
  const label = SESSION_LABELS[lastSession.type];
  const timeAgo = formatTimeAgo(lastSession.timestamp);

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`
          bg-gradient-to-r from-lf-primary/20 via-lf-secondary/10 to-lf-primary/20
          rounded-2xl p-4 border border-lf-primary/30
          ${className}
        `}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-lf-primary/20 flex items-center justify-center text-2xl">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-lf-accent font-medium uppercase tracking-wide">
                Continuar
              </span>
              <span className="text-xs text-lf-muted">
                {timeAgo}
              </span>
            </div>

            <h3 className="text-white font-semibold truncate mb-1">
              {lastSession.title || label}
            </h3>

            {/* Progress info */}
            {lastSession.totalExercises && (
              <p className="text-sm text-lf-muted">
                {lastSession.exerciseIndex} de {lastSession.totalExercises} completados
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="p-2 text-lf-muted hover:text-white transition-colors rounded-lg
                         hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-lf-primary/50"
              aria-label="Descartar sesión"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <motion.button
              onClick={handleContinue}
              className="px-4 py-2 bg-lf-primary hover:bg-lf-primary/80
                         text-white font-medium rounded-xl transition-colors
                         focus:outline-none focus:ring-2 focus:ring-lf-primary/50
                         flex items-center gap-2"
              whileHover={prefersReduced ? {} : { scale: 1.02 }}
              whileTap={prefersReduced ? {} : { scale: 0.98 }}
            >
              Continuar
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-lf-dark/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-lf-primary to-lf-accent"
              initial={{ width: 0 }}
              animate={{ width: `${lastSession.progress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-lf-muted">Progreso</span>
            <span className="text-xs text-lf-accent font-medium">
              {lastSession.progress}%
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// COMPACT VARIANT
// ============================================

export function ContinueCardCompact({ className = '' }: ContinueCardProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const { lastSession, clearSession, hasRecentSession } = useSessionStore();

  if (!lastSession || !hasRecentSession()) {
    return null;
  }

  const handleContinue = () => {
    router.push(lastSession.resumeUrl);
  };

  const icon = SESSION_ICONS[lastSession.type];

  return (
    <motion.button
      onClick={handleContinue}
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        w-full p-3 bg-lf-primary/10 hover:bg-lf-primary/20
        rounded-xl border border-lf-primary/20
        flex items-center gap-3 text-left transition-colors
        focus:outline-none focus:ring-2 focus:ring-lf-primary/50
        ${className}
      `}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          Continuar: {lastSession.title || SESSION_LABELS[lastSession.type]}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-lf-dark/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-lf-primary"
              style={{ width: `${lastSession.progress}%` }}
            />
          </div>
          <span className="text-xs text-lf-muted">{lastSession.progress}%</span>
        </div>
      </div>
      <svg
        className="w-5 h-5 text-lf-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </motion.button>
  );
}
