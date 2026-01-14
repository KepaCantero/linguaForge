/**
 * Tests para languageConfig - Configuración de idiomas
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getLanguageConfig,
  LANGUAGE_CONFIGS,
  type LanguageConfig,
  type ConjugationConfig,
  type JanusConfig,
} from '@/lib/languageConfig';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

describe('languageConfig', () => {
  // Capturar console.warn para los tests
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    originalWarn = console.warn;
    console.warn = () => {}; // Silenciar warnings
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  describe('getLanguageConfig', () => {
    it('debería devolver configuración para cada idioma soportado', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        expect(config).toBeDefined();
      }
    });

    it('debería devolver configuración por defecto para idioma no soportado', () => {
      // La función devuelve alemán por defecto con un warning
      const config = getLanguageConfig('xx');
      expect(config).toBeDefined();
      // Debería ser la configuración de alemán (fallback)
      expect(config.voice.ttsLang).toBe('de-DE');
    });

    it('debería tener configuración de voz para alemán', () => {
      const config = getLanguageConfig('de');

      expect(config.voice).toBeDefined();
      expect(config.voice.ttsLang).toBe('de-DE');
      expect(config.voice.rate).toBe(0.85);
    });

    it('debería tener configuración de voz para inglés', () => {
      const config = getLanguageConfig('en');

      expect(config.voice).toBeDefined();
      expect(config.voice.ttsLang).toBe('en-US');
    });

    it('debería tener configuración de voz para español', () => {
      const config = getLanguageConfig('es');

      expect(config.voice).toBeDefined();
      expect(config.voice.ttsLang).toBe('es-ES');
    });

    it('debería tener configuración de voz para francés', () => {
      const config = getLanguageConfig('fr');

      expect(config.voice).toBeDefined();
      expect(config.voice.ttsLang).toBe('fr-FR');
    });

    it('debería tener configuración de voz para italiano', () => {
      const config = getLanguageConfig('it');

      expect(config.voice).toBeDefined();
      expect(config.voice.ttsLang).toBe('it-IT');
    });
  });

  describe('conjugation config', () => {
    const verifyConjugationConfig = (config: LanguageConfig) => {
      const { conjugation } = config;

      // Verificar estructura de conjugación
      expect(conjugation).toBeDefined();
      expect(conjugation.auxiliaryVerbs).toBeDefined();
      expect(conjugation.auxiliaryVerbs.toBe).toBeDefined();
      expect(conjugation.auxiliaryVerbs.toHave).toBeDefined();
      expect(conjugation.verbGroups).toBeDefined();
      expect(conjugation.verbGroups.firstGroup).toBeDefined();
      expect(conjugation.pronouns).toBeDefined();
      expect(conjugation.pronouns.firstPerson).toBeDefined();
      expect(conjugation.pronouns.secondPerson).toBeDefined();
      expect(conjugation.pronouns.thirdPerson).toBeDefined();
    };

    it('debería tener conjugación válida para alemán', () => {
      const config = getLanguageConfig('de');
      verifyConjugationConfig(config);

      // Verificar conjugaciones específicas de alemán
      expect(config.conjugation.auxiliaryVerbs.toBe['ich']).toBe('bin');
      expect(config.conjugation.auxiliaryVerbs.toBe['du']).toBe('bist');
      expect(config.conjugation.auxiliaryVerbs.toBe['er']).toBe('ist');
      expect(config.conjugation.auxiliaryVerbs.toHave['ich']).toBe('habe');
      expect(config.conjugation.auxiliaryVerbs.toHave['du']).toBe('hast');
    });

    it('debería tener conjugación válida para inglés', () => {
      const config = getLanguageConfig('en');
      verifyConjugationConfig(config);

      // En inglés los pronombres están en minúsculas
      expect(config.conjugation.auxiliaryVerbs.toBe['i']).toBe('am');
      expect(config.conjugation.auxiliaryVerbs.toBe['you']).toBe('are');
      expect(config.conjugation.auxiliaryVerbs.toBe['he']).toBe('is');
      expect(config.conjugation.auxiliaryVerbs.toHave['i']).toBe('have');
      expect(config.conjugation.auxiliaryVerbs.toHave['he']).toBe('has');
    });

    it('debería tener conjugación válida para español', () => {
      const config = getLanguageConfig('es');
      verifyConjugationConfig(config);

      expect(config.conjugation.auxiliaryVerbs.toBe['yo']).toBe('soy');
      expect(config.conjugation.auxiliaryVerbs.toBe['tú']).toBe('eres');
      expect(config.conjugation.auxiliaryVerbs.toHave['yo']).toBe('he');
      expect(config.conjugation.auxiliaryVerbs.toHave['tú']).toBe('has');
    });

    it('debería tener conjugación válida para francés', () => {
      const config = getLanguageConfig('fr');
      verifyConjugationConfig(config);

      expect(config.conjugation.auxiliaryVerbs.toBe['je']).toBe('suis');
      expect(config.conjugation.auxiliaryVerbs.toBe['tu']).toBe('es');
      expect(config.conjugation.auxiliaryVerbs.toHave['je']).toBe('ai');
      expect(config.conjugation.auxiliaryVerbs.toHave['tu']).toBe('as');
    });

    it('debería tener conjugación válida para italiano', () => {
      const config = getLanguageConfig('it');
      verifyConjugationConfig(config);

      expect(config.conjugation.auxiliaryVerbs.toBe['io']).toBe('sono');
      expect(config.conjugation.auxiliaryVerbs.toBe['tu']).toBe('sei');
      expect(config.conjugation.auxiliaryVerbs.toHave['io']).toBe('ho');
      expect(config.conjugation.auxiliaryVerbs.toHave['tu']).toBe('hai');
    });

    it('debería tener conjugaciones de grupos verbales', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { firstGroup, secondGroup, thirdGroup } = config.conjugation.verbGroups;

        // Verificar que el primer grupo existe
        expect(firstGroup).toBeDefined();
        expect(Object.keys(firstGroup).length).toBeGreaterThan(0);

        // Segundo y tercer grupo son opcionales para algunos idiomas
        if (secondGroup) {
          expect(Object.keys(secondGroup).length).toBeGreaterThan(0);
        }
        if (thirdGroup) {
          expect(Object.keys(thirdGroup).length).toBeGreaterThan(0);
        }
      }
    });

    it('debería tener pronombres completos', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { pronouns } = config.conjugation;

        // Verificar que todos los tipos de pronombres existen
        expect(pronouns.firstPerson).toBeDefined();
        expect(pronouns.secondPerson).toBeDefined();
        expect(pronouns.thirdPerson).toBeDefined();
        expect(pronouns.firstPlural).toBeDefined();
        expect(pronouns.secondPlural).toBeDefined();
        expect(pronouns.thirdPlural).toBeDefined();

        // Verificar que los arrays no están vacíos
        expect(pronouns.firstPerson.length).toBeGreaterThan(0);
        expect(pronouns.secondPerson.length).toBeGreaterThan(0);
        expect(pronouns.thirdPerson.length).toBeGreaterThan(0);
        expect(pronouns.firstPlural.length).toBeGreaterThan(0);
        expect(pronouns.secondPlural.length).toBeGreaterThan(0);
        expect(pronouns.thirdPlural.length).toBeGreaterThan(0);
      }
    });
  });

  describe('janus config', () => {
    const verifyJanusConfig = (config: LanguageConfig) => {
      const { janus } = config;

      // Verificar estructura de Janus
      expect(janus).toBeDefined();
      expect(janus.subjects).toBeInstanceOf(Array);
      expect(janus.defaultVerbs).toBeInstanceOf(Array);
      expect(janus.defaultComplements).toBeInstanceOf(Array);
      expect(janus.verbEndings).toBeInstanceOf(Array);
      expect(janus.labels).toBeDefined();
      expect(janus.labels.fallbackWord).toBeDefined();
      expect(janus.labels.dummyOptions).toBeInstanceOf(Array);
      expect(janus.labels.greeting).toBeDefined();
      expect(janus.labels.columnTitles).toBeDefined();
    };

    it('debería tener configuración Janus válida para alemán', () => {
      const config = getLanguageConfig('de');
      verifyJanusConfig(config);

      expect(config.janus.labels.fallbackWord).toBe('Wort');
      expect(config.janus.labels.greeting).toBe('Hallo!');
      expect(config.janus.labels.columnTitles.subject).toBe('Subjekt');
    });

    it('debería tener configuración Janus válida para inglés', () => {
      const config = getLanguageConfig('en');
      verifyJanusConfig(config);

      expect(config.janus.labels.fallbackWord).toBe('word');
      expect(config.janus.labels.greeting).toBe('Hello!');
      expect(config.janus.labels.columnTitles.subject).toBe('Subject');
    });

    it('debería tener configuración Janus válida para español', () => {
      const config = getLanguageConfig('es');
      verifyJanusConfig(config);

      expect(config.janus.labels.fallbackWord).toBe('palabra');
      expect(config.janus.labels.greeting).toBe('¡Hola!');
      expect(config.janus.labels.columnTitles.subject).toBe('Sujeto');
    });

    it('debería tener configuración Janus válida para francés', () => {
      const config = getLanguageConfig('fr');
      verifyJanusConfig(config);

      expect(config.janus.labels.fallbackWord).toBe('mot');
      expect(config.janus.labels.greeting).toBe('Bonjour!');
      expect(config.janus.labels.columnTitles.subject).toBe('Sujet');
    });

    it('debería tener configuración Janus válida para italiano', () => {
      const config = getLanguageConfig('it');
      verifyJanusConfig(config);

      expect(config.janus.labels.fallbackWord).toBe('parola');
      expect(config.janus.labels.greeting).toBe('Ciao!');
      expect(config.janus.labels.columnTitles.subject).toBe('Soggetto');
    });

    it('debería tener subjects, verbs y complements para ejercicios Janus', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { janus } = config;

        // Verificar que hay suficientes elementos para ejercicios
        expect(janus.subjects.length).toBeGreaterThan(0);
        expect(janus.defaultVerbs.length).toBeGreaterThan(0);
        expect(janus.defaultComplements.length).toBeGreaterThan(0);
        expect(janus.verbEndings.length).toBeGreaterThan(0);

        // Verificar estructura de subjects
        janus.subjects.forEach(subject => {
          expect(subject.text).toBeDefined();
          expect(subject.translation).toBeDefined();
        });

        // Verificar dummy options
        expect(janus.labels.dummyOptions.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('voice config', () => {
    it('debería tener configuración de voz para cada idioma', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { voice } = config;

        expect(voice).toBeDefined();
        expect(voice.ttsLang).toBeDefined();
        expect(voice.rate).toBeGreaterThan(0);
        expect(voice.langCodes).toBeInstanceOf(Array);
        expect(voice.langCodes.length).toBeGreaterThan(0);
        expect(voice.preferredVoices).toBeInstanceOf(Array);
      }
    });

    it('debería tener códigos de idioma TTS válidos', () => {
      const germanConfig = getLanguageConfig('de');
      expect(germanConfig.voice.ttsLang).toBe('de-DE');

      const englishConfig = getLanguageConfig('en');
      expect(englishConfig.voice.ttsLang).toBe('en-US');

      const spanishConfig = getLanguageConfig('es');
      expect(spanishConfig.voice.ttsLang).toBe('es-ES');

      const frenchConfig = getLanguageConfig('fr');
      expect(frenchConfig.voice.ttsLang).toBe('fr-FR');

      const italianConfig = getLanguageConfig('it');
      expect(italianConfig.voice.ttsLang).toBe('it-IT');
    });

    it('debería tener tasas de habla apropiadas', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { rate } = config.voice;

        // La tasa debe estar entre 0.5 y 1.5
        expect(rate).toBeGreaterThanOrEqual(0.5);
        expect(rate).toBeLessThanOrEqual(1.5);
      }
    });
  });

  describe('stop words', () => {
    it('debería tener stop words para cada idioma', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { stopWords } = config;

        expect(stopWords).toBeDefined();
        expect(stopWords.words).toBeInstanceOf(Set);
        expect(stopWords.words.size).toBeGreaterThan(0);
      }
    });

    it('debería tener categorías de stop words', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang);
        const { stopWords } = config;

        expect(stopWords.words).toBeInstanceOf(Set);
        expect(stopWords.pronouns).toBeInstanceOf(Set);
        expect(stopWords.articles).toBeInstanceOf(Set);
        expect(stopWords.prepositions).toBeInstanceOf(Set);
        expect(stopWords.conjunctions).toBeInstanceOf(Set);
        expect(stopWords.commonVerbs).toBeInstanceOf(Set);
      }
    });

    it('debería tener stop words comunes para cada idioma', () => {
      const germanConfig = getLanguageConfig('de');
      expect(germanConfig.stopWords.words.has('der')).toBe(true);
      expect(germanConfig.stopWords.words.has('die')).toBe(true);
      expect(germanConfig.stopWords.words.has('das')).toBe(true);

      const englishConfig = getLanguageConfig('en');
      expect(englishConfig.stopWords.words.has('the')).toBe(true);
      expect(englishConfig.stopWords.words.has('a')).toBe(true);
      expect(englishConfig.stopWords.words.has('an')).toBe(true);

      const spanishConfig = getLanguageConfig('es');
      expect(spanishConfig.stopWords.words.has('el')).toBe(true);
      expect(spanishConfig.stopWords.words.has('la')).toBe(true);
      expect(spanishConfig.stopWords.words.has('los')).toBe(true);

      const frenchConfig = getLanguageConfig('fr');
      expect(frenchConfig.stopWords.words.has('le')).toBe(true);
      expect(frenchConfig.stopWords.words.has('la')).toBe(true);
      expect(frenchConfig.stopWords.words.has('les')).toBe(true);

      const italianConfig = getLanguageConfig('it');
      expect(italianConfig.stopWords.words.has('il')).toBe(true);
      expect(italianConfig.stopWords.words.has('la')).toBe(true);
      expect(italianConfig.stopWords.words.has('lo')).toBe(true);
    });
  });

  describe('LANGUAGE_CONFIGS constant', () => {
    it('debería tener configuraciones para todos los idiomas soportados', () => {
      // LANGUAGE_CONFIGS es un Record<string, LanguageConfig>
      const configKeys = Object.keys(LANGUAGE_CONFIGS);
      expect(configKeys.length).toBe(SUPPORTED_LANGUAGES.length);

      for (const lang of SUPPORTED_LANGUAGES) {
        expect(LANGUAGE_CONFIGS[lang]).toBeDefined();
      }
    });

    it('debería tener códigos únicos para cada idioma', () => {
      const configKeys = Object.keys(LANGUAGE_CONFIGS);
      const uniqueKeys = new Set(configKeys);

      expect(uniqueKeys.size).toBe(configKeys.length);
    });

    it('debería tener valores de configuración válidos', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = LANGUAGE_CONFIGS[lang];

        expect(config).toBeDefined();
        expect(config.voice).toBeDefined();
        expect(config.stopWords).toBeDefined();
        expect(config.conjugation).toBeDefined();
        expect(config.janus).toBeDefined();
      }
    });
  });
});
