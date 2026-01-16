import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useImportedNodesStore, type ImportedNode } from '@/store/useImportedNodesStore';
import {
  generateVariationsExercises,
  generateConversationalEchoExercises,
  generateDialogueIntonationExercises,
  generateJanusComposerExercises,
} from '@/services/generateExercisesFromPhrases';
import {
  generateAndAdaptClozeExercises,
  type GenerateClozeExercisesOptions,
} from '@/services/importFlowService';
import {
  extractGrammaticalCategories,
  type ExtractionResult,
} from '@/services/posTaggingService';
import type { LanguageCode } from '@/schemas/posTagging';
import type { SupportedLanguage } from '@/lib/constants';
import {
  generateClozeExercisesFromManualSubtopic,
  clozeExerciseToPhrase,
  type ManualClozeSubtopic,
} from '@/services/clozeExerciseService';
import type {
  Phrase,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
} from '@/types';

export type LessonMode = 'academia' | 'desafio';
export type ExerciseType = 'cloze' | 'variations' | 'conversationalEcho' | 'dialogueIntonation' | 'janusComposer' | null;

// ============================================================
// CACHE TYPES
// ============================================================

/**
 * Cache entry for grammatical analysis results
 */
interface GrammaticalAnalysisCacheEntry {
  result: ExtractionResult;
  timestamp: number;
}

/**
 * Cache for storing grammatical analysis results
 * Key format: "phrase-language"
 */
type GrammaticalAnalysisCache = Map<string, GrammaticalAnalysisCacheEntry>;

// ============================================================
// CACHE UTILITIES
// ============================================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Generates a cache key for a phrase and language
 */
function generateCacheKey(phrase: string, language: string): string {
  return `${phrase}-${language}`;
}

/**
 * Retrieves an analysis from cache if available and not expired
 */
function getCachedAnalysis(
  cache: GrammaticalAnalysisCache,
  phrase: string,
  language: string
): ExtractionResult | null {
  const key = generateCacheKey(phrase, language);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if cache entry has expired
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

/**
 * Stores an analysis result in cache
 */
function setCachedAnalysis(
  cache: GrammaticalAnalysisCache,
  phrase: string,
  language: string,
  result: ExtractionResult
): void {
  const key = generateCacheKey(phrase, language);
  cache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clears all expired entries from the cache
 */
function clearExpiredCacheEntries(cache: GrammaticalAnalysisCache): void {
  const now = Date.now();
  for (const [key, entry] of Array.from(cache.entries())) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
}

export interface ExerciseData {
  cloze: Phrase[];
  variations: Phrase[];
  conversationalEcho: ConversationalEcho[];
  dialogueIntonation: DialogueIntonation[];
  janusComposer: JanusComposer[];
}

export interface ExerciseFlowState {
  node: ImportedNode | null;
  subtopic: { id: string | null; title: string; phrases: string[]; language?: string } | null;
  exerciseData: ExerciseData | null;
  selectedExerciseType: ExerciseType;
  exerciseIndices: Record<string, number>;
  currentMode: LessonMode;
  isLoaded: boolean;
}

export interface ExerciseFlowActions {
  setSelectedExerciseType: (type: ExerciseType) => void;
  handleModeChange: (mode: LessonMode) => void;
  handleSelectExercise: (type: ExerciseType) => void;
  handleExerciseComplete: () => void;
  handleBack: () => void;
}

/**
 * Custom hook for exercise flow state management
 * Isolates exercise generation, mode switching, and navigation logic
 * Reduces complexity of exercise page components
 *
 * Performance optimization: Caches grammatical analysis to avoid re-analyzing
 * the same phrases across different exercise types
 */
// eslint-disable-next-line max-lines-per-function
export function useExerciseFlow(): ExerciseFlowState & ExerciseFlowActions {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useImportedNodesStore();
  const nodes = (store as { nodes: ImportedNode[] }).nodes;

  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');
  const modeParam = (searchParams.get('mode') || 'academia') as LessonMode;

  const [currentMode, setCurrentMode] = useState<LessonMode>(modeParam);
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>(null);
  const [exerciseIndices, setExerciseIndices] = useState({
    cloze: 0,
    variations: 0,
    conversationalEcho: 0,
    dialogueIntonation: 0,
    janusComposer: 0,
  });

  // Cache for grammatical analysis results (persists across exercise type changes)
  const analysisCacheRef = useRef<GrammaticalAnalysisCache>(new Map());

  const node = nodes.find((n) => n.id === nodeId) || null;
  const subtopic = useMemo(
    () => node?.subtopics.find((s) => s.id === subtopicId) || null,
    [node, subtopicId]
  );

  // Clear cache when switching subtopics to avoid stale data
  useEffect(() => {
    analysisCacheRef.current.clear();
  }, [subtopicId]);

  // Periodically clear expired cache entries
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredCacheEntries(analysisCacheRef.current);
    }, CACHE_TTL_MS);

    return () => clearInterval(interval);
  }, []);

  // Generar todos los tipos de ejercicios
  const exerciseData = useMemo((): ExerciseData | null => {
    if (!subtopic?.phrases?.length) {
      return null;
    }

    const phrases = subtopic.phrases.filter((p) => p && p.trim().length > 0);

    if (phrases.length === 0) {
      return null;
    }

    // Obtener idioma del subtópico (por defecto 'fr')
    const language = subtopic.language || 'fr';

    // Detectar si es un subtópico cloze manual (con metadatos de selección manual)
    const isManualCloze = subtopic.clozeMetadata?.isManualSelection === true &&
                         (subtopic.clozeMetadata.targetWordIndices?.length ?? 0) > 0;

    let clozeExercises: Phrase[];

    if (isManualCloze && subtopic.clozeMetadata?.targetWordIndices) {
      // Usar servicio especializado para cloze manual
      // Este servicio mantiene la oración completa y reemplaza solo la palabra objetivo
      const manualSubtopic: ManualClozeSubtopic = {
        phrases: subtopic.phrases,
        targetWordIndices: subtopic.clozeMetadata.targetWordIndices,
        language: subtopic.language,
      };

      const rawClozeExercises = generateClozeExercisesFromManualSubtopic(
        manualSubtopic,
        {
          maxExercisesPerPhrase: 1,
          minConfidence: 0.5,
          language: language as SupportedLanguage,
        }
      );

      // Convertir ClozeExercise a Phrase
      clozeExercises = rawClozeExercises.map(clozeExerciseToPhrase);
    } else {
      // Pre-analyze all phrases with caching
      const cache = analysisCacheRef.current;
      const precomputedAnalyses: Array<ExtractionResult | null> = phrases.map(phrase => {
        const cached = getCachedAnalysis(cache, phrase, language);
        if (cached) {
          return cached;
        }

        try {
          const result = extractGrammaticalCategories(phrase, language as LanguageCode);
          setCachedAnalysis(cache, phrase, language, result);
          return result;
        } catch (error) {
          console.warn(`Failed to analyze phrase: "${phrase}"`, error);
          return null;
        }
      });

      // Configuración para ejercicios cloze avanzados
      const clozeOptions: GenerateClozeExercisesOptions = {
        maxExercisesPerPhrase: 2,
        minConfidence: 0.6,
        language,
        prioritizePOSTypes: ['verb', 'adjective', 'noun', 'adverb'],
        precomputedAnalyses: precomputedAnalyses.filter((a): a is ExtractionResult => a !== null),
      };

      // Usar generación estándar de cloze
      clozeExercises = generateAndAdaptClozeExercises(phrases, clozeOptions);
    }

    return {
      cloze: clozeExercises,
      // Mantener generación simple para otros ejercicios
      variations: generateVariationsExercises(phrases, language),
      conversationalEcho: generateConversationalEchoExercises(phrases, language),
      dialogueIntonation: generateDialogueIntonationExercises(phrases),
      janusComposer: generateJanusComposerExercises(phrases, language),
    };
  }, [subtopic]);

  const handleModeChange = useCallback((newMode: LessonMode) => {
    setCurrentMode(newMode);
  }, []);

  const handleSelectExercise = useCallback((type: ExerciseType) => {
    setSelectedExerciseType(type);
  }, []);

  const handleExerciseComplete = useCallback(() => {
    if (!selectedExerciseType || !exerciseData) return;

    // En modo desafío, avanzar automáticamente
    if (currentMode === 'desafio') {
      const currentIndex = exerciseIndices[selectedExerciseType];
      const exercises = exerciseData[selectedExerciseType];

      if (exercises && currentIndex < exercises.length - 1) {
        setTimeout(() => {
          setExerciseIndices((prev) => ({
            ...prev,
            [selectedExerciseType]: prev[selectedExerciseType] + 1,
          }));
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedExerciseType(null);
        }, 500);
      }
    } else {
      // En modo academia, volver al menú
      setTimeout(() => {
        setSelectedExerciseType(null);
      }, 500);
    }
  }, [selectedExerciseType, exerciseIndices, exerciseData, currentMode, setExerciseIndices]);

  const handleBack = useCallback(() => {
    if (selectedExerciseType && currentMode === 'academia') {
      setSelectedExerciseType(null);
    } else {
      router.push(`/learn/imported/${nodeId}`);
    }
  }, [selectedExerciseType, currentMode, router, nodeId]);

  return {
    node,
    subtopic,
    exerciseData,
    selectedExerciseType,
    exerciseIndices,
    currentMode,
    isLoaded: true,
    setSelectedExerciseType,
    handleModeChange,
    handleSelectExercise,
    handleExerciseComplete,
    handleBack,
  };
}
