'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phrase } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useTTS } from '@/services/ttsService';
import { XP_RULES, SHADOWING_CONFIG } from '@/lib/constants';

interface ShadowingExerciseProps {
  phrase: Phrase;
  onComplete: () => void;
}

type ShadowingPhase = 'intro' | 'listening' | 'shadowing' | 'complete';

export function ShadowingExercise({ phrase, onComplete }: ShadowingExerciseProps) {
  const { addXP } = useGamificationStore();
  const { speak, isSpeaking, isAvailable } = useTTS();
  const [phase, setPhase] = useState<ShadowingPhase>('intro');
  const [listenCount, setListenCount] = useState(0);

  // Reproducir audio con TTS real
  const playAudio = useCallback(() => {
    if (isAvailable) {
      speak(phrase.text);
      // Incrementar contador cuando termine de hablar
      const checkSpeaking = setInterval(() => {
        if (!isSpeaking) {
          clearInterval(checkSpeaking);
          setListenCount(prev => prev + 1);
        }
      }, 200);
      // Fallback timeout
      setTimeout(() => {
        clearInterval(checkSpeaking);
        setListenCount(prev => prev + 1);
      }, 5000);
    } else {
      // Fallback si TTS no está disponible
      setTimeout(() => {
        setListenCount(prev => prev + 1);
      }, 2000);
    }
  }, [isAvailable, speak, isSpeaking, phrase.text]);

  const startListening = useCallback(() => {
    setPhase('listening');
    playAudio();
  }, [playAudio]);

  const startShadowing = useCallback(() => {
    if (listenCount < SHADOWING_CONFIG.requiredListens) {
      playAudio();
      return;
    }
    setPhase('shadowing');
  }, [listenCount, playAudio]);

  const completeShadowing = useCallback(() => {
    setPhase('complete');
    addXP(XP_RULES.shadowingComplete);

    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [addXP, onComplete]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Fase: Intro */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-5xl mb-4 block">🎧</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Ejercicio de Shadowing
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Escucha la frase y repítela en voz alta al mismo tiempo
            </p>
            <button
              onClick={startListening}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Comenzar
            </button>
          </motion.div>
        )}

        {/* Fase: Listening */}
        {phase === 'listening' && (
          <motion.div
            key="listening"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Indicador de reproducción */}
            <motion.div
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-center"
              animate={isSpeaking ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
                animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <span className="text-4xl">{isSpeaking ? '🔊' : '🔇'}</span>
              </motion.div>

              <p className="text-white text-xl font-medium mb-2">
                {phrase.text}
              </p>
              <p className="text-white/60 text-sm">
                {phrase.translation}
              </p>
            </motion.div>

            {/* Contador de escuchas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Escuchas requeridas
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {listenCount}/{SHADOWING_CONFIG.requiredListens}
                </span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: SHADOWING_CONFIG.requiredListens }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      flex-1 h-2 rounded-full
                      ${i < listenCount ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={playAudio}
                disabled={isSpeaking}
                className={`
                  flex-1 py-3 rounded-xl font-medium transition-all
                  ${isSpeaking
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                  }
                `}
              >
                🔄 Escuchar de nuevo
              </button>
              <button
                onClick={startShadowing}
                disabled={listenCount < SHADOWING_CONFIG.requiredListens}
                className={`
                  flex-1 py-3 rounded-xl font-bold transition-all
                  ${listenCount >= SHADOWING_CONFIG.requiredListens
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                🎤 Repetir
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase: Shadowing */}
        {phase === 'shadowing' && (
          <motion.div
            key="shadowing"
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <span className="text-5xl">🎤</span>
              </motion.div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Repite en voz alta:
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {phrase.text}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {phrase.translation}
              </p>

              <button
                onClick={completeShadowing}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                ✓ He repetido la frase
              </button>
            </div>
          </motion.div>
        )}

        {/* Fase: Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-white text-xl font-bold mb-2">
              ¡Excelente!
            </h3>
            <p className="text-white/80">
              +{XP_RULES.shadowingComplete} XP por completar el shadowing
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
