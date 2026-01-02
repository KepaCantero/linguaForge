'use client';

import { useState, useCallback, useMemo } from 'react';
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

    return generateConjugatedPhrase({ subject, verb, complement, time });
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
  }, [exercise.practiceDialogues, addXP]);

  // Completar diálogo actual
  const handleCompleteDialogue = useCallback(() => {
    addXP(XP_VALUES.dialogueBonus);
    setDialoguesCompleted(prev => prev + 1);

    if (currentDialogueIndex < (exercise.practiceDialogues?.length || 0) - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentDialogueIndex, exercise.practiceDialogues, addXP]);

  // Nueva combinación
  const handleNewCombination = useCallback(() => {
    setSelections({});
    setPhase('composing');
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

  const currentDialogue = exercise.practiceDialogues?.[currentDialogueIndex];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
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
                    <div className={`rounded-xl border-2 p-2 ${colorClass}`}>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {column.options.map((option) => {
                          const isSelected = selection?.optionId === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleSelectOption(column.id, { id: option.id, text: option.text, translation: option.translation })}
                              className={`
                                w-full px-3 py-2 rounded-lg text-sm text-left transition-all
                                ${isSelected
                                  ? 'bg-white dark:bg-gray-900 shadow-md ring-2 ring-indigo-500 font-medium'
                                  : 'bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900'
                                }
                              `}
                            >
                              <span className="block text-gray-900 dark:text-white">
                                {option.text}
                              </span>
                              {option.translation && (
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {option.translation}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Frase generada */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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
              className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-xl font-medium transition-colors"
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
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
              <p className="text-xl font-medium">&quot;{generatedPhrase}&quot;</p>
              {generatedTranslation && (
                <p className="text-white/80 mt-2">{generatedTranslation}</p>
              )}
            </div>

            {/* Desglose */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
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
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
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
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                ← Nueva combinación
              </button>
              <button
                onClick={handleStartPractice}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
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

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
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
                <div className="flex-1 p-3 rounded-xl max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                <div className="flex-1 p-3 rounded-xl max-w-[80%] bg-emerald-100 dark:bg-emerald-900/30">
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
                  <div className="flex-1 p-3 rounded-xl max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white">
                      {currentDialogue.response}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleCompleteDialogue}
              className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
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

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white mt-6 inline-block">
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
