'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { JanusComposer } from '@/schemas/content';
import type { JanusCompositionResult, SpeechRecordingResult } from '@/types';
import { generateConjugatedPhrase } from '@/services/conjugationService';
import { useExerciseGamification } from './hooks/useExerciseGamification';
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

// Hook específico para Janus Composer - maneja selecciones y frases
function useJanusComposer(exercise: JanusComposer) {
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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function JanusComposerExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: JanusComposerExerciseProps) {
  // Hooks compartidos
  const { grantReward } = useExerciseGamification();
  const [phase, setPhase] = useState<Phase>('composing');

  // Hook específico de Janus
  const janus = useJanusComposer(exercise);

  // Navegación por teclado
  const keyboardNav = useJanusKeyboardNavigation({
    phase,
    columns: janus.orderedColumns,
    selections: janus.selections,
    generatedPhrase: janus.generatedPhrase || '',
    onSelectOption: janus.handleSelectOption,
    onClearSelection: janus.handleClearSelection,
    onReset: janus.handleReset,
    onConfirmComposition: () => {
      if (!janus.generatedPhrase) return;
      grantReward({ baseXP: XP_VALUES.composition });
      janus.incrementPhrasesCreated();
      setPhase('preview');
    },
  });

  // Comenzar práctica
  const handleStartPractice = useCallback(() => {
    setPhase('practice');
  }, []);

  // Completar ejercicio
  const handleComplete = useCallback(() => {
    setPhase('complete');
    grantReward({
      baseXP: 0,
      gems: janus.dialoguesCompleted > 0 ? 3 : 1,
    });

    const result: JanusCompositionResult = {
      selectedOptions: Object.fromEntries(
        Object.entries(janus.selections).map(([k, v]) => [k, v.optionId])
      ),
      generatedPhrase: janus.generatedPhrase || '',
      conjugatedPhrase: janus.generatedPhrase || '',
      translation: janus.generatedTranslation || '',
      isGrammaticallyCorrect: true,
    };

    setTimeout(() => {
      onComplete(result);
    }, 1500);
  }, [janus, grantReward, onComplete]);

  // Manejar grabación completada
  const handleRecordingComplete = useCallback((_recording: SpeechRecordingResult) => {
    grantReward({ baseXP: XP_VALUES.practiceSuccess });

    if (exercise.practiceDialogues && exercise.practiceDialogues.length > 0) {
      janus.resetDialogue();
      setPhase('dialogue');
    } else {
      handleComplete();
    }
  }, [exercise.practiceDialogues, grantReward, janus, handleComplete]);

  // Completar diálogo actual
  const handleDialogueComplete = useCallback(() => {
    grantReward({ baseXP: XP_VALUES.dialogueBonus });
    janus.handleCompleteDialogue();

    if (janus.currentDialogueIndex >= (exercise.practiceDialogues?.length || 0) - 1) {
      handleComplete();
    }
  }, [grantReward, janus, exercise.practiceDialogues, handleComplete]);

  const currentDialogue = exercise.practiceDialogues?.[janus.currentDialogueIndex];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <JanusHeader phrasesCreated={janus.phrasesCreated} />

      {phase === 'composing' && <KeyboardHints />}

      <AnimatePresence mode="wait">
        {phase === 'composing' && (
          <ComposingPhase
            columns={janus.orderedColumns}
            selections={janus.selections}
            generatedPhrase={janus.generatedPhrase}
            generatedTranslation={janus.generatedTranslation}
            allRequiredSelected={janus.allRequiredSelected}
            keyboardFocus={keyboardNav.keyboardFocus}
            hoveredTranslation={keyboardNav.hoveredTranslation}
            columnRefs={keyboardNav.columnRefs}
            optionRefs={keyboardNav.optionRefs}
            onSelectOption={janus.handleSelectOption}
            onClearSelection={janus.handleClearSelection}
            onReset={janus.handleReset}
            onConfirmComposition={() => {
              if (!janus.generatedPhrase) return;
              grantReward({ baseXP: XP_VALUES.composition });
              janus.incrementPhrasesCreated();
              setPhase('preview');
            }}
            onHoverTranslation={keyboardNav.setHoveredTranslation}
          />
        )}

        {phase === 'preview' && janus.generatedPhrase && (
          <PreviewPhase
            generatedPhrase={janus.generatedPhrase}
            generatedTranslation={janus.generatedTranslation}
            selections={janus.selections}
            columns={janus.orderedColumns}
            conjugationRules={exercise.conjugationRules}
            onNewCombination={() => {
              janus.handleNewCombination();
              setPhase('composing');
            }}
            onStartPractice={handleStartPractice}
          />
        )}

        {phase === 'practice' && janus.generatedPhrase && (
          <PracticePhase
            generatedPhrase={janus.generatedPhrase}
            generatedTranslation={janus.generatedTranslation}
            onRecordingComplete={handleRecordingComplete}
          />
        )}

        {phase === 'dialogue' && currentDialogue && (
          <DialoguePhase
            currentDialogue={currentDialogue}
            currentDialogueIndex={janus.currentDialogueIndex}
            totalDialogues={exercise.practiceDialogues?.length || 0}
            generatedPhrase={janus.generatedPhrase}
            generatedTranslation={janus.generatedTranslation}
            onCompleteDialogue={handleDialogueComplete}
          />
        )}

        {phase === 'complete' && (
          <CompletePhase
            generatedPhrase={janus.generatedPhrase}
            totalXP={XP_VALUES.composition + XP_VALUES.practiceSuccess + (janus.dialoguesCompleted * XP_VALUES.dialogueBonus)}
          />
        )}
      </AnimatePresence>

      {onSkip && phase !== 'complete' && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-sm text-calm-text-muted hover:text-calm-text-secondary dark:text-calm-text-muted dark:hover:text-calm-text-tertiary"
          >
            Saltar ejercicio
          </button>
        </div>
      )}
    </div>
  );
}

export default JanusComposerExercise;
