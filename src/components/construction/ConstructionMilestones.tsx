/**
 * ConstructionMilestones Component
 * UI para sistema de progreso y hitos constructivos
 * TAREA 2.8.9.8: Sistema de progreso y hitos constructivos
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CONSTRUCTION_MILESTONES,
  THEME_BONUSES,
  STREAK_BONUSES,
  getStreakBonus,
  getNextMilestone,
  checkThemeCompletion,
  calculatePrestige,
  getActiveEvents,
  type ConstructionMilestone,
  type MilestoneCategory,
  type ThemeBonus,
} from '@/lib/progression/construction';
import { useConstructionStore } from '@/store/useConstructionStore';

// ============================================
// TIPOS
// ============================================

interface ConstructionMilestonesProps {
  onMilestoneClick?: (milestone: ConstructionMilestone) => void;
  onThemeClick?: (theme: ThemeBonus) => void;
  compact?: boolean;
}

interface MilestoneCardProps {
  milestone: ConstructionMilestone;
  isCompleted: boolean;
  progress: number;
  onClick?: () => void;
}

interface ThemeCardProps {
  theme: ThemeBonus;
  isCompleted: boolean;
  progress: number;
  onClick?: () => void;
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

interface PrestigeDisplayProps {
  level: number;
  title: string;
  progress: number;
  nextLevelXP: number;
  currentXP: number;
}

// ============================================
// CONSTANTES DE ESTILO
// ============================================

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-calm-bg-secondary dark:bg-calm-bg-elevated',
    border: 'border-calm-warm-200 dark:border-calm-warm-200',
    text: 'text-calm-text-secondary dark:text-calm-text-tertiary',
    glow: '',
  },
  uncommon: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    border: 'border-accent-400 dark:border-accent-600',
    text: 'text-accent-700 dark:text-accent-400',
    glow: '',
  },
  rare: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-400 dark:border-sky-500',
    text: 'text-sky-700 dark:text-sky-400',
    glow: 'shadow-blue-500/20',
  },
  epic: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-400 dark:border-sky-500',
    text: 'text-sky-700 dark:text-sky-400',
    glow: 'shadow-sky-500/30',
  },
  legendary: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-400 dark:border-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    glow: 'shadow-amber-500/40',
  },
};

const CATEGORY_ICONS: Record<MilestoneCategory, string> = {
  building: '🏗️',
  collection: '📦',
  mastery: '⚔️',
  streak: '🔥',
  theme: '🎨',
  event: '🎪',
  rare: '💎',
  speed: '⚡',
  exploration: '🔍',
};

const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  building: 'Construcción',
  collection: 'Colección',
  mastery: 'Maestría',
  streak: 'Rachas',
  theme: 'Temáticos',
  event: 'Eventos',
  rare: 'Rarezas',
  speed: 'Velocidad',
  exploration: 'Exploración',
};

// ============================================
// SUBCOMPONENTES
// ============================================

function MilestoneCard({ milestone, isCompleted, progress, onClick }: MilestoneCardProps) {
  const colors = RARITY_COLORS[milestone.rarity];
  const progressPercent = Math.min(100, Math.round(progress * 100));

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer
        transition-all duration-200
        ${colors.bg} ${colors.border}
        ${isCompleted ? 'opacity-100' : 'opacity-80'}
        ${milestone.rarity === 'legendary' || milestone.rarity === 'epic' ? `shadow-lg ${colors.glow}` : ''}
        hover:scale-[1.02] hover:shadow-md
      `}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Badge de completado */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-sm">✓</span>
        </div>
      )}

      {/* Icono y nombre */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl">{milestone.icon}</span>
        <div className="flex-1">
          <h4 className={`font-semibold ${colors.text}`}>{milestone.name}</h4>
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted line-clamp-2">
            {milestone.description}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      {!isCompleted && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-calm-text-muted mb-1">
            <span>Progreso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                milestone.rarity === 'legendary'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : milestone.rarity === 'epic'
                  ? 'bg-gradient-to-r from-sky-400 to-sky-500'
                  : milestone.rarity === 'rare'
                  ? 'bg-gradient-to-r from-sky-400 to-sky-500'
                  : 'bg-accent-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Recompensas */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {milestone.rewards.xp > 0 && (
          <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full">
            +{milestone.rewards.xp} XP
          </span>
        )}
        {milestone.rewards.coins > 0 && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
            +{milestone.rewards.coins} coins
          </span>
        )}
        {milestone.rewards.gems > 0 && (
          <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full">
            +{milestone.rewards.gems} gems
          </span>
        )}
        {milestone.rewards.title && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
            Título
          </span>
        )}
      </div>

      {/* Rareza badge */}
      <div className={`absolute top-2 right-2 text-xs uppercase font-bold ${colors.text} opacity-60`}>
        {milestone.rarity}
      </div>
    </motion.div>
  );
}

function ThemeCard({ theme, isCompleted, progress, onClick }: ThemeCardProps) {
  const progressPercent = Math.min(100, Math.round(progress * 100));

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer
        transition-all duration-200
        ${isCompleted
          ? 'bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-400'
          : 'bg-white dark:bg-calm-bg-elevated border-calm-warm-100 dark:border-calm-warm-200'
        }
        hover:scale-[1.02] hover:shadow-md
      `}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-sm">★</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{theme.icon}</span>
        <div>
          <h4 className="font-semibold text-calm-text-primary dark:text-calm-text-tertiary">{theme.name}</h4>
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted">{theme.description}</p>
        </div>
      </div>

      {!isCompleted && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-calm-text-muted mb-1">
            <span>{theme.requiredElements.length} elementos requeridos</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 px-2 py-0.5 rounded-full">
          x{theme.bonusMultiplier} bonus
        </span>
        <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full">
          +{theme.xpBonus} XP
        </span>
        {theme.exclusiveReward && (
          <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full">
            Exclusivo
          </span>
        )}
      </div>
    </motion.div>
  );
}

function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const bonus = getStreakBonus(currentStreak);
  const nextBonus = STREAK_BONUSES.find((b) => b.days > currentStreak);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔥</span>
          <div>
            <h4 className="font-bold text-amber-700 dark:text-amber-400">Racha Actual</h4>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">
              {currentStreak} días
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted">Mejor racha</p>
          <p className="text-lg font-semibold text-calm-text-secondary dark:text-calm-text-tertiary">
            {longestStreak} días
          </p>
        </div>
      </div>

      {/* Bonus actual */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-calm-text-secondary dark:text-calm-text-muted">Bonus actual:</span>
        <span className="font-bold text-accent-600 dark:text-accent-400">
          x{bonus.multiplier} XP
        </span>
        {bonus.xpBonus > 0 && (
          <span className="text-sm text-sky-600 dark:text-sky-400">
            (+{bonus.xpBonus} bonus)
          </span>
        )}
      </div>

      {/* Próximo bonus */}
      {nextBonus && (
        <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted">
            Próximo bonus en {nextBonus.days - currentStreak} días: x{nextBonus.multiplier} XP
          </p>
          <div className="h-1.5 bg-amber-200 dark:bg-amber-800 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-semantic-error rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStreak / nextBonus.days) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PrestigeDisplay({ level, title, progress, nextLevelXP, currentXP }: PrestigeDisplayProps) {
  const progressPercent = Math.min(100, Math.round(progress));

  return (
    <div className="bg-gradient-to-br from-sky-50 to-sky-50 dark:from-accent-900/20 dark:to-sky-900/20 rounded-xl p-4 border border-accent-200 dark:border-accent-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          {level}
        </div>
        <div>
          <h4 className="font-bold text-accent-700 dark:text-accent-400">{title}</h4>
          <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </p>
        </div>
      </div>

      <div className="h-2 bg-accent-200 dark:bg-accent-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-400 to-sky-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-xs text-calm-text-muted dark:text-calm-text-muted mt-1 text-right">
        {progressPercent}% hasta el siguiente nivel
      </p>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ConstructionMilestones({
  onMilestoneClick,
  onThemeClick,
  compact = false,
}: ConstructionMilestonesProps) {
  const [activeCategory, setActiveCategory] = useState<MilestoneCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Estado del store
  const {
    totalBuilds,
    unlockedElements,
    materialInventory,
    constructionMilestones,
    lastBuildDate,
  } = useConstructionStore();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const uniqueMaterials = Object.keys(materialInventory).filter(
      (k) => materialInventory[k] > 0
    ).length;

    // Calcular racha (simplificado)
    const lastBuild = lastBuildDate ? new Date(lastBuildDate) : null;
    const today = new Date();
    const daysSinceLastBuild = lastBuild
      ? Math.floor((today.getTime() - lastBuild.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const currentStreak = daysSinceLastBuild <= 1 ? totalBuilds : 0; // Simplificado

    return {
      totalBuilds,
      uniqueMaterials,
      currentStreak: Math.min(currentStreak, 100), // Cap para demo
      longestStreak: Math.min(totalBuilds, 100),
      completedMilestones: constructionMilestones.length,
    };
  }, [totalBuilds, materialInventory, constructionMilestones, lastBuildDate]);

  // Calcular progreso de hitos
  const milestonesWithProgress = useMemo(() => {
    return CONSTRUCTION_MILESTONES.map((milestone) => {
      const isCompleted = constructionMilestones.includes(milestone.id as unknown as number);
      let progress = 0;

      if (!isCompleted) {
        const { requirements } = milestone;
        switch (requirements.type) {
          case 'count':
            progress = stats.totalBuilds / requirements.target;
            break;
          case 'unique':
            progress = stats.uniqueMaterials / requirements.target;
            break;
          case 'streak':
            progress = stats.currentStreak / requirements.target;
            break;
          default:
            progress = 0;
        }
      } else {
        progress = 1;
      }

      return { milestone, isCompleted, progress: Math.min(1, progress) };
    });
  }, [constructionMilestones, stats]);

  // Filtrar hitos
  const filteredMilestones = useMemo(() => {
    return milestonesWithProgress.filter((m) => {
      if (!showCompleted && m.isCompleted) return false;
      if (activeCategory !== 'all' && m.milestone.category !== activeCategory) return false;
      if (m.milestone.hidden && !m.isCompleted) return false;
      return true;
    });
  }, [milestonesWithProgress, activeCategory, showCompleted]);

  // Calcular temas
  const themesWithProgress = useMemo(() => {
    return THEME_BONUSES.map((theme) => {
      const completedElements = theme.requiredElements.filter((e) =>
        unlockedElements.includes(e)
      ).length;
      const progress = completedElements / theme.requiredElements.length;
      const isCompleted = checkThemeCompletion(theme, unlockedElements);

      return { theme, isCompleted, progress };
    });
  }, [unlockedElements]);

  // Calcular prestigio
  const prestige = useMemo(() => {
    const totalXP = totalBuilds * 50; // Estimación simplificada
    return calculatePrestige(
      constructionMilestones.map(String),
      totalXP
    );
  }, [constructionMilestones, totalBuilds]);

  // Próximo hito
  const nextMilestone = useMemo(() => {
    return getNextMilestone(constructionMilestones.map(String), {
      totalBuilds: stats.totalBuilds,
      uniqueMaterials: stats.uniqueMaterials,
      currentStreak: stats.currentStreak,
    });
  }, [constructionMilestones, stats]);

  // Eventos activos
  const activeEvents = getActiveEvents();

  // Categorías disponibles
  const categories: (MilestoneCategory | 'all')[] = [
    'all',
    'building',
    'collection',
    'streak',
    'mastery',
    'theme',
    'event',
    'exploration',
  ];

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Resumen compacto */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {stats.completedMilestones}
            </p>
            <p className="text-xs text-calm-text-muted">Hitos completados</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.currentStreak}
            </p>
            <p className="text-xs text-calm-text-muted">Días de racha</p>
          </div>
        </div>

        {/* Próximo hito */}
        {nextMilestone && (
          <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-3 border border-calm-warm-100 dark:border-calm-warm-200">
            <p className="text-xs text-calm-text-muted mb-1">Próximo hito</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{nextMilestone.icon}</span>
              <span className="font-medium text-calm-text-primary dark:text-calm-text-tertiary">
                {nextMilestone.name}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreakDisplay
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
        />
        <PrestigeDisplay
          level={prestige.level}
          title={prestige.title}
          progress={((totalBuilds * 50) / prestige.nextLevelXP) * 100}
          nextLevelXP={prestige.nextLevelXP}
          currentXP={totalBuilds * 50}
        />
      </div>

      {/* Eventos activos */}
      {activeEvents.length > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-sky-50 dark:from-sky-900/20 dark:to-sky-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
          <h3 className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-2 mb-2">
            <span>🎪</span>Eventos Activos
          </h3>
          <div className="space-y-2">
            {activeEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <span className="text-calm-text-secondary dark:text-calm-text-tertiary">{event.name}</span>
                <span className="text-sm text-sky-600 dark:text-sky-400">
                  x{event.bonusMultiplier} bonus
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${activeCategory === cat
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-calm-bg-secondary dark:bg-calm-bg-elevated text-calm-text-secondary dark:text-calm-text-muted hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary'
              }
            `}
          >
            {cat === 'all' ? '📋 Todos' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
          </button>
        ))}

        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all ml-auto
            ${showCompleted
              ? 'bg-accent-500 text-white'
              : 'bg-calm-bg-secondary dark:bg-calm-bg-elevated text-calm-text-secondary dark:text-calm-text-muted'
            }
          `}
        >
          {showCompleted ? '✓ Completados' : '○ Ocultar completados'}
        </button>
      </div>

      {/* Temas temáticos */}
      {(activeCategory === 'all' || activeCategory === 'theme') && (
        <div>
          <h3 className="font-bold text-lg text-calm-text-primary dark:text-calm-text-tertiary mb-3 flex items-center gap-2">
            <span>🎨</span>Temas Especiales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themesWithProgress.map(({ theme, isCompleted, progress }) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isCompleted={isCompleted}
                progress={progress}
                onClick={() => onThemeClick?.(theme)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lista de hitos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-calm-text-primary dark:text-calm-text-tertiary">
            Hitos ({filteredMilestones.length})
          </h3>
          <p className="text-sm text-calm-text-muted">
            {stats.completedMilestones} / {CONSTRUCTION_MILESTONES.filter((m) => !m.hidden).length} completados
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            layout
          >
            {filteredMilestones.map(({ milestone, isCompleted, progress }) => (
              <motion.div
                key={milestone.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <MilestoneCard
                  milestone={milestone}
                  isCompleted={isCompleted}
                  progress={progress}
                  onClick={() => onMilestoneClick?.(milestone)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredMilestones.length === 0 && (
          <div className="text-center py-12 text-calm-text-muted dark:text-calm-text-muted">
            <span className="text-4xl mb-2 block">🏆</span>
            <p>No hay hitos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default ConstructionMilestones;
