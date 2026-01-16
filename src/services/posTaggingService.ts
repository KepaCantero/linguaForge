/**
 * POS Tagging Service
 * Servicio mejorado para etiquetado gramatical de partes del discurso (POS tagging)
 * Soporte multi-idioma con configuración modular inyectable
 *
 * Estrategia:
 * - Usa patrones lingüísticos configurables por idioma
 * - Lematización básica para obtener la forma base
 * - Sistema de confidence scoring
 * - Fallback a análisis básico si falla el análisis avanzado
 */

import {
  TaggedWord,
  ExtractionResult,
  POSType,
  LanguageCode,
  TaggedWordSchema,
  ExtractionResultSchema,
} from '@/schemas/posTagging';
import type { LanguageConfig } from '@/config/languages';
import { getLanguageConfigSync, DEFAULT_LANGUAGE } from '@/config/languages';

// ============================================================
// FUNCIONES DE AYUDA
// ============================================================

/**
 * Normaliza una palabra: minúsculas, sin acentos, sin puntuación
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z]/g, ''); // Eliminar no-alfabéticos
}

/**
 * Verifica si una palabra termina con alguno de los sufijos dados
 */
function hasAnyEnding(word: string, endings: readonly string[]): boolean {
  return endings.some(ending => word.endsWith(ending));
}

// ============================================================
// LEMATIZACIÓN CON CONFIG INYECTADA
// ============================================================

/**
 * Lematiza un verbo según la configuración del idioma
 */
function lemmatizeVerb(word: string, config: LanguageConfig): string {
  let normalized = normalizeWord(word);

  // Quitar pronombres sujetos contraídos (j', n', t', s', etc.)
  const subjectPrefixes = ['j', 'n', 't', 's', 'd', 'l', 'c', 'qu', 'm'];
  if (normalized.length > 3) {
    for (const prefix of subjectPrefixes) {
      if (normalized.startsWith(prefix) && normalized.length > prefix.length + 2) {
        const possibleStem = normalized.slice(prefix.length);
        // Si el resto parece ser una conjugación verbal, quitar el prefijo
        if (possibleStem.endsWith('e') || possibleStem.endsWith('es') ||
            possibleStem.endsWith('ons') || possibleStem.endsWith('ez') ||
            possibleStem.endsWith('ent')) {
          normalized = possibleStem;
          break;
        }
      }
    }
  }

  // Si la palabra ya termina en el infinitivo, devolverla
  for (const ending of config.verbEndings.slice(0, 5)) { // Infinitivos
    if (normalized.endsWith(ending) && normalized.length > 3) {
      return normalized;
    }
  }

  // Verbos en -er (primer grupo) - terminaciones de presente
  // Prioridad: -ons, -ez, -ent, -es, -e
  if (normalized.endsWith('ons')) {
    const stem = normalized.slice(0, -3);
    return stem + 'er';
  }
  if (normalized.endsWith('ez')) {
    const stem = normalized.slice(0, -2);
    return stem + 'er';
  }
  if (normalized.endsWith('ent')) {
    const stem = normalized.slice(0, -3);
    return stem + 'er';
  }
  if (normalized.endsWith('es')) {
    const stem = normalized.slice(0, -2);
    return stem + 'er';
  }
  if (normalized.endsWith('e') && normalized.length > 4) {
    const stem = normalized.slice(0, -1);
    return stem + 'er';
  }

  // Verbos en -ir (segundo grupo) - terminaciones de presente
  if (normalized.endsWith('issons') || normalized.endsWith('issez')) {
    const stem = normalized.slice(0, -5);
    return stem + 'ir';
  }
  if (normalized.endsWith('issent')) {
    const stem = normalized.slice(0, -5);
    return stem + 'ir';
  }
  if (normalized.endsWith('is') || normalized.endsWith('it')) {
    const stem = normalized.slice(0, -2);
    return stem + 'ir';
  }

  // Verbos en -re (tercer grupo) - terminaciones de presente
  if (normalized.endsWith('ons') || normalized.endsWith('ez')) {
    const stem = normalized.slice(0, -3);
    return stem + 're';
  }
  if (normalized.endsWith('ent')) {
    const stem = normalized.slice(0, -3);
    return stem + 're';
  }
  if (normalized.endsWith('s') && normalized.length > 4) {
    const stem = normalized.slice(0, -1);
    return stem + 're';
  }
  if (normalized.endsWith('t') && normalized.length > 4) {
    const stem = normalized.slice(0, -1);
    return stem + 're';
  }

  // Pasados participios comunes
  if (normalized.endsWith('ée') || normalized.endsWith('és')) {
    const stem = normalized.slice(0, -3);
    return stem + 'er';
  }
  if (normalized.endsWith('é')) {
    const stem = normalized.slice(0, -2);
    return stem + 'er';
  }
  if (normalized.endsWith('ie')) {
    const stem = normalized.slice(0, -2);
    return stem + 'ir';
  }
  if (normalized.endsWith('i')) {
    const stem = normalized.slice(0, -1);
    return stem + 'ir';
  }
  if (normalized.endsWith('ue')) {
    const stem = normalized.slice(0, -2);
    return stem + 're';
  }
  if (normalized.endsWith('u')) {
    const stem = normalized.slice(0, -1);
    return stem + 're';
  }

  // Si no se puede lematizar, devolver la forma original normalizada
  return normalized;
}

/**
 * Lematiza un sustantivo (obtiene la forma singular/masculina base)
 */
function lemmatizeNoun(word: string): string {
  const normalized = normalizeWord(word);

  // Plural en -s → singular
  if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    const singular = normalized.slice(0, -1);
    return singular;
  }

  // Femenino en -e → masculino (aproximación)
  if (normalized.endsWith('e') && normalized.length > 4) {
    const masculine = normalized.slice(0, -1);
    return masculine;
  }

  return normalized;
}

/**
 * Lematiza un adverbio
 */
function lemmatizeAdverb(word: string): string {
  return normalizeWord(word);
}

/**
 * Lematiza un adjetivo
 */
function lemmatizeAdjective(word: string): string {
  const normalized = normalizeWord(word);

  // Femenino → masculino
  if (normalized.endsWith('e')) {
    return normalized.slice(0, -1);
  }

  // Plural → singular
  if (normalized.endsWith('s')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Calcula el confidence score basado en patrones detectados
 */
function calculateConfidence(word: string, pos: POSType, config: LanguageConfig): number {
  const normalized = normalizeWord(word);
  let confidence = 0.5; // Base confidence

  switch (pos) {
    case 'verb':
      // Verbos con terminaciones claras tienen más confianza
      if (hasAnyEnding(normalized, ['er', 'ir', 're'])) {
        confidence = 0.9;
      } else if (normalized.endsWith('é') || normalized.endsWith('i')) {
        confidence = 0.8;
      }
      break;

    case 'noun':
      // Palabras largas con contexto de artículo tienen más confianza
      if (normalized.length > 5) {
        confidence = 0.85;
      } else if (normalized.length > 4) {
        confidence = 0.75;
      }
      break;

    case 'adverb':
      // Adverbios con terminación característica son muy claros
      if (hasAnyEnding(normalized, config.adverbEndings)) {
        confidence = 0.95;
      }
      break;

    case 'adjective':
      // Adjetivos con terminaciones específicas
      const allAdjectiveEndings = [
        ...config.adjectiveEndings.masculine,
        ...config.adjectiveEndings.feminine,
      ];
      if (hasAnyEnding(normalized, allAdjectiveEndings)) {
        confidence = 0.9;
      } else if (config.commonAdjectives.includes(normalized)) {
        confidence = 0.85;
      }
      break;
  }

  return confidence;
}

// ============================================================
// DETECCIÓN DE TIPOS DE PALABRAS CON CONFIG INYECTADA
// ============================================================

/**
 * Detecta si una palabra es un verbo
 */
function isVerb(word: string, config: LanguageConfig, _context?: string): boolean {
  const normalized = normalizeWord(word);

  // Verificar verbos auxiliares comunes conjugados PRIMERO
  if (config.auxiliaryVerbs.includes(normalized)) {
    return true;
  }

  // Verificar si está en la lista de excepciones
  if (normalized in config.verbExceptions) {
    return config.verbExceptions[normalized] === 'verb';
  }

  // Verificar terminaciones de verbos
  if (hasAnyEnding(normalized, config.verbEndings)) {
    return true;
  }

  // Verificar conjugaciones comunes
  if (normalized.length > 4) {
    if (normalized.endsWith('ons') || normalized.endsWith('ez') || normalized.endsWith('ent')) {
      return true;
    }
    if ((normalized.endsWith('e') || normalized.endsWith('es')) && normalized.length > 4) {
      // Verificar que no sea un adjetivo común
      if (!config.commonAdjectives.includes(normalized)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extrae la palabra que precede a la palabra objetivo en un contexto
 * @param context - Texto completo donde buscar
 * @param targetWord - Palabra objetivo
 * @param targetPosition - Posición de la palabra objetivo en el contexto original (opcional)
 * @returns Palabra precedente normalizada o undefined si no hay contexto
 */
function getPrecedingWord(context: string, targetWord: string, targetPosition?: number): string | undefined {
  if (!context || !targetWord) {
    return undefined;
  }

  // Normalizar para búsqueda
  const normalizedTarget = normalizeWord(targetWord);
  const lowerContext = context.toLowerCase();

  // Encontrar TODAS las posiciones de la palabra objetivo en el contexto
  const positions: number[] = [];
  let searchFrom = 0;
  while (true) {
    const idx = lowerContext.indexOf(normalizedTarget, searchFrom);
    if (idx === -1) break;
    positions.push(idx);
    searchFrom = idx + 1;
  }

  if (positions.length === 0) {
    return undefined;
  }

  // Si se proporciona una posición, encontrar la ocurrencia más cercana
  let targetIndex: number;
  if (targetPosition !== undefined) {
    // Encontrar la posición más cercana a la posición proporcionada
    targetIndex = positions.reduce((closest, current) => {
      return Math.abs(current - targetPosition) < Math.abs(closest - targetPosition)
        ? current
        : closest;
    });
  } else {
    // Usar la primera ocurrencia
    targetIndex = positions[0];
  }

  // Extraer texto antes de la palabra objetivo
  const beforeText = lowerContext.slice(0, targetIndex);

  // Dividir en palabras y obtener la última
  const words = beforeText.split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return undefined;
  }

  // Retornar la palabra inmediatamente precedente
  const precedingWord = words[words.length - 1];

  // Normalizar y eliminar puntuación
  return normalizeWord(precedingWord);
}

/**
 * Verifica si una palabra está precedida por un artículo sustantivo
 * @param config - Configuración del idioma
 * @param context - Texto completo
 * @param targetWord - Palabra a verificar
 * @param targetPosition - Posición de la palabra objetivo (opcional)
 * @returns true si la palabra está precedida por un artículo
 */
function isPrecededByNounArticle(
  config: LanguageConfig,
  context: string,
  targetWord: string,
  targetPosition?: number
): boolean {
  const precedingWord = getPrecedingWord(context, targetWord, targetPosition);

  if (!precedingWord) {
    return false;
  }

  // Verificar si la palabra precedente es un artículo sustantivo
  return config.nounArticles.includes(precedingWord);
}

/**
 * Detecta si una palabra es un sustantivo
 * @param word - Palabra a analizar
 * @param config - Configuración del idioma
 * @param context - Texto completo para análisis contextual (opcional)
 * @param position - Posición de la palabra en el contexto (opcional)
 * @returns true si la palabra es un sustantivo
 */
function isNoun(
  word: string,
  config: LanguageConfig,
  context?: string,
  position?: number
): boolean {
  const normalized = normalizeWord(word);

  // Palabras muy cortas probablemente no son sustantivos
  if (normalized.length < 2) {
    return false;
  }

  // Sujetos importantes se tratan como sustantivos/pronombres
  if (config.importantSubjects.has(normalized)) {
    return true;
  }

  // Palabras comunes no son sustantivos
  if (config.stopWords.has(normalized)) {
    return false;
  }

  // DETECCIÓN CONTEXTUAL: Verificar si está precedida por artículo sustantivo
  if (context && isPrecededByNounArticle(config, context, word, position)) {
    return true;
  }

  // Si es un verbo claramente identificado, no es sustantivo
  // PERO: si está precedida por artículo, puede ser un sustantivo (ej: "le manger")
  if (isVerb(word, config) && !isPrecededByNounArticle(config, context || '', word, position)) {
    return false;
  }

  // Si es un adverbio claro, no es sustantivo
  if (isAdverb(word, config)) {
    return false;
  }

  // Si es un adjetivo claro, no es sustantivo
  if (isAdjective(word, config)) {
    return false;
  }

  // Palabras con mayúscula inicial (si está en contexto) suelen ser sustantivos propios
  if (context && word[0] === word[0].toUpperCase()) {
    return true;
  }

  // Sustantivos suelen tener más de 3 letras
  return normalized.length > 3;
}

/**
 * Detecta si una palabra es un adverbio
 */
function isAdverb(word: string, config: LanguageConfig): boolean {
  const normalized = normalizeWord(word);

  // Adverbios con terminación característica
  if (hasAnyEnding(normalized, config.adverbEndings)) {
    return true;
  }

  // Adverbios comunes
  return config.commonAdverbs.includes(normalized);
}

/**
 * Detecta si una palabra es un adjetivo
 */
function isAdjective(word: string, config: LanguageConfig, context?: string, position?: number): boolean {
  const normalized = normalizeWord(word);

  // Si está precedida por un artículo sustantivo, probablemente NO es un adjetivo
  // (aunque puede ser un adjetivo sustantivado, pero es menos común)
  if (context && position !== undefined) {
    const precedingWord = getPrecedingWord(context, word, position);
    if (precedingWord && config.nounArticles.includes(precedingWord)) {
      // Está precedida por un artículo, es más probable que sea un sustantivo
      // Solo retornar true si es claramente un adjetivo común
      return config.commonAdjectives.includes(normalized);
    }
  }

  // Verificar adjetivos comunes PRIMERO
  if (config.commonAdjectives.includes(normalized)) {
    return true;
  }

  // Verificar si es forma femenina de adjetivo masculino (termina en 'e')
  if (normalized.endsWith('e') && normalized.length > 4) {
    const masculine = normalized.slice(0, -1);
    if (config.commonAdjectives.includes(masculine)) {
      return true;
    }
  }

  // Verificar terminaciones masculinas
  if (normalized.length > 5 && hasAnyEnding(normalized, config.adjectiveEndings.masculine)) {
    return true;
  }

  // Verificar terminaciones femeninas
  if (normalized.length > 5 && hasAnyEnding(normalized, config.adjectiveEndings.feminine)) {
    return true;
  }

  return false;
}

/**
 * Detecta la categoría gramatical de una palabra
 */
function detectWordType(word: string, config: LanguageConfig, context?: string, position?: number): POSType {
  const normalized = normalizeWord(word);

  // Saltar palabras vacías, EXCEPTO artículos sustantivos (necesarios para detección contextual)
  const isNounArticle = config.nounArticles.includes(normalized);
  if (config.stopWords.has(normalized) && !isNounArticle) {
    return 'other';
  }

  // Orden de prioridad: adverbio > verbo > adjetivo > sustantivo
  // NOTA: La detección contextual tiene prioridad sobre las terminaciones

  if (isAdverb(word, config)) {
    return 'adverb';
  }

  if (isVerb(word, config, context)) {
    return 'verb';
  }

  if (isAdjective(word, config, context, position)) {
    return 'adjective';
  }

  if (isNoun(word, config, context, position)) {
    return 'noun';
  }

  return 'other';
}

/**
 * Lematiza una palabra según su tipo
 */
export function lemmatizeWord(word: string, pos: POSType, config: LanguageConfig): string {
  switch (pos) {
    case 'verb':
      return lemmatizeVerb(word, config);
    case 'noun':
      return lemmatizeNoun(word);
    case 'adverb':
      return lemmatizeAdverb(word);
    case 'adjective':
      return lemmatizeAdjective(word);
    default:
      return normalizeWord(word);
  }
}

// ============================================================
// FUNCIÓN PRINCIPAL DE EXTRACCIÓN CON CONFIG INYECTADA
// ============================================================

/**
 * Extrae categorías gramaticales de un texto usando configuración de idioma
 *
 * @param text - Texto a analizar
 * @param language - Idioma del texto (default: DEFAULT_LANGUAGE from config)
 * @param config - Configuración del idioma (opcional, se carga si no se proporciona)
 * @returns ExtractionResult con palabras clasificadas por tipo
 */
export function extractGrammaticalCategories(
  text: string,
  language: LanguageCode = DEFAULT_LANGUAGE,
  config?: LanguageConfig
): ExtractionResult {
  const startTime = performance.now();

  // Cargar configuración si no se proporciona
  const langConfig = config ?? getLanguageConfigSync(language);
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Validación de entrada
  if (!text || text.trim().length === 0) {
    return {
      nouns: [],
      verbs: [],
      adverbs: [],
      adjectives: [],
      fullText: text,
      language,
      metadata: {
        totalWords: 0,
        taggedWords: 0,
        processingTimeMs: 0,
      },
    };
  }

  // Dividir texto en palabras (preservando contracciones)
  const wordRegex = /[a-zA-ZàâäéèêëïîôùûüÿñçÀÂÄÉÈÊËÏÎÔÙÛÜŸÑÇ]+(?:['''][a-zA-ZàâäéèêëïîôùûüÿñçÀÂÄÉÈÊËÏÎÔÙÛÜŸÑÇ]+)?/g;
  const matches = Array.from(text.matchAll(wordRegex));

  const taggedWords: TaggedWord[] = [];
  const seen = new Set<string>(); // Para deduplicación por lemma

  for (const match of matches) {
    const word = match[0];
    const position = match.index ?? 0;

    // Normalizar para comparación
    const normalized = normalizeWord(word);

    // Filtrar palabras muy cortas
    if (normalized.length < 2) {
      continue;
    }

    // Detectar tipo de palabra (pasar posición para detección contextual)
    const pos = detectWordType(word, langConfig, text, position);

    // Si es 'other', no incluirla
    if (pos === 'other') {
      continue;
    }

    // Lematizar
    const lemma = lemmatizeWord(word, pos, langConfig);

    // Verificar duplicados por lemma
    if (seen.has(lemma)) {
      continue;
    }
    seen.add(lemma);

    // Calcular confidence
    const confidence = calculateConfidence(word, pos, langConfig);

    // Crear tagged word
    const taggedWord: TaggedWord = {
      word,
      lemma,
      pos,
      confidence,
      position,
    };

    // Validar con schema
    const validated = TaggedWordSchema.safeParse(taggedWord);
    if (validated.success) {
      taggedWords.push(validated.data);
    }
  }

  // Agrupar por categoría (filtrando artículos sustantivos que solo sirvieron para detección contextual)
  const nouns = taggedWords.filter(w => {
    if (w.pos !== 'noun') return false;
    // Excluir artículos sustantivos de los resultados
    const normalized = normalizeWord(w.word);
    return !langConfig.nounArticles.includes(normalized);
  });
  const verbs = taggedWords.filter(w => w.pos === 'verb');
  const adverbs = taggedWords.filter(w => w.pos === 'adverb');
  const adjectives = taggedWords.filter(w => w.pos === 'adjective');

  const processingTimeMs = performance.now() - startTime;

  const result: ExtractionResult = {
    nouns,
    verbs,
    adverbs,
    adjectives,
    fullText: text,
    language,
    metadata: {
      totalWords: matches.length,
      taggedWords: taggedWords.length,
      processingTimeMs,
    },
  };

  // Validar resultado completo
  const validated = ExtractionResultSchema.safeParse(result);
  if (validated.success) {
    return validated.data;
  }

  // Fallback: retornar resultado sin validar si falla la validación
  return result;
}

/**
 * Obtiene estadísticas de las categorías extraídas
 */
export function getCategoryStats(result: ExtractionResult): {
  nouns: number;
  verbs: number;
  adverbs: number;
  adjectives: number;
  total: number;
  byType: Record<string, number>;
} {
  const stats = {
    nouns: result.nouns.length,
    verbs: result.verbs.length,
    adverbs: result.adverbs.length,
    adjectives: result.adjectives.length,
    total: result.nouns.length + result.verbs.length + result.adverbs.length + result.adjectives.length,
    byType: {
      noun: result.nouns.length,
      verb: result.verbs.length,
      adverb: result.adverbs.length,
      adjective: result.adjectives.length,
    },
  };

  return stats;
}

/**
 * Fallback a análisis básico si el servicio principal falla
 */
export function extractGrammaticalCategoriesFallback(
  text: string,
  language: LanguageCode = DEFAULT_LANGUAGE
): ExtractionResult {
  const langConfig = getLanguageConfigSync(language);

  // Dividir texto en palabras
  const words = text.split(/\s+/).filter(w => w.length > 2);

  const taggedWords: TaggedWord[] = words.map((word, index) => {
    const normalized = normalizeWord(word);
    let pos: POSType = 'other';

    // Análisis muy básico por terminaciones
    if (langConfig && hasAnyEnding(normalized, langConfig.adverbEndings)) {
      pos = 'adverb';
    } else if (langConfig && hasAnyEnding(normalized, langConfig.verbEndings.slice(0, 3))) {
      pos = 'verb';
    } else if (normalized.length > 4) {
      pos = 'noun';
    }

    return {
      word,
      lemma: normalized,
      pos,
      confidence: 0.5, // Baja confianza en fallback
      position: index,
    };
  }).filter(w => w.pos !== 'other');

  return {
    nouns: taggedWords.filter(w => w.pos === 'noun'),
    verbs: taggedWords.filter(w => w.pos === 'verb'),
    adverbs: taggedWords.filter(w => w.pos === 'adverb'),
    adjectives: taggedWords.filter(w => w.pos === 'adjective'),
    fullText: text,
    language,
    metadata: {
      totalWords: words.length,
      taggedWords: taggedWords.length,
      processingTimeMs: 0,
    },
  };
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type { TaggedWord, ExtractionResult } from '@/schemas/posTagging';
export type { POSType } from '@/schemas/posTagging';
