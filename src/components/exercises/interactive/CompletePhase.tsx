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
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        ¡Conversación completada!
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-aaa-xl p-4 mt-6 inline-block">
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
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {turnResults.length}/{userTurnsCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Turnos completados
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {avgResponseTime}s
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tiempo promedio
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
      <span className="text-sm text-gray-600 dark:text-gray-400">Fluidez:</span>
      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${avgFluency}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {avgFluency}%
      </span>
    </div>
  );
}
