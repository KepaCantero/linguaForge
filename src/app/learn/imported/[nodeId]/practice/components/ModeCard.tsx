'use client';

import { motion } from 'framer-motion';
import { GRADIENTS, COLORS } from '@/constants/colors';

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
    badgeColor: GRADIENTS.accent.primary,
    gradient: GRADIENTS.accent.primary,
    glowColor: COLORS.accent[40],
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
    badgeColor: GRADIENTS.sky.primary,
    gradient: GRADIENTS.sky.primary,
    glowColor: COLORS.sky[40],
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
  const focusColor = isAcademia ? 'focus:ring-accent-500' : 'focus:ring-sky-500';
  const borderColor = isAcademia ? COLORS.accent[30] : COLORS.sky[30];
  const backgroundColor = isAcademia ? COLORS.accent[10] : COLORS.sky[10];
  const titleColor = isAcademia ? 'text-accent-400' : 'text-sky-400';
  const featureColor = isAcademia ? 'text-accent-400' : 'text-sky-400';

  return (
    <motion.button
      onClick={() => onSelect(id)}
      className={`relative w-full focus:outline-none focus:ring-4 ${focusColor} focus:ring-offset-2 focus:ring-offset-calm-bg-tertiary rounded-2xl`}
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
                style={{ textShadow: COLORS.effects.textShadowMd }}
              >
                {title}
              </h3>
              <p className="text-sm text-calm-text-muted">{subtitle}</p>
            </div>
          </div>
          <span
            className="px-3 py-1 text-xs font-bold rounded-full"
            style={{
              background: badgeColor,
              color: 'white',
              textShadow: `0 1px 2px ${COLORS.black[30]}`,
            }}
          >
            {badge}
          </span>
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={`${feature.icon}-${feature.text}`}
              className="flex items-center gap-3 text-sm text-calm-text-tertiary"
              style={{ textShadow: COLORS.effects.textShadowSm }}
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
