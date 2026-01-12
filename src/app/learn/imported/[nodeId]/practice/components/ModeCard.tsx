'use client';

import { motion } from 'framer-motion';

type LessonMode = 'academia' | 'desafio';

interface ModeFeature {
  icon: string;
  text: string;
}

interface PracticeMode {
  id: LessonMode;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  glowColor: string;
  features: ModeFeature[];
  ariaLabel: string;
}

const PRACTICE_MODES: Record<LessonMode, PracticeMode> = {
  academia: {
    id: 'academia',
    title: 'Academia',
    subtitle: 'Modo de entrenamiento',
    icon: '📚',
    badge: 'Recomendado',
    badgeColor: 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
    gradient: 'radial-gradient(circle at 30% 30%, #22C55E, #16A34A)',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    features: [
      { icon: '✓', text: 'Sin límite de tiempo' },
      { icon: '✓', text: 'Con pistas y explicaciones' },
      { icon: '✓', text: 'Reintentos ilimitados' },
      { icon: '⭐', text: 'XP 1.0x' },
    ],
    ariaLabel:
      'Modo Academia: Entrenamiento sin límite de tiempo, con pistas y explicaciones, reintentos ilimitados. XP 1.0x. Recomendado para aprendizaje.',
  },
  desafio: {
    id: 'desafio',
    title: 'Desafío',
    subtitle: 'Modo competitivo',
    icon: '⚡',
    badge: 'Difícil',
    badgeColor: 'radial-gradient(circle at 30% 30%, #A855F7, #9333EA)',
    gradient: 'radial-gradient(circle at 30% 30%, #A855F7, #9333EA)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    features: [
      { icon: '⏱️', text: 'Límite de tiempo: 15 minutos' },
      { icon: '🚫', text: 'Sin pistas ni explicaciones' },
      { icon: '🚫', text: 'Sin reintentos' },
      { icon: '💎', text: 'XP 1.5x + Gemas' },
    ],
    ariaLabel:
      'Modo Desafío: Competitivo con límite de tiempo de 15 minutos, sin pistas ni explicaciones, sin reintentos. XP 1.5x + Gemas. Difícil.',
  },
};

interface ModeCardProps {
  mode: LessonMode;
  onSelect: (mode: LessonMode) => void;
  shouldAnimate: boolean;
}

/**
 * Individual practice mode card component.
 * Displays mode information with icon, title, description, and features.
 */
export function ModeCard({ mode, onSelect, shouldAnimate }: ModeCardProps) {
  const modeData = PRACTICE_MODES[mode];
  const { id, title, subtitle, icon, badge, badgeColor, gradient, glowColor, features, ariaLabel } =
    modeData;

  const isAcademia = mode === 'academia';
  const delay = isAcademia ? 0.2 : 0.4;
  const glowDelay = isAcademia ? 0 : 1.5;
  const iconDelay = isAcademia ? 0 : 2;
  const focusColor = isAcademia ? 'focus:ring-green-500' : 'focus:ring-purple-500';
  const borderColor = isAcademia ? 'rgba(34, 197, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)';
  const backgroundColor = isAcademia ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)';
  const titleColor = isAcademia ? 'text-green-400' : 'text-purple-400';
  const featureColor = isAcademia ? 'text-green-400' : 'text-purple-400';

  return (
    <motion.button
      onClick={() => onSelect(id)}
      className={`relative w-full focus:outline-none focus:ring-4 ${focusColor} focus:ring-offset-2 focus:ring-offset-lf-dark rounded-2xl`}
      style={{ willChange: shouldAnimate ? 'transform' : 'auto' }}
      whileHover={shouldAnimate ? { scale: 1.02 } : {}}
      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
      aria-label={ariaLabel}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-xl"
        style={{
          background: `radial-gradient(circle, ${glowColor}, transparent)`,
        }}
        animate={
          shouldAnimate
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }
            : {}
        }
        transition={{ duration: 3, repeat: Infinity, delay: glowDelay }}
      />

      {/* Card content */}
      <div
        className="relative backdrop-blur-md rounded-2xl p-6 border-2 text-left"
        style={{
          background: backgroundColor,
          borderColor,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
              style={{
                background: gradient,
                willChange: shouldAnimate ? 'transform' : 'auto',
              }}
              animate={
                shouldAnimate
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : {}
              }
              transition={{ duration: 4, repeat: Infinity, delay: iconDelay }}
            >
              {icon}
            </motion.div>
            <div>
              <h3
                className={`text-xl font-bold ${titleColor}`}
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                {title}
              </h3>
              <p className="text-sm text-lf-muted">{subtitle}</p>
            </div>
          </div>
          <span
            className="px-3 py-1 text-xs font-bold rounded-full"
            style={{
              background: badgeColor,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {badge}
          </span>
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 text-sm text-gray-300"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + index * 0.05 }}
            >
              <span className={featureColor}>{feature.icon}</span>
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
