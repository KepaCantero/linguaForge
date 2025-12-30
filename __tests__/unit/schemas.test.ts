import { describe, it, expect } from 'vitest';
import {
  JanusCellSchema,
  JanusColumnSchema,
  JanusMatrixSchema,
  PhraseSchema,
  MatrixSchema,
  WorldSchema,
  InputStatsSchema,
} from '@/schemas/content';

describe('Content Schemas', () => {
  describe('JanusCellSchema', () => {
    it('should validate a valid cell', () => {
      const validCell = {
        id: 'cell-1',
        text: 'Je',
        translation: 'Yo',
      };

      expect(() => JanusCellSchema.parse(validCell)).not.toThrow();
    });

    it('should accept optional audioUrl', () => {
      const cellWithAudio = {
        id: 'cell-1',
        text: 'Je',
        translation: 'Yo',
        audioUrl: '/audio/je.mp3',
      };

      expect(() => JanusCellSchema.parse(cellWithAudio)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidCell = {
        id: 'cell-1',
        text: 'Je',
        // missing translation
      };

      expect(() => JanusCellSchema.parse(invalidCell)).toThrow();
    });
  });

  describe('JanusColumnSchema', () => {
    it('should validate a valid column with 4 cells', () => {
      const validColumn = {
        id: 'col-1',
        label: 'Sujeto',
        grammaticalRole: 'subject',
        cells: [
          { id: 'c1', text: 'Je', translation: 'Yo' },
          { id: 'c2', text: 'Tu', translation: 'Tú' },
          { id: 'c3', text: 'Il', translation: 'Él' },
          { id: 'c4', text: 'Elle', translation: 'Ella' },
        ],
      };

      expect(() => JanusColumnSchema.parse(validColumn)).not.toThrow();
    });

    it('should reject fewer than 4 cells', () => {
      const invalidColumn = {
        id: 'col-1',
        label: 'Sujeto',
        grammaticalRole: 'subject',
        cells: [
          { id: 'c1', text: 'Je', translation: 'Yo' },
          { id: 'c2', text: 'Tu', translation: 'Tú' },
        ],
      };

      expect(() => JanusColumnSchema.parse(invalidColumn)).toThrow();
    });

    it('should reject more than 6 cells', () => {
      const invalidColumn = {
        id: 'col-1',
        label: 'Sujeto',
        grammaticalRole: 'subject',
        cells: Array(7).fill({ id: 'c1', text: 'Je', translation: 'Yo' }),
      };

      expect(() => JanusColumnSchema.parse(invalidColumn)).toThrow();
    });
  });

  describe('PhraseSchema', () => {
    it('should validate a complete phrase', () => {
      const validPhrase = {
        id: 'phrase-1',
        text: 'Je suis à la maison.',
        translation: 'Estoy en casa.',
        clozeWord: 'maison',
        clozeOptions: [
          { id: 'o1', text: 'maison', isCorrect: true },
          { id: 'o2', text: 'appartement', isCorrect: false },
          { id: 'o3', text: 'hôtel', isCorrect: false },
          { id: 'o4', text: 'bureau', isCorrect: false },
        ],
        variations: [
          { id: 'v1', text: 'Je suis chez moi.', translation: 'Estoy en mi casa.' },
          { id: 'v2', text: 'Je suis à mon appartement.', translation: 'Estoy en mi apartamento.' },
        ],
      };

      expect(() => PhraseSchema.parse(validPhrase)).not.toThrow();
    });

    it('should require exactly 4 cloze options', () => {
      const invalidPhrase = {
        id: 'phrase-1',
        text: 'Je suis à la maison.',
        translation: 'Estoy en casa.',
        clozeWord: 'maison',
        clozeOptions: [
          { id: 'o1', text: 'maison', isCorrect: true },
          { id: 'o2', text: 'appartement', isCorrect: false },
        ],
        variations: [
          { id: 'v1', text: 'Je suis chez moi.', translation: 'Estoy en mi casa.' },
          { id: 'v2', text: 'Je suis à mon appartement.', translation: 'Estoy en mi apartamento.' },
        ],
      };

      expect(() => PhraseSchema.parse(invalidPhrase)).toThrow();
    });

    it('should require at least 2 variations', () => {
      const invalidPhrase = {
        id: 'phrase-1',
        text: 'Je suis à la maison.',
        translation: 'Estoy en casa.',
        clozeWord: 'maison',
        clozeOptions: Array(4).fill({ id: 'o1', text: 'option', isCorrect: false }),
        variations: [{ id: 'v1', text: 'variation', translation: 'variación' }],
      };

      expect(() => PhraseSchema.parse(invalidPhrase)).toThrow();
    });
  });

  describe('InputStatsSchema', () => {
    it('should validate valid stats', () => {
      const validStats = {
        wordsRead: 1000,
        wordsHeard: 2000,
        wordsSpoken: 500,
        minutesListened: 60,
        minutesRead: 30,
      };

      expect(() => InputStatsSchema.parse(validStats)).not.toThrow();
    });

    it('should provide default values', () => {
      const stats = InputStatsSchema.parse({});

      expect(stats.wordsRead).toBe(0);
      expect(stats.wordsHeard).toBe(0);
      expect(stats.wordsSpoken).toBe(0);
      expect(stats.minutesListened).toBe(0);
      expect(stats.minutesRead).toBe(0);
    });
  });
});
