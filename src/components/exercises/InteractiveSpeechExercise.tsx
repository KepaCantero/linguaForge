'use client';

import { useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InteractiveSpeech, SpeechRecordingResult, InteractiveSpeechResult } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useInteractiveSpeechFlow } from './hooks/useInteractiveSpeechFlow';
import { SystemSpeakPhase } from './interactive/SystemSpeakPhase';
import { ResponsePhase } from './interactive/ResponsePhase';
import { CompletePhase } from './interactive/CompletePhase';

interface InteractiveSpeechExerciseProps {
  exercise: InteractiveSpeech;
  onComplete: (result: InteractiveSpeechResult) => void;
  onSkip?: () => void;
  className?: string;
}

export function InteractiveSpeechExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: InteractiveSpeechExerciseProps) {
  const { addXP } = useGamificationStore();
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const flow = useInteractiveSpeechFlow({ exercise, onComplete });

  // Audio playback effect
  useEffect(() => {
    if (flow.currentStep?.type === 'system_speak') {
      const audio = audioRefs.current[flow.currentStepIndex];
      if (audio) {
        flow.setIsPlaying(true);
        audio.onended = () => {
          flow.setIsPlaying(false);
          flow.setPhase('waiting_response');
          flow.setResponseStartTime(Date.now());
        };
        audio.currentTime = 0;
        audio.play().catch(() => {
          flow.setIsPlaying(false);
          flow.setPhase('waiting_response');
          flow.setResponseStartTime(Date.now());
        });
      } else {
        flow.setPhase('waiting_response');
        flow.setResponseStartTime(Date.now());
      }
    }
  }, [flow.currentStep, flow.currentStepIndex, flow]);

  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const result = flow.handleRecordingComplete(recording);
    addXP(result.xp);
  }, [flow, addXP]);

  const handleReplay = useCallback(() => {
    const audio = audioRefs.current[flow.currentStepIndex];
    if (audio && !flow.isPlaying) {
      flow.setIsPlaying(true);
      audio.onended = () => flow.setIsPlaying(false);
      audio.currentTime = 0;
      audio.play();
    }
  }, [flow.currentStepIndex, flow.isPlaying, flow]);

  const totalSteps = exercise.conversationFlow.length;
  const progress = ((flow.currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {exercise.conversationFlow.map((step) => (
        <audio
          key={`audio-${step.audioUrl}`}
          ref={el => { audioRefs.current[exercise.conversationFlow.indexOf(step)] = el; }}
          src={step.audioUrl}
          preload="auto"
        />
      ))}

      <ProgressBar currentStepIndex={flow.currentStepIndex} totalSteps={totalSteps} progress={progress} />

      <AnimatePresence mode="wait">
        {flow.phase === 'system_speak' && flow.currentStep && (
          <SystemSpeakPhase
            currentStep={flow.currentStep}
            currentStepIndex={flow.currentStepIndex}
            isPlaying={flow.isPlaying}
          />
        )}

        {(flow.phase === 'waiting_response' || flow.phase === 'recording') && flow.currentStep && (
          <ResponsePhase
            exercise={exercise}
            currentStep={flow.currentStep}
            currentStepIndex={flow.currentStepIndex}
            silenceTimer={flow.silenceTimer}
            showHint={flow.showHint}
            showExample={flow.showExample}
            isPlaying={flow.isPlaying}
            getExpectedResponses={flow.getExpectedResponses}
            onRecordingComplete={handleRecordingComplete}
            onRecordingStart={flow.handleRecordingStart}
            onReplay={handleReplay}
            onSkip={flow.handleSkipTurn}
          />
        )}

        {flow.phase === 'complete' && (
          <CompletePhase turnResults={flow.turnResults} exercise={exercise} />
        )}
      </AnimatePresence>

      {onSkip && flow.phase !== 'complete' && (
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

interface ProgressBarProps {
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
}

function ProgressBar({ currentStepIndex, totalSteps, progress }: ProgressBarProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs text-calm-text-muted dark:text-calm-text-muted mb-1">
        <span>Paso {currentStepIndex + 1} de {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export default InteractiveSpeechExercise;
