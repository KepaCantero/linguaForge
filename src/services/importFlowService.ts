/**
 * Import Flow Service
 * Business logic for the import workflow
 * Isolates phrase extraction and validation logic from UI components
 */

import {
  extractGrammaticalCategories,
  getCategoryStats,
  extractGrammaticalCategoriesFallback,
  type TaggedWord,
} from '@/services/posTaggingService';
import type { ExtractionResult, LanguageCode, POSType } from '@/schemas/posTagging';
import type { SupportedLanguage } from '@/lib/constants';
import { getLanguageConfig } from '@/lib/languageConfig';
import type { Phrase } from '@/types';
import { DEFAULT_LANGUAGE } from '@/config/languages';
import {
  getPOSPriorities,
  getMinConfidence,
  getMaxPhrasesPerImport,
  getMinSentenceLength,
  getMaxPhraseLength,
} from '@/config/inputConfig';

// ============================================================
// TYPES
// ============================================================

export interface ExtractedPhrasesResult {
  phrases: string[];
  suggestedTitle: string;
}

export interface ClozeExercise {
  id: string;
  phraseIndex: number;
  phraseText: string; // Texto original de la frase
  type: 'cloze';
  question: string; // La frase con la palabra oculta
  answer: string; // La palabra correcta
  hint: string; // Pista (tipo gramatical)
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[]; // Opciones incorrectas para el test
  posType?: POSType; // Tipo gramatical de la respuesta
}

export interface GenerateClozeExercisesOptions {
  maxExercisesPerPhrase?: number;
  minConfidence?: number;
  language?: SupportedLanguage;
  prioritizePOSTypes?: POSType[];
  precomputedAnalyses?: ExtractionResult[];
  minContextLength?: number;
}

// ============================================================
// CONSTANTES
// ============================================================

// Use centralized POS priorities from inputConfig (accessed via getter function)

/**
 * Extract phrases from text content
 * Splits by sentence delimiters and filters by length
 * Uses centralized configuration from inputConfig
 *
 * @param text - The text content to extract phrases from
 * @param maxPhrases - Maximum number of phrases to extract (uses config default if not provided)
 * @returns Array of extracted phrases
 */
export function extractPhrases(text: string, maxPhrases?: number): string[] {
  const effectiveMaxPhrases = maxPhrases ?? getMaxPhrasesPerImport();
  const minSentenceLength = getMinSentenceLength();
  const maxPhraseLength = getMaxPhraseLength();

  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= minSentenceLength && s.length <= maxPhraseLength)
    .slice(0, effectiveMaxPhrases);
}

/**
 * Analyze content and extract phrases with suggested title
 *
 * @param content - The content to analyze
 * @returns Extracted phrases result with phrases and suggested title
 */
export function analyzeContent(content: string): ExtractedPhrasesResult {
  const phrases = extractPhrases(content);
  const suggestedTitle = generateSuggestedTitle(content);
  return { phrases, suggestedTitle };
}

/**
 * Generate a suggested title from content
 * Uses the first few words of the content
 *
 * @param content - The content to generate title from
 * @returns Suggested title
 */
export function generateSuggestedTitle(content: string): string {
  const suggestedTitle = content.substring(0, 50).split(' ').slice(0, 5).join(' ');
  return suggestedTitle + '...';
}

/**
 * Calculate word count from text
 *
 * @param text - The text to count words in
 * @returns Number of words
 */
export function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate phrase count from text
 *
 * @param text - The text to count phrases in
 * @returns Number of detected phrases
 */
export function calculatePhraseCount(text: string): number {
  return extractPhrases(text).length;
}

/**
 * Validate if content is sufficient for analysis
 * Uses centralized configuration from inputConfig
 *
 * @param content - The content to validate
 * @param minLength - Minimum content length (uses config default if not provided)
 * @returns True if content is valid for analysis
 */
export function isValidContent(content: string, minLength?: number): boolean {
  const effectiveMinLength = minLength ?? getMinSentenceLength();
  return content.trim().length >= effectiveMinLength;
}

/**
 * Validate YouTube URL format
 *
 * @param url - The URL to validate
 * @returns True if URL appears to be a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Extract grammatical categories from text
 * Attempts to extract nouns, verbs, adverbs, and adjectives
 *
 * @param text - The text to analyze
 * @param language - The language code (default: DEFAULT_LANGUAGE)
 * @returns ExtractionResult with categorized words
 */
export function extractGrammaticalCategoriesFromText(
  text: string,
  language: LanguageCode = DEFAULT_LANGUAGE
): ExtractionResult {
  try {
    return extractGrammaticalCategories(text, language);
  } catch (error) {
    // Fallback to basic analysis if the main service fails
    console.warn('POS tagging service failed, using fallback:', error);
    return extractGrammaticalCategoriesFallback(text, language);
  }
}

/**
 * Get grammatical category statistics from text
 * Provides counts for each part of speech
 *
 * @param text - The text to analyze
 * @param language - The language code (default: DEFAULT_LANGUAGE)
 * @returns Object with counts for each category
 */
export function getGrammaticalCategoryStats(
  text: string,
  language: LanguageCode = DEFAULT_LANGUAGE
): ReturnType<typeof getCategoryStats> {
  try {
    const result = extractGrammaticalCategories(text, language);
    return getCategoryStats(result);
  } catch (error) {
    console.warn('Failed to get category stats:', error);
    return {
      nouns: 0,
      verbs: 0,
      adverbs: 0,
      adjectives: 0,
      total: 0,
      byType: {
        noun: 0,
        verb: 0,
        adverb: 0,
        adjective: 0,
      },
    };
  }
}

// ============================================================
// VALIDACIÓN DE CONTEXTO ORACIONAL
// ============================================================

/**
 * Validates that a sentence has sufficient context for cloze exercises
 * Ensures sentences meet minimum length requirements for meaningful exercises
 *
 * @param sentence - The sentence to validate
 * @param minLength - Minimum required length (default: 50 characters)
 * @returns true if sentence has sufficient context
 */
export function validateSentenceContext(
  sentence: string,
  minLength: number = 50
): boolean {
  const trimmedLength = sentence.trim().length;
  return trimmedLength >= minLength;
}

/**
 * Filter sentences by minimum context length
 * Removes sentences that are too short for meaningful cloze exercises
 *
 * @param sentences - Array of sentences to filter
 * @param minLength - Minimum required length (default: 50 characters)
 * @returns Array of sentences with sufficient context
 */
export function filterSentencesByContext(
  sentences: string[],
  minLength: number = 50
): string[] {
  return sentences.filter(sentence => validateSentenceContext(sentence, minLength));
}


// ============================================================
// GENERACIÓN DE EJERCICIOS CLOZE
// ============================================================

/**
 * Genera ejercicios cloze a partir de frases usando POS tagging
 * Detecta automáticamente candidatos (verbos, adjetivos, sustantivos) y genera ejercicios
 *
 * Performance optimization: Accepts precomputed analyses to avoid re-analyzing phrases
 *
 * @param phrases - Array de frases en el idioma de aprendizaje
 * @param options - Opciones de configuración
 * @returns Array de ejercicios cloze generados
 */
export function generateClozeExercises(
  phrases: string[],
  options: GenerateClozeExercisesOptions = {}
): ClozeExercise[] {
  const {
    maxExercisesPerPhrase = 2,
    minConfidence,
    language = DEFAULT_LANGUAGE,
    prioritizePOSTypes,
    precomputedAnalyses,
    minContextLength = 50,
  } = options;

  // Use centralized configuration for defaults
  const level = options.language || 'intermediate';
  const effectiveMinConfidence = minConfidence ?? getMinConfidence(level);
  const effectivePrioritizePOSTypes = prioritizePOSTypes ?? getPOSPriorities(level);

  if (!phrases || phrases.length === 0) {
    return [];
  }

  // Filter phrases by minimum context length (50 characters default)
  const validPhrases = filterSentencesByContext(phrases, minContextLength);

  if (validPhrases.length === 0) {
    return [];
  }

  const config = getLanguageConfig(language);
  const exercises: ClozeExercise[] = [];
  let exerciseIdCounter = 0;

  // Analizar cada frase
  for (let phraseIndex = 0; phraseIndex < validPhrases.length; phraseIndex++) {
    const phrase = validPhrases[phraseIndex];
    const phraseExercisesCount = exercises.filter(
      e => e.phraseIndex === phraseIndex
    ).length;

    if (phraseExercisesCount >= maxExercisesPerPhrase) {
      continue;
    }

    try {
      // Use precomputed analysis if available, otherwise analyze the phrase
      let extractionResult: ExtractionResult;

      if (precomputedAnalyses && precomputedAnalyses[phraseIndex]) {
        extractionResult = precomputedAnalyses[phraseIndex];
      } else {
        // Extraer categorías gramaticales de la frase
        extractionResult = extractGrammaticalCategories(phrase, language as LanguageCode);
      }

      // Obtener palabras candidatas ordenadas por prioridad POS
      const candidates = getClozeCandidates(
        extractionResult,
        effectivePrioritizePOSTypes,
        effectiveMinConfidence
      );

      // Generar ejercicios para los mejores candidatos
      const remainingSlots = maxExercisesPerPhrase - phraseExercisesCount;
      const selectedCandidates = candidates.slice(0, remainingSlots);

      for (const candidate of selectedCandidates) {
        const exercise = createClozeExercise({
          phraseIndex,
          phrase,
          candidate,
          extractionResult,
          stopWords: config.stopWords.words,
          id: exerciseIdCounter++,
        });
        exercises.push(exercise);
      }

    } catch (error) {
      console.warn(`Failed to generate cloze exercise for phrase ${phraseIndex}:`, error);
      // Continuar con la siguiente frase
    }
  }

  return exercises;
}

/**
 * Obtiene candidatos para ejercicios cloze ordenados por prioridad
 *
 * @param extractionResult - Resultado del análisis POS
 * @param prioritizePOSTypes - Tipos gramaticales prioritarios
 * @param minConfidence - Confianza mínima requerida
 * @returns Array de palabras candidatas ordenadas
 */
function getClozeCandidates(
  extractionResult: ExtractionResult,
  prioritizePOSTypes: POSType[],
  minConfidence: number
): TaggedWord[] {
  // Recopilar todas las palabras con sus tipos
  const allWords: Array<{ word: TaggedWord; priority: number }> = [];

  for (const posType of prioritizePOSTypes) {
    const words = extractionResult[posType === 'noun' ? 'nouns' :
                   posType === 'verb' ? 'verbs' :
                   posType === 'adverb' ? 'adverbs' : 'adjectives'];

    for (const word of words) {
      if (word.confidence >= minConfidence) {
        const priorityIndex = prioritizePOSTypes.indexOf(posType);
        allWords.push({ word, priority: priorityIndex });
      }
    }
  }

  // Ordenar por prioridad y luego por confianza
  allWords.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.word.confidence - a.word.confidence;
  });

  // Retornar solo las palabras (sin metadatos de ordenamiento)
  return allWords.map(item => item.word);
}

/**
 * Parámetros para crear un ejercicio cloze
 */
interface CreateClozeExerciseParams {
  phraseIndex: number;
  phrase: string;
  candidate: TaggedWord;
  extractionResult: ExtractionResult;
  stopWords: Set<string>;
  id: number;
}

/**
 * Crea un ejercicio cloze individual
 *
 * @param params - Objeto con todos los parámetros necesarios
 * @returns Ejercicio cloze generado
 */
function createClozeExercise(params: CreateClozeExerciseParams): ClozeExercise {
  const { phraseIndex, phrase, candidate, extractionResult, stopWords, id } = params;
  const { word, lemma, pos, confidence } = candidate;

  // Crear pregunta con la palabra oculta
  const question = phrase.replace(new RegExp(`\\b${word}\\b`, 'i'), '_____');

  // Generar opciones incorrectas
  const incorrectOptions = generateIncorrectOptions(
    word,
    lemma,
    pos,
    extractionResult,
    stopWords
  );

  // Determinar dificultad basado en confianza
  const difficulty = confidence >= 0.85 ? 'easy' :
                     confidence >= 0.7 ? 'medium' : 'hard';

  // Generar pista basada en tipo gramatical
  const hint = getHintForPOSType(pos);

  return {
    id: `cloze-${Date.now()}-${id}`,
    phraseIndex,
    phraseText: phrase,
    type: 'cloze',
    question,
    answer: word,
    hint,
    difficulty,
    options: incorrectOptions,
    posType: pos,
  };
}

/**
 * Genera opciones incorrectas para el ejercicio cloze
 *
 * @param correctWord - Palabra correcta
 * @param correctLemma - Lematizada de la palabra correcta
 * @param posType - Tipo gramatical
 * @param extractionResult - Resultado del análisis POS
 * @param stopWords - Set de stop words
 * @returns Array de 3 opciones incorrectas
 */
function generateIncorrectOptions(
  correctWord: string,
  correctLemma: string,
  posType: POSType,
  extractionResult: ExtractionResult,
  _stopWords: Set<string>
): string[] {
  const options: string[] = [];

  // Obtener palabras del mismo tipo gramatical
  const sameTypeWords = extractionResult[
    posType === 'noun' ? 'nouns' :
    posType === 'verb' ? 'verbs' :
    posType === 'adverb' ? 'adverbs' : 'adjectives'
  ].filter(w => w.word !== correctWord && w.lemma !== correctLemma);

  // Seleccionar palabras aleatorias del mismo tipo
  const shuffled = [...sameTypeWords].sort(() => Math.random() - 0.5);
  options.push(...shuffled.slice(0, 3).map(w => w.word));

  // Si no hay suficientes palabras del mismo tipo, generar variaciones
  while (options.length < 3) {
    const variations = generateWordVariations(correctWord, correctLemma, posType);
    for (const variation of variations) {
      if (variation !== correctWord && !options.includes(variation)) {
        options.push(variation);
        if (options.length >= 3) break;
      }
    }
    if (options.length >= 3) break;
  }

  return options.slice(0, 3);
}

/**
 * Genera variaciones de una palabra para opciones incorrectas
 *
 * @param word - Palabra original
 * @param lemma - Lematizada
 * @param posType - Tipo gramatical
 * @returns Array de variaciones
 */
function generateWordVariations(
  word: string,
  lemma: string,
  posType: POSType
): string[] {
  const variations: string[] = [];

  // Variaciones por sufijos comunes
  if (posType === 'verb') {
    if (!word.endsWith('er')) variations.push(lemma + 'er');
    if (!word.endsWith('ir')) variations.push(lemma + 'ir');
    if (!word.endsWith('re')) variations.push(lemma + 're');
  } else if (posType === 'noun' || posType === 'adjective') {
    if (!word.endsWith('s')) variations.push(word + 's');
    if (!word.endsWith('e')) variations.push(word + 'e');
  }

  // Invertir la palabra como última variación
  variations.push(word.split('').reverse().join(''));

  return variations;
}

/**
 * Genera una pista (hint) basada en el tipo gramatical
 *
 * @param posType - Tipo gramatical
 * @returns Pista en español
 */
function getHintForPOSType(posType: POSType): string {
  const hints: Record<POSType, string> = {
    verb: 'Verbo conjugado',
    noun: 'Sustantivo',
    adjective: 'Adjetivo',
    adverb: 'Adverbio',
    other: 'Palabra',
  };
  return hints[posType] || hints.other;
}

// ============================================================
// ADAPTER PARA COMPATIBILIDAD CON EJERCICIOS EXISTENTES
// ============================================================

/**
 * Convierte un ClozeExercise del servicio importFlow al tipo Phrase esperado por componentes
 * Mantiene compatibilidad con el sistema de ejercicios existente
 *
 * @param clozeExercise - Ejercicio cloze generado por importFlowService
 * @returns Phrase compatible con componentes de ejercicios
 */
export function clozeExerciseToPhrase(clozeExercise: ClozeExercise): Phrase {
  return {
    id: clozeExercise.id,
    text: clozeExercise.phraseText,
    translation: '', // Se puede completar posteriormente con servicio de traducción
    audioUrl: undefined,
    clozeWord: clozeExercise.answer,
    clozeOptions: [
      { id: 'correct', text: clozeExercise.answer, isCorrect: true },
      ...clozeExercise.options.map((opt, index) => ({
        id: `incorrect-${index}`,
        text: opt,
        isCorrect: false,
      })),
    ].slice(0, 4), // Asegurar máximo 4 opciones
    variations: [],
  };
}

/**
 * Genera ejercicios cloze y los adapta al formato Phrase
 * Combina la generación avanzada con POS tagging y el formato de componentes
 *
 * @param phrases - Array de frases en el idioma de aprendizaje
 * @param options - Opciones de configuración para generación
 * @returns Array de Phrase compatible con componentes de ejercicios
 */
export function generateAndAdaptClozeExercises(
  phrases: string[],
  options: GenerateClozeExercisesOptions = {}
): Phrase[] {
  const clozeExercises = generateClozeExercises(phrases, options);
  return clozeExercises.map(clozeExerciseToPhrase);
}
