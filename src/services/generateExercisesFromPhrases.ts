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
      rhythmPatterns: dialogue.map((turn, turnIndex) => ({
        turnIndex,
        segments: Array(10).fill(0).map(() => Math.random() * 100 + 50),
        pauses: Array(9).fill(0).map(() => Math.random() * 50 + 20),
      })),
    });
  }

  return exercises;
}

// Generar ejercicios JanusComposer a partir de frases
export function generateJanusComposerExercises(phrases: string[]): JanusComposer[] {
  // Siempre generar al menos un ejercicio básico, incluso con una sola frase
  if (phrases.length === 0) return [];

  // Sujetos comunes en francés
  const commonSubjects = [
    { text: 'Je', translation: 'Yo' },
    { text: 'Tu', translation: 'Tú' },
    { text: 'Il', translation: 'Él' },
    { text: 'Elle', translation: 'Ella' },
    { text: 'Nous', translation: 'Nosotros' },
    { text: 'Vous', translation: 'Ustedes/Vosotros' },
  ];

  // Verbos comunes y sus conjugaciones
  const commonVerbs = [
    'être', 'avoir', 'aller', 'venir', 'faire', 'dire', 'voir', 'savoir',
    'pouvoir', 'vouloir', 'devoir', 'parler', 'manger', 'boire', 'prendre',
    'donner', 'trouver', 'chercher', 'regarder', 'écouter', 'comprendre',
  ];

  // Palabras comunes que NO son verbos
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'd', 'à', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'car', 'avec', 'sans', 'pour', 'par', 'sur',
    'sous', 'dans', 'en', 'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'où',
    'quand', 'comment', 'pourquoi', 'très', 'trop', 'beaucoup', 'peu', 'bien',
    'mal', 'plus', 'moins', 'aussi', 'toujours', 'jamais', 'maintenant',
  ]);

  // Extraer verbos y complementos de las frases
  const extractedVerbs = new Set<string>();
  const extractedComplements = new Set<string>();
  const extractedSubjects = new Set<string>();

  phrases.forEach((phrase) => {
    const words = phrase.split(/\s+/).map(w => w.replace(/[.,!?;:()\[\]{}'"]/g, ''));
    
    // Buscar sujetos al inicio de la frase
    const firstWord = words[0];
    if (commonSubjects.some(s => s.text.toLowerCase() === firstWord.toLowerCase())) {
      extractedSubjects.add(firstWord);
    }

    // Buscar verbos (palabras después del sujeto que pueden ser verbos)
    for (let i = 1; i < Math.min(words.length, 5); i++) {
      const word = words[i].toLowerCase();
      const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '');
      
      // Si es un verbo común o tiene características de verbo
      if (commonVerbs.some(v => cleanWord.startsWith(v) || cleanWord.includes(v))) {
        extractedVerbs.add(words[i]);
      } else if (
        cleanWord.length >= 4 &&
        !stopWords.has(cleanWord) &&
        !extractedVerbs.has(words[i]) &&
        extractedVerbs.size < 8
      ) {
        // Verificar si podría ser un verbo conjugado
        const verbEndings = ['er', 'ir', 're', 'ons', 'ez', 'ent', 'ais', 'ait'];
        if (verbEndings.some(ending => cleanWord.endsWith(ending))) {
          extractedVerbs.add(words[i]);
        }
      }
    }

    // Extraer complementos (sustantivos y adjetivos)
    for (let i = 2; i < words.length; i++) {
      const word = words[i].toLowerCase();
      const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '');
      
      if (
        cleanWord.length >= 4 &&
        !stopWords.has(cleanWord) &&
        !extractedVerbs.has(words[i]) &&
        !extractedSubjects.has(words[i]) &&
        extractedComplements.size < 10
      ) {
        extractedComplements.add(words[i]);
      }
    }
  });

  // Si no hay suficientes elementos, usar valores por defecto
  const verbs = Array.from(extractedVerbs).length > 0
    ? Array.from(extractedVerbs).slice(0, 6)
    : ['suis', 'ai', 'vais', 'veux', 'peux', 'fais'];

  const complements = Array.from(extractedComplements).length > 0
    ? Array.from(extractedComplements).slice(0, 6)
    : ['bien', 'mal', 'beaucoup', 'maintenant', 'demain', 'aujourd\'hui'];

  const subjects = Array.from(extractedSubjects).length > 0
    ? Array.from(extractedSubjects).slice(0, 4)
    : ['Je', 'Tu', 'Il', 'Elle'];

  // Crear reglas de conjugación básicas
  const conjugationRules: Array<{ verb: string; subject: string; conjugated: string }> = [];
  
  verbs.forEach(verb => {
    const verbBase = verb.toLowerCase();
    subjects.forEach(subject => {
      const subjLower = subject.toLowerCase();
      let conjugated = verb;
      
      // Conjugaciones básicas comunes
      if (verbBase.includes('suis') || verbBase === 'être') {
        const conjugations: Record<string, string> = {
          'je': 'suis', 'tu': 'es', 'il': 'est', 'elle': 'est',
          'nous': 'sommes', 'vous': 'êtes'
        };
        conjugated = conjugations[subjLower] || verb;
      } else if (verbBase.includes('ai') || verbBase === 'avoir') {
        const conjugations: Record<string, string> = {
          'je': 'ai', 'tu': 'as', 'il': 'a', 'elle': 'a',
          'nous': 'avons', 'vous': 'avez'
        };
        conjugated = conjugations[subjLower] || verb;
      } else if (verbBase.endsWith('er') && verbBase.length > 2) {
        const root = verbBase.slice(0, -2);
        const conjugations: Record<string, string> = {
          'je': root + 'e', 'tu': root + 'es', 'il': root + 'e', 'elle': root + 'e',
          'nous': root + 'ons', 'vous': root + 'ez'
        };
        conjugated = conjugations[subjLower] || verb;
      }
      
      if (conjugated !== verb) {
        conjugationRules.push({
          verb: verbBase,
          subject: subjLower,
          conjugated,
        });
      }
    });
  });

  // Generar al menos un ejercicio, incluso si hay pocas frases
  const exercises: JanusComposer[] = [];

  // Asegurar que siempre haya al menos 2 opciones por columna (requisito del schema)
  const subjectOptions = commonSubjects
    .filter(s => subjects.includes(s.text))
    .slice(0, 4);
  
  // Si no hay suficientes sujetos extraídos, usar todos los comunes
  if (subjectOptions.length < 2) {
    subjectOptions.push(...commonSubjects.slice(0, 4));
  }

  const verbOptions = verbs.length >= 2 
    ? verbs.slice(0, 6)
    : ['suis', 'ai', 'vais', 'veux', 'peux', 'fais'];

  const complementOptions = complements.length >= 2
    ? complements.slice(0, 6)
    : ['bien', 'mal', 'beaucoup', 'maintenant', 'demain', 'aujourd\'hui'];

  // Crear ejercicio principal con todas las opciones
  exercises.push({
    id: 'janus-imported-1',
    columns: [
      {
        id: 'subject-col',
        title: 'Sujeto',
        type: 'subject',
        options: Array.from(new Set(subjectOptions.map(s => JSON.stringify(s))))
          .map(s => JSON.parse(s))
          .slice(0, 4)
          .map((s: { text: string; translation: string }, i: number) => ({
            id: `subj-${i}`,
            text: s.text,
            translation: s.translation,
          })),
      },
      {
        id: 'verb-col',
        title: 'Verbo',
        type: 'verb',
        options: Array.from(new Set(verbOptions))
          .slice(0, 6)
          .map((v, i) => ({
            id: `verb-${i}`,
            text: v,
            translation: '',
          })),
      },
      {
        id: 'complement-col',
        title: 'Complemento',
        type: 'complement',
        options: Array.from(new Set(complementOptions))
          .slice(0, 6)
          .map((c, i) => ({
            id: `comp-${i}`,
            text: c,
            translation: '',
          })),
      },
    ],
    conjugationRules: conjugationRules.slice(0, 20), // Limitar reglas
    practiceDialogues: phrases.length > 0
      ? phrases.slice(0, Math.min(2, phrases.length)).map((phrase, i) => ({
          id: `dialogue-${i + 1}`,
          prompt: i === 0 ? 'Bonjour!' : phrases[0] || 'Bonjour!',
          response: phrase,
        }))
      : [
          {
            id: 'dialogue-1',
            prompt: 'Bonjour!',
            response: 'Bonjour!',
          },
        ],
  });

  return exercises;
}

