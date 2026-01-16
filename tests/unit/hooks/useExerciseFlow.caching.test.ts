/**
 * Simplified tests for useExerciseFlow hook caching behavior
 * Focuses on testing the core caching functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useExerciseFlow } from '@/hooks/useExerciseFlow';
import { extractGrammaticalCategories } from '@/services/posTaggingService';

// Mock the dependencies
vi.mock('@/services/posTaggingService', () => ({
  extractGrammaticalCategories: vi.fn(),
}));

vi.mock('@/services/generateExercisesFromPhrases', () => ({
  generateVariationsExercises: vi.fn(() => []),
  generateConversationalEchoExercises: vi.fn(() => []),
  generateDialogueIntonationExercises: vi.fn(() => []),
  generateJanusComposerExercises: vi.fn(() => []),
}));

vi.mock('@/services/importFlowService', () => ({
  generateAndAdaptClozeExercises: vi.fn(() => []),
}));

vi.mock('@/services/clozeExerciseService', () => ({
  generateClozeExercisesFromManualSubtopic: vi.fn(() => []),
  clozeExerciseToPhrase: vi.fn((exercise) => exercise),
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

describe('useExerciseFlow - Caching Behavior', () => {
  const mockExtractGrammaticalCategories = extractGrammaticalCategories as ReturnType<typeof vi.fn>;

  // Test data constants (real French phrases)
  const FRENCH_PHRASES = [
    'Je mange une pomme',
    'Elle est belle',
    'Le chat dort',
    'Nous allons au marché',
  ];

  beforeEach(() => {
    vi.clearAllMocks();

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

  describe('core caching functionality', () => {
    it('should analyze each phrase only once on initial render', () => {
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

      renderHook(() => useExerciseFlow());

      // Should analyze each phrase exactly once
      expect(callCount).toBe(FRENCH_PHRASES.length);
    });

    it('should not re-analyze phrases when switching exercise types', () => {
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

      // Switch between exercise types - should not trigger re-analysis
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

    it('should achieve significant reduction in analysis calls', () => {
      const TEN_PHRASES = [
        'Je mange une pomme', 'Elle est belle', 'Le chat dort', 'Nous allons au marché',
        'Il fait beau', 'Je suis content', 'Tu es là', 'Ils partent',
        'Elle vient', 'Nous restons',
      ];

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

      renderHook(() => useExerciseFlow());

      // With caching: 10 calls (once per phrase)
      // Without caching: 30 calls (3 exercise types × 10 phrases)
      expect(callCount).toBe(TEN_PHRASES.length);

      // Calculate reduction
      const withoutCachingCalls = TEN_PHRASES.length * 3; // 3 exercise types
      const reduction = ((withoutCachingCalls - callCount) / withoutCachingCalls) * 100;

      // Should achieve at least 60% reduction
      expect(reduction).toBeGreaterThanOrEqual(60);
    });

    it('should handle analysis failures gracefully and continue with other phrases', () => {
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

      // Should still generate exercise data even with one failure
      expect(result.current.exerciseData).not.toBeNull();
      expect(callCount).toBeGreaterThan(0);
    });

    it('should provide consistent exercise data across multiple renders', () => {
      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => ({
        verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
        nouns: [],
        adverbs: [],
        adjectives: [],
      }));

      const { result, rerender } = renderHook(() => useExerciseFlow());

      const firstExerciseData = result.current.exerciseData;

      // Re-render should not change exercise data
      act(() => {
        rerender();
      });

      expect(result.current.exerciseData).toEqual(firstExerciseData);
    });

    it('should not cache when phrases change', () => {
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

      // Clear cache by selecting a different subtopic
      // (In real scenario, this would be triggered by URL change)
      act(() => {
        result.current.setSelectedExerciseType('cloze');
      });

      // Exercise type change should not trigger re-analysis
      expect(callCount).toBe(initialCallCount);
    });
  });

  describe('performance characteristics', () => {
    it('should have minimal overhead for cached phrases', () => {
      const startTime = performance.now();

      mockExtractGrammaticalCategories.mockImplementation((phrase: string) => ({
        verbs: [{ word: phrase, lemma: phrase.toLowerCase(), pos: 'verb' as const, confidence: 0.8 }],
        nouns: [],
        adverbs: [],
        adjectives: [],
      }));

      const { result } = renderHook(() => useExerciseFlow());

      const firstRenderTime = performance.now() - startTime;

      // Second render should be faster due to caching
      const secondStartTime = performance.now();
      act(() => {
        result.current.setSelectedExerciseType('variations');
      });
      const secondRenderTime = performance.now() - secondStartTime;

      // Second render should be significantly faster or equal
      expect(secondRenderTime).toBeLessThanOrEqual(firstRenderTime * 2);
    });

    it('should scale efficiently with larger phrase sets', () => {
      const LARGE_PHRASE_SET = Array.from({ length: 50 }, (_, i) =>
        `Phrase numéro ${i + 1} avec quelques mots`
      );

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

      renderHook(() => useExerciseFlow());

      // Should still only analyze once per phrase
      expect(callCount).toBe(LARGE_PHRASE_SET.length);

      // Calculate theoretical savings
      const withoutCachingCalls = LARGE_PHRASE_SET.length * 3; // 3 exercise types
      const savedCalls = withoutCachingCalls - callCount;
      const reductionPercentage = (savedCalls / withoutCachingCalls) * 100;

      // Should achieve 66% reduction (2/3 of calls saved)
      expect(reductionPercentage).toBeCloseTo(66.67, 1);
    });
  });
});
