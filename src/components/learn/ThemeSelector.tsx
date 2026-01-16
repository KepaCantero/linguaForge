/**
 * ThemeSelector Component
 *
 * Premium UI component for selecting and filtering learning themes.
 * Features category filtering, level filtering, prerequisite visualization,
 * and progress tracking.
 *
 * Location: src/components/learn/ThemeSelector.tsx
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  THEME_CATEGORY_ICONS,
  THEME_CATEGORY_COLORS,
  type ThemeCategory,
  type CEFRLevel,
} from '@/types/theme';
import type { Theme, ThemeFilters } from '@/types/theme';
import { useLearningThemeStore, useLearningThemes, useAvailableLearningThemes } from '@/store/useLearningThemeStore';
import { useLearningThemeProgress } from '@/store/useLearningThemeStore';
import { useAnimationControl } from '@/hooks/useAnimationBudget';

// ============================================================
// TYPES
// ============================================================

interface ThemeSelectorProps {
  onThemeSelect?: (themeId: string) => void;
  showOnlyAvailable?: boolean;
  initialFilters?: Partial<ThemeFilters>;
  maxHeight?: string;
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

/**
 * ThemeCardWithProgress - Wrapper component that calls the hook
 * This follows React Hooks rules by calling the hook at the top level
 */
function ThemeCardWithProgress({
  theme,
  onClick,
}: {
  theme: Theme;
  onClick: (themeId: string) => void;
}) {
  const progress = useLearningThemeProgress(theme.id);

  return (
    <ThemeCard
      key={theme.id}
      theme={theme}
      onClick={() => onClick(theme.id)}
      progress={progress}
    />
  );
}

/**
 * Filtros de categoría y nivel
 */
function FilterBar({
  selectedCategory,
  selectedLevel,
  onCategoryChange,
  onLevelChange,
  onClearFilters,
}: {
  selectedCategory: ThemeCategory | 'all';
  selectedLevel: CEFRLevel | 'all';
  onCategoryChange: (category: ThemeCategory | 'all') => void;
  onLevelChange: (level: CEFRLevel | 'all') => void;
  onClearFilters: () => void;
}) {
  const categories: Array<{ value: ThemeCategory | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'Todos', icon: '📚' },
    { value: 'basics', label: 'Fundamentos', icon: '🎯' },
    { value: 'travel', label: 'Viajes', icon: '✈️' },
    { value: 'food', label: 'Comida', icon: '🍽️' },
    { value: 'culture', label: 'Cultura', icon: '🎨' },
    { value: 'business', label: 'Negocios', icon: '💼' },
    { value: 'daily_life', label: 'Vida Diaria', icon: '🏠' },
    { value: 'health', label: 'Salud', icon: '🏥' },
    { value: 'shopping', label: 'Compras', icon: '🛒' },
  ];

  const levels: Array<{ value: CEFRLevel | 'all'; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'A0', label: 'A0 - Inicio' },
    { value: 'A1', label: 'A1 - Principiante' },
    { value: 'A2', label: 'A2 - Elemental' },
    { value: 'B1', label: 'B1 - Intermedio' },
    { value: 'B2', label: 'B2 - Intermedio Alto' },
    { value: 'C1', label: 'C1 - Avanzado' },
    { value: 'C2', label: 'C2 - Maestría' },
  ];

  return (
    <div className="space-y-4">
      {/* Filtro de categoría */}
      <div>
        <label className="block text-sm font-semibold text-calm-text-muted mb-2">
          Categoría
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            const colors = cat.value !== 'all' ? THEME_CATEGORY_COLORS[cat.value] : null;

            return (
              <motion.button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? colors
                      ? `${colors.bg} ${colors.border} ${colors.text} border`
                      : 'bg-lf-accent/20 border-lf-accent/30 text-lf-accent border'
                    : 'bg-calm-bg-tertiary border-calm-warm-200 text-calm-text-muted border hover:border-calm-warm-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Filtro de nivel */}
      <div>
        <label className="block text-sm font-semibold text-calm-text-muted mb-2">
          Nivel
        </label>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <motion.button
              key={level.value}
              onClick={() => onLevelChange(level.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedLevel === level.value
                  ? 'bg-lf-accent/20 border-lf-accent/30 text-lf-accent border'
                  : 'bg-calm-bg-tertiary border-calm-warm-200 text-calm-text-muted border hover:border-calm-warm-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {level.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Botón limpiar filtros */}
      {(selectedCategory !== 'all' || selectedLevel !== 'all') && (
        <motion.button
          onClick={onClearFilters}
          className="text-sm text-calm-text-muted hover:text-calm-text-primary transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Limpiar filtros
        </motion.button>
      )}
    </div>
  );
}

/**
 * Tarjeta de un Theme individual
 */
function ThemeCard({
  theme,
  onClick,
  progress,
}: {
  theme: Theme;
  onClick: () => void;
  progress: { isCompleted: boolean; isLocked: boolean; progress: number };
}) {
  const { shouldAnimate } = useAnimationControl();
  const colors = THEME_CATEGORY_COLORS[theme.category];
  const icon = THEME_CATEGORY_ICONS[theme.category];

  return (
    <motion.div
      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
        progress.isLocked
          ? 'border-calm-warm-200 bg-calm-bg-tertiary opacity-60'
          : progress.isCompleted
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : `${colors.border} ${colors.bg} hover:shadow-lg`
      }`}
      onClick={progress.isLocked ? undefined : onClick}
      whileHover={shouldAnimate && !progress.isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className={`font-bold ${colors.text} text-lg`}>
              {theme.title}
            </h3>
            <p className="text-xs text-calm-text-muted">
              {theme.level} • {theme.category}
            </p>
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-1">
          {progress.isLocked && (
            <span className="text-lg" title="Bloqueado - completa los prerrequisitos">
              🔒
            </span>
          )}
          {progress.isCompleted && (
            <span className="text-lg" title="Completado">
              ✅
            </span>
          )}
          {theme.isPremium && (
            <span className="text-lg" title="Premium">
              💎
            </span>
          )}
        </div>
      </div>

      {/* Descripción */}
      <p className="text-sm text-calm-text-secondary mb-3 line-clamp-2">
        {theme.description}
      </p>

      {/* Metadatos */}
      <div className="flex items-center gap-3 text-xs text-calm-text-muted mb-3">
        <span>📖 {theme.metadata.totalNodes} nodos</span>
        <span>⏱️ {theme.metadata.estimatedStudyTime} min</span>
        <span>📊 Dificultad: {theme.metadata.difficultyScore}/100</span>
      </div>

      {/* Prerrequisitos */}
      {theme.prerequisites.length > 0 && (
        <div className="text-xs text-calm-text-muted mb-3">
          <span className="font-medium">Prerrequisitos:</span> {theme.prerequisites.length} theme
          {theme.prerequisites.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Barra de progreso */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-calm-text-muted">Progreso</span>
          <span className={colors.text}>{progress.progress}%</span>
        </div>
        <div className="w-full bg-calm-bg-tertiary rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full ${progress.isCompleted ? 'bg-emerald-500' : colors.text.replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Lista vacía con mensaje
 */
function EmptyState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-calm-text-primary mb-2">
        No se encontraron themes
      </h3>
      <p className="text-calm-text-muted mb-4">
        Intenta ajustar los filtros de búsqueda
      </p>
      <motion.button
        onClick={onClearFilters}
        className="px-6 py-2 bg-lf-accent/20 border border-lf-accent/30 text-lf-accent rounded-lg font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Limpiar filtros
      </motion.button>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ThemeSelector({
  onThemeSelect,
  showOnlyAvailable = false,
  initialFilters = {},
  maxHeight = '60vh',
}: ThemeSelectorProps) {
  // State
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>(
    initialFilters.category ?? 'all'
  );
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>(
    initialFilters.level ?? 'all'
  );
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery ?? '');

  // Store hooks
  const allThemes = useLearningThemes();
  const availableThemes = useAvailableLearningThemes();
  const getFilteredThemes = useLearningThemeStore((state) => state.getFilteredThemes);

  // Determinar qué themes mostrar
  const themesToFilter = useMemo(() => {
    return showOnlyAvailable ? availableThemes : allThemes;
  }, [showOnlyAvailable, availableThemes, allThemes]);

  // Aplicar filtros
  const filteredThemes = useMemo(() => {
    return getFilteredThemes({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      level: selectedLevel !== 'all' ? selectedLevel : undefined,
      searchQuery: searchQuery || undefined,
    }).filter((theme) => themesToFilter.some((t) => t.id === theme.id));
  }, [getFilteredThemes, selectedCategory, selectedLevel, searchQuery, themesToFilter]);

  // Handlers
  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSearchQuery('');
  };

  const handleThemeClick = (themeId: string) => {
    if (onThemeSelect) {
      onThemeSelect(themeId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-calm-bg-tertiary border border-calm-warm-200 rounded-xl text-calm-text-primary placeholder-calm-text-muted focus:outline-none focus:ring-2 focus:ring-lf-accent focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-calm-text-muted">
          🔍
        </span>
      </div>

      {/* Filtros */}
      <FilterBar
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        onCategoryChange={setSelectedCategory}
        onLevelChange={setSelectedLevel}
        onClearFilters={handleClearFilters}
      />

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-calm-text-muted">
        <span>
          {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''} encontrado
          {filteredThemes.length !== 1 ? 's' : ''}
        </span>
        {showOnlyAvailable && (
          <span className="text-xs text-calm-text-muted">
            Mostrando solo disponibles
          </span>
        )}
      </div>

      {/* Lista de themes */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        <AnimatePresence>
          {filteredThemes.length === 0 ? (
            <EmptyState onClearFilters={handleClearFilters} />
          ) : (
            filteredThemes.map((theme) => (
              <ThemeCardWithProgress
                key={theme.id}
                theme={theme}
                onClick={handleThemeClick}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default ThemeSelector;
