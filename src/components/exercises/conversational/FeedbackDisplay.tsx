import { motion } from 'framer-motion';
import type { EchoEvaluationResult } from '@/types';

interface FeedbackDisplayProps {
  evaluationResult: EchoEvaluationResult;
  onRetry: () => void;
  onContinue: () => void;
}

export function FeedbackDisplay({ evaluationResult, onRetry, onContinue }: FeedbackDisplayProps) {
  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className={`rounded-2xl p-6 ${
        evaluationResult.isValid
          ? 'bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl">
            {evaluationResult.feedback.type === 'perfect' ? '✅' :
             evaluationResult.feedback.type === 'acceptable' ? '👍' :
             evaluationResult.feedback.type === 'poor' ? '💡' :
             evaluationResult.feedback.type === 'out_of_context' ? '❓' : '⏱️'}
          </span>
          <div className="flex-1">
            <p className={`font-medium text-lg ${
              evaluationResult.isValid
                ? 'text-accent-800 dark:text-accent-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {evaluationResult.feedback.message}
            </p>

            {evaluationResult.matchedResponse && (
              <p className="text-sm text-calm-text-secondary dark:text-calm-text-muted mt-1">
                Detectamos: &quot;{evaluationResult.matchedResponse}&quot;
              </p>
            )}

            {evaluationResult.feedback.tip && (
              <p className="text-sm mt-2 text-calm-text-secondary dark:text-calm-text-muted">
                💡 {evaluationResult.feedback.tip}
              </p>
            )}
          </div>
        </div>

        <ScoreDisplay evaluationResult={evaluationResult} />

        {evaluationResult.xpEarned > 0 && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 font-medium">
              +{evaluationResult.xpEarned} XP
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!evaluationResult.isValid && (
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-3 bg-calm-bg-secondary dark:bg-calm-bg-elevated hover:bg-calm-bg-tertiary dark:hover:bg-calm-bg-tertiary text-calm-text-secondary dark:text-calm-text-tertiary rounded-2xl font-medium transition-colors"
          >
            🔁 Reintentar
          </button>
        )}
        <button
          onClick={onContinue}
          className="flex-1 px-4 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl font-medium transition-colors"
        >
          Continuar →
        </button>
      </div>
    </motion.div>
  );
}

interface ScoreDisplayProps {
  evaluationResult: EchoEvaluationResult;
}

function ScoreDisplay({ evaluationResult }: ScoreDisplayProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="bg-white/50 dark:bg-calm-bg-elevated/50 rounded-lg p-3">
        <p className="text-xs text-calm-text-muted dark:text-calm-text-muted mb-1">INTENCIÓN</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all"
              style={{ width: `${evaluationResult.scores.intention}%` }}
            />
          </div>
          <span className="text-sm font-medium text-calm-text-secondary dark:text-calm-text-tertiary">
            {Math.round(evaluationResult.scores.intention)}%
          </span>
        </div>
      </div>
      <div className="bg-white/50 dark:bg-calm-bg-elevated/50 rounded-lg p-3">
        <p className="text-xs text-calm-text-muted dark:text-calm-text-muted mb-1">RITMO</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all"
              style={{ width: `${evaluationResult.scores.rhythm}%` }}
            />
          </div>
          <span className="text-sm font-medium text-calm-text-secondary dark:text-calm-text-tertiary">
            {Math.round(evaluationResult.scores.rhythm)}%
          </span>
        </div>
      </div>
    </div>
  );
}
