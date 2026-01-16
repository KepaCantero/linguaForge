/**
 * Spanish Language Configuration
 * Complete linguistic patterns for Spanish POS tagging
 * Example configuration demonstrating multi-language extensibility
 */

import type { LanguageConfig } from './types';

// ============================================================
// SPANISH LANGUAGE CONFIG
// ============================================================

export const spanishConfig: LanguageConfig = {
  // Language metadata
  code: 'es',
  name: 'Spanish',
  nativeName: 'Español',

  // Verb patterns
  verbEndings: [
    // Infinitives
    'ar', 'er', 'ir',
    // First group (ar) - present tense indicative
    'o', 'as', 'a', 'amos', 'áis', 'an',
    // Second group (er) - present tense indicative
    'o', 'es', 'e', 'emos', 'éis', 'en',
    // Third group (ir) - present tense indicative
    'o', 'es', 'e', 'imos', 'ís', 'en',
    // Past participles
    'ado', 'ada', 'ados', 'adas',
    'ido', 'ida', 'idos', 'idas',
    // Gerund
    'ando', 'iendo', 'yendo',
  ] as const,

  verbExceptions: {
    // Words that end like verbs but are nouns
    'dar': 'noun',
    'estar': 'verb',
    'ser': 'verb',
    'ir': 'verb',
    'ver': 'verb',
    'saber': 'verb',
    'haber': 'verb',
    'tener': 'verb',
    'hacer': 'verb',
    'poner': 'verb',
    'salir': 'verb',
    'venir': 'verb',
    'caer': 'verb',
    'traer': 'verb',
    'oír': 'verb',
    'leer': 'verb',
    'creer': 'verb',
  },

  auxiliaryVerbs: [
    // ser conjugations
    'soy', 'eres', 'es', 'somos', 'sois', 'son',
    'ser',
    // estar conjugations
    'estoy', 'estás', 'está', 'estamos', 'estáis', 'están',
    'estar',
    // haber conjugations
    'he', 'has', 'ha', 'hemos', 'habéis', 'han',
    'haber',
    // haber impersonal (hay)
    'hay',
  ] as const,

  // Noun patterns
  nounIndicators: [
    // Articles and determiners that precede nouns
    'el ', 'la ', 'los ', 'las ', 'un ', 'una ', 'unos ', 'unas ',
    'este ', 'esta ', 'estos ', 'estas ', 'ese ', 'esa ', 'esos ', 'esas ',
    'aquel ', 'aquella ', 'aquellos ', 'aquellas ',
    'mi ', 'tu ', 'su ', 'mis ', 'tus ', 'sus ', 'nuestro ', 'nuestra ',
  ] as const,

  nounArticles: [
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'este', 'esta', 'estos', 'estas',
    'ese', 'esa', 'esos', 'esas',
    'aquel', 'aquella', 'aquellos', 'aquellas',
    'mi', 'tu', 'su', 'mis', 'tus', 'sus',
  ] as const,

  pronouns: {
    'yo': 'I',
    'tú': 'you (informal)',
    'usted': 'you (formal)',
    'él': 'he',
    'ella': 'she',
    'nosotros': 'we (masc)',
    'nosotras': 'we (fem)',
    'vosotros': 'you all (masc)',
    'vosotras': 'you all (fem)',
    'ustedes': 'you all',
    'ellos': 'they (masc)',
    'ellas': 'they (fem)',
    'esto': 'this',
    'eso': 'that',
    'aquello': 'that (over there)',
    'nadie': 'nobody',
    'nada': 'nothing',
    'alguien': 'someone',
    'algo': 'something',
    'todo': 'everything',
  },

  // Adverb patterns
  adverbEndings: [
    'mente',
  ] as const,

  commonAdverbs: [
    'muy', 'poco', 'mucho', 'bastante', 'demasiado',
    'siempre', 'nunca', 'a veces', 'a menudo', 'rara vez',
    'aquí', 'ahí', 'allí', 'allá', 'acá', 'allá',
    'ahora', 'antes', 'después', 'luego', 'entonces', 'así',
    'bien', 'mal', 'mejor', 'peor',
    'rápido', 'despacio', 'despacio', 'despacio', 'juntos', 'solo', 'sola',
  ] as const,

  // Adjective patterns
  adjectiveEndings: {
    masculine: [
      'o', 'or', 'és', 'ón',
      'al', 'an', 'ante', 'ar', 'ible', 'ivo',
      'az', 'co', 'eo', 'ero', 'iento',
    ] as const,
    feminine: [
      'a', 'ora', 'ésa', 'ona',
      'al', 'ana', 'ante', 'ada', 'ible', 'iva',
      'aza', 'ca', 'ea', 'era', 'ienta',
    ] as const,
    plural: [
      'os', 'ores', 'eses', 'ones',
      'ales', 'anes', 'antes', 'ados', 'ibles', 'ivos',
      'aces', 'cos', 'eos', 'eros', 'ientos',
      'as', 'oras', 'esas', 'onas',
    ] as const,
  },

  commonAdjectives: [
    'grande', 'pequeño', 'bueno', 'malo', 'nuevo', 'viejo', 'joven',
    'largo', 'corto', 'alto', 'bajo', 'gordo', 'delgado', 'fuerte', 'débil',
    'rico', 'pobre', 'feliz', 'triste', 'contento', 'enfadado',
    'importante', 'difícil', 'fácil', 'posible', 'imposible',
    'primer', 'segundo', 'tercer', 'último',
    'todo', 'alguno', 'ninguno', 'mismo', 'otro',
  ] as const,

  // Common words (stop words)
  stopWords: new Set([
    // Articles
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    // Prepositions
    'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'durante',
    'en', 'entre', 'hacia', 'hasta', 'para', 'por', 'según', 'sin', 'sobre',
    // Conjunctions
    'y', 'e', 'ni', 'o', 'u', 'pero', 'mas', 'aunque', 'sino',
    'porque', 'pues', 'como', 'cuando', 'donde', 'mientras',
    // Pronouns (except important subjects)
    'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'lo', 'la', 'los', 'las',
    // Auxiliary verbs in infinitive
    'ser', 'estar', 'haber', 'tener', 'hacer', 'ir', 'ver', 'saber',
    'poder', 'querer', 'deber', 'decir', 'venir', 'salir', 'caer',
    // Linking words
    'que', 'quien', 'quienes', 'cuyo', 'cuya', 'cuyos', 'cuyas',
    'este', 'esta', 'esto', 'ese', 'esa', 'eso', 'aquel', 'aquella', 'aquello',
    'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'nuestro', 'nuestra', 'nuestros', 'nuestras',
    'mucho', 'poco', 'todo', 'todos', 'toda', 'todas',
    // Numbers
    'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho',
    'diecinueve', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta',
    'ochenta', 'noventa', 'cien', 'ciento', 'mil',
  ]),

  importantSubjects: new Set([
    'yo', 'tú', 'usted', 'él', 'ella',
    'nosotros', 'nosotras', 'vosotros', 'vosotras', 'ustedes',
    'ellos', 'ellas',
    'esto', 'eso', 'aquello', 'nadie', 'nada', 'alguien', 'algo', 'todo',
  ]),

  // Text configuration
  textDirection: 'ltr',

  characterSets: {
    uppercase: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü',
    ] as const,
    lowercase: [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'á', 'é', 'í', 'ó', 'ú', 'ü',
    ] as const,
    accents: [
      'á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ',
      'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü', 'Ñ',
    ] as const,
  },
};
