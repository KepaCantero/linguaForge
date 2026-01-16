/**
 * Tests para integración de ejercicios cloze con POS tagging
 * Verifica que los ejercicios generados por importFlowService
 * se conviertan correctamente al formato Phrase esperado por componentes
 */

import { describe, it, expect } from 'vitest';
import {
  generateClozeExercises,
  clozeExerciseToPhrase,
  generateAndAdaptClozeExercises,
  type ClozeExercise,
} from '@/services/importFlowService';
import type { Phrase } from '@/types';

describe('Cloze Exercise Integration', () => {
  const testPhrases = [
    'Le chat noir dort sur le canapé.',
    'Je mange une pomme rouge.',
    'Les enfants jouent dans le parc.',
  ];

  describe('generateClozeExercises', () => {
    it('debe generar ejercicios cloze desde frases', () => {
      const exercises = generateClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      expect(exercises).toBeDefined();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
    });

    it('debe incluir propiedades requeridas en cada ejercicio', () => {
      const exercises = generateClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      const firstExercise = exercises[0];
      expect(firstExercise).toHaveProperty('id');
      expect(firstExercise).toHaveProperty('phraseIndex');
      expect(firstExercise).toHaveProperty('phraseText');
      expect(firstExercise).toHaveProperty('type');
      expect(firstExercise).toHaveProperty('question');
      expect(firstExercise).toHaveProperty('answer');
      expect(firstExercise).toHaveProperty('hint');
      expect(firstExercise).toHaveProperty('difficulty');
      expect(firstExercise).toHaveProperty('options');
      expect(firstExercise.options).toHaveLength(3);
    });

    it('debe reemplazar la palabra objetivo con guiones bajos', () => {
      const exercises = generateClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      const firstExercise = exercises[0];
      expect(firstExercise.question).toContain('_____');
      expect(firstExercise.question).not.toContain(firstExercise.answer);
    });

    it('debe generar opciones incorrectas diferentes a la respuesta', () => {
      const exercises = generateClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      const firstExercise = exercises[0];
      const incorrectOptions = firstExercise.options;

      expect(incorrectOptions).not.toContain(firstExercise.answer);
    });

    it('debe priorizar tipos gramaticales especificados', () => {
      const exercises = generateClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
        prioritizePOSTypes: ['verb', 'adjective'],
      });

      // Verificar que al menos un ejercicio tiene verb o adjective
      const hasVerbsOrAdjectives = exercises.some(
        ex => ex.posType === 'verb' || ex.posType === 'adjective'
      );

      expect(hasVerbsOrAdjectives).toBe(true);
    });

    it('debe respetar maxExercisesPerPhrase', () => {
      const exercises = generateClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 2,
      });

      // Contar ejercicios por frase
      const exerciseCounts: Record<number, number> = {};
      exercises.forEach(ex => {
        exerciseCounts[ex.phraseIndex] = (exerciseCounts[ex.phraseIndex] || 0) + 1;
      });

      Object.values(exerciseCounts).forEach(count => {
        expect(count).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('clozeExerciseToPhrase', () => {
    it('debe convertir ClozeExercise a Phrase correctamente', () => {
      const mockClozeExercise: ClozeExercise = {
        id: 'test-1',
        phraseIndex: 0,
        phraseText: 'Le chat dort.',
        type: 'cloze',
        question: 'Le _____ dort.',
        answer: 'chat',
        hint: 'Sustantivo',
        difficulty: 'easy',
        options: ['chien', 'oiseau', 'rat'],
      };

      const phrase = clozeExerciseToPhrase(mockClozeExercise);

      expect(phrase).toHaveProperty('id', mockClozeExercise.id);
      expect(phrase).toHaveProperty('text', mockClozeExercise.phraseText);
      expect(phrase).toHaveProperty('clozeWord', mockClozeExercise.answer);
      expect(phrase).toHaveProperty('clozeOptions');
      expect(phrase).toHaveProperty('variations');
      expect(phrase.variations).toHaveLength(0);
    });

    it('debe incluir la respuesta correcta como primera opción', () => {
      const mockClozeExercise: ClozeExercise = {
        id: 'test-2',
        phraseIndex: 0,
        phraseText: 'Je mange une pomme.',
        type: 'cloze',
        question: 'Je _____ une pomme.',
        answer: 'mange',
        hint: 'Verbo conjugado',
        difficulty: 'medium',
        options: ['bois', 'prends', 'cours'],
      };

      const phrase = clozeExerciseToPhrase(mockClozeExercise);

      const correctOption = phrase.clozeOptions.find(opt => opt.isCorrect);
      expect(correctOption).toBeDefined();
      expect(correctOption?.text).toBe('mange');
    });

    it('debe incluir todas las opciones incorrectas', () => {
      const mockClozeExercise: ClozeExercise = {
        id: 'test-3',
        phraseIndex: 0,
        phraseText: 'Test phrase.',
        type: 'cloze',
        question: 'Test _____.',
        answer: 'word',
        hint: 'Sustantivo',
        difficulty: 'hard',
        options: ['wrong1', 'wrong2', 'wrong3'],
      };

      const phrase = clozeExerciseToPhrase(mockClozeExercise);

      const incorrectOptions = phrase.clozeOptions.filter(opt => !opt.isCorrect);
      expect(incorrectOptions).toHaveLength(3);
      expect(incorrectOptions[0].text).toBe('wrong1');
      expect(incorrectOptions[1].text).toBe('wrong2');
      expect(incorrectOptions[2].text).toBe('wrong3');
    });

    it('debe limitar a máximo 4 opciones', () => {
      const mockClozeExercise: ClozeExercise = {
        id: 'test-4',
        phraseIndex: 0,
        phraseText: 'Test.',
        type: 'cloze',
        question: '_____.',
        answer: 'correct',
        hint: 'Word',
        difficulty: 'easy',
        options: ['wrong1', 'wrong2', 'wrong3'],
      };

      const phrase = clozeExerciseToPhrase(mockClozeExercise);

      expect(phrase.clozeOptions).toHaveLength(4); // 1 correct + 3 incorrect
    });

    it('debe tener translation vacía por defecto', () => {
      const mockClozeExercise: ClozeExercise = {
        id: 'test-5',
        phraseIndex: 0,
        phraseText: 'Test.',
        type: 'cloze',
        question: '_____.',
        answer: 'answer',
        hint: 'Hint',
        difficulty: 'medium',
        options: [],
      };

      const phrase = clozeExerciseToPhrase(mockClozeExercise);

      expect(phrase.translation).toBe('');
    });
  });

  describe('generateAndAdaptClozeExercises', () => {
    it('debe generar ejercicios y adaptarlos a Phrase', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      expect(phrases).toBeDefined();
      expect(Array.isArray(phrases)).toBe(true);
      expect(phrases.length).toBeGreaterThan(0);
    });

    it('debe retornar objetos con estructura Phrase válida', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      const firstPhrase = phrases[0];

      expect(firstPhrase).toHaveProperty('id');
      expect(firstPhrase).toHaveProperty('text');
      expect(firstPhrase).toHaveProperty('translation');
      expect(firstPhrase).toHaveProperty('clozeWord');
      expect(firstPhrase).toHaveProperty('clozeOptions');
      expect(firstPhrase).toHaveProperty('variations');

      // Verificar que clozeOptions tiene exactamente 4 elementos
      expect(firstPhrase.clozeOptions).toHaveLength(4);

      // Verificar que hay exactamente una opción correcta
      const correctOptions = firstPhrase.clozeOptions.filter(opt => opt.isCorrect);
      expect(correctOptions).toHaveLength(1);
    });

    it('debe mantener consistencia entre clozeWord y la opción correcta', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      phrases.forEach(phrase => {
        const correctOption = phrase.clozeOptions.find(opt => opt.isCorrect);
        expect(correctOption).toBeDefined();
        expect(correctOption?.text).toBe(phrase.clozeWord);
      });
    });

    it('debe generar ejercicios para todas las frases de entrada', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 2,
      });

      // Debe haber ejercicios generados (puede ser menos que las frases si no hay palabras adecuadas)
      expect(phrases.length).toBeGreaterThan(0);

      // Verificar que todos los IDs son únicos y siguen el formato esperado
      const ids = phrases.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length); // Todos los IDs son únicos

      // Verificar formato de ID: cloze-<timestamp>-<number>
      ids.forEach(id => {
        expect(id).toMatch(/^cloze-\d+-\d+$/);
      });
    });

    it('debe manejar array vacío correctamente', () => {
      const phrases = generateAndAdaptClozeExercises([], {
        language: 'fr',
      });

      expect(phrases).toHaveLength(0);
    });

    it('debe aplicar opciones de configuración', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
        minConfidence: 0.8,
        prioritizePOSTypes: ['verb'],
      });

      expect(phrases).toBeDefined();
      expect(phrases.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with Exercise Components', () => {
    it('debe generar Phrases compatibles con ClozeExercise component', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      // Verificar estructura esperada por el componente ClozeExercise
      phrases.forEach(phrase => {
        // El componente espera: phrase, block, onComplete
        expect(phrase).toHaveProperty('text'); // Para mostrar el contexto
        expect(phrase).toHaveProperty('clozeWord'); // Palabra a adivinar
        expect(phrase).toHaveProperty('clozeOptions'); // Opciones de respuesta

        // El componente usa phrase.clozeOptions para renderizar botones
        expect(Array.isArray(phrase.clozeOptions)).toBe(true);
        expect(phrase.clozeOptions.length).toBeGreaterThan(0);

        // Cada opción debe tener id, text, isCorrect
        phrase.clozeOptions.forEach(option => {
          expect(option).toHaveProperty('id');
          expect(option).toHaveProperty('text');
          expect(option).toHaveProperty('isCorrect');
          expect(typeof option.isCorrect).toBe('boolean');
        });
      });
    });

    it('debe preservar el texto original de la frase', () => {
      const originalPhrase = 'Le chat noir dort sur le canapé.';
      const phrases = generateAndAdaptClozeExercises([originalPhrase], {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      expect(phrases[0].text).toBe(originalPhrase);
    });

    it('debe ser utilizable en el flujo de ejercicios existente', () => {
      const phrases = generateAndAdaptClozeExercises(testPhrases, {
        language: 'fr',
        maxExercisesPerPhrase: 1,
      });

      // Simular el uso en ExerciseData
      const exerciseData = {
        cloze: phrases,
        variations: [],
        conversationalEcho: [],
        dialogueIntonation: [],
        janusComposer: [],
      };

      expect(exerciseData.cloze).toBeDefined();
      expect(exerciseData.cloze.length).toBeGreaterThan(0);

      // Verificar que se puede iterar y acceder a propiedades
      exerciseData.cloze.forEach((phrase, index) => {
        expect(phrase.id).toBeDefined();
        expect(phrase.text).toBeDefined();
        expect(phrase.clozeOptions).toBeDefined();
      });
    });
  });
});
