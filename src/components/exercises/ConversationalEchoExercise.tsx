'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationalEcho } from '@/schemas/content';
import type { EchoEvaluationResult, SpeechRecordingResult } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { evaluateConversationalEcho, createTimeoutResult } from '@/services/exerciseEvaluationService';
import { SystemPhraseCard } from './conversational/SystemPhraseCard';
import { RespondingPhase } from './conversational/RespondingPhase';
import { RecordingPhase } from './conversational/RecordingPhase';
import { FeedbackDisplay } from './conversational/FeedbackDisplay';

interface ConversationalEchoExerciseProps {
  exercise: ConversationalEcho;
  onComplete: (result: EchoEvaluationResult) => void;
  onSkip?: () => void;
  showHints?: boolean;
  className?: string;
}

type ExercisePhase = 'listening' | 'responding' | 'recording' | 'feedback';

export function ConversationalEchoExercise({
  exercise,
  onComplete,
  onSkip,
  showHints = true,
  className = '',
}: ConversationalEchoExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<ExercisePhase>('listening');
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EchoEvaluationResult | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const config = exercise.config || {
    maxRecordingTime: 5,
    silenceTimeout: 3,
    showHint: true,
  };

  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const handleTimeout = useCallback(() => {
    const result = createTimeoutResult();
    setEvaluationResult(result);
    setPhase('feedback');
  }, []);

  const playSystemAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setAudioProgress(100);
    setPhase('responding');

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    let countdown = config.silenceTimeout;
    setSilenceTimer(countdown);

    const tick = () => {
      countdown--;
      setSilenceTimer(countdown);

      if (countdown <= 0) {
        handleTimeout();
      } else {
        silenceTimeoutRef.current = setTimeout(tick, 1000);
      }
    };

    silenceTimeoutRef.current = setTimeout(tick, 1000);
  }, [config.silenceTimeout, handleTimeout]);

  const handleRecordingStart = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setSilenceTimer(null);
    setPhase('recording');
  }, []);

  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const result = evaluateConversationalEcho(recording, exercise);
    setEvaluationResult(result);
    setPhase('feedback');

    if (result.xpEarned > 0) {
      addXP(result.xpEarned);
      if (result.feedback.type === 'perfect') {
        addGems(2);
      }
    }
  }, [exercise, addXP, addGems]);

  const handleContinue = useCallback(() => {
    if (evaluationResult) {
      onComplete(evaluationResult);
    }
  }, [evaluationResult, onComplete]);

  const handleRetry = useCallback(() => {
    setPhase('listening');
    setAudioProgress(0);
    setEvaluationResult(null);
    setSilenceTimer(null);
    setShowHint(false);
  }, []);

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 bg-accent-100 dark:bg-accent-900/30 rounded-full text-sm text-accent-700 dark:text-accent-300">
            📍 {exercise.context.scene}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            exercise.context.formality === 'formal'
              ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
              : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
          }`}>
            {exercise.context.formality === 'formal' ? 'Formal' : 'Informal'}
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={exercise.systemPhrase.audioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      <AnimatePresence mode="wait">
        {(phase === 'listening' || phase === 'responding') && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <SystemPhraseCard
              exercise={exercise}
              audioProgress={audioProgress}
              isPlaying={isPlaying}
              onPlayAudio={playSystemAudio}
            />

            {phase === 'responding' && (
              <RespondingPhase
                exercise={exercise}
                silenceTimer={silenceTimer}
                showHint={showHint}
                showHints={showHints}
                config={config}
                onRecordingStart={handleRecordingStart}
                onRecordingComplete={handleRecordingComplete}
                onToggleHint={() => setShowHint(!showHint)}
              />
            )}

            {phase === 'listening' && !isPlaying && audioProgress === 0 && (
              <div className="text-center">
                <button
                  onClick={playSystemAudio}
                  className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl font-medium transition-colors"
                >
                  🔊 Escuchar
                </button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'recording' && <RecordingPhase />}

        {phase === 'feedback' && evaluationResult && (
          <FeedbackDisplay
            evaluationResult={evaluationResult}
            onRetry={handleRetry}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>

      {onSkip && phase !== 'feedback' && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-sm text-calm-text-muted hover:text-calm-text-secondary dark:text-calm-text-muted dark:hover:text-calm-text-tertiary"
          >
            Saltar ejercicio
          </button>
        </div>
      )}
    </div>
  );
}

export default ConversationalEchoExercise;
