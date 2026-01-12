'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DialogueIntonation } from '@/schemas/content';
import type { IntonationEvaluationResult, SpeechRecordingResult } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { evaluateIntonationTurn, getNativePattern as getNativePatternService } from '@/services/intonationEvaluationService';
import { PreviewPhase } from './intonation/PreviewPhase';
import { PracticingPhase } from './intonation/PracticingPhase';
import { ComparingPhase } from './intonation/ComparingPhase';

interface DialogueIntonationExerciseProps {
  exercise: DialogueIntonation;
  onComplete: (results: IntonationEvaluationResult[]) => void;
  onSkip?: () => void;
  className?: string;
}

type Phase = 'preview' | 'practicing' | 'comparing' | 'complete';

export function DialogueIntonationExercise({
  exercise,
  onComplete,
  onSkip,
  className = '',
}: DialogueIntonationExerciseProps) {
  const { addXP, addGems } = useGamificationStore();

  const [phase, setPhase] = useState<Phase>('preview');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRhythmPattern, setUserRhythmPattern] = useState<number[]>([]);
  const [currentSimilarity, setCurrentSimilarity] = useState<number>(0);
  const [turnResults, setTurnResults] = useState<IntonationEvaluationResult[]>([]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const userTurnIndices = exercise.userTurns ||
    exercise.dialogue
      .map((turn, i) => turn.speaker === 'user' ? i : -1)
      .filter(i => i >= 0);

  const getCurrentUserTurn = useCallback(() => {
    const dialogueIndex = userTurnIndices[currentTurnIndex];
    return dialogueIndex !== undefined ? exercise.dialogue[dialogueIndex] : null;
  }, [currentTurnIndex, userTurnIndices, exercise.dialogue]);

  const getNativePattern = useCallback((turnIdx: number): number[] => {
    const dialogueIndex = userTurnIndices[turnIdx];
    const turn = exercise.dialogue[dialogueIndex];
    if (!turn) return [];

    return getNativePatternService(
      turnIdx,
      exercise.rhythmPatterns,
      dialogueIndex,
      turn.text,
      turn.duration
    );
  }, [exercise, userTurnIndices]);

  const playFullDialogue = useCallback(async () => {
    setIsPlaying(true);

    for (let i = 0; i < exercise.dialogue.length; i++) {
      const audio = audioRefs.current[i];
      if (audio) {
        await new Promise<void>((resolve) => {
          const handleEnd = () => {
            audio.removeEventListener('ended', handleEnd);
            resolve();
          };
          audio.addEventListener('ended', handleEnd);
          audio.currentTime = 0;
          audio.play().catch(() => resolve());
        });
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    setIsPlaying(false);
  }, [exercise.dialogue]);

  const playContext = useCallback(async () => {
    const dialogueIndex = userTurnIndices[currentTurnIndex];
    if (dialogueIndex === undefined) return;

    setIsPlaying(true);

    for (let i = 0; i < dialogueIndex; i++) {
      const turn = exercise.dialogue[i];
      if (turn.speaker === 'system') {
        const audio = audioRefs.current[i];
        if (audio) {
          await new Promise<void>((resolve) => {
            const handleEnd = () => {
              audio.removeEventListener('ended', handleEnd);
              resolve();
            };
            audio.addEventListener('ended', handleEnd);
            audio.currentTime = 0;
            audio.play().catch(() => resolve());
          });
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    setIsPlaying(false);
  }, [currentTurnIndex, userTurnIndices, exercise.dialogue]);

  const playCurrentTurnExample = useCallback(() => {
    const dialogueIndex = userTurnIndices[currentTurnIndex];
    const audio = audioRefs.current[dialogueIndex];
    if (audio) {
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.currentTime = 0;
      audio.play();
    }
  }, [currentTurnIndex, userTurnIndices]);

  const handleStartPractice = useCallback(() => {
    setCurrentTurnIndex(0);
    setTurnResults([]);
    setPhase('practicing');
  }, []);

  const handleRecordingComplete = useCallback((recording: SpeechRecordingResult) => {
    const currentTurn = getCurrentUserTurn();
    if (!currentTurn) return;

    const nativePattern = getNativePattern(currentTurnIndex);
    const baseResult = evaluateIntonationTurn(
      recording.duration,
      currentTurn.text,
      nativePattern,
      () => 0 // Placeholder for calculateRhythmSimilarity
    );

    const result: IntonationEvaluationResult = {
      ...baseResult,
      turnIndex: userTurnIndices[currentTurnIndex],
    };

    setUserRhythmPattern(result.rhythmAnalysis.pattern);
    setCurrentSimilarity(result.rhythmAnalysis.overallSimilarity);

    addXP(result.xpEarned);
    if (result.rhythmAnalysis.overallSimilarity >= 0.8) {
      addGems(2);
    }

    setTurnResults(prev => [...prev, result]);
    setPhase('comparing');
  }, [getCurrentUserTurn, getNativePattern, currentTurnIndex, userTurnIndices, addXP, addGems]);

  const handleContinue = useCallback(() => {
    if (currentTurnIndex < userTurnIndices.length - 1) {
      setCurrentTurnIndex(prev => prev + 1);
      setUserRhythmPattern([]);
      setCurrentSimilarity(0);
      setPhase('practicing');
    } else {
      setPhase('complete');
      onComplete(turnResults);
    }
  }, [currentTurnIndex, userTurnIndices.length, turnResults, onComplete]);

  const handleRetry = useCallback(() => {
    setTurnResults(prev => prev.slice(0, -1));
    setUserRhythmPattern([]);
    setCurrentSimilarity(0);
    setPhase('practicing');
  }, []);

  const currentUserTurn = getCurrentUserTurn();
  const currentNativePattern = getNativePattern(currentTurnIndex);
  const currentTurnWords = currentUserTurn?.text.split(/\s+/) || [];

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {exercise.dialogue.map((turn, i) => (
        <audio
          key={i}
          ref={el => { audioRefs.current[i] = el; }}
          src={turn.audioUrl}
          preload="auto"
        />
      ))}

      <AnimatePresence mode="wait">
        {phase === 'preview' && (
          <PreviewPhase
            exercise={exercise}
            isPlaying={isPlaying}
            onPlayFullDialogue={playFullDialogue}
            onStartPractice={handleStartPractice}
          />
        )}

        {phase === 'practicing' && currentUserTurn && (
          <PracticingPhase
            exercise={exercise}
            currentTurnIndex={currentTurnIndex}
            currentUserTurn={currentUserTurn}
            currentTurnWords={currentTurnWords}
            isPlaying={isPlaying}
            onPlayContext={playContext}
            onPlayExample={playCurrentTurnExample}
            onRecordingComplete={handleRecordingComplete}
            onRecordingStart={() => {}}
          />
        )}

        {phase === 'comparing' && turnResults.length > 0 && (
          <ComparingPhase
            result={turnResults[turnResults.length - 1]}
            nativePattern={currentNativePattern}
            onContinue={handleContinue}
            onRetry={handleRetry}
            hasNextTurn={currentTurnIndex < userTurnIndices.length - 1}
          />
        )}

        {phase === 'complete' && (
          <CompletePhase turnResults={turnResults} />
        )}
      </AnimatePresence>

      {onSkip && phase !== 'complete' && phase !== 'comparing' && (
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

interface CompletePhaseProps {
  turnResults: IntonationEvaluationResult[];
}

function CompletePhase({ turnResults }: CompletePhaseProps) {
  const averageSimilarity = turnResults.length > 0
    ? Math.round(
        turnResults.reduce((sum, r) => sum + r.rhythmAnalysis.overallSimilarity, 0) /
        turnResults.length
      )
    : 0;

  const totalXP = turnResults.reduce((sum, r) => sum + r.xpEarned, 0);

  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        ¡Diálogo completado!
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Practicaste {turnResults.length} turnos de conversación
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-aaa-xl p-4 inline-block">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {averageSimilarity}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Similitud promedio
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{totalXP}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              XP ganado
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DialogueIntonationExercise;
