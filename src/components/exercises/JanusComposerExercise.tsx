'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { JanusComposer } from '@/schemas/content';
import type { JanusCompositionResult, SpeechRecordingResult } from '@/types';
import { useExerciseGamification } from './hooks/useExerciseGamification';
import { useJanusComposer } from './hooks/useJanusComposer';
import { useJanusKeyboardNavigation } from './hooks/useJanusKeyboardNavigation';
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
} as const;

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
