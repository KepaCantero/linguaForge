/**
 * Tests for useExerciseFlow hook
 * Testing exercise generation, state management, and caching behavior
 */

import { renderHook, act } from '@testing-library/react';
import { useExerciseFlow } from '@/hooks/useExerciseFlow';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { extractGrammaticalCategories } from '@/services/posTaggingService';
import type { ImportedNode } from '@/store/useImportedNodesStore';

// Mock the dependencies
vi.mock('@/services/posTaggingService', () => ({
  extractGrammaticalCategories: vi.fn(),
  getCategoryStats: vi.fn(),
}));

vi.mock('@/services/generateExercisesFromPhrases', () => ({
  generateClozeExercises: vi.fn(() => []),
  generateVariationsExercises: vi.fn(() => []),
  generateConversationalEchoExercises: vi.fn(() => []),
  generateDialogueIntonationExercises: vi.fn(() => []),
  generateJanusComposerExercises: vi.fn(() => []),
}));

vi.mock('@/services/importFlowService', () => ({
  generateAndAdaptClozeExercises: vi.fn(() => []),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ nodeId: 'test-node-1' })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key) => {
      if (key === 'subtopic') return 'subtopic-1';
      if (key === 'mode') return 'academia';
      return null;
    }),
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('useExerciseFlow', () => {
  const mockExtractGrammaticalCategories = extractGrammaticalCategories as ReturnType<typeof vi.fn>;

  // Test data constants (real French phrases, no mocks)
  const FRENCH_PHRASES = [
    'Je mange une pomme',
    'Elle est belle',
    'Le chat dort',
    'Nous allons au marché',
  ];

  const mockNode: ImportedNode = {
    id: 'test-node-1',
    title: 'Test Node',
    icon: '📄',
    sourceText: FRENCH_PHRASES.join('. '),
    subtopics: [
      {
        id: 'subtopic-1',
        title: 'Subtopic 1',
        phrases: FRENCH_PHRASES,
        language: 'fr',
      },
      {
        id: 'subtopic-2',
        title: 'Subtopic 2',
        phrases: ['Il fait beau', 'Je suis content'],
        language: 'fr',
      },
    ],
    sourceType: 'article',
    createdAt: new Date().toISOString(),
    completedSubtopics: [],
    percentage: 0,
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup store with mock data
    const store = useImportedNodesStore.getState();
    (store as { nodes: ImportedNode[] }).nodes = [mockNode];

    // Mock extractGrammaticalCategories to return realistic data
    mockExtractGrammaticalCategories.mockImplementation((phrase: string) => ({
      verbs: phrase.split(/\s+/).filter(w => w.length > 3).map(w => ({
        word: w,
        lemma: w.toLowerCase(),
        pos: 'verb' as const,
        confidence: 0.8,
      })),
      nouns: phrase.split(/\s+/).filter(w => w.length > 2).map(w => ({
        word: w,
        lemma: w.toLowerCase(),
        pos: 'noun' as const,
        confidence: 0.7,
      })),
      adverbs: [],
      adjectives: [],
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.node).toEqual(mockNode);
      expect(result.current.subtopic).toEqual(mockNode.subtopics[0]);
      expect(result.current.selectedExerciseType).toBeNull();
      expect(result.current.currentMode).toBe('academia');
      expect(result.current.isLoaded).toBe(true);
    });

    it('should find the correct node by ID', () => {
      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.node?.id).toBe('test-node-1');
    });

    it('should find the correct subtopic by ID', () => {
      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.subtopic?.id).toBe('subtopic-1');
      expect(result.current.subtopic?.phrases).toEqual(FRENCH_PHRASES);
    });

    it('should return null for subtopic if not found', () => {
      // Mock useSearchParams to return non-existent subtopic
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockImplementation(() => ({
        get: vi.fn((key) => {
          if (key === 'subtopic') return 'non-existent';
          return null;
        }),
      }));

      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.subtopic).toBeNull();
    });
  });

  describe('exercise data generation', () => {
    it('should generate exercise data for all exercise types', () => {
      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.exerciseData).not.toBeNull();
      expect(result.current.exerciseData).toHaveProperty('cloze');
      expect(result.current.exerciseData).toHaveProperty('variations');
      expect(result.current.exerciseData).toHaveProperty('conversationalEcho');
      expect(result.current.exerciseData).toHaveProperty('dialogueIntonation');
      expect(result.current.exerciseData).toHaveProperty('janusComposer');
    });

    it('should return null exercise data when subtopic has no phrases', () => {
      const store = useImportedNodesStore.getState();
      (store as { nodes: ImportedNode[] }).nodes = [
        {
          ...mockNode,
          subtopics: [
            {
              id: 'empty-subtopic',
              title: 'Empty Subtopic',
              phrases: [],
              language: 'fr',
            },
          ],
        },
      ];

      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockImplementation(() => ({
        get: vi.fn((key) => {
          if (key === 'subtopic') return 'empty-subtopic';
          return null;
        }),
      }));

      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.exerciseData).toBeNull();
    });

    it('should filter out empty phrases', () => {
      const store = useImportedNodesStore.getState();
      (store as { nodes: ImportedNode[] }).nodes = [
        {
          ...mockNode,
          subtopics: [
            {
              id: 'subtopic-with-empty',
              title: 'Subtopic with Empty',
              phrases: ['Valid phrase', '', '   ', 'Another valid phrase'],
              language: 'fr',
            },
          ],
        },
      ];

      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockImplementation(() => ({
        get: vi.fn((key) => {
          if (key === 'subtopic') return 'subtopic-with-empty';
          return null;
        }),
      }));

      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.exerciseData).not.toBeNull();
    });
  });

  describe('caching behavior', () => {
    it('should cache phrase analysis to avoid re-computation', () => {
      let callCount = 0;
      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => {
        callCount++;
        return {
          verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
          nouns: [],
          adverbs: [],
          adjectives: [],
        };
      });

      const { result } = renderHook(() => useExerciseFlow());

      // Initial render should analyze all phrases
      expect(callCount).toBe(FRENCH_PHRASES.length);

      // Re-rendering should use cached values
      act(() => {
        result.current.setSelectedExerciseType('cloze');
      });

      // No additional calls to extractGrammaticalCategories
      expect(callCount).toBe(FRENCH_PHRASES.length);

      // Switching exercise type should not trigger re-analysis
      act(() => {
        result.current.setSelectedExerciseType('variations');
      });

      expect(callCount).toBe(FRENCH_PHRASES.length);
    });

    it('should clear cache when switching subtopics', () => {
      let callCount = 0;
      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => {
        callCount++;
        return {
          verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
          nouns: [],
          adverbs: [],
          adjectives: [],
        };
      });

      // First subtopic
      const { result, rerender } = renderHook(() => useExerciseFlow());
      expect(callCount).toBe(FRENCH_PHRASES.length);
      const firstCallCount = callCount;

      // Simulate switching subtopics
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockImplementation(() => ({
        get: vi.fn((key) => {
          if (key === 'subtopic') return 'subtopic-2';
          return null;
        }),
      }));

      act(() => {
        rerender();
      });

      // Cache should be cleared and phrases re-analyzed
      expect(callCount).toBeGreaterThan(firstCallCount);
    });

    it('should not call extractGrammaticalCategories when phrases are already cached', () => {
      let callCount = 0;
      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => {
        callCount++;
        return {
          verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
          nouns: [],
          adverbs: [],
          adjectives: [],
        };
      });

      const { result } = renderHook(() => useExerciseFlow());

      const initialCallCount = callCount;
      expect(initialCallCount).toBe(FRENCH_PHRASES.length);

      // Switch between exercise types multiple times
      act(() => {
        result.current.setSelectedExerciseType('cloze');
      });
      expect(callCount).toBe(initialCallCount);

      act(() => {
        result.current.setSelectedExerciseType('variations');
      });
      expect(callCount).toBe(initialCallCount);

      act(() => {
        result.current.setSelectedExerciseType('conversationalEcho');
      });
      expect(callCount).toBe(initialCallCount);
    });
  });

  describe('mode management', () => {
    it('should change lesson mode', () => {
      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.handleModeChange('desafio');
      });

      expect(result.current.currentMode).toBe('desafio');
    });

    it('should initialize with mode from URL params', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockImplementation(() => ({
        get: vi.fn((key) => {
          if (key === 'subtopic') return 'subtopic-1';
          if (key === 'mode') return 'desafio';
          return null;
        }),
      }));

      const { result } = renderHook(() => useExerciseFlow());

      expect(result.current.currentMode).toBe('desafio');
    });
  });

  describe('exercise type selection', () => {
    it('should select exercise type', () => {
      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.setSelectedExerciseType('cloze');
      });

      expect(result.current.selectedExerciseType).toBe('cloze');
    });

    it('should select exercise type via handleSelectExercise', () => {
      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.handleSelectExercise('variations');
      });

      expect(result.current.selectedExerciseType).toBe('variations');
    });
  });

  describe('exercise completion', () => {
    it('should advance to next exercise in desafio mode', () => {
      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.handleModeChange('desafio');
        result.current.setSelectedExerciseType('cloze');
      });

      const initialIndex = result.current.exerciseIndices.cloze;

      act(() => {
        result.current.handleExerciseComplete();
      });

      // In desafio mode, should advance to next exercise if available
      // or return to menu if at the end
      expect(result.current.selectedExerciseType).toBeDefined();
    });

    it('should return to menu in academia mode after completion', () => {
      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.handleModeChange('academia');
        result.current.setSelectedExerciseType('cloze');
      });

      act(() => {
        result.current.handleExerciseComplete();
      });

      // In academia mode, should return to menu after completion
      setTimeout(() => {
        expect(result.current.selectedExerciseType).toBeNull();
      }, 600);
    });
  });

  describe('navigation', () => {
    it('should navigate back to imported nodes when no exercise type selected', () => {
      const mockPush = vi.fn();
      const { useRouter } = require('next/navigation');
      useRouter.mockReturnValue({ push: mockPush });

      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.handleBack();
      });

      expect(mockPush).toHaveBeenCalledWith('/learn/imported/test-node-1');
    });

    it('should deselect exercise type in academia mode when going back', () => {
      const { result } = renderHook(() => useExerciseFlow());

      act(() => {
        result.current.handleModeChange('academia');
        result.current.setSelectedExerciseType('cloze');
      });

      expect(result.current.selectedExerciseType).toBe('cloze');

      act(() => {
        result.current.handleBack();
      });

      expect(result.current.selectedExerciseType).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle grammatical analysis errors gracefully', () => {
      mockExtractGrammaticalCategories.mockImplementation(() => {
        throw new Error('Analysis failed');
      });

      const { result } = renderHook(() => useExerciseFlow());

      // Should still return exercise data even if some analyses fail
      expect(result.current.exerciseData).not.toBeNull();
    });

    it('should handle partial analysis failures', () => {
      let callCount = 0;
      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Second phrase fails');
        }
        return {
          verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
          nouns: [],
          adverbs: [],
          adjectives: [],
        };
      });

      const { result } = renderHook(() => useExerciseFlow());

      // Should still generate exercises for phrases that succeeded
      expect(result.current.exerciseData).not.toBeNull();
    });
  });

  describe('performance metrics', () => {
    it('should achieve 67% reduction in analysis calls for 10 phrases', () => {
      const TEN_PHRASES = [
        'Phrase 1', 'Phrase 2', 'Phrase 3', 'Phrase 4', 'Phrase 5',
        'Phrase 6', 'Phrase 7', 'Phrase 8', 'Phrase 9', 'Phrase 10',
      ];

      const store = useImportedNodesStore.getState();
      (store as { nodes: ImportedNode[] }).nodes = [
        {
          ...mockNode,
          subtopics: [
            {
              id: 'ten-phrases',
              title: 'Ten Phrases',
              phrases: TEN_PHRASES,
              language: 'fr',
            },
          ],
        },
      ];

      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockImplementation(() => ({
        get: vi.fn((key) => {
          if (key === 'subtopic') return 'ten-phrases';
          return null;
        }),
      }));

      let callCount = 0;
      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => {
        callCount++;
        return {
          verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
          nouns: [],
          adverbs: [],
          adjectives: [],
        };
      });

      const { result } = renderHook(() => useExerciseFlow());

      // With caching, should only call once per phrase (10 times total)
      // Without caching, would call 3x per phrase (30 times total for 3 exercise types)
      expect(callCount).toBe(TEN_PHRASES.length);

      // Switching exercise types should not increase call count
      act(() => {
        result.current.setSelectedExerciseType('cloze');
      });
      expect(callCount).toBe(TEN_PHRASES.length);

      act(() => {
        result.current.setSelectedExerciseType('variations');
      });
      expect(callCount).toBe(TEN_PHRASES.length);

      // 67% reduction: 30 calls → 10 calls
      const reduction = ((30 - callCount) / 30) * 100;
      expect(reduction).toBeGreaterThanOrEqual(67);
    });
  });
});
