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
    <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl flex-shrink-0">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {getRoleLabel(exercise.context.role)}
          </p>
          <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
            {exercise.systemPhrase.text}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {isPlaying ? '🔊' : '▶️'}
        </button>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            animate={{ width: `${audioProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="text-xs text-gray-500 font-mono flex-shrink-0">
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
