import { motion } from 'framer-motion';

interface RecordingPhaseProps {
  onComplete?: () => void;
}

export function RecordingPhase({ onComplete }: RecordingPhaseProps) {
  return (
    <motion.div
      key="recording"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center py-8"
    >
      <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
        <motion.div
          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-3xl text-white">🎤</span>
        </motion.div>
      </div>
      <p className="text-lg font-medium text-gray-900 dark:text-white">
        Grabando...
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Suelta para enviar
      </p>
    </motion.div>
  );
}
