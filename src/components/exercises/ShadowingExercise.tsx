'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phrase } from '@/types';
import { useTTS } from '@/services/ttsService';
import { XP_RULES, SHADOWING_CONFIG } from '@/lib/constants';
import {
  useExercisePhase,
  useExerciseGamification,
  useExerciseUI,
  useExerciseAudio,
} from './hooks';

interface ShadowingExerciseProps {
  phrase: Phrase;
  onComplete: () => void;
}

type ShadowingPhase = 'intro' | 'listening' | 'shadowing' | 'complete';

export function ShadowingExercise({ phrase, onComplete }: ShadowingExerciseProps) {
  // Use shared hooks
  const { phase, setPhase } = useExercisePhase<ShadowingPhase>('intro');
  const { grantReward } = useExerciseGamification();
  const { showTranslation, toggleTranslation } = useExerciseUI();
  const { isPlaying, play } = useExerciseAudio();

  // Local state
  const [listenCount, setListenCount] = useState(0);

  // Reproducir audio usando shared hook
  const playAudio = useCallback(() => {
    play(phrase.text);
    // Incrementar contador cuando termine de hablar
    setTimeout(() => {
      setListenCount(prev => prev + 1);
    }, 2000);
  }, [play, phrase.text]);

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
    grantReward({
      baseXP: XP_RULES.shadowingComplete,
    });

    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [grantReward, onComplete, setPhase]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <IntroPhase onStart={startListening} />
        )}
        {phase === 'listening' && (
          <ListeningPhase
            phrase={phrase}
            isSpeaking={isPlaying}
            listenCount={listenCount}
            showTranslation={showTranslation}
            onToggleTranslation={toggleTranslation}
            onPlayAudio={playAudio}
            onStartShadowing={startShadowing}
          />
        )}
        {phase === 'shadowing' && (
          <ShadowingPhase
            phrase={phrase}
            showTranslation={showTranslation}
            onToggleTranslation={toggleTranslation}
            onComplete={completeShadowing}
          />
        )}
        {phase === 'complete' && <CompletePhase />}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface IntroPhaseProps {
  onStart: () => void;
}

function IntroPhase({ onStart }: IntroPhaseProps) {
  return (
    <motion.div
      key="intro"
      className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <span className="text-5xl mb-4 block">🎧</span>
      <h3 className="text-lg font-bold text-calm-text-primary dark:text-white mb-2">
        Ejercicio de Shadowing
      </h3>
      <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mb-6">
        Escucha la frase y repítela en voz alta al mismo tiempo
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-gradient-to-r from-accent-500 to-sky-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
      >
        Comenzar
      </button>
    </motion.div>
  );
}

interface ListeningPhaseProps {
  phrase: Phrase;
  isSpeaking: boolean;
  listenCount: number;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onPlayAudio: () => void;
  onStartShadowing: () => void;
}

function ListeningPhase({
  phrase,
  isSpeaking,
  listenCount,
  showTranslation,
  onToggleTranslation,
  onPlayAudio,
  onStartShadowing,
}: ListeningPhaseProps) {
  return (
    <motion.div
      key="listening"
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AudioPlaybackCard
        phrase={phrase}
        isSpeaking={isSpeaking}
        showTranslation={showTranslation}
        onToggleTranslation={onToggleTranslation}
      />
      <ListenCounter listenCount={listenCount} />
      <ListeningControls
        isSpeaking={isSpeaking}
        listenCount={listenCount}
        onPlayAudio={onPlayAudio}
        onStartShadowing={onStartShadowing}
      />
    </motion.div>
  );
}

interface AudioPlaybackCardProps {
  phrase: Phrase;
  isSpeaking: boolean;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

function AudioPlaybackCard({ phrase, isSpeaking, showTranslation, onToggleTranslation }: AudioPlaybackCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-accent-500 to-sky-600 rounded-2xl p-8 text-center"
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
      <TranslationToggle
        showTranslation={showTranslation}
        onToggle={onToggleTranslation}
        translation={phrase.translation}
        buttonClass="mb-2 flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all bg-white/20 hover:bg-white/30 text-white"
      />
    </motion.div>
  );
}

interface TranslationToggleProps {
  showTranslation: boolean;
  onToggle: () => void;
  translation: string;
  buttonClass?: string;
}

function TranslationToggle({ showTranslation, onToggle, translation, buttonClass = "flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all bg-calm-bg-secondary dark:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-muted hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary" }: TranslationToggleProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className={buttonClass}
      >
        <span>{showTranslation ? "👁️" : "👁️‍🗨️"}</span>
        <span>{showTranslation ? "Ocultar traducción" : "Mostrar traducción"}</span>
      </button>
      {showTranslation && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/60 text-sm"
        >
          {translation}
        </motion.p>
      )}
    </>
  );
}

interface ListenCounterProps {
  listenCount: number;
}

function ListenCounter({ listenCount }: ListenCounterProps) {
  return (
    <div className="bg-white dark:bg-calm-bg-elevated rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-calm-text-secondary dark:text-calm-text-muted">
          Escuchas requeridas
        </span>
        <span className="font-bold text-accent-600 dark:text-accent-400">
          {listenCount}/{SHADOWING_CONFIG.requiredListens}
        </span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: SHADOWING_CONFIG.requiredListens }).map((_, i) => (
          <div
            key={`shadowing-progress-${i}`}
            className={`
              flex-1 h-2 rounded-full
              ${i < listenCount ? 'bg-accent-500' : 'bg-calm-bg-tertiary dark:bg-calm-bg-tertiary'}
            `}
          />
        ))}
      </div>
    </div>
  );
}

interface ListeningControlsProps {
  isSpeaking: boolean;
  listenCount: number;
  onPlayAudio: () => void;
  onStartShadowing: () => void;
}

function ListeningControls({ isSpeaking, listenCount, onPlayAudio, onStartShadowing }: ListeningControlsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onPlayAudio}
        disabled={isSpeaking}
        className={getReplayButtonClass(isSpeaking)}
      >
        🔄 Escuchar de nuevo
      </button>
      <button
        onClick={onStartShadowing}
        disabled={listenCount < SHADOWING_CONFIG.requiredListens}
        className={getShadowingButtonClass(listenCount)}
      >
        🎤 Repetir
      </button>
    </div>
  );
}

function getReplayButtonClass(isSpeaking: boolean): string {
  return isSpeaking
    ? 'flex-1 py-3 rounded-2xl font-medium transition-all bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-muted cursor-not-allowed'
    : 'flex-1 py-3 rounded-2xl font-medium transition-all bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 hover:bg-accent-200 dark:hover:bg-accent-800';
}

function getShadowingButtonClass(listenCount: number): string {
  return listenCount >= SHADOWING_CONFIG.requiredListens
    ? 'flex-1 py-3 rounded-2xl font-bold transition-all bg-gradient-to-r from-accent-500 to-sky-500 text-white shadow-lg hover:shadow-xl'
    : 'flex-1 py-3 rounded-2xl font-bold transition-all bg-calm-bg-tertiary dark:bg-calm-bg-tertiary text-calm-text-muted cursor-not-allowed';
}

interface ShadowingPhaseProps {
  phrase: Phrase;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onComplete: () => void;
}

function ShadowingPhase({ phrase, showTranslation, onToggleTranslation, onComplete }: ShadowingPhaseProps) {
  return (
    <motion.div
      key="shadowing"
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-8 text-center">
        <motion.div
          className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-accent-400 to-sky-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="text-5xl">🎤</span>
        </motion.div>

        <p className="text-calm-text-muted dark:text-calm-text-muted text-sm mb-2">
          Repite en voz alta:
        </p>
        <p className="text-2xl font-bold text-calm-text-primary dark:text-white mb-2">
          {phrase.text}
        </p>
        <div className="mb-4 flex items-center justify-center">
          <TranslationToggle
            showTranslation={showTranslation}
            onToggle={onToggleTranslation}
            translation={phrase.translation}
          />
        </div>

        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gradient-to-r from-accent-500 to-sky-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          ✓ He repetido la frase
        </button>
      </div>
    </motion.div>
  );
}

function CompletePhase() {
  return (
    <motion.div
      key="complete"
      className="bg-gradient-to-br from-accent-400 to-sky-500 rounded-2xl p-8 text-center"
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
  );
}
