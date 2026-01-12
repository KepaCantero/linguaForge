/**
 * Servicio para generar ejercicios completos a partir de frases importadas
 * Genera: Cloze, Variations, ConversationalEcho, DialogueIntonation, JanusComposer
 */

import type { 
  Phrase, 
  ConversationalEcho, 
  DialogueIntonation, 
  JanusComposer,
  DialogueIntonationTurn,
} from '@/types';

// Generar ejercicios Cloze a partir de frases
export function generateClozeExercises(phrases: string[]): Phrase[] {
  if (!phrases || phrases.length === 0) return [];
  
  return phrases.map((phraseText, index) => {
    const words = phraseText.split(/\s+/);
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'et', 'ou', 'mais', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'est', 'sont', 'être', 'avoir', 'avec', 'sans', 'pour', 'par'];
    
    const keywords = words.filter(
      (word) => word.length >= 4 && !stopWords.includes(word.toLowerCase().replace(/[.,!?;:]/g, ''))
    );

    const targetWord = keywords.length > 0 
      ? keywords[Math.floor(Math.random() * keywords.length)]
      : words.find((w) => w.length >= 4) || words[words.length - 1];

    const incorrectOptions = [
      targetWord.split('').reverse().join(''),
      targetWord.substring(0, targetWord.length - 1),
      targetWord + 's',
      words.find((w) => w !== targetWord && w.length >= 4) || 'autre',
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

// Generar ejercicios Variations a partir de frases
export function generateVariationsExercises(phrases: string[]): Phrase[] {
  if (!phrases || phrases.length === 0) return [];

  return phrases.map((phraseText, index) => {
    const words = phraseText.split(/\s+/);
    const targetWord = words.find((w) => w.length >= 4) || words[0] || 'mot';

    return {
      id: `phrase-variations-${index}`,
      text: phraseText,
      translation: '',
      clozeWord: targetWord.replace(/[.,!?;:]/g, ''),
      clozeOptions: [
        { id: 'opt-correct', text: targetWord.replace(/[.,!?;:]/g, ''), isCorrect: true },
        { id: 'opt-1', text: 'option1', isCorrect: false },
        { id: 'opt-2', text: 'option2', isCorrect: false },
        { id: 'opt-3', text: 'option3', isCorrect: false },
      ],
      variations: [],
    };
  });
}

// Generar ejercicios ConversationalEcho a partir de frases
export function generateConversationalEchoExercises(phrases: string[]): ConversationalEcho[] {
  if (!phrases || phrases.length < 2) return [];
  
  // Agrupar frases en pares para crear diálogos
  const exercises: ConversationalEcho[] = [];
  
  for (let i = 0; i < phrases.length - 1; i += 2) {
    const systemPhrase = phrases[i];
    const userResponse = phrases[i + 1];
    
    // Extraer palabras clave de la respuesta
    const keywords = userResponse
      .split(/\s+/)
      .filter((w) => w.length >= 4)
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

// Generar ejercicios DialogueIntonation a partir de frases
export function generateDialogueIntonationExercises(phrases: string[]): DialogueIntonation[] {
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

// ============================================================
// JANUS COMPOSER GENERATOR (Refactored - SRP compliant)
// ============================================================

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
 * Generador de ejercicios JanusComposer
 * Refactorizado desde función monolítica de 217 líneas
 * Sigue Single Responsibility Principle
 */
export class JanusComposerGenerator {
  private readonly commonSubjects: Subject[] = [
    { text: 'Je', translation: 'Yo' },
    { text: 'Tu', translation: 'Tú' },
    { text: 'Il', translation: 'Él' },
    { text: 'Elle', translation: 'Ella' },
    { text: 'Nous', translation: 'Nosotros' },
    { text: 'Vous', translation: 'Ustedes/Vosotros' },
  ];

  private readonly commonVerbs = [
    'être', 'avoir', 'aller', 'venir', 'faire', 'dire', 'voir', 'savoir',
    'pouvoir', 'vouloir', 'devoir', 'parler', 'manger', 'boire', 'prendre',
    'donner', 'trouver', 'chercher', 'regarder', 'écouter', 'comprendre',
  ];

  private readonly stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'd', 'à', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'car', 'avec', 'sans', 'pour', 'par', 'sur',
    'sous', 'dans', 'en', 'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'où',
    'quand', 'comment', 'pourquoi', 'très', 'trop', 'beaucoup', 'peu', 'bien',
    'mal', 'plus', 'moins', 'aussi', 'toujours', 'jamais', 'maintenant',
  ]);

  private readonly verbEndings = ['er', 'ir', 're', 'ons', 'ez', 'ent', 'ais', 'ait'];

  private readonly defaultVerbs = ['suis', 'ai', 'vais', 'veux', 'peux', 'fais'];
  private readonly defaultComplements = ['bien', 'mal', 'beaucoup', 'maintenant', 'demain', "aujourd'hui"];
  private readonly defaultSubjects = ['Je', 'Tu', 'Il', 'Elle'];

  // ========================================
  // EXTRACTION METHODS
  // ========================================

  /**
   * Extrae sujetos de las frases proporcionadas
   * @param phrases - Array de frases en francés
   * @returns Array de sujetos extraídos
   */
  extractSubjects(phrases: string[]): string[] {
    const extractedSubjects = new Set<string>();

    for (const phrase of phrases) {
      const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()\[\]{}'"]/g, ''));
      const firstWord = words[0];

      if (this.commonSubjects.some(s => s.text.toLowerCase() === firstWord.toLowerCase())) {
        extractedSubjects.add(firstWord);
      }
    }

    const subjects = Array.from(extractedSubjects);
    return subjects.length > 0 ? subjects.slice(0, 4) : this.defaultSubjects;
  }

  /**
   * Extrae verbos de las frases proporcionadas
   * @param phrases - Array de frases en francés
   * @returns Array de verbos extraídos
   */
  extractVerbs(phrases: string[]): string[] {
    const extractedVerbs = new Set<string>();

    for (const phrase of phrases) {
      const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()\[\]{}'"]/g, ''));

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
   * @param phrases - Array de frases en francés
   * @returns Array de complementos extraídos
   */
  extractComplements(phrases: string[]): string[] {
    const extractedComplements = new Set<string>();
    const extractedVerbs = new Set(this.extractVerbs(phrases));
    const extractedSubjects = new Set(this.extractSubjects(phrases));

    for (const phrase of phrases) {
      const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()\[\]{}'"]/g, ''));

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
  // CONJUGATION RULES
  // ========================================

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

  /**
   * Conjuga un verbo para un sujeto específico
   * @param verbBase - Verbo en forma base
   * @param subject - Sujeto (je, tu, il, etc.)
   * @returns Verbo conjugado
   */
  private conjugateVerb(verbBase: string, subject: string): string {
    // Conjugación de être
    if (verbBase.includes('suis') || verbBase === 'être') {
      const êtreConjugations: Record<string, string> = {
        'je': 'suis', 'tu': 'es', 'il': 'est', 'elle': 'est',
        'nous': 'sommes', 'vous': 'êtes'
      };
      return êtreConjugations[subject] || verbBase;
    }

    // Conjugación de avoir
    if (verbBase.includes('ai') || verbBase === 'avoir') {
      const avoirConjugations: Record<string, string> = {
        'je': 'ai', 'tu': 'as', 'il': 'a', 'elle': 'a',
        'nous': 'avons', 'vous': 'avez'
      };
      return avoirConjugations[subject] || verbBase;
    }

    // Verbos -er (primer grupo)
    if (verbBase.endsWith('er') && verbBase.length > 2) {
      const root = verbBase.slice(0, -2);
      const erConjugations: Record<string, string> = {
        'je': root + 'e', 'tu': root + 'es', 'il': root + 'e', 'elle': root + 'e',
        'nous': root + 'ons', 'vous': root + 'ez'
      };
      return erConjugations[subject] || verbBase;
    }

    return verbBase;
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Verifica si una palabra es un verbo
   * @param word - Palabra a verificar
   * @returns true si la palabra parece ser un verbo
   */
  private isVerb(word: string): boolean {
    const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '');

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

  // ========================================
  // MAIN GENERATION METHOD
  // ========================================

  /**
   * Genera ejercicios JanusComposer completos
   * @param phrases - Array de frases en francés
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
      id: 'janus-imported-1',
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
    const subjectOptions = this.commonSubjects
      .filter(s => subjects.includes(s.text))
      .slice(0, 4);

    if (subjectOptions.length < 2) {
      subjectOptions.push(...this.commonSubjects.slice(0, 4));
    }

    return {
      id: 'subject-col',
      title: 'Sujeto',
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
    const verbOptions = verbs.length >= 2 ? verbs : this.defaultVerbs;

    return {
      id: 'verb-col',
      title: 'Verbo',
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
    const complementOptions = complements.length >= 2 ? complements : this.defaultComplements;

    return {
      id: 'complement-col',
      title: 'Complemento',
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
    if (phrases.length === 0) {
      return [{
        id: 'dialogue-1',
        prompt: 'Bonjour!',
        response: 'Bonjour!',
      }];
    }

    return phrases
      .slice(0, Math.min(2, phrases.length))
      .map((phrase, i) => ({
        id: `dialogue-${i + 1}`,
        prompt: i === 0 ? 'Bonjour!' : phrases[0] || 'Bonjour!',
        response: phrase,
      }));
  }
}

/**
 * Función de conveniencia para generar ejercicios JanusComposer
 * Mantiene compatibilidad con código existente
 * @param phrases - Array de frases en francés
 * @returns Array de ejercicios JanusComposer
 */
export function generateJanusComposerExercises(phrases: string[]): JanusComposer[] {
  const generator = new JanusComposerGenerator();
  return generator.generate(phrases);
}

