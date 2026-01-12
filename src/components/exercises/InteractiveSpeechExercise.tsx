'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InteractiveSpeech, InteractiveSpeechResult, SpeechTurnResult, SpeechRecordingResult } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import {
  calculateFluencyScore,
  createSpeechTurnResult,
  createExerciseResult,
  XP_VALUES,
} from '@/services/interactiveSpeechTimerService';
import { SystemSpeakPhase } from './interactive/SystemSpeakPhase';
import { ResponsePhase } from './interactive/ResponsePhase';
import { CompletePhase } from './interactive/CompletePhase';

interface InteractiveSpeechExerciseProps {
  exercise: InteractiveSpeech;
  onComplete: (result: InteractiveSpeechResult) => void;
  onSkip?: () => void;
  className?: string;
}

type Phase = 'system_speak' | 'waiting_response' | 'recording' | 'feedback' | 'complete';

export function InteractiveSpeechExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: InteractiveSpeechExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<Phase>('system_speak');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [turnResults, setTurnResults] = useState<SpeechTurnResult[]>([]);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exampleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = exercise.conversationFlow[currentStepIndex];
  const silenceConfig = useMemo(() => exercise.silenceHandling || {
    hintAfter: 3,
    exampleAfter: 6,
    autoPromptAfter: 10,
  }, [exercise.silenceHandling]);

  useEffect(() => {
    if (currentStep?.type === 'system_speak') {
      const audio = audioRefs.current[currentStepIndex];
      if (audio) {
        setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          setPhase('waiting_response');
          setResponseStartTime(Date.now());
        };
        audio.currentTime = 0;
        audio.play().catch(() => {
          setIsPlaying(false);
          setPhase('waiting_response');
          setResponseStartTime(Date.now());
        });
      } else {
        setPhase('waiting_response');
        setResponseStartTime(Date.now());
      }
    }
  }, [currentStep, currentStepIndex]);

  const cancelTimers = useCallback(() => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    if (exampleTimeoutRef.current) clearTimeout(exampleTimeoutRef.current);
    setSilenceTimer(null);
  }, []);

  useEffect(() => {
    return () => {
      cancelTimers();
    };
  }, [cancelTimers]);

  const startWaitingForResponse = useCallback(() => {
    setPhase('waiting_response');
    setResponseStartTime(Date.now());
    setShowHint(false);
    setShowExample(false);

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    if (exampleTimeoutRef.current) clearTimeout(exampleTimeoutRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    let countdown = silenceConfig.autoPromptAfter;
    setSilenceTimer(countdown);

    const tick = () => {
      countdown--;
      setSilenceTimer(countdown);

      if (countdown <= 0) {
        cancelTimers();
        if (currentStepIndex < exercise.conversationFlow.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setPhase('complete');
          cancelTimers();
          setTimeout(() => {
            onComplete({
              completedTurns: turnResults.length,
              totalTurns: exercise.conversationFlow.filter(
                s => s.type === 'user_response' || s.type === 'closing'
              ).length,
              averageResponseTime: 0,
              overallFluency: 0,
              xpEarned: XP_VALUES.completion,
            });
          }, 2000);
        }
      } else {
        silenceTimeoutRef.current = setTimeout(tick, 1000);
      }
    };
    silenceTimeoutRef.current = setTimeout(tick, 1000);

    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(true);
    }, silenceConfig.hintAfter * 1000);

    exampleTimeoutRef.current = setTimeout(() => {
      setShowExample(true);
    }, silenceConfig.exampleAfter * 1000);
  }, [silenceConfig, currentStepIndex, exercise, turnResults, cancelTimers, onComplete]);

  const completeExercise = useCallback(() => {
    setPhase('complete');
    cancelTimers();

    const result = createExerciseResult(turnResults, exercise);
    addXP(XP_VALUES.completion);
    if (result.overallFluency >= 80) {
      addGems(5);
    }

    setTimeout(() => {
      onComplete(result);
    }, 2000);
  }, [turnResults, exercise, cancelTimers, addXP, addGems, onComplete]);

  const advanceToNextStep = useCallback(() => {
    if (currentStepIndex < exercise.conversationFlow.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeExercise();
    }
  }, [currentStepIndex, exercise.conversationFlow.length, completeExercise]);

  const handleRecordingStart = useCallback(() => {
    cancelTimers();
    setPhase('recording');
  }, [cancelTimers]);

  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const responseTime = Date.now() - responseStartTime;
    const transcript = recording.transcript?.toLowerCase() || '';
    const expectedResponses = currentStep?.expectedResponses || currentStep?.closingPhrases || [];
    const isValid = expectedResponses.some(expected => {
      const expectedWords = expected.toLowerCase().split(/\s+/);
      const matchCount = expectedWords.filter(w => transcript.includes(w)).length;
      return matchCount >= expectedWords.length * 0.5;
    });

    const turnResult = createSpeechTurnResult(currentStepIndex, responseTime, transcript, isValid);
    setTurnResults(prev => [...prev, turnResult]);

    const { xp } = calculateFluencyScore(responseTime);
    addXP(xp);

    advanceToNextStep();
  }, [currentStep, currentStepIndex, responseStartTime, addXP, advanceToNextStep]);

  const handleSkipTurn = useCallback(() => {
    cancelTimers();
    advanceToNextStep();
  }, [cancelTimers, advanceToNextStep]);

  const handleReplay = useCallback(() => {
    const audio = audioRefs.current[currentStepIndex];
    if (audio && !isPlaying) {
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.currentTime = 0;
      audio.play();
    }
  }, [currentStepIndex, isPlaying]);

  const getExpectedResponses = useCallback((): string[] => {
    if (currentStep?.type === 'closing' && currentStep.closingPhrases) {
      return currentStep.closingPhrases;
    }
    return currentStep?.expectedResponses || [];
  }, [currentStep]);

  const totalSteps = exercise.conversationFlow.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {exercise.conversationFlow.map((step, i) => (
        <audio
          key={i}
          ref={el => { audioRefs.current[i] = el; }}
          src={step.audioUrl}
          preload="auto"
        />
      ))}

      <ProgressBar currentStepIndex={currentStepIndex} totalSteps={totalSteps} progress={progress} />

      <AnimatePresence mode="wait">
        {phase === 'system_speak' && currentStep && (
          <SystemSpeakPhase
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            isPlaying={isPlaying}
          />
        )}

        {(phase === 'waiting_response' || phase === 'recording') && currentStep && (
          <ResponsePhase
            exercise={exercise}
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            silenceTimer={silenceTimer}
            showHint={showHint}
            showExample={showExample}
            isPlaying={isPlaying}
            getExpectedResponses={getExpectedResponses}
            onRecordingComplete={handleRecordingComplete}
            onRecordingStart={handleRecordingStart}
            onReplay={handleReplay}
            onSkip={handleSkipTurn}
          />
        )}

        {phase === 'complete' && (
          <CompletePhase turnResults={turnResults} exercise={exercise} />
        )}
      </AnimatePresence>

      {onSkip && phase !== 'complete' && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Paso {currentStepIndex + 1} de {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export default InteractiveSpeechExercise;
