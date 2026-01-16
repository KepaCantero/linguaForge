/**
 * Theme Service Tests
 *
 * Tests for the theme service business logic
 */

import { describe, it, expect } from 'vitest';
import {
  generateThemeFromNodes,
  calculateThemeDifficulty,
  validateThemePrerequisites,
  suggestNextTheme,
  generateThemeRecommendations,
  calculateThemeProgress,
  updateThemeMetadata,
  exportThemeToJson,
  importThemeFromJson,
  getThemesStats,
} from '@/services/themeService';
import type { Theme, ThemeCategory, CEFRLevel } from '@/types/theme';

describe('themeService', () => {
  describe('generateThemeFromNodes', () => {
    it('should generate a theme with correct metadata', () => {
      const nodes = [
        {
          id: 'node-1',
          subtopics: [
            { phrases: ['Bonjour', 'Comment allez-vous?'] },
            { phrases: ['Je vais bien'] },
          ],
        },
      ];

      const theme = generateThemeFromNodes(
        nodes,
        'Test Theme',
        'Test Description',
        'basics',
        'A1'
      );

      expect(theme.title).toBe('Test Theme');
      expect(theme.description).toBe('Test Description');
      expect(theme.category).toBe('basics');
      expect(theme.level).toBe('A1');
      expect(theme.nodes).toEqual(['node-1']);
      expect(theme.metadata.totalNodes).toBe(1);
      expect(theme.metadata.wordCount).toBeGreaterThan(0);
      expect(theme.metadata.estimatedStudyTime).toBeGreaterThan(0);
    });

    it('should calculate word count correctly', () => {
      const nodes = [
        {
          id: 'node-1',
          subtopics: [
            { phrases: ['Bonjour le monde'] },
            { phrases: ['Comment ça va?'] },
          ],
        },
      ];

      const theme = generateThemeFromNodes(
        nodes,
        'Test',
        'Description',
        'basics',
        'A1'
      );

      // 2 frases: "Bonjour le monde" (3 palabras) + "Comment ça va?" (3 palabras)
      expect(theme.metadata.wordCount).toBe(6);
    });

    it('should estimate study time based on level', () => {
      const nodes = [
        {
          id: 'node-1',
          subtopics: [
            { phrases: ['Test phrase with five words'] },
            { phrases: ['Another test phrase with five words'] },
          ],
        },
      ];

      const themeA1 = generateThemeFromNodes(
        nodes,
        'Test',
        'Description',
        'basics',
        'A1'
      );

      const themeC2 = generateThemeFromNodes(
        nodes,
        'Test',
        'Description',
        'basics',
        'C2'
      );

      // C2 debe ser más rápido que A1 (más palabras por minuto)
      expect(themeC2.metadata.estimatedStudyTime).toBeLessThan(
        themeA1.metadata.estimatedStudyTime
      );
    });
  });

  describe('calculateThemeDifficulty', () => {
    it('should calculate difficulty based on category and level', () => {
      const theme: Theme = {
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const difficulty = calculateThemeDifficulty(theme);

      expect(difficulty).toBeGreaterThan(0);
      expect(difficulty).toBeLessThanOrEqual(100);
    });

    it('should increase difficulty with prerequisites', () => {
      const baseTheme: Theme = {
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category: 'travel',
        level: 'B1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const themeWithPrereqs: Theme = {
        ...baseTheme,
        prerequisites: ['theme-1', 'theme-2', 'theme-3'],
      };

      const difficulty1 = calculateThemeDifficulty(baseTheme);
      const difficulty2 = calculateThemeDifficulty(themeWithPrereqs);

      expect(difficulty2).toBeGreaterThan(difficulty1);
    });

    it('should adjust difficulty based on category', () => {
      const createTheme = (category: ThemeCategory): Theme => ({
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category,
        level: 'B1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const basicsDifficulty = calculateThemeDifficulty(createTheme('basics'));
      const cultureDifficulty = calculateThemeDifficulty(createTheme('culture'));

      expect(cultureDifficulty).toBeGreaterThan(basicsDifficulty);
    });
  });

  describe('validateThemePrerequisites', () => {
    it('should return met: true for themes without prerequisites', () => {
      const theme: Theme = {
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateThemePrerequisites(theme, [], []);

      expect(result.met).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.missingThemes).toHaveLength(0);
    });

    it('should return met: false for incomplete prerequisites', () => {
      const theme: Theme = {
        id: 'theme-2',
        title: 'Test',
        description: 'Test',
        category: 'basics',
        level: 'A2',
        nodes: [],
        prerequisites: ['theme-1', 'theme-3'],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const prereq1: Theme = {
        id: 'theme-1',
        title: 'Prereq 1',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const prereq2: Theme = {
        id: 'theme-3',
        title: 'Prereq 2',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allThemes: Theme[] = [theme, prereq1, prereq2];

      const result = validateThemePrerequisites(theme, ['theme-1'], allThemes);

      expect(result.met).toBe(false);
      expect(result.missing).toEqual(['theme-3']);
      expect(result.missingThemes).toHaveLength(1);
      expect(result.missingThemes[0].id).toBe('theme-3');
    });
  });

  describe('suggestNextTheme', () => {
    it('should suggest dependent themes after completing current', () => {
      const currentTheme: Theme = {
        id: 'theme-1',
        title: 'Current',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dependentTheme: Theme = {
        id: 'theme-2',
        title: 'Dependent',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: ['theme-1'],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allThemes = [currentTheme, dependentTheme];

      const suggestion = suggestNextTheme(
        currentTheme,
        allThemes,
        ['theme-1'],
        'A1'
      );

      expect(suggestion?.id).toBe('theme-2');
    });

    it('should return undefined if no themes available', () => {
      const suggestion = suggestNextTheme(
        undefined,
        [],
        [],
        'A1'
      );

      expect(suggestion).toBeUndefined();
    });
  });

  describe('calculateThemeProgress', () => {
    it('should calculate average progress correctly', () => {
      const theme: Theme = {
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: ['node-1', 'node-2', 'node-3'],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 3,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nodeProgressMap = {
        'node-1': 100,
        'node-2': 50,
        'node-3': 0,
      };

      const progress = calculateThemeProgress(theme, nodeProgressMap);

      expect(progress.completedNodes).toBe(1); // Solo node-1 >= 80%
      expect(progress.averageNodeProgress).toBe(50); // (100 + 50 + 0) / 3
    });

    it('should handle empty nodes array', () => {
      const theme: Theme = {
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 0,
          estimatedStudyTime: 0,
          difficultyScore: 0,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const progress = calculateThemeProgress(theme, {});

      expect(progress.completedNodes).toBe(0);
      expect(progress.averageNodeProgress).toBe(0);
    });
  });

  describe('updateThemeMetadata', () => {
    it('should update metadata with new word count', () => {
      const theme: Theme = {
        id: 'theme-1',
        title: 'Test',
        description: 'Test',
        category: 'basics',
        level: 'A1',
        nodes: [],
        prerequisites: [],
        metadata: {
          wordCount: 100,
          estimatedStudyTime: 10,
          difficultyScore: 20,
          totalNodes: 0,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = updateThemeMetadata(theme, 200);

      expect(updated.wordCount).toBe(200);
      expect(updated.estimatedStudyTime).not.toBe(theme.metadata.estimatedStudyTime);
    });
  });

  describe('exportThemeToJson and importThemeFromJson', () => {
    it('should export and import theme correctly', () => {
      const theme: Theme = {
        id: 'theme-1',
        title: 'Test Theme',
        description: 'Test Description',
        category: 'basics',
        level: 'A1',
        nodes: ['node-1', 'node-2'],
        prerequisites: [],
        metadata: {
          wordCount: 100,
          estimatedStudyTime: 10,
          difficultyScore: 20,
          totalNodes: 2,
          completedNodes: 0,
          averageNodeProgress: 0,
        },
        isPublic: true,
        isPremium: false,
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const json = exportThemeToJson(theme, false);

      expect(json).toBeTruthy();
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json);
      expect(parsed.theme).toBeTruthy();
      expect(parsed.theme.title).toBe('Test Theme');

      const imported = importThemeFromJson(json);

      expect(imported.title).toBe(theme.title);
      expect(imported.id).not.toBe(theme.id); // ID debe ser nuevo
      expect(imported.nodes).toEqual(theme.nodes);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importThemeFromJson('invalid json')).toThrow();
    });

    it('should throw error for missing theme property', () => {
      expect(() => importThemeFromJson(JSON.stringify({}))).toThrow();
    });
  });

  describe('getThemesStats', () => {
    it('should calculate stats correctly', () => {
      const themes: Theme[] = [
        {
          id: 'theme-1',
          title: 'Theme 1',
          description: 'Test',
          category: 'basics',
          level: 'A1',
          nodes: [],
          prerequisites: [],
          metadata: {
            wordCount: 100,
            estimatedStudyTime: 10,
            difficultyScore: 20,
            totalNodes: 5,
            completedNodes: 0,
            averageNodeProgress: 0,
          },
          isPublic: true,
          isPremium: false,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'theme-2',
          title: 'Theme 2',
          description: 'Test',
          category: 'travel',
          level: 'A2',
          nodes: [],
          prerequisites: [],
          metadata: {
            wordCount: 200,
            estimatedStudyTime: 20,
            difficultyScore: 40,
            totalNodes: 10,
            completedNodes: 0,
            averageNodeProgress: 0,
          },
          isPublic: true,
          isPremium: false,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const stats = getThemesStats(themes);

      expect(stats.total).toBe(2);
      expect(stats.byCategory.basics).toBe(1);
      expect(stats.byCategory.travel).toBe(1);
      expect(stats.byLevel.A1).toBe(1);
      expect(stats.byLevel.A2).toBe(1);
      expect(stats.totalNodes).toBe(15);
      expect(stats.totalStudyTime).toBe(30);
      expect(stats.averageDifficulty).toBe(30);
    });

    it('should handle empty array', () => {
      const stats = getThemesStats([]);

      expect(stats.total).toBe(0);
      expect(stats.totalNodes).toBe(0);
      expect(stats.totalStudyTime).toBe(0);
      expect(stats.averageDifficulty).toBe(0);
    });
  });
});
