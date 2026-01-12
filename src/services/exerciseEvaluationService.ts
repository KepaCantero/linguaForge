import type { EchoEvaluationResult, SpeechRecordingResult } from '@/types';
import type { ConversationalEcho, ConversationalEchoResponse } from '@/schemas/content';

const XP_VALUES = {
  perfect: 20,
  acceptable: 15,
  poor: 5,
  out_of_context: 0,
  timeout: 0,
};

const FEEDBACK_MESSAGES = {
  perfect: '¡Respuesta perfecta!',
  acceptable: '¡Buena respuesta!',
  poor: 'Respuesta muy corta',
  out_of_context: 'Fuera de contexto',
  timeout: 'Sin respuesta detectada',
} as const;

type FeedbackType = keyof typeof FEEDBACK_MESSAGES;

/**
 * Calculates keyword score based on matching words in transcript
 */
function calculateKeywordScore(transcript: string, keywords: string[]): number {
  const keywordsFound = keywords.filter(kw => transcript.includes(kw.toLowerCase()));
  return (keywordsFound.length / Math.max(keywords.length, 1)) * 100;
}

/**
 * Calculates intention score based on word matching
 */
function calculateIntentionScore(transcript: string, expectedText: string): number {
  const expectedWords = expectedText.toLowerCase().split(/\s+/);
  const transcriptWords = transcript.split(/\s+/);
  const matchingWords = expectedWords.filter(w => transcriptWords.includes(w));
  return (matchingWords.length / Math.max(expectedWords.length, 1)) * 100;
}

/**
 * Finds the best matching response from expected responses
 */
function findBestMatch(transcript: string, expectedResponses: ConversationalEchoResponse[]) {
  let bestMatch: { text: string; score: number; isOptimal: boolean } | null = null;

  for (const expected of expectedResponses) {
    const keywordScore = calculateKeywordScore(transcript, expected.keywords);
    const intentionScore = calculateIntentionScore(transcript, expected.text);
    const totalScore = keywordScore * 0.6 + intentionScore * 0.4;

    if (!bestMatch || totalScore > bestMatch.score) {
      bestMatch = {
        text: expected.text,
        score: totalScore,
        isOptimal: expected.isOptimal,
      };
    }
  }

  return bestMatch;
}

/**
 * Calculates rhythm score based on recording duration vs expected duration
 */
function calculateRhythmScore(actualDurationMs: number, expectedDurationSec: number): number {
  const expectedDuration = expectedDurationSec * 0.5;
  const actualDuration = actualDurationMs / 1000;
  return Math.max(0, 100 - Math.abs(expectedDuration - actualDuration) * 20);
}

/**
 * Determines feedback type and XP based on score match
 */
function determineFeedback(
  bestMatch: { text: string; score: number; isOptimal: boolean } | null,
  transcript: string,
  firstExpectedResponse: string
): { type: FeedbackType; tip?: string; xpEarned: number } {
  if (bestMatch && bestMatch.score >= 70) {
    return {
      type: bestMatch.isOptimal ? 'perfect' : 'acceptable',
      xpEarned: bestMatch.isOptimal ? XP_VALUES.perfect : XP_VALUES.acceptable,
    };
  }

  if (bestMatch && bestMatch.score >= 40) {
    return {
      type: 'acceptable',
      tip: `Buena idea. También podrías decir: "${firstExpectedResponse}"`,
      xpEarned: XP_VALUES.acceptable,
    };
  }

  if (transcript.length < 5) {
    return {
      type: 'poor',
      tip: `Intenta una respuesta más completa como: "${firstExpectedResponse}"`,
      xpEarned: XP_VALUES.poor,
    };
  }

  return {
    type: 'out_of_context',
    tip: `En esta situación, sería mejor responder: "${firstExpectedResponse}"`,
    xpEarned: XP_VALUES.out_of_context,
  };
}

/**
 * Evaluates a speech recording for conversational echo exercise
 */
export function evaluateConversationalEcho(
  recording: SpeechRecordingResult,
  exercise: ConversationalEcho
): EchoEvaluationResult {
  const transcript = recording.transcript?.toLowerCase() || '';

  const bestMatch = findBestMatch(transcript, exercise.expectedResponses);
  const rhythmScore = calculateRhythmScore(recording.duration, exercise.systemPhrase.duration);
  const { type, tip, xpEarned } = determineFeedback(
    bestMatch,
    transcript,
    exercise.expectedResponses[0].text
  );

  return {
    isValid: type === 'perfect' || type === 'acceptable',
    matchedResponse: bestMatch?.text || null,
    scores: {
      intention: bestMatch?.score || 0,
      keywords: bestMatch ? bestMatch.score * 0.6 : 0,
      rhythm: rhythmScore,
    },
    feedback: {
      type,
      message: FEEDBACK_MESSAGES[type],
      ...(tip !== undefined && { tip }),
    },
    xpEarned,
  };
}

/**
 * Creates a timeout result for conversational echo exercise
 */
export function createTimeoutResult(): EchoEvaluationResult {
  return {
    isValid: false,
    matchedResponse: null,
    scores: { intention: 0, keywords: 0, rhythm: 0 },
    feedback: {
      type: 'timeout',
      message: FEEDBACK_MESSAGES.timeout,
      tip: 'Intenta responder más rápido. Puedes decir algo simple como "Merci".',
    },
    xpEarned: XP_VALUES.timeout,
  };
}
