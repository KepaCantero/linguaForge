'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { ShardDetection, ShardDetectionShard } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';
import Image from 'next/image';

interface ShardDetectionExerciseProps {
  exercise: ShardDetection;
  onComplete: (correct: boolean, timeSpent: number) => void;
}

export function ShardDetectionExercise({ exercise, onComplete }: ShardDetectionExerciseProps) {
  const { addXP } = useGamificationStore();
  const [selectedShard, setSelectedShard] = useState<ShardDetectionShard | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Inicializar audio
  useEffect(() => {
    soundRef.current = new Howl({
      src: [exercise.audioUrl],
      format: ['mp3', 'ogg', 'wav'],
      autoplay: false,
      onplay: () => setIsPlaying(true),
      onend: () => setIsPlaying(false),
      onloaderror: () => {
        console.error('Error loading audio');
        setIsPlaying(false);
      },
    });

    // Reproducir automáticamente al iniciar
    soundRef.current.play();
    startTimeRef.current = Date.now();

    // Timer para medir tiempo
    timerRef.current = setInterval(() => {
      setTimeSpent((Date.now() - startTimeRef.current) / 1000);
    }, 100);

    return () => {
      soundRef.current?.unload();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [exercise.audioUrl]);

  const handleShardSelect = useCallback((shard: ShardDetectionShard) => {
    if (showResult) return;

    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    setSelectedShard(shard);
    setIsCorrect(shard.isCorrect);
    setShowResult(true);
    setTimeSpent(finalTime);

    // Detener audio y timer
    soundRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calcular XP según velocidad y precisión
    let xpEarned = 0;
    if (shard.isCorrect) {
      if (finalTime < 3) {
        xpEarned = XP_RULES.shardDetectionFast;
      } else {
        xpEarned = XP_RULES.shardDetectionNormal;
      }
    } else {
      xpEarned = XP_RULES.shardDetectionIncorrect;
    }

    addXP(xpEarned);

    // Esperar antes de continuar
    setTimeout(() => {
      onComplete(shard.isCorrect, finalTime);
    }, 2000);
  }, [showResult, addXP, onComplete]);

  const playAudio = useCallback(() => {
    if (soundRef.current && !isPlaying) {
      soundRef.current.play();
      startTimeRef.current = Date.now();
    }
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* Instrucción */}
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Escucha y selecciona la imagen correcta
        </span>
      </div>

      {/* Timer visual */}
      <div className="flex justify-center">
        <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {showResult ? `${timeSpent.toFixed(1)}s` : `${timeSpent.toFixed(1)}s`}
          </span>
        </div>
      </div>

      {/* Audio controls */}
      <div className="flex justify-center">
        <button
          onClick={playAudio}
          disabled={isPlaying || showResult}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2 transition-all
            ${isPlaying || showResult
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }
          `}
        >
          <motion.span
            animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {isPlaying ? '🔊' : '🔈'}
          </motion.span>
          <span>{isPlaying ? 'Reproduciendo...' : 'Reproducir'}</span>
        </button>
      </div>

      {/* Shards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {exercise.shards.map((shard, index) => {
          const isSelected = selectedShard?.id === shard.id;
          const showCorrect = showResult && shard.isCorrect;
          const showIncorrect = showResult && isSelected && !shard.isCorrect;

          return (
            <motion.button
              key={shard.id}
              onClick={() => handleShardSelect(shard)}
              disabled={showResult}
              className={`
                relative aspect-square rounded-xl overflow-hidden transition-all
                ${showCorrect
                  ? 'ring-4 ring-emerald-500 scale-105'
                  : showIncorrect
                    ? 'ring-4 ring-red-500 opacity-50'
                    : isSelected
                      ? 'ring-2 ring-indigo-500'
                      : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-indigo-300'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
            >
              <Image
                src={shard.imageUrl}
                alt={`Shard ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
              />
              
              {/* Overlay para feedback */}
              {showResult && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {showCorrect && (
                    <div className="bg-emerald-500/90 text-white text-4xl font-bold p-4 rounded-full">
                      ✓
                    </div>
                  )}
                  {showIncorrect && (
                    <div className="bg-red-500/90 text-white text-4xl font-bold p-4 rounded-full">
                      ✗
                    </div>
                  )}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Frase y traducción */}
      {showResult && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {exercise.phrase}
          </p>
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span>{showTranslation ? "👁️" : "👁️‍🗨️"}</span>
              <span>{showTranslation ? "Ocultar traducción" : "Mostrar traducción"}</span>
            </button>
          </div>
          {showTranslation && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-gray-500 dark:text-gray-400 mt-2"
            >
              {exercise.translation}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Resultado */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className={`
              p-4 rounded-xl text-center
              ${isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-2xl mr-2">
              {isCorrect ? '🎉' : '💡'}
            </span>
            <span className="font-medium">
              {isCorrect
                ? `¡Correcto! +${timeSpent < 3 ? XP_RULES.shardDetectionFast : XP_RULES.shardDetectionNormal} XP`
                : `La respuesta correcta era la imagen ${exercise.shards.findIndex(s => s.isCorrect) + 1}`
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

