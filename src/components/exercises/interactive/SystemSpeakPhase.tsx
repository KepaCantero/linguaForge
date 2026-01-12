import { motion } from 'framer-motion';
import type { InteractiveSpeech } from '@/schemas/content';

interface SystemSpeakPhaseProps {
  currentStep: InteractiveSpeech['conversationFlow'][number];
  currentStepIndex: number;
  isPlaying: boolean;
}

export function SystemSpeakPhase({ currentStep, currentStepIndex, isPlaying }: SystemSpeakPhaseProps) {
  return (
    <motion.div
      key={`system-${currentStepIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl flex-shrink-0">
            👤
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {currentStep.text}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentStep.translation}
            </p>
          </div>
        </div>

        {isPlaying && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Reproduciendo...
          </div>
        )}
      </div>
    </motion.div>
  );
}
