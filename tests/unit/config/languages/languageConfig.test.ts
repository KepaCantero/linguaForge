/**
 * Tests for Language Configuration System
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import {
  frenchConfig,
  spanishConfig,
  getLanguageConfig,
  getLanguageConfigSync,
  getSupportedLanguages,
  isLanguageSupported,
  registerLanguageConfig,
  getLanguageMetadata,
  getAvailableLanguages,
  clearConfigCache,
  getCachedConfig,
  setCachedConfig,
  getCachedLanguageCodes,
  isValidLanguageConfig,
  type LanguageConfig,
} from '@/config/languages';

// ============================================================
// SETUP & TEARDOWN
// ============================================================

beforeEach(() => {
  clearConfigCache();
});

afterEach(() => {
  clearConfigCache();
});

// ============================================================
// FRENCH CONFIG TESTS
// ============================================================

describe('French Language Config', () => {
  it('should have correct metadata', () => {
    expect(frenchConfig.code).toBe('fr');
    expect(frenchConfig.name).toBe('French');
    expect(frenchConfig.nativeName).toBe('Français');
  });

  it('should have verb endings', () => {
    expect(frenchConfig.verbEndings).toContain('er');
    expect(frenchConfig.verbEndings).toContain('ir');
    expect(frenchConfig.verbEndings).toContain('re');
    expect(frenchConfig.verbEndings).toContain('ons');
    expect(frenchConfig.verbEndings).toContain('ez');
  });

  it('should have verb exceptions', () => {
    expect(frenchConfig.verbExceptions['mer']).toBe('noun');
    expect(frenchConfig.verbExceptions['cafe']).toBe('noun');
  });

  it('should have auxiliary verbs', () => {
    expect(frenchConfig.auxiliaryVerbs).toContain('suis');
    expect(frenchConfig.auxiliaryVerbs).toContain('ai');
    expect(frenchConfig.auxiliaryVerbs).toContain('vais');
  });

  it('should have noun indicators', () => {
    expect(frenchConfig.nounIndicators).toContain('le ');
    expect(frenchConfig.nounIndicators).toContain('la ');
    expect(frenchConfig.nounIndicators).toContain('un ');
  });

  it('should have noun articles', () => {
    expect(frenchConfig.nounArticles).toContain('le');
    expect(frenchConfig.nounArticles).toContain('la');
    expect(frenchConfig.nounArticles).toContain('un');
  });

  it('should have pronouns', () => {
    expect(frenchConfig.pronouns['je']).toBe('I');
    expect(frenchConfig.pronouns['tu']).toBe('you');
    expect(frenchConfig.pronouns['nous']).toBe('we');
  });

  it('should have adverb endings', () => {
    expect(frenchConfig.adverbEndings).toContain('ment');
    expect(frenchConfig.adverbEndings).toContain('emment');
  });

  it('should have common adverbs', () => {
    expect(frenchConfig.commonAdverbs).toContain('bien');
    expect(frenchConfig.commonAdverbs).toContain('mal');
    expect(frenchConfig.commonAdverbs).toContain('très');
  });

  it('should have adjective endings', () => {
    expect(frenchConfig.adjectiveEndings.masculine).toContain('eux');
    expect(frenchConfig.adjectiveEndings.masculine).toContain('if');
    expect(frenchConfig.adjectiveEndings.feminine).toContain('euse');
    expect(frenchConfig.adjectiveEndings.feminine).toContain('ive');
  });

  it('should have common adjectives', () => {
    expect(frenchConfig.commonAdjectives).toContain('grand');
    expect(frenchConfig.commonAdjectives).toContain('petit');
    expect(frenchConfig.commonAdjectives).toContain('bon');
  });

  it('should have stop words', () => {
    expect(frenchConfig.stopWords.has('le')).toBe(true);
    expect(frenchConfig.stopWords.has('la')).toBe(true);
    expect(frenchConfig.stopWords.has('de')).toBe(true);
  });

  it('should have important subjects', () => {
    expect(frenchConfig.importantSubjects.has('je')).toBe(true);
    expect(frenchConfig.importantSubjects.has('tu')).toBe(true);
    expect(frenchConfig.importantSubjects.has('il')).toBe(true);
  });

  it('should have text direction LTR', () => {
    expect(frenchConfig.textDirection).toBe('ltr');
  });

  it('should have character sets', () => {
    expect(frenchConfig.characterSets.uppercase).toContain('A');
    expect(frenchConfig.characterSets.uppercase).toContain('É');
    expect(frenchConfig.characterSets.lowercase).toContain('a');
    expect(frenchConfig.characterSets.lowercase).toContain('é');
    expect(frenchConfig.characterSets.accents).toContain('é');
    expect(frenchConfig.characterSets.accents).toContain('è');
  });
});

// ============================================================
// SPANISH CONFIG TESTS
// ============================================================

describe('Spanish Language Config', () => {
  it('should have correct metadata', () => {
    expect(spanishConfig.code).toBe('es');
    expect(spanishConfig.name).toBe('Spanish');
    expect(spanishConfig.nativeName).toBe('Español');
  });

  it('should have verb endings', () => {
    expect(spanishConfig.verbEndings).toContain('ar');
    expect(spanishConfig.verbEndings).toContain('er');
    expect(spanishConfig.verbEndings).toContain('ir');
    expect(spanishConfig.verbEndings).toContain('ado');
  });

  it('should have auxiliary verbs', () => {
    expect(spanishConfig.auxiliaryVerbs).toContain('soy');
    expect(spanishConfig.auxiliaryVerbs).toContain('estoy');
    expect(spanishConfig.auxiliaryVerbs).toContain('he');
  });

  it('should have noun indicators', () => {
    expect(spanishConfig.nounIndicators).toContain('el ');
    expect(spanishConfig.nounIndicators).toContain('la ');
    expect(spanishConfig.nounIndicators).toContain('un ');
  });

  it('should have adverb endings', () => {
    expect(spanishConfig.adverbEndings).toContain('mente');
  });

  it('should have common adverbs', () => {
    expect(spanishConfig.commonAdverbs).toContain('muy');
    expect(spanishConfig.commonAdverbs).toContain('bien');
    expect(spanishConfig.commonAdverbs).toContain('mal');
  });

  it('should have stop words', () => {
    expect(spanishConfig.stopWords.has('el')).toBe(true);
    expect(spanishConfig.stopWords.has('la')).toBe(true);
    expect(spanishConfig.stopWords.has('de')).toBe(true);
  });

  it('should have important subjects', () => {
    expect(spanishConfig.importantSubjects.has('yo')).toBe(true);
    expect(spanishConfig.importantSubjects.has('tú')).toBe(true);
    expect(spanishConfig.importantSubjects.has('él')).toBe(true);
  });
});

// ============================================================
// CONFIG VALIDATION TESTS
// ============================================================

describe('Config Validation', () => {
  it('should validate French config', () => {
    expect(isValidLanguageConfig(frenchConfig)).toBe(true);
  });

  it('should validate Spanish config', () => {
    expect(isValidLanguageConfig(spanishConfig)).toBe(true);
  });

  it('should reject invalid config', () => {
    const invalidConfig = { code: 'xx' } as unknown;
    expect(isValidLanguageConfig(invalidConfig)).toBe(false);
  });

  it('should reject config without required fields', () => {
    const partialConfig = {
      code: 'xx',
      name: 'Test',
    } as unknown;
    expect(isValidLanguageConfig(partialConfig)).toBe(false);
  });
});

// ============================================================
// CONFIG LOADER TESTS
// ============================================================

describe('Config Loader', () => {
  it('should load French config synchronously', () => {
    const config = getLanguageConfigSync('fr');
    expect(config).toBeDefined();
    expect(config?.code).toBe('fr');
  });

  it('should load Spanish config synchronously', () => {
    const config = getLanguageConfigSync('es');
    expect(config).toBeDefined();
    expect(config?.code).toBe('es');
  });

  it('should return fallback config for unsupported language', () => {
    const config = getLanguageConfigSync('de');
    // Default fallback is French
    expect(config).toBeDefined();
    expect(config?.code).toBe('fr');
  });

  it('should use fallback language when specified', () => {
    const config = getLanguageConfigSync('de', { fallbackLanguage: 'fr' });
    expect(config).toBeDefined();
    expect(config?.code).toBe('fr');
  });

  it('should load French config asynchronously', async () => {
    const config = await getLanguageConfig('fr');
    expect(config).toBeDefined();
    expect(config.code).toBe('fr');
  });

  it('should load Spanish config asynchronously', async () => {
    const config = await getLanguageConfig('es');
    expect(config).toBeDefined();
    expect(config.code).toBe('es');
  });

  it('should fallback to French for unsupported language', async () => {
    const config = await getLanguageConfig('de');
    expect(config).toBeDefined();
    // Falls back to French as last resort
    expect(config.code).toBe('fr');
  });

  it('should throw error when throwOnUnsupported is true', async () => {
    await expect(getLanguageConfig('de', { throwOnUnsupported: true }))
      .rejects.toThrow();
  });
});

// ============================================================
// SUPPORTED LANGUAGES TESTS
// ============================================================

describe('Supported Languages', () => {
  it('should return all supported languages', () => {
    const languages = getSupportedLanguages();
    expect(languages).toContain('fr');
    expect(languages).toContain('es');
  });

  it('should check if language is supported', () => {
    expect(isLanguageSupported('fr')).toBe(true);
    expect(isLanguageSupported('es')).toBe(true);
    expect(isLanguageSupported('de')).toBe(false);
    expect(isLanguageSupported('it')).toBe(false);
  });
});

// ============================================================
// CACHE TESTS
// ============================================================

describe('Config Cache', () => {
  it('should cache configs after loading', () => {
    const config1 = getLanguageConfigSync('fr');
    const config2 = getLanguageConfigSync('fr');

    expect(config1).toBe(config2); // Same reference
  });

  it('should manually set cached config', () => {
    const customConfig: LanguageConfig = {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      verbEndings: ['er'],
      verbExceptions: {},
      auxiliaryVerbs: ['être'],
      nounIndicators: ['le '],
      nounArticles: ['le'],
      pronouns: {},
      adverbEndings: ['ment'],
      commonAdverbs: ['bien'],
      adjectiveEndings: {
        masculine: ['eux'],
        feminine: ['euse'],
        plural: ['eux'],
      },
      commonAdjectives: ['grand'],
      stopWords: new Set(['le']),
      importantSubjects: new Set(['je']),
      textDirection: 'ltr',
      characterSets: {
        uppercase: ['A'],
        lowercase: ['a'],
        accents: ['é'],
      },
    };

    setCachedConfig('fr', customConfig);
    const cached = getCachedConfig('fr');

    expect(cached).toBe(customConfig);
  });

  it('should get all cached language codes', () => {
    getLanguageConfigSync('fr');
    getLanguageConfigSync('es');

    const codes = getCachedLanguageCodes();
    expect(codes).toContain('fr');
    expect(codes).toContain('es');
  });

  it('should clear cache', () => {
    getLanguageConfigSync('fr');
    clearConfigCache();

    const cached = getCachedConfig('fr');
    expect(cached).toBeNull();
  });
});

// ============================================================
// CUSTOM CONFIG REGISTRATION TESTS
// ============================================================

describe('Custom Config Registration', () => {
  it('should register custom language config', () => {
    const germanConfig: LanguageConfig = {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      verbEndings: ['en'],
      verbExceptions: {},
      auxiliaryVerbs: ['sein'],
      nounIndicators: ['der '],
      nounArticles: ['der'],
      pronouns: {},
      adverbEndings: ['lich'],
      commonAdverbs: ['gut'],
      adjectiveEndings: {
        masculine: ['er'],
        feminine: ['e'],
        plural: ['e'],
      },
      commonAdjectives: ['gut'],
      stopWords: new Set(['der']),
      importantSubjects: new Set(['ich']),
      textDirection: 'ltr',
      characterSets: {
        uppercase: ['A'],
        lowercase: ['a'],
        accents: ['ä'],
      },
    };

    registerLanguageConfig('de', germanConfig);

    const config = getLanguageConfigSync('de');
    expect(config).toBeDefined();
    expect(config?.code).toBe('de');
  });

  it('should reject invalid custom config', () => {
    const invalidConfig = { code: 'xx' } as unknown;

    expect(() => {
      registerLanguageConfig('xx', invalidConfig as LanguageConfig);
    }).toThrow();
  });
});

// ============================================================
// METADATA TESTS
// ============================================================

describe('Language Metadata', () => {
  it('should get French metadata', () => {
    const metadata = getLanguageMetadata('fr');

    expect(metadata).toEqual({
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    });
  });

  it('should get Spanish metadata', () => {
    const metadata = getLanguageMetadata('es');

    expect(metadata).toEqual({
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
    });
  });

  it('should return null for unsupported language', () => {
    const metadata = getLanguageMetadata('it');
    expect(metadata).toBeNull();
  });

  it('should get all available languages', () => {
    const languages = getAvailableLanguages();

    expect(languages).toHaveLength(2);
    expect(languages).toContainEqual({
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    });
    expect(languages).toContainEqual({
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
    });
  });
});
