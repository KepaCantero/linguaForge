'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DialogueIntonation } from '@/schemas/content';
import type { IntonationEvaluationResult, SpeechRecordingResult, RhythmAnalysis } from '@/types';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';
import { RhythmVisualizer, RhythmFeedback, calculateRhythmSimilarity } from '@/components/shared/RhythmVisualizer';
import { useGamificationStore } from '@/store/useGamificationStore';

// ============================================
// TIPOS
// ============================================

interface DialogueIntonationExerciseProps {
  exercise: DialogueIntonation;
  onComplete: (results: IntonationEvaluationResult[]) => void;
  onSkip?: () => void;
  className?: string;
}

type Phase = 'preview' | 'practicing' | 'comparing' | 'complete';

// ============================================
// CONSTANTES
// ============================================

const XP_VALUES = {
  excellent: 30, // >= 80%
  good: 20,      // >= 70%
  tryAgain: 10,  // < 70%
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function DialogueIntonationExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: DialogueIntonationExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<Phase>('preview');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRhythmPattern, setUserRhythmPattern] = useState<number[]>([]);
  const [currentSimilarity, setCurrentSimilarity] = useState<number>(0);
  const [turnResults, setTurnResults] = useState<IntonationEvaluationResult[]>([]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Obtener turnos del usuario
  const userTurnIndices = exercise.userTurns ||
    exercise.dialogue
      .map((turn, i) => turn.speaker === 'user' ? i : -1)
      .filter(i => i >= 0);

  // Obtener turno actual del usuario
  const getCurrentUserTurn = useCallback(() => {
    const dialogueIndex = userTurnIndices[currentTurnIndex];
    return dialogueIndex !== undefined ? exercise.dialogue[dialogueIndex] : null;
  }, [currentTurnIndex, userTurnIndices, exercise.dialogue]);

  // Obtener patrón de ritmo nativo
  const getNativePattern = useCallback((turnIdx: number): number[] => {
    const dialogueIndex = userTurnIndices[turnIdx];
    const rhythmData = exercise.rhythmPatterns?.find(rp => rp.turnIndex === dialogueIndex);

    if (rhythmData) {
      return rhythmData.segments;
    }

    // Generar patrón estimado basado en duración y palabras
    const turn = exercise.dialogue[dialogueIndex];
    if (!turn) return [];

    const words = turn.text.split(/\s+/);
    const avgDuration = (turn.duration * 1000) / words.length;
    return words.map(() => avgDuration + (Math.random() * 40 - 20));
  }, [exercise, userTurnIndices]);

  // Reproducir diálogo completo
  const playFullDialogue = useCallback(async () => {
    setIsPlaying(true);

    for (let i = 0; i < exercise.dialogue.length; i++) {
      const audio = audioRefs.current[i];
      if (audio) {
        await new Promise<void>((resolve) => {
          const handleEnd = () => {
            audio.removeEventListener('ended', handleEnd);
            resolve();
          };
          audio.addEventListener('ended', handleEnd);
          audio.currentTime = 0;
          audio.play().catch(() => resolve());
        });
        // Pausa entre turnos
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    setIsPlaying(false);
  }, [exercise.dialogue]);

  // Reproducir contexto hasta el turno actual
  const playContext = useCallback(async () => {
    const dialogueIndex = userTurnIndices[currentTurnIndex];
    if (dialogueIndex === undefined) return;

    setIsPlaying(true);

    // Reproducir turnos del sistema hasta el actual
    for (let i = 0; i < dialogueIndex; i++) {
      const turn = exercise.dialogue[i];
      if (turn.speaker === 'system') {
        const audio = audioRefs.current[i];
        if (audio) {
          await new Promise<void>((resolve) => {
            const handleEnd = () => {
              audio.removeEventListener('ended', handleEnd);
              resolve();
            };
            audio.addEventListener('ended', handleEnd);
            audio.currentTime = 0;
            audio.play().catch(() => resolve());
          });
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    setIsPlaying(false);
  }, [currentTurnIndex, userTurnIndices, exercise.dialogue]);

  // Reproducir ejemplo del turno actual
  const playCurrentTurnExample = useCallback(() => {
    const dialogueIndex = userTurnIndices[currentTurnIndex];
    const audio = audioRefs.current[dialogueIndex];
    if (audio) {
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.currentTime = 0;
      audio.play();
    }
  }, [currentTurnIndex, userTurnIndices]);

  // Iniciar práctica
  const handleStartPractice = useCallback(() => {
    setCurrentTurnIndex(0);
    setTurnResults([]);
    setPhase('practicing');
  }, []);

  // Manejar grabación completada
  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const currentTurn = getCurrentUserTurn();
    if (!currentTurn) return;

    // Simular análisis de ritmo (en producción usar análisis de audio real)
    const words = currentTurn.text.split(/\s+/);
    const userPattern = words.map(() => {
      const base = recording.duration / words.length;
      return base + (Math.random() * 80 - 40);
    });
    setUserRhythmPattern(userPattern);

    // Calcular similitud
    const nativePattern = getNativePattern(currentTurnIndex);
    const similarity = calculateRhythmSimilarity(nativePattern, userPattern);
    setCurrentSimilarity(similarity);

    // Crear resultado
    const rhythmAnalysis: RhythmAnalysis = {
      pattern: userPattern,
      pauses: [],
      overallSimilarity: similarity,
    };

    let xpEarned: number;
    if (similarity >= 80) {
      xpEarned = XP_VALUES.excellent;
      addGems(2);
    } else if (similarity >= 70) {
      xpEarned = XP_VALUES.good;
    } else {
      xpEarned = XP_VALUES.tryAgain;
    }

    addXP(xpEarned);

    const result: IntonationEvaluationResult = {
      turnIndex: userTurnIndices[currentTurnIndex],
      rhythmAnalysis,
      isAcceptable: similarity >= 70,
      xpEarned,
    };

    setTurnResults(prev => [...prev, result]);
    setPhase('comparing');
  }, [getCurrentUserTurn, getNativePattern, currentTurnIndex, userTurnIndices, addXP, addGems]);

  // Continuar al siguiente turno
  const handleContinue = useCallback(() => {
    if (currentTurnIndex < userTurnIndices.length - 1) {
      setCurrentTurnIndex(prev => prev + 1);
      setUserRhythmPattern([]);
      setCurrentSimilarity(0);
      setPhase('practicing');
    } else {
      setPhase('complete');
      onComplete(turnResults);
    }
  }, [currentTurnIndex, userTurnIndices.length, turnResults, onComplete]);

  // Reintentar turno
  const handleRetry = useCallback(() => {
    setTurnResults(prev => prev.slice(0, -1));
    setUserRhythmPattern([]);
    setCurrentSimilarity(0);
    setPhase('practicing');
  }, []);

  const currentUserTurn = getCurrentUserTurn();
  const currentNativePattern = getNativePattern(currentTurnIndex);
  const currentTurnWords = currentUserTurn?.text.split(/\s+/) || [];
  const totalUserTurns = userTurnIndices.length;

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {/* Audios ocultos */}
      {exercise.dialogue.map((turn, i) => (
        <audio
          key={i}
          ref={el => { audioRefs.current[i] = el; }}
          src={turn.audioUrl}
          preload="auto"
        />
      ))}

      <AnimatePresence mode="wait">
        {/* Fase Preview */}
        {phase === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎧 Escucha el diálogo completo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Después practicarás tus líneas
              </p>
            </div>

            {/* Lista del diálogo */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
              {exercise.dialogue.map((turn, i) => {
                const isUserTurn = turn.speaker === 'user';
                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${isUserTurn ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                      ${isUserTurn
                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                        : 'bg-indigo-100 dark:bg-indigo-900/50'
                      }
                    `}>
                      {isUserTurn ? '👤' : '🎭'}
                    </div>
                    <div className={`
                      flex-1 p-3 rounded-lg
                      ${isUserTurn
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-right'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                      }
                    `}>
                      <p className="text-gray-900 dark:text-white text-sm">
                        {turn.text}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {turn.translation}
                      </p>
                      {isUserTurn && (
                        <span className="inline-block mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          🎤 Tu turno
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicador de reproducción */}
            {isPlaying && (
              <div className="text-center text-sm text-indigo-600 dark:text-indigo-400">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  Reproduciendo...
                </span>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={playFullDialogue}
                disabled={isPlaying}
                className={`
                  flex-1 px-4 py-3 rounded-aaa-xl font-medium transition-colors
                  ${isPlaying
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {isPlaying ? '🔊 Reproduciendo...' : '▶️ Escuchar de nuevo'}
              </button>
              <button
                onClick={handleStartPractice}
                disabled={isPlaying}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors disabled:opacity-50"
              >
                Practicar →
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase Practicing */}
        {phase === 'practicing' && currentUserTurn && (
          <motion.div
            key="practicing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progreso */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Turno {currentTurnIndex + 1} de {totalUserTurns}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalUserTurns }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < turnResults.length
                        ? 'bg-emerald-500'
                        : i === turnResults.length
                        ? 'bg-indigo-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contexto */}
            {currentTurnIndex > 0 && (
              <button
                onClick={playContext}
                disabled={isPlaying}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                🔊 Reproducir contexto anterior
              </button>
            )}

            {/* Tu turno */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border-2 border-indigo-200 dark:border-indigo-800">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                  🎤 Tu turno
                </span>
              </div>

              <p className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
                {currentUserTurn.text}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                {currentUserTurn.translation}
              </p>

              {/* Ritmo sugerido */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                  Ritmo sugerido:
                </p>
                <RhythmVisualizer
                  nativePattern={currentNativePattern}
                  words={currentTurnWords}
                  showComparison={false}
                />
              </div>

              {/* Botón escuchar ejemplo */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={playCurrentTurnExample}
                  disabled={isPlaying}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isPlaying
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {isPlaying ? '🔊 Reproduciendo...' : '🔊 Escuchar ejemplo'}
                </button>
              </div>

              {/* Grabador */}
              <div className="flex justify-center">
                <SpeechRecorder
                  onRecordingComplete={handleRecordingComplete}
                  config={{ maxDuration: Math.ceil(currentUserTurn.duration * 1.5) }}
                  showWaveform
                  label="Mantén para grabar"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Fase Comparing */}
        {phase === 'comparing' && currentUserTurn && (
          <motion.div
            key="comparing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <span className="text-4xl">
                {currentSimilarity >= 80 ? '🎉' : currentSimilarity >= 70 ? '👍' : '💪'}
              </span>
            </div>

            {/* Comparación de ritmo */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Comparación de ritmo
              </h4>
              <RhythmVisualizer
                nativePattern={currentNativePattern}
                userPattern={userRhythmPattern}
                words={currentTurnWords}
                showComparison
                similarity={currentSimilarity}
              />
            </div>

            {/* Feedback */}
            <RhythmFeedback
              similarity={currentSimilarity}
              nativePattern={currentNativePattern}
              userPattern={userRhythmPattern}
              words={currentTurnWords}
            />

            {/* XP */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 font-medium">
                +{turnResults[turnResults.length - 1]?.xpEarned || 0} XP
              </span>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              {currentSimilarity < 70 && (
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-aaa-xl font-medium transition-colors"
                >
                  🔁 Repetir
                </button>
              )}
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors"
              >
                {currentTurnIndex + 1 < totalUserTurns
                  ? 'Siguiente turno →'
                  : 'Completar →'
                }
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Diálogo completado!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Practicaste {turnResults.length} turnos de conversación
            </p>

            {/* Resumen */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-aaa-xl p-4 inline-block">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {turnResults.length > 0
                      ? Math.round(
                          turnResults.reduce((sum, r) => sum + r.rhythmAnalysis.overallSimilarity, 0) /
                          turnResults.length
                        )
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Similitud promedio
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    +{turnResults.reduce((sum, r) => sum + r.xpEarned, 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    XP ganado
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de saltar */}
      {onSkip && phase !== 'complete' && phase !== 'comparing' && (
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

export default DialogueIntonationExercise;
