import { LessonContentSchema } from '@/schemas/content';
import type { LessonContent, LanguageCode, LevelCode } from '@/types';
import { z } from 'zod';

const lessonCache = new Map<string, LessonContent>();

function getCacheKey(leafId: string): string {
  return `lesson-${leafId}`;
}

/**
 * Carga el contenido de una lección desde el sistema de archivos
 * En producción, esto debería cargar desde una API o CDN
 */
export async function loadLesson(
  lang: LanguageCode,
  level: LevelCode,
  leafId: string
): Promise<LessonContent | null> {
  const cacheKey = getCacheKey(leafId);

  // Verificar cache
  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey)!;
  }

  try {
    // Usar fetch para cargar el JSON (más confiable que import dinámico con variables)
    let jsonPath: string;
    if (level === 'A0' || leafId.startsWith('a0-') || leafId.startsWith('nodo-0-')) {
      // ÁREA 0 - Base Absoluta
      jsonPath = `/content/${lang}/A0/base-absoluta/${leafId}.json`;
    } else {
      // Lecciones normales
      jsonPath = `/content/${lang}/${level}/lessons/${leafId}.json`;
    }

    console.log(`[LessonLoader] Attempting to load from: ${jsonPath}`);

    const response = await fetch(jsonPath, {
      cache: 'no-store', // En desarrollo, siempre recargar
    });

    console.log(`[LessonLoader] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Failed to load lesson: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log(`[LessonLoader] Loaded data for ${leafId}, has leafId: ${!!rawData.leafId}`);

    // Debug: verificar datos antes de validar
    console.log(`[LessonLoader] Loading ${leafId}:`, {
      hasCoreExercises: !!rawData.coreExercises,
      pragmaStrike: rawData.coreExercises?.pragmaStrike?.length || 0,
      shardDetection: rawData.coreExercises?.shardDetection?.length || 0,
    });

    // Validar con Zod
    try {
      const validatedLesson = LessonContentSchema.parse(rawData);

      // Debug: verificar datos después de validar
      console.log(`[LessonLoader] Validated ${leafId}:`, {
        hasCoreExercises: !!validatedLesson.coreExercises,
        pragmaStrike: validatedLesson.coreExercises?.pragmaStrike?.length || 0,
        shardDetection: validatedLesson.coreExercises?.shardDetection?.length || 0,
        hasInputContent: !!validatedLesson.inputContent?.length,
        hasMiniTest: !!validatedLesson.miniTest,
      });

      // Guardar en cache
      lessonCache.set(cacheKey, validatedLesson);

      return validatedLesson;
    } catch (validationError) {
      console.error(`[LessonLoader] Validation error for ${leafId}:`, validationError);
      if (validationError instanceof z.ZodError) {
        console.error('[LessonLoader] Validation errors:', validationError.errors);
      }
      throw validationError;
    }
  } catch (error) {
    console.error(`[LessonLoader] Error loading lesson ${leafId}:`, error);
    if (error instanceof Error) {
      console.error('[LessonLoader] Error details:', error.message);
      console.error('[LessonLoader] Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Obtiene la lista de lecciones disponibles para un idioma y nivel
 */
export function getAvailableLessons(lang: LanguageCode, level: LevelCode): string[] {
  // Por ahora, solo tenemos leaf-1-1-greetings
  // En el futuro, esto podría leer de un índice o lista de archivos
  if (lang === 'fr' && level === 'A1') {
    return ['leaf-1-1-greetings'];
  }
  return [];
}

