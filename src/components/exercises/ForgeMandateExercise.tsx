'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useMissionStore } from '@/store/useMissionStore';
import { XP_RULES } from '@/lib/constants';
import { ShardDetectionExercise } from './ShardDetectionExercise';
import { PragmaStrikeExercise } from './PragmaStrikeExercise';
import { ResonancePathExercise } from './ResonancePathExercise';
import { EchoStreamExercise } from './EchoStreamExercise';
import { GlyphWeavingExercise } from './GlyphWeavingExercise';
import { ShardDetection, PragmaStrike, ResonancePath, EchoStream, GlyphWeaving } from '@/types';

type ExerciseType = 'shardDetection' | 'pragmaStrike' | 'resonancePath' | 'echoStream' | 'glyphWeaving';

interface ExerciseConfig {
  type: ExerciseType;
  exercise: ShardDetection | PragmaStrike | ResonancePath | EchoStream | GlyphWeaving;
}

type ForgePhase = 'intro' | 'exercising' | 'complete';

interface ForgeMandateExerciseProps {
  exercises: {
    shardDetection?: ShardDetection[];
    pragmaStrike?: PragmaStrike[];
    resonancePath?: ResonancePath[];
    echoStream?: EchoStream[];
    glyphWeaving?: GlyphWeaving[];
  };
  onComplete: () => void;
}

export function ForgeMandateExercise({ exercises, onComplete }: ForgeMandateExerciseProps) {
  const { addXP } = useGamificationStore();
  const [phase, setPhase] = useState<ForgePhase>('intro');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseSequence, setExerciseSequence] = useState<ExerciseConfig[]>([]);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Generar secuencia aleatoria de 3 ejercicios
  useEffect(() => {
    const availableTypes: ExerciseType[] = [];
    
    if (exercises.shardDetection && exercises.shardDetection.length > 0) {
      availableTypes.push('shardDetection');
    }
    if (exercises.pragmaStrike && exercises.pragmaStrike.length > 0) {
      availableTypes.push('pragmaStrike');
    }
    if (exercises.resonancePath && exercises.resonancePath.length > 0) {
      availableTypes.push('resonancePath');
    }
    if (exercises.echoStream && exercises.echoStream.length > 0) {
      availableTypes.push('echoStream');
    }
    if (exercises.glyphWeaving && exercises.glyphWeaving.length > 0) {
      availableTypes.push('glyphWeaving');
    }

    // Seleccionar 3 tipos aleatorios
    const selectedTypes: ExerciseType[] = [];
    const shuffled = [...availableTypes].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      selectedTypes.push(shuffled[i]);
    }

    // Crear secuencia de ejercicios
    const sequence: ExerciseConfig[] = selectedTypes.map((type) => {
      switch (type) {
        case 'shardDetection':
          return {
            type: 'shardDetection' as const,
            exercise: exercises.shardDetection![Math.floor(Math.random() * exercises.shardDetection!.length)],
          };
        case 'pragmaStrike':
          return {
            type: 'pragmaStrike' as const,
            exercise: exercises.pragmaStrike![Math.floor(Math.random() * exercises.pragmaStrike!.length)],
          };
        case 'resonancePath':
          return {
            type: 'resonancePath' as const,
            exercise: exercises.resonancePath![Math.floor(Math.random() * exercises.resonancePath!.length)],
          };
        case 'echoStream':
          return {
            type: 'echoStream' as const,
            exercise: exercises.echoStream![Math.floor(Math.random() * exercises.echoStream!.length)],
          };
        case 'glyphWeaving':
          return {
            type: 'glyphWeaving' as const,
            exercise: exercises.glyphWeaving![Math.floor(Math.random() * exercises.glyphWeaving!.length)],
          };
        default:
          throw new Error(`Unknown exercise type: ${type}`);
      }
    });

    setExerciseSequence(sequence);
  }, [exercises]);

  const handleExerciseComplete = useCallback((result: boolean | number) => {
    setCompletedExercises((prev) => {
      const newCount = prev + 1;
      
      // Calcular score basado en resultado
      let score = 0;
      if (typeof result === 'boolean') {
        score = result ? 100 : 50;
      } else if (typeof result === 'number') {
        score = result; // accuracy percentage
      }
      
      setTotalScore((prevScore) => prevScore + score);

      // Si completó todos los ejercicios
      if (newCount >= exerciseSequence.length) {
        // Bonus por completar Forge Mandate
        const bonusXP = XP_RULES.forgeMandateComplete || 100;
        addXP(bonusXP);

        // Completar misión Forge Mandate
        const missionStore = useMissionStore.getState();
        const forgeMission = missionStore.dailyMissions.find(
          (m) => m.type === 'forgeMandate'
        );
        if (forgeMission) {
          missionStore.completeMission(forgeMission.id);
        }

        setTimeout(() => {
          setPhase('complete');
          setTimeout(() => {
            onComplete();
          }, 3000);
        }, 1000);
      } else {
        // Pasar al siguiente ejercicio
        setCurrentExerciseIndex(newCount);
      }

      return newCount;
    });
  }, [exerciseSequence.length, addXP, onComplete]);

  const startForgeMandate = useCallback(() => {
    setPhase('exercising');
  }, []);

  const currentExercise = exerciseSequence[currentExerciseIndex];
  const progress = (completedExercises / exerciseSequence.length) * 100;
  const averageScore = completedExercises > 0 ? totalScore / completedExercises : 0;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Fase: Intro */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-aaa-xl p-8 text-center border-2 border-purple-500/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚔️
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2 font-rajdhani">
              Forge Mandate
            </h2>
            <p className="text-gray-300 mb-6">
              Misión diaria: Completa 3 ejercicios aleatorios bajo una narrativa de supervivencia.
            </p>
            <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-purple-400 font-semibold">Objetivo:</span> Completa la secuencia de ejercicios
              </p>
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-purple-400 font-semibold">Recompensa:</span> +100 XP, +50 Coins, +20 Gems
              </p>
              <p className="text-sm text-gray-300">
                <span className="text-purple-400 font-semibold">Ejercicios:</span> {exerciseSequence.length} ejercicios aleatorios
              </p>
            </div>
            <button
              onClick={startForgeMandate}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-aaa-xl shadow-lg hover:shadow-xl transition-all text-lg"
            >
              Comenzar Misión
            </button>
          </motion.div>
        )}

        {/* Fase: Exercising */}
        {phase === 'exercising' && currentExercise && (
          <motion.div
            key={`exercise-${currentExerciseIndex}`}
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Progress Header */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ejercicio {completedExercises + 1} de {exerciseSequence.length}
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  Score: {averageScore.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Exercise Component */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-6">
              {currentExercise.type === 'shardDetection' && (
                <ShardDetectionExercise
                  exercise={currentExercise.exercise as ShardDetection}
                  onComplete={(correct) => handleExerciseComplete(correct)}
                />
              )}
              {currentExercise.type === 'pragmaStrike' && (
                <PragmaStrikeExercise
                  exercise={currentExercise.exercise as PragmaStrike}
                  onComplete={(correct) => handleExerciseComplete(correct)}
                />
              )}
              {currentExercise.type === 'resonancePath' && (
                <ResonancePathExercise
                  exercise={currentExercise.exercise as ResonancePath}
                  onComplete={(accuracy) => handleExerciseComplete(accuracy)}
                />
              )}
              {currentExercise.type === 'echoStream' && (
                <EchoStreamExercise
                  exercise={currentExercise.exercise as EchoStream}
                  onComplete={(_powerWords, accuracy) => handleExerciseComplete(accuracy)}
                />
              )}
              {currentExercise.type === 'glyphWeaving' && (
                <GlyphWeavingExercise
                  exercise={currentExercise.exercise as GlyphWeaving}
                  onComplete={(accuracy) => handleExerciseComplete(accuracy)}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Fase: Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-aaa-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="text-6xl mb-4 block"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              🎉
            </motion.span>
            <h3 className="text-white text-2xl font-bold mb-2">
              ¡Misión Completada!
            </h3>
            <p className="text-white/90 mb-4">
              Score promedio: {averageScore.toFixed(1)}%
            </p>
            <p className="text-white/80 text-sm">
              +100 XP + 50 Coins + 20 Gems
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

