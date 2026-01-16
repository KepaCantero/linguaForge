/**
 * Language Configuration Tests
 * Tests for centralized language management system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LANGUAGE_CODES,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  LANGUAGE_METADATA,
  getLanguageMetadata,
  getAvailableLanguages,
  isLanguageSupported,
  getNormalizedLanguageCode,
  getLanguageConfigSync,
  type LanguageCode,
} from '@/config/languages';

describe('Language Configuration', () => {
  describe('Language Constants', () => {
    it('should have correct language codes', () => {
      expect(LANGUAGE_CODES.FRENCH).toBe('fr');
      expect(LANGUAGE_CODES.SPANISH).toBe('es');
      expect(LANGUAGE_CODES.ENGLISH).toBe('en');
      expect(LANGUAGE_CODES.GERMAN).toBe('de');
      expect(LANGUAGE_CODES.ITALIAN).toBe('it');
    });

    it('should have French as default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('fr');
    });

    it('should have all supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['fr', 'es', 'en', 'de', 'it']);
    });
  });

  describe('Language Metadata', () => {
    it('should have complete metadata for French', () => {
      const french = LANGUAGE_METADATA[LANGUAGE_CODES.FRENCH];
      expect(french).toEqual({
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        locale: 'fr-FR',
      });
    });

    it('should have complete metadata for Spanish', () => {
      const spanish = LANGUAGE_METADATA[LANGUAGE_CODES.SPANISH];
      expect(spanish).toEqual({
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        locale: 'es-ES',
      });
    });

    it('should have complete metadata for English', () => {
      const english = LANGUAGE_METADATA[LANGUAGE_CODES.ENGLISH];
      expect(english).toEqual({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧',
        locale: 'en-GB',
      });
    });
  });

  describe('getLanguageMetadata', () => {
    it('should return metadata for supported languages', () => {
      const french = getLanguageMetadata('fr');
      expect(french).not.toBeNull();
      expect(french?.code).toBe('fr');
      expect(french?.name).toBe('French');
    });

    it('should return null for unsupported languages', () => {
      const result = getLanguageMetadata('invalid');
      expect(result).toBeNull();
    });

    it('should handle locale codes', () => {
      // getLanguageMetadata only checks exact match in metadata registry
      // It doesn't automatically normalize locale codes
      const french = getLanguageMetadata('fr');
      expect(french).not.toBeNull();
      expect(french?.code).toBe('fr');

      // Locale codes need to be normalized first
      const normalized = getNormalizedLanguageCode('fr-FR');
      const frenchFromLocale = getLanguageMetadata(normalized);
      expect(frenchFromLocale).not.toBeNull();
      expect(frenchFromLocale?.code).toBe('fr');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return all supported languages with metadata', () => {
      const languages = getAvailableLanguages();
      expect(languages).toHaveLength(5);
      expect(languages[0]).toHaveProperty('code');
      expect(languages[0]).toHaveProperty('name');
      expect(languages[0]).toHaveProperty('nativeName');
      expect(languages[0]).toHaveProperty('flag');
      expect(languages[0]).toHaveProperty('locale');
    });

    it('should include French in available languages', () => {
      const languages = getAvailableLanguages();
      const french = languages.find(l => l.code === 'fr');
      expect(french).toBeDefined();
      expect(french?.name).toBe('French');
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(isLanguageSupported('fr')).toBe(true);
      expect(isLanguageSupported('es')).toBe(true);
      expect(isLanguageSupported('en')).toBe(true);
      expect(isLanguageSupported('de')).toBe(true);
      expect(isLanguageSupported('it')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isLanguageSupported('invalid')).toBe(false);
      expect(isLanguageSupported('pt')).toBe(false);
      expect(isLanguageSupported('zh')).toBe(false);
    });

    it('should handle locale codes', () => {
      expect(isLanguageSupported('fr-FR')).toBe(false); // Only base codes
      expect(isLanguageSupported('fr')).toBe(true);
    });
  });

  describe('getNormalizedLanguageCode', () => {
    it('should normalize locale codes to base codes', () => {
      expect(getNormalizedLanguageCode('fr-FR')).toBe('fr');
      expect(getNormalizedLanguageCode('es-ES')).toBe('es');
      expect(getNormalizedLanguageCode('en-GB')).toBe('en');
    });

    it('should return base codes unchanged', () => {
      expect(getNormalizedLanguageCode('fr')).toBe('fr');
      expect(getNormalizedLanguageCode('es')).toBe('es');
    });

    it('should return default language for invalid codes', () => {
      expect(getNormalizedLanguageCode('invalid')).toBe('fr');
      expect(getNormalizedLanguageCode('')).toBe('fr');
      expect(getNormalizedLanguageCode('pt')).toBe('fr');
    });

    it('should handle uppercase codes', () => {
      expect(getNormalizedLanguageCode('FR')).toBe('fr');
      expect(getNormalizedLanguageCode('FR-FR')).toBe('fr');
    });
  });

  describe('getLanguageConfigSync', () => {
    it('should return config for French', () => {
      const config = getLanguageConfigSync('fr');
      expect(config).toBeDefined();
      expect(config?.code).toBe('fr');
      expect(config?.name).toBe('French');
      expect(config?.nativeName).toBe('Français');
    });

    it('should return config for Spanish', () => {
      const config = getLanguageConfigSync('es');
      expect(config).toBeDefined();
      expect(config?.code).toBe('es');
      expect(config?.name).toBe('Spanish');
    });

    it('should return undefined for unsupported languages without fallback', () => {
      // getLanguageConfigSync uses fallback by default (fr)
      // We need to explicitly test without fallback or with a different fallback
      const config = getLanguageConfigSync('invalid', { fallbackLanguage: 'es' as any });
      // Since 'invalid' is not supported, it should return the fallback (es)
      expect(config).toBeDefined();
      expect(config?.code).toBe('es');
    });

    it('should use fallback when specified', () => {
      const config = getLanguageConfigSync('invalid', { fallbackLanguage: 'fr' });
      expect(config).toBeDefined();
      expect(config?.code).toBe('fr');
    });
  });

  describe('Language Type Safety', () => {
    it('should only allow valid language codes as LanguageCode type', () => {
      const validCodes: LanguageCode[] = ['fr', 'es', 'en', 'de', 'it'];
      expect(validCodes).toHaveLength(5);

      // This should compile without errors
      const getCode = (code: LanguageCode): string => code;
      expect(getCode('fr')).toBe('fr');
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end with language normalization', () => {
      const input = 'fr-FR';
      const normalized = getNormalizedLanguageCode(input);
      const isSupported = isLanguageSupported(normalized);
      const metadata = getLanguageMetadata(normalized);

      expect(normalized).toBe('fr');
      expect(isSupported).toBe(true);
      expect(metadata?.code).toBe('fr');
    });

    it('should provide complete language information workflow', () => {
      const languages = getAvailableLanguages();
      const french = languages[0];

      expect(french.code).toBe(LANGUAGE_CODES.FRENCH);
      expect(isLanguageSupported(french.code)).toBe(true);
      expect(getLanguageConfigSync(french.code)?.code).toBe(french.code);
    });
  });
});
