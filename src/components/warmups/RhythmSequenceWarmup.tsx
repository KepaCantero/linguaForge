'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RhythmSequenceConfig, TouchAction } from '@/schemas/warmup';

interface RhythmSequenceWarmupProps {
  config: RhythmSequenceConfig;
  onComplete: (score: number) => void;
  onSkip: () => void;
}

interface PatternStep {
  action: TouchAction;
  timing: number; // ms desde inicio
  duration: number; // duración del paso
}

/**
 * RhythmSequenceWarmup Component
 *
 * Calentamiento de secuencia rítmica que activa los ganglios basales.
 * El usuario debe seguir patrones de tap/hold/swipe al ritmo indicado.
 */
export function RhythmSequenceWarmup({
  config,
  onComplete,
  onSkip,
}: RhythmSequenceWarmupProps) {
  const [currentSequence, setCurrentSequence] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [userActions, setUserActions] = useState<{ action: TouchAction; time: number }[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = useRef<number>(0);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sequence = config.sequences[currentSequence];
  const totalSequences = config.sequences.length;

  // Calcular pasos del patrón con tiempos
  const patternSteps: PatternStep[] = sequence
    ? sequence.pattern.map((action, i) => ({
        action,
        timing: (i * sequence.duration) / sequence.pattern.length,
        duration: sequence.duration / sequence.pattern.length,
      }))
    : [];

  // Countdown inicial
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      startSequence();
    }
  }, [countdown, showCountdown]);

  // Iniciar secuencia
  const startSequence = useCallback(() => {
    setIsPlaying(true);
    setCurrentStep(0);
    setUserActions([]);
    startTimeRef.current = Date.now();

    // Avanzar pasos automáticamente para la guía visual
    let stepIndex = 0;
    const advanceStep = () => {
      if (stepIndex < patternSteps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        sequenceTimeoutRef.current = setTimeout(
          advanceStep,
          patternSteps[0]?.duration || 500
        );
      } else {
        // Secuencia completada
        evaluateSequence();
      }
    };

    advanceStep();
  }, [patternSteps]);

  // Evaluar la secuencia del usuario
  const evaluateSequence = useCallback(() => {
    setIsPlaying(false);

    // Calcular puntuación basada en precisión
    let sequenceScore = 0;
    const tolerance = 200; // ms de tolerancia

    patternSteps.forEach((step, i) => {
      const userAction = userActions[i];
      if (userAction) {
        const timeDiff = Math.abs(userAction.time - step.timing);
        const actionCorrect = userAction.action === step.action;

        if (actionCorrect && timeDiff < tolerance) {
          sequenceScore += 100 / patternSteps.length;
        } else if (actionCorrect) {
          sequenceScore += (50 / patternSteps.length) * (1 - timeDiff / 1000);
        }
      }
    });

    sequenceScore = Math.max(0, Math.min(100, sequenceScore));
    setScore((prev) => prev + sequenceScore);
    setFeedback(sequenceScore > 50 ? 'correct' : 'incorrect');

    // Avanzar a siguiente secuencia o completar
    setTimeout(() => {
      setFeedback(null);
      if (currentSequence < totalSequences - 1) {
        setCurrentSequence(currentSequence + 1);
        setShowCountdown(true);
        setCountdown(2);
      } else {
        // Completar warmup
        const finalScore = (score + sequenceScore) / totalSequences;
        onComplete(Math.round(finalScore));
      }
    }, 1000);
  }, [userActions, patternSteps, currentSequence, totalSequences, score, onComplete]);

  // Manejar acción del usuario
  const handleAction = useCallback(
    (action: TouchAction) => {
      if (!isPlaying) return;

      const actionTime = Date.now() - startTimeRef.current;
      setUserActions((prev) => [...prev, { action, time: actionTime }]);

      // Feedback visual inmediato
      const expectedStep = patternSteps[userActions.length];
      if (expectedStep && expectedStep.action === action) {
        // Vibración de éxito (si disponible)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    },
    [isPlaying, patternSteps, userActions.length]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, []);

  // Obtener color del paso
  const getActionColor = (action: TouchAction) => {
    switch (action) {
      case 'tap':
        return 'bg-blue-500';
      case 'hold':
        return 'bg-purple-500';
      case 'swipe':
        return 'bg-amber-500';
    }
  };

  // Obtener icono del paso
  const getActionIcon = (action: TouchAction) => {
    switch (action) {
      case 'tap':
        return '👆';
      case 'hold':
        return '✊';
      case 'swipe':
        return '👉';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Secuencia Rítmica</h2>
          <p className="text-sm text-gray-400">
            Secuencia {currentSequence + 1} de {totalSequences}
          </p>
        </div>
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Saltar
        </button>
      </div>

      {/* Countdown */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-8xl font-bold text-white"
          >
            {countdown > 0 ? countdown : 'GO!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patrón visual */}
      {!showCountdown && (
        <div className="flex flex-col items-center gap-8">
          {/* Indicador de patrón */}
          <div className="flex gap-3">
            {patternSteps.map((step, i) => (
              <motion.div
                key={i}
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
                  i === currentStep && isPlaying
                    ? `${getActionColor(step.action)} scale-110 ring-4 ring-white/50`
                    : i < currentStep || !isPlaying
                    ? 'bg-gray-700'
                    : 'bg-gray-800'
                }`}
                animate={
                  i === currentStep && isPlaying
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                {getActionIcon(step.action)}
              </motion.div>
            ))}
          </div>

          {/* Área de interacción */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAction('tap')}
              className="w-24 h-24 bg-blue-600 hover:bg-blue-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"
            >
              <span className="text-3xl">👆</span>
              <span className="text-xs mt-1">TAP</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={() => handleAction('hold')}
              className="w-24 h-24 bg-purple-600 hover:bg-purple-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"
            >
              <span className="text-3xl">✊</span>
              <span className="text-xs mt-1">HOLD</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAction('swipe')}
              className="w-24 h-24 bg-amber-600 hover:bg-amber-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"
            >
              <span className="text-3xl">👉</span>
              <span className="text-xs mt-1">SWIPE</span>
            </motion.button>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-2xl font-bold ${
                  feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {feedback === 'correct' ? '¡Bien!' : 'Intenta de nuevo'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Barra de progreso */}
      <div className="absolute bottom-8 left-4 right-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentSequence + (isPlaying ? 0.5 : 0)) / totalSequences) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default RhythmSequenceWarmup;
