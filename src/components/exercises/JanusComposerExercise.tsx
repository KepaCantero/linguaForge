'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { JanusComposer } from '@/schemas/content';
import type { JanusCompositionResult, SpeechRecordingResult } from '@/types';
import { generateConjugatedPhrase } from '@/services/conjugationService';
import { useGamificationStore } from '@/store/useGamificationStore';
import {
  getAdjacentColumnFocus,
  getAdjacentOptionFocus,
  processKeyboardEvent,
  initializeKeyboardFocus,
  type KeyboardFocusState,
} from '@/services/janusKeyboardNavigationService';
import { JanusHeader } from './janus/JanusHeader';
import { KeyboardHints } from './janus/KeyboardHints';
import { ComposingPhase, type ComposingColumn } from './janus/ComposingPhase';
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

interface ColumnSelection {
  columnId: string;
  optionId: string;
  value: string;
  translation?: string;
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

  // Keyboard navigation state
  const [keyboardFocus, setKeyboardFocus] = useState<KeyboardFocusState>({
    columnId: null,
    optionId: null,
  });
  const [hoveredTranslation, setHoveredTranslation] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

    // Obtener valores
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

  // Verificar si todas las columnas principales están seleccionadas (subject y verb son requeridas)
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRecordingComplete = useCallback((_recording: SpeechRecordingResult) => {
    addXP(XP_VALUES.practiceSuccess);

    // Si hay diálogos de práctica, ir a ellos
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

  // ============================================================
  // NAVEGACIÓN POR TECLADO
  // ============================================================

  // Mover foco a una columna específica
  const moveFocusToColumn = useCallback((direction: 'next' | 'prev') => {
    const newFocus = getAdjacentColumnFocus(keyboardFocus, orderedColumns, direction);

    if (newFocus.columnId && newFocus.optionId) {
      setKeyboardFocus(newFocus);

      // Scroll al elemento
      setTimeout(() => {
        optionRefs.current[`${newFocus.columnId}-${newFocus.optionId}`]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }
  }, [keyboardFocus, orderedColumns]);

  // Mover foco a una opción dentro de la columna actual
  const moveFocusToOption = useCallback((direction: 'next' | 'prev') => {
    const newFocus = getAdjacentOptionFocus(keyboardFocus, orderedColumns, direction);

    if (newFocus.optionId && newFocus.columnId) {
      setKeyboardFocus(newFocus);

      // Scroll al elemento
      setTimeout(() => {
        optionRefs.current[`${newFocus.columnId}-${newFocus.optionId}`]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);
    }
  }, [keyboardFocus, orderedColumns]);

  // Seleccionar la opción enfocada
  const selectFocusedOption = useCallback(() => {
    if (!keyboardFocus.columnId || !keyboardFocus.optionId) return;

    const column = orderedColumns.find(col => col.id === keyboardFocus.columnId);
    if (!column) return;

    const option = column.options.find(opt => opt.id === keyboardFocus.optionId);
    if (!option) return;

    handleSelectOption(column.id, {
      id: option.id,
      text: option.text,
      ...(option.translation !== undefined && { translation: option.translation }),
    });

    // Auto-mover a la siguiente columna requerida
    const requiredTypes = ['subject', 'verb'];
    const nextRequiredColumn = orderedColumns.find((col, index) => {
      const colIndex = orderedColumns.findIndex(c => c.id === column.id);
      return index > colIndex && requiredTypes.includes(col.type) && !selections[col.id];
    });

    if (nextRequiredColumn) {
      const firstOption = nextRequiredColumn.options[0];
      setKeyboardFocus({
        columnId: nextRequiredColumn.id,
        optionId: firstOption?.id || null,
      });
    }
  }, [keyboardFocus.columnId, keyboardFocus.optionId, orderedColumns, selections, handleSelectOption]);

  // Manejar teclas de navegación
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const result = processKeyboardEvent({
      event,
      phase,
      currentFocus: keyboardFocus,
      columns: orderedColumns,
      selections,
      canSubmit: !!generatedPhrase,
      canPreview: false, // not implemented
    });

    if (result.preventDefault) {
      event.preventDefault();
    }

    if (result.newFocus) {
      setKeyboardFocus(result.newFocus);
    }

    switch (result.action) {
      case 'select_focused':
        selectFocusedOption();
        break;
      case 'clear_column':
        if (result.newFocus?.columnId) {
          handleClearSelection(result.newFocus.columnId);
        }
        break;
      case 'clear_all':
        handleReset();
        break;
      case 'submit':
        handleConfirmComposition();
        break;
    }
  }, [phase, keyboardFocus, orderedColumns, selections, generatedPhrase, selectFocusedOption, handleClearSelection, handleReset, handleConfirmComposition]);

  // Efecto para registrar eventos de teclado
  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Inicializar foco en la primera columna al entrar en composing phase
  useEffect(() => {
    if (phase === 'composing' && !keyboardFocus.columnId && orderedColumns.length > 0) {
      setKeyboardFocus(initializeKeyboardFocus(orderedColumns));
    }
  }, [phase, keyboardFocus.columnId, orderedColumns]);

  const currentDialogue = exercise.practiceDialogues?.[currentDialogueIndex];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <JanusHeader phrasesCreated={phrasesCreated} />

      {/* Keyboard navigation hints - solo visible en composing phase */}
      {phase === 'composing' && <KeyboardHints />}

      <AnimatePresence mode="wait">
        {/* Fase de composición */}
        {phase === 'composing' && (
          <ComposingPhase
            columns={orderedColumns}
            selections={selections}
            generatedPhrase={generatedPhrase}
            generatedTranslation={generatedTranslation}
            allRequiredSelected={allRequiredSelected}
            keyboardFocus={keyboardFocus}
            hoveredTranslation={hoveredTranslation}
            columnRefs={columnRefs}
            optionRefs={optionRefs}
            onSelectOption={handleSelectOption}
            onClearSelection={handleClearSelection}
            onReset={handleReset}
            onConfirmComposition={handleConfirmComposition}
            onHoverTranslation={setHoveredTranslation}
          />
        )}

        {/* Fase de preview */}
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

        {/* Fase de práctica */}
        {phase === 'practice' && generatedPhrase && (
          <PracticePhase
            generatedPhrase={generatedPhrase}
            generatedTranslation={generatedTranslation}
            onRecordingComplete={handleRecordingComplete}
          />
        )}

        {/* Fase de diálogo */}
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

        {/* Completado */}
        {phase === 'complete' && (
          <CompletePhase
            generatedPhrase={generatedPhrase}
            totalXP={XP_VALUES.composition + XP_VALUES.practiceSuccess + (dialoguesCompleted * XP_VALUES.dialogueBonus)}
          />
        )}
      </AnimatePresence>

      {/* Botón de saltar */}
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
