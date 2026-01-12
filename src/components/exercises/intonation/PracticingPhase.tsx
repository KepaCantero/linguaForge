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
  currentTurnWords,
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
          className="flex-1 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-indigo-700 dark:text-indigo-300 rounded-aaa-xl font-medium transition-colors"
        >
          🔊 Contexto
        </button>
        <button
          onClick={onPlayExample}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-emerald-700 dark:text-emerald-300 rounded-aaa-xl font-medium transition-colors"
        >
          👂 Ejemplo
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-4">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {currentUserTurn?.text}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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

function TurnProgress({ currentTurnIndex, totalUserTurns, currentUserTurn }: TurnProgressProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Turno {currentTurnIndex + 1} de {totalUserTurns}
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-indigo-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentTurnIndex + 1) / totalUserTurns) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
