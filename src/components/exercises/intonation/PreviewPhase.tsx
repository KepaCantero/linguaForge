import { motion } from 'framer-motion';
import type { DialogueIntonation } from '@/schemas/content';

interface PreviewPhaseProps {
  exercise: DialogueIntonation;
  isPlaying: boolean;
  onPlayFullDialogue: () => void;
  onStartPractice: () => void;
}

export function PreviewPhase({ exercise, isPlaying, onPlayFullDialogue, onStartPractice }: PreviewPhaseProps) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🎧 Escucha el diálogo completo
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Después practicarás tus líneas
        </p>
      </div>

      <DialogueList dialogue={exercise.dialogue} />

      {isPlaying && (
        <div className="text-center text-sm text-indigo-600 dark:text-indigo-400">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Reproduciendo...
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onPlayFullDialogue}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-aaa-xl font-medium transition-colors"
        >
          🔊 Escuchar Todo
        </button>
        <button
          onClick={onStartPractice}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-aaa-xl font-medium transition-colors"
        >
          🎤 Practicar
        </button>
      </div>
    </motion.div>
  );
}

interface DialogueListProps {
  dialogue: DialogueIntonation['dialogue'];
}

function DialogueList({ dialogue }: DialogueListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
      {dialogue.map((turn, i) => {
        const isUserTurn = turn.speaker === 'user';
        return (
          <div
            key={i}
            className={`flex gap-3 ${isUserTurn ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
              ${isUserTurn
                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                : 'bg-indigo-100 dark:bg-indigo-900/50'
              }
            `}>
              {isUserTurn ? '👤' : '🎭'}
            </div>
            <div className={`
              flex-1 p-3 rounded-lg
              ${isUserTurn
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-right'
                : 'bg-gray-50 dark:bg-gray-700/50'
              }
            `}>
              <p className="text-gray-900 dark:text-white text-sm">
                {turn.text}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                {turn.translation}
              </p>
              {isUserTurn && (
                <span className="inline-block mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  🎤 Tu turno
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
