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
        <h3 className="text-lg font-semibold text-calm-text-primary dark:text-white">
          🎧 Escucha el diálogo completo
        </h3>
        <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mt-1">
          Después practicarás tus líneas
        </p>
      </div>

      <DialogueList dialogue={exercise.dialogue} />

      {isPlaying && (
        <div className="text-center text-sm text-accent-600 dark:text-accent-400">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            Reproduciendo...
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onPlayFullDialogue}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-calm-warm-100 dark:disabled:bg-calm-bg-tertiary text-white rounded-2xl font-medium transition-colors"
        >
          🔊 Escuchar Todo
        </button>
        <button
          onClick={onStartPractice}
          disabled={isPlaying}
          className="flex-1 px-4 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-calm-warm-100 dark:disabled:bg-calm-bg-tertiary text-white rounded-2xl font-medium transition-colors"
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
    <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-4 space-y-3 border border-calm-warm-100 dark:border-calm-warm-200">
      {dialogue.map((turn) => {
        const isUserTurn = turn.speaker === 'user';
        return (
          <div
            key={`dialogue-turn-${turn.speaker}-${turn.text.slice(0, 20)}`}
            className={`flex gap-3 ${isUserTurn ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
              ${isUserTurn
                ? 'bg-accent-100 dark:bg-accent-900/50'
                : 'bg-accent-100 dark:bg-accent-900/50'
              }
            `}>
              {isUserTurn ? '👤' : '🎭'}
            </div>
            <div className={`
              flex-1 p-3 rounded-lg
              ${isUserTurn
                ? 'bg-accent-50 dark:bg-accent-900/20 text-right'
                : 'bg-calm-bg-primary dark:bg-calm-bg-tertiary/50'
              }
            `}>
              <p className="text-calm-text-primary dark:text-white text-sm">
                {turn.text}
              </p>
              <p className="text-calm-text-muted dark:text-calm-text-muted text-xs mt-1">
                {turn.translation}
              </p>
              {isUserTurn && (
                <span className="inline-block mt-1 text-xs text-accent-600 dark:text-accent-400">
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
