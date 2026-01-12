/**
 * useJanusComposerState Hook
 *
 * Manages state for Janus Composer exercise
 * Extracts state management logic from JanusComposerExercise component
 *
 * Hooks extracted: 7 useState + related state logic
 */

import { useState, useCallback, useMemo } from 'react';
import type { JanusComposer } from '@/schemas/content';
import { generateConjugatedPhrase } from '@/services/conjugationService';

// ============================================================
// TYPES
// ============================================================

interface ColumnSelection {
  columnId: string;
  optionId: string;
  value: string;
  translation?: string;
}

export interface JanusComposerState {
  phase: Phase;
  selections: Record<string, ColumnSelection>;
  currentDialogueIndex: number;
  dialoguesCompleted: number;
  phrasesCreated: number;
  generatedPhrase: string | null;
  generatedTranslation: string | null;
  allRequiredSelected: boolean;
  orderedColumns: JanusComposer['columns'];
}

export interface JanusComposerActions {
  setPhase: (phase: Phase) => void;
  handleSelectOption: (columnId: string, option: { id: string; text: string; translation?: string }) => void;
  handleClearSelection: (columnId: string) => void;
  handleReset: () => void;
  handleConfirmComposition: () => void;
  handleCompleteDialogue: () => void;
  handleNewCombination: () => void;
  incrementPhrasesCreated: () => void;
}

type Phase = 'composing' | 'preview' | 'practice' | 'dialogue' | 'complete';

// ============================================================
// CONSTANTS
// ============================================================

const COLUMN_ORDER = ['subject', 'verb', 'complement', 'time', 'other'] as const;
const REQUIRED_TYPES = ['subject', 'verb'] as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function sortColumns(columns: JanusComposer['columns']) {
  return [...columns].sort((a, b) => {
    const aIndex = COLUMN_ORDER.indexOf(a.type);
    const bIndex = COLUMN_ORDER.indexOf(b.type);
    return aIndex - bIndex;
  });
}

// ============================================================
// HOOK
// ============================================================

export function useJanusComposerState(exercise: JanusComposer): JanusComposerState & JanusComposerActions {
  // State
  const [phase, setPhase] = useState<Phase>('composing');
  const [selections, setSelections] = useState<Record<string, ColumnSelection>>({});
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [dialoguesCompleted, setDialoguesCompleted] = useState(0);
  const [phrasesCreated, setPhrasesCreated] = useState(0);

  // Computed values
  const orderedColumns = useMemo(() => sortColumns(exercise.columns), [exercise.columns]);

  const generatedPhrase = useMemo(() => {
    const subjectCol = orderedColumns.find(c => c.type === 'subject');
    const verbCol = orderedColumns.find(c => c.type === 'verb');

    if (!subjectCol || !verbCol) return null;

    const subjectSel = selections[subjectCol.id];
    const verbSel = selections[verbCol.id];

    if (!subjectSel || !verbSel) return null;

    const subject = subjectSel.value;
    const verb = verbSel.value;

    const complementCol = orderedColumns.find(c => c.type === 'complement');
    const timeCol = orderedColumns.find(c => c.type === 'time');

    const complement = complementCol && selections[complementCol.id]?.value;
    const time = timeCol && selections[timeCol.id]?.value;

    return generateConjugatedPhrase({
      subject,
      verb,
      ...(complement !== undefined && { complement }),
      ...(time !== undefined && { time }),
    });
  }, [orderedColumns, selections]);

  const generatedTranslation = useMemo(() => {
    if (!generatedPhrase) return null;

    const parts: string[] = [];

    for (const col of orderedColumns) {
      const sel = selections[col.id];
      if (sel?.translation) {
        parts.push(sel.translation);
      }
    }

    return parts.join(' ').trim() || 'Frase en español...';
  }, [orderedColumns, selections, generatedPhrase]);

  const allRequiredSelected = useMemo(() => {
    return orderedColumns.every(col =>
      !(col.type === 'subject' || col.type === 'verb') || selections[col.id]
    );
  }, [orderedColumns, selections]);

  // Actions
  const handleSelectOption = useCallback((columnId: string, option: { id: string; text: string; translation?: string }) => {
    setSelections(prev => ({
      ...prev,
      [columnId]: {
        columnId,
        optionId: option.id,
        value: option.text,
        ...(option.translation !== undefined && { translation: option.translation }),
      },
    }));
  }, []);

  const handleClearSelection = useCallback((columnId: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[columnId];
      return newSelections;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelections({});
  }, []);

  const handleConfirmComposition = useCallback(() => {
    if (!generatedPhrase) return;
    setPhrasesCreated(prev => prev + 1);
    setPhase('preview');
  }, [generatedPhrase]);

  const handleCompleteDialogue = useCallback(() => {
    setDialoguesCompleted(prev => prev + 1);

    if (currentDialogueIndex < (exercise.practiceDialogues?.length || 0) - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    }
  }, [currentDialogueIndex, exercise.practiceDialogues]);

  const handleNewCombination = useCallback(() => {
    setSelections({});
    setPhase('composing');
  }, []);

  const incrementPhrasesCreated = useCallback(() => {
    setPhrasesCreated(prev => prev + 1);
  }, []);

  return {
    // State
    phase,
    selections,
    currentDialogueIndex,
    dialoguesCompleted,
    phrasesCreated,
    generatedPhrase,
    generatedTranslation,
    allRequiredSelected,
    orderedColumns,
    // Actions
    setPhase,
    handleSelectOption,
    handleClearSelection,
    handleReset,
    handleConfirmComposition,
    handleCompleteDialogue,
    handleNewCombination,
    incrementPhrasesCreated,
  };
}
