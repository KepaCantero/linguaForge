import { motion } from 'framer-motion';
import type { SpeechTurnResult } from '@/types';
import type { InteractiveSpeech } from '@/schemas/content';

interface CompletePhaseProps {
  turnResults: SpeechTurnResult[];
  exercise: InteractiveSpeech;
}

export function CompletePhase({ turnResults, exercise }: CompletePhaseProps) {
  const userTurnsCount = exercise.conversationFlow.filter(
    s => s.type === 'user_response' || s.type === 'closing'
  ).length;

  const avgResponseTime = turnResults.length > 0
    ? (turnResults.reduce((sum, r) => sum + r.responseTime, 0) / turnResults.length / 1000).toFixed(1)
    : '0';

  const avgFluency = turnResults.length > 0
    ? Math.round(turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / turnResults.length)
    : 0;

  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-xl font-bold text-calm-text-primary dark:text-white mb-2">
        ¡Conversación completada!
      </h3>

      <div className="bg-calm-bg-primary dark:bg-calm-bg-elevated rounded-2xl p-4 mt-6 inline-block">
        <StatsGrid
          turnResults={turnResults}
          userTurnsCount={userTurnsCount}
          avgResponseTime={avgResponseTime}
          avgFluency={avgFluency}
        />
      </div>
    </motion.div>
  );
}

interface StatsGridProps {
  turnResults: SpeechTurnResult[];
  userTurnsCount: number;
  avgResponseTime: string;
  avgFluency: number;
}

function StatsGrid({ turnResults, userTurnsCount, avgResponseTime, avgFluency }: StatsGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
            {turnResults.length}/{userTurnsCount}
          </p>
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted">
            Turnos completados
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
            {avgResponseTime}s
          </p>
          <p className="text-xs text-calm-text-muted dark:text-calm-text-muted">
            Tiempo promedio
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-calm-warm-100 dark:border-calm-warm-200">
        <FluencyDisplay avgFluency={avgFluency} />
      </div>
    </>
  );
}

interface FluencyDisplayProps {
  avgFluency: number;
}

function FluencyDisplay({ avgFluency }: FluencyDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-calm-text-secondary dark:text-calm-text-muted">Fluidez:</span>
      <div className="w-24 h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-500 rounded-full"
          style={{ width: `${avgFluency}%` }}
        />
      </div>
      <span className="text-sm font-medium text-calm-text-secondary dark:text-calm-text-tertiary">
        {avgFluency}%
      </span>
    </div>
  );
}
