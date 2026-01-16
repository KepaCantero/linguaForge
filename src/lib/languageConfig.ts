/**
 * Configuración de idiomas para TTS y generación de ejercicios
 * Incluye voces preferidas, stop words, conjugaciones verbales, y configuraciones específicas por idioma
 */

import { SUPPORTED_LANGUAGES } from './constants';

// ============================================
// TIPOS
// ============================================

export interface VoiceConfig {
  preferredVoices: string[];
  langCodes: string[];
  ttsLang: string;
  rate: number;
}

export interface StopWordsConfig {
  words: Set<string>;
  pronouns: Set<string>;
  articles: Set<string>;
  prepositions: Set<string>;
  conjunctions: Set<string>;
  commonVerbs: Set<string>;
}

export interface ConjugationConfig {
  // Verbos auxiliares principales (to be, to have, etc.)
  auxiliaryVerbs: {
    toBe: Record<string, string>;      // ser/sein/essere/be
    toHave: Record<string, string>;     // avoir/haben/avere/have
  };
  // Terminaciones verbales por grupo
  verbGroups: {
    firstGroup: Record<string, string>;  // -er/-ar/-en/-are (verbos regulares primera conjugación)
    secondGroup?: Record<string, string>; // -ir/-ere/-ire (segunda conjugación)
    thirdGroup?: Record<string, string>;  // -re/-ere (tercera conjugación, solo francés/italiano)
  };
  // Sujetos pronombres
  pronouns: {
    firstPerson: string[];   // yo/ich/io/I
    secondPerson: string[];  // tú/du/tu/you
    thirdPerson: string[];   // él/er/lui/he + ella/sie/lei/she
    firstPlural: string[];   // nosotros/wir/noi/we
    secondPlural: string[];  // vosotros/ihr/voi/you-plural
    thirdPlural: string[];   // ellos/sie/loro/they
  };
}

export interface JanusConfig {
  subjects: Array<{ text: string; translation: string }>;
  defaultVerbs: string[];
  defaultComplements: string[];
  verbEndings: string[];
  // Etiquetas y textos UI
  labels: {
    fallbackWord: string;      // Palabra fallback si no se encuentra otra
    dummyOptions: string[];     // Opciones dummy para ejercicios
    greeting: string;            // Saludo para diálogos
    columnTitles: {
      subject: string;          // Título columna sujetos
      verb: string;             // Título columna verbos
      complement: string;       // Título columna complementos
    };
  };
}

export interface LanguageConfig {
  voice: VoiceConfig;
  stopWords: StopWordsConfig;
  conjugation: ConjugationConfig;
  janus: JanusConfig;
}

// ============================================
// CONFIGURACIÓN POR IDIOMA
// ============================================

// Alemán (German)
const germanVoice: VoiceConfig = {
  preferredVoices: [
    'Google Deutsch',
    'Katrin',
    'Marlene',
    'Microsoft Stefan - German',
    'Microsoft Hedda - German',
  ],
  langCodes: ['de', 'de-DE', 'de-AT', 'de-CH'],
  ttsLang: 'de-DE',
  rate: 0.85,
};

const germanStopWords: StopWordsConfig = {
  words: new Set([
    'der', 'die', 'das', 'ein', 'eine', 'einer', 'einen', 'einem', 'einen',
    'den', 'dem', 'des', 'der', 'von', 'zu', 'aus', 'bei', 'mit', 'nach',
    'über', 'für', 'durch', 'um', 'und', 'oder', 'aber', 'weil', 'denn',
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'ist', 'sind', 'war', 'waren',
    'habe', 'hast', 'hat', 'haben', 'bin', 'bist', 'sein', 'haben',
  ]),
  pronouns: new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie']),
  articles: new Set(['der', 'die', 'das', 'ein', 'eine', 'kein', 'keine']),
  prepositions: new Set(['von', 'zu', 'aus', 'bei', 'mit', 'nach', 'über', 'für', 'durch', 'um']),
  conjunctions: new Set(['und', 'oder', 'aber', 'weil', 'denn', 'dass', 'ob', 'wenn']),
  commonVerbs: new Set([
    'sein', 'haben', 'werden', 'können', 'müssen', 'wollen', 'sollen',
    'machen', 'tun', 'gehen', 'kommen', 'sehen', 'sagen', 'wissen', 'denken',
  ]),
};

const germanJanus: JanusConfig = {
  subjects: [
    { text: 'Ich', translation: 'Yo' },
    { text: 'Du', translation: 'Tú' },
    { text: 'Er', translation: 'Él' },
    { text: 'Sie', translation: 'Ella' },
    { text: 'Wir', translation: 'Nosotros' },
    { text: 'Ihr', translation: 'Vosotros' },
    { text: 'Sie', translation: 'Ustedes' },
  ],
  defaultVerbs: ['bin', 'habe', 'gehe', 'komme', 'mache', 'sage', 'sehe', 'kenne'],
  defaultComplements: ['gut', 'schlecht', 'heute', 'morgen', 'gestern', 'jetzt'],
  verbEndings: ['en', 't', 'st', 'e', 'te', 'ten'],
  labels: {
    fallbackWord: 'Wort',
    dummyOptions: ['Option1', 'Option2', 'Option3'],
    greeting: 'Hallo!',
    columnTitles: {
      subject: 'Subjekt',
      verb: 'Verb',
      complement: 'Ergänzung',
    },
  },
};

// Conjugaciones de verbos alemanes
const germanConjugation: ConjugationConfig = {
  auxiliaryVerbs: {
    toBe: {
      'ich': 'bin', 'du': 'bist', 'er': 'ist', 'sie_s': 'ist',
      'wir': 'sind', 'ihr': 'seid', 'sie_p': 'sind'
    },
    toHave: {
      'ich': 'habe', 'du': 'hast', 'er': 'hat', 'sie_s': 'hat',
      'wir': 'haben', 'ihr': 'habt', 'sie_p': 'haben'
    },
  },
  verbGroups: {
    firstGroup: {  // -en verbos (primera conjugación alemana)
      'ich': 'e', 'du': 'st', 'er': 't', 'sie_s': 't',
      'wir': 'en', 'ihr': 't', 'sie_p': 'en'
    },
  },
  pronouns: {
    firstPerson: ['ich'],
    secondPerson: ['du'],
    thirdPerson: ['er', 'sie', 'es'],
    firstPlural: ['wir'],
    secondPlural: ['ihr'],
    thirdPlural: ['sie'],
  },
};

// Inglés (English)
const englishVoice: VoiceConfig = {
  preferredVoices: [
    'Google US English',
    'Google UK English',
    'Daniel',
    'Samantha',
    'Microsoft David - English',
    'Microsoft Zira - English',
  ],
  langCodes: ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU'],
  ttsLang: 'en-US',
  rate: 0.9,
};

const englishStopWords: StopWordsConfig = {
  words: new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'because', 'although',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'is', 'are', 'was', 'were',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'in', 'on', 'at', 'to', 'from', 'with', 'by', 'for', 'about', 'of',
    'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  ]),
  pronouns: new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they']),
  articles: new Set(['the', 'a', 'an']),
  prepositions: new Set(['in', 'on', 'at', 'to', 'from', 'with', 'by', 'for', 'about', 'of']),
  conjunctions: new Set(['and', 'or', 'but', 'because', 'although', 'if', 'when', 'while']),
  commonVerbs: new Set([
    'be', 'have', 'do', 'will', 'would', 'could', 'should', 'can', 'may', 'might',
    'make', 'take', 'go', 'come', 'see', 'say', 'know', 'think', 'want', 'need',
  ]),
};

const englishJanus: JanusConfig = {
  subjects: [
    { text: 'I', translation: 'Yo' },
    { text: 'You', translation: 'Tú' },
    { text: 'He', translation: 'Él' },
    { text: 'She', translation: 'Ella' },
    { text: 'We', translation: 'Nosotros' },
    { text: 'They', translation: 'Ellos' },
  ],
  defaultVerbs: ['am', 'have', 'go', 'come', 'make', 'take', 'see', 'say'],
  defaultComplements: ['well', 'badly', 'today', 'tomorrow', 'yesterday', 'now'],
  verbEndings: ['ing', 's', 'ed', 'es'],
  labels: {
    fallbackWord: 'word',
    dummyOptions: ['option1', 'option2', 'option3'],
    greeting: 'Hello!',
    columnTitles: {
      subject: 'Subject',
      verb: 'Verb',
      complement: 'Complement',
    },
  },
};

// Conjugaciones de verbos ingleses
const englishConjugation: ConjugationConfig = {
  auxiliaryVerbs: {
    toBe: {
      'i': 'am', 'you': 'are', 'he': 'is', 'she': 'is',
      'we': 'are', 'they': 'are'
    },
    toHave: {
      'i': 'have', 'you': 'have', 'he': 'has', 'she': 'has',
      'we': 'have', 'they': 'have'
    },
  },
  verbGroups: {
    firstGroup: {  // Verbos regulares -s en tercera persona
      'i': '', 'you': '', 'he': 's', 'she': 's',
      'we': '', 'they': 's'
    },
  },
  pronouns: {
    firstPerson: ['i'],
    secondPerson: ['you'],
    thirdPerson: ['he', 'she', 'it'],
    firstPlural: ['we'],
    secondPlural: ['you'],
    thirdPlural: ['they'],
  },
};

// Español (Spanish)
const spanishVoice: VoiceConfig = {
  preferredVoices: [
    'Google español',
    'Google español de México',
    'Jorge',
    'Monica',
    'Microsoft Pablo - Spanish',
    'Microsoft Helena - Spanish',
  ],
  langCodes: ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO'],
  ttsLang: 'es-ES',
  rate: 0.85,
};

const spanishStopWords: StopWordsConfig = {
  words: new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'uno', 'unos', 'unas', 'del', 'al',
    'en', 'de', 'a', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'hacia',
    'y', 'o', 'pero', 'porque', 'aunque', 'si', 'cuando', 'mientras',
    'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'es', 'son', 'era', 'eran',
    'he', 'has', 'ha', 'hemos', 'han', 'ser', 'estar',
  ]),
  pronouns: new Set(['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas']),
  articles: new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']),
  prepositions: new Set(['en', 'de', 'a', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'hacia']),
  conjunctions: new Set(['y', 'o', 'pero', 'porque', 'aunque', 'si', 'cuando', 'mientras']),
  commonVerbs: new Set([
    'ser', 'estar', 'tener', 'hacer', 'ir', 'venir', 'ver', 'saber', 'poder',
    'querer', 'deber', 'hablar', 'comer', 'beber', 'tomar', 'dar', 'encontrar',
  ]),
};

const spanishJanus: JanusConfig = {
  subjects: [
    { text: 'Yo', translation: 'Yo' },
    { text: 'Tú', translation: 'Tú' },
    { text: 'Él', translation: 'Él' },
    { text: 'Ella', translation: 'Ella' },
    { text: 'Nosotros', translation: 'Nosotros' },
    { text: 'Vosotros', translation: 'Vosotros' },
  ],
  defaultVerbs: ['soy', 'tengo', 'voy', 'vengo', 'hago', 'veo', 'sé', 'puedo', 'quiero'],
  defaultComplements: ['bien', 'mal', 'hoy', 'mañana', 'ayer', 'ahora'],
  verbEndings: ['ar', 'er', 'ir', 'o', 'as', 'a', 'amos', 'áis', 'an'],
  labels: {
    fallbackWord: 'palabra',
    dummyOptions: ['opción1', 'opción2', 'opción3'],
    greeting: '¡Hola!',
    columnTitles: {
      subject: 'Sujeto',
      verb: 'Verbo',
      complement: 'Complemento',
    },
  },
};

// Conjugaciones de verbos españoles
const spanishConjugation: ConjugationConfig = {
  auxiliaryVerbs: {
    toBe: {  // ser
      'yo': 'soy', 'tú': 'eres', 'él': 'es', 'ella': 'es',
      'nosotros': 'somos', 'vosotros': 'sois', 'ellos': 'son'
    },
    toHave: {  // haber
      'yo': 'he', 'tú': 'has', 'él': 'ha', 'ella': 'ha',
      'nosotros': 'hemos', 'vosotros': 'habéis', 'ellos': 'han'
    },
  },
  verbGroups: {
    firstGroup: {  // -ar verbos (primera conjugación española)
      'yo': 'o', 'tú': 'as', 'él': 'a', 'ella': 'a',
      'nosotros': 'amos', 'vosotros': 'áis', 'ellos': 'an'
    },
    secondGroup: {  // -er/-ir verbos (segunda conjugación española)
      'yo': 'o', 'tú': 'es', 'él': 'e', 'ella': 'e',
      'nosotros': 'emos', 'vosotros': 'éis', 'ellos': 'en'
    },
  },
  pronouns: {
    firstPerson: ['yo'],
    secondPerson: ['tú'],
    thirdPerson: ['él', 'ella', 'usted'],
    firstPlural: ['nosotros'],
    secondPlural: ['vosotros'],
    thirdPlural: ['ellos', 'ellas', 'ustedes'],
  },
};

// Francés (French)
const frenchVoice: VoiceConfig = {
  preferredVoices: [
    'Google français',
    'Thomas',
    'Amelie',
    'Marie',
    'Microsoft Paul - French',
    'Microsoft Julie - French',
  ],
  langCodes: ['fr', 'fr-FR', 'fr-CA'],
  ttsLang: 'fr-FR',
  rate: 0.9,
};

const frenchStopWords: StopWordsConfig = {
  words: new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'et', 'ou', 'mais',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'est', 'sont', 'être', 'avoir',
    'avec', 'sans', 'pour', 'par',
  ]),
  pronouns: new Set(['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles']),
  articles: new Set(['le', 'la', 'les', 'un', 'une', 'des']),
  prepositions: new Set(['à', 'de', 'pour', 'par', 'avec', 'sans', 'sur', 'dans', 'entre']),
  conjunctions: new Set(['et', 'ou', 'mais', 'donc', 'car', 'que', 'quand', 'si']),
  commonVerbs: new Set([
    'être', 'avoir', 'aller', 'venir', 'faire', 'dire', 'voir', 'vouloir',
    'pouvoir', 'devoir', 'savoir', 'parler', 'manger', 'boire', 'prendre',
  ]),
};

const frenchJanus: JanusConfig = {
  subjects: [
    { text: 'Je', translation: 'Yo' },
    { text: 'Tu', translation: 'Tú' },
    { text: 'Il', translation: 'Él' },
    { text: 'Elle', translation: 'Ella' },
    { text: 'Nous', translation: 'Nosotros' },
    { text: 'Vous', translation: 'Ustedes/Vosotros' },
  ],
  defaultVerbs: ['suis', 'ai', 'vais', 'veux', 'peux', 'fais'],
  defaultComplements: ['bien', 'mal', 'beaucoup', 'maintenant', 'demain', "aujourd'hui"],
  verbEndings: ['er', 'ir', 're', 'ons', 'ez', 'ent', 'ais', 'ait'],
  labels: {
    fallbackWord: 'mot',
    dummyOptions: ['option1', 'option2', 'option3'],
    greeting: 'Bonjour!',
    columnTitles: {
      subject: 'Sujet',
      verb: 'Verbe',
      complement: 'Complément',
    },
  },
};

// Conjugaciones de verbos franceses
const frenchConjugation: ConjugationConfig = {
  auxiliaryVerbs: {
    toBe: {  // être
      'je': 'suis', 'j\'': 'suis', 'tu': 'es', 'il': 'est', 'elle': 'est',
      'nous': 'sommes', 'vous': 'êtes', 'ils': 'sont'
    },
    toHave: {  // avoir
      'je': 'ai', 'j\'': 'ai', 'tu': 'as', 'il': 'a', 'elle': 'a',
      'nous': 'avons', 'vous': 'avez', 'ils': 'ont'
    },
  },
  verbGroups: {
    firstGroup: {  // -er verbos (primera conjugación francesa)
      'je': 'e', 'j\'': 'e', 'tu': 'es', 'il': 'e', 'elle': 'e',
      'nous': 'ons', 'vous': 'ez', 'ils': 'ent'
    },
    secondGroup: {  // -ir verbos (segunda conjugación francesa)
      'je': 'is', 'tu': 'is', 'il': 'it', 'elle': 'it',
      'nous': 'issons', 'vous': 'issez', 'ils': 'issent'
    },
    thirdGroup: {  // -re verbos (tercera conjugación francesa)
      'je': 's', 'tu': 's', 'il': '', 'elle': '',
      'nous': 'ons', 'vous': 'ez', 'ils': 'ent'
    },
  },
  pronouns: {
    firstPerson: ['je', "j'"],
    secondPerson: ['tu'],
    thirdPerson: ['il', 'elle', 'on'],
    firstPlural: ['nous'],
    secondPlural: ['vous'],
    thirdPlural: ['ils', 'elles'],
  },
};

// Italiano (Italian)
const italianVoice: VoiceConfig = {
  preferredVoices: [
    'Google italiano',
    'Luca',
    'Paola',
    'Microsoft Cosimo - Italian',
    'Microsoft Elsa - Italian',
  ],
  langCodes: ['it', 'it-IT', 'it-CH'],
  ttsLang: 'it-IT',
  rate: 0.85,
};

const italianStopWords: StopWordsConfig = {
  words: new Set([
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', "l'",
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'e', 'o', 'ma', 'perché', 'se', 'quando', 'che',
    'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'è', 'sono', 'era', 'erano',
    'avere', 'essere', 'ho', 'hai', 'ha', 'abbiamo', 'hanno',
  ]),
  pronouns: new Set(['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']),
  articles: new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una']),
  prepositions: new Set(['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra']),
  conjunctions: new Set(['e', 'o', 'ma', 'perché', 'se', 'quando', 'che']),
  commonVerbs: new Set([
    'essere', 'avere', 'fare', 'dire', 'andare', 'venire', 'vedere',
    'sapere', 'potere', 'volere', 'dovere', 'parlare', 'mangiare', 'bere',
  ]),
};

const italianJanus: JanusConfig = {
  subjects: [
    { text: 'Io', translation: 'Yo' },
    { text: 'Tu', translation: 'Tú' },
    { text: 'Lui', translation: 'Él' },
    { text: 'Lei', translation: 'Ella' },
    { text: 'Noi', translation: 'Nosotros' },
    { text: 'Voi', translation: 'Vosotros' },
  ],
  defaultVerbs: ['sono', 'ho', 'vado', 'vengo', 'faccio', 'dico', 'vedo', 'so'],
  defaultComplements: ['bene', 'male', 'oggi', 'domani', 'ieri', 'ora'],
  verbEndings: ['are', 'ere', 'ire', 'o', 'i', 'a', 'amo', 'ate', 'ano'],
  labels: {
    fallbackWord: 'parola',
    dummyOptions: ['opzione1', 'opzione2', 'opzione3'],
    greeting: 'Ciao!',
    columnTitles: {
      subject: 'Soggetto',
      verb: 'Verbo',
      complement: 'Complemento',
    },
  },
};

// Conjugaciones de verbos italianos
const italianConjugation: ConjugationConfig = {
  auxiliaryVerbs: {
    toBe: {  // essere
      'io': 'sono', 'tu': 'sei', 'lui': 'è', 'lei': 'è',
      'noi': 'siamo', 'voi': 'siete', 'loro': 'sono'
    },
    toHave: {  // avere
      'io': 'ho', 'tu': 'hai', 'lui': 'ha', 'lei': 'ha',
      'noi': 'abbiamo', 'voi': 'avete', 'loro': 'hanno'
    },
  },
  verbGroups: {
    firstGroup: {  // -are verbos (primera conjugación italiana)
      'io': 'o', 'tu': 'i', 'lui': 'a', 'lei': 'a',
      'noi': 'iamo', 'voi': 'ate', 'loro': 'ano'
    },
    secondGroup: {  // -ere verbos (segunda conjugación italiana)
      'io': 'o', 'tu': 'i', 'lui': 'e', 'lei': 'e',
      'noi': 'iamo', 'voi': 'ete', 'loro': 'ono'
    },
    thirdGroup: {  // -ire verbos (tercera conjugación italiana)
      'io': 'o', 'tu': 'i', 'lui': 'e', 'lei': 'e',
      'noi': 'iamo', 'voi': 'ite', 'loro': 'iscono'
    },
  },
  pronouns: {
    firstPerson: ['io'],
    secondPerson: ['tu'],
    thirdPerson: ['lui', 'lei', 'esso', 'essa'],
    firstPlural: ['noi'],
    secondPlural: ['voi'],
    thirdPlural: ['loro'],
  },
};

// ============================================
// MAPA DE CONFIGURACIÓN
// ============================================

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  de: {
    voice: germanVoice,
    stopWords: germanStopWords,
    conjugation: germanConjugation,
    janus: germanJanus,
  },
  en: {
    voice: englishVoice,
    stopWords: englishStopWords,
    conjugation: englishConjugation,
    janus: englishJanus,
  },
  es: {
    voice: spanishVoice,
    stopWords: spanishStopWords,
    conjugation: spanishConjugation,
    janus: spanishJanus,
  },
  fr: {
    voice: frenchVoice,
    stopWords: frenchStopWords,
    conjugation: frenchConjugation,
    janus: frenchJanus,
  },
  it: {
    voice: italianVoice,
    stopWords: italianStopWords,
    conjugation: italianConjugation,
    janus: italianJanus,
  },
};

/**
 * Obtiene la configuración para un idioma específico
 * @param languageCode - Código de idioma (de, en, es, fr, it)
 * @returns Configuración del idioma o lanza error si no existe
 */
export function getLanguageConfig(languageCode: string): LanguageConfig {
  const config = LANGUAGE_CONFIGS[languageCode];
  if (!config) {
    console.warn(`Language config not found for: ${languageCode}, falling back to 'de'`);
    return LANGUAGE_CONFIGS.de;
  }
  return config;
}

/**
 * Verifica si un idioma está soportado
 * @param languageCode - Código de idioma a verificar
 * @returns true si el idioma está soportado
 */
export function isLanguageSupported(languageCode: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang === languageCode);
}
