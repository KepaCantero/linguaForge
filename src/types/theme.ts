/**
 * Theme Types - LinguaForge Theme Abstraction
 *
 * A Theme is a logical grouping of related Nodes that form a coherent learning unit.
 * Themes provide structure and prerequisites for the learning path.
 *
 * Node vs Theme:
 * - Node: Individual content container (video/article/podcast with subtopics)
 * - Theme: Logical grouping of related nodes with prerequisites and metadata
 */

import { z } from 'zod';
import { SUPPORTED_LEVELS } from '@/lib/constants';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

/**
 * Categorías temáticas disponibles
 * Agrupan temas por área de conocimiento
 */
export const ThemeCategoryValues = [
  'basics',      // Fundamentos (saludos, alphabet, números)
  'travel',      // Viajes (transporte, hoteles, direcciones)
  'food',        // Comida (restaurantes, recetas, vocabulario culinario)
  'culture',     // Cultura (arte, historia, costumbres)
  'business',    // Negocios (correo, reuniones, presentaciones)
  'daily_life',  // Vida diaria (familia, hogar, rutinas)
  'health',      // Salud (médico, farmacia, emergencias)
  'shopping',    // Compras (tiendas, precios, devoluciones)
] as const;

export type ThemeCategory = (typeof ThemeCategoryValues)[number];

/**
 * Niveles CEFR para temas
 */
export const CEFRLevelSchema = z.enum(SUPPORTED_LEVELS);
export type CEFRLevel = z.infer<typeof CEFRLevelSchema>;

// ============================================================
// SCHEMAS ZOD
// ============================================================

/**
 * Metadatos de un Theme
 * Información calculable y opcional sobre el tema
 */
export const ThemeMetadataSchema = z.object({
  wordCount: z.number().min(0).default(0),
  estimatedStudyTime: z.number().min(0).default(0), // en minutos
  difficultyScore: z.number().min(0).max(100).default(50), // 0-100
  lastStudied: z.string().optional(), // ISO date string
  totalNodes: z.number().min(0).default(0),
  completedNodes: z.number().min(0).default(0),
  averageNodeProgress: z.number().min(0).max(100).default(0),
});

export type ThemeMetadata = z.infer<typeof ThemeMetadataSchema>;

/**
 * Theme principal
 * Agrupa nodos relacionados con prerrequisitos y metadatos
 */
export const ThemeSchema = z.object({
  // Identificación
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),

  // Clasificación
  category: z.enum(ThemeCategoryValues),
  level: CEFRLevelSchema,

  // Estructura
  nodes: z.array(z.string()).default([]), // Node IDs agrupados

  // Dependencias
  prerequisites: z.array(z.string()).default([]), // Theme IDs requeridos

  // Metadatos
  metadata: ThemeMetadataSchema,

  // Configuración
  isPublic: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  order: z.number().default(0), // Orden de visualización

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Input para crear un nuevo Theme
 */
export const CreateThemeInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.enum(ThemeCategoryValues),
  level: CEFRLevelSchema,
  nodes: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  order: z.number().default(0),
});

export type CreateThemeInput = z.infer<typeof CreateThemeInputSchema>;

/**
 * Input para actualizar un Theme
 */
export const UpdateThemeInputSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.enum(ThemeCategoryValues).optional(),
  level: CEFRLevelSchema.optional(),
  nodes: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  order: z.number().optional(),
});

export type UpdateThemeInput = z.infer<typeof UpdateThemeInputSchema>;

/**
 * Filtros para buscar Themes
 */
export const ThemeFiltersSchema = z.object({
  category: z.enum(ThemeCategoryValues).optional(),
  level: CEFRLevelSchema.optional(),
  isPremium: z.boolean().optional(),
  searchQuery: z.string().optional(),
  hasPrerequisites: z.boolean().optional(),
});

export type ThemeFilters = z.infer<typeof ThemeFiltersSchema>;

/**
 * Recomendación de Theme
 */
export const ThemeRecommendationSchema = z.object({
  themeId: z.string(),
  reason: z.string(), // Explicación de por qué se recomienda
  priority: z.enum(['high', 'medium', 'low']),
  prerequisitesMet: z.boolean(),
  estimatedReadiness: z.number().min(0).max(100), // % de preparación
});

export type ThemeRecommendation = z.infer<typeof ThemeRecommendationSchema>;

// ============================================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================================

/**
 * Tiempos estimados de estudio por nivel (palabras por minuto)
 */
export const STUDY_RATE_WORDS_PER_MINUTE = {
  A0: 5,   // Principiante absoluto: 5 palabras/minuto
  A1: 8,   // Principiante: 8 palabras/minuto
  A2: 12,  // Elemental: 12 palabras/minuto
  B1: 18,  // Intermedio: 18 palabras/minuto
  B2: 25,  // Intermedio alto: 25 palabras/minuto
  C1: 35,  // Avanzado: 35 palabras/minuto
  C2: 50,  // Maestría: 50 palabras/minuto
} as const;

/**
 * Puntuaciones de dificultad base por categoría
 */
export const BASE_DIFFICULTY_BY_CATEGORY: Record<ThemeCategory, number> = {
  basics: 10,      // Fundamentos: más fácil
  daily_life: 25,  // Vida diaria: vocabulario común
  food: 35,        // Comida: vocabulario específico pero común
  travel: 45,      // Viajes: situaciones específicas
  shopping: 50,    // Compras: transacciones
  health: 60,      // Salud: vocabulario técnico básico
  business: 70,    // Negocios: register formal
  culture: 80,     // Cultura: abstracto y contextual
} as const;

/**
 * Modificadores de dificultad por nivel CEFR
 */
export const DIFFICULTY_MODIFIER_BY_LEVEL: Record<CEFRLevel, number> = {
  A0: 0.5,   // Reducción del 50%
  A1: 0.7,   // Reducción del 30%
  A2: 0.85,  // Reducción del 15%
  B1: 1.0,   // Base
  B2: 1.2,   // Incremento del 20%
  C1: 1.4,   // Incremento del 40%
  C2: 1.6,   // Incremento del 60%
} as const;

/**
 * Iconos por categoría de theme
 */
export const THEME_CATEGORY_ICONS: Record<ThemeCategory, string> = {
  basics: '🎯',
  travel: '✈️',
  food: '🍽️',
  culture: '🎨',
  business: '💼',
  daily_life: '🏠',
  health: '🏥',
  shopping: '🛒',
} as const;

/**
 * Colores por categoría de theme (Tailwind classes)
 */
export const THEME_CATEGORY_COLORS: Record<ThemeCategory, {
  bg: string;
  border: string;
  text: string;
  gradient: string;
}> = {
  basics: {
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-indigo-600/10',
  },
  travel: {
    bg: 'bg-sky-500/20',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    gradient: 'from-sky-500/20 to-sky-600/10',
  },
  food: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    gradient: 'from-amber-500/20 to-amber-600/10',
  },
  culture: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/10',
  },
  business: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    gradient: 'from-rose-500/20 to-rose-600/10',
  },
  daily_life: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },
  health: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    gradient: 'from-red-500/20 to-red-600/10',
  },
  shopping: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    gradient: 'from-pink-500/20 to-pink-600/10',
  },
} as const;

// ============================================================
// FUNCIONES HELPER
// ============================================================

/**
 * Calcula el tiempo estimado de estudio basado en palabras y nivel
 */
export function calculateEstimatedStudyTime(
  wordCount: number,
  level: CEFRLevel
): number {
  const wordsPerMinute = STUDY_RATE_WORDS_PER_MINUTE[level];
  const estimatedMinutes = Math.ceil(wordCount / wordsPerMinute);

  // Añadir tiempo para ejercicios y repaso (50% adicional)
  return Math.round(estimatedMinutes * 1.5);
}

/**
 * Calcula la puntuación de dificultad de un theme
 */
export function calculateDifficultyScore(
  category: ThemeCategory,
  level: CEFRLevel,
  prerequisitesCount: number
): number {
  const baseDifficulty = BASE_DIFFICULTY_BY_CATEGORY[category];
  const levelModifier = DIFFICULTY_MODIFIER_BY_LEVEL[level];

  // Dificultad base ajustada por nivel
  let difficulty = baseDifficulty * levelModifier;

  // Añadir dificultad por prerrequisitos (5 puntos cada uno)
  difficulty += prerequisitesCount * 5;

  // Asegurar que esté en rango 0-100
  return Math.max(0, Math.min(100, Math.round(difficulty)));
}

/**
 * Valida si los prerrequisitos de un theme están cumplidos
 */
export function validatePrerequisites(
  themeId: string,
  completedThemes: string[],
  allThemes: Theme[]
): {
  met: boolean;
  missing: string[];
  missingThemes: Theme[];
} {
  const theme = allThemes.find(t => t.id === themeId);

  if (!theme || theme.prerequisites.length === 0) {
    return { met: true, missing: [], missingThemes: [] };
  }

  const missing = theme.prerequisites.filter(
    prereq => !completedThemes.includes(prereq)
  );

  const missingThemes = allThemes.filter(t => missing.includes(t.id));

  return {
    met: missing.length === 0,
    missing,
    missingThemes,
  };
}

/**
 * Genera un ID único para un theme
 */
export function generateThemeId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
