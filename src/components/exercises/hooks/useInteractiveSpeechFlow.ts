/**
 * useInteractiveSpeechFlow - Custom hook para manejar el flujo de conversación
 * y timers en Interactive Speech Exercise
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { InteractiveSpeech, SpeechTurnResult, SpeechRecordingResult } from '@/types';
import {
  calculateFluencyScore,
  createSpeechTurnResult,
  createExerciseResult,
  XP_VALUES,
} from '@/services/interactiveSpeechTimerService';

type Phase = 'system_speak' | 'waiting_response' | 'recording' | 'feedback' | 'complete';

interface UseInteractiveSpeechFlowProps {
  exercise: InteractiveSpeech;
  onComplete: (result: any) => void;
}

export function useInteractiveSpeechFlow({ exercise, onComplete }: UseInteractiveSpeechFlowProps) {
  const [phase, setPhase] = useState<Phase>('system_speak');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [turnResults, setTurnResults] = useState<SpeechTurnResult[]>([]);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exampleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = exercise.conversationFlow[currentStepIndex];

  const silenceConfig = useMemo(() => exercise.silenceHandling || {
    hintAfter: 3,
    exampleAfter: 6,
    autoPromptAfter: 10,
  }, [exercise.silenceHandling]);

  const cancelTimers = useCallback(() => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    if (exampleTimeoutRef.current) clearTimeout(exampleTimeoutRef.current);
    setSilenceTimer(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelTimers();
    };
  }, [cancelTimers]);

  const completeExercise = useCallback(() => {
    setPhase('complete');
    cancelTimers();

    const result = createExerciseResult(turnResults, exercise);

    setTimeout(() => {
      onComplete(result);
    }, 2000);

    return result;
  }, [turnResults, exercise, cancelTimers, onComplete]);

  const advanceToNextStep = useCallback(() => {
    if (currentStepIndex < exercise.conversationFlow.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeExercise();
    }
  }, [currentStepIndex, exercise.conversationFlow.length, completeExercise]);

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
        advanceToNextStep();
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
  }, [silenceConfig, cancelTimers, advanceToNextStep]);

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

    advanceToNextStep();

    return { xp, isValid, responseTime };
  }, [currentStep, currentStepIndex, responseStartTime, advanceToNextStep]);

  const handleSkipTurn = useCallback(() => {
    cancelTimers();
    advanceToNextStep();
  }, [cancelTimers, advanceToNextStep]);

  const getExpectedResponses = useCallback((): string[] => {
    if (currentStep?.type === 'closing' && currentStep.closingPhrases) {
      return currentStep.closingPhrases;
    }
    return currentStep?.expectedResponses || [];
  }, [currentStep]);

  return {
    phase,
    setPhase,
    currentStepIndex,
    setCurrentStepIndex,
    isPlaying,
    setIsPlaying,
    turnResults,
    responseStartTime,
    setResponseStartTime,
    silenceTimer,
    setSilenceTimer,
    showHint,
    setShowHint,
    showExample,
    setShowExample,
    silenceConfig,
    currentStep,
    cancelTimers,
    startWaitingForResponse,
    handleRecordingStart,
    handleRecordingComplete,
    handleSkipTurn,
    getExpectedResponses,
    completeExercise,
    advanceToNextStep,
  };
}
