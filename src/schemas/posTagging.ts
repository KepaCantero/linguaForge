/**
 * POS Tagging Schemas
 * Schemas Zod para etiquetado gramatical de partes del discurso (POS tagging)
 */

import { z } from 'zod';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

export const POSTypeSchema = z.enum(['noun', 'verb', 'adverb', 'adjective', 'other']);
export const LanguageCodeSchema = z.enum(['fr', 'en', 'es', 'de', 'it']);

// ============================================================
// TAGGED WORD
// ============================================================

/**
 * Palabra etiquetada con su categoría gramatical
 */
export const TaggedWordSchema = z.object({
  word: z.string().min(1).describe('Palabra original del texto'),
  lemma: z.string().min(1).describe('Forma base o lematizada de la palabra'),
  pos: POSTypeSchema.describe('Parte del discurso (noun, verb, etc.)'),
  confidence: z.number().min(0).max(1).default(0.8).describe('Nivel de confianza del etiquetado (0-1)'),
  position: z.number().int().min(0).describe('Posición de la palabra en el texto'),
});

// ============================================================
// GRAMMATICAL CATEGORIES
// ============================================================

/**
 * Categorías gramaticales extraídas del texto
 */
export const GrammaticalCategoriesSchema = z.object({
  nouns: z.array(TaggedWordSchema).describe('Lista de nombres/sustantivos encontrados'),
  verbs: z.array(TaggedWordSchema).describe('Lista de verbos encontrados'),
  adverbs: z.array(TaggedWordSchema).describe('Lista de adverbios encontrados'),
  adjectives: z.array(TaggedWordSchema).describe('Lista de adjetivos encontrados'),
});

// ============================================================
// EXTRACTION RESULT
// ============================================================

/**
 * Resultado completo del análisis POS tagging
 */
export const ExtractionResultSchema = z.object({
  nouns: z.array(TaggedWordSchema),
  verbs: z.array(TaggedWordSchema),
  adverbs: z.array(TaggedWordSchema),
  adjectives: z.array(TaggedWordSchema),
  fullText: z.string().describe('Texto original analizado'),
  language: LanguageCodeSchema.default('fr').describe('Idioma del texto'),
  metadata: z.object({
    totalWords: z.number().int().min(0).describe('Total de palabras analizadas'),
    taggedWords: z.number().int().min(0).describe('Total de palabras etiquetadas'),
    processingTimeMs: z.number().min(0).describe('Tiempo de procesamiento en milisegundos'),
  }).optional(),
});

// ============================================================
// TYPE INFERENCE
// ============================================================

export type POSType = z.infer<typeof POSTypeSchema>;
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type TaggedWord = z.infer<typeof TaggedWordSchema>;
export type GrammaticalCategories = z.infer<typeof GrammaticalCategoriesSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
