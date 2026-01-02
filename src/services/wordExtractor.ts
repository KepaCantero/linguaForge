/**
 * Servicio para extraer palabras clave (verbos, nombres, adverbios) de texto en francés
 */

export type WordType = 'verb' | 'noun' | 'adverb' | 'adjective' | 'other';

export interface ExtractedWord {
  word: string; // Palabra original
  normalized: string; // Palabra normalizada (lowercase, sin acentos para comparación)
  type: WordType;
  position: number; // Posición en el texto original
  context: string; // Frase donde aparece
}

/**
 * Normaliza una palabra para comparación (lowercase, sin acentos)
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w]/g, ''); // Eliminar puntuación
}

/**
 * Detecta el tipo de palabra basándose en patrones del francés
 * Nota: Esto es una aproximación simple. En producción, usar un POS tagger real.
 */
export function detectWordType(word: string): WordType {
  const normalized = normalizeWord(word);
  
  // Patrones comunes en francés
  // Verbos: terminaciones comunes
  if (
    normalized.endsWith('er') ||
    normalized.endsWith('ir') ||
    normalized.endsWith('re') ||
    normalized.endsWith('oir') ||
    normalized.endsWith('tre')
  ) {
    // Verificar que no sea un sustantivo común que termine así
    if (!normalized.endsWith('mer') && !normalized.endsWith('ter')) {
      return 'verb';
    }
  }
  
  // Adverbios: terminaciones comunes
  if (normalized.endsWith('ment') || normalized.endsWith('ement')) {
    return 'adverb';
  }
  
  // Adjetivos: terminaciones comunes
  if (
    normalized.endsWith('eux') ||
    normalized.endsWith('euse') ||
    normalized.endsWith('if') ||
    normalized.endsWith('ive') ||
    normalized.endsWith('ant') ||
    normalized.endsWith('ent') ||
    normalized.endsWith('ique') || // magnifique, fantastique
    normalized.endsWith('ique') ||
    normalized.endsWith('grand') || // grands, grande
    normalized.endsWith('petit') ||
    normalized.endsWith('bon') ||
    normalized.endsWith('mauvais') ||
    normalized.endsWith('beau') ||
    normalized.endsWith('nouveau') ||
    normalized.endsWith('vieux') ||
    normalized.endsWith('jeune') ||
    normalized.endsWith('long') ||
    normalized.endsWith('court') ||
    normalized.endsWith('haut') ||
    normalized.endsWith('bas')
  ) {
    return 'adjective';
  }
  
  // Adjetivos que terminan en 's' (plural) - verificar si es adjetivo común
  if (normalized.endsWith('s') && normalized.length > 4) {
    const singular = normalized.slice(0, -1);
    if (
      singular.endsWith('grand') ||
      singular.endsWith('petit') ||
      singular.endsWith('beau') ||
      singular.endsWith('nouveau') ||
      singular.endsWith('vieux') ||
      singular.endsWith('jeune')
    ) {
      return 'adjective';
    }
  }
  
  // Sustantivos: artículos definidos/indefinidos antes
  // (esto se detectaría mejor con análisis de contexto)
  
  // Por defecto, asumir sustantivo si no coincide con otros patrones
  // y tiene más de 3 caracteres
  if (normalized.length > 3) {
    return 'noun';
  }
  
  return 'other';
}

/**
 * Extrae palabras clave de un texto
 * Filtra palabras comunes (artículos, preposiciones, etc.)
 */
const COMMON_WORDS = new Set([
  // Artículos
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd',
  // Preposiciones
  'à', 'au', 'aux', 'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par',
  // Pronombres
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'nous', 'vous',
  'le', 'la', 'les', 'lui', 'leur', 'y', 'en',
  // Conjunciones
  'et', 'ou', 'mais', 'donc', 'car', 'or', 'ni',
  // Adverbios comunes
  'très', 'trop', 'beaucoup', 'peu', 'bien', 'mal', 'plus', 'moins', 'aussi', 'toujours', 'jamais',
  // Verbos auxiliares comunes (ya estudiados)
  'être', 'avoir', 'faire', 'aller', 'venir', 'pouvoir', 'vouloir', 'devoir', 'savoir',
  // Palabras muy comunes
  'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'où', 'quand', 'comment', 'pourquoi',
]);

const MIN_WORD_LENGTH = 3; // Longitud mínima de palabra para considerar

export function extractKeywords(text: string): ExtractedWord[] {
  // Dividir en palabras
  const words = text
    .split(/[\s\.,;:!?()\[\]{}'"]+/)
    .filter(w => w.length >= MIN_WORD_LENGTH);
  
  const extracted: ExtractedWord[] = [];
  let position = 0;
  
  for (const word of words) {
    const normalized = normalizeWord(word);
    
    // Saltar palabras comunes
    if (COMMON_WORDS.has(normalized)) {
      position += word.length + 1; // +1 por el espacio
      continue;
    }
    
    // Detectar tipo
    const type = detectWordType(word);
    
    // Solo incluir verbos, nombres, adverbios y adjetivos
    if (type !== 'other') {
      extracted.push({
        word,
        normalized,
        type,
        position,
        context: text, // Por ahora, contexto completo. Se puede mejorar para extraer solo la frase
      });
    }
    
    position += word.length + 1;
  }
  
  // Eliminar duplicados (misma palabra normalizada)
  const seen = new Set<string>();
  return extracted.filter(ext => {
    if (seen.has(ext.normalized)) {
      return false;
    }
    seen.add(ext.normalized);
    return true;
  });
}

/**
 * Extrae palabras clave de múltiples frases
 */
export function extractKeywordsFromPhrases(phrases: string[]): ExtractedWord[] {
  const allWords: ExtractedWord[] = [];
  const seen = new Set<string>();
  
  for (const phrase of phrases) {
    const words = extractKeywords(phrase);
    for (const word of words) {
      if (!seen.has(word.normalized)) {
        allWords.push(word);
        seen.add(word.normalized);
      }
    }
  }
  
  return allWords;
}

