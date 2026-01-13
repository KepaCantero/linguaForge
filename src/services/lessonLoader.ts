import { LessonContentSchema } from '@/schemas/content';
import type { LessonContent, LanguageCode, LevelCode } from '@/types';
import { withCircuitBreaker } from './circuitBreaker';

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
    const result = await withCircuitBreaker(
      `lesson-loader-${lang}-${level}-${leafId}`,
      async () => {
        // Usar fetch para cargar el JSON (más confiable que import dinámico con variables)
        let jsonPath: string;
        if (level === 'A0' || leafId.startsWith('a0-') || leafId.startsWith('nodo-0-')) {
          // ÁREA 0 - Base Absoluta
          jsonPath = `/content/${lang}/A0/base-absoluta/${leafId}.json`;
        } else {
          // Lecciones normales
          jsonPath = `/content/${lang}/${level}/lessons/${leafId}.json`;
        }


        const response = await fetch(jsonPath, {
          cache: 'no-store', // En desarrollo, siempre recargar
        });


        if (!response.ok) {
          throw new Error(`Failed to load lesson: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();

        // Validar con Zod
        const validatedLesson = LessonContentSchema.parse(rawData);

        // Guardar en cache
        lessonCache.set(cacheKey, validatedLesson);

        return validatedLesson;
      }
    );

    if (result.success && result.result) {
      return result.result;
    } else {
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
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

