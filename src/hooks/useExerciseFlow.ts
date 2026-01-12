import { useState, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useImportedNodesStore, type ImportedNode, type ImportedNodesStore } from '@/store/useImportedNodesStore';
import {
  generateClozeExercises,
  generateVariationsExercises,
  generateConversationalEchoExercises,
  generateDialogueIntonationExercises,
  generateJanusComposerExercises,
} from '@/services/generateExercisesFromPhrases';
import type {
  Phrase,
  ConversationalEcho,
  DialogueIntonation,
  JanusComposer,
} from '@/types';

export type LessonMode = 'academia' | 'desafio';
export type ExerciseType = 'cloze' | 'variations' | 'conversationalEcho' | 'dialogueIntonation' | 'janusComposer' | null;

export interface ExerciseData {
  cloze: Phrase[];
  variations: Phrase[];
  conversationalEcho: ConversationalEcho[];
  dialogueIntonation: DialogueIntonation[];
  janusComposer: JanusComposer[];
}

export interface ExerciseFlowState {
  node: ImportedNode | null;
  subtopic: { id: string | null; title: string; phrases: string[] } | null;
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
 */
export function useExerciseFlow(): ExerciseFlowState & ExerciseFlowActions {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useImportedNodesStore();
  const nodes = (store as { nodes: ImportedNode[] }).nodes;

  const nodeId = params.nodeId as string;
  const subtopicId = searchParams.get('subtopic');
  const modeParam = (searchParams.get('mode') || 'academia') as LessonMode;

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMode, setCurrentMode] = useState<LessonMode>(modeParam);
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>(null);
  const [exerciseIndices, setExerciseIndices] = useState({
    cloze: 0,
    variations: 0,
    conversationalEcho: 0,
    dialogueIntonation: 0,
    janusComposer: 0,
  });

  const node = nodes.find((n) => n.id === nodeId) || null;
  const subtopic = useMemo(
    () => node?.subtopics.find((s) => s.id === subtopicId) || null,
    [node, subtopicId]
  );

  // Generar todos los tipos de ejercicios
  const exerciseData = useMemo((): ExerciseData | null => {
    if (!subtopic || !subtopic.phrases || subtopic.phrases.length === 0) {
      return null;
    }

    const phrases = subtopic.phrases.filter((p) => p && p.trim().length > 0);

    if (phrases.length === 0) {
      return null;
    }

    return {
      cloze: generateClozeExercises(phrases),
      variations: generateVariationsExercises(phrases),
      conversationalEcho: generateConversationalEchoExercises(phrases),
      dialogueIntonation: generateDialogueIntonationExercises(phrases),
      janusComposer: generateJanusComposerExercises(phrases),
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
    isLoaded,
    setSelectedExerciseType,
    handleModeChange,
    handleSelectExercise,
    handleExerciseComplete,
    handleBack,
  };
}
