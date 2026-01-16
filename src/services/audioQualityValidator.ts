/**
 * Audio Quality Validator Service
 * Real AAA quality validation for generated TTS audio
 * Validates: clarity, prosody, SNR, artifacts, dynamic range
 */

import type {
  AudioQualityMetrics,
  AudioQualityValidation,
  AudioQualityThresholds,
} from '@/types/audio';
import { AAA_THRESHOLDS_DEFAULT } from '@/types/audio';
import { calculateMetrics } from '@/services/audioPostProcessService';

// ============================================================
// AUDIO QUALITY VALIDATOR CLASS
// ============================================================

export class AudioQualityValidator {
  private fftSize: number;
  private smoothing: number;

  constructor(fftSize: number = 2048, smoothing: number = 0.8) {
    this.fftSize = fftSize;
    this.smoothing = smoothing;
  }

  /**
   * Validate audio buffer against AAA quality standards
   * @param buffer - Audio buffer to validate
   * @param thresholds - Optional custom thresholds
   * @returns Validation result with metrics and failures
   */
  async validate(buffer: ArrayBuffer, thresholds?: AudioQualityThresholds): Promise<AudioQualityValidation> {
    const metrics = await this.calculateMetrics(buffer);
    const effectiveThresholds = thresholds || AAA_THRESHOLDS_DEFAULT;

    return {
      passed: this.checkThresholds(metrics, effectiveThresholds),
      metrics,
      thresholds: effectiveThresholds,
      failures: this.getFailures(metrics, effectiveThresholds),
      warnings: this.getWarnings(metrics, effectiveThresholds),
    };
  }

  /**
   * Calculate all quality metrics from audio buffer
   * @param buffer - Raw audio buffer
   * @returns Complete audio quality metrics
   */
  private async calculateMetrics(buffer: ArrayBuffer): Promise<AudioQualityMetrics> {
    try {
      // Use existing audioPostProcessService for metric calculation
      // The service expects an AudioBuffer, so we need to decode first
      const { decodeAudioBuffer } = await import('@/lib/audioDecoder');
      const audioBuffer = await decodeAudioBuffer(buffer);

      if (!audioBuffer) {
        throw new Error('Failed to decode audio buffer');
      }

      const metrics = await calculateMetrics(audioBuffer);
      return metrics;
    } catch (error) {
      console.error('Failed to calculate audio metrics:', error);
      // Return minimal metrics on failure
      return {
        clarity: 0,
        prosodyScore: 0,
        snrRatio: 0,
        artifactScore: 0,
        dynamicRange: 0,
        spectralCentroid: 0,
        zeroCrossingRate: 0,
      };
    }
  }

  /**
   * Check if metrics meet all threshold requirements
   * @param metrics - Calculated audio metrics
   * @param thresholds - Thresholds to check against
   * @returns True if all metrics pass thresholds
   */
  private checkThresholds(
    metrics: AudioQualityMetrics,
    thresholds: AudioQualityThresholds
  ): boolean {
    return (
      metrics.clarity >= thresholds.minClarity &&
      metrics.prosodyScore >= thresholds.minProsody &&
      metrics.snrRatio >= thresholds.minSNR &&
      (100 - metrics.artifactScore) <= thresholds.maxArtifacts &&
      metrics.dynamicRange >= thresholds.minDynamicRange
    );
  }

  /**
   * Get list of threshold failures
   * @param metrics - Calculated audio metrics
   * @param thresholds - Thresholds to check against
   * @returns Array of failure messages
   */
  private getFailures(
    metrics: AudioQualityMetrics,
    thresholds: AudioQualityThresholds
  ): string[] {
    const failures: string[] = [];

    if (metrics.clarity < thresholds.minClarity) {
      failures.push(
        `Claridad insuficiente: ${metrics.clarity.toFixed(1)}% (mínimo: ${thresholds.minClarity}%)`
      );
    }

    if (metrics.prosodyScore < thresholds.minProsody) {
      failures.push(
        `Prosodia insuficiente: ${metrics.prosodyScore.toFixed(1)}% (mínimo: ${thresholds.minProsody}%)`
      );
    }

    if (metrics.snrRatio < thresholds.minSNR) {
      failures.push(
        `SNR insuficiente: ${metrics.snrRatio.toFixed(1)}dB (mínimo: ${thresholds.minSNR}dB)`
      );
    }

    const artifactPercent = 100 - metrics.artifactScore;
    if (artifactPercent > thresholds.maxArtifacts) {
      failures.push(
        `Demasiados artefactos: ${artifactPercent.toFixed(1)}% (máximo: ${thresholds.maxArtifacts}%)`
      );
    }

    if (metrics.dynamicRange < thresholds.minDynamicRange) {
      failures.push(
        `Rango dinámico insuficiente: ${metrics.dynamicRange.toFixed(1)}dB (mínimo: ${thresholds.minDynamicRange}dB)`
      );
    }

    return failures;
  }

  /**
   * Get list of warnings for metrics close to thresholds
   * @param metrics - Calculated audio metrics
   * @param thresholds - Thresholds to check against
   * @returns Array of warning messages
   */
  private getWarnings(
    metrics: AudioQualityMetrics,
    thresholds: AudioQualityThresholds
  ): string[] {
    const warnings: string[] = [];

    const warningMargin = 5; // 5% margin for warnings

    if (metrics.clarity < thresholds.minClarity + warningMargin && metrics.clarity >= thresholds.minClarity) {
      warnings.push(
        `Claridad cerca del mínimo: ${metrics.clarity.toFixed(1)}%`
      );
    }

    if (metrics.prosodyScore < thresholds.minProsody + warningMargin && metrics.prosodyScore >= thresholds.minProsody) {
      warnings.push(
        `Prosodia cerca del mínimo: ${metrics.prosodyScore.toFixed(1)}%`
      );
    }

    if (metrics.snrRatio < thresholds.minSNR + 3 && metrics.snrRatio >= thresholds.minSNR) {
      warnings.push(
        `SNR cerca del mínimo: ${metrics.snrRatio.toFixed(1)}dB`
      );
    }

    return warnings;
  }
}

// ============================================================
// FACTORY FUNCTIONS
// ============================================================

/**
 * Create a validator with default settings
 * @returns AudioQualityValidator instance
 */
export function createAudioValidator(): AudioQualityValidator {
  return new AudioQualityValidator();
}

/**
 * Create a validator with custom FFT size
 * @param fftSize - FFT size for analysis (default: 2048)
 * @param smoothing - Smoothing factor (0-1, default: 0.8)
 * @returns AudioQualityValidator instance
 */
export function createCustomAudioValidator(
  fftSize: number = 2048,
  smoothing: number = 0.8
): AudioQualityValidator {
  return new AudioQualityValidator(fftSize, smoothing);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Quick validation check without full analysis
 * @param metrics - Pre-calculated metrics
 * @param thresholds - Thresholds to check against
 * @returns Simple pass/fail result
 */
export function quickValidate(
  metrics: AudioQualityMetrics,
  thresholds: AudioQualityThresholds = AAA_THRESHOLDS_DEFAULT
): boolean {
  return (
    metrics.clarity >= thresholds.minClarity &&
    metrics.prosodyScore >= thresholds.minProsody &&
    metrics.snrRatio >= thresholds.minSNR &&
    (100 - metrics.artifactScore) <= thresholds.maxArtifacts &&
    metrics.dynamicRange >= thresholds.minDynamicRange
  );
}

/**
 * Get quality grade based on metrics
 * @param metrics - Audio quality metrics
 * @returns Quality grade (excellent, good, acceptable, poor)
 */
export function getQualityGrade(metrics: AudioQualityMetrics): 'excellent' | 'good' | 'acceptable' | 'poor' {
  const excellent = AAA_THRESHOLDS_DEFAULT.minClarity + 10;
  const good = AAA_THRESHOLDS_DEFAULT.minClarity + 5;
  const acceptable = AAA_THRESHOLDS_DEFAULT.minClarity;

  if (metrics.clarity >= excellent && metrics.prosodyScore >= excellent) {
    return 'excellent';
  }

  if (metrics.clarity >= good && metrics.prosodyScore >= good) {
    return 'good';
  }

  if (metrics.clarity >= acceptable && metrics.prosodyScore >= acceptable - 10) {
    return 'acceptable';
  }

  return 'poor';
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  AudioQualityValidator,
  createAudioValidator,
  createCustomAudioValidator,
  quickValidate,
  getQualityGrade,
};
