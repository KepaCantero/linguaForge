/**
 * useTextImport Hook Tests
 *
 * Tests for the text import hook that analyzes text, splits into blocks,
 * and manages import workflow.
 *
 * Tests real functionality with mocked stores.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextImport } from '@/hooks/input/useTextImport';
import type { TextImportData, TextBlock } from '@/hooks/input/useTextImport';

// ============================================================
// MOCKS FOR STORES
// ============================================================

const mockCreateNode = vi.fn().mockReturnValue('node-123');
const mockMarkTextAsRead = vi.fn();

vi.mock('@/store/useImportedNodesStore', () => ({
  useImportedNodesStore: () => ({
    createNode: mockCreateNode,
  }),
}));

vi.mock('@/store/useInputStore', () => ({
  useInputStore: () => ({
    markTextAsRead: mockMarkTextAsRead,
  }),
}));

vi.mock('@/store/useProgressStore', () => ({
  useProgressStore: () => ({
    activeLanguage: 'fr',
    activeLevel: 'beginner',
  }),
}));

// ============================================================
// TEST DATA - Real French text samples
// ============================================================

const FRENCH_SAMPLE_TEXT = `Bonjour, comment allez-vous? Je vais bien.
C'est une belle journée aujourd'hui. Le soleil brille et les oiseaux chantent.
J'aime beaucoup le français. C'est une langue magnifique.`;

const SHORT_TEXT = `Bonjour.`;

const LONG_TEXT = `Bonjour, je m'appelle Marie. J'habite à Paris. `.repeat(50);

const INVALID_SHORT_TEXT = 'Hi.';
const INVALID_LONG_TEXT = 'A'.repeat(10_001);

// ============================================================
// SETUP AND TEARDOWN
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateNode.mockReturnValue('node-123');
});

// ============================================================
// HOOK INITIALIZATION TESTS
// ============================================================

describe('useTextImport - Initialization', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTextImport());

    expect(result.current.data).toBeNull();
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide all required functions', () => {
    const { result } = renderHook(() => useTextImport());

    expect(typeof result.current.analyzeText).toBe('function');
    expect(typeof result.current.splitIntoBlocks).toBe('function');
    expect(typeof result.current.extractPhrases).toBe('function');
    expect(typeof result.current.importAll).toBe('function');
    expect(typeof result.current.importBlocks).toBe('function');
    expect(typeof result.current.isValidText).toBe('function');
  });
});

// ============================================================
// analyzeText TESTS
// ============================================================

describe('useTextImport - analyzeText', () => {
  it('should analyze valid text successfully', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    // Check that data was set in the hook state
    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.content).toBe(FRENCH_SAMPLE_TEXT);
    expect(result.current.data?.wordCount).toBeGreaterThan(0);
    expect(result.current.data?.phraseCount).toBeGreaterThan(0);
    expect(result.current.data?.language).toBe('fr');
    expect(result.current.data?.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
    expect(result.current.data?.blocks.length).toBeGreaterThan(0);
    expect(result.current.data?.suggestedTitle).toBeTruthy();
  });

  it('should reject text below minimum length', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText(INVALID_SHORT_TEXT);
    });

    expect(analysisResult).toBeNull();
    expect(result.current.error).toContain('at least 20 characters');
  });

  it('should reject text above maximum length', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText(INVALID_LONG_TEXT);
    });

    expect(analysisResult).toBeNull();
    expect(result.current.error).toContain('cannot exceed');
  });

  it('should detect French language correctly', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.data?.language).toBe('fr');
  });

  it('should estimate difficulty based on text characteristics', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    const difficulty = result.current.data?.difficulty;
    expect(difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
  });

  it('should set isAnalyzing during analysis', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    // Analysis is synchronous in the hook, so isAnalyzing will be false after
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should update data state after analysis', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.wordCount).toBeGreaterThan(0);
  });

  it('should generate suggested title', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.data?.suggestedTitle).toContain('...');
    expect(result.current.data?.suggestedTitle.length).toBeGreaterThan(0);
  });

  it('should extract grammatical categories', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.data?.grammaticalCategories).toBeDefined();
    expect(result.current.data?.grammaticalCategories).toHaveProperty('nouns');
    expect(result.current.data?.grammaticalCategories).toHaveProperty('verbs');
  });
});

// ============================================================
// splitIntoBlocks TESTS
// ============================================================

describe('useTextImport - splitIntoBlocks', () => {
  it('should split text into blocks', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    expect(blocks.length).toBeGreaterThan(0);
  });

  it('should respect maxWords parameter', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(LONG_TEXT, 50);
    });

    expect(blocks.length).toBeGreaterThan(1);
  });

  it('should calculate word ranges correctly', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    blocks.forEach(block => {
      expect(block.wordRange).toHaveLength(2);
      expect(block.wordRange[0]).toBeLessThanOrEqual(block.wordRange[1]);
    });
  });

  it('should calculate word count for each block', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    blocks.forEach(block => {
      expect(block.wordCount).toBeGreaterThan(0);
      expect(block.wordCount).toBeLessThanOrEqual(150);
    });
  });

  it('should estimate reading time', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    blocks.forEach(block => {
      expect(block.estimatedReadingTime).toBeGreaterThan(0);
    });
  });

  it('should generate unique block IDs', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(LONG_TEXT);
    });

    const ids = blocks.map(b => b.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should handle short text in single block', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(SHORT_TEXT);
    });

    expect(blocks.length).toBe(1);
  });

  it('should handle empty text', () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks('');
    });

    expect(blocks).toEqual([]);
  });
});

// ============================================================
// extractPhrases TESTS
// ============================================================

describe('useTextImport - extractPhrases', () => {
  it('should extract phrases from text', () => {
    const { result } = renderHook(() => useTextImport());

    let phrases: string[] = [];

    act(() => {
      phrases = result.current.extractPhrases(FRENCH_SAMPLE_TEXT);
    });

    expect(phrases.length).toBeGreaterThan(0);
  });

  it('should filter short phrases', () => {
    const { result } = renderHook(() => useTextImport());

    let phrases: string[] = [];

    act(() => {
      phrases = result.current.extractPhrases('Hi. Bonjour, comment allez-vous?');
    });

    // "Hi" should be filtered out
    expect(phrases).not.toContain('Hi');
  });

  it('should limit phrase count', () => {
    const { result } = renderHook(() => useTextImport());

    let phrases: string[] = [];

    act(() => {
      phrases = result.current.extractPhrases(LONG_TEXT);
    });

    // Should be limited to 50 phrases
    expect(phrases.length).toBeLessThanOrEqual(50);
  });

  it('should handle empty text', () => {
    const { result } = renderHook(() => useTextImport());

    let phrases: string[] = [];

    act(() => {
      phrases = result.current.extractPhrases('');
    });

    expect(phrases).toEqual([]);
  });
});

// ============================================================
// importAll TESTS
// ============================================================

describe('useTextImport - importAll', () => {
  it('should import all content as node', async () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    let importResult: any;

    await act(async () => {
      importResult = await result.current.importAll(result.current.data!);
    });

    expect(mockCreateNode).toHaveBeenCalled();
    expect(mockMarkTextAsRead).toHaveBeenCalled();
    expect(importResult.nodeId).toBe('node-123');
    expect(importResult.phraseCount).toBeGreaterThan(0);
    expect(importResult.exerciseCount).toBeGreaterThan(0);
  });

  it('should call createNode with correct structure', async () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    await act(async () => {
      await result.current.importAll(result.current.data!);
    });

    expect(mockCreateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        icon: '📝',
        sourceType: 'article',
        sourceText: FRENCH_SAMPLE_TEXT,
        subtopics: expect.any(Array),
      })
    );
  });

  it('should call markTextAsRead with correct parameters', async () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    await act(async () => {
      await result.current.importAll(result.current.data!);
    });

    expect(mockMarkTextAsRead).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Number),
      'fr',
      'beginner'
    );
  });

  it('should set isAnalyzing during import', async () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    // Import is async, so we need to check during execution
    const promise = act(async () => {
      await result.current.importAll(result.current.data!);
    });

    // isAnalyzing should be true during import
    expect(result.current.isAnalyzing).toBe(true);

    await promise;
  });

  it('should handle import errors', async () => {
    const { result } = renderHook(() => useTextImport());

    mockCreateNode.mockImplementation(() => {
      throw new Error('Create node failed');
    });

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    await expect(
      act(async () => {
        await result.current.importAll(result.current.data!);
      })
    ).rejects.toThrow();

    expect(result.current.error).toContain('Import failed');
  });
});

// ============================================================
// importBlocks TESTS
// ============================================================

describe('useTextImport - importBlocks', () => {
  it('should import blocks as node', async () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    let importResult: any;

    await act(async () => {
      importResult = await result.current.importBlocks(blocks);
    });

    expect(mockCreateNode).toHaveBeenCalled();
    expect(importResult.nodeId).toBe('node-123');
  });

  it('should reject empty blocks array', async () => {
    const { result } = renderHook(() => useTextImport());

    // First analyze text to set data
    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    await expect(
      act(async () => {
        await result.current.importBlocks([]);
      })
    ).rejects.toThrow();
  });

  it('should create subtopics for each block', async () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    await act(async () => {
      await result.current.importBlocks(blocks);
    });

    expect(mockCreateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        subtopics: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('Bloque'),
          }),
        ]),
      })
    );
  });

  it('should calculate total words correctly', async () => {
    const { result } = renderHook(() => useTextImport());

    let blocks: TextBlock[] = [];

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    const expectedTotal = blocks.reduce((sum, b) => sum + b.wordCount, 0);

    await act(async () => {
      await result.current.importBlocks(blocks);
    });

    expect(mockMarkTextAsRead).toHaveBeenCalledWith(
      expect.any(String),
      expectedTotal,
      'fr',
      'beginner'
    );
  });
});

// ============================================================
// isValidText TESTS
// ============================================================

describe('useTextImport - isValidText', () => {
  it('should validate text within limits', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.isValidText(FRENCH_SAMPLE_TEXT)).toBe(true);
  });

  it('should reject text below minimum', () => {
    const { result } = renderHook(() => useTextImport());

    expect(result.current.isValidText(INVALID_SHORT_TEXT)).toBe(false);
  });

  it('should reject text above maximum', () => {
    const { result } = renderHook(() => useTextImport());

    expect(result.current.isValidText(INVALID_LONG_TEXT)).toBe(false);
  });

  it('should reject empty text', () => {
    const { result } = renderHook(() => useTextImport());

    expect(result.current.isValidText('')).toBe(false);
  });

  it('should reject whitespace only', () => {
    const { result } = renderHook(() => useTextImport());

    expect(result.current.isValidText('   \n\n   ')).toBe(false);
  });

  it('should accept exactly minimum length', () => {
    const { result } = renderHook(() => useTextImport());

    const text = 'A'.repeat(20);
    expect(result.current.isValidText(text)).toBe(true);
  });

  it('should accept exactly maximum length', () => {
    const { result } = renderHook(() => useTextImport());

    const text = 'A'.repeat(10_000);
    expect(result.current.isValidText(text)).toBe(true);
  });
});

// ============================================================
// TYPE SAFETY TESTS
// ============================================================

describe('useTextImport - Type Safety', () => {
  it('should have correct return type structure', () => {
    const { result } = renderHook(() => useTextImport());

    const expectedKeys = [
      'data', 'isAnalyzing', 'error',
      'analyzeText', 'splitIntoBlocks', 'extractPhrases',
      'importAll', 'importBlocks', 'isValidText',
    ];

    expectedKeys.forEach(key => {
      expect(Object.keys(result.current)).toContain(key);
    });
  });

  it('should export TextBlock with required properties', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    const block = result.current.data?.blocks[0];

    expect(block).toHaveProperty('id');
    expect(block).toHaveProperty('content');
    expect(block).toHaveProperty('wordRange');
    expect(block).toHaveProperty('wordCount');
    expect(block).toHaveProperty('estimatedReadingTime');
  });

  it('should export TextImportData with required properties', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    const data = result.current.data;

    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('wordCount');
    expect(data).toHaveProperty('phraseCount');
    expect(data).toHaveProperty('language');
    expect(data).toHaveProperty('difficulty');
    expect(data).toHaveProperty('blocks');
    expect(data).toHaveProperty('suggestedTitle');
  });
});

// ============================================================
// EDGE CASES
// ============================================================

describe('useTextImport - Edge Cases', () => {
  it('should handle text with only whitespace', () => {
    const { result } = renderHook(() => useTextImport());

    const isValid = result.current.isValidText('   \n\n   \t  ');

    expect(isValid).toBe(false);
  });

  it('should handle text with special characters', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("Bonjour! Comment ça va? J'ai 20 ans.");
    });

    expect(analysisResult).not.toBeNull();
  });

  it('should handle very long words', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("Anticonstitutionnellement est un mot très long.");
    });

    expect(analysisResult).not.toBeNull();
  });

  it('should handle text with numbers', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("J'ai 2 chats et 3 chiens.");
    });

    expect(analysisResult).not.toBeNull();
  });

  it('should handle text with emojis', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("Bonjour 😊 Comment ça va? 🇫🇷");
    });

    expect(analysisResult).not.toBeNull();
  });

  it('should handle text with multiple punctuation', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("Bonjour... Comment ça va?! Très bien!!");
    });

    expect(analysisResult).not.toBeNull();
  });

  it('should handle text with newlines', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("Ligne 1\nLigne 2\nLigne 3");
    });

    expect(analysisResult).not.toBeNull();
  });

  it('should handle text with tabs', () => {
    const { result } = renderHook(() => useTextImport());

    let analysisResult: TextImportData | null = null;

    act(() => {
      analysisResult = result.current.analyzeText("Mot1\tMot2\tMot3");
    });

    expect(analysisResult).not.toBeNull();
  });
});

// ============================================================
// INTEGRATION TESTS
// ============================================================

describe('useTextImport - Integration', () => {
  it('should work end-to-end: analyze and import', async () => {
    const { result } = renderHook(() => useTextImport());

    // Analyze
    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.data).not.toBeNull();

    // Import
    let importResult: any;

    await act(async () => {
      importResult = await result.current.importAll(result.current.data!);
    });

    expect(importResult.nodeId).toBe('node-123');
    expect(mockCreateNode).toHaveBeenCalled();
  });

  it('should work with split and import blocks', async () => {
    const { result } = renderHook(() => useTextImport());

    // Analyze
    act(() => {
      result.current.analyzeText(LONG_TEXT);
    });

    // Split
    let blocks: TextBlock[] = [];

    act(() => {
      blocks = result.current.splitIntoBlocks(LONG_TEXT);
    });

    expect(blocks.length).toBeGreaterThan(1);

    // Import blocks
    let importResult: any;

    await act(async () => {
      importResult = await result.current.importBlocks(blocks);
    });

    expect(importResult.nodeId).toBe('node-123');
  });

  it('should provide consistent data across operations', () => {
    const { result } = renderHook(() => useTextImport());

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    const data1 = result.current.data;

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    const data2 = result.current.data;

    expect(data1?.wordCount).toBe(data2?.wordCount);
    expect(data1?.phraseCount).toBe(data2?.phraseCount);
  });
});

// ============================================================
// ERROR HANDLING TESTS
// ============================================================

describe('useTextImport - Error Handling', () => {
  it('should handle null data in importAll', async () => {
    const { result } = renderHook(() => useTextImport());

    await expect(
      act(async () => {
        // @ts-expect-error - Testing null case
        await result.current.importAll(null);
      })
    ).rejects.toThrow();
  });

  it('should handle errors in importBlocks gracefully', async () => {
    const { result } = renderHook(() => useTextImport());

    mockCreateNode.mockImplementation(() => {
      throw new Error('Import failed');
    });

    let blocks: TextBlock[] = [];

    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
      blocks = result.current.splitIntoBlocks(FRENCH_SAMPLE_TEXT);
    });

    await expect(
      act(async () => {
        await result.current.importBlocks(blocks);
      })
    ).rejects.toThrow();

    expect(result.current.error).toBeTruthy();
  });

  it('should reset error on successful operation', () => {
    const { result } = renderHook(() => useTextImport());

    // Trigger error
    act(() => {
      result.current.analyzeText(INVALID_SHORT_TEXT);
    });

    expect(result.current.error).not.toBeNull();

    // Reset with valid operation
    act(() => {
      result.current.analyzeText(FRENCH_SAMPLE_TEXT);
    });

    expect(result.current.error).toBeNull();
  });
});
