'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JanusComposer } from '@/schemas/content';
import type { JanusCompositionResult, SpeechRecordingResult } from '@/types';
import { generateConjugatedPhrase } from '@/services/conjugationService';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';
import { useGamificationStore } from '@/store/useGamificationStore';

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

// ============================================================
// TIPOS PARA NAVEGACIÓN POR TECLADO
// ============================================================

interface KeyboardFocusState {
  columnId: string | null;
  optionId: string | null;
}

// ============================================
// CONSTANTES
// ============================================

const XP_VALUES = {
  composition: 10,
  practiceSuccess: 15,
  dialogueBonus: 5,
};

const COLUMN_COLORS: Record<string, string> = {
  subject: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  verb: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  complement: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  time: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
};

const COLUMN_HEADER_COLORS: Record<string, string> = {
  subject: 'text-blue-700 dark:text-blue-400',
  verb: 'text-green-700 dark:text-green-400',
  complement: 'text-amber-700 dark:text-amber-400',
  time: 'text-purple-700 dark:text-purple-400',
};

const COLUMN_LABELS: Record<string, string> = {
  subject: 'Sujeto',
  verb: 'Verbo',
  complement: 'Complemento',
  time: 'Tiempo',
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
    if (orderedColumns.length === 0) return;

    const currentIndex = keyboardFocus.columnId
      ? orderedColumns.findIndex(col => col.id === keyboardFocus.columnId)
      : -1;

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = currentIndex < orderedColumns.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : orderedColumns.length - 1;
    }

    const nextColumn = orderedColumns[nextIndex];
    const firstOption = nextColumn.options[0];

    setKeyboardFocus({
      columnId: nextColumn.id,
      optionId: firstOption?.id || null,
    });

    // Scroll al elemento
    setTimeout(() => {
      optionRefs.current[`${nextColumn.id}-${firstOption?.id}`]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 0);
  }, [orderedColumns, keyboardFocus.columnId]);

  // Mover foco a una opción dentro de la columna actual
  const moveFocusToOption = useCallback((direction: 'next' | 'prev') => {
    if (!keyboardFocus.columnId) return;

    const column = orderedColumns.find(col => col.id === keyboardFocus.columnId);
    if (!column || column.options.length === 0) return;

    const currentIndex = keyboardFocus.optionId
      ? column.options.findIndex(opt => opt.id === keyboardFocus.optionId)
      : -1;

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = currentIndex < column.options.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : column.options.length - 1;
    }

    const nextOption = column.options[nextIndex];

    setKeyboardFocus(prev => ({
      ...prev,
      optionId: nextOption.id,
    }));

    // Scroll al elemento
    setTimeout(() => {
      optionRefs.current[`${column.id}-${nextOption.id}`]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 0);
  }, [orderedColumns, keyboardFocus.columnId, keyboardFocus.optionId]);

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
    // Solo activar en fase de composición
    if (phase !== 'composing') return;

    // Ignorar si el usuario está escribiendo en un input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocusToColumn('prev');
        break;

      case 'ArrowRight':
        event.preventDefault();
        moveFocusToColumn('next');
        break;

      case 'ArrowUp':
        event.preventDefault();
        moveFocusToOption('prev');
        break;

      case 'ArrowDown':
        event.preventDefault();
        moveFocusToOption('next');
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        selectFocusedOption();
        break;

      case 'Tab':
        event.preventDefault();
        moveFocusToColumn(event.shiftKey ? 'prev' : 'next');
        break;

      case 'Escape':
        event.preventDefault();
        if (keyboardFocus.columnId) {
          handleClearSelection(keyboardFocus.columnId);
        }
        break;
    }
  }, [phase, moveFocusToColumn, moveFocusToOption, selectFocusedOption, keyboardFocus.columnId, handleClearSelection]);

  // Efecto para registrar eventos de teclado
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Inicializar foco en la primera columna al entrar en composing phase
  useEffect(() => {
    if (phase === 'composing' && !keyboardFocus.columnId && orderedColumns.length > 0) {
      const firstColumn = orderedColumns[0];
      const firstOption = firstColumn.options[0];
      setKeyboardFocus({
        columnId: firstColumn.id,
        optionId: firstOption?.id || null,
      });
    }
  }, [phase, keyboardFocus.columnId, orderedColumns]);

  const currentDialogue = exercise.practiceDialogues?.[currentDialogueIndex];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-4 mb-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">🧩 Janus Composer</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Construye frases seleccionando opciones
            </p>
          </div>
          {phrasesCreated > 0 && (
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {phrasesCreated} frases
            </span>
          )}
        </div>
      </div>

      {/* Keyboard navigation hints - solo visible en composing phase */}
      <AnimatePresence>
        {phase === 'composing' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
          >
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">←→</kbd>
                <span>Columnas</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">↑↓</kbd>
                <span>Opciones</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">Enter</kbd>
                <span>Seleccionar</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">ESC</kbd>
                <span>Limpiar</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Fase de composición */}
        {phase === 'composing' && (
          <motion.div
            key="composing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Columnas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {orderedColumns.map((column) => {
                const colorClass = COLUMN_COLORS[column.type] || 'bg-gray-50';
                const headerColor = COLUMN_HEADER_COLORS[column.type] || 'text-gray-700';
                const selection = selections[column.id];

                return (
                  <div key={column.id} className="space-y-2">
                    {/* Header de columna */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase ${headerColor}`}>
                        {column.title || COLUMN_LABELS[column.type]}
                        {['subject', 'verb'].includes(column.type) && <span className="text-red-500 ml-0.5">*</span>}
                      </span>
                      {selection && (
                        <button
                          onClick={() => handleClearSelection(column.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Opciones */}
                    <div
                      ref={(el) => { columnRefs.current[column.id] = el; }}
                      className={`rounded-aaa-xl border-2 p-2 transition-all ${keyboardFocus.columnId === column.id ? 'ring-2 ring-indigo-400 ring-offset-2' : ''} ${colorClass}`}
                    >
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {column.options.map((option) => {
                          const isSelected = selection?.optionId === option.id;
                          const isFocused = keyboardFocus.columnId === column.id && keyboardFocus.optionId === option.id;
                          const showTranslation = hoveredTranslation === `${column.id}-${option.id}`;

                          return (
                            <motion.button
                              key={option.id}
                              ref={(el) => { optionRefs.current[`${column.id}-${option.id}`] = el; }}
                              onClick={() => handleSelectOption(column.id, {
                                id: option.id,
                                text: option.text,
                                ...(option.translation !== undefined && { translation: option.translation }),
                              })}
                              onMouseEnter={() => setHoveredTranslation(`${column.id}-${option.id}`)}
                              onMouseLeave={() => setHoveredTranslation(null)}
                              className={`
                                w-full px-3 py-2 rounded-lg text-sm text-left transition-all relative
                                ${isSelected
                                  ? 'bg-white dark:bg-gray-900 shadow-md ring-2 ring-indigo-500 font-medium'
                                  : isFocused
                                  ? 'bg-white dark:bg-gray-900 shadow-sm ring-2 ring-indigo-300'
                                  : 'bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900'
                                }
                              `}
                              animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                              transition={{ duration: 0.15 }}
                            >
                              <span className="block text-gray-900 dark:text-white">
                                {option.text}
                              </span>

                              {/* Traducción con hover-to-reveal (reduces cognitive load) */}
                              {option.translation && (
                                <motion.span
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{
                                    opacity: showTranslation ? 1 : 0.5,
                                    height: showTranslation ? 'auto' : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                  className="block text-xs text-gray-500 dark:text-gray-400 overflow-hidden"
                                >
                                  {option.translation}
                                </motion.span>
                              )}

                              {/* Indicador de foco por teclado */}
                              {isFocused && !isSelected && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 text-xs"
                                >
                                  ⌨
                                </motion.span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Frase generada */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  Frase resultante:
                </span>
                {Object.keys(selections).length > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {generatedPhrase ? (
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    &quot;{generatedPhrase}&quot;
                  </p>
                  {generatedTranslation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {generatedTranslation}
                    </p>
                  )}

                  {/* Indicador de conjugación automática */}
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                    <span>✓</span>
                    <span>Conjugación automática aplicada</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  Selecciona opciones de cada columna para crear tu frase...
                </p>
              )}
            </div>

            {/* Botón de confirmar */}
            <button
              onClick={handleConfirmComposition}
              disabled={!allRequiredSelected || !generatedPhrase}
              className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-aaa-xl font-medium transition-colors"
            >
              {allRequiredSelected && generatedPhrase
                ? 'Confirmar frase →'
                : 'Completa las columnas requeridas'
              }
            </button>
          </motion.div>
        )}

        {/* Fase de preview */}
        {phase === 'preview' && generatedPhrase && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ¡Frase creada!
              </h3>
            </div>

            {/* Frase destacada */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-6 text-white text-center">
              <p className="text-xl font-medium">&quot;{generatedPhrase}&quot;</p>
              {generatedTranslation && (
                <p className="text-white/80 mt-2">{generatedTranslation}</p>
              )}
            </div>

            {/* Desglose */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-3">
                Componentes:
              </p>
              <div className="flex flex-wrap gap-2">
                {orderedColumns.map((col) => {
                  const sel = selections[col.id];
                  if (!sel) return null;

                  const bgColor = COLUMN_COLORS[col.type]?.replace('border-', 'bg-').replace('-200', '-100') || 'bg-gray-100';
                  return (
                    <div
                      key={col.id}
                      className={`px-3 py-1.5 rounded-lg text-sm ${bgColor}`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {sel.value}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({COLUMN_LABELS[col.type]})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regla de conjugación */}
            {exercise.conjugationRules && exercise.conjugationRules.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-aaa-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  📚 Regla aplicada:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {exercise.conjugationRules[0].subject} + {exercise.conjugationRules[0].verb} → {exercise.conjugationRules[0].conjugated}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleNewCombination}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-aaa-xl font-medium transition-colors"
              >
                ← Nueva combinación
              </button>
              <button
                onClick={handleStartPractice}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors"
              >
                Practicar 🎤
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase de práctica */}
        {phase === 'practice' && generatedPhrase && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎤 Repite la frase
              </h3>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-6 text-white text-center">
              <p className="text-xl font-medium">&quot;{generatedPhrase}&quot;</p>
              {generatedTranslation && (
                <p className="text-white/80 mt-2">{generatedTranslation}</p>
              )}
            </div>

            <div className="flex justify-center">
              <SpeechRecorder
                onRecordingComplete={handleRecordingComplete}
                config={{ maxDuration: 5 }}
                showWaveform
                label="Mantén para grabar"
              />
            </div>
          </motion.div>
        )}

        {/* Fase de diálogo */}
        {phase === 'dialogue' && currentDialogue && (
          <motion.div
            key={`dialogue-${currentDialogueIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-sm text-emerald-700 dark:text-emerald-300">
                💬 Mini-diálogo {currentDialogueIndex + 1}/{exercise.practiceDialogues?.length}
              </span>
            </div>

            {/* Diálogo simple: prompt y respuesta */}
            <div className="space-y-3">
              {/* Prompt del sistema */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50">
                  🎭
                </div>
                <div className="flex-1 p-3 rounded-aaa-xl max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {currentDialogue.prompt}
                  </p>
                </div>
              </motion.div>

              {/* Respuesta del usuario */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 flex-row-reverse"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/50">
                  👤
                </div>
                <div className="flex-1 p-3 rounded-aaa-xl max-w-[80%] bg-emerald-100 dark:bg-emerald-900/30">
                  <p className="text-gray-900 dark:text-white">
                    &quot;{generatedPhrase}&quot;
                  </p>
                  {generatedTranslation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {generatedTranslation}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Respuesta esperada */}
              {currentDialogue.response && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50">
                    🎭
                  </div>
                  <div className="flex-1 p-3 rounded-aaa-xl max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white">
                      {currentDialogue.response}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleCompleteDialogue}
              className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors"
            >
              {currentDialogueIndex < (exercise.practiceDialogues?.length || 0) - 1
                ? 'Siguiente diálogo →'
                : 'Completar →'
              }
            </button>
          </motion.div>
        )}

        {/* Completado */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Ejercicio completado!
            </h3>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-4 text-white mt-6 inline-block">
              <p className="text-lg font-medium">&quot;{generatedPhrase}&quot;</p>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 font-medium">
                +{XP_VALUES.composition + XP_VALUES.practiceSuccess + (dialoguesCompleted * XP_VALUES.dialogueBonus)} XP
              </span>
            </div>
          </motion.div>
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
