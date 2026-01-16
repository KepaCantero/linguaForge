/**
 * French Language Configuration
 * Complete linguistic patterns for French POS tagging
 */

import type { LanguageConfig } from './types';
import type { IntonationConfig } from '@/types/tts';

// ============================================================
// FRENCH LANGUAGE CONFIG
// ============================================================

export const frenchConfig: LanguageConfig = {
  // Language metadata
  code: 'fr',
  name: 'French',
  nativeName: 'Français',

  // Verb patterns
  verbEndings: [
    // Infinitives
    'er', 'ir', 're', 'oir', 'tre',
    // First group (er) - present tense
    'e', 'es', 'ons', 'ez', 'ent',
    // Second group (ir) - present tense
    'is', 'it', 'issons', 'issez', 'issent',
    // Third group (re) - present tense
    's', 't', 'ons', 'ez', 'ent',
    // Past participles
    'é', 'ée', 'és', 'ées', 'i', 'ie', 'it', 'u', 'ue',
  ] as const,

  verbExceptions: {
    // Words that end like verbs but are nouns
    'mer': 'noun',
    'ter': 'noun',
    'fer': 'noun',
    'pere': 'noun',
    'mere': 'noun',
    'frere': 'noun',
    'sœur': 'noun',
    'air': 'noun',
    'baiser': 'noun',
    'boucher': 'noun',
    'cacher': 'noun',
    'changer': 'noun',
    'danger': 'noun',
    'hiver': 'noun',
    'miner': 'noun',
    'nier': 'noun',
    'papier': 'noun',
    'prier': 'noun',
    'soup': 'noun',
    'canape': 'noun',
    'the': 'noun',
    'cafe': 'noun',
    'theme': 'noun',
    'glande': 'noun',
    'profil': 'noun',
  },

  auxiliaryVerbs: [
    // être conjugations
    'suis', 'es', 'est', 'sommes', 'etes', 'sont',
    'être', 'etre',
    // avoir conjugations
    'ai', 'as', 'a', 'avons', 'avez', 'ont',
    'avoir',
    // aller conjugations
    'vais', 'vas', 'va', 'allons', 'allez', 'vont',
    'aller',
  ] as const,

  // Noun patterns
  nounIndicators: [
    // Articles and determiners that precede nouns
    'le ', 'la ', 'les ', 'un ', 'une ', 'des ', 'du ', 'de la ',
    'ce ', 'cet ', 'cette ', 'ces ', 'mon ', 'ton ', 'son ', 'ma ', 'ta ', 'sa ',
    'mes ', 'tes ', 'ses ', 'nos ', 'vos ', 'leurs ',
  ] as const,

  nounArticles: [
    // Definite articles
    'le', 'la', 'les', "l'",
    // Indefinite articles
    'un', 'une', 'des',
    // Partitive articles
    'du', 'de la', 'de',
    // Contracted articles (à + le/les)
    'au', 'aux',
    // Demonstrative articles
    'ce', 'cet', 'cette', 'ces',
    // Possessive articles (singular)
    'mon', 'ton', 'son', 'ma', 'ta', 'sa',
    // Possessive articles (plural)
    'mes', 'tes', 'ses', 'nos', 'vos', 'leurs',
  ] as const,

  pronouns: {
    'je': 'I',
    "j'": 'I',
    'tu': 'you',
    'il': 'he',
    'elle': 'she',
    'nous': 'we',
    'vous': 'you (plural/formal)',
    'ils': 'they (masc)',
    'elles': 'they (fem)',
    'ceci': 'this',
    'cela': 'that',
    'ça': 'that/it',
    'personne': 'no one',
    'rien': 'nothing',
    'chacun': 'each one',
    'tout': 'everything',
  },

  // Adverb patterns
  adverbEndings: [
    'ment', 'emment', 'amment',
  ] as const,

  commonAdverbs: [
    'bien', 'mal', 'plus', 'moins', 'très', 'trop',
    'toujours', 'jamais', 'souvent', 'parfois', 'ici', 'là', 'ailleurs',
    'maintenant', 'alors', 'ainsi', 'donc', 'encore', 'bientôt',
    'vite', 'lentement', 'ensemble', 'seul', 'seule',
  ] as const,

  // Adjective patterns
  adjectiveEndings: {
    masculine: [
      'eux', 'if', 'eul', 'al', 'el', 'en', 'on', 'ot', 'et', 'is', 'u', 'c',
      'and', 'ard', 'aud', 'as', 'atif', 'able', 'ible', 'aire', 'eau', 'ès',
    ] as const,
    feminine: [
      'euse', 'ive', 'elle', 'enne', 'onne', 'otte', 'ette', 'ise', 'ue', 'che', 'que',
      'ative', 'ible', 'aire', 'ole', 'ade', 'asse',
    ] as const,
    plural: [
      'eux', 'ifs', 'euls', 'aux', 'els', 'ens', 'ons', 'ots', 'ets', 'is', 'us', 'cs',
      'ands', 'ards', 'auds', 'as', 'atifs', 'ables', 'ibles', 'aires', 'eaux', 'ès',
      'euses', 'ives', 'elles', 'ennes', 'onnes', 'ottes', 'ettes', 'ises', 'ues', 'ches', 'ques',
    ] as const,
  },

  commonAdjectives: [
    'grand', 'petit', 'bon', 'mauvais', 'beau', 'nouveau', 'vieux', 'jeune',
    'long', 'court', 'haut', 'bas', 'gros', 'fort', 'faible', 'riche', 'pauvre',
    'heureux', 'malheureux', 'content', 'triste',
    'heureuse', 'malheureuse', 'contente',
    'autre', 'même', 'tel', 'tel', 'certain', 'certaine',
  ] as const,

  // Common words (stop words)
  stopWords: new Set([
    // Articles
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'au', 'aux',
    // Prepositions
    'à', 'de', 'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par',
    // Conjunctions
    'et', 'ou', 'mais', 'donc', 'car', 'or', 'ni',
    // Pronouns (except important subjects)
    'me', 'te', 'se', 'lui', 'leur', 'y', 'en',
    // Auxiliary verbs in infinitive
    'etre', 'avoir', 'faire', 'aller', 'venir', 'voir', 'dire', 'pouvoir',
    'vouloir', 'devoir', 'savoir', 'prendre', 'mettre', 'fal', 'falloir',
    // Linking words
    'que', 'qui', 'quoi', 'dont', 'ou', 'lorsque', 'quand', 'comme', 'si',
    'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa',
    'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'tout', 'tous', 'toute',
    // Numbers
    'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'vingt', 'trente',
    'quarante', 'cinquante', 'soixante', 'cent', 'mille',
  ]),

  importantSubjects: new Set([
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'ceci', 'cela', 'ça', 'personne', 'rien', 'chacun', 'tout',
  ]),

  // Text configuration
  textDirection: 'ltr',

  characterSets: {
    uppercase: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'À', 'Â', 'Ä', 'É', 'È', 'Ê', 'Ë', 'Ï', 'Î', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ', 'Ñ', 'Ç',
    ] as const,
    lowercase: [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'à', 'â', 'ä', 'é', 'è', 'ê', 'ë', 'ï', 'î', 'ô', 'ù', 'û', 'ü', 'ÿ', 'ñ', 'ç',
    ] as const,
    accents: [
      'à', 'â', 'ä',
      'é', 'è', 'ê', 'ë',
      'ï', 'î',
      'ô',
      'ù', 'û', 'ü',
      'ÿ',
      'ç',
      'À', 'Â', 'Ä',
      'É', 'È', 'Ê', 'Ë',
      'Ï', 'Î',
      'Ô',
      'Ù', 'Û', 'Ü',
      'Ÿ',
      'Ç',
    ] as const,
  },
};

// ============================================================
// FRENCH INTONATION CONFIG
// ============================================================

/**
 * French intonation rules for contextualized TTS
 * Reglas de entonación francesa para TTS contextualizado
 *
 * Based on linguistic research:
 * - Questions: Rising pitch at the end (+4 to +6 semitones)
 * - Statements: Falling pitch (-2 to +2 semitones)
 * - Exclamations: Wide pitch range (0 to +8 semitones)
 * - Imperatives: Lower baseline falling pitch (-3 to +1 semitones)
 */
export const FRENCH_INTONATION: IntonationConfig = {
  language: 'fr',
  questionWords: [
    'que', 'quoi', 'qui', 'quel', 'quelle', 'quels', 'quelles',
    'quand', 'où', 'comment', 'pourquoi', 'combien',
    'est-ce que', 'est-cequ',
  ],
  imperativeVerbs: [
    'aller', 'venir', 'prendre', 'mettre', 'donner', 'faire', 'dire', 'voir',
    'être', 'avoir', 'savoir', 'pouvoir', 'vouloir', 'devoir',
    'écouter', 'regarder', 'parler', 'répondre', 'écrire', 'lire',
    'ouvrir', 'fermer', 'entrer', 'sortir', 'arrêter', 'continuer',
  ],
  rules: {
    question: {
      sentenceType: 'question',
      intonationProfile: 'rising',
      pitchRange: [0, 6],
      rateModifier: 0.95,
      volumeBoost: 2,
    },
    statement: {
      sentenceType: 'statement',
      intonationProfile: 'falling',
      pitchRange: [-2, 2],
      rateModifier: 1.0,
      volumeBoost: 0,
    },
    exclamation: {
      sentenceType: 'exclamation',
      intonationProfile: 'rise-fall',
      pitchRange: [0, 8],
      rateModifier: 1.1,
      volumeBoost: 5,
    },
    imperative: {
      sentenceType: 'imperative',
      intonationProfile: 'falling',
      pitchRange: [-3, 1],
      rateModifier: 1.05,
      volumeBoost: 3,
    },
  },
};
