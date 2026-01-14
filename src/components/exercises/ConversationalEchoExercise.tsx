'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationalEcho } from '@/schemas/content';
import type { EchoEvaluationResult, SpeechRecordingResult } from '@/types';
import { evaluateConversationalEcho, createTimeoutResult } from '@/services/exerciseEvaluationService';
import { useExerciseGamification } from './hooks/useExerciseGamification';
import { useSilenceDetection } from './hooks/useExerciseAudio';
import { useExercisePhase } from './hooks/useExerciseState';
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

const PHASES = {
  listening: 'listening' as const,
  responding: 'responding' as const,
  recording: 'recording' as const,
  feedback: 'feedback' as const,
};

export type ExercisePhase = keyof typeof PHASES;

export function ConversationalEchoExercise({
  exercise,
  onComplete,
  onSkip,
  showHints = true,
  className = '',
}: ConversationalEchoExerciseProps) {
  const { grantReward } = useExerciseGamification();
  const { phase, setPhase, isPhase } = useExercisePhase<ExercisePhase>('listening');

  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EchoEvaluationResult | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const config = exercise.config || {
    maxRecordingTime: 5,
    silenceTimeout: 3,
    showHint: true,
  };

  // Silencio detection hook
  const silenceDetection = useSilenceDetection({
    silenceTimeout: config.silenceTimeout,
    onSilenceTimeout: () => {
      const result = createTimeoutResult();
      setEvaluationResult(result);
      setPhase('feedback');
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      silenceDetection.stop();
    };
  }, [silenceDetection]);

  // Play system audio
  const playSystemAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // Handle audio time update
  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  }, []);

  // Handle audio ended - start silence detection
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setAudioProgress(100);
    setPhase('responding');
    silenceDetection.start();
  }, [setPhase, silenceDetection]);

  // Handle recording start - stop silence detection
  const handleRecordingStart = useCallback(() => {
    silenceDetection.stop();
    setPhase('recording');
  }, [silenceDetection, setPhase]);

  // Handle recording complete
  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const result = evaluateConversationalEcho(recording, exercise);
    setEvaluationResult(result);
    setPhase('feedback');

    if (result.xpEarned > 0) {
      grantReward({
        baseXP: result.xpEarned,
        gems: result.feedback.type === 'perfect' ? 2 : 0,
      });
    }
  }, [exercise, grantReward, setPhase]);

  // Handle continue
  const handleContinue = useCallback(() => {
    if (evaluationResult) {
      onComplete(evaluationResult);
    }
  }, [evaluationResult, onComplete]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setPhase('listening');
    setAudioProgress(0);
    setEvaluationResult(null);
    silenceDetection.stop();
  }, [setPhase, silenceDetection]);

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
        {(isPhase('listening') || isPhase('responding')) && (
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

            {isPhase('responding') && (
              <RespondingPhase
                exercise={exercise}
                silenceTimer={silenceDetection.timeUntilTimeout}
                showHint={false}
                showHints={showHints}
                config={config}
                onRecordingStart={handleRecordingStart}
                onRecordingComplete={handleRecordingComplete}
                onToggleHint={() => {}}
              />
            )}

            {isPhase('listening') && !isPlaying && audioProgress === 0 && (
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

        {isPhase('recording') && <RecordingPhase />}

        {isPhase('feedback') && evaluationResult && (
          <FeedbackDisplay
            evaluationResult={evaluationResult}
            onRetry={handleRetry}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>

      {onSkip && !isPhase('feedback') && (
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
