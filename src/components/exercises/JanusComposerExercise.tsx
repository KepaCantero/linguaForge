'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { JanusComposer } from '@/schemas/content';
import type { JanusCompositionResult, SpeechRecordingResult } from '@/types';
import { generateConjugatedPhrase } from '@/services/conjugationService';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useJanusKeyboardNavigation, type ColumnSelection } from './hooks/useJanusKeyboardNavigation';
import { JanusHeader } from './janus/JanusHeader';
import { KeyboardHints } from './janus/KeyboardHints';
import { ComposingPhase } from './janus/ComposingPhase';
import { PreviewPhase } from './janus/PreviewPhase';
import { PracticePhase } from './janus/PracticePhase';
import { DialoguePhase } from './janus/DialoguePhase';
import { CompletePhase } from './janus/CompletePhase';

// ============================================
// TIPOS
// ============================================

interface JanusComposerExerciseProps {
  exercise: JanusComposer;
  onComplete: (result: JanusCompositionResult) => void;
  onSkip?: () => void;
  className?: string;
}

type Phase = 'composing' | 'preview' | 'practice' | 'dialogue' | 'complete';

// ============================================
// CONSTANTES
// ============================================

const XP_VALUES = {
  composition: 10,
  practiceSuccess: 15,
  dialogueBonus: 5,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function JanusComposerExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: JanusComposerExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<Phase>('composing');
  const [selections, setSelections] = useState<Record<string, ColumnSelection>>({});
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [dialoguesCompleted, setDialoguesCompleted] = useState(0);
  const [phrasesCreated, setPhrasesCreated] = useState(0);

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
        ...(option.translation !== undefined && { translation: option.translation }),
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

  // Confirmar composición
  const handleConfirmComposition = useCallback(() => {
    if (!generatedPhrase) return;
    addXP(XP_VALUES.composition);
    setPhrasesCreated(prev => prev + 1);
    setPhase('preview');
  }, [generatedPhrase, addXP]);

  // Comenzar práctica
  const handleStartPractice = useCallback(() => {
    setPhase('practice');
  }, []);

  // Completar ejercicio
  const handleComplete = useCallback(() => {
    setPhase('complete');
    addGems(dialoguesCompleted > 0 ? 3 : 1);

    const result: JanusCompositionResult = {
      selectedOptions: Object.fromEntries(
        Object.entries(selections).map(([k, v]) => [k, v.optionId])
      ),
      generatedPhrase: generatedPhrase || '',
      conjugatedPhrase: generatedPhrase || '',
      translation: generatedTranslation || '',
      isGrammaticallyCorrect: true,
    };

    setTimeout(() => {
      onComplete(result);
    }, 1500);
  }, [selections, generatedPhrase, generatedTranslation, dialoguesCompleted, addGems, onComplete]);

  // Manejar grabación completada
  const handleRecordingComplete = useCallback((_recording: SpeechRecordingResult) => {
    addXP(XP_VALUES.practiceSuccess);

    if (exercise.practiceDialogues && exercise.practiceDialogues.length > 0) {
      setCurrentDialogueIndex(0);
      setPhase('dialogue');
    } else {
      handleComplete();
    }
  }, [exercise.practiceDialogues, addXP, handleComplete]);

  // Completar diálogo actual
  const handleCompleteDialogue = useCallback(() => {
    addXP(XP_VALUES.dialogueBonus);
    setDialoguesCompleted(prev => prev + 1);

    if (currentDialogueIndex < (exercise.practiceDialogues?.length || 0) - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentDialogueIndex, exercise.practiceDialogues, addXP, handleComplete]);

  // Nueva combinación
  const handleNewCombination = useCallback(() => {
    setSelections({});
    setPhase('composing');
  }, []);

  // Navegación por teclado - custom hook
  const keyboardNav = useJanusKeyboardNavigation({
    phase,
    columns: orderedColumns,
    selections,
    generatedPhrase: generatedPhrase || '',
    onSelectOption: handleSelectOption,
    onClearSelection: handleClearSelection,
    onReset: handleReset,
    onConfirmComposition: handleConfirmComposition,
  });

  const currentDialogue = exercise.practiceDialogues?.[currentDialogueIndex];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <JanusHeader phrasesCreated={phrasesCreated} />

      {phase === 'composing' && <KeyboardHints />}

      <AnimatePresence mode="wait">
        {phase === 'composing' && (
          <ComposingPhase
            columns={orderedColumns}
            selections={selections}
            generatedPhrase={generatedPhrase}
            generatedTranslation={generatedTranslation}
            allRequiredSelected={allRequiredSelected}
            keyboardFocus={keyboardNav.keyboardFocus}
            hoveredTranslation={keyboardNav.hoveredTranslation}
            columnRefs={keyboardNav.columnRefs}
            optionRefs={keyboardNav.optionRefs}
            onSelectOption={handleSelectOption}
            onClearSelection={handleClearSelection}
            onReset={handleReset}
            onConfirmComposition={handleConfirmComposition}
            onHoverTranslation={keyboardNav.setHoveredTranslation}
          />
        )}

        {phase === 'preview' && generatedPhrase && (
          <PreviewPhase
            generatedPhrase={generatedPhrase}
            generatedTranslation={generatedTranslation}
            selections={selections}
            columns={orderedColumns}
            conjugationRules={exercise.conjugationRules}
            onNewCombination={handleNewCombination}
            onStartPractice={handleStartPractice}
          />
        )}

        {phase === 'practice' && generatedPhrase && (
          <PracticePhase
            generatedPhrase={generatedPhrase}
            generatedTranslation={generatedTranslation}
            onRecordingComplete={handleRecordingComplete}
          />
        )}

        {phase === 'dialogue' && currentDialogue && (
          <DialoguePhase
            currentDialogue={currentDialogue}
            currentDialogueIndex={currentDialogueIndex}
            totalDialogues={exercise.practiceDialogues?.length || 0}
            generatedPhrase={generatedPhrase}
            generatedTranslation={generatedTranslation}
            onCompleteDialogue={handleCompleteDialogue}
          />
        )}

        {phase === 'complete' && (
          <CompletePhase
            generatedPhrase={generatedPhrase}
            totalXP={XP_VALUES.composition + XP_VALUES.practiceSuccess + (dialoguesCompleted * XP_VALUES.dialogueBonus)}
          />
        )}
      </AnimatePresence>

      {onSkip && phase !== 'complete' && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Saltar ejercicio
          </button>
        </div>
      )}
    </div>
  );
}

export default JanusComposerExercise;
