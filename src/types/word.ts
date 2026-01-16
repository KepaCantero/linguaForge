/**
 * Word Types
 * Tipos para palabras con contexto de oración completa
 * Compatible con POS Tagging Service y Zod schemas
 */

import { z } from 'zod';
import type { POSType } from '@/schemas/posTagging';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

export const PunctuationMarks = ['.', '!', '?', ';', ':', ',', '...', '—', '–'] as const;
export const QuoteMarks = ['"', '"', '\'', '\'', '«', '»'] as const;

// ============================================================
// WORD POSITION IN SENTENCE
// ============================================================

/**
 * Posición de una palabra dentro de una oración
 */
export const WordPositionInSentenceSchema = z.object({
  sentence: z.number().int().min(0).describe('Índice de la oración en el texto'),
  word: z.number().int().min(0).describe('Índice de la palabra en la oración'),
  start: z.number().int().min(0).describe('Posición de inicio en el texto original'),
  end: z.number().int().min(0).describe('Posición final en el texto original'),
});

export type WordPositionInSentence = z.infer<typeof WordPositionInSentenceSchema>;

// ============================================================
// WORD WITH CONTEXT
// ============================================================

/**
 * Palabra individual con contexto de oración completa
 */
export const WordWithContextSchema = z.object({
  id: z.string().uuid().describe('ID único de la palabra'),
  word: z.string().min(1).describe('Palabra original tal como aparece en el texto'),
  lemma: z.string().min(1).describe('Forma base o lematizada de la palabra'),
  pos: z.custom<POSType>().describe('Parte del discurso (noun, verb, adverb, adjective)'),
  sentence: z.string().min(1).describe('Oración completa donde aparece la palabra'),
  position: WordPositionInSentenceSchema.describe('Posición de la palabra en el texto'),
  confidence: z.number().min(0).max(1).default(0.8).describe('Confianza del análisis POS (0-1)'),
});

export type WordWithContext = z.infer<typeof WordWithContextSchema>;

// ============================================================
// SENTENCE CONTEXT
// ============================================================

/**
 * Oración completa con todas sus palabras analizadas
 */
export const SentenceContextSchema = z.object({
  id: z.string().uuid().describe('ID único de la oración'),
  text: z.string().min(1).describe('Texto completo de la oración'),
  words: z.array(WordWithContextSchema).describe('Palabras analizadas en esta oración'),
  position: z.object({
    start: z.number().int().min(0).describe('Posición de inicio en el texto original'),
    end: z.number().int().min(0).describe('Posición final en el texto original'),
  }).describe('Posición de la oración en el texto'),
  wordCount: z.number().int().min(1).describe('Cantidad de palabras en la oración'),
});

export type SentenceContext = z.infer<typeof SentenceContextSchema>;

// ============================================================
// CONTEXT EXTRACTION RESULT
// ============================================================

/**
 * Resultado completo de extracción de contexto
 */
export const ContextExtractionResultSchema = z.object({
  sentences: z.array(SentenceContextSchema).describe('Oraciones extraídas con contexto'),
  allWords: z.array(WordWithContextSchema).describe('Todas las palabras con contexto'),
  fullText: z.string().describe('Texto original completo'),
  language: z.string().default('fr').describe('Idioma del texto (ISO 639-1)'),
  metadata: z.object({
    totalSentences: z.number().int().min(0).describe('Total de oraciones'),
    totalWords: z.number().int().min(0).describe('Total de palabras'),
    processingTimeMs: z.number().min(0).describe('Tiempo de procesamiento en ms'),
  }).optional(),
});

export type ContextExtractionResult = z.infer<typeof ContextExtractionResultSchema>;

// ============================================================
// SELECTION CONTEXT
// ============================================================

/**
 * Contexto de selección de palabras por el usuario
 */
export const WordSelectionContextSchema = z.object({
  word: WordWithContextSchema.describe('Palabra seleccionada'),
  isSelected: z.boolean().default(false).describe('Si la palabra está actualmente seleccionada'),
  isStudied: z.boolean().default(false).describe('Si la palabra ya está estudiada'),
  translation: z.string().optional().describe('Traducción de la palabra (opcional)'),
  isTranslating: z.boolean().default(false).describe('Si se está traduciendo actualmente'),
});

export type WordSelectionContext = z.infer<typeof WordSelectionContextSchema>;

// ============================================================
// CLOZE GENERATION CONTEXT
// ============================================================

/**
 * Contexto para generación de ejercicios cloze
 */
export const ClozeGenerationContextSchema = z.object({
  targetWord: WordWithContextSchema.describe('Palabra objetivo a ocultar'),
  sentenceContext: SentenceContextSchema.describe('Oración completa de contexto'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('Nivel de dificultad'),
  hintType: z.enum(['translation', 'first_letter', 'pos', 'none']).optional().describe('Tipo de pista'),
  options: z.array(z.string()).optional().describe('Opciones de respuesta para múltiple choice'),
});

export type ClozeGenerationContext = z.infer<typeof ClozeGenerationContextSchema>;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Genera un ID único para una palabra con contexto
 */
export function generateWordId(word: string, position: WordPositionInSentence): string {
  const data = `${word}-${position.sentence}-${position.word}-${position.start}-${position.end}`;
  // Simple hash function para generar ID consistente
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `word-${Math.abs(hash)}`;
}

/**
 * Genera un ID único para una oración
 */
export function generateSentenceId(text: string, position: { start: number; end: number }): string {
  const data = `${text.substring(0, 50)}-${position.start}-${position.end}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sentence-${Math.abs(hash)}`;
}

/**
 * Verifica si una posición está dentro de una oración
 */
export function isPositionInSentence(
  position: number,
  sentence: SentenceContext
): boolean {
  return position >= sentence.position.start && position <= sentence.position.end;
}

/**
 * Encuentra la oración que contiene una posición dada
 */
export function findSentenceAtPosition(
  position: number,
  sentences: SentenceContext[]
): SentenceContext | undefined {
  return sentences.find(sentence => isPositionInSentence(position, sentence));
}

/**
 * Calcula la distancia entre dos palabras en el texto
 */
export function calculateWordDistance(
  word1: WordWithContext,
  word2: WordWithContext
): number {
  return Math.abs(word1.position.start - word2.position.start);
}

/**
 * Verifica si dos palabras están en la misma oración
 */
export function areWordsInSameSentence(
  word1: WordWithContext,
  word2: WordWithContext
): boolean {
  return word1.position.sentence === word2.position.sentence;
}
