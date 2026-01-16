/**
 * Context Extraction Service
 * Servicio para extraer palabras con contexto de oración completa
 * Integra POS Tagging Service y divide texto en oraciones manteniendo formato
 */

import {
  extractGrammaticalCategories,
  normalizeWord,
  type POSType,
} from './posTaggingService';
import type { LanguageCode } from '@/schemas/posTagging';
import {
  WordWithContextSchema,
  SentenceContextSchema,
  ContextExtractionResultSchema,
  type WordWithContext,
  type SentenceContext,
  type ContextExtractionResult,
  generateWordId,
  generateSentenceId,
} from '@/types/word';
import { DEFAULT_LANGUAGE as CENTRALIZED_DEFAULT_LANGUAGE } from '@/config/languages';
import {
  getMinSentenceLength,
  getMinWordLength,
} from '@/config/inputConfig';

// ============================================================
// CONSTANTES
// ============================================================

const DEFAULT_LANGUAGE = CENTRALIZED_DEFAULT_LANGUAGE;
// Use centralized configuration from inputConfig
const MIN_SENTENCE_LENGTH = getMinSentenceLength();
const MIN_WORD_LENGTH = getMinWordLength();

// Separadores de oraciones (períodos, exclamación, interrogación)
const SENTENCE_DELIMITERS = /[.!?]+\s+/;

// ============================================================
// SENTENCE SPLITTING
// ============================================================

/**
 * Divide un texto en oraciones manteniendo el formato original
 *
 * @param text - Texto a dividir
 * @returns Array de oraciones con sus posiciones
 */
export function splitIntoSentences(text: string): Array<{
  text: string;
  start: number;
  end: number;
}> {
  const sentences: Array<{ text: string; start: number; end: number }> = [];

  let sentenceStart = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    // Verificar si estamos en un delimitador de oración
    if (char === '.' || char === '!' || char === '?') {
      // Verificar si hay espacio o mayúscula después
      const hasSpaceAfter = nextChar === ' ' || nextChar === '\n' || nextChar === '\t';
      const hasUppercaseAfter = nextChar && nextChar === nextChar.toUpperCase() && /[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÑÇ]/.test(nextChar);
      const isEndOfText = i === text.length - 1;

      if (hasSpaceAfter || hasUppercaseAfter || isEndOfText) {
        // Extraer oración desde el inicio hasta este delimitador
        let sentenceEnd = i + 1;

        // Incluir espacio después si existe
        if (hasSpaceAfter) {
          sentenceEnd = i + 2;
        }

        const sentenceText = text.slice(sentenceStart, sentenceEnd).trim();

        // Solo agregar si tiene longitud mínima
        if (sentenceText.length >= MIN_SENTENCE_LENGTH) {
          sentences.push({
            text: sentenceText,
            start: sentenceStart,
            end: sentenceEnd,
          });
        }

        sentenceStart = sentenceEnd;
      }
    }
  }

  // Agregar resto del texto si existe y no está vacío
  if (sentenceStart < text.length) {
    const remainingText = text.slice(sentenceStart).trim();
    if (remainingText.length >= MIN_SENTENCE_LENGTH) {
      sentences.push({
        text: remainingText,
        start: sentenceStart,
        end: text.length,
      });
    }
  }

  // Si no se detectaron oraciones con el método anterior, usar split simple
  if (sentences.length === 0 && text.trim().length > 0) {
    const simpleSentences = text.split(SENTENCE_DELIMITERS).filter(s => s.trim().length >= MIN_SENTENCE_LENGTH);
    let pos = 0;
    for (const sentence of simpleSentences) {
      const trimmed = sentence.trim();
      if (trimmed.length >= MIN_SENTENCE_LENGTH) {
        sentences.push({
          text: trimmed,
          start: pos,
          end: pos + trimmed.length,
        });
        pos += trimmed.length + 2; // +2 por el delimitador (. y espacio)
      }
    }
  }

  return sentences;
}

/**
 * Divide una oración en palabras preservando formato
 *
 * @param sentence - Oración a dividir
 * @returns Array de palabras con posiciones relativas
 */
export function splitSentenceIntoWords(sentence: string): Array<{
  word: string;
  start: number;
  end: number;
}> {
  const words: Array<{ word: string; start: number; end: number }> = [];

  // Regex que captura palabras con apóstrofes (J'aime, l'homme, etc.)
  const wordRegex = /[a-zA-ZàâäéèêëïîôùûüÿñçÀÂÄÉÈÊËÏÎÔÙÛÜŸÑÇ]+(?:['''][a-zA-ZàâäéèêëïîôùûüÿñçÀÂÄÉÈÊËÏÎÔÙÛÜŸÑÇ]+)?/g;
  const matches = Array.from(sentence.matchAll(wordRegex));

  for (const match of matches) {
    const word = match[0];
    const start = match.index ?? 0;
    const end = start + word.length;

    words.push({
      word,
      start,
      end,
    });
  }

  return words;
}

// ============================================================
// CONTEXT EXTRACTION
// ============================================================

/**
 * Extrae palabras con contexto de oración completa de un texto
 *
 * @param text - Texto a analizar
 * @param language - Idioma del texto (default: 'fr')
 * @returns ContextExtractionResult con oraciones y palabras con contexto
 */
export function extractWordsWithContext(
  text: string,
  language: string = DEFAULT_LANGUAGE
): ContextExtractionResult {
  const startTime = performance.now();

  // Validación de entrada
  if (!text || text.trim().length === 0) {
    return {
      sentences: [],
      allWords: [],
      fullText: text,
      language,
      metadata: {
        totalSentences: 0,
        totalWords: 0,
        processingTimeMs: 0,
      },
    };
  }

  // Dividir texto en oraciones
  const rawSentences = splitIntoSentences(text);

  // Procesar cada oración
  const processedSentences: SentenceContext[] = [];
  const allWords: WordWithContext[] = [];

  for (let sentenceIndex = 0; sentenceIndex < rawSentences.length; sentenceIndex++) {
    const rawSentence = rawSentences[sentenceIndex];

    // Dividir oración en palabras
    const rawWords = splitSentenceIntoWords(rawSentence.text);

    // Analizar gramática de la oración completa
    const grammaticalAnalysis = extractGrammaticalCategories(rawSentence.text, language as LanguageCode);

    // Crear mapa de palabras analizadas para lookup rápido
    const analyzedWordsMap = new Map<string, typeof grammaticalAnalysis.verbs[0] |
      typeof grammaticalAnalysis.nouns[0] |
      typeof grammaticalAnalysis.adverbs[0] |
      typeof grammaticalAnalysis.adjectives[0]>();

    // Agregar todos los tipos al mapa
    [...grammaticalAnalysis.verbs, ...grammaticalAnalysis.nouns,
      ...grammaticalAnalysis.adverbs, ...grammaticalAnalysis.adjectives].forEach(taggedWord => {
        const normalized = normalizeWord(taggedWord.word);
        analyzedWordsMap.set(normalized, taggedWord);
      });

    // Crear palabras con contexto
    const sentenceWords: WordWithContext[] = [];

    for (let wordIndex = 0; wordIndex < rawWords.length; wordIndex++) {
      const rawWord = rawWords[wordIndex];
      const normalized = normalizeWord(rawWord.word);

      // Filtrar palabras muy cortas
      if (normalized.length < MIN_WORD_LENGTH) {
        continue;
      }

      // Buscar información gramatical si existe
      const analyzedInfo = analyzedWordsMap.get(normalized);

      // Si no hay análisis gramatical, crear info básica
      const pos: POSType = analyzedInfo?.pos ?? 'noun';
      const lemma = analyzedInfo?.lemma ?? normalized;
      const confidence = analyzedInfo?.confidence ?? 0.5;

      // Crear WordWithContext
      const wordWithContext: WordWithContext = {
        id: generateWordId(rawWord.word, {
          sentence: sentenceIndex,
          word: wordIndex,
          start: rawSentence.start + rawWord.start,
          end: rawSentence.start + rawWord.end,
        }),
        word: rawWord.word,
        lemma,
        pos,
        sentence: rawSentence.text,
        position: {
          sentence: sentenceIndex,
          word: wordIndex,
          start: rawSentence.start + rawWord.start,
          end: rawSentence.start + rawWord.end,
        },
        confidence,
      };

      // Validar con schema
      const validated = WordWithContextSchema.safeParse(wordWithContext);
      if (validated.success) {
        sentenceWords.push(validated.data);
        allWords.push(validated.data);
      }
    }

    // Crear SentenceContext
    if (sentenceWords.length > 0) {
      const sentenceContext: SentenceContext = {
        id: generateSentenceId(rawSentence.text, {
          start: rawSentence.start,
          end: rawSentence.end,
        }),
        text: rawSentence.text,
        words: sentenceWords,
        position: {
          start: rawSentence.start,
          end: rawSentence.end,
        },
        wordCount: sentenceWords.length,
      };

      // Validar con schema
      const validated = SentenceContextSchema.safeParse(sentenceContext);
      if (validated.success) {
        processedSentences.push(validated.data);
      }
    }
  }

  const processingTimeMs = performance.now() - startTime;

  const result: ContextExtractionResult = {
    sentences: processedSentences,
    allWords,
    fullText: text,
    language,
    metadata: {
      totalSentences: processedSentences.length,
      totalWords: allWords.length,
      processingTimeMs,
    },
  };

  // Validar resultado completo
  const validated = ContextExtractionResultSchema.safeParse(result);
  if (validated.success) {
    return validated.data;
  }

  // Fallback: retornar resultado sin validar
  return result;
}

/**
 * Filtra palabras por tipo gramatical
 *
 * @param words - Palabras a filtrar
 * @param pos - Tipo gramatical deseado
 * @returns Palabras filtradas
 */
export function filterWordsByPOS(
  words: WordWithContext[],
  pos: POSType
): WordWithContext[] {
  return words.filter(word => word.pos === pos);
}

/**
 * Agrupa palabras por tipo gramatical
 *
 * @param words - Palabras a agrupar
 * @returns Objeto con palabras agrupadas por tipo
 */
export function groupWordsByPOS(
  words: WordWithContext[]
): Record<POSType, WordWithContext[]> {
  const grouped: Record<string, WordWithContext[]> = {
    noun: [],
    verb: [],
    adverb: [],
    adjective: [],
    other: [],
  };

  for (const word of words) {
    grouped[word.pos].push(word);
  }

  return grouped as Record<POSType, WordWithContext[]>;
}

/**
 * Busca palabras por lemma
 *
 * @param words - Palabras donde buscar
 * @param lemma - Lemma a buscar
 * @returns Palabras que coinciden con el lemma
 */
export function findWordsByLemma(
  words: WordWithContext[],
  lemma: string
): WordWithContext[] {
  const normalizedLemma = normalizeWord(lemma);
  return words.filter(word => normalizeWord(word.lemma) === normalizedLemma);
}

/**
 * Encuentra palabras cercanas a una posición dada
 *
 * @param words - Todas las palabras
 * @param position - Posición de referencia
 * @param radius - Radio de búsqueda en caracteres (default: 100)
 * @returns Palabras dentro del radio de búsqueda
 */
export function findWordsNearPosition(
  words: WordWithContext[],
  position: number,
  radius: number = 100
): WordWithContext[] {
  return words.filter(word => {
    const wordCenter = (word.position.start + word.position.end) / 2;
    return Math.abs(wordCenter - position) <= radius;
  });
}

/**
 * Extrae contexto para una palabra específica
 *
 * @param text - Texto completo
 * @param wordPosition - Posición de la palabra en el texto
 * @param language - Idioma del texto
 * @returns WordWithContext de la palabra o undefined si no se encuentra
 */
export function extractContextForWordAt(
  text: string,
  wordPosition: number,
  language: string = DEFAULT_LANGUAGE
): WordWithContext | undefined {
  const result = extractWordsWithContext(text, language);

  // Buscar la palabra que contiene la posición
  return result.allWords.find(word => {
    return wordPosition >= word.position.start && wordPosition <= word.position.end;
  });
}

/**
 * Calcula estadísticas de las palabras extraídas
 *
 * @param result - Resultado de extracción de contexto
 * @returns Estadísticas de las palabras
 */
export function calculateWordStats(result: ContextExtractionResult): {
  totalWords: number;
  uniqueLemmas: number;
  byPOS: Record<POSType, number>;
  avgConfidence: number;
  avgWordsPerSentence: number;
} {
  const uniqueLemmas = new Set(result.allWords.map(w => normalizeWord(w.lemma))).size;
  const byPOS = groupWordsByPOS(result.allWords);
  const totalConfidence = result.allWords.reduce((sum, w) => sum + w.confidence, 0);
  const avgConfidence = result.allWords.length > 0 ? totalConfidence / result.allWords.length : 0;

  return {
    totalWords: result.allWords.length,
    uniqueLemmas,
    byPOS: {
      noun: byPOS.noun.length,
      verb: byPOS.verb.length,
      adverb: byPOS.adverb.length,
      adjective: byPOS.adjective.length,
      other: byPOS.other.length,
    },
    avgConfidence,
    avgWordsPerSentence: result.sentences.length > 0
      ? result.allWords.length / result.sentences.length
      : 0,
  };
}

/**
 * Fallback a extracción simple si el servicio principal falla
 *
 * @param text - Texto a analizar
 * @param language - Idioma del texto
 * @returns ContextExtractionResult básico
 */
export function extractWordsWithContextFallback(
  text: string,
  language: string = DEFAULT_LANGUAGE
): ContextExtractionResult {
  // Dividir en oraciones de forma simple
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length >= MIN_SENTENCE_LENGTH);

  const allWords: WordWithContext[] = [];
  const processedSentences: SentenceContext[] = [];

  let positionOffset = 0;

  for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
    const sentenceText = sentences[sentenceIndex].trim();
    const sentenceStart = positionOffset;
    const sentenceEnd = sentenceStart + sentenceText.length;

    // Dividir en palabras
    const words = sentenceText.split(/\s+/).filter(w => w.length >= MIN_WORD_LENGTH);
    const sentenceWords: WordWithContext[] = [];

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      const normalized = normalizeWord(word);
      const wordStart = sentenceText.indexOf(word, sentenceWords.length > 0
        ? sentenceText.indexOf(sentenceWords[sentenceWords.length - 1].word)
          + sentenceWords[sentenceWords.length - 1].word.length
        : 0);

      const wordWithContext: WordWithContext = {
        id: generateWordId(word, {
          sentence: sentenceIndex,
          word: wordIndex,
          start: sentenceStart + wordStart,
          end: sentenceStart + wordStart + word.length,
        }),
        word,
        lemma: normalized,
        pos: 'noun', // Default en fallback
        sentence: sentenceText,
        position: {
          sentence: sentenceIndex,
          word: wordIndex,
          start: sentenceStart + wordStart,
          end: sentenceStart + wordStart + word.length,
        },
        confidence: 0.5, // Baja confianza en fallback
      };

      sentenceWords.push(wordWithContext);
      allWords.push(wordWithContext);
    }

    if (sentenceWords.length > 0) {
      processedSentences.push({
        id: generateSentenceId(sentenceText, { start: sentenceStart, end: sentenceEnd }),
        text: sentenceText,
        words: sentenceWords,
        position: { start: sentenceStart, end: sentenceEnd },
        wordCount: sentenceWords.length,
      });
    }

    positionOffset = sentenceEnd + 1; // +1 por el delimitador
  }

  return {
    sentences: processedSentences,
    allWords,
    fullText: text,
    language,
    metadata: {
      totalSentences: processedSentences.length,
      totalWords: allWords.length,
      processingTimeMs: 0,
    },
  };
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type { WordWithContext, SentenceContext, ContextExtractionResult } from '@/types/word';
