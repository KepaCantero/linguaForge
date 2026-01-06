'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisualMatchConfig } from '@/schemas/warmup';

interface VisualMatchWarmupProps {
  config: VisualMatchConfig;
  onComplete: (score: number) => void;
  onSkip: () => void;
}

// Imágenes de ejemplo para el warmup (usando placeholders)
const SAMPLE_IMAGES = [
  { category: 'animales', word: 'chat', emoji: '🐱' },
  { category: 'comida', word: 'pomme', emoji: '🍎' },
  { category: 'objetos', word: 'livre', emoji: '📚' },
  { category: 'lugares', word: 'maison', emoji: '🏠' },
  { category: 'acciones', word: 'courir', emoji: '🏃' },
  { category: 'animales', word: 'chien', emoji: '🐕' },
  { category: 'comida', word: 'pain', emoji: '🥖' },
  { category: 'objetos', word: 'voiture', emoji: '🚗' },
];

/**
 * VisualMatchWarmup Component
 *
 * Calentamiento visual que activa el lóbulo temporal.
 * El usuario debe identificar imágenes que se van enfocando progresivamente.
 */
export function VisualMatchWarmup({
  config,
  onComplete,
  onSkip,
}: VisualMatchWarmupProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [blurLevel, setBlurLevel] = useState(10);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);

  const totalImages = Math.min(config.images.length, SAMPLE_IMAGES.length);
  const currentItem = SAMPLE_IMAGES[currentImage];

  // Generar opciones (1 correcta + 3 incorrectas)
  const options = SAMPLE_IMAGES.filter((_, i) => i !== currentImage)
    .slice(0, 3)
    .concat(currentItem)
    .sort(() => Math.random() - 0.5);

  // Iniciar ronda - definido antes del useEffect del countdown para evitar dependencias circulares
  const startRound = useCallback(() => {
    setBlurLevel(10);
    setShowOptions(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setStartTime(Date.now());

    // Reducir blur progresivamente
    const interval = setInterval(() => {
      setBlurLevel((prev) => {
        const newBlur = prev - 0.5;
        if (newBlur <= 0) {
          clearInterval(interval);
          setShowOptions(true);
          return 0;
        }
        return newBlur;
      });
    }, config.focusSpeed / 20);

    return () => clearInterval(interval);
  }, [config.focusSpeed]);

  // Countdown inicial
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      startRound();
    }
  }, [countdown, showCountdown, startRound]);

  // Manejar selección
  const handleSelect = useCallback(
    (word: string) => {
      if (selectedAnswer) return;

      setSelectedAnswer(word);
      const correct = word === currentItem.word;
      setIsCorrect(correct);

      // Calcular puntuación
      const responseTime = Date.now() - startTime;
      let roundScore = 0;

      if (correct) {
        // Bonus por velocidad
        const speedBonus = Math.max(0, 1 - responseTime / 5000);
        // Bonus por nivel de blur al responder
        const blurBonus = blurLevel / 10;
        roundScore = 100 * (0.5 + speedBonus * 0.3 + blurBonus * 0.2);
      }

      setScore((prev) => prev + roundScore);

      // Vibración de feedback
      if (navigator.vibrate) {
        navigator.vibrate(correct ? 50 : [50, 50, 50]);
      }

      // Siguiente imagen o completar
      setTimeout(() => {
        if (currentImage < totalImages - 1) {
          setCurrentImage(currentImage + 1);
          setShowCountdown(true);
          setCountdown(2);
        } else {
          const finalScore = (score + roundScore) / totalImages;
          onComplete(Math.round(finalScore));
        }
      }, 1500);
    },
    [selectedAnswer, currentItem, startTime, blurLevel, currentImage, totalImages, score, onComplete]
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Reconocimiento Visual</h2>
          <p className="text-sm text-gray-400">
            Imagen {currentImage + 1} de {totalImages}
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
            {countdown > 0 ? countdown : '¡Mira!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      {!showCountdown && (
        <div className="flex flex-col items-center gap-8">
          {/* Imagen con blur */}
          <motion.div
            className="relative w-48 h-48 bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              filter: `blur(${blurLevel}px)`,
            }}
          >
            <span className="text-9xl">{currentItem.emoji}</span>
          </motion.div>

          {/* Indicador de enfoque */}
          {!showOptions && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">Enfocando...</p>
              <div className="w-48 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${blurLevel * 10}%` }}
                />
              </div>
            </div>
          )}

          {/* Opciones */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                {options.map((option, i) => (
                  <motion.button
                    key={option.word}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelect(option.word)}
                    disabled={selectedAnswer !== null}
                    className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                      selectedAnswer === option.word
                        ? isCorrect
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                        : selectedAnswer && option.word === currentItem.word
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {option.word}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-2xl font-bold ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isCorrect ? '¡Correcto!' : `Era: ${currentItem.word}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Barra de progreso */}
      <div className="absolute bottom-8 left-4 right-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Puntuación: {Math.round(score)}</span>
          <span>{currentImage + 1}/{totalImages}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentImage + (selectedAnswer ? 1 : 0)) / totalImages) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default VisualMatchWarmup;
