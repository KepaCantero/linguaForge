import { LessonContentSchema } from '@/schemas/content';
import type { LessonContent, LanguageCode, LevelCode } from '@/types';

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
    // Importar dinámicamente el JSON
    // Next.js requiere que los imports dinámicos sean estáticos o usen rutas relativas
    const lessonData = await import(`@/../content/${lang}/${level}/lessons/${leafId}.json`);

    // Manejar tanto default export como named export
    const rawData = lessonData.default || lessonData;

    // Debug: verificar datos antes de validar
    console.log(`[LessonLoader] Loading ${leafId}:`, {
      hasCoreExercises: !!rawData.coreExercises,
      pragmaStrike: rawData.coreExercises?.pragmaStrike?.length || 0,
      shardDetection: rawData.coreExercises?.shardDetection?.length || 0,
    });

    // Validar con Zod
    const validatedLesson = LessonContentSchema.parse(rawData);

    // Debug: verificar datos después de validar
    console.log(`[LessonLoader] Validated ${leafId}:`, {
      hasCoreExercises: !!validatedLesson.coreExercises,
      pragmaStrike: validatedLesson.coreExercises?.pragmaStrike?.length || 0,
      shardDetection: validatedLesson.coreExercises?.shardDetection?.length || 0,
    });

    // Guardar en cache
    lessonCache.set(cacheKey, validatedLesson);

    return validatedLesson;
  } catch (error) {
    console.error(`Error loading lesson ${leafId}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
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

