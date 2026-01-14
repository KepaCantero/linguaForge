/**
 * Servicio para generar ejercicios completos a partir de frases importadas
 * Multi-language support with language-specific stop words and configurations
 * Genera: Cloze, Variations, ConversationalEcho, DialogueIntonation, JanusComposer
 */

import type {
  Phrase,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
  DialogueIntonationTurn,
} from '@/types';
import type { SupportedLanguage } from '@/lib/constants';
import { getLanguageConfig } from '@/lib/languageConfig';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene las stop words para un idioma específico
 * @param language - Código de idioma
 * @returns Set con las stop words del idioma
 */
function getStopWords(language: SupportedLanguage): Set<string> {
  return getLanguageConfig(language).stopWords.words;
}

// ============================================
// CLOZE EXERCISES
// ============================================

/**
 * Generar ejercicios Cloze a partir de frases
 * @param phrases - Array de frases en el idioma de aprendizaje
 * @param language - Idioma de las frases
 */
export function generateClozeExercises(phrases: string[], language: SupportedLanguage = 'de'): Phrase[] {
  if (!phrases || phrases.length === 0) return [];

  const STOP_WORDS = getStopWords(language);
  const config = getLanguageConfig(language);

  return phrases.map((phraseText, index) => {
    const words = phraseText.split(/\s+/);

    const keywords = words.filter(
      (word) => word.length >= 4 && !STOP_WORDS.has(word.toLowerCase().replace(/[.,!?;:]/g, ''))
    );

    const targetWord = keywords.length > 0
      ? keywords[Math.floor(Math.random() * keywords.length)]
      : words.find((w) => w.length >= 4) || words[words.length - 1];

    const incorrectOptions = [
      targetWord.split('').reverse().join(''),
      targetWord.substring(0, targetWord.length - 1),
      targetWord + 's',
      words.find((w) => w !== targetWord && w.length >= 4) || config.janus.labels.fallbackWord,
    ].filter((opt, i, arr) => opt !== targetWord && arr.indexOf(opt) === i).slice(0, 3);

    return {
      id: `phrase-cloze-${index}`,
      text: phraseText,
      translation: '',
      clozeWord: targetWord.replace(/[.,!?;:]/g, ''),
      clozeOptions: [
        { id: 'opt-correct', text: targetWord.replace(/[.,!?;:]/g, ''), isCorrect: true },
        ...incorrectOptions.map((opt, i) => ({
          id: `opt-${i}`,
          text: opt.replace(/[.,!?;:]/g, ''),
          isCorrect: false,
        })),
      ],
      variations: [],
    };
  });
}

// ============================================
// VARIATIONS EXERCISES
// ============================================

/**
 * Generar ejercicios Variations a partir de frases
 * @param phrases - Array de frases en el idioma de aprendizaje
 * @param language - Idioma de las frases
 */
export function generateVariationsExercises(phrases: string[], language: SupportedLanguage = 'de'): Phrase[] {
  if (!phrases || phrases.length === 0) return [];

  const config = getLanguageConfig(language);

  return phrases.map((phraseText, index) => {
    const words = phraseText.split(/\s+/);
    const targetWord = words.find((w) => w.length >= 4) || words[0] || config.janus.labels.fallbackWord;

    return {
      id: `phrase-variations-${index}`,
      text: phraseText,
      translation: '',
      clozeWord: targetWord.replace(/[.,!?;:]/g, ''),
      clozeOptions: [
        { id: 'opt-correct', text: targetWord.replace(/[.,!?;:]/g, ''), isCorrect: true },
        { id: 'opt-1', text: config.janus.labels.dummyOptions[0], isCorrect: false },
        { id: 'opt-2', text: config.janus.labels.dummyOptions[1], isCorrect: false },
        { id: 'opt-3', text: config.janus.labels.dummyOptions[2], isCorrect: false },
      ],
      variations: [],
    };
  });
}

// ============================================
// CONVERSATIONAL ECHO EXERCISES
// ============================================

/**
 * Generar ejercicios ConversationalEcho a partir de frases
 * @param phrases - Array de frases en el idioma de aprendizaje
 * @param language - Idioma de las frases
 */
export function generateConversationalEchoExercises(
  phrases: string[],
  language: SupportedLanguage = 'de'
): ConversationalEcho[] {
  if (!phrases || phrases.length < 2) return [];

  const config = getLanguageConfig(language);
  const STOP_WORDS = config.stopWords.words;

  // Agrupar frases en pares para crear diálogos
  const exercises: ConversationalEcho[] = [];

  for (let i = 0; i < phrases.length - 1; i += 2) {
    const systemPhrase = phrases[i];
    const userResponse = phrases[i + 1];

    // Extraer palabras clave de la respuesta
    const keywords = userResponse
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()))
      .slice(0, 3);

    exercises.push({
      id: `echo-${i}`,
      blockId: `block-${i}`,
      systemPhrase: {
        text: systemPhrase,
        translation: '',
        audioUrl: '', // Se generará con TTS
        duration: Math.ceil(systemPhrase.length / 10), // Estimación
      },
      expectedResponses: [
        {
          text: userResponse,
          keywords,
          isOptimal: true,
        },
      ],
      context: {
        scene: 'Conversación general',
        role: 'other',
        formality: 'informal',
      },
      config: {
        maxRecordingTime: 5,
        silenceTimeout: 3,
        showHint: true,
      },
    });
  }

  return exercises;
}

// ============================================
// DIALOGUE INTONATION EXERCISES
// ============================================

/**
 * Generar ejercicios DialogueIntonation a partir de frases
 * @param phrases - Array de frases en el idioma de aprendizaje
 */
export function generateDialogueIntonationExercises(
  phrases: string[]
): DialogueIntonation[] {
  if (!phrases || phrases.length < 2) return [];

  // Crear diálogos de 2-3 turnos
  const exercises: DialogueIntonation[] = [];

  for (let i = 0; i < phrases.length - 1; i += 2) {
    const dialogue: DialogueIntonationTurn[] = [
      {
        speaker: 'system',
        text: phrases[i],
        translation: '',
        audioUrl: '',
        duration: Math.ceil(phrases[i].length / 10),
      },
      ...(phrases[i + 1] ? [{
        speaker: 'user' as const,
        text: phrases[i + 1],
        translation: '',
        audioUrl: '',
        duration: Math.ceil(phrases[i + 1].length / 10),
      }] : []),
    ];

    exercises.push({
      id: `dialogue-${i}`,
      blockId: `block-${i}`,
      dialogue,
      userTurns: [1], // El segundo turno es del usuario
      rhythmPatterns: dialogue.map((_turn, turnIndex) => ({
        turnIndex,
        segments: new Array(10).fill(0).map(() => Math.random() * 100 + 50),
        pauses: new Array(9).fill(0).map(() => Math.random() * 50 + 20),
      })),
    });
  }

  return exercises;
}

// ============================================
// JANUS COMPOSER GENERATOR (Multi-language)
// ============================================

interface Subject {
  text: string;
  translation: string;
}

interface ConjugationRule {
  verb: string;
  subject: string;
  conjugated: string;
}

/**
 * Generador de ejercicios JanusComposer con soporte multi-idioma
 * Sigue Single Responsibility Principle
 */
export class JanusComposerGenerator {
  private language: SupportedLanguage;
  private stopWords: Set<string>;
  private subjects: Subject[];
  private commonVerbs: string[];
  private verbEndings: string[];
  private defaultVerbs: string[];
  private defaultComplements: string[];
  private defaultSubjects: string[];

  constructor(language: SupportedLanguage = 'de') {
    this.language = language;
    const config = getLanguageConfig(language);
    this.stopWords = config.stopWords.words;
    this.subjects = config.janus.subjects;
    this.commonVerbs = Array.from(config.stopWords.commonVerbs);
    this.verbEndings = config.janus.verbEndings;
    this.defaultVerbs = config.janus.defaultVerbs;
    this.defaultComplements = config.janus.defaultComplements;
    this.defaultSubjects = this.subjects.slice(0, 4).map(s => s.text);
  }

  // ========================================
  // EXTRACTION METHODS
  // ========================================

  /**
   * Extrae sujetos de las frases proporcionadas
   * @param phrases - Array de frases en el idioma de aprendizaje
   * @returns Array de sujetos extraídos
   */
  extractSubjects(phrases: string[]): string[] {
    const extractedSubjects = new Set<string>();

    for (const phrase of phrases) {
      const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()[\]{}'"]/g, ''));
      const firstWord = words[0];

      if (this.subjects.some(s => s.text.toLowerCase() === firstWord.toLowerCase())) {
        extractedSubjects.add(firstWord);
      }
    }

    const subjects = Array.from(extractedSubjects);
    return subjects.length > 0 ? subjects.slice(0, 4) : this.defaultSubjects;
  }

  /**
   * Extrae verbos de las frases proporcionadas
   * @param phrases - Array de frases en el idioma de aprendizaje
   * @returns Array de verbos extraídos
   */
  extractVerbs(phrases: string[]): string[] {
    const extractedVerbs = new Set<string>();

    for (const phrase of phrases) {
      const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()[\]{}'"]/g, ''));

      // Buscar verbos después del sujeto (posiciones 1-4)
      for (let i = 1; i < Math.min(words.length, 5); i++) {
        const word = words[i];
        const cleanWord = word.toLowerCase();

        if (this.isVerb(cleanWord)) {
          extractedVerbs.add(word);
          if (extractedVerbs.size >= 8) break;
        }
      }

      if (extractedVerbs.size >= 8) break;
    }

    const verbs = Array.from(extractedVerbs);
    return verbs.length > 0 ? verbs.slice(0, 6) : this.defaultVerbs;
  }

  /**
   * Extrae complementos de las frases proporcionadas
   * @param phrases - Array de frases en el idioma de aprendizaje
   * @returns Array de complementos extraídos
   */
  extractComplements(phrases: string[]): string[] {
    const extractedComplements = new Set<string>();
    const extractedVerbs = new Set(this.extractVerbs(phrases));
    const extractedSubjects = new Set(this.extractSubjects(phrases));

    for (const phrase of phrases) {
      const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()[\]{}'"]/g, ''));

      // Extraer sustantivos y adjetivos (después de posición 2)
      for (let i = 2; i < words.length; i++) {
        const word = words[i];
        const cleanWord = word.toLowerCase();

        if (
          cleanWord.length >= 4 &&
          !this.stopWords.has(cleanWord) &&
          !extractedVerbs.has(word) &&
          !extractedSubjects.has(word) &&
          !extractedComplements.has(word)
        ) {
          extractedComplements.add(word);
          if (extractedComplements.size >= 10) break;
        }
      }

      if (extractedComplements.size >= 10) break;
    }

    const complements = Array.from(extractedComplements);
    return complements.length > 0 ? complements.slice(0, 6) : this.defaultComplements;
  }

  // ========================================
  // CONJUGATION RULES (Language-Specific)
  // ========================================

  /**
   * Verifica si el verbo base es una forma de "to be"
   */
  private isToBeVerb(verbBase: string): boolean {
    const toBeIndicators = ['suis', 'soy', 'bin', 'sono', 'am', 'être', 'ser', 'sein', 'essere', 'be'];
    return toBeIndicators.some(indicator => verbBase.includes(indicator) || verbBase === indicator);
  }

  /**
   * Verifica si el verbo base es una forma de "to have"
   */
  private isToHaveVerb(verbBase: string): boolean {
    const toHaveIndicators = ['ai', 'he', 'habe', 'ho', 'have', 'avoir', 'haber', 'haben', 'avere'];
    return toHaveIndicators.some(indicator => verbBase.includes(indicator) || verbBase === indicator);
  }

  /**
   * Obtiene la conjugación auxiliar (to be o to have)
   */
  private getAuxiliaryConjugation(verbBase: string, subject: string): string | null {
    const subjLower = subject.toLowerCase();
    const config = getLanguageConfig(this.language);

    if (this.isToBeVerb(verbBase)) {
      return config.conjugation.auxiliaryVerbs.toBe[subjLower] || null;
    }

    if (this.isToHaveVerb(verbBase)) {
      return config.conjugation.auxiliaryVerbs.toHave[subjLower] || null;
    }

    return null;
  }

  /**
   * Conjuga un verbo para un sujeto específico según el idioma
   * @param verbBase - Verbo en forma base
   * @param subject - Sujeto
   * @returns Verbo conjugado
   */
  private conjugateVerb(verbBase: string, subject: string): string {
    const subjLower = subject.toLowerCase();
    const config = getLanguageConfig(this.language);

    // Verificar verbos auxiliares
    const auxiliaryConjugation = this.getAuxiliaryConjugation(verbBase, subjLower);
    if (auxiliaryConjugation) {
      return auxiliaryConjugation;
    }

    // Verbos regulares por grupo
    const verbGroups = config.conjugation.verbGroups;
    const ending = verbBase.toLowerCase();

    if (this.matchesVerbGroup(ending, this.language, 'first')) {
      return this.conjugateRegularVerb(verbBase, subjLower, verbGroups.firstGroup);
    }

    if (verbGroups.secondGroup && this.matchesVerbGroup(ending, this.language, 'second')) {
      return this.conjugateRegularVerb(verbBase, subjLower, verbGroups.secondGroup);
    }

    if (verbGroups.thirdGroup && this.matchesVerbGroup(ending, this.language, 'third')) {
      return this.conjugateRegularVerb(verbBase, subjLower, verbGroups.thirdGroup);
    }

    return verbBase;
  }

  /**
   * Verifica si un verbo pertenece a un grupo específico en francés
   */
  private matchesFrenchVerbGroup(verb: string, group: 'first' | 'second' | 'third'): boolean {
    if (group === 'first') return verb.endsWith('er');
    if (group === 'second') return verb.endsWith('ir');
    if (group === 'third') return verb.endsWith('re');
    return false;
  }

  /**
   * Verifica si un verbo pertenece a un grupo específico en español
   */
  private matchesSpanishVerbGroup(verb: string, group: 'first' | 'second' | 'third'): boolean {
    if (group === 'first') return verb.endsWith('ar');
    if (group === 'second') return verb.endsWith('er') || verb.endsWith('ir');
    return false;
  }

  /**
   * Verifica si un verbo pertenece a un grupo específico en alemán
   */
  private matchesGermanVerbGroup(verb: string, group: 'first' | 'second' | 'third'): boolean {
    if (group === 'first') return verb.endsWith('en');
    return false;
  }

  /**
   * Verifica si un verbo pertenece a un grupo específico en italiano
   */
  private matchesItalianVerbGroup(verb: string, group: 'first' | 'second' | 'third'): boolean {
    if (group === 'first') return verb.endsWith('are');
    if (group === 'second') return verb.endsWith('ere');
    if (group === 'third') return verb.endsWith('ire');
    return false;
  }

  /**
   * Verifica si un verbo pertenece a un grupo específico según el idioma
   */
  private matchesVerbGroup(verb: string, language: SupportedLanguage, group: 'first' | 'second' | 'third'): boolean {
    switch (language) {
      case 'fr':
        return this.matchesFrenchVerbGroup(verb, group);
      case 'es':
        return this.matchesSpanishVerbGroup(verb, group);
      case 'de':
        return this.matchesGermanVerbGroup(verb, group);
      case 'it':
        return this.matchesItalianVerbGroup(verb, group);
      case 'en':
        return false;
      default:
        return false;
    }
  }

  /**
   * Conjuga un verbo regular usando las terminaciones del grupo
   */
  private conjugateRegularVerb(verbBase: string, subject: string, endings: Record<string, string>): string {
    const suffix = endings[subject];
    if (suffix === undefined) return verbBase;

    // Para inglés, el suffix puede estar vacío o ser 's', 'es'
    if (this.language === 'en') {
      if (suffix === '') return verbBase;
      if (verbBase.endsWith('y')) return verbBase.slice(0, -1) + 'ies';
      if (verbBase.endsWith('s') || verbBase.endsWith('x') || verbBase.endsWith('ch') || verbBase.endsWith('sh')) {
        return verbBase + 'es';
      }
      return verbBase + suffix;
    }

    // Para idiomas romances y alemán, quitar la terminación y agregar la nueva
    let rootLength = verbBase.length;
    const rootLengths: Record<string, number> = { 'fr': 2, 'es': 2, 'de': 2, 'it': 3 };
    if (rootLengths[this.language]) {
      rootLength = verbBase.length - rootLengths[this.language];
    }

    const root = verbBase.slice(0, rootLength);
    return root + suffix;
  }

  /**
   * Verifica si una palabra es un verbo
   * @param word - Palabra a verificar
   * @returns true si la palabra parece ser un verbo
   */
  private isVerb(word: string): boolean {
    const cleanWord = word.replace(/[.,!?;:()[\]{}'"]/g, '');

    // Verificar si es verbo común
    if (this.commonVerbs.some(v => cleanWord.startsWith(v) || cleanWord.includes(v))) {
      return true;
    }

    // Verificar si tiene terminaciones de verbo
    if (
      cleanWord.length >= 4 &&
      !this.stopWords.has(cleanWord) &&
      this.verbEndings.some(ending => cleanWord.endsWith(ending))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Construye reglas de conjugación para verbos y sujetos
   * @param verbs - Array de verbos
   * @param subjects - Array de sujetos
   * @returns Array de reglas de conjugación
   */
  buildConjugationRules(verbs: string[], subjects: string[]): ConjugationRule[] {
    const rules: ConjugationRule[] = [];

    for (const verb of verbs) {
      const verbBase = verb.toLowerCase();

      for (const subject of subjects) {
        const subjLower = subject.toLowerCase();
        const conjugated = this.conjugateVerb(verbBase, subjLower);

        if (conjugated !== verb) {
          rules.push({ verb: verbBase, subject: subjLower, conjugated });
        }

        if (rules.length >= 20) break;
      }

      if (rules.length >= 20) break;
    }

    return rules;
  }

  // ========================================
  // MAIN GENERATION METHOD
  // ========================================

  /**
   * Genera ejercicios JanusComposer completos
   * @param phrases - Array de frases en el idioma de aprendizaje
   * @returns Array de ejercicios JanusComposer
   */
  generate(phrases: string[]): JanusComposer[] {
    if (phrases.length === 0) return [];

    // Extraer componentes
    const subjects = this.extractSubjects(phrases);
    const verbs = this.extractVerbs(phrases);
    const complements = this.extractComplements(phrases);

    // Construir reglas de conjugación
    const conjugationRules = this.buildConjugationRules(verbs, subjects);

    // Constrir columnas del ejercicio
    const subjectOptions = this.buildSubjectColumn(subjects);
    const verbOptions = this.buildVerbColumn(verbs);
    const complementOptions = this.buildComplementColumn(complements);

    // Construir diálogos de práctica
    const practiceDialogues = this.buildPracticeDialogues(phrases);

    // Componer ejercicio final
    return [{
      id: `janus-imported-${this.language}-1`,
      columns: [subjectOptions, verbOptions, complementOptions],
      conjugationRules,
      practiceDialogues,
    }];
  }

  /**
   * Construye la columna de sujetos
   * @param subjects - Array de sujetos
   * @returns Columna de sujetos para JanusComposer
   */
  private buildSubjectColumn(subjects: string[]) {
    const subjectOptions = this.subjects
      .filter(s => subjects.includes(s.text))
      .slice(0, 4);

    if (subjectOptions.length < 2) {
      subjectOptions.push(...this.subjects.slice(0, 4));
    }

    return {
      id: 'subject-col',
      title: this.subjects[0]?.translation || 'Sujeto', // Usar título desde config o fallback
      type: 'subject' as const,
      options: Array.from(new Set(subjectOptions.map(s => JSON.stringify(s))))
        .map(s => JSON.parse(s))
        .slice(0, 4)
        .map((s: Subject, i: number) => ({
          id: `subj-${i}`,
          text: s.text,
          translation: s.translation,
        })),
    };
  }

  /**
   * Construye la columna de verbos
   * @param verbs - Array de verbos
   * @returns Columna de verbos para JanusComposer
   */
  private buildVerbColumn(verbs: string[]) {
    const config = getLanguageConfig(this.language);
    const verbOptions = verbs.length >= 2 ? verbs : this.defaultVerbs;

    return {
      id: 'verb-col',
      title: config.janus.labels.columnTitles.verb,
      type: 'verb' as const,
      options: Array.from(new Set(verbOptions))
        .slice(0, 6)
        .map((v, i) => ({
          id: `verb-${i}`,
          text: v,
          translation: '',
        })),
    };
  }

  /**
   * Construye la columna de complementos
   * @param complements - Array de complementos
   * @returns Columna de complementos para JanusComposer
   */
  private buildComplementColumn(complements: string[]) {
    const config = getLanguageConfig(this.language);
    const complementOptions = complements.length >= 2 ? complements : this.defaultComplements;

    return {
      id: 'complement-col',
      title: config.janus.labels.columnTitles.complement,
      type: 'complement' as const,
      options: Array.from(new Set(complementOptions))
        .slice(0, 6)
        .map((c, i) => ({
          id: `comp-${i}`,
          text: c,
          translation: '',
        })),
    };
  }

  /**
   * Construye diálogos de práctica
   * @param phrases - Array de frases
   * @returns Array de diálogos de práctica
   */
  private buildPracticeDialogues(phrases: string[]) {
    const config = getLanguageConfig(this.language);
    const greeting = config.janus.labels.greeting;

    if (phrases.length === 0) {
      return [{
        id: 'dialogue-1',
        prompt: greeting,
        response: greeting,
      }];
    }

    return phrases
      .slice(0, Math.min(2, phrases.length))
      .map((phrase, i) => ({
        id: `dialogue-${i + 1}`,
        prompt: i === 0 ? greeting : phrases[0],
        response: phrase,
      }));
  }
}

/**
 * Función de conveniencia para generar ejercicios JanusComposer
 * Mantiene compatibilidad con código existente
 * @param phrases - Array de frases en el idioma de aprendizaje
 * @param language - Idioma de las frases (default: 'de')
 * @returns Array de ejercicios JanusComposer
 */
export function generateJanusComposerExercises(
  phrases: string[],
  language: SupportedLanguage = 'de'
): JanusComposer[] {
  const generator = new JanusComposerGenerator(language);
  return generator.generate(phrases);
}
