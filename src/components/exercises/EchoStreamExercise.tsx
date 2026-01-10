'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { EchoStream } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES, GEM_RULES } from '@/lib/constants';
import { isPowerWordDetected } from '@/lib/audioVisualization';

interface EchoStreamExerciseProps {
  exercise: EchoStream;
  onComplete: (powerWordsDetected: number, accuracy: number) => void;
}

type EchoPhase = 'intro' | 'playing' | 'complete';

export function EchoStreamExercise({ exercise, onComplete }: EchoStreamExerciseProps) {
  const { addXP, addGems } = useGamificationStore();
  const [phase, setPhase] = useState<EchoPhase>('playing');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [powerWordsDetected, setPowerWordsDetected] = useState<Set<string>>(new Set());
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const soundRef = useRef<Howl | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleComplete = useCallback(() => {
    setPhase('complete');
    const accuracy = (powerWordsDetected.size / exercise.powerWords.length) * 100;
    
    // Bonus por completar stream
    addXP(XP_RULES.echoStreamComplete);
    
    // Bonus por alta precisión
    if (accuracy >= 90) {
      addGems(GEM_RULES.perfectComprehension);
    }

    setTimeout(() => {
      onComplete(powerWordsDetected.size, accuracy);
    }, 2000);
  }, [powerWordsDetected.size, exercise.powerWords.length, addXP, addGems, onComplete]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      soundRef.current?.unload();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);


  // Detectar Power Words
  const checkPowerWords = useCallback((time: number) => {
    exercise.powerWords.forEach((powerWord) => {
      if (!powerWordsDetected.has(powerWord.word)) {
        if (isPowerWordDetected(time, powerWord.timestamp, powerWord.tolerance)) {
          setPowerWordsDetected((prev) => {
            const newSet = new Set(prev);
            newSet.add(powerWord.word);
            return newSet;
          });
          addXP(XP_RULES.echoStreamPowerWord);
        }
      }
    });
  }, [exercise.powerWords, powerWordsDetected, addXP]);

  // Timer para actualizar tiempo actual
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (soundRef.current) {
          const time = soundRef.current.seek() as number;
          setCurrentTime(time);
          checkPowerWords(time);
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, checkPowerWords]);

  // Dibujar waveform en canvas
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Dibujar línea central
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Dibujar waveform
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const stepX = width / waveformData.length;
    const progress = currentTime / exercise.audioDuration;
    const currentX = progress * width;

    waveformData.forEach((amplitude, index) => {
      const x = index * stepX;
      const y = centerY - (amplitude * centerY * 0.8);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dibujar posición actual
    if (isPlaying) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();

      // Dibujar Power Words
      exercise.powerWords.forEach((powerWord) => {
        const pwX = (powerWord.timestamp / exercise.audioDuration) * width;
        const isDetected = powerWordsDetected.has(powerWord.word);
        
        ctx.fillStyle = isDetected ? '#10B981' : '#EF4444';
        ctx.beginPath();
        ctx.arc(pwX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Dibujar posición del touch
    if (touchPosition) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(touchPosition.x, touchPosition.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [waveformData, currentTime, exercise.audioDuration, exercise.powerWords, powerWordsDetected, isPlaying, touchPosition]);

  // Inicializar y dibujar canvas cuando cambia la fase
  useEffect(() => {
    if (phase === 'playing' && canvasRef.current) {
      // Asegurar que el canvas tenga el tamaño correcto
      const canvas = canvasRef.current;
      if (canvas.width !== 600 || canvas.height !== 200) {
        canvas.width = 600;
        canvas.height = 200;
      }
      // Dibujar inmediatamente
      drawWaveform();
    }
  }, [phase, drawWaveform]);

  // Asegurar que el canvas se dibuje cuando cambian los datos
  useEffect(() => {
    if (phase === 'playing' && canvasRef.current) {
      drawWaveform();
    }
  }, [phase, waveformData, currentTime, powerWordsDetected, touchPosition, drawWaveform]);

  const startPlaying = useCallback(() => {
    // Inicializar audio automáticamente al montar el componente
    if (soundRef.current) {
      soundRef.current.unload();
    }

    try {
      soundRef.current = new Howl({
        src: [exercise.audioUrl],
        format: ['mp3', 'ogg', 'wav'],
        autoplay: false,
        onplay: () => setIsPlaying(true),
        onend: () => {
          setIsPlaying(false);
          handleComplete();
        },
        onload: async () => {
          // Generar waveform básico (simulado)
          const fallbackWaveform = Array.from({ length: 200 }, () => Math.random() * 0.5 + 0.25);
          setWaveformData(fallbackWaveform);
        },
        onloaderror: (_id, error) => {
          console.warn('Error loading audio, continuing without audio:', error);
          setIsPlaying(false);
          // Generar waveform básico incluso sin audio
          const fallbackWaveform = Array.from({ length: 200 }, () => Math.random() * 0.5 + 0.25);
          setWaveformData(fallbackWaveform);
        },
      });
      
      // Pequeño delay para asegurar que el audio esté listo
      setTimeout(() => {
        if (soundRef.current) {
          try {
            const soundId = soundRef.current.play();
            if (soundId === undefined) {
              console.warn('Error playing audio, continuing without audio');
            }
          } catch (error) {
            console.warn('Error playing audio, continuing without audio:', error);
          }
        }
      }, 200);
    } catch (error) {
      console.warn('Error initializing audio, continuing without audio:', error);
      // Generar waveform básico incluso sin audio
      const fallbackWaveform = Array.from({ length: 200 }, () => Math.random() * 0.5 + 0.25);
      setWaveformData(fallbackWaveform);
    }
  }, [exercise.audioUrl, handleComplete]);

  // Iniciar automáticamente al montar el componente (solo una vez)
  useEffect(() => {
    startPlaying();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setTouchPosition({ x, y });

    // Verificar si está cerca de un Power Word
    const normalizedX = x / rect.width;
    const touchTime = normalizedX * exercise.audioDuration;

    exercise.powerWords.forEach((powerWord) => {
      if (!powerWordsDetected.has(powerWord.word)) {
        if (isPowerWordDetected(touchTime, powerWord.timestamp, powerWord.tolerance)) {
          setPowerWordsDetected((prev) => {
            const newSet = new Set(prev);
            newSet.add(powerWord.word);
            return newSet;
          });
          addXP(XP_RULES.echoStreamPowerWord);
        }
      }
    });
  }, [exercise.powerWords, exercise.audioDuration, powerWordsDetected, addXP]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setTouchPosition({ x, y });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouchPosition(null);
  }, []);

  const progress = (currentTime / exercise.audioDuration) * 100;
  const accuracy = (powerWordsDetected.size / exercise.powerWords.length) * 100;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Fase: Playing */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Canvas con waveform */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 touch-none cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 text-center">
                <motion.div
                  className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                  key={powerWordsDetected.size}
                  initial={{ scale: 1.5, color: "#10B981" }}
                  animate={{ scale: 1, color: "#4F46E5" }}
                  transition={{ duration: 0.3 }}
                >
                  {powerWordsDetected.size}/{exercise.powerWords.length}
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Power Words
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {accuracy.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Precisión
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #4F46E5, #8B5CF6, #4F46E5)",
                    backgroundSize: "200% 100%",
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                  }}
                  transition={{
                    width: { duration: 0.1 },
                    backgroundPosition: { duration: 3, repeat: Infinity },
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {currentTime.toFixed(1)}s / {exercise.audioDuration.toFixed(1)}s
              </div>
            </div>

            {/* Frase */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 text-center">
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
            </div>
          </motion.div>
        )}

        {/* Fase: Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            className={`
              rounded-aaa-xl p-8 text-center
              ${accuracy >= 90
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                : 'bg-gradient-to-br from-indigo-400 to-purple-500'
              }
            `}
            initial={{ opacity: 0, scale: 0.5, rotateZ: -5 }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.span
              className="text-6xl mb-4 block"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {accuracy >= 90 ? '🎉' : '✨'}
            </motion.span>
            <h3 className="text-white text-xl font-bold mb-2">
              {accuracy >= 90 ? '¡Perfecto!' : '¡Bien hecho!'}
            </h3>
            <p className="text-white/90 mb-2">
              Power Words detectadas: {powerWordsDetected.size}/{exercise.powerWords.length}
            </p>
            <p className="text-white/80 text-sm">
              {accuracy >= 90
                ? `+${XP_RULES.echoStreamComplete} XP + ${GEM_RULES.perfectComprehension} Gems`
                : `+${XP_RULES.echoStreamComplete} XP`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

