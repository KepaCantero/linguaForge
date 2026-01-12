import { motion } from 'framer-motion';
import { RhythmVisualizer, RhythmFeedback } from '@/components/shared/RhythmVisualizer';
import type { IntonationEvaluationResult } from '@/types';

interface ComparingPhaseProps {
  result: IntonationEvaluationResult;
  nativePattern: number[];
  onContinue: () => void;
  onRetry: () => void;
  hasNextTurn: boolean;
}

export function ComparingPhase({
  result,
  nativePattern,
  onContinue,
  onRetry,
  hasNextTurn
}: ComparingPhaseProps) {
  return (
    <motion.div
      key="comparing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <ResultHeader result={result} />

      <RhythmVisualizer
        nativePattern={nativePattern}
        userPattern={result.rhythmAnalysis.pattern}
      />

      <RhythmFeedback
        similarity={result.rhythmAnalysis.overallSimilarity}
      />

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-aaa-xl font-medium transition-colors"
        >
          🔁 Reintentar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-aaa-xl font-medium transition-colors"
        >
          {hasNextTurn ? 'Siguiente →' : 'Finalizar'}
        </button>
      </div>
    </motion.div>
  );
}

interface ResultHeaderProps {
  result: IntonationEvaluationResult;
}

function ResultHeader({ result }: ResultHeaderProps) {
  const getIcon = () => {
    if (result.rhythmAnalysis.overallSimilarity >= 0.8) return '🎯';
    if (result.rhythmAnalysis.overallSimilarity >= 0.5) return '👍';
    return '💡';
  };

  const getTitle = () => {
    if (result.rhythmAnalysis.overallSimilarity >= 0.8) return '¡Excelente entonación!';
    if (result.rhythmAnalysis.overallSimilarity >= 0.5) return 'Buen intento';
    return 'Sigue practicando';
  };

  return (
    <div className={`rounded-aaa-xl p-6 text-center ${
      result.rhythmAnalysis.overallSimilarity >= 0.7
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-amber-50 dark:bg-amber-900/20'
    }`}>
      <span className="text-4xl">{getIcon()}</span>
      <p className={`text-lg font-semibold mt-2 ${
        result.rhythmAnalysis.overallSimilarity >= 0.7
          ? 'text-emerald-800 dark:text-emerald-200'
          : 'text-amber-800 dark:text-amber-200'
      }`}>
        {getTitle()}
      </p>
      {result.xpEarned > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
          +{result.xpEarned} XP
        </p>
      )}
    </div>
  );
}
