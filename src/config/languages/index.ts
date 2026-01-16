/**
 * Language Configuration System
 * Dynamic loader and registry for multi-language POS tagging configurations
 *
 * Centralized language management - NO HARDCODED LANGUAGE STRINGS
 */

import type { LanguageConfig, LanguageConfigOptions } from './types';
import { frenchConfig } from './fr';
import { spanishConfig } from './es';
import {
  getCachedConfig,
  setCachedConfig,
  isValidLanguageConfig,
} from './types';

// ============================================================
// LANGUAGE CODES - Use these constants instead of hardcoded strings
// ============================================================

/**
 * Supported language codes
 * Use these constants instead of hardcoded strings like 'fr', 'es', 'en'
 */
export const LANGUAGE_CODES = {
  FRENCH: 'fr',
  SPANISH: 'es',
  ENGLISH: 'en',
  GERMAN: 'de',
  ITALIAN: 'it',
} as const;

/**
 * Type for language codes
 */
export type LanguageCode = typeof LANGUAGE_CODES[keyof typeof LANGUAGE_CODES];

/**
 * Default language for the application
 */
export const DEFAULT_LANGUAGE = LANGUAGE_CODES.FRENCH;

/**
 * All supported languages array
 */
export const SUPPORTED_LANGUAGES = [
  LANGUAGE_CODES.FRENCH,
  LANGUAGE_CODES.SPANISH,
  LANGUAGE_CODES.ENGLISH,
  LANGUAGE_CODES.GERMAN,
  LANGUAGE_CODES.ITALIAN,
] as const;

// ============================================================
// LANGUAGE METADATA
// ============================================================

/**
 * Language metadata for UI display
 */
export interface LanguageMetadata {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
  locale?: string;
}

/**
 * Language metadata registry
 */
export const LANGUAGE_METADATA: Record<LanguageCode, LanguageMetadata> = {
  [LANGUAGE_CODES.FRENCH]: {
    code: LANGUAGE_CODES.FRENCH,
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    locale: 'fr-FR',
  },
  [LANGUAGE_CODES.SPANISH]: {
    code: LANGUAGE_CODES.SPANISH,
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    locale: 'es-ES',
  },
  [LANGUAGE_CODES.ENGLISH]: {
    code: LANGUAGE_CODES.ENGLISH,
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    locale: 'en-GB',
  },
  [LANGUAGE_CODES.GERMAN]: {
    code: LANGUAGE_CODES.GERMAN,
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    locale: 'de-DE',
  },
  [LANGUAGE_CODES.ITALIAN]: {
    code: LANGUAGE_CODES.ITALIAN,
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    locale: 'it-IT',
  },
};

// ============================================================
// LANGUAGE REGISTRY
// ============================================================

/**
 * Built-in language configurations
 * Add new languages here to make them available
 */
const BUILTIN_LANGUAGES: Record<string, () => Promise<LanguageConfig>> = {
  [LANGUAGE_CODES.FRENCH]: async () => {
    const { frenchConfig: config } = await import('./fr');
    return config;
  },
  [LANGUAGE_CODES.SPANISH]: async () => {
    const { spanishConfig: config } = await import('./es');
    return config;
  },
};

/**
 * Synchronously available configs (for critical paths)
 */
const SYNC_LANGUAGES: Record<string, LanguageConfig> = {
  [LANGUAGE_CODES.FRENCH]: frenchConfig,
  [LANGUAGE_CODES.SPANISH]: spanishConfig,
};

// ============================================================
// ERROR TYPES
// ============================================================

export class LanguageConfigError extends Error {
  constructor(
    message: string,
    public code: string,
    public language?: string
  ) {
    super(message);
    this.name = 'LanguageConfigError';
  }
}

// ============================================================
// CONFIG LOADER
// ============================================================

/**
 * Gets a language configuration by code
 *
 * @param code - Language code (use LANGUAGE_CODES constant)
 * @param options - Loader options
 * @returns Language configuration
 * @throws LanguageConfigError if language not supported and throwOnUnsupported is true
 *
 * @example
 * ```ts
 * import { LANGUAGE_CODES, getLanguageConfig } from '@/config/languages';
 * const config = getLanguageConfig(LANGUAGE_CODES.FRENCH);
 * const configWithFallback = getLanguageConfig(LANGUAGE_CODES.GERMAN, { fallbackLanguage: LANGUAGE_CODES.FRENCH });
 * ```
 */
export async function getLanguageConfig(
  code: string,
  options: LanguageConfigOptions = {}
): Promise<LanguageConfig> {
  const {
    throwOnUnsupported = false,
    fallbackLanguage = DEFAULT_LANGUAGE,
  } = options;

  // Check cache first
  const cached = getCachedConfig(code);
  if (cached) {
    return cached;
  }

  // Try to load synchronously for built-in languages
  if (code in SYNC_LANGUAGES) {
    const config = SYNC_LANGUAGES[code];
    setCachedConfig(code, config);
    return config;
  }

  // Try dynamic import for registered languages
  if (code in BUILTIN_LANGUAGES) {
    try {
      const configLoader = BUILTIN_LANGUAGES[code];
      const config = await configLoader();

      if (!isValidLanguageConfig(config)) {
        throw new LanguageConfigError(
          `Invalid configuration for language '${code}'`,
          'INVALID_CONFIG',
          code
        );
      }

      setCachedConfig(code, config);
      return config;
    } catch (error) {
      if (error instanceof LanguageConfigError) {
        throw error;
      }
      throw new LanguageConfigError(
        `Failed to load configuration for language '${code}'`,
        'LOAD_FAILED',
        code
      );
    }
  }

  // Language not supported
  if (throwOnUnsupported) {
    throw new LanguageConfigError(
      `Language '${code}' is not supported`,
      'UNSUPPORTED_LANGUAGE',
      code
    );
  }

  // Try fallback
  if (fallbackLanguage !== code) {
    // eslint-disable-next-line no-console
    console.warn(
      `Language '${code}' not supported, falling back to '${fallbackLanguage}'`
    );
    return getLanguageConfig(fallbackLanguage, options);
  }

  // No fallback available, return default language as last resort
  // eslint-disable-next-line no-console
  console.warn(
    `Language '${code}' not supported and no fallback available, using default language config`
  );
  return SYNC_LANGUAGES[DEFAULT_LANGUAGE];
}

/**
 * Synchronous version of getLanguageConfig for critical paths
 * Only works with pre-loaded configs
 *
 * @param code - Language code (use LANGUAGE_CODES constant)
 * @param options - Loader options
 * @returns Language configuration or undefined if not available
 *
 * @example
 * ```ts
 * import { LANGUAGE_CODES, getLanguageConfigSync } from '@/config/languages';
 * const config = getLanguageConfigSync(LANGUAGE_CODES.FRENCH);
 * ```
 */
export function getLanguageConfigSync(
  code: string,
  options: LanguageConfigOptions = {}
): LanguageConfig | undefined {
  const { fallbackLanguage = DEFAULT_LANGUAGE } = options;

  // Check cache
  const cached = getCachedConfig(code);
  if (cached) {
    return cached;
  }

  // Check sync configs
  if (code in SYNC_LANGUAGES) {
    const config = SYNC_LANGUAGES[code];
    setCachedConfig(code, config);
    return config;
  }

  // Try fallback
  if (fallbackLanguage !== code && fallbackLanguage in SYNC_LANGUAGES) {
    return SYNC_LANGUAGES[fallbackLanguage];
  }

  return undefined;
}

/**
 * Gets all supported language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(BUILTIN_LANGUAGES);
}

/**
 * Checks if a language is supported
 *
 * @param code - Language code (use LANGUAGE_CODES constant)
 * @returns true if language is supported
 *
 * @example
 * ```ts
 * import { LANGUAGE_CODES, isLanguageSupported } from '@/config/languages';
 * if (isLanguageSupported(LANGUAGE_CODES.FRENCH)) { ... }
 * ```
 */
export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.includes(code as LanguageCode);
}

/**
 * Registers a custom language configuration
 * Useful for testing or extending with user-provided configs
 *
 * @param code - Language code (use LANGUAGE_CODES constant)
 * @param config - Language configuration
 *
 * @example
 * ```ts
 * import { LANGUAGE_CODES, registerLanguageConfig } from '@/config/languages';
 * registerLanguageConfig(LANGUAGE_CODES.GERMAN, germanConfig);
 * ```
 */
export function registerLanguageConfig(
  code: string,
  config: LanguageConfig
): void {
  if (!isValidLanguageConfig(config)) {
    throw new LanguageConfigError(
      `Invalid configuration for language '${code}'`,
      'INVALID_CONFIG',
      code
    );
  }

  setCachedConfig(code, config);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Gets language metadata for UI display
 *
 * @param code - Language code (use LANGUAGE_CODES constant)
 * @returns Language metadata or null if not found
 *
 * @example
 * ```ts
 * import { LANGUAGE_CODES, getLanguageMetadata } from '@/config/languages';
 * const metadata = getLanguageMetadata(LANGUAGE_CODES.FRENCH);
 * // { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' }
 * ```
 */
export function getLanguageMetadata(code: string): LanguageMetadata | null {
  // Check metadata registry first
  if (code in LANGUAGE_METADATA) {
    return LANGUAGE_METADATA[code as LanguageCode];
  }

  // Check cache
  const cached = getCachedConfig(code);
  if (cached) {
    return {
      code: cached.code,
      name: cached.name,
      nativeName: cached.nativeName,
    };
  }

  // Check sync configs (only for truly supported languages, no fallback)
  if (code in SYNC_LANGUAGES) {
    const config = SYNC_LANGUAGES[code];
    return {
      code: config.code,
      name: config.name,
      nativeName: config.nativeName,
    };
  }

  return null;
}

/**
 * Gets all available languages for UI selection
 *
 * @returns Array of available language metadata
 *
 * @example
 * ```ts
 * import { getAvailableLanguages } from '@/config/languages';
 * const languages = getAvailableLanguages();
 * // [
 * //   { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
 * //   { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES' },
 * //   ...
 * // ]
 * ```
 */
export function getAvailableLanguages(): LanguageMetadata[] {
  return SUPPORTED_LANGUAGES.map(code => LANGUAGE_METADATA[code]);
}

/**
 * Gets language code from various possible formats
 * Normalizes locale codes (e.g., 'fr-FR' -> 'fr')
 *
 * @param codeOrLocale - Language code or locale string
 * @returns Normalized language code or default language
 *
 * @example
 * ```ts
 * import { getNormalizedLanguageCode } from '@/config/languages';
 * getNormalizedLanguageCode('fr-FR'); // 'fr'
 * getNormalizedLanguageCode('fr'); // 'fr'
 * getNormalizedLanguageCode('invalid'); // 'fr' (default)
 * ```
 */
export function getNormalizedLanguageCode(codeOrLocale: string): LanguageCode {
  if (!codeOrLocale) {
    return DEFAULT_LANGUAGE;
  }

  // Extract language code from locale (e.g., 'fr-FR' -> 'fr')
  const languageCode = codeOrLocale.split('-')[0].toLowerCase();

  // Check if it's a supported language
  if (isLanguageSupported(languageCode)) {
    return languageCode as LanguageCode;
  }

  // Return default if not supported
  return DEFAULT_LANGUAGE;
}

// ============================================================
// RE-EXPORTS
// ============================================================

export type { LanguageConfig, LanguageConfigOptions } from './types';
export { frenchConfig } from './fr';
export { spanishConfig } from './es';
export {
  isValidLanguageConfig,
  getCachedConfig,
  setCachedConfig,
  clearConfigCache,
  getCachedLanguageCodes,
} from './types';
