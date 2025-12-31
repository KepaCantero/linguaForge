'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { ResonancePath } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES, GEM_RULES } from '@/lib/constants';
import { analyzeIntonation, calculateIntonationSimilarity } from '@/lib/audioAnalysis';

interface ResonancePathExerciseProps {
  exercise: ResonancePath;
  onComplete: (accuracy: number) => void;
}

type ResonancePhase = 'intro' | 'listening' | 'recording' | 'comparing' | 'complete';

export function ResonancePathExercise({ exercise, onComplete }: ResonancePathExerciseProps) {
  const { addXP, addGems } = useGamificationStore();
  const [phase, setPhase] = useState<ResonancePhase>('listening');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [userIntonation, setUserIntonation] = useState<number[]>([]);
  
  const soundRef = useRef<Howl | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializar audio nativo
  useEffect(() => {
    soundRef.current = new Howl({
      src: [exercise.audioUrl],
      format: ['mp3', 'ogg', 'wav'],
      autoplay: false,
      onplay: () => setIsPlaying(true),
      onend: () => setIsPlaying(false),
    });

    return () => {
      soundRef.current?.unload();
    };
  }, [exercise.audioUrl]);

  const startListening = useCallback(() => {
    soundRef.current?.play();
  }, []);

  // Iniciar automáticamente al montar el componente (solo una vez)
  useEffect(() => {
    startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setPhase('comparing');

        // Procesar audio grabado
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Crear AudioContext y decodificar
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Analizar entonación
        const intonation = await analyzeIntonation(audioBuffer);
        setUserIntonation(intonation);

        // Calcular similitud
        const similarity = calculateIntonationSimilarity(exercise.nativeIntonation, intonation);
        setAccuracy(similarity);

        // Calcular recompensas
        if (similarity >= 90) {
          addXP(50);
          addGems(10);
        } else if (similarity >= 80) {
          addXP(30);
        }

        // Detener stream
        stream.getTracks().forEach(track => track.stop());

        setTimeout(() => {
          setPhase('complete');
          setTimeout(() => {
            onComplete(similarity);
          }, 2000);
        }, 3000);
      };

      setPhase('recording');
      setIsRecording(true);
      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor, permite el acceso.');
    }
  }, [exercise.nativeIntonation, addXP, addGems, onComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Visualización de curvas de entonación
  const renderIntonationCurve = useCallback((values: number[], color: string, label: string) => {
    if (values.length === 0) return null;

    const width = 600;
    const height = 200;
    const padding = 20;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const maxValue = Math.max(...values, ...exercise.nativeIntonation);
    const minValue = Math.min(...values, ...exercise.nativeIntonation);
    const range = maxValue - minValue || 1;

    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * graphWidth;
      const y = padding + graphHeight - ((value - minValue) / range) * graphHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
        <svg width={width} height={height} className="border border-gray-200 dark:border-gray-700 rounded">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }, [exercise.nativeIntonation]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Fase: Listening */}
        {phase === 'listening' && (
          <motion.div
            key="listening"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Curva de entonación nativa */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Entonación Nativa
              </h4>
              {renderIntonationCurve(exercise.nativeIntonation, '#4F46E5', 'Nativo')}
            </div>

            {/* Audio controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => soundRef.current?.play()}
                disabled={isPlaying}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all
                  ${isPlaying
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                  }
                `}
              >
                {isPlaying ? '🔊 Reproduciendo...' : '🔈 Escuchar'}
              </button>
              <button
                onClick={startRecording}
                disabled={isPlaying}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                🎤 Grabar
              </button>
            </div>

            {/* Frase */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-xl font-medium text-gray-900 dark:text-white">
                {exercise.phrase}
              </p>
            </div>
          </motion.div>
        )}

        {/* Fase: Recording */}
        {phase === 'recording' && (
          <motion.div
            key="recording"
            className="space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-8 text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <span className="text-5xl">🎤</span>
              </motion.div>
              <h3 className="text-white text-xl font-bold mb-2">
                Grabando...
              </h3>
              <p className="text-white/80 text-sm mb-6">
                Repite la frase en voz alta
              </p>
              <p className="text-white text-lg font-medium mb-4">
                {exercise.phrase}
              </p>
              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                ✓ Terminar grabación
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase: Comparing */}
        {phase === 'comparing' && (
          <motion.div
            key="comparing"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Comparación de Entonación
              </h4>
              
              {/* Curva nativa */}
              {renderIntonationCurve(exercise.nativeIntonation, '#4F46E5', 'Nativo')}
              
              {/* Curva del usuario */}
              {userIntonation.length > 0 && (
                <div className="mt-4">
                  {renderIntonationCurve(userIntonation, '#10B981', 'Tu grabación')}
                </div>
              )}

              {/* Precisión */}
              {accuracy !== null && (
                <div className="mt-6 text-center">
                  <div className={`
                    text-4xl font-bold mb-2
                    ${accuracy >= 90 ? 'text-emerald-500' : accuracy >= 80 ? 'text-indigo-500' : 'text-orange-500'}
                  `}>
                    {accuracy.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sincronización de entonación
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Fase: Complete */}
        {phase === 'complete' && accuracy !== null && (
          <motion.div
            key="complete"
            className={`
              rounded-xl p-8 text-center
              ${accuracy >= 90
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                : accuracy >= 80
                  ? 'bg-gradient-to-br from-indigo-400 to-purple-500'
                  : 'bg-gradient-to-br from-orange-400 to-red-500'
              }
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-6xl mb-4 block">
              {accuracy >= 90 ? '🎉' : accuracy >= 80 ? '✨' : '📈'}
            </span>
            <h3 className="text-white text-xl font-bold mb-2">
              {accuracy >= 90 ? '¡Excelente!' : accuracy >= 80 ? '¡Muy bien!' : 'Buen intento'}
            </h3>
            <p className="text-white/90 mb-2">
              Precisión: {accuracy.toFixed(1)}%
            </p>
            <p className="text-white/80 text-sm">
              {accuracy >= 90
                ? `+${XP_RULES.resonancePath90 || 50} XP + ${GEM_RULES.perfectComprehension} Gems`
                : accuracy >= 80
                  ? `+${XP_RULES.resonancePath80 || 30} XP`
                  : 'Sigue practicando para mejorar tu entonación'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

