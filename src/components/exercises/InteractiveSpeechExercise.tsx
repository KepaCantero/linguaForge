'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InteractiveSpeech } from '@/schemas/content';
import type { InteractiveSpeechResult, SpeechTurnResult, SpeechRecordingResult } from '@/types';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';
import { useGamificationStore } from '@/store/useGamificationStore';

// ============================================
// TIPOS
// ============================================

interface InteractiveSpeechExerciseProps {
  exercise: InteractiveSpeech;
  onComplete: (result: InteractiveSpeechResult) => void;
  onSkip?: () => void;
  className?: string;
}

type Phase = 'system_speak' | 'waiting_response' | 'recording' | 'feedback' | 'complete';

// ============================================
// CONSTANTES
// ============================================

const XP_VALUES = {
  fastResponse: 20, // < 2s
  normalResponse: 15, // < 4s
  slowResponse: 10, // >= 4s
  completion: 25, // Bonus por completar
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function InteractiveSpeechExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: InteractiveSpeechExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<Phase>('system_speak');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [turnResults, setTurnResults] = useState<SpeechTurnResult[]>([]);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exampleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = exercise.conversationFlow[currentStepIndex];
  const silenceConfig = useMemo(() => exercise.silenceHandling || {
    hintAfter: 3,
    exampleAfter: 6,
    autoPromptAfter: 10,
  }, [exercise.silenceHandling]);

  // Reproducir audio del sistema cuando cambia el paso
  useEffect(() => {
    if (currentStep?.type === 'system_speak') {
      const audio = audioRefs.current[currentStepIndex];
      if (audio) {
        setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          // Pasar a esperar respuesta
          setPhase('waiting_response');
          setResponseStartTime(Date.now());
        };
        audio.currentTime = 0;
        audio.play().catch(() => {
          setIsPlaying(false);
          setPhase('waiting_response');
          setResponseStartTime(Date.now());
        });
      } else {
        // Si no hay audio, pasar directamente
        setPhase('waiting_response');
        setResponseStartTime(Date.now());
      }
    }
  }, [currentStep, currentStepIndex]);

  // Cancelar todos los timers - definido primero para evitar dependencias circulares
  const cancelTimers = useCallback(() => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    if (exampleTimeoutRef.current) clearTimeout(exampleTimeoutRef.current);
    setSilenceTimer(null);
  }, []);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      cancelTimers();
    };
  }, [cancelTimers]);

  // Iniciar espera de respuesta
  const startWaitingForResponse = useCallback(() => {
    setPhase('waiting_response');
    setResponseStartTime(Date.now());
    setShowHint(false);
    setShowExample(false);

    // Limpiar timeouts anteriores
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    if (exampleTimeoutRef.current) clearTimeout(exampleTimeoutRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    // Timer para countdown
    let countdown = silenceConfig.autoPromptAfter;
    setSilenceTimer(countdown);

    const tick = () => {
      countdown--;
      setSilenceTimer(countdown);

      if (countdown <= 0) {
        // Auto-skip después del timeout - inlined to avoid circular dependency
        cancelTimers();
        if (currentStepIndex < exercise.conversationFlow.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          const nextStep = exercise.conversationFlow[nextIndex];
          if (nextStep.type === 'system_speak') {
            setPhase('system_speak');
          } else {
            setPhase('waiting_response');
            setResponseStartTime(Date.now());
          }
        } else {
          setPhase('complete');
          cancelTimers();
          setTimeout(() => {
            onComplete({
              completedTurns: turnResults.length,
              totalTurns: exercise.conversationFlow.filter(
                s => s.type === 'user_response' || s.type === 'closing'
              ).length,
              averageResponseTime: 0,
              overallFluency: 0,
              xpEarned: XP_VALUES.completion,
            });
          }, 2000);
        }
      } else {
        silenceTimeoutRef.current = setTimeout(tick, 1000);
      }
    };
    silenceTimeoutRef.current = setTimeout(tick, 1000);

    // Timer para mostrar hint
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(true);
    }, silenceConfig.hintAfter * 1000);

    // Timer para mostrar ejemplo
    exampleTimeoutRef.current = setTimeout(() => {
      setShowExample(true);
    }, silenceConfig.exampleAfter * 1000);
  }, [silenceConfig, currentStepIndex, exercise.conversationFlow, turnResults, cancelTimers, onComplete]);

  // Completar ejercicio - definido antes de advanceToNextStep para evitar dependencias circulares
  const completeExercise = useCallback(() => {
    setPhase('complete');
    cancelTimers();

    const userTurns = turnResults.length;
    const totalUserTurns = exercise.conversationFlow.filter(
      s => s.type === 'user_response' || s.type === 'closing'
    ).length;

    const avgResponseTime = userTurns > 0
      ? turnResults.reduce((sum, r) => sum + r.responseTime, 0) / userTurns
      : 0;

    const overallFluency = userTurns > 0
      ? Math.round(turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / userTurns)
      : 0;

    const totalXP = turnResults.reduce((sum, r) => {
      if (r.responseTime < 2000) return sum + XP_VALUES.fastResponse;
      if (r.responseTime < 4000) return sum + XP_VALUES.normalResponse;
      return sum + XP_VALUES.slowResponse;
    }, 0) + XP_VALUES.completion;

    addXP(XP_VALUES.completion);
    if (overallFluency >= 80) {
      addGems(5);
    }

    const result: InteractiveSpeechResult = {
      completedTurns: userTurns,
      totalTurns: totalUserTurns,
      averageResponseTime: avgResponseTime,
      overallFluency,
      xpEarned: totalXP,
    };

    setTimeout(() => {
      onComplete(result);
    }, 2000);
  }, [turnResults, exercise.conversationFlow, cancelTimers, addXP, addGems, onComplete]);

  // Avanzar al siguiente paso
  const advanceToNextStep = useCallback(() => {
    if (currentStepIndex < exercise.conversationFlow.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStep = exercise.conversationFlow[nextIndex];

      setCurrentStepIndex(nextIndex);

      if (nextStep.type === 'system_speak') {
        setPhase('system_speak');
      } else if (nextStep.type === 'closing') {
        setPhase('waiting_response');
        startWaitingForResponse();
      } else {
        setPhase('waiting_response');
        startWaitingForResponse();
      }
    } else {
      // Conversación completada
      completeExercise();
    }
  }, [currentStepIndex, exercise.conversationFlow, startWaitingForResponse, completeExercise]);

  // Manejar inicio de grabación
  const handleRecordingStart = useCallback(() => {
    cancelTimers();
    setPhase('recording');
  }, [cancelTimers]);

  // Manejar grabación completada
  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const responseTime = Date.now() - responseStartTime;
    const transcript = recording.transcript?.toLowerCase() || '';

    // Evaluar respuesta
    let isValid = false;
    const expectedResponses = currentStep?.expectedResponses || currentStep?.closingPhrases || [];

    for (const expected of expectedResponses) {
      const expectedWords = expected.toLowerCase().split(/\s+/);
      const matchCount = expectedWords.filter(w => transcript.includes(w)).length;
      if (matchCount >= expectedWords.length * 0.5) {
        isValid = true;
        break;
      }
    }

    // Calcular fluency score basado en tiempo de respuesta
    let fluencyScore: number;
    let xpEarned: number;

    if (responseTime < 2000) {
      fluencyScore = 100;
      xpEarned = XP_VALUES.fastResponse;
    } else if (responseTime < 4000) {
      fluencyScore = 80;
      xpEarned = XP_VALUES.normalResponse;
    } else {
      fluencyScore = 60;
      xpEarned = XP_VALUES.slowResponse;
    }

    const turnResult: SpeechTurnResult = {
      turnIndex: currentStepIndex,
      responseTime,
      detectedText: transcript,
      isValidResponse: isValid,
      fluencyScore,
    };

    setTurnResults(prev => [...prev, turnResult]);
    addXP(xpEarned);

    // Avanzar al siguiente paso
    advanceToNextStep();
  }, [currentStep, currentStepIndex, responseStartTime, addXP, advanceToNextStep]);

  // Saltar turno
  const handleSkipTurn = useCallback(() => {
    cancelTimers();
    advanceToNextStep();
  }, [cancelTimers, advanceToNextStep]);

  // Reproducir audio de nuevo
  const handleReplay = useCallback(() => {
    const audio = audioRefs.current[currentStepIndex];
    if (audio && !isPlaying) {
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.currentTime = 0;
      audio.play();
    }
  }, [currentStepIndex, isPlaying]);

  // Obtener respuestas esperadas para el paso actual
  const getExpectedResponses = (): string[] => {
    if (currentStep?.type === 'closing' && currentStep.closingPhrases) {
      return currentStep.closingPhrases;
    }
    return currentStep?.expectedResponses || [];
  };

  const totalSteps = exercise.conversationFlow.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {/* Audios ocultos */}
      {exercise.conversationFlow.map((step, i) => (
        <audio
          key={i}
          ref={el => { audioRefs.current[i] = el; }}
          src={step.audioUrl}
          preload="auto"
        />
      ))}

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Paso {currentStepIndex + 1} de {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Sistema hablando */}
        {phase === 'system_speak' && currentStep && (
          <motion.div
            key={`system-${currentStepIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl flex-shrink-0">
                  👤
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentStep.text}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentStep.translation}
                  </p>
                </div>
              </div>

              {isPlaying && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  Reproduciendo...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Esperando respuesta */}
        {(phase === 'waiting_response' || phase === 'recording') && currentStep && (
          <motion.div
            key={`response-${currentStepIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Mostrar lo que dijo el sistema (si es después de system_speak) */}
            {currentStepIndex > 0 && exercise.conversationFlow[currentStepIndex - 1]?.type === 'system_speak' && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  👤 {exercise.conversationFlow[currentStepIndex - 1].text}
                </span>
              </div>
            )}

            {/* Zona de respuesta */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border-2 border-emerald-200 dark:border-emerald-800">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  🎤 {currentStep.type === 'closing' ? 'Cierra la conversación' : 'Tu respuesta'}
                </span>
              </div>

              {/* Timer de silencio */}
              {silenceTimer !== null && silenceTimer > 0 && phase === 'waiting_response' && (
                <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4">
                  ⏱️ {silenceTimer}s para responder...
                </p>
              )}

              {/* Hints progresivos */}
              {showHint && !showExample && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    💡 ¿Necesitas ayuda? Puedes decir:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                    {getExpectedResponses().slice(0, 2).map((resp, i) => (
                      <li key={i}>• {resp}</li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Ejemplo con audio */}
              {showExample && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                >
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    🔊 Ejemplo de respuesta:
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    &quot;{getExpectedResponses()[0]}&quot;
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    O si no entendiste: &quot;Pardon, pouvez-vous répéter ?&quot;
                  </p>
                </motion.div>
              )}

              {/* Grabador */}
              <div className="flex justify-center">
                <SpeechRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingStart={handleRecordingStart}
                  config={{ maxDuration: 5 }}
                  showWaveform
                  label="Mantén para hablar"
                />
              </div>

              {/* Botones auxiliares */}
              <div className="mt-4 flex items-center justify-center gap-3">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handleReplay}
                    disabled={isPlaying}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    🔁 Escuchar de nuevo
                  </button>
                )}
                <button
                  onClick={handleSkipTurn}
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Saltar turno
                </button>
              </div>
            </div>
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
              ¡Conversación completada!
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-aaa-xl p-4 mt-6 inline-block">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {turnResults.length}/{exercise.conversationFlow.filter(s =>
                      s.type === 'user_response' || s.type === 'closing'
                    ).length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Turnos completados
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {turnResults.length > 0
                      ? (turnResults.reduce((sum, r) => sum + r.responseTime, 0) / turnResults.length / 1000).toFixed(1)
                      : 0}s
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tiempo promedio
                  </p>
                </div>
              </div>

              {/* Fluidez */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fluidez:</span>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${turnResults.length > 0
                          ? Math.round(turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / turnResults.length)
                          : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {turnResults.length > 0
                      ? Math.round(turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / turnResults.length)
                      : 0}%
                  </span>
                </div>
              </div>
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

export default InteractiveSpeechExercise;
