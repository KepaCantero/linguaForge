import type { InteractiveSpeechResult, SpeechTurnResult } from '@/types';
import type { InteractiveSpeech } from '@/schemas/content';

const XP_VALUES = {
  fastResponse: 20, // < 2s
  normalResponse: 15, // < 4s
  slowResponse: 10, // >= 4s
  completion: 25, // Bonus por completar
};

/**
 * Calculates fluency score based on response time
 */
export function calculateFluencyScore(responseTimeMs: number): { score: number; xp: number } {
  if (responseTimeMs < 2000) {
    return { score: 100, xp: XP_VALUES.fastResponse };
  }
  if (responseTimeMs < 4000) {
    return { score: 80, xp: XP_VALUES.normalResponse };
  }
  return { score: 60, xp: XP_VALUES.slowResponse };
}

/**
 * Creates a speech turn result
 */
export function createSpeechTurnResult(
  turnIndex: number,
  responseTimeMs: number,
  detectedText: string,
  isValidResponse: boolean
): SpeechTurnResult {
  const { score: fluencyScore } = calculateFluencyScore(responseTimeMs);

  return {
    turnIndex,
    responseTime: responseTimeMs,
    detectedText,
    isValidResponse,
    fluencyScore,
  };
}

/**
 * Calculates exercise completion stats
 */
export function calculateCompletionStats(
  turnResults: SpeechTurnResult[],
  exercise: InteractiveSpeech
): {
  completedTurns: number;
  totalTurns: number;
  averageResponseTime: number;
  overallFluency: number;
  totalXP: number;
} {
  const userTurns = turnResults.length;
  const totalUserTurns = exercise.conversationFlow.filter(
    s => s.type === 'user_response' || s.type === 'closing'
  ).length;

  const avgResponseTime = userTurns > 0
    ? turnResults.reduce((sum, r) => sum + r.responseTime, 0) / userTurns
    : 0;

  const overallFluency = userTurns > 0
    ? Math.round(turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / userTurns)
    : 0;

  const totalXP = turnResults.reduce((sum, r) => {
    const { xp } = calculateFluencyScore(r.responseTime);
    return sum + xp;
  }, 0) + XP_VALUES.completion;

  return {
    completedTurns: userTurns,
    totalTurns: totalUserTurns,
    averageResponseTime: avgResponseTime,
    overallFluency,
    totalXP,
  };
}

/**
 * Creates the final exercise result
 */
export function createExerciseResult(
  turnResults: SpeechTurnResult[],
  exercise: InteractiveSpeech
): InteractiveSpeechResult {
  const stats = calculateCompletionStats(turnResults, exercise);

  return {
    completedTurns: stats.completedTurns,
    totalTurns: stats.totalTurns,
    averageResponseTime: stats.averageResponseTime,
    overallFluency: stats.overallFluency,
    xpEarned: stats.totalXP,
  };
}

/**
 * Timeout action configuration
 */
export interface TimeoutAction {
  type: 'next_step' | 'complete';
  stepIndex?: number;
  onComplete?: (result: InteractiveSpeechResult) => void;
  turnResults: SpeechTurnResult[];
  exercise: InteractiveSpeech;
}

/**
 * Creates the action to take when timeout occurs
 */
export function createTimeoutAction(
  currentStepIndex: number,
  exercise: InteractiveSpeech,
  turnResults: SpeechTurnResult[],
  onComplete: (result: InteractiveSpeechResult) => void
): TimeoutAction {
  if (currentStepIndex < exercise.conversationFlow.length - 1) {
    return {
      type: 'next_step',
      stepIndex: currentStepIndex + 1,
      onComplete,
      turnResults,
      exercise,
    };
  }

  return {
    type: 'complete',
    onComplete,
    turnResults,
    exercise,
  };
}

/**
 * Executes a timeout action
 */
export function executeTimeoutAction(
  action: TimeoutAction,
  setCurrentStepIndex: (index: number) => void,
  setPhase: (phase: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setResponseStartTime: (time: number) => void
): void {
  if (action.type === 'next_step' && action.stepIndex !== undefined) {
    setCurrentStepIndex(action.stepIndex);
    // Note: phase setting needs to be done by caller based on next step type
  } else if (action.type === 'complete' && action.onComplete) {
    const result = createExerciseResult(action.turnResults, action.exercise);
    setPhase('complete');
    setTimeout(() => {
      action.onComplete?.(result);
    }, 2000);
  }
}

export { XP_VALUES };
