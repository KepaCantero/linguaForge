/**
 * Tests para Context Extraction Service
 * Pruebas completas para extracción de palabras con contexto de oración
 */

import { describe, it, expect } from 'vitest';
import {
  splitIntoSentences,
  splitSentenceIntoWords,
  extractWordsWithContext,
  filterWordsByPOS,
  groupWordsByPOS,
  findWordsByLemma,
  findWordsNearPosition,
  extractContextForWordAt,
  calculateWordStats,
  extractWordsWithContextFallback,
} from '@/services/contextExtractionService';

// ============================================================
// FIXTURES
// ============================================================

const FRENCH_TEXT = `Je suis étudiant. J'aime le français. C'est une belle langue!`;

const FRENCH_TEXT_LONG = `
Je m'appelle Pierre. J'ai vingt-cinq ans et je suis français. J'habite à Paris avec ma famille.
J'étudie les langues étrangères à l'université. J'apprends l'anglais, l'espagnol et l'italien.
Le week-end, je joue au tennis avec mes amis. Nous aimons beaucoup ce sport!
Qu'est-ce que tu fais pendant ton temps libre?
`;

// Texto con palabras que pasarán el filtrado del POS tagger
// (palabras largas enough y no comunes)
const FRENCH_TEXT_SIMPLE = 'L\'étudiant français étudie rapidement.';

const SPANISH_TEXT = 'Hola, me llamo María. Tengo treinta años y vivo en Madrid.';

// Texto alternativo con más palabras extraíbles
const FRENCH_TEXT_ALT = 'Les étudiants étrangers apprennent rapidement les langues.';

// Texto largo con palabras sustanciales
const FRENCH_TEXT_SUBSTANTIAL = `
Les étrangers étudient difficilement. Les professeurs enseignent les langues étrangères.
Les étudiants apprécient les cours intéressants. Les bibliothèques contiennent livres importants.
Les programmeurs développent applications rapidement. Les ingénieurs construisent systèmes complexe.
Les journalistes écrivent articles sérieusement. Les musiciens composent mélodies heureusement.
`;

// ============================================================
// TESTS: SPLIT INTO SENTENCES
// ============================================================

describe('splitIntoSentences', () => {
  it('debería dividir texto simple en oraciones', () => {
    const text = 'Hola. Adiós.';
    const sentences = splitIntoSentences(text);

    expect(sentences).toHaveLength(2);
    expect(sentences[0].text).toBe('Hola');
    expect(sentences[1].text).toBe('Adiós');
  });

  it('debería mantener posiciones correctas', () => {
    const text = 'Hola. Adiós.';
    const sentences = splitIntoSentences(text);

    expect(sentences[0].start).toBe(0);
    expect(sentences[0].end).toBe(5); // 'Hola.' + espacio
    expect(sentences[1].start).toBe(6);
    expect(sentences[1].end).toBe(12);
  });

  it('debería manejar signos de exclamación e interrogación', () => {
    const text = '¿Cómo estás? ¡Bien! Adiós.';
    const sentences = splitIntoSentences(text);

    expect(sentences).toHaveLength(3);
    expect(sentences[0].text).toContain('¿Cómo estás?');
    expect(sentences[1].text).toContain('¡Bien!');
  });

  it('debería filtrar oraciones muy cortas', () => {
    const text = 'Hola. A. Adiós.';
    const sentences = splitIntoSentences(text);

    // La oración 'A' tiene menos de 10 caracteres y debería ser filtrada
    expect(sentences.length).toBeLessThan(3);
  });

  it('debería manejar texto vacío', () => {
    const sentences = splitIntoSentences('');

    expect(sentences).toHaveLength(0);
  });

  it('debería manejar texto con solo espacios', () => {
    const sentences = splitIntoSentences('   .   ');

    expect(sentences).toHaveLength(0);
  });

  it('debería dividir texto francés correctamente', () => {
    const sentences = splitIntoSentences(FRENCH_TEXT);

    expect(sentences.length).toBeGreaterThan(0);
    expect(sentences[0].text).toContain('Je suis étudiant');
  });

  it('debería dividir texto largo con múltiples oraciones', () => {
    const sentences = splitIntoSentences(FRENCH_TEXT_LONG);

    expect(sentences.length).toBeGreaterThan(3);
    sentences.forEach(sentence => {
      expect(sentence.text.length).toBeGreaterThanOrEqual(10);
      expect(sentence.start).toBeLessThan(sentence.end);
    });
  });
});

// ============================================================
// TESTS: SPLIT SENTENCE INTO WORDS
// ============================================================

describe('splitSentenceIntoWords', () => {
  it('debería dividir oración simple en palabras', () => {
    const sentence = 'Je suis étudiant';
    const words = splitSentenceIntoWords(sentence);

    expect(words).toHaveLength(3);
    expect(words[0].word).toBe('Je');
    expect(words[1].word).toBe('suis');
    expect(words[2].word).toBe('étudiant');
  });

  it('debería mantener posiciones correctas', () => {
    const sentence = 'Je suis';
    const words = splitSentenceIntoWords(sentence);

    expect(words[0].start).toBe(0);
    expect(words[0].end).toBe(2);
    expect(words[1].start).toBe(3);
    expect(words[1].end).toBe(7);
  });

  it('debería preservar contracciones francesas', () => {
    const sentence = "J'aime le français";
    const words = splitSentenceIntoWords(sentence);

    expect(words).toHaveLength(4);
    expect(words[0].word).toBe("J'aime");
    expect(words[1].word).toBe('le');
    expect(words[2].word).toBe('français');
  });

  it('debería manejar oración con puntuación', () => {
    const sentence = 'Je suis étudiant.';
    const words = splitSentenceIntoWords(sentence);

    expect(words.length).toBeGreaterThan(0);
    // La puntuación no debería incluirse en las palabras
    expect(words[words.length - 1].word).not.toContain('.');
  });

  it('debería manejar oración vacía', () => {
    const words = splitSentenceIntoWords('');

    expect(words).toHaveLength(0);
  });
});

// ============================================================
// TESTS: EXTRACT WORDS WITH CONTEXT
// ============================================================

describe('extractWordsWithContext', () => {
  it('debería extraer palabras con contexto de oración simple', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    expect(result.fullText).toBe(FRENCH_TEXT_ALT);
    expect(result.sentences.length).toBeGreaterThan(0);
    expect(result.allWords.length).toBeGreaterThan(0);
  });

  it('debería asignar IDs únicos a cada palabra', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    const ids = result.allWords.map(w => w.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('debería incluir metadata correcta', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    expect(result.metadata).toBeDefined();
    expect(result.metadata?.totalSentences).toBeGreaterThan(0);
    expect(result.metadata?.totalWords).toBeGreaterThan(0);
    expect(result.metadata?.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('debería manejar texto vacío', () => {
    const result = extractWordsWithContext('', 'fr');

    expect(result.sentences).toHaveLength(0);
    expect(result.allWords).toHaveLength(0);
    expect(result.metadata?.totalWords).toBe(0);
  });

  it('debería extraer palabras de múltiples oraciones', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    expect(result.sentences.length).toBeGreaterThan(1);
    expect(result.allWords.length).toBeGreaterThan(0);
  });

  it('debería incluir lemma para cada palabra', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    result.allWords.forEach(word => {
      expect(word.lemma).toBeDefined();
      expect(word.lemma.length).toBeGreaterThan(0);
    });
  });

  it('debería incluir tipo gramatical para cada palabra', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    result.allWords.forEach(word => {
      expect(['noun', 'verb', 'adverb', 'adjective', 'other']).toContain(word.pos);
    });
  });

  it('debería incluir confidence score', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    result.allWords.forEach(word => {
      expect(word.confidence).toBeGreaterThanOrEqual(0);
      expect(word.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('debería incluir posición de cada palabra', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    result.allWords.forEach(word => {
      expect(word.position.sentence).toBeGreaterThanOrEqual(0);
      expect(word.position.word).toBeGreaterThanOrEqual(0);
      expect(word.position.start).toBeLessThan(word.position.end);
    });
  });

  it('debería incluir oración completa en cada palabra', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    result.allWords.forEach(word => {
      expect(word.sentence).toBeDefined();
      expect(word.sentence.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// TESTS: FILTER WORDS BY POS
// ============================================================

describe('filterWordsByPOS', () => {
  it('debería filtrar verbos correctamente', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');
    const verbs = filterWordsByPOS(result.allWords, 'verb');

    verbs.forEach(word => {
      expect(word.pos).toBe('verb');
    });
  });

  it('debería filtrar sustantivos correctamente', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');
    const nouns = filterWordsByPOS(result.allWords, 'noun');

    nouns.forEach(word => {
      expect(word.pos).toBe('noun');
    });
  });

  it('debería retornar array vacío si no hay palabras del tipo', () => {
    const result = extractWordsWithContext('Je suis.', 'fr');
    const adverbs = filterWordsByPOS(result.allWords, 'adverb');

    expect(Array.isArray(adverbs)).toBe(true);
  });
});

// ============================================================
// TESTS: GROUP WORDS BY POS
// ============================================================

describe('groupWordsByPOS', () => {
  it('debería agrupar palabras por tipo gramatical', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');
    const grouped = groupWordsByPOS(result.allWords);

    expect(grouped).toHaveProperty('noun');
    expect(grouped).toHaveProperty('verb');
    expect(grouped).toHaveProperty('adverb');
    expect(grouped).toHaveProperty('adjective');
    expect(grouped).toHaveProperty('other');

    // Verificar que todas las palabras estén en algún grupo
    const totalGrouped = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
    expect(totalGrouped).toBe(result.allWords.length);
  });

  it('debería tener arrays válidos para cada tipo', () => {
    const result = extractWordsWithContext('Je suis.', 'fr');
    const grouped = groupWordsByPOS(result.allWords);

    Object.values(grouped).forEach(words => {
      expect(Array.isArray(words)).toBe(true);
    });
  });
});

// ============================================================
// TESTS: FIND WORDS BY LEMMA
// ============================================================

describe('findWordsByLemma', () => {
  it('debería encontrar palabras por lemma', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');
    const words = findWordsByLemma(result.allWords, 'étudiant');

    expect(words.length).toBeGreaterThan(0);
    words.forEach(word => {
      expect(word.lemma.toLowerCase()).toContain('étudiant');
    });
  });

  it('debería retornar array vacío si no hay coincidencias', () => {
    const result = extractWordsWithContext('Je suis.', 'fr');
    const words = findWordsByLemma(result.allWords, 'palabra_inexistente');

    expect(words).toHaveLength(0);
  });
});

// ============================================================
// TESTS: FIND WORDS NEAR POSITION
// ============================================================

describe('findWordsNearPosition', () => {
  it('debería encontrar palabras cerca de una posición', () => {
    const text = FRENCH_TEXT_SIMPLE;
    const result = extractWordsWithContext(text, 'fr');

    // Buscar cerca del inicio del texto
    const nearbyWords = findWordsNearPosition(result.allWords, 5, 10);

    expect(nearbyWords.length).toBeGreaterThan(0);
  });

  it('debería respetar el radio de búsqueda', () => {
    const text = FRENCH_TEXT_SIMPLE;
    const result = extractWordsWithContext(text, 'fr');

    const nearbyWords = findWordsNearPosition(result.allWords, 0, 5);

    nearbyWords.forEach(word => {
      const distance = Math.abs(word.position.start - 0);
      expect(distance).toBeLessThanOrEqual(5);
    });
  });
});

// ============================================================
// TESTS: EXTRACT CONTEXT FOR WORD AT
// ============================================================

describe('extractContextForWordAt', () => {
  it('debería extraer contexto para una palabra específica', () => {
    const text = FRENCH_TEXT_ALT;
    // Position 15 should be around 'étudiants' or 'étrangers'
    const wordContext = extractContextForWordAt(text, 15, 'fr');

    expect(wordContext).toBeDefined();
    expect(wordContext?.word).toBeDefined();
    expect(wordContext?.sentence).toBeDefined();
  });

  it('debería retornar undefined si la posición está fuera del texto', () => {
    const text = 'Je suis.';
    const wordContext = extractContextForWordAt(text, 1000, 'fr');

    expect(wordContext).toBeUndefined();
  });

  it('debería incluir la oración completa', () => {
    const text = FRENCH_TEXT_ALT;
    const wordContext = extractContextForWordAt(text, 15, 'fr');

    expect(wordContext?.sentence).toBeDefined();
    expect(wordContext?.sentence.length).toBeGreaterThan(0);
  });
});

// ============================================================
// TESTS: CALCULATE WORD STATS
// ============================================================

describe('calculateWordStats', () => {
  it('debería calcular estadísticas correctamente', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');
    const stats = calculateWordStats(result);

    expect(stats.totalWords).toBe(result.allWords.length);
    expect(stats.uniqueLemmas).toBeGreaterThan(0);
    expect(stats.uniqueLemmas).toBeLessThanOrEqual(stats.totalWords);
    expect(stats.byPOS).toBeDefined();
    expect(stats.avgConfidence).toBeGreaterThanOrEqual(0);
    expect(stats.avgConfidence).toBeLessThanOrEqual(1);
  });

  it('debería contar palabras por tipo', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');
    const stats = calculateWordStats(result);

    expect(stats.byPOS.noun).toBeGreaterThanOrEqual(0);
    expect(stats.byPOS.verb).toBeGreaterThanOrEqual(0);
    expect(stats.byPOS.adverb).toBeGreaterThanOrEqual(0);
    expect(stats.byPOS.adjective).toBeGreaterThanOrEqual(0);

    const totalByPOS = stats.byPOS.noun + stats.byPOS.verb +
      stats.byPOS.adverb + stats.byPOS.adjective + stats.byPOS.other;
    expect(totalByPOS).toBe(stats.totalWords);
  });

  it('debería calcular promedio de palabras por oración', () => {
    const result = extractWordsWithContext(FRENCH_TEXT, 'fr');
    const stats = calculateWordStats(result);

    expect(stats.avgWordsPerSentence).toBeGreaterThan(0);
  });
});

// ============================================================
// TESTS: FALLBACK FUNCTION
// ============================================================

describe('extractWordsWithContextFallback', () => {
  it('debería extraer palabras con fallback', () => {
    const result = extractWordsWithContextFallback(FRENCH_TEXT_SIMPLE, 'fr');

    expect(result.sentences.length).toBeGreaterThan(0);
    expect(result.allWords.length).toBeGreaterThan(0);
  });

  it('debería tener menor confianza en fallback', () => {
    const result = extractWordsWithContextFallback('Je suis.', 'fr');

    result.allWords.forEach(word => {
      expect(word.confidence).toBe(0.5);
    });
  });

  it('debería manejar texto vacío en fallback', () => {
    const result = extractWordsWithContextFallback('', 'fr');

    expect(result.sentences).toHaveLength(0);
    expect(result.allWords).toHaveLength(0);
  });
});

// ============================================================
// TESTS: INTEGRACIÓN
// ============================================================

describe('Integración', () => {
  it('debería procesar texto largo complejo', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_SUBSTANTIAL, 'fr');

    expect(result.sentences.length).toBeGreaterThan(3);
    expect(result.allWords.length).toBeGreaterThan(20);

    const stats = calculateWordStats(result);
    expect(stats.uniqueLemmas).toBeGreaterThan(10);
  });

  it('debería mantener consistencia entre oraciones y palabras', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_ALT, 'fr');

    // Verificar que todas las palabras están asociadas a oraciones válidas
    result.allWords.forEach(word => {
      const sentence = result.sentences.find(s => s.id === word.sentence || s.text === word.sentence);
      expect(sentence).toBeDefined();
    });
  });

  it('debería procesar texto en español', () => {
    const result = extractWordsWithContext(SPANISH_TEXT, 'es');

    // El POS tagger está optimizado para francés, pero debería funcionar parcialmente para español
    // Solo verificamos que no falle
    expect(result).toBeDefined();
    expect(result.fullText).toBe(SPANISH_TEXT);
  });

  it('debería completar en tiempo razonable', () => {
    const startTime = performance.now();
    const result = extractWordsWithContext(FRENCH_TEXT_SUBSTANTIAL, 'fr');
    const endTime = performance.now();

    expect(result.allWords.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
  });
});
