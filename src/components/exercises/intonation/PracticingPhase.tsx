import { motion } from 'framer-motion';
import type { DialogueIntonation } from '@/schemas/content';
import type { SpeechRecordingResult } from '@/types';
import { SpeechRecorder } from '@/components/shared/SpeechRecorder';

interface PracticingPhaseProps {
  exercise: DialogueIntonation;
  currentTurnIndex: number;
  currentUserTurn: DialogueIntonation['dialogue'][number] | null;
  currentTurnWords: string[];
  isPlaying: boolean;
  onPlayContext: () => void;
  onPlayExample: () => void;
  onRecordingComplete: (recording: SpeechRecordingResult) => void;
  onRecordingStart: () => void;
}

export function PracticingPhase({
  exercise,
  currentTurnIndex,
  currentUserTurn,
  currentTurnWords: _currentTurnWords,
  isPlaying,
  onPlayContext,
  onPlayExample,
  onRecordingComplete,
  onRecordingStart,
}: PracticingPhaseProps) {
  const totalUserTurns = exercise.userTurns?.length ||
    exercise.dialogue.filter(t => t.speaker === 'user').length;

  return (
    <motion.div
      key="practicing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <TurnProgress
        currentTurnIndex={currentTurnIndex}
        totalUserTurns={totalUserTurns}
        currentUserTurn={currentUserTurn}
      />

      <div className="flex gap-3">
        <button
          onClick={onPlayContext}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-accent-100 dark:bg-accent-900/30 hover:bg-accent-200 dark:hover:bg-accent-900/50 disabled:bg-calm-bg-secondary dark:disabled:bg-calm-bg-elevated text-accent-700 dark:text-accent-300 rounded-2xl font-medium transition-colors"
        >
          🔊 Contexto
        </button>
        <button
          onClick={onPlayExample}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-accent-100 dark:bg-accent-900/30 hover:bg-accent-200 dark:hover:bg-accent-900/50 disabled:bg-calm-bg-secondary dark:disabled:bg-calm-bg-elevated text-accent-700 dark:text-accent-300 rounded-2xl font-medium transition-colors"
        >
          👂 Ejemplo
        </button>
      </div>

      <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-6 border border-calm-warm-100 dark:border-calm-warm-200">
        <div className="text-center mb-4">
          <p className="text-lg font-medium text-calm-text-primary dark:text-white">
            {currentUserTurn?.text}
          </p>
          <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mt-2">
            {currentUserTurn?.translation}
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <SpeechRecorder
            onRecordingComplete={onRecordingComplete}
            onRecordingStart={onRecordingStart}
            config={{ maxDuration: 10 }}
            showWaveform
          />
        </div>
      </div>
    </motion.div>
  );
}

interface TurnProgressProps {
  currentTurnIndex: number;
  totalUserTurns: number;
  currentUserTurn: DialogueIntonation['dialogue'][number] | null;
}

function TurnProgress({ currentTurnIndex, totalUserTurns, currentUserTurn: _currentUserTurn }: TurnProgressProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mb-2">
        Turno {currentTurnIndex + 1} de {totalUserTurns}
      </p>
      <div className="w-full bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-accent-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentTurnIndex + 1) / totalUserTurns) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
