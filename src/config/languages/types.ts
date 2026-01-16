/**
 * Language Configuration Types
 * Types for modular, multi-language POS tagging configuration
 */

import type { LanguageCode } from '@/schemas/posTagging';

// ============================================================
// LANGUAGE CONFIG INTERFACE
// ============================================================

/**
 * Complete linguistic pattern configuration for a language
 * Used by POS tagging service to identify parts of speech
 */
export interface LanguageConfig {
  // Language metadata
  code: LanguageCode;
  name: string;
  nativeName: string;

  // Verb patterns
  verbEndings: readonly string[];
  verbExceptions: Record<string, string>;
  auxiliaryVerbs: readonly string[];

  // Noun patterns
  nounIndicators: readonly string[];
  nounArticles: readonly string[];
  pronouns: Record<string, string>;

  // Adverb patterns
  adverbEndings: readonly string[];
  commonAdverbs: readonly string[];

  // Adjective patterns
  adjectiveEndings: {
    masculine: readonly string[];
    feminine: readonly string[];
    plural: readonly string[];
  };
  commonAdjectives: readonly string[];

  // Common words (stop words)
  stopWords: Set<string>;
  importantSubjects: Set<string>;

  // Text configuration
  textDirection: 'ltr' | 'rtl';
  characterSets: {
    uppercase: readonly string[];
    lowercase: readonly string[];
    accents: readonly string[];
  };
}

// ============================================================
// CONFIG VALIDATION
// ============================================================

/**
 * Validates that a language config has all required fields
 */
export function isValidLanguageConfig(config: unknown): config is LanguageConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;

  return (
    typeof c.code === 'string' &&
    typeof c.name === 'string' &&
    typeof c.nativeName === 'string' &&
    Array.isArray(c.verbEndings) &&
    typeof c.verbExceptions === 'object' &&
    Array.isArray(c.auxiliaryVerbs) &&
    Array.isArray(c.nounIndicators) &&
    Array.isArray(c.nounArticles) &&
    typeof c.pronouns === 'object' &&
    Array.isArray(c.adverbEndings) &&
    Array.isArray(c.commonAdverbs) &&
    typeof c.adjectiveEndings === 'object' &&
    Array.isArray((c.adjectiveEndings as Record<string, unknown>).masculine) &&
    Array.isArray((c.adjectiveEndings as Record<string, unknown>).feminine) &&
    Array.isArray((c.adjectiveEndings as Record<string, unknown>).plural) &&
    Array.isArray(c.commonAdjectives) &&
    c.stopWords instanceof Set &&
    c.importantSubjects instanceof Set &&
    typeof c.textDirection === 'string' &&
    typeof c.characterSets === 'object'
  );
}

// ============================================================
// CONFIG LOADER OPTIONS
// ============================================================

export interface LanguageConfigOptions {
  /**
   * Whether to throw an error if language is not supported
   * @default false
   */
  throwOnUnsupported?: boolean;

  /**
   * Fallback language to use if requested language is not available
   * @default 'en'
   */
  fallbackLanguage?: LanguageCode;
}

// ============================================================
// CONFIG CACHE
// ============================================================

interface ConfigCache {
  [key: string]: LanguageConfig;
}

let configCache: ConfigCache = Object.create(null);

/**
 * Gets a config from cache or returns null
 */
export function getCachedConfig(code: string): LanguageConfig | null {
  return configCache[code] ?? null;
}

/**
 * Adds a config to cache
 */
export function setCachedConfig(code: string, config: LanguageConfig): void {
  configCache[code] = config;
}

/**
 * Clears all cached configs (useful for testing)
 */
export function clearConfigCache(): void {
  configCache = Object.create(null);
}

/**
 * Gets all cached language codes
 */
export function getCachedLanguageCodes(): string[] {
  return Object.keys(configCache);
}
