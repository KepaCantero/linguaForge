'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationalEcho } from '@/schemas/content';
import type { EchoEvaluationResult, SpeechRecordingResult } from '@/types';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';
import { useGamificationStore } from '@/store/useGamificationStore';

// ============================================
// TIPOS
// ============================================

interface ConversationalEchoExerciseProps {
  exercise: ConversationalEcho;
  onComplete: (result: EchoEvaluationResult) => void;
  onSkip?: () => void;
  showHints?: boolean;
  className?: string;
}

type ExercisePhase = 'listening' | 'responding' | 'recording' | 'feedback';

// ============================================
// CONSTANTES
// ============================================

const XP_VALUES = {
  perfect: 20,
  acceptable: 15,
  poor: 5,
  out_of_context: 0,
  timeout: 0,
};

const FEEDBACK_MESSAGES = {
  perfect: '¡Respuesta perfecta!',
  acceptable: '¡Buena respuesta!',
  poor: 'Respuesta muy corta',
  out_of_context: 'Fuera de contexto',
  timeout: 'Sin respuesta detectada',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ConversationalEchoExercise({
  exercise,
  onComplete,
  onSkip,
  showHints = true,
  className = '',
}: ConversationalEchoExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<ExercisePhase>('listening');
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EchoEvaluationResult | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const config = exercise.config || {
    maxRecordingTime: 5,
    silenceTimeout: 3,
    showHint: true,
  };

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Manejar timeout
  const handleTimeout = useCallback(() => {
    const result: EchoEvaluationResult = {
      isValid: false,
      matchedResponse: null,
      scores: { intention: 0, keywords: 0, rhythm: 0 },
      feedback: {
        type: 'timeout',
        message: FEEDBACK_MESSAGES.timeout,
        tip: 'Intenta responder más rápido. Puedes decir algo simple como "Merci".',
      },
      xpEarned: XP_VALUES.timeout,
    };

    setEvaluationResult(result);
    setPhase('feedback');
  }, []);

  // Reproducir audio del sistema
  const playSystemAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // Manejar progreso del audio
  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  }, []);

  // Manejar fin del audio
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setAudioProgress(100);
    setPhase('responding');

    // Iniciar timer de silencio
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    let countdown = config.silenceTimeout;
    setSilenceTimer(countdown);

    const tick = () => {
      countdown--;
      setSilenceTimer(countdown);

      if (countdown <= 0) {
        handleTimeout();
      } else {
        silenceTimeoutRef.current = setTimeout(tick, 1000);
      }
    };

    silenceTimeoutRef.current = setTimeout(tick, 1000);
  }, [config.silenceTimeout, handleTimeout]);

  // Iniciar grabación
  const handleRecordingStart = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setSilenceTimer(null);
    setPhase('recording');
  }, []);

  // Evaluar respuesta
  const evaluateResponse = useCallback((recording: SpeechRecordingResult): EchoEvaluationResult => {
    const transcript = recording.transcript?.toLowerCase() || '';

    // Buscar coincidencia con respuestas esperadas
    let bestMatch: { text: string; score: number; isOptimal: boolean } | null = null;

    for (const expected of exercise.expectedResponses) {
      let keywordScore = 0;
      const keywordsFound = expected.keywords.filter(kw =>
        transcript.includes(kw.toLowerCase())
      );
      keywordScore = (keywordsFound.length / Math.max(expected.keywords.length, 1)) * 100;

      // También verificar similitud general
      const expectedWords = expected.text.toLowerCase().split(/\s+/);
      const transcriptWords = transcript.split(/\s+/);
      const matchingWords = expectedWords.filter(w => transcriptWords.includes(w));
      const intentionScore = (matchingWords.length / Math.max(expectedWords.length, 1)) * 100;

      const totalScore = keywordScore * 0.6 + intentionScore * 0.4;

      if (!bestMatch || totalScore > bestMatch.score) {
        bestMatch = { text: expected.text, score: totalScore, isOptimal: expected.isOptimal };
      }
    }

    // Calcular puntuación de ritmo basada en duración
    const expectedDuration = exercise.systemPhrase.duration * 0.5;
    const actualDuration = recording.duration / 1000;
    const rhythmScore = Math.max(0, 100 - Math.abs(expectedDuration - actualDuration) * 20);

    // Determinar tipo de feedback
    let feedbackType: EchoEvaluationResult['feedback']['type'];
    let tip: string | undefined;
    let xpEarned: number;

    if (bestMatch && bestMatch.score >= 70) {
      feedbackType = bestMatch.isOptimal ? 'perfect' : 'acceptable';
      xpEarned = bestMatch.isOptimal ? XP_VALUES.perfect : XP_VALUES.acceptable;
    } else if (bestMatch && bestMatch.score >= 40) {
      feedbackType = 'acceptable';
      tip = `Buena idea. También podrías decir: "${exercise.expectedResponses[0].text}"`;
      xpEarned = XP_VALUES.acceptable;
    } else if (transcript.length < 5) {
      feedbackType = 'poor';
      tip = `Intenta una respuesta más completa como: "${exercise.expectedResponses[0].text}"`;
      xpEarned = XP_VALUES.poor;
    } else {
      feedbackType = 'out_of_context';
      tip = `En esta situación, sería mejor responder: "${exercise.expectedResponses[0].text}"`;
      xpEarned = XP_VALUES.out_of_context;
    }

    return {
      isValid: feedbackType === 'perfect' || feedbackType === 'acceptable',
      matchedResponse: bestMatch?.text || null,
      scores: {
        intention: bestMatch?.score || 0,
        keywords: bestMatch ? bestMatch.score * 0.6 : 0,
        rhythm: rhythmScore,
      },
      feedback: {
        type: feedbackType,
        message: FEEDBACK_MESSAGES[feedbackType],
        ...(tip !== undefined && { tip }),
      },
      xpEarned,
    };
  }, [exercise]);

  // Manejar grabación completada
  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const result = evaluateResponse(recording);
    setEvaluationResult(result);
    setPhase('feedback');

    // Añadir XP
    if (result.xpEarned > 0) {
      addXP(result.xpEarned);
      if (result.feedback.type === 'perfect') {
        addGems(2);
      }
    }
  }, [evaluateResponse, addXP, addGems]);

  // Continuar al siguiente ejercicio
  const handleContinue = useCallback(() => {
    if (evaluationResult) {
      onComplete(evaluationResult);
    }
  }, [evaluationResult, onComplete]);

  // Reintentar
  const handleRetry = useCallback(() => {
    setPhase('listening');
    setAudioProgress(0);
    setEvaluationResult(null);
    setSilenceTimer(null);
    setShowHint(false);
  }, []);

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      host: 'Anfitrión',
      guest: 'Invitado',
      waiter: 'Camarero',
      customer: 'Cliente',
      other: 'Otro',
    };
    return labels[role] || role;
  };

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {/* Header con contexto */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-sm text-indigo-700 dark:text-indigo-300">
            📍 {exercise.context.scene}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            exercise.context.formality === 'formal'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          }`}>
            {exercise.context.formality === 'formal' ? 'Formal' : 'Informal'}
          </span>
        </div>
      </div>

      {/* Audio oculto */}
      <audio
        ref={audioRef}
        src={exercise.systemPhrase.audioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      <AnimatePresence mode="wait">
        {/* Fase de escucha */}
        {(phase === 'listening' || phase === 'responding') && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Caja del sistema */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {getRoleLabel(exercise.context.role)}
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                    {exercise.systemPhrase.text}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {exercise.systemPhrase.translation}
                  </p>
                </div>
              </div>

              {/* Barra de progreso del audio */}
              <div className="flex items-center gap-3">
                <button
                  onClick={playSystemAudio}
                  disabled={isPlaying}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0
                    ${isPlaying
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {isPlaying ? '🔊' : '▶️'}
                </button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    animate={{ width: `${audioProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                  {exercise.systemPhrase.duration.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Zona de respuesta */}
            {phase === 'responding' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    💬 ¿Cómo responderías?
                  </p>

                  {silenceTimer !== null && silenceTimer > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⏱️ {silenceTimer}s para responder...
                    </p>
                  )}
                </div>

                {/* Hints */}
                {showHints && config.showHint && (
                  <div className="space-y-2">
                    {!showHint ? (
                      <button
                        onClick={() => setShowHint(true)}
                        className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        💡 Mostrar pistas
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                      >
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Respuestas posibles:
                        </p>
                        <ul className="space-y-1">
                          {exercise.expectedResponses.map((resp, i) => (
                            <li
                              key={i}
                              className={`text-sm ${
                                resp.isOptimal
                                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              • {resp.text}
                              {resp.isOptimal && <span className="ml-1">⭐</span>}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Grabador */}
                <div className="flex justify-center pt-4">
                  <SpeechRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onRecordingStart={handleRecordingStart}
                    config={{ maxDuration: config.maxRecordingTime }}
                    showWaveform
                  />
                </div>
              </motion.div>
            )}

            {/* Botón de escuchar (fase inicial) */}
            {phase === 'listening' && !isPlaying && audioProgress === 0 && (
              <div className="text-center">
                <button
                  onClick={playSystemAudio}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                >
                  🔊 Escuchar
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Fase de grabación */}
        {phase === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
              <motion.div
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-3xl text-white">🎤</span>
              </motion.div>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Grabando...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Suelta para enviar
            </p>
          </motion.div>
        )}

        {/* Fase de feedback */}
        {phase === 'feedback' && evaluationResult && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`rounded-xl p-6 ${
              evaluationResult.isValid
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl">
                  {evaluationResult.feedback.type === 'perfect' ? '✅' :
                   evaluationResult.feedback.type === 'acceptable' ? '👍' :
                   evaluationResult.feedback.type === 'poor' ? '💡' :
                   evaluationResult.feedback.type === 'out_of_context' ? '❓' : '⏱️'}
                </span>
                <div className="flex-1">
                  <p className={`font-medium text-lg ${
                    evaluationResult.isValid
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-amber-800 dark:text-amber-200'
                  }`}>
                    {evaluationResult.feedback.message}
                  </p>

                  {evaluationResult.matchedResponse && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Detectamos: &quot;{evaluationResult.matchedResponse}&quot;
                    </p>
                  )}

                  {evaluationResult.feedback.tip && (
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      💡 {evaluationResult.feedback.tip}
                    </p>
                  )}
                </div>
              </div>

              {/* Scores */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">INTENCIÓN</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${evaluationResult.scores.intention}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round(evaluationResult.scores.intention)}%
                    </span>
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">RITMO</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${evaluationResult.scores.rhythm}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round(evaluationResult.scores.rhythm)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* XP */}
              {evaluationResult.xpEarned > 0 && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 font-medium">
                    +{evaluationResult.xpEarned} XP
                  </span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              {!evaluationResult.isValid && (
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  🔁 Reintentar
                </button>
              )}
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
              >
                Continuar →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de saltar */}
      {onSkip && phase !== 'feedback' && (
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

export default ConversationalEchoExercise;
