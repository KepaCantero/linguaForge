import type { IntonationEvaluationResult, RhythmAnalysis } from '@/types';

const XP_VALUES = {
  excellent: 30, // >= 80%
  good: 20,      // >= 70%
  tryAgain: 10,  // < 70%
};

/**
 * Generates a simulated rhythm pattern for user speech
 * In production, this would analyze actual audio data
 */
function generateUserPattern(wordCount: number, durationMs: number): number[] {
  const baseDuration = durationMs / wordCount;
  return Array.from({ length: wordCount }, () => baseDuration + (Math.random() * 80 - 40));
}

/**
 * Estimates rhythm pattern from dialogue turn when not provided
 */
function estimateRhythmPattern(text: string, durationSec: number): number[] {
  const words = text.split(/\s+/);
  const avgDuration = (durationSec * 1000) / words.length;
  return words.map(() => avgDuration + (Math.random() * 40 - 20));
}

/**
 * Gets or generates native rhythm pattern for a turn
 */
export function getNativePattern(
  turnIndex: number,
  rhythmPatterns?: { turnIndex: number; segments: number[] }[],
  dialogueIndex?: number,
  text?: string,
  duration?: number
): number[] {
  // Check if we have provided rhythm data
  if (rhythmPatterns) {
    const rhythmData = rhythmPatterns.find(rp => rp.turnIndex === dialogueIndex);
    if (rhythmData) {
      return rhythmData.segments;
    }
  }

  // Generate estimated pattern if we have text and duration
  if (text && duration) {
    return estimateRhythmPattern(text, duration);
  }

  return [];
}

/**
 * Evaluates intonation for a dialogue turn
 */
export function evaluateIntonationTurn(
  recordingDuration: number,
  turnText: string,
  nativePattern: number[],
  calculateRhythmSimilarity: (native: number[], user: number[]) => number
): IntonationEvaluationResult {
  // Generate user pattern
  const words = turnText.split(/\s+/);
  const userPattern = generateUserPattern(words.length, recordingDuration);

  // Calculate similarity
  const similarity = calculateRhythmSimilarity(nativePattern, userPattern);

  // Determine XP earned
  let xpEarned: number;
  if (similarity >= 80) {
    xpEarned = XP_VALUES.excellent;
  } else if (similarity >= 70) {
    xpEarned = XP_VALUES.good;
  } else {
    xpEarned = XP_VALUES.tryAgain;
  }

  // Create rhythm analysis
  const rhythmAnalysis: RhythmAnalysis = {
    pattern: userPattern,
    pauses: [],
    overallSimilarity: similarity,
  };

  return {
    turnIndex: 0, // Will be set by caller
    rhythmAnalysis,
    isAcceptable: similarity >= 70,
    xpEarned,
  };
}

/**
 * Returns XP value for a given similarity score
 */
export function getIntonationXP(similarity: number): number {
  if (similarity >= 80) return XP_VALUES.excellent;
  if (similarity >= 70) return XP_VALUES.good;
  return XP_VALUES.tryAgain;
}

/**
 * Determines if gems should be awarded for a performance
 */
export function shouldAwardGems(similarity: number): boolean {
  return similarity >= 80;
}
