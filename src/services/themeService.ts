/**
 * Theme Service - Business logic for Learning Themes
 *
 * This service provides high-level business operations for managing learning themes.
 * It encapsulates complex logic like theme generation from nodes, difficulty calculation,
 * prerequisite validation, and theme recommendations.
 *
 * Location: src/services/themeService.ts
 */

import type {
  Theme,
  ThemeMetadata,
  ThemeCategory,
  CEFRLevel,
  ThemeRecommendation,
} from '@/types/theme';
import type { CreateThemeInput } from '@/types/theme';
import {
  calculateDifficultyScore,
  calculateEstimatedStudyTime,
  validatePrerequisites,
  generateThemeId,
} from '@/types/theme';

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Genera un Theme a partir de una lista de nodos
 *
 * @param nodes - Array de nodos importados (con sus subtopics y phrases)
 * @param title - Título del theme
 * @param description - Descripción del theme
 * @param category - Categoría del theme
 * @param level - Nivel CEFR del theme
 * @returns Theme generado con metadatos calculados
 */
export function generateThemeFromNodes(
  nodes: Array<{
    id: string;
    subtopics: Array<{ phrases: string[] }>;
  }>,
  title: string,
  description: string,
  category: ThemeCategory,
  level: CEFRLevel
): Theme {
  const now = new Date().toISOString();
  const nodeIds = nodes.map((n) => n.id);

  // Calcular word count total
  const wordCount = nodes.reduce((total, node) => {
    const nodeWords = node.subtopics.reduce((subTotal, subtopic) => {
      return subTotal + subtopic.phrases.reduce((phraseTotal, phrase) => {
        return phraseTotal + phrase.split(' ').length;
      }, 0);
    }, 0);
    return total + nodeWords;
  }, 0);

  // Calcular metadatos
  const metadata: ThemeMetadata = {
    wordCount,
    estimatedStudyTime: calculateEstimatedStudyTime(wordCount, level),
    difficultyScore: calculateDifficultyScore(category, level, 0),
    totalNodes: nodes.length,
    completedNodes: 0,
    averageNodeProgress: 0,
  };

  return {
    id: generateThemeId(),
    title,
    description,
    category,
    level,
    nodes: nodeIds,
    prerequisites: [],
    metadata,
    isPublic: true,
    isPremium: false,
    order: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calcula la puntuación de dificultad de un theme
 *
 * @param theme - Theme a evaluar
 * @returns Puntuación de dificultad (0-100)
 */
export function calculateThemeDifficulty(theme: Theme): number {
  return calculateDifficultyScore(
    theme.category,
    theme.level,
    theme.prerequisites.length
  );
}

/**
 * Valida si los prerrequisitos de un theme están cumplidos
 *
 * @param theme - Theme a validar
 * @param completedThemes - IDs de themes completados
 * @param allThemes - Todos los themes disponibles
 * @returns Objeto con resultado de validación
 */
export function validateThemePrerequisites(
  theme: Theme,
  completedThemes: string[],
  allThemes: Theme[]
): {
  met: boolean;
  missing: string[];
  missingThemes: Theme[];
} {
  return validatePrerequisites(theme.id, completedThemes, allThemes);
}

/**
 * Sugiere el siguiente theme a estudiar
 *
 * @param currentTheme - Theme actual (opcional)
 * @param allThemes - Todos los themes disponibles
 * @param completedThemes - IDs de themes completados
 * @param currentLevel - Nivel actual del usuario
 * @returns Theme sugerido o undefined
 */
export function suggestNextTheme(
  currentTheme: Theme | undefined,
  allThemes: Theme[],
  completedThemes: string[],
  currentLevel: CEFRLevel
): Theme | undefined {
  // Si hay un theme actual, buscar themes dependientes
  if (currentTheme) {
    const dependentThemes = allThemes.filter((theme) =>
      theme.prerequisites.includes(currentTheme.id)
    );

    // Filtrar por prerrequisitos cumplidos
    const availableDependents = dependentThemes.filter((theme) =>
      theme.prerequisites.every((prereq) => completedThemes.includes(prereq))
    );

    if (availableDependents.length > 0) {
      // Retornar el más cercano al nivel actual
      return availableDependents.find((t) => t.level === currentLevel) ||
             availableDependents[0];
    }
  }

  // Si no hay theme actual o dependientes, buscar themes disponibles del nivel actual
  const availableThemes = allThemes.filter((theme) => {
    // No incluir ya completados
    if (completedThemes.includes(theme.id)) {
      return false;
    }

    // Verificar prerrequisitos
    if (theme.prerequisites.length > 0) {
      return theme.prerequisites.every((prereq) => completedThemes.includes(prereq));
    }

    return true;
  });

  // Priorizar themes del nivel actual
  const sameLevelThemes = availableThemes.filter((t) => t.level === currentLevel);
  if (sameLevelThemes.length > 0) {
    // Ordenar por dificultad y retornar el más fácil
    return sameLevelThemes.sort((a, b) =>
      a.metadata.difficultyScore - b.metadata.difficultyScore
    )[0];
  }

  // Si no hay del mismo nivel, retornar el más fácil disponible
  if (availableThemes.length > 0) {
    return availableThemes.sort((a, b) =>
      a.metadata.difficultyScore - b.metadata.difficultyScore
    )[0];
  }

  return undefined;
}

/**
 * Genera recomendaciones de themes personalizadas
 *
 * @param allThemes - Todos los themes disponibles
 * @param completedThemes - IDs de themes completados
 * @param currentLevel - Nivel actual del usuario
 * @param studiedCategories - Categorías ya estudiadas
 * @param maxRecommendations - Número máximo de recomendaciones
 * @returns Array de recomendaciones
 */
export function generateThemeRecommendations(
  allThemes: Theme[],
  completedThemes: string[],
  currentLevel: CEFRLevel,
  studiedCategories: ThemeCategory[],
  maxRecommendations: number = 5
): ThemeRecommendation[] {
  // Filtrar themes candidatos (no completados, nivel apropiado)
  const candidateThemes = allThemes.filter((theme) => {
    if (completedThemes.includes(theme.id)) {
      return false;
    }

    // Solo themes del nivel actual o inferior
    if (theme.level > currentLevel) {
      return false;
    }

    return true;
  });

  // Calcular puntuación para cada candidato
  const scoredThemes = candidateThemes.map((theme) => {
    let score = 0;
    const reasons: string[] = [];

    // Factor 1: Nivel apropiado (30 puntos)
    if (theme.level === currentLevel) {
      score += 30;
      reasons.push('Apto para tu nivel actual');
    } else if (theme.level < currentLevel) {
      score += 15;
      reasons.push('Nivel adecuado para repaso');
    }

    // Factor 2: Prerrequisitos cumplidos (40 puntos)
    const prereqValidation = validatePrerequisites(theme.id, completedThemes, allThemes);
    if (prereqValidation.met) {
      score += 40;
      reasons.push('Todos los prerrequisitos completados');
    } else {
      const prereqProgress =
        (theme.prerequisites.length - prereqValidation.missing.length) /
        theme.prerequisites.length;
      score += prereqProgress * 40;
      reasons.push(`${Math.round(prereqProgress * 100)}% de prerrequisitos completados`);
    }

    // Factor 3: Diversidad de categorías (20 puntos)
    if (!studiedCategories.includes(theme.category)) {
      score += 20;
      reasons.push('Nueva categoría para explorar');
    }

    // Factor 4: Fundamentos (10 puntos)
    if (theme.category === 'basics' && !completedThemes.includes(theme.id)) {
      score += 10;
      reasons.push('Fundamento esencial');
    }

    // Determinar prioridad
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (score >= 80) {
      priority = 'high';
    } else if (score >= 50) {
      priority = 'medium';
    }

    return {
      theme,
      score,
      reasons,
      priority,
      prerequisitesMet: prereqValidation.met,
      estimatedReadiness: Math.round(score),
    };
  });

  // Ordenar por puntuación y seleccionar top N
  scoredThemes.sort((a, b) => b.score - a.score);

  return scoredThemes
    .slice(0, maxRecommendations)
    .map((item) => ({
      themeId: item.theme.id,
      reason: item.reasons.join('. '),
      priority: item.priority,
      prerequisitesMet: item.prerequisitesMet,
      estimatedReadiness: item.estimatedReadiness,
    }));
}

/**
 * Agrupa múltiples imports en un theme existente o crea uno nuevo
 *
 * @param nodeIds - IDs de los nodos a agrupar
 * @param existingThemeId - ID del theme existente (opcional)
 * @param themeData - Datos para crear nuevo theme (si no existe)
 * @returns ID del theme (existente o nuevo)
 */
export function groupNodesIntoTheme(
  nodeIds: string[],
  existingThemeId: string | undefined,
  themeData?: {
    title: string;
    description: string;
    category: ThemeCategory;
    level: CEFRLevel;
  }
): string {
  if (existingThemeId) {
    // Añadir nodos al theme existente
    // Esto se maneja en el store, aquí retornamos el ID
    return existingThemeId;
  }

  if (!themeData) {
    throw new Error('Se requiere themeData para crear un nuevo theme');
  }

  // Crear nuevo theme con los nodos
  // Esto se maneja en el store, aquí generamos el input
  const input: CreateThemeInput = {
    title: themeData.title,
    description: themeData.description,
    category: themeData.category,
    level: themeData.level,
    nodes: nodeIds,
    prerequisites: [],
    isPublic: true,
    isPremium: false,
    order: 0,
  };

  // Retornamos el input para que el store lo procese
  return JSON.stringify({ type: 'create', input });
}

/**
 * Calcula el progreso general de un theme basado en el progreso de sus nodos
 *
 * @param theme - Theme a evaluar
 * @param nodeProgressMap - Mapa de progreso de nodos (nodeId -> progreso 0-100)
 * @returns Metadatos actualizados del theme
 */
export function calculateThemeProgress(
  theme: Theme,
  nodeProgressMap: Record<string, number>
): ThemeMetadata {
  if (theme.nodes.length === 0) {
    return {
      ...theme.metadata,
      completedNodes: 0,
      averageNodeProgress: 0,
    };
  }

  // Calcular progreso promedio de nodos
  const totalProgress = theme.nodes.reduce((sum, nodeId) => {
    return sum + (nodeProgressMap[nodeId] || 0);
  }, 0);

  const averageProgress = totalProgress / theme.nodes.length;

  // Contar nodos completados (progreso >= 80%)
  const completedNodes = theme.nodes.filter(
    (nodeId) => (nodeProgressMap[nodeId] || 0) >= 80
  ).length;

  return {
    ...theme.metadata,
    completedNodes,
    averageNodeProgress: Math.round(averageProgress),
    lastStudied: new Date().toISOString(),
  };
}

/**
 * Actualiza metadatos de un theme basado en cambios en sus nodos
 *
 * @param theme - Theme a actualizar
 * @param wordCount - Nuevo conteo de palabras (opcional)
 * @returns Metadatos actualizados
 */
export function updateThemeMetadata(
  theme: Theme,
  wordCount?: number
): ThemeMetadata {
  const currentWordCount = wordCount ?? theme.metadata.wordCount;

  return {
    ...theme.metadata,
    wordCount: currentWordCount,
    estimatedStudyTime: calculateEstimatedStudyTime(currentWordCount, theme.level),
    difficultyScore: calculateDifficultyScore(
      theme.category,
      theme.level,
      theme.prerequisites.length
    ),
    totalNodes: theme.nodes.length,
  };
}

/**
 * Exporta un theme a formato JSON para compartir
 *
 * @param theme - Theme a exportar
 * @param includeNodes - Incluir datos de nodos
 * @param nodesData - Datos de nodos (si includeNodes es true)
 * @returns JSON string del theme
 */
export function exportThemeToJson(
  theme: Theme,
  includeNodes: boolean,
  nodesData?: unknown[]
): string {
  const exportData = {
    theme,
    nodes: includeNodes ? nodesData : undefined,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Importa un theme desde formato JSON
 *
 * @param jsonString - JSON string del theme
 * @returns Theme importado
 * @throws Error si el JSON es inválido
 */
export function importThemeFromJson(jsonString: string): Theme {
  try {
    const data = JSON.parse(jsonString);

    // Validar estructura básica
    if (!data.theme || !data.theme.id) {
      throw new Error('Formato de theme inválido');
    }

    // Generar nuevo ID para evitar conflictos
    const importedTheme: Theme = {
      ...data.theme,
      id: generateThemeId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return importedTheme;
  } catch (error) {
    throw new Error(`Error al importar theme: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Obtiene estadísticas agregadas de un conjunto de themes
 *
 * @param themes - Array de themes
 * @returns Estadísticas agregadas
 */
export function getThemesStats(themes: Theme[]): {
  total: number;
  byCategory: Record<ThemeCategory, number>;
  byLevel: Record<CEFRLevel, number>;
  totalNodes: number;
  totalStudyTime: number;
  averageDifficulty: number;
} {
  const stats = {
    total: themes.length,
    byCategory: {} as Record<ThemeCategory, number>,
    byLevel: {} as Record<CEFRLevel, number>,
    totalNodes: 0,
    totalStudyTime: 0,
    averageDifficulty: 0,
  };

  // Inicializar contadores
  const categories: ThemeCategory[] = ['basics', 'travel', 'food', 'culture', 'business', 'daily_life', 'health', 'shopping'];
  const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  categories.forEach((cat) => {
    stats.byCategory[cat] = 0;
  });

  levels.forEach((level) => {
    stats.byLevel[level] = 0;
  });

  // Calcular estadísticas
  let totalDifficulty = 0;

  themes.forEach((theme) => {
    stats.byCategory[theme.category]++;
    stats.byLevel[theme.level]++;
    stats.totalNodes += theme.metadata.totalNodes;
    stats.totalStudyTime += theme.metadata.estimatedStudyTime;
    totalDifficulty += theme.metadata.difficultyScore;
  });

  if (themes.length > 0) {
    stats.averageDifficulty = Math.round(totalDifficulty / themes.length);
  }

  return stats;
}
