/**
 * Cloze Exercise Service
 * Servicio especializado para crear ejercicios cloze con formato verdadero
 * (oración completa con palabra objetivo oculta, no solo la palabra)
 */

import type { POSType } from '@/schemas/posTagging';
import type { LanguageCode } from '@/schemas/posTagging';
import {
  extractGrammaticalCategories,
  type TaggedWord,
} from './posTaggingService';
import type { ClozeExercise, GenerateClozeExercisesOptions } from './importFlowService';

// ============================================================
// TYPES
// ============================================================

export interface TargetWord {
  word: string;
  lemma: string;
  pos: POSType;
  index: number; // Posición de la palabra en la oración
  confidence: number;
}

export interface ClozeContext {
  sentence: string; // Oración completa
  targetWord: TargetWord; // Palabra objetivo con su posición
  language: LanguageCode;
}

export interface ManualClozeSubtopic {
  phrases: string[]; // Array con una oración completa
  targetWordIndices?: number[][]; // Índices de palabras objetivo en cada frase
  language?: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const BLANK_PLACEHOLDER = '_____';
const DEFAULT_INCORRECT_OPTIONS_COUNT = 3;

// ============================================================
// SERVICIOS
// ============================================================

/**
 * Crea un contexto cloze desde una oración y una palabra objetivo
 *
 * @param sentence - Oración completa
 * @param targetWord - Palabra objetivo con su índice
 * @param language - Idioma del texto
 * @returns Contexto cloze validado
 */
export function createClozeContext(
  sentence: string,
  targetWord: TargetWord,
  language: LanguageCode = 'fr'
): ClozeContext {
  return {
    sentence: sentence.trim(),
    targetWord,
    language,
  };
}

/**
 * Genera un ejercicio cloze desde un contexto cloze
 * Mantiene la oración completa y reemplaza la palabra objetivo con un espacio en blanco
 *
 * @param context - Contexto cloze con oración y palabra objetivo
 * @param id - ID único para el ejercicio
 * @returns Ejercicio cloze completo
 */
export function generateClozeFromContext(
  context: ClozeContext,
  id: string | number
): ClozeExercise {
  const { sentence, targetWord, language } = context;

  // Validar que el índice de la palabra esté dentro de los límites
  const words = sentence.split(/\s+/);
  if (targetWord.index < 0 || targetWord.index >= words.length) {
    throw new Error(
      `Invalid word index: ${targetWord.index}. Sentence has ${words.length} words.`
    );
  }

  // Crear la pregunta reemplazando la palabra objetivo con el espacio en blanco
  const questionParts = [...words];
  questionParts[targetWord.index] = BLANK_PLACEHOLDER;
  const question = questionParts.join(' ');

  // Extraer categorías gramaticales para generar opciones incorrectas
  const grammaticalAnalysis = extractGrammaticalCategories(sentence, language);

  // Generar opciones incorrectas del mismo tipo gramatical
  const incorrectOptions = generateIncorrectOptionsForWord(
    targetWord,
    grammaticalAnalysis
  );

  // Determinar dificultad basado en confianza
  const difficulty: 'easy' | 'medium' | 'hard' =
    targetWord.confidence >= 0.85 ? 'easy' :
    targetWord.confidence >= 0.7 ? 'medium' : 'hard';

  // Generar pista basada en tipo gramatical
  const hint = getHintForPOSType(targetWord.pos);

  return {
    id: typeof id === 'number' ? `cloze-${Date.now()}-${id}` : id,
    phraseIndex: 0, // Para cloze manual, siempre es 0
    phraseText: sentence, // ORACIÓN COMPLETA
    type: 'cloze',
    question, // Oración con espacio en blanco
    answer: targetWord.word, // Palabra correcta
    hint,
    difficulty,
    options: incorrectOptions,
    posType: targetWord.pos,
  };
}

/**
 * Genera múltiples ejercicios cloze desde un subtópico manual
 * Detecta automáticamente los índices de palabras objetivo si no se proporcionan
 *
 * @param subtopic - Subtópico con oraciones completas
 * @param options - Opciones de generación
 * @returns Array de ejercicios cloze
 */
export function generateClozeExercisesFromManualSubtopic(
  subtopic: ManualClozeSubtopic,
  options: GenerateClozeExercisesOptions = {}
): ClozeExercise[] {
  const {
    maxExercisesPerPhrase = 1,
    minConfidence = 0.6,
    language = 'fr',
    prioritizePOSTypes = ['verb', 'adjective', 'noun', 'adverb'],
  } = options;

  if (!subtopic.phrases || subtopic.phrases.length === 0) {
    return [];
  }

  const exercises: ClozeExercise[] = [];
  let exerciseIdCounter = 0;

  // Para cada oración en el subtópico
  for (let phraseIndex = 0; phraseIndex < subtopic.phrases.length; phraseIndex++) {
    const phrase = subtopic.phrases[phraseIndex];

    if (!phrase || phrase.trim().length === 0) {
      continue;
    }

    try {
      // Analizar gramática de la oración
      const grammaticalAnalysis = extractGrammaticalCategories(phrase, language as LanguageCode);

      // Obtener palabras objetivo (usar índices proporcionados o detectar automáticamente)
      const targetWords = subtopic.targetWordIndices?.[phraseIndex]
        ? // Usar índices proporcionados
          getTargetWordsFromIndices(
            phrase,
            subtopic.targetWordIndices[phraseIndex],
            grammaticalAnalysis
          )
        : // Detectar automáticamente las mejores palabras
          detectTargetWords(
            phrase,
            grammaticalAnalysis,
            prioritizePOSTypes,
            minConfidence,
            maxExercisesPerPhrase
          );

      // Generar ejercicios para cada palabra objetivo
      for (const targetWord of targetWords) {
        const context = createClozeContext(phrase, targetWord, language as LanguageCode);
        const exercise = generateClozeFromContext(context, exerciseIdCounter++);
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
 * Detecta automáticamente las mejores palabras objetivo en una oración
 *
 * @param sentence - Oración a analizar
 * @param grammaticalAnalysis - Análisis gramatical de la oración
 * @param prioritizePOSTypes - Tipos gramaticales prioritarios
 * @param minConfidence - Confianza mínima requerida
 * @param maxTargets - Máximo número de palabras a detectar
 * @returns Array de palabras objetivo detectadas
 */
function detectTargetWords(
  sentence: string,
  grammaticalAnalysis: ReturnType<typeof extractGrammaticalCategories>,
  prioritizePOSTypes: POSType[],
  minConfidence: number,
  maxTargets: number
): TargetWord[] {
  const candidates: Array<{ word: TargetWord; priority: number }> = [];

  // Recopilar todas las palabras con sus tipos
  for (const posType of prioritizePOSTypes) {
    const typeWords = grammaticalAnalysis[
      posType === 'noun' ? 'nouns' :
      posType === 'verb' ? 'verbs' :
      posType === 'adverb' ? 'adverbs' : 'adjectives'
    ];

    for (const taggedWord of typeWords) {
      if (taggedWord.confidence >= minConfidence) {
        // Encontrar el índice de la palabra en la oración
        const wordIndex = findWordIndexInSentence(sentence, taggedWord.word);

        if (wordIndex !== -1) {
          const targetWord: TargetWord = {
            word: taggedWord.word,
            lemma: taggedWord.lemma,
            pos: taggedWord.pos,
            index: wordIndex,
            confidence: taggedWord.confidence,
          };

          const priorityIndex = prioritizePOSTypes.indexOf(posType);
          candidates.push({ word: targetWord, priority: priorityIndex });
        }
      }
    }
  }

  // Ordenar por prioridad y luego por confianza
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.word.confidence - a.word.confidence;
  });

  // Retornar las mejores palabras (sin duplicados por lemma)
  const seenLemmas = new Set<string>();
  const uniqueTargets: TargetWord[] = [];

  for (const candidate of candidates) {
    const normalizedLemma = candidate.word.lemma.toLowerCase();
    if (!seenLemmas.has(normalizedLemma)) {
      seenLemmas.add(normalizedLemma);
      uniqueTargets.push(candidate.word);
      if (uniqueTargets.length >= maxTargets) {
        break;
      }
    }
  }

  return uniqueTargets;
}

/**
 * Obtiene palabras objetivo desde índices proporcionados
 *
 * @param sentence - Oración completa
 * @param indices - Índices de palabras objetivo
 * @param grammaticalAnalysis - Análisis gramatical
 * @returns Array de palabras objetivo
 */
function getTargetWordsFromIndices(
  sentence: string,
  indices: number[],
  grammaticalAnalysis: ReturnType<typeof extractGrammaticalCategories>
): TargetWord[] {
  const words = sentence.split(/\s+/);
  const targetWords: TargetWord[] = [];

  for (const index of indices) {
    if (index < 0 || index >= words.length) {
      console.warn(`Invalid word index: ${index}. Skipping.`);
      continue;
    }

    const word = words[index];

    // Buscar información gramatical de la palabra
    const taggedWord = findTaggedWordInAnalysis(word, grammaticalAnalysis);

    targetWords.push({
      word,
      lemma: taggedWord?.lemma || word.toLowerCase(),
      pos: taggedWord?.pos || 'noun',
      index,
      confidence: taggedWord?.confidence || 0.5,
    });
  }

  return targetWords;
}

/**
 * Busca una palabra en el análisis gramatical
 *
 * @param word - Palabra a buscar
 * @param analysis - Análisis gramatical
 * @returns Palabra etiquetada o undefined
 */
function findTaggedWordInAnalysis(
  word: string,
  analysis: ReturnType<typeof extractGrammaticalCategories>
): TaggedWord | undefined {
  const allWords = [
    ...analysis.verbs,
    ...analysis.nouns,
    ...analysis.adverbs,
    ...analysis.adjectives,
  ];

  return allWords.find(
    w => w.word === word || w.word.toLowerCase() === word.toLowerCase()
  );
}

/**
 * Encuentra el índice de una palabra en una oración
 *
 * @param sentence - Oración completa
 * @param word - Palabra a buscar
 * @returns Índice de la palabra o -1 si no se encuentra
 */
function findWordIndexInSentence(sentence: string, word: string): number {
  const words = sentence.split(/\s+/);
  const lowerWord = word.toLowerCase();

  for (let i = 0; i < words.length; i++) {
    if (words[i].toLowerCase() === lowerWord || words[i] === word) {
      return i;
    }
  }

  return -1;
}

/**
 * Genera opciones incorrectas para una palabra objetivo
 *
 * @param targetWord - Palabra objetivo
 * @param grammaticalAnalysis - Análisis gramatical
 * @returns Array de 3 opciones incorrectas
 */
function generateIncorrectOptionsForWord(
  targetWord: TargetWord,
  grammaticalAnalysis: ReturnType<typeof extractGrammaticalCategories>
): string[] {
  const options: string[] = [];

  // Obtener palabras del mismo tipo gramatical
  const sameTypeWords = grammaticalAnalysis[
    targetWord.pos === 'noun' ? 'nouns' :
    targetWord.pos === 'verb' ? 'verbs' :
    targetWord.pos === 'adverb' ? 'adverbs' : 'adjectives'
  ].filter(
    w => w.word !== targetWord.word && w.lemma !== targetWord.lemma
  );

  // Seleccionar palabras aleatorias del mismo tipo
  const shuffled = [...sameTypeWords].sort(() => Math.random() - 0.5);
  options.push(...shuffled.slice(0, DEFAULT_INCORRECT_OPTIONS_COUNT).map(w => w.word));

  // Si no hay suficientes palabras del mismo tipo, generar variaciones
  while (options.length < DEFAULT_INCORRECT_OPTIONS_COUNT) {
    const variations = generateWordVariations(
      targetWord.word,
      targetWord.lemma,
      targetWord.pos
    );
    for (const variation of variations) {
      if (variation !== targetWord.word && !options.includes(variation)) {
        options.push(variation);
        if (options.length >= DEFAULT_INCORRECT_OPTIONS_COUNT) {
          break;
        }
      }
    }
    if (options.length >= DEFAULT_INCORRECT_OPTIONS_COUNT) {
      break;
    }
  }

  return options.slice(0, DEFAULT_INCORRECT_OPTIONS_COUNT);
}

/**
 * Genera variaciones de una palabra para opciones incorrectas
 *
 * @param word - Palabra original
 * @param lemma - Lema de la palabra
 * @param posType - Tipo gramatical
 * @returns Array de variaciones
 */
function generateWordVariations(
  word: string,
  lemma: string,
  posType: POSType
): string[] {
  const variations: string[] = [];

  // Variaciones por sufijos comunes en francés
  if (posType === 'verb') {
    if (!word.endsWith('er')) {
      variations.push(lemma + 'er');
    }
    if (!word.endsWith('ir')) {
      variations.push(lemma + 'ir');
    }
    if (!word.endsWith('re')) {
      variations.push(lemma + 're');
    }
  } else if (posType === 'noun' || posType === 'adjective') {
    if (!word.endsWith('s')) {
      variations.push(word + 's');
    }
    if (!word.endsWith('e')) {
      variations.push(word + 'e');
    }
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

/**
 * Valida si un subtópico tiene formato cloze manual
 *
 * @param subtopic - Subtópico a validar
 * @returns true si el subtópico tiene formato cloze manual
 */
export function isManualClozeSubtopic(subtopic: ManualClozeSubtopic): boolean {
  return (
    subtopic.targetWordIndices !== undefined &&
    subtopic.targetWordIndices.length > 0 &&
    subtopic.phrases.length === subtopic.targetWordIndices.length
  );
}

/**
 * Exporta clozeExerciseToPhrase desde importFlowService
 * Re-export para conveniencia
 */
export { clozeExerciseToPhrase } from './importFlowService';

/**
 * Extrae el índice de la palabra objetivo desde una oración con contexto
 *
 * @param sentence - Oración completa
 * @param targetWord - Palabra objetivo
 * @returns Índice de la palabra en la oración
 */
export function extractTargetWordIndex(sentence: string, targetWord: string): number {
  const words = sentence.split(/\s+/);
  const lowerTarget = targetWord.toLowerCase();

  for (let i = 0; i < words.length; i++) {
    if (words[i].toLowerCase() === lowerTarget || words[i] === targetWord) {
      return i;
    }
  }

  return -1;
}
