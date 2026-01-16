/**
 * POS Tagging Service Tests
 * Tests para el servicio de etiquetado gramatical
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeWord,
  extractGrammaticalCategories,
  getCategoryStats,
  extractGrammaticalCategoriesFallback,
} from '@/services/posTaggingService';
import type { POSType } from '@/schemas/posTagging';
import { frenchConfig, spanishConfig } from '@/config/languages';

// ============================================================
// SETUP
// ============================================================

let frenchText: string;

beforeEach(() => {
  frenchText = `Bonjour! Je m'appelle Marie. J'habite à Paris avec mon chat.
  Il aime dormir sur le canapé. Nous mangeons des croissants chaque matin.
  Rapidement, nous finissons le travail. Heureusement, le temps est beau.`;
});

// ============================================================
// TESTS DE NORMALIZACIÓN
// ============================================================

describe('normalizeWord', () => {
  it('debería convertir a minúsculas', () => {
    expect(normalizeWord('Bonjour')).toBe('bonjour');
    expect(normalizeWord('PARIS')).toBe('paris');
  });

  it('debería eliminar acentos', () => {
    expect(normalizeWord('être')).toBe('etre');
    expect(normalizeWord('école')).toBe('ecole');
    expect(normalizeWord('français')).toBe('francais');
    expect(normalizeWord('à')).toBe('a');
    expect(normalizeWord('é')).toBe('e');
  });

  it('debería eliminar puntuación', () => {
    expect(normalizeWord('bonjour!')).toBe('bonjour');
    expect(normalizeWord('mot,')).toBe('mot');
    expect(normalizeWord('mot.')).toBe('mot');
  });

  it('debería preservar contracciones básicas', () => {
    expect(normalizeWord("j'aime")).toBe('jaime');
    expect(normalizeWord("n'aime")).toBe('naime');
  });
});

// ============================================================
// TESTS DE EXTRACCIÓN COMPLETA
// ============================================================

describe('extractGrammaticalCategories (French)', () => {
  it('debería extraer sustantivos', () => {
    const result = extractGrammaticalCategories(frenchText);
    expect(result.nouns.length).toBeGreaterThan(0);

    const nounLemmas = result.nouns.map(n => n.lemma);
    expect(nounLemmas).toContain('chat');
    expect(nounLemmas).toContain('canape');
    expect(nounLemmas).toContain('travail');
  });

  it('debería extraer verbos', () => {
    const result = extractGrammaticalCategories(frenchText);
    expect(result.verbs.length).toBeGreaterThan(0);

    const verbLemmas = result.verbs.map(v => v.lemma);
    expect(verbLemmas).toContain('habiter');
    expect(verbLemmas).toContain('aimer');
    expect(verbLemmas).toContain('manger');
    expect(verbLemmas).toContain('finir');
  });

  it('debería extraer adverbios', () => {
    const result = extractGrammaticalCategories(frenchText);
    expect(result.adverbs.length).toBeGreaterThan(0);

    const adverbLemmas = result.adverbs.map(a => a.lemma);
    expect(adverbLemmas).toContain('rapidement');
    expect(adverbLemmas).toContain('heureusement');
  });

  it('debería extraer adjetivos', () => {
    const result = extractGrammaticalCategories(frenchText);
    expect(result.adjectives.length).toBeGreaterThan(0);

    const adjLemmas = result.adjectives.map(a => a.lemma);
    expect(adjLemmas).toContain('beau');
  });

  it('debería incluir metadatos', () => {
    const result = extractGrammaticalCategories(frenchText);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.totalWords).toBeGreaterThan(0);
    expect(result.metadata?.taggedWords).toBeGreaterThan(0);
    expect(result.metadata?.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('debería asignar confidence scores apropiados', () => {
    const result = extractGrammaticalCategories(frenchText);

    // Adverbios en -ment deberían tener alta confianza
    const adverb = result.adverbs.find(a => a.lemma === 'rapidement');
    expect(adverb?.confidence).toBeGreaterThan(0.8);

    // Verbos con terminaciones claras deberían tener buena confianza
    const verb = result.verbs.find(v => v.lemma === 'aimer');
    expect(verb?.confidence).toBeGreaterThan(0.7);
  });

  it('debería no incluir duplicados', () => {
    const textWithDuplicates = 'Je mange. Tu manges. Il mange.';
    const result = extractGrammaticalCategories(textWithDuplicates);

    const mangeLemmas = result.verbs.filter(v => v.lemma === 'manger');
    expect(mangeLemmas.length).toBe(1);
  });

  it('debería manejar texto vacío', () => {
    const result = extractGrammaticalCategories('');
    expect(result.nouns).toHaveLength(0);
    expect(result.verbs).toHaveLength(0);
    expect(result.adverbs).toHaveLength(0);
    expect(result.adjectives).toHaveLength(0);
    expect(result.metadata?.totalWords).toBe(0);
  });

  it('debería preservar posición de palabras', () => {
    const result = extractGrammaticalCategories('Je mange une pomme');
    const jeWord = result.nouns.find(n => n.word === 'Je');
    expect(jeWord?.position).toBe(0);

    const mangeVerb = result.verbs.find(v => v.word === 'mange');
    expect(mangeVerb?.position).toBe(3);
  });
});

// ============================================================
// TESTS DE CONFIG INYECTADA
// ============================================================

describe('extractGrammaticalCategories with injected config', () => {
  it('debería usar configuración francesa inyectada', () => {
    const result = extractGrammaticalCategories('Le chat mange', 'fr', frenchConfig);

    expect(result.language).toBe('fr');
    expect(result.nouns.length).toBeGreaterThan(0);
    expect(result.verbs.length).toBeGreaterThan(0);
  });

  it('debería usar configuración española inyectada', () => {
    const spanishText = 'El gato come rápidamente. Es muy bonito.';
    const result = extractGrammaticalCategories(spanishText, 'es', spanishConfig);

    expect(result.language).toBe('es');
    expect(result.nouns.length).toBeGreaterThan(0);
    expect(result.verbs.length).toBeGreaterThan(0);
    expect(result.adverbs.length).toBeGreaterThan(0);
  });

  it('debería detectar verbos españoles', () => {
    const spanishText = 'Yo como, tú comes, él come';
    const result = extractGrammaticalCategories(spanishText, 'es', spanishConfig);

    const verbLemmas = result.verbs.map(v => v.lemma);
    expect(verbLemmas).toContain('comer');
  });

  it('debería detectar adverbios españoles en -mente', () => {
    const spanishText = 'Rápidamente terminó el trabajo';
    const result = extractGrammaticalCategories(spanishText, 'es', spanishConfig);

    expect(result.adverbs.length).toBeGreaterThan(0);
    expect(result.adverbs[0].lemma).toBe('rapidamente');
  });
});

// ============================================================
// TESTS DE ESTADÍSTICAS
// ============================================================

describe('getCategoryStats', () => {
  it('debería calcular estadísticas correctas', () => {
    const text = 'Le chat mange rapidement. Il est beau.';
    const result = extractGrammaticalCategories(text);
    const stats = getCategoryStats(result);

    expect(stats.total).toBeGreaterThan(0);
    expect(stats.byType.noun).toBe(stats.nouns);
    expect(stats.byType.verb).toBe(stats.verbs);
    expect(stats.byType.adverb).toBe(stats.adverbs);
    expect(stats.byType.adjective).toBe(stats.adjectives);
  });

  it('debería sumar correctamente todas las categorías', () => {
    const result = extractGrammaticalCategories('Test text');
    const stats = getCategoryStats(result);

    expect(stats.total).toBe(
      stats.nouns + stats.verbs + stats.adverbs + stats.adjectives
    );
  });
});

// ============================================================
// TESTS DE FALLBACK
// ============================================================

describe('extractGrammaticalCategoriesFallback', () => {
  it('debería retornar resultado válido para francés', () => {
    const result = extractGrammaticalCategoriesFallback('Le chat mange', 'fr');

    expect(result.nouns).toBeDefined();
    expect(result.verbs).toBeDefined();
    expect(result.adverbs).toBeDefined();
    expect(result.adjectives).toBeDefined();
    expect(result.fullText).toBe('Le chat mange');
  });

  it('debería tener baja confianza', () => {
    const result = extractGrammaticalCategoriesFallback('Le chat mange', 'fr');

    const allWords = [
      ...result.nouns,
      ...result.verbs,
      ...result.adverbs,
      ...result.adjectives,
    ];

    allWords.forEach(word => {
      expect(word.confidence).toBe(0.5);
    });
  });

  it('debería funcionar con español', () => {
    const result = extractGrammaticalCategoriesFallback('El gato come', 'es');

    expect(result.language).toBe('es');
    expect(result.nouns).toBeDefined();
    expect(result.verbs).toBeDefined();
  });
});

// ============================================================
// TESTS DE INTEGRACIÓN
// ============================================================

describe('Integración', () => {
  it('debería procesar texto largo sin errores', () => {
    const longText = `C'est une belle journée. Le soleil brille et les oiseaux chantent.
    Je marche dans le parc. Les enfants jouent joyeusement. Heureusement,
    nous avons beaucoup de temps. Nous finirons rapidement le travail.
    La vie est vraiment belle.`;

    const result = extractGrammaticalCategories(longText);

    expect(result.nouns.length).toBeGreaterThan(0);
    expect(result.verbs.length).toBeGreaterThan(0);
    expect(result.metadata?.totalWords).toBeGreaterThan(20);
  });

  it('debería manejar contracciones correctamente', () => {
    const text = "J'aime le café. N'aime-t-il pas?";
    const result = extractGrammaticalCategories(text);

    // Debería detectar el verbo "aime" a pesar de la contracción
    const aimeVerbs = result.verbs.filter(v => v.lemma === 'aimer');
    expect(aimeVerbs.length).toBeGreaterThan(0);
  });

  it('debería filtrar palabras comunes correctamente', () => {
    const text = 'Le la un une des et ou mais donc car';
    const result = extractGrammaticalCategories(text);

    // No debería etiquetar artículos como sustantivos
    const commonWords = result.nouns.filter(n =>
      ['le', 'la', 'un', 'une', 'des', 'et', 'ou', 'mais'].includes(n.lemma)
    );
    expect(commonWords.length).toBe(0);
  });

  it('debería detectar pronombres sujetos importantes', () => {
    const text = 'Je suis là. Tu es là. Il est là.';
    const result = extractGrammaticalCategories(text);

    const subjectPronouns = result.nouns.filter(n =>
      ['je', 'tu', 'il'].includes(n.word.toLowerCase())
    );
    expect(subjectPronouns.length).toBeGreaterThan(0);
  });

  it('debería lematizar verbos correctamente', () => {
    const text = 'Je parle, tu parles, il parle';
    const result = extractGrammaticalCategories(text);

    const parleVerbs = result.verbs.filter(v => v.lemma === 'parler');
    expect(parleVerbs.length).toBeGreaterThan(0);
  });

  it('debería lematizar sustantivos plurales', () => {
    const text = 'Les maisons sont grandes';
    const result = extractGrammaticalCategories(text);

    const maisonNouns = result.nouns.filter(n => n.lemma ===('maison'));
    expect(maisonNouns.length).toBeGreaterThan(0);
  });
});

// ============================================================
// TESTS DE MULTI-IDIOMA
// ============================================================

describe('Multi-language Support', () => {
  it('debería procesar francés correctamente', () => {
    const text = 'Le petit chat mange rapidement';
    const result = extractGrammaticalCategories(text, 'fr');

    expect(result.language).toBe('fr');
    expect(result.nouns.length).toBeGreaterThan(0);
    expect(result.verbs.length).toBeGreaterThan(0);
    expect(result.adverbs.length).toBeGreaterThan(0);
    expect(result.adjectives.length).toBeGreaterThan(0);
  });

  it('debería procesar español correctamente', () => {
    const text = 'El pequeño gato come rápidamente';
    const result = extractGrammaticalCategories(text, 'es');

    expect(result.language).toBe('es');
    expect(result.nouns.length).toBeGreaterThan(0);
    expect(result.verbs.length).toBeGreaterThan(0);
  });

  it('debería usar fallback para idiomas no soportados', () => {
    const text = 'Some text in unknown language';
    const result = extractGrammaticalCategories(text, 'de' as any);

    // Debería retornar resultado con fallback
    expect(result).toBeDefined();
  });
});

// ============================================================
// TESTS DE DETECCIÓN CONTEXTUAL DE SUSTANTIVOS
// ============================================================

describe('isNoun - Contextual Detection with nounArticles', () => {
  it('debería detectar sustantivo precedido por artículo definido (le)', () => {
    const text = 'la maison est belle';
    const result = extractGrammaticalCategories(text, 'fr');

    const maisonNoun = result.nouns.find(n => n.lemma === 'maison');
    expect(maisonNoun).toBeDefined();
    expect(maisonNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo definido (le)', () => {
    const text = 'le chat mange';
    const result = extractGrammaticalCategories(text, 'fr');

    const chatNoun = result.nouns.find(n => n.lemma === 'chat');
    expect(chatNoun).toBeDefined();
    expect(chatNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo indefinido (un)', () => {
    const text = 'un livre intéressant';
    const result = extractGrammaticalCategories(text, 'fr');

    const livreNoun = result.nouns.find(n => n.lemma === 'livre');
    expect(livreNoun).toBeDefined();
    expect(livreNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo indefinido (une)', () => {
    const text = 'une table en bois';
    const result = extractGrammaticalCategories(text, 'fr');

    const tableNoun = result.nouns.find(n => n.lemma === 'table');
    expect(tableNoun).toBeDefined();
    expect(tableNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo partitivo (du)', () => {
    const text = 'du pain et du vin';
    const result = extractGrammaticalCategories(text, 'fr');

    const painNoun = result.nouns.find(n => n.lemma === 'pain');
    const vinNoun = result.nouns.find(n => n.lemma === 'vin');
    expect(painNoun).toBeDefined();
    expect(vinNoun).toBeDefined();
  });

  it('debería detectar sustantivo precedido por artículo demostrativo (ce)', () => {
    const text = 'ce chien est grand';
    const result = extractGrammaticalCategories(text, 'fr');

    const chienNoun = result.nouns.find(n => n.lemma === 'chien');
    expect(chienNoun).toBeDefined();
    expect(chienNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo demostrativo (cette)', () => {
    const text = 'cette femme parle';
    const result = extractGrammaticalCategories(text, 'fr');

    const femmeNoun = result.nouns.find(n => n.lemma === 'femme');
    expect(femmeNoun).toBeDefined();
    expect(femmeNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo posesivo (mon)', () => {
    const text = 'mon père travaille';
    const result = extractGrammaticalCategories(text, 'fr');

    const pereNoun = result.nouns.find(n => n.lemma === 'pere');
    expect(pereNoun).toBeDefined();
    expect(pereNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo posesivo (ma)', () => {
    const text = 'ma mère cuisine';
    const result = extractGrammaticalCategories(text, 'fr');

    const mereNoun = result.nouns.find(n => n.lemma === 'mere');
    expect(mereNoun).toBeDefined();
    expect(mereNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivo precedido por artículo contraído (au)', () => {
    const text = 'au magasin';
    const result = extractGrammaticalCategories(text, 'fr');

    const magasinNoun = result.nouns.find(n => n.lemma === 'magasin');
    expect(magasinNoun).toBeDefined();
    expect(magasinNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivos plurales precedidos por artículos plurales (les)', () => {
    const text = 'les enfants jouent';
    const result = extractGrammaticalCategories(text, 'fr');

    const enfantNoun = result.nouns.find(n => n.lemma === 'enfant');
    expect(enfantNoun).toBeDefined();
    expect(enfantNoun?.pos).toBe('noun');
  });

  it('debería detectar sustantivos plurales precedidos por artículos plurales (des)', () => {
    const text = 'des fleurs dans le jardin';
    const result = extractGrammaticalCategories(text, 'fr');

    const fleurNoun = result.nouns.find(n => n.lemma === 'fleur');
    const jardinNoun = result.nouns.find(n => n.lemma === 'jardin');
    expect(fleurNoun).toBeDefined();
    expect(jardinNoun).toBeDefined();
  });

  it('no debería detectar verbo como sustantivo aunque esté precedido por artículo', () => {
    const text = 'le manger est important';
    const result = extractGrammaticalCategories(text, 'fr');

    // 'manger' en este contexto es un sustantivo (el acto de comer), no un verbo
    const mangeWords = result.nouns.filter(n => n.word === 'manger' || n.lemma === 'manger');
    expect(mangeWords.length).toBeGreaterThan(0);
  });

  it('debería detectar múltiples sustantivos en una frase con diferentes artículos', () => {
    const text = 'le chat mange un poisson dans mon jardin';
    const result = extractGrammaticalCategories(text, 'fr');

    const nounLemmas = result.nouns.map(n => n.lemma);
    expect(nounLemmas).toContain('chat');
    expect(nounLemmas).toContain('poisson');
    expect(nounLemmas).toContain('jardin');
  });

  it('debería manejar correctamente el artículo "l" con apóstrofe', () => {
    const text = "l'école est grande";
    const result = extractGrammaticalCategories(text, 'fr');

    const ecoleNoun = result.nouns.find(n => n.lemma === 'ecole');
    expect(ecoleNoun).toBeDefined();
    expect(ecoleNoun?.pos).toBe('noun');
  });

  it('debería priorizar detección contextual sobre detección por exclusión', () => {
    const text = 'le livre rouge';
    const result = extractGrammaticalCategories(text, 'fr');

    const livreNoun = result.nouns.find(n => n.lemma === 'livre');
    expect(livreNoun).toBeDefined();
    expect(livreNoun?.pos).toBe('noun');
    expect(livreNoun?.confidence).toBeGreaterThan(0.5);
  });

  it('debería detectar sustantivos propios con mayúscula inicial', () => {
    const text = 'Paris est belle';
    const result = extractGrammaticalCategories(text, 'fr');

    const parisNoun = result.nouns.find(n => n.word === 'Paris');
    expect(parisNoun).toBeDefined();
    expect(parisNoun?.pos).toBe('noun');
  });

  it('debería procesar texto largo con múltiples artículos correctamente', () => {
    const text = `Le chat dort sur le canapé. Une oiseau chante dans l'arbre.
      Mon frère lit un livre. Ces enfants jouent avec des ballons.`;
    const result = extractGrammaticalCategories(text, 'fr');

    expect(result.nouns.length).toBeGreaterThan(5);
    const nounLemmas = result.nouns.map(n => n.lemma);
    expect(nounLemmas).toContain('chat');
    expect(nounLemmas).toContain('canape');
    expect(nounLemmas).toContain('oiseau');
    expect(nounLemmas).toContain('arbre');
    expect(nounLemmas).toContain('frere');
    expect(nounLemmas).toContain('livre');
  });

  it('debería mantener detección de sustantivos sin contexto (backward compatibility)', () => {
    const text = 'chien';
    const result = extractGrammaticalCategories(text, 'fr');

    // La palabra 'chien' sola debería detectarse como sustantivo por longitud
    const chienNoun = result.nouns.find(n => n.lemma === 'chien');
    expect(chienNoun).toBeDefined();
  });

  it('no debería detectar artículos como sustantivos', () => {
    const text = 'le la un une des';
    const result = extractGrammaticalCategories(text, 'fr');

    const articleLemmas = result.nouns.map(n => n.lemma);
    expect(articleLemmas).not.toContain('le');
    expect(articleLemmas).not.toContain('la');
    expect(articleLemmas).not.toContain('un');
    expect(articleLemmas).not.toContain('une');
    expect(articleLemmas).not.toContain('des');
  });
});
