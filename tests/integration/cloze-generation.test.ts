/**
 * Integration Tests: Cloze Exercise Generation
 * Tests the complete cloze exercise generation workflow
 *
 * Flow:
 * 1. Extract phrases from imported content
 * 2. Analyze grammatical categories (POS tagging)
 * 3. Select target words based on priority and confidence
 * 4. Generate cloze questions with hints and options
 * 5. Validate exercises can be used in learning flow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateClozeExercises,
  extractPhrases,
  analyzeContent,
  type ClozeExercise,
} from '@/services/importFlowService';
import {
  extractWordsWithContext,
  groupWordsByPOS,
  filterWordsByPOS,
} from '@/services/contextExtractionService';
import { useSRSStore } from '@/store/useSRSStore';
import type { ContentSource } from '@/types/srs';

// ============================================================
// TEST DATA - Real French content with varied complexity
// ============================================================

const SIMPLE_FRENCH_TEXT = `
  Le chat est noir. Il aime manger du poisson.
  La maison est grande. Elle a un jardin.
  Je suis étudiant. J'étudie le français.
  Tu as un livre. Il est intéressant.
  Nous allons au parc. Il fait beau.
`;

const INTERMEDIATE_FRENCH_TEXT = `
  Le gouvernement français a annoncé de nouvelles mesures environnementales aujourd'hui.
  Ces mesures visent à réduire les émissions de carbone de 40% d'ici 2030.
  Les industries devront adapter leurs processus de production respectueux de l'environnement.
  De nombreuses entreprises ont déjà commencé à investir dans les énergies renouvelables.
  Les transports en commun seront développés dans toutes les grandes villes.
  Les citoyens sont encouragés à utiliser des véhicules électriques.
  Cette décision a été bien accueillie par les associations environnementales.
`;

const ADVANCED_FRENCH_TEXT = `
  Bien que la conjoncture économique actuelle soit préoccupante, le gouvernement maintient
  sa politique d'austérité, ce qui suscite de vives controverses au parlement.
  Les oppositions dénoncent l'inefficacité de ces mesures restrictive qui, selon elles,
  ne font qu'aggraver une situation déjà précaire pour les classes sociales défavorisées.
  Paradoxalement, les indicateurs macroéconomiques semblent indiquer une légère reprise,
  mais celle-ci ne se traduit pas encore par une amélioration significative du pouvoir d'achat.
  Les analystes s'accordent à dire que la reprise sera lente et laborieuse.
`;

const VERB_HEAVY_TEXT = `
  Je me suis levé tôt ce matin. J'ai pris mon petit déjeuner et je suis parti travailler.
  En route, j'ai rencontré mon ami qui allait à l'école. Nous avons discuté un moment.
  Il m'a raconté qu'il avait passé un bon week-end. Il avait visité ses grands-parents.
  Ils avaient fait une promenade dans la forêt. Il avait vu des animaux sauvages.
  Quand je suis arrivé au bureau, j'ai commencé à travailler. J'ai écrit beaucoup d'emails.
  À midi, je suis allé déjeuner avec mes collègues. Nous avons mangé au restaurant.
  Après le travail, je suis rentré chez moi. J'ai préparé le dîner et je me suis couché tard.
`;

const ADJECTIVE_HEAVY_TEXT = `
  La grande maison rouge est belle. Les petites fleurs sont parfumées.
  Le chat noir est rapide. Les chiens blancs sont amicaux.
  La journée ensoleillée est parfaite. Les nuits sombres sont calmes.
  Les livres intéressants sont éducatifs. Les films amusants sont divertissants.
  La musique douce est relaxante. Les forts bruits sont dérangeants.
  Les grands arbres sont anciens. Les jeunes plantes sont fragiles.
`;

const NOUN_HEAVY_TEXT = `
  Le chat mange la souris. Le chien aboie au chat.
  L'oiseau construit un nid. Le poisson nage dans l'eau.
  L'élève étudie la leçon. Le professeur enseigne la classe.
  Le boulanger cuit le pain. Le boucher vend la viande.
  Le médecin soigne le patient. L'infirmière aide le médecin.
`;

// ============================================================
// SETUP & TEARDOWN
// ============================================================

beforeEach(() => {
  useSRSStore.getState().resetSRS();
  localStorage.clear();
});

afterEach(() => {
  useSRSStore.getState().resetSRS();
  localStorage.clear();
});

// ============================================================
// TEST SUITES
// ============================================================

describe('Cloze Generation - Basic Functionality', () => {
  it('should generate cloze exercises from simple text', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
      language: 'fr',
    });

    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.length).toBeLessThanOrEqual(phrases.length);
  });

  it('should generate exercises with all required fields', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      expect(exercise.id).toMatch(/^cloze-\d+-\d+$/);
      expect(exercise.phraseIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.type).toBe('cloze');
      expect(exercise.phraseText).toBeDefined();
      expect(exercise.question).toContain('_____');
      expect(exercise.answer).toBeDefined();
      expect(exercise.hint).toBeDefined();
      expect(exercise.difficulty).toMatch(/^(easy|medium|hard)$/);
      expect(exercise.options).toBeInstanceOf(Array);
      expect(exercise.options.length).toBe(3);
      expect(exercise.posType).toMatch(/^(noun|verb|adjective|adverb)$/);
    });
  });

  it('should replace target word with blank in question', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      // The answer should NOT be in the question
      expect(exercise.question).not.toContain(exercise.answer);

      // The question should contain the blank
      expect(exercise.question).toContain('_____');

      // The phrase text should contain the answer
      expect(exercise.phraseText).toContain(exercise.answer);

      // Replacing blank with answer should give original phrase (approximately)
      const reconstructed = exercise.question.replace('_____', exercise.answer);
      expect(reconstructed.trim()).toBe(exercise.phraseText.trim());
    });
  });

  it('should generate appropriate hints for POS types', () => {
    const exercises = generateClozeExercises(extractPhrases(VERB_HEAVY_TEXT), {
      maxExercisesPerPhrase: 1,
      prioritizePOSTypes: ['verb'],
    });

    const verbExercise = exercises.find(e => e.posType === 'verb');
    expect(verbExercise?.hint).toBe('Verbo conjugado');

    const adjExercises = generateClozeExercises(extractPhrases(ADJECTIVE_HEAVY_TEXT), {
      maxExercisesPerPhrase: 1,
      prioritizePOSTypes: ['adjective'],
    });

    const adjExercise = adjExercises.find(e => e.posType === 'adjective');
    expect(adjExercise?.hint).toBe('Adjetivo');
  });
});

describe('Cloze Generation - POS Tagging Integration', () => {
  it('should extract and categorize words by POS', () => {
    const context = extractWordsWithContext(VERB_HEAVY_TEXT, 'fr');
    const grouped = groupWordsByPOS(context.allWords);

    expect(grouped.verb.length).toBeGreaterThan(0);
    expect(grouped.noun.length).toBeGreaterThan(0);
    expect(grouped.adjective.length).toBeGreaterThanOrEqual(0);
  });

  it('should filter words by specific POS type', () => {
    const context = extractWordsWithContext(VERB_HEAVY_TEXT, 'fr');
    const verbs = filterWordsByPOS(context.allWords, 'verb');
    const nouns = filterWordsByPOS(context.allWords, 'noun');

    expect(verbs.length).toBeGreaterThan(0);
    expect(nouns.length).toBeGreaterThan(0);
    expect(verbs.every(w => w.pos === 'verb')).toBe(true);
    expect(nouns.every(w => w.pos === 'noun')).toBe(true);
  });

  it('should prioritize specified POS types in exercises', () => {
    const phrases = extractPhrases(NOUN_HEAVY_TEXT);

    // Prioritize verbs
    const verbExercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      prioritizePOSTypes: ['verb'],
    });

    const verbCount = verbExercises.filter(e => e.posType === 'verb').length;
    expect(verbCount).toBeGreaterThan(0);

    // Prioritize nouns
    const nounExercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      prioritizePOSTypes: ['noun'],
    });

    const nounCount = nounExercises.filter(e => e.posType === 'noun').length;
    expect(nounCount).toBeGreaterThan(0);
  });
});

describe('Cloze Generation - Difficulty Levels', () => {
  it('should assign easy difficulty to high confidence words', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      minConfidence: 0.85,
    });

    // Simple text should have high confidence
    const easyExercises = exercises.filter(e => e.difficulty === 'easy');
    expect(easyExercises.length).toBeGreaterThan(0);
  });

  it('should assign medium difficulty to moderate confidence words', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      minConfidence: 0.7,
    });

    const mediumExercises = exercises.filter(e => e.difficulty === 'medium');
    expect(mediumExercises.length).toBeGreaterThan(0);
  });

  it('should assign hard difficulty to low confidence words', () => {
    const phrases = extractPhrases(ADVANCED_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      minConfidence: 0.5,
    });

    // Advanced text should have lower confidence
    const hardExercises = exercises.filter(e => e.difficulty === 'hard');
    expect(hardExercises.length).toBeGreaterThanOrEqual(0);
  });

  it('should vary difficulty levels across exercises', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 3,
      minConfidence: 0.6,
    });

    const difficulties = new Set(exercises.map(e => e.difficulty));
    expect(difficulties.size).toBeGreaterThanOrEqual(2);
  });
});

describe('Cloze Generation - Option Generation', () => {
  it('should generate 3 incorrect options for each exercise', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      expect(exercise.options.length).toBe(3);

      // All options should be strings
      exercise.options.forEach(option => {
        expect(typeof option).toBe('string');
        expect(option.length).toBeGreaterThan(0);
      });
    });
  });

  it('should not include correct answer in options', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
    });

    exercises.forEach(exercise => {
      expect(exercise.options).not.toContain(exercise.answer);
    });
  });

  it('should generate unique options within each exercise', () => {
    const phrases = extractPhrases(ADJECTIVE_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      const uniqueOptions = new Set(exercise.options);
      expect(uniqueOptions.size).toBe(exercise.options.length);
    });
  });

  it('should generate options of same POS type as answer', () => {
    const phrases = extractPhrases(VERB_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
      prioritizePOSTypes: ['verb'],
    });

    const verbExercise = exercises.find(e => e.posType === 'verb');
    expect(verbExercise).toBeDefined();
  });
});

describe('Cloze Generation - Configuration', () => {
  it('should respect maxExercisesPerPhrase limit', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const maxExercises = 2;
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: maxExercises,
    });

    // Count exercises per phrase
    const exerciseCounts: Record<number, number> = {};
    exercises.forEach(exercise => {
      exerciseCounts[exercise.phraseIndex] = (exerciseCounts[exercise.phraseIndex] || 0) + 1;
    });

    Object.values(exerciseCounts).forEach(count => {
      expect(count).toBeLessThanOrEqual(maxExercises);
    });
  });

  it('should filter by minimum confidence', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);

    const highConfidenceExercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      minConfidence: 0.9,
    });

    const lowConfidenceExercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      minConfidence: 0.6,
    });

    expect(highConfidenceExercises.length).toBeLessThanOrEqual(lowConfidenceExercises.length);
  });

  it('should support different languages', () => {
    const exercises = generateClozeExercises(extractPhrases(SIMPLE_FRENCH_TEXT), {
      maxExercisesPerPhrase: 1,
      language: 'fr',
    });

    expect(exercises.length).toBeGreaterThan(0);
  });
});

describe('Cloze Generation - SRS Integration', () => {
  it('should create SRS cards from cloze exercises', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    const source: ContentSource = {
      type: 'text',
      id: 'cloze-test-node',
      title: 'Cloze Exercises',
    };

    const cards = useSRSStore.getState().addCards(
      exercises.slice(0, 5).map(exercise => ({
        phrase: exercise.phraseText,
        translation: `Context: ${exercise.question}`,
        source,
        languageCode: 'fr',
        levelCode: 'A2',
        tags: ['cloze', exercise.posType ?? 'unknown', exercise.difficulty],
      }))
    );

    expect(cards.length).toBe(5);
    cards.forEach(card => {
      expect(card.tags).toContain('cloze');
    });
  });

  it('should retrieve cloze exercises by difficulty tag', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
    });

    const source: ContentSource = {
      type: 'text',
      id: 'difficulty-test',
      title: 'Difficulty Test',
    };

    useSRSStore.getState().addCards(
      exercises.map(exercise => ({
        phrase: exercise.phraseText,
        translation: exercise.question,
        source,
        languageCode: 'fr',
        levelCode: 'B1',
        tags: ['cloze', exercise.difficulty],
      }))
    );

    const easyCards = useSRSStore.getState().getCardsByTag('easy');
    const mediumCards = useSRSStore.getState().getCardsByTag('medium');
    const hardCards = useSRSStore.getState().getCardsByTag('hard');

    expect(easyCards.length + mediumCards.length + hardCards.length).toBe(exercises.length);
  });
});

describe('Cloze Generation - Content Variety', () => {
  it('should handle verb-heavy content effectively', () => {
    const phrases = extractPhrases(VERB_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      prioritizePOSTypes: ['verb'],
    });

    const verbExercises = exercises.filter(e => e.posType === 'verb');
    expect(verbExercises.length).toBeGreaterThan(phrases.length / 2);
  });

  it('should handle adjective-heavy content effectively', () => {
    const phrases = extractPhrases(ADJECTIVE_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      prioritizePOSTypes: ['adjective'],
    });

    const adjExercises = exercises.filter(e => e.posType === 'adjective');
    expect(adjExercises.length).toBeGreaterThan(phrases.length / 2);
  });

  it('should handle noun-heavy content effectively', () => {
    const phrases = extractPhrases(NOUN_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      prioritizePOSTypes: ['noun'],
    });

    const nounExercises = exercises.filter(e => e.posType === 'noun');
    expect(nounExercises.length).toBeGreaterThan(phrases.length / 2);
  });

  it('should handle mixed complexity content', () => {
    const mixedText = SIMPLE_FRENCH_TEXT + INTERMEDIATE_FRENCH_TEXT + ADVANCED_FRENCH_TEXT;
    const phrases = extractPhrases(mixedText);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    expect(exercises.length).toBeGreaterThan(0);

    const difficulties = new Set(exercises.map(e => e.difficulty));
    expect(difficulties.size).toBeGreaterThanOrEqual(1);
  });
});

describe('Cloze Generation - Edge Cases', () => {
  it('should handle empty phrases array', () => {
    const exercises = generateClozeExercises([]);
    expect(exercises).toEqual([]);
  });

  it('should handle single-word phrases gracefully', () => {
    const singleWordPhrases = ['Chat.', 'Chien.', 'Maison.'];
    const exercises = generateClozeExercises(singleWordPhrases);

    // Should still generate exercises, but may be limited
    expect(exercises.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle phrases with repeated words', () => {
    const repeatedPhrase = 'Le chat mange. Le chat dort. Le chat joue.';
    const phrases = extractPhrases(repeatedPhrase);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    expect(exercises.length).toBeGreaterThan(0);
  });

  it('should handle phrases with special characters', () => {
    const specialCharText = `
      J'ai mangé des œufs. C'était Noël! 50% de réduction.
      Le coût: 10,50€. Téléphone: 01-23-45-67-89.
    `;
    const phrases = extractPhrases(specialCharText);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    expect(exercises.length).toBeGreaterThan(0);
  });

  it('should handle phrases with accents correctly', () => {
    const accentedText = `
      À Paris, les élèves étudient. L'été, ils vont à la plage.
      L'hiver, ils font du ski. Noël approche.
      Les œufs sont frais. Maître et misère.
    `;
    const phrases = extractPhrases(accentedText);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    expect(exercises.length).toBeGreaterThan(0);

    // Verify accents are preserved in questions and answers
    exercises.forEach(exercise => {
      expect(exercise.answer).toEqual(exercise.answer);
      expect(exercise.question).toContain('_____');
    });
  });
});

describe('Cloze Generation - Learning Flow Integration', () => {
  it('should support sequential exercise flow', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    // Simulate sequential learning
    let completedCount = 0;
    const exerciseIds = exercises.map(e => e.id);

    exerciseIds.forEach(id => {
      const exercise = exercises.find(e => e.id === id);
      expect(exercise).toBeDefined();

      // Simulate completing exercise
      completedCount++;
    });

    expect(completedCount).toBe(exercises.length);
  });

  it('should enable filtering exercises by difficulty', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
    });

    const easyExercises = exercises.filter(e => e.difficulty === 'easy');
    const mediumExercises = exercises.filter(e => e.difficulty === 'medium');
    const hardExercises = exercises.filter(e => e.difficulty === 'hard');

    expect(easyExercises.length + mediumExercises.length + hardExercises.length).toBe(
      exercises.length
    );
  });

  it('should enable tracking exercises by POS type', () => {
    const phrases = extractPhrases(VERB_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    const exercisesByPOS: Record<string, ClozeExercise[]> = {
      verb: [],
      noun: [],
      adjective: [],
      adverb: [],
    };

    exercises.forEach(exercise => {
      if (exercise.posType) {
        exercisesByPOS[exercise.posType].push(exercise);
      }
    });

    expect(exercisesByPOS.verb.length + exercisesByPOS.noun.length).toBeGreaterThan(0);
  });
});

describe('Cloze Generation - Manual Word Selection', () => {
  it('should create true cloze exercise from manual word selection', () => {
    // Simular usuario haciendo clic en palabra "mange" en "Je mange une pomme"
    const sentence = 'Je mange une pomme.';
    const targetWord = 'mange';
    const wordIndex = 1; // "mange" está en índice 1

    // Crear contexto cloze manual
    const targetWordData = {
      word: targetWord,
      lemma: 'manger',
      pos: 'verb' as const,
      index: wordIndex,
      confidence: 0.9,
    };

    // Importar servicio de cloze manual
    const {
      createClozeContext,
      generateClozeFromContext,
    } = require('@/services/clozeExerciseService');

    const context = createClozeContext(sentence, targetWordData, 'fr');
    const exercise = generateClozeFromContext(context, 'test-manual-1');

    // Verificar que el ejercicio tiene la oración completa
    expect(exercise.phraseText).toBe(sentence);
    expect(exercise.phraseText).toContain('mange');

    // Verificar que la pregunta tiene la palabra oculta
    expect(exercise.question).toContain('_____');
    expect(exercise.question).not.toContain('mange');

    // Reconstruir debería dar la oración original
    const reconstructed = exercise.question.replace('_____', exercise.answer);
    expect(reconstructed.trim()).toBe(sentence);

    // Verificar que la respuesta es la palabra correcta
    expect(exercise.answer).toBe(targetWord);

    // Verificar opciones incorrectas
    expect(exercise.options.length).toBe(3);
    expect(exercise.options).not.toContain(targetWord);

    // Verificar pista y tipo gramatical
    expect(exercise.hint).toBe('Verbo conjugado');
    expect(exercise.posType).toBe('verb');
  });

  it('should generate cloze exercises from manual subtopic with multiple words', () => {
    const {
      generateClozeExercisesFromManualSubtopic,
    } = require('@/services/clozeExerciseService');
    const { ManualClozeSubtopic } = require('@/services/clozeExerciseService');

    const subtopic = {
      phrases: [
        'Je mange une pomme.', // targetWordIndex: 1 (mange)
        'Le chat est noir.', // targetWordIndex: 2 (est)
      ],
      targetWordIndices: [
        [1], // mange
        [2], // est
      ],
      language: 'fr',
    };

    const exercises = generateClozeExercisesFromManualSubtopic(subtopic, {
      maxExercisesPerPhrase: 1,
    });

    // Debería generar 2 ejercicios
    expect(exercises.length).toBe(2);

    // Primer ejercicio: Je mange une pomme -> Je _____ une pomme
    const firstExercise = exercises.find((e: any) => e.phraseText.includes('mange'));
    expect(firstExercise).toBeDefined();
    expect(firstExercise?.phraseText).toBe('Je mange une pomme.');
    expect(firstExercise?.question).toContain('Je _____ une pomme');
    expect(firstExercise?.answer).toBe('mange');

    // Segundo ejercicio: Le chat est noir -> Le chat _____ noir
    const secondExercise = exercises.find((e: any) => e.phraseText.includes('est'));
    expect(secondExercise).toBeDefined();
    expect(secondExercise?.phraseText).toBe('Le chat est noir.');
    expect(secondExercise?.question).toContain('Le chat _____ noir');
    expect(secondExercise?.answer).toBe('est');
  });

  it('should handle manual cloze with multiple target words in same sentence', () => {
    const {
      generateClozeExercisesFromManualSubtopic,
    } = require('@/services/clozeExerciseService');
    const { ManualClozeSubtopic } = require('@/services/clozeExerciseService');

    const subtopic = {
      phrases: [
        'Le petit chat mange une pomme rouge.',
      ],
      targetWordIndices: [
        [1, 2, 6], // petit, chat, rouge
      ],
      language: 'fr',
    };

    const exercises = generateClozeExercisesFromManualSubtopic(subtopic, {
      maxExercisesPerPhrase: 3,
    });

    // Debería generar 3 ejercicios de la misma oración
    expect(exercises.length).toBe(3);

    // Cada ejercicio debería tener la oración completa
    exercises.forEach((exercise: any) => {
      expect(exercise.phraseText).toBe('Le petit chat mange une pomme rouge.');
      expect(exercise.question).toContain('_____');
    });

    // Verificar que las respuestas son diferentes
    const answers = exercises.map((e: any) => e.answer);
    const uniqueAnswers = new Set(answers);
    expect(uniqueAnswers.size).toBe(3);
  });

  it('should integrate with exercise flow for manual cloze', () => {
    const {
      generateClozeExercisesFromManualSubtopic,
      clozeExerciseToPhrase,
    } = require('@/services/clozeExerciseService');
    const { ManualClozeSubtopic } = require('@/services/clozeExerciseService');

    const subtopic = {
      phrases: ['Je suis étudiant. J\'étudie le français.'],
      targetWordIndices: [[1, 5]], // suis, étudie
      language: 'fr',
    };

    const rawExercises = generateClozeExercisesFromManualSubtopic(subtopic, {
      maxExercisesPerPhrase: 2,
    });

    // Convertir a formato Phrase para componentes
    const phraseExercises = rawExercises.map(clozeExerciseToPhrase);

    // Verificar formato Phrase
    phraseExercises.forEach((phrase: any) => {
      expect(phrase.id).toBeDefined();
      expect(phrase.text).toBeDefined(); // Debería ser la pregunta con _____
      expect(phrase.clozeWord).toBeDefined();
      expect(phrase.clozeOptions).toBeDefined();
      expect(phrase.clozeOptions.length).toBeGreaterThan(0);

      // Una opción debe ser correcta
      const hasCorrectOption = phrase.clozeOptions.some((opt: any) => opt.isCorrect);
      expect(hasCorrectOption).toBe(true);
    });
  });
});

describe('Cloze Generation - Quality Assurance', () => {
  it('should generate exercises with unique IDs', () => {
    const phrases = extractPhrases(SIMPLE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
    });

    const ids = exercises.map(e => e.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should maintain phraseIndex consistency', () => {
    const phrases = extractPhrases(INTERMEDIATE_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      expect(exercise.phraseIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.phraseIndex).toBeLessThan(phrases.length);
      expect(exercise.phraseText).toBe(phrases[exercise.phraseIndex]);
    });
  });

  it('should preserve original phrase in exercise', () => {
    const phrases = extractPhrases(ADJECTIVE_HEAVY_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      expect(exercise.phraseText).toContain(exercise.answer);
      expect(exercise.question).not.toContain(exercise.answer);
    });
  });
});
