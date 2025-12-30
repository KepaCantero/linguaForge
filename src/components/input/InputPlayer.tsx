'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputContent } from '@/types';
import { useInputStore } from '@/store/useInputStore';
import { useProgressStore } from '@/store/useProgressStore';
import { INPUT_CONFIG } from '@/lib/constants';
import { SPRING, DURATION, EASING, staggerDelay } from '@/lib/motion';

interface InputPlayerProps {
  content: InputContent;
  onComplete: () => void;
  onBack: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING.smooth,
  },
};

const playerVariants = {
  idle: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(126, 34, 206, 0)',
  },
  playing: {
    scale: 1,
    boxShadow: [
      '0 0 0 0 rgba(126, 34, 206, 0.4)',
      '0 0 0 20px rgba(126, 34, 206, 0)',
    ],
    transition: {
      boxShadow: {
        duration: 1.5,
        repeat: Infinity,
        ease: EASING.decelerate,
      },
    },
  },
};

const soundWaveVariants = {
  animate: (i: number) => ({
    scaleY: [0.3, 1, 0.3],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      delay: i * 0.1,
      ease: EASING.smooth,
    },
  }),
};

export function InputPlayer({ content, onComplete, onBack }: InputPlayerProps) {
  const { activeLanguage, activeLevel } = useProgressStore();
  const { addWordsHeard, addWordsRead, addRecentContent } = useInputStore();

  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const isAudioVideo = content.type === 'audio' || content.type === 'video';
  const minPlays = isAudioVideo ? INPUT_CONFIG.minListensToUnlockTest : INPUT_CONFIG.minReadsToUnlockTest;
  const canContinue = playCount >= minPlays;

  // Simular reproducción
  const simulatePlayback = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    setProgress(0);

    const duration = content.durationSeconds || 30;
    const interval = 100;
    const steps = (duration * 1000) / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsPlaying(false);
        setPlayCount((prev) => prev + 1);
        setHasFinished(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, content.durationSeconds]);

  // Manejar lectura de texto
  const handleTextRead = useCallback(() => {
    if (!hasFinished) {
      setPlayCount((prev) => prev + 1);
      setHasFinished(true);
    }
  }, [hasFinished]);

  // Registrar input cuando se completa
  const handleComplete = useCallback(() => {
    if (content.type === 'text') {
      addWordsRead(activeLanguage, activeLevel, content.wordCount);
    } else {
      addWordsHeard(activeLanguage, activeLevel, content.wordCount);
    }
    addRecentContent(content.id);
    onComplete();
  }, [content, activeLanguage, activeLevel, addWordsRead, addWordsHeard, addRecentContent, onComplete]);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-lf-soft border border-lf-muted/30 flex items-center justify-center text-gray-400 hover:text-white hover:border-lf-primary/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="text-lg">
            {content.type === 'audio' ? '🎧' : content.type === 'video' ? '📺' : '📖'}
          </span>
          <span className="font-rajdhani text-sm text-lf-muted uppercase tracking-wider">
            {content.type === 'audio' ? 'Audio' : content.type === 'video' ? 'Video' : 'Lectura'}
          </span>
        </div>

        <div className="w-10" />
      </motion.div>

      {/* Título y descripción */}
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="font-rajdhani text-2xl font-bold text-white">
          {content.title}
        </h1>
        <p className="font-atkinson text-sm text-gray-400 mt-1 italic">
          {content.description}
        </p>
      </motion.div>

      {/* Reproductor según tipo */}
      {isAudioVideo ? (
        <motion.div
          className="relative rounded-2xl p-8 text-center bg-lf-soft border border-lf-muted/30 overflow-hidden"
          variants={itemVariants}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "url('/patterns/phonetic-glyphs.svg')",
              backgroundSize: '80px 80px',
            }}
          />

          {/* Glow effect when playing */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lf-primary/20 via-lf-secondary/10 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.normal }}
              />
            )}
          </AnimatePresence>

          {/* Player circle */}
          <motion.div
            className="relative w-32 h-32 mx-auto mb-6"
            variants={playerVariants}
            animate={isPlaying ? 'playing' : 'idle'}
          >
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-lf-primary/30"
              animate={isPlaying ? {
                rotate: 360,
                borderColor: ['rgba(126,34,206,0.3)', 'rgba(217,70,239,0.5)', 'rgba(126,34,206,0.3)'],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Main circle */}
            <div className={`
              absolute inset-2 rounded-full flex items-center justify-center
              ${isPlaying
                ? 'bg-gradient-to-br from-lf-primary to-lf-secondary'
                : 'bg-lf-dark border border-lf-muted/50'
              }
            `}>
              {isPlaying ? (
                /* Sound wave animation */
                <div className="flex items-center gap-1 h-12">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-white rounded-full"
                      style={{ height: '100%', originY: 0.5 }}
                      variants={soundWaveVariants}
                      animate="animate"
                      custom={i}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-5xl">
                  {content.type === 'video' ? '📺' : '🎧'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Progress bar */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                className="relative mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="w-full h-1.5 bg-lf-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-lf-primary to-lf-secondary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 font-rajdhani">
                  <span>{Math.floor((progress / 100) * (content.durationSeconds || 30))}s</span>
                  <span>{content.durationSeconds || 30}s</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play button */}
          <motion.button
            onClick={simulatePlayback}
            disabled={isPlaying}
            className={`
              relative px-8 py-3 rounded-xl font-rajdhani font-bold transition-all overflow-hidden
              ${isPlaying
                ? 'bg-lf-muted/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-lf-primary to-lf-secondary text-white shadow-lg shadow-lf-primary/25'
              }
            `}
            whileHover={!isPlaying ? { scale: 1.05, boxShadow: '0 10px 30px rgba(126,34,206,0.4)' } : {}}
            whileTap={!isPlaying ? { scale: 0.95 } : {}}
          >
            {!isPlaying && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {isPlaying ? (
                <>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ◉
                  </motion.span>
                  Reproduciendo...
                </>
              ) : (
                <>
                  <span>▶</span>
                  {playCount === 0 ? 'Reproducir' : 'Reproducir de nuevo'}
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      ) : (
        /* Contenido de texto */
        <motion.div
          className="bg-lf-soft rounded-xl p-6 border border-lf-muted/30"
          variants={itemVariants}
        >
          <motion.p
            className="font-atkinson text-gray-300 leading-relaxed text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: DURATION.slow }}
          >
            {content.transcript}
          </motion.p>

          <motion.button
            onClick={handleTextRead}
            disabled={hasFinished}
            className={`
              w-full mt-6 py-3 rounded-xl font-rajdhani font-bold transition-all
              ${hasFinished
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-lf-primary to-lf-secondary text-white shadow-lg shadow-lf-primary/25'
              }
            `}
            whileHover={!hasFinished ? { scale: 1.02 } : {}}
            whileTap={!hasFinished ? { scale: 0.98 } : {}}
          >
            {hasFinished ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING.bouncy}
              >
                ✓ Leído
              </motion.span>
            ) : (
              'Marcar como leído'
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Contador de reproducciones */}
      <motion.div
        className="bg-lf-soft rounded-xl p-4 border border-lf-muted/30"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-atkinson text-sm text-gray-400">
            {isAudioVideo ? 'Reproducciones' : 'Lecturas'} para desbloquear test
          </span>
          <motion.span
            className={`font-rajdhani font-bold ${canContinue ? 'text-emerald-400' : 'text-lf-secondary'}`}
            key={playCount}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.bouncy}
          >
            {playCount}/{minPlays}
          </motion.span>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: minPlays }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-2 rounded-full overflow-hidden bg-lf-dark"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: staggerDelay(i, 0.1), duration: DURATION.normal }}
            >
              <motion.div
                className={`h-full rounded-full ${i < playCount ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : ''}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i < playCount ? 1 : 0 }}
                transition={SPRING.smooth}
                style={{ originX: 0 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Transcripción (para audio/video) */}
      {isAudioVideo && content.transcript && (
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => setShowTranscript(!showTranscript)}
            className="font-atkinson text-sm text-lf-secondary hover:text-lf-secondary/80 transition-colors flex items-center gap-2"
            whileHover={{ x: 4 }}
          >
            <motion.span
              animate={{ rotate: showTranscript ? 90 : 0 }}
              transition={{ duration: DURATION.fast }}
            >
              ›
            </motion.span>
            {showTranscript ? 'Ocultar transcripción' : 'Mostrar transcripción'}
          </motion.button>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                className="mt-3 bg-lf-dark/50 rounded-xl p-4 border border-lf-muted/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: DURATION.normal, ease: EASING.smooth }}
              >
                <p className="font-atkinson text-gray-400 text-sm leading-relaxed">
                  {content.transcript}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Botón continuar */}
      <motion.button
        onClick={handleComplete}
        disabled={!canContinue}
        className={`
          w-full py-4 rounded-xl font-rajdhani font-bold text-lg transition-all relative overflow-hidden
          ${canContinue
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
            : 'bg-lf-muted/30 text-gray-500 cursor-not-allowed border border-lf-muted/20'
          }
        `}
        variants={itemVariants}
        whileHover={canContinue ? { scale: 1.02, boxShadow: '0 10px 30px rgba(16,185,129,0.3)' } : {}}
        whileTap={canContinue ? { scale: 0.98 } : {}}
      >
        {canContinue && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        )}
        <span className="relative">
          {canContinue ? (
            <span className="flex items-center justify-center gap-2">
              Continuar al test
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                →
              </motion.span>
            </span>
          ) : (
            `${isAudioVideo ? 'Escucha' : 'Lee'} ${minPlays - playCount} vez más`
          )}
        </span>
      </motion.button>
    </motion.div>
  );
}
