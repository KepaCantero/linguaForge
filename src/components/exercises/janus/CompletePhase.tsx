import { motion } from 'framer-motion';

interface CompletePhaseProps {
  generatedPhrase: string | null;
  totalXP: number;
}

export function CompletePhase({ generatedPhrase, totalXP }: CompletePhaseProps) {
  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        ¡Ejercicio completado!
      </h3>

      {generatedPhrase && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-4 text-white mt-6 inline-block">
          <p className="text-lg font-medium">&quot;{generatedPhrase}&quot;</p>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <span className="inline-flex items-center gap-1 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 font-medium">
          +{totalXP} XP
        </span>
      </div>
    </motion.div>
  );
}
