'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWarmupStore } from '@/store/useWarmupStore';
import { getWarmupForMissionType } from '@/services/warmupSelector';
import { RhythmSequenceWarmup } from './RhythmSequenceWarmup';
import { VisualMatchWarmup } from './VisualMatchWarmup';
import type { Warmup, MissionType, Difficulty } from '@/schemas/warmup';

interface WarmupGateProps {
  missionId?: string;
  lessonId?: string;
  missionType: MissionType;
  missionTitle: string;
  difficulty?: Difficulty;
  userLevel?: number;
  onWarmupComplete: (score: number) => void;
  onWarmupSkip: () => void;
  onStartMission: () => void;
  /** Texto del botón final (por defecto "Comenzar Misión") */
  startButtonText?: string;
}

type WarmupPhase = 'intro' | 'warmup' | 'transition' | 'ready';

/**
 * WarmupGate Component
 *
 * Portal que muestra el calentamiento antes de iniciar una misión.
 * Gestiona el flujo completo:
 * 1. Intro - Explicación del calentamiento
 * 2. Warmup - Ejercicio de calentamiento
 * 3. Transition - Animación de transición
 * 4. Ready - Listo para comenzar misión
 */
export function WarmupGate({
  missionId,
  lessonId,
  missionType,
  missionTitle,
  difficulty = 'medium',
  userLevel = 1,
  onWarmupComplete,
  onWarmupSkip,
  onStartMission,
  startButtonText = 'Comenzar Misión',
}: WarmupGateProps) {
  const [phase, setPhase] = useState<WarmupPhase>('intro');
  const [warmupScore, setWarmupScore] = useState(0);
  const { startWarmup, completeWarmup, skipWarmup, shouldShowWarmup } = useWarmupStore();

  // ID único para el warmup (puede ser misión o lección)
  const contextId = missionId || lessonId || 'unknown';

  // Obtener warmup apropiado
  const warmup = useMemo(
    () => getWarmupForMissionType(missionType, difficulty, userLevel),
    [missionType, difficulty, userLevel]
  );

  // Verificar si debe mostrar warmup
  const showWarmup = shouldShowWarmup(contextId);

  // Manejar inicio de warmup
  const handleStartWarmup = useCallback(() => {
    startWarmup(warmup, contextId);
    setPhase('warmup');
  }, [warmup, contextId, startWarmup]);

  // Manejar completar warmup
  const handleWarmupComplete = useCallback(
    (score: number) => {
      setWarmupScore(score);
      completeWarmup(score);
      onWarmupComplete(score);
      setPhase('transition');

      // Después de la transición, mostrar pantalla de listo
      setTimeout(() => {
        setPhase('ready');
      }, 2000);
    },
    [completeWarmup, onWarmupComplete]
  );

  // Manejar saltar warmup
  const handleSkipWarmup = useCallback(() => {
    skipWarmup();
    onWarmupSkip();
    setPhase('ready');
  }, [skipWarmup, onWarmupSkip]);

  // Si no debe mostrar warmup, ir directo a ready
  if (!showWarmup) {
    return (
      <ReadyScreen
        missionTitle={missionTitle}
        warmupScore={null}
        onStart={onStartMission}
        startButtonText={startButtonText}
      />
    );
  }

  // Renderizar fase actual
  return (
    <AnimatePresence mode="wait">
      {phase === 'intro' && (
        <IntroScreen
          key="intro"
          warmup={warmup}
          missionTitle={missionTitle}
          onStart={handleStartWarmup}
          onSkip={handleSkipWarmup}
        />
      )}

      {phase === 'warmup' && (
        <WarmupRunner
          key="warmup"
          warmup={warmup}
          onComplete={handleWarmupComplete}
          onSkip={handleSkipWarmup}
        />
      )}

      {phase === 'transition' && (
        <TransitionScreen key="transition" score={warmupScore} />
      )}

      {phase === 'ready' && (
        <ReadyScreen
          key="ready"
          missionTitle={missionTitle}
          warmupScore={warmupScore}
          onStart={onStartMission}
          startButtonText={startButtonText}
        />
      )}
    </AnimatePresence>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

interface IntroScreenProps {
  warmup: Warmup;
  missionTitle: string;
  onStart: () => void;
  onSkip: () => void;
}

function IntroScreen({ warmup, missionTitle, onStart, onSkip }: IntroScreenProps) {
  const getWarmupIcon = () => {
    switch (warmup.type) {
      case 'rhythmSequence':
        return '🎵';
      case 'visualMatch':
        return '👁️';
      case 'voiceImitation':
        return '🗣️';
    }
  };

  const getWarmupBenefit = () => {
    switch (warmup.type) {
      case 'rhythmSequence':
        return 'Activa los ganglios basales para mejor procesamiento gramatical';
      case 'visualMatch':
        return 'Activa el lóbulo temporal para mejor retención de vocabulario';
      case 'voiceImitation':
        return 'Activa el cerebelo para mejor pronunciación';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-md"
      >
        {/* Icono */}
        <motion.div
          className="text-7xl mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {getWarmupIcon()}
        </motion.div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-white mb-2">{warmup.title}</h2>
        <p className="text-gray-400 mb-6">{warmup.description}</p>

        {/* Beneficio */}
        <div className="p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl mb-8">
          <p className="text-sm text-indigo-300">🧠 {getWarmupBenefit()}</p>
        </div>

        {/* Info de misión */}
        <p className="text-sm text-gray-500 mb-6">
          Preparándote para: <span className="text-white">{missionTitle}</span>
        </p>

        {/* Duración */}
        <p className="text-sm text-gray-400 mb-8">
          Duración: ~{warmup.duration} segundos
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            Comenzar Calentamiento
          </motion.button>
          <button
            onClick={onSkip}
            className="w-full py-3 px-6 text-gray-400 hover:text-white transition-colors"
          >
            Saltar por ahora
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface WarmupRunnerProps {
  warmup: Warmup;
  onComplete: (score: number) => void;
  onSkip: () => void;
}

function WarmupRunner({ warmup, onComplete, onSkip }: WarmupRunnerProps) {
  switch (warmup.type) {
    case 'rhythmSequence':
      return (
        <RhythmSequenceWarmup
          config={warmup.config}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      );
    case 'visualMatch':
      return (
        <VisualMatchWarmup
          config={warmup.config}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      );
    case 'voiceImitation':
      // Por ahora usar VisualMatch como fallback
      return (
        <VisualMatchWarmup
          config={{
            images: [],
            focusSpeed: 500,
            recognitionThreshold: 0.6,
            speedIncrease: 0.1,
          }}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      );
    default:
      return null;
  }
}

interface TransitionScreenProps {
  score: number;
}

function TransitionScreen({ score }: TransitionScreenProps) {
  const getMessage = () => {
    if (score >= 80) return '¡Excelente preparación!';
    if (score >= 60) return '¡Bien calentado!';
    if (score >= 40) return 'Preparación completada';
    return 'Listo para comenzar';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1 }}
        >
          ✨
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">{getMessage()}</h2>
        <p className="text-xl text-indigo-400">Puntuación: {score}%</p>
      </motion.div>

      {/* Partículas de celebración */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...new Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400 rounded-full"
            initial={{
              x: '50%',
              y: '50%',
              opacity: 1,
            }}
            animate={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0,
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface ReadyScreenProps {
  missionTitle: string;
  warmupScore: number | null;
  onStart: () => void;
  startButtonText?: string;
}

function ReadyScreen({ missionTitle, warmupScore, onStart, startButtonText = 'Comenzar Misión' }: ReadyScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-md"
      >
        <motion.div
          className="text-7xl mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🚀
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">¡Listo!</h2>
        <p className="text-xl text-gray-400 mb-6">{missionTitle}</p>

        {warmupScore !== null && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl mb-8">
            <p className="text-sm text-green-300">
              🧠 Cerebro calentado al {warmupScore}%
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-colors"
        >
          {startButtonText}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default WarmupGate;
