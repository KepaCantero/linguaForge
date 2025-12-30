import { World, WorldSchema, LanguageCode, LevelCode } from '@/types';

// Cache para worlds cargados
const worldCache = new Map<string, World>();

// Función para generar clave de cache
function getCacheKey(lang: LanguageCode, level: LevelCode, worldId: string): string {
  return `${lang}-${level}-${worldId}`;
}

// Lista de mundos disponibles por idioma y nivel
const AVAILABLE_WORLDS: Record<string, Record<string, string[]>> = {
  fr: {
    A1: ['airbnb'],
    A2: ['restaurant'],
  },
  de: {
    A1: ['airbnb'],
  },
};

/**
 * Carga un mundo desde el sistema de archivos
 * En producción, esto debería cargar desde una API o CDN
 */
export async function loadWorld(
  lang: LanguageCode,
  level: LevelCode,
  worldId: string
): Promise<World> {
  const cacheKey = getCacheKey(lang, level, worldId);

  // Verificar cache
  if (worldCache.has(cacheKey)) {
    return worldCache.get(cacheKey)!;
  }

  try {
    // Importar dinámicamente el JSON
    const worldData = await import(`@/../content/${lang}/${level}/${worldId}.json`);

    // Validar con Zod
    const validatedWorld = WorldSchema.parse(worldData.default || worldData);

    // Guardar en cache
    worldCache.set(cacheKey, validatedWorld);

    return validatedWorld;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error loading world ${worldId}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Obtiene la lista de mundos disponibles para un idioma y nivel
 */
export function getAvailableWorlds(lang: LanguageCode, level: LevelCode): string[] {
  return AVAILABLE_WORLDS[lang]?.[level] ?? [];
}

/**
 * Verifica si un mundo existe
 */
export function worldExists(lang: LanguageCode, level: LevelCode, worldId: string): boolean {
  const worlds = getAvailableWorlds(lang, level);
  return worlds.includes(worldId);
}

/**
 * Obtiene todos los idiomas disponibles
 */
export function getAvailableLanguages(): LanguageCode[] {
  return Object.keys(AVAILABLE_WORLDS) as LanguageCode[];
}

/**
 * Obtiene todos los niveles disponibles para un idioma
 */
export function getAvailableLevels(lang: LanguageCode): LevelCode[] {
  const langWorlds = AVAILABLE_WORLDS[lang];
  if (!langWorlds) return [];
  return Object.keys(langWorlds) as LevelCode[];
}

/**
 * Precarga mundos en cache para mejor rendimiento
 */
export async function preloadWorlds(
  lang: LanguageCode,
  level: LevelCode
): Promise<void> {
  const worlds = getAvailableWorlds(lang, level);
  await Promise.all(worlds.map((worldId) => loadWorld(lang, level, worldId)));
}

/**
 * Limpia el cache de mundos
 */
export function clearWorldCache(): void {
  worldCache.clear();
}

/**
 * Obtiene estadísticas del cache
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: worldCache.size,
    keys: Array.from(worldCache.keys()),
  };
}
