import { motion } from 'framer-motion';
import type { ConversationalEcho } from '@/schemas/content';

interface SystemPhraseCardProps {
  exercise: ConversationalEcho;
  audioProgress: number;
  isPlaying: boolean;
  onPlayAudio: () => void;
}

export function SystemPhraseCard({ exercise, audioProgress, isPlaying, onPlayAudio }: SystemPhraseCardProps) {
  return (
    <div className="bg-white dark:bg-calm-bg-elevated rounded-2xl p-5 shadow-md border border-calm-warm-100 dark:border-calm-warm-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center text-xl flex-shrink-0">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mb-1">
            {getRoleLabel(exercise.context.role)}
          </p>
          <p className="text-lg font-medium text-calm-text-primary dark:text-white break-words">
            {exercise.systemPhrase.text}
          </p>
          <p className="text-sm text-calm-text-muted dark:text-calm-text-muted mt-1">
            {exercise.systemPhrase.translation}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPlayAudio}
          disabled={isPlaying}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0
            ${isPlaying
              ? 'bg-accent-500 text-white'
              : 'bg-calm-bg-secondary dark:bg-calm-bg-tertiary hover:bg-accent-100 dark:hover:bg-accent-900/50 text-calm-text-secondary dark:text-calm-text-tertiary'
            }
          `}
        >
          {isPlaying ? '🔊' : '▶️'}
        </button>
        <div className="flex-1 h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-500 rounded-full"
            animate={{ width: `${audioProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="text-xs text-calm-text-muted font-mono flex-shrink-0">
          {exercise.systemPhrase.duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    host: 'Anfitrión',
    guest: 'Invitado',
    waiter: 'Camarero',
    customer: 'Cliente',
    other: 'Otro',
  };
  return labels[role] || role;
}
