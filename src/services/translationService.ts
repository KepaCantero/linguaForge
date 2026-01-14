/**
 * Servicio de traducción automática con cache y rate limiting
 * Usa la API de Google Translate o alternativa con cache en localStorage
 */

import { SUPPORTED_LANGUAGES, UI_LANGUAGES } from '@/lib/constants';

// Tipos para idiomas de traducción
export type SourceLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type TargetUILanguage = (typeof UI_LANGUAGES)[number];

// Constantes para traducción por defecto (francés → español)
const DEFAULT_SOURCE_LANG: SourceLanguage = SUPPORTED_LANGUAGES[2]; // 'fr'
const DEFAULT_TARGET_LANG: TargetUILanguage = UI_LANGUAGES[0]; // 'es'

// ============================================================
// CACHE DE TRADUCCIONES
// ============================================================

const CACHE_KEY = 'linguaforge-translation-cache';
const CACHE_MAX_SIZE = 5000; // Máximo de traducciones en cache
const CACHE_VERSION = 1;

interface TranslationCache {
  version: number;
  entries: Record<string, { translation: string; timestamp: number }>;
}

/**
 * Obtiene la cache de traducciones de localStorage
 */
function getCache(): TranslationCache {
  if (typeof window === 'undefined') {
    return { version: CACHE_VERSION, entries: {} };
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as TranslationCache;
      if (parsed.version === CACHE_VERSION) {
        return parsed;
      }
    }
  } catch {
    // Cache corrupta, crear nueva
  }

  return { version: CACHE_VERSION, entries: {} };
}

/**
 * Guarda la cache en localStorage
 */
function saveCache(cache: TranslationCache): void {
  if (typeof window === 'undefined') return;

  try {
    // Limpiar entradas antiguas si excede el tamaño máximo
    const entries = Object.entries(cache.entries);
    if (entries.length > CACHE_MAX_SIZE) {
      // Ordenar por timestamp y mantener solo las más recientes
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cache.entries = Object.fromEntries(entries.slice(0, CACHE_MAX_SIZE));
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage lleno o no disponible - cache save failed silently
  }
}

/**
 * Obtiene traducción de la cache
 */
function getCachedTranslation(text: string): string | null {
  const cache = getCache();
  const key = text.toLowerCase().trim();
  const entry = cache.entries[key];
  return entry ? entry.translation : null;
}

/**
 * Guarda traducción en la cache
 */
function cacheTranslation(text: string, translation: string): void {
  const cache = getCache();
  const key = text.toLowerCase().trim();
  cache.entries[key] = { translation, timestamp: Date.now() };
  saveCache(cache);
}

/**
 * Estadísticas de la cache
 */
export function getCacheStats(): { size: number; maxSize: number } {
  const cache = getCache();
  return {
    size: Object.keys(cache.entries).length,
    maxSize: CACHE_MAX_SIZE,
  };
}

/**
 * Limpia la cache de traducciones
 */
export function clearTranslationCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
}

/**
 * Traduce texto usando idiomas explícitos
 * Función genérica para traducir entre cualquier par de idiomas
 */
export async function translate(
  text: string,
  sourceLang: SourceLanguage = DEFAULT_SOURCE_LANG,
  targetLang: TargetUILanguage = DEFAULT_TARGET_LANG
): Promise<string> {
  // Verificar cache primero
  const cacheKey = `${sourceLang}-${targetLang}:${text}`;
  const cached = getCachedTranslation(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Usar la API route de Next.js para evitar problemas de CORS
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const translation = data.translatedText || text;

    // Guardar en cache con key que incluye idiomas
    cacheTranslation(cacheKey, translation);

    return translation;
  } catch {
    // TODO: Add proper logging service for translation errors
    // Fallback: retornar el texto original si falla la traducción
    return text;
  }
}

/**
 * Traduce múltiples palabras en paralelo con cache
 */
export async function translateWords(words: string[]): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};
  const wordsToTranslate: string[] = [];

  // Primero verificar qué palabras ya están en cache
  for (const word of words) {
    const cached = getCachedTranslation(word);
    if (cached) {
      translations[word] = cached;
    } else {
      wordsToTranslate.push(word);
    }
  }

  // Si todas están en cache, retornar inmediatamente
  if (wordsToTranslate.length === 0) {
    return translations;
  }

  // Traducir las palabras que faltan en lotes
  const batchSize = 10;
  for (let i = 0; i < wordsToTranslate.length; i += batchSize) {
    const batch = wordsToTranslate.slice(i, i + batchSize);
    const promises = batch.map(async (word) => {
      const translation = await translate(word, DEFAULT_SOURCE_LANG, DEFAULT_TARGET_LANG);
      return { word, translation };
    });

    const results = await Promise.all(promises);
    results.forEach(({ word, translation }) => {
      translations[word] = translation;
    });

    // Pequeña pausa entre lotes para evitar rate limiting
    if (i + batchSize < wordsToTranslate.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return translations;
}

/**
 * Pre-carga traducciones comunes en la cache
 */
export async function preloadCommonTranslations(): Promise<void> {
  const commonWords = [
    'bonjour', 'merci', 'oui', 'non', 'je', 'tu', 'il', 'elle',
    'nous', 'vous', 'ils', 'elles', 'être', 'avoir', 'faire', 'aller',
    'voir', 'vouloir', 'pouvoir', 'devoir', 'savoir', 'venir', 'dire',
    'prendre', 'parler', 'aimer', 'manger', 'boire', 'dormir', 'travailler',
  ];

  // Solo traducir las que no están en cache
  const uncached = commonWords.filter((w) => !getCachedTranslation(w));
  if (uncached.length > 0) {
    await translateWords(uncached);
  }
}

