/**
 * Hook específico para Janus Composer
 * Maneja selecciones de columnas y generación de frases
 */

import { useState, useCallback, useMemo } from 'react';
import type { JanusComposer } from '@/schemas/content';
import { generateConjugatedPhrase } from '@/services/conjugationService';
import type { ColumnSelection } from './useJanusKeyboardNavigation';

// ============================================
// TYPES
// ============================================

export interface UseJanusComposerReturn {
  selections: Record<string, ColumnSelection>;
  orderedColumns: JanusComposer['columns'];
  generatedPhrase: ReturnType<typeof generateConjugatedPhrase> | null;
  generatedTranslation: string | null;
  allRequiredSelected: boolean;
  currentDialogueIndex: number;
  phrasesCreated: number;
  dialoguesCompleted: number;
  handleSelectOption: (columnId: string, option: { id: string; text: string; translation?: string }) => void;
  handleClearSelection: (columnId: string) => void;
  handleReset: () => void;
  handleNewCombination: () => void;
  incrementPhrasesCreated: () => void;
  handleCompleteDialogue: () => void;
  resetDialogue: () => void;
  setCurrentDialogueIndex: (index: number) => void;
}

// ============================================
// MAIN HOOK
// ============================================

export function useJanusComposer(exercise: JanusComposer): UseJanusComposerReturn {
  const [selections, setSelections] = useState<Record<string, ColumnSelection>>({});
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [phrasesCreated, setPhrasesCreated] = useState(0);
  const [dialoguesCompleted, setDialoguesCompleted] = useState(0);

  // Ordenar columnas: Subject > Verb > Complement > Time
  const orderedColumns = useMemo(() => {
    const order = ['subject', 'verb', 'complement', 'time'];
    return [...exercise.columns].sort((a, b) => {
      const aIndex = order.indexOf(a.type);
      const bIndex = order.indexOf(b.type);
      return aIndex - bIndex;
    });
  }, [exercise.columns]);

  // Generar frase conjugada
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

  // Generar traducción combinada
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

  // Verificar si todas las columnas principales están seleccionadas
  const allRequiredSelected = useMemo(() => {
    const requiredTypes = ['subject', 'verb'];
    return orderedColumns.every(col =>
      !requiredTypes.includes(col.type) || selections[col.id]
    );
  }, [orderedColumns, selections]);

  // Manejar selección de opción
  const handleSelectOption = useCallback((columnId: string, option: { id: string; text: string; translation?: string }) => {
    setSelections(prev => ({
      ...prev,
      [columnId]: {
        columnId,
        optionId: option.id,
        value: option.text,
        translation: option.translation,
      },
    }));
  }, []);

  // Limpiar selección
  const handleClearSelection = useCallback((columnId: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[columnId];
      return newSelections;
    });
  }, []);

  // Resetear todo
  const handleReset = useCallback(() => {
    setSelections({});
  }, []);

  // Nueva combinación
  const handleNewCombination = useCallback(() => {
    setSelections({});
  }, []);

  // Incrementar frases creadas
  const incrementPhrasesCreated = useCallback(() => {
    setPhrasesCreated(prev => prev + 1);
  }, []);

  // Completar diálogo actual
  const handleCompleteDialogue = useCallback(() => {
    setDialoguesCompleted(prev => prev + 1);

    if (currentDialogueIndex < (exercise.practiceDialogues?.length || 0) - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    }
  }, [currentDialogueIndex, exercise.practiceDialogues]);

  // Resetear diálogo
  const resetDialogue = useCallback(() => {
    setCurrentDialogueIndex(0);
    setDialoguesCompleted(0);
  }, []);

  return {
    selections,
    orderedColumns,
    generatedPhrase,
    generatedTranslation,
    allRequiredSelected,
    currentDialogueIndex,
    phrasesCreated,
    dialoguesCompleted,
    handleSelectOption,
    handleClearSelection,
    handleReset,
    handleNewCombination,
    incrementPhrasesCreated,
    handleCompleteDialogue,
    resetDialogue,
    setCurrentDialogueIndex,
  };
}
