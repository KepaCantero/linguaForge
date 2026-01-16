/**
 * Audio Quality Validator Tests
 * 
 * Tests for AAA (Triple-A) audio quality validation system
 * Validates clarity, prosody, SNR, artifacts, and dynamic range
 */

import { describe, it, expect } from 'vitest';

// ============================================================
// TYPES
// ============================================================

export interface AudioQualityMetrics {
  clarity: number; // 0-100 percentage
  prosody: number; // 0-100 percentage
  snr: number; // Signal-to-noise ratio in dB
  artifacts: number; // 0-100 percentage (lower is better)
  dynamicRange: number; // Dynamic range in dB
}

export interface AudioValidationResult {
  passed: boolean;
  metrics: AudioQualityMetrics;
  failures: string[];
  warnings: string[];
}

export interface AudioQualityThresholds {
  minClarity: number;
  minProsody: number;
  minSNR: number;
  maxArtifacts: number;
  minDynamicRange: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_THRESHOLDS: AudioQualityThresholds = {
  minClarity: 90, // 90% minimum clarity
  minProsody: 70, // 70% minimum prosody
  minSNR: 25, // 25dB minimum SNR
  maxArtifacts: 5, // 5% maximum artifacts
  minDynamicRange: 20, // 20dB minimum dynamic range
};

// ============================================================
// TEST HELPERS
// ============================================================

/**
 * Generate a mock audio buffer for testing
 * Creates synthetic audio with specified quality characteristics
 */
function generateTestBuffer(metrics: Partial<AudioQualityMetrics>): Float32Array {
  const sampleRate = 44100;
  const duration = 1; // 1 second
  const length = sampleRate * duration;
  const buffer = new Float32Array(length);
  
  // Generate base signal
  for (let i = 0; i < length; i++) {
    buffer[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5;
  }
  
  // Add noise based on clarity (inverse relationship)
  const clarity = metrics.clarity ?? 95;
  const noise = (100 - clarity) / 100 * 0.5;
  for (let i = 0; i < length; i++) {
    buffer[i] += (Math.random() - 0.5) * noise;
  }
  
  return buffer;
}

/**
 * Validate audio quality metrics against thresholds
 * Main validation function for audio quality assessment
 */
function validateAudioQuality(
  metrics: AudioQualityMetrics,
  thresholds: AudioQualityThresholds = DEFAULT_THRESHOLDS
): AudioValidationResult {
  const failures: string[] = [];
  const warnings: string[] = [];
  
  // Validate clarity
  if (metrics.clarity < thresholds.minClarity) {
    failures.push(
      `Claridad insuficiente: ${metrics.clarity}% (mínimo: ${thresholds.minClarity}%)`
    );
  } else if (metrics.clarity < thresholds.minClarity + 5) {
    warnings.push(
      `Claridad cercana al mínimo: ${metrics.clarity}%`
    );
  }
  
  // Validate prosody
  if (metrics.prosody < thresholds.minProsody) {
    failures.push(
      `Prosodia insuficiente: ${metrics.prosody}% (mínimo: ${thresholds.minProsody}%)`
    );
  } else if (metrics.prosody < thresholds.minProsody + 10) {
    warnings.push(
      `Prosodia mejorable: ${metrics.prosody}%`
    );
  }
  
  // Validate SNR
  if (metrics.snr < thresholds.minSNR) {
    failures.push(
      `SNR insuficiente: ${metrics.snr}dB (mínimo: ${thresholds.minSNR}dB)`
    );
  } else if (metrics.snr < thresholds.minSNR + 5) {
    warnings.push(
      `SNR cercano al mínimo: ${metrics.snr}dB`
    );
  }
  
  // Validate artifacts
  if (metrics.artifacts > thresholds.maxArtifacts) {
    failures.push(
      `Artefactos excesivos: ${metrics.artifacts}% (máximo: ${thresholds.maxArtifacts}%)`
    );
  } else if (metrics.artifacts > thresholds.maxArtifacts - 2) {
    warnings.push(
      `Artefactos cercanos al máximo: ${metrics.artifacts}%`
    );
  }
  
  // Validate dynamic range
  if (metrics.dynamicRange < thresholds.minDynamicRange) {
    failures.push(
      `Rango dinámico insuficiente: ${metrics.dynamicRange}dB (mínimo: ${thresholds.minDynamicRange}dB)`
    );
  } else if (metrics.dynamicRange < thresholds.minDynamicRange + 5) {
    warnings.push(
      `Rango dinámico reducido: ${metrics.dynamicRange}dB`
    );
  }
  
  return {
    passed: failures.length === 0,
    metrics,
    failures,
    warnings,
  };
}

// ============================================================
// CLARITY VALIDATION TESTS
// ============================================================

describe('AudioQualityValidator - Clarity Validation', () => {
  it('should reject audio below 90% clarity', () => {
    const lowQualityMetrics: AudioQualityMetrics = {
      clarity: 85,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(lowQualityMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures).toContainEqual(
      expect.stringContaining('Claridad insuficiente')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('85%')
    );
  });

  it('should accept audio above 90% clarity', () => {
    const highQualityMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(highQualityMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).not.toContainEqual(
      expect.stringContaining('Claridad')
    );
  });

  it('should accept audio exactly at 90% clarity', () => {
    const exactQualityMetrics: AudioQualityMetrics = {
      clarity: 90,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(exactQualityMetrics);
    
    expect(result.passed).toBe(true);
  });

  it('should warn when clarity is between 90-95%', () => {
    const warningQualityMetrics: AudioQualityMetrics = {
      clarity: 92,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(warningQualityMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.stringContaining('Claridad cercana al mínimo')
    );
  });
});

// ============================================================
// PROSODY VALIDATION TESTS
// ============================================================

describe('AudioQualityValidator - Prosody Validation', () => {
  it('should reject audio below 70% prosody', () => {
    const lowProsodyMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 65,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(lowProsodyMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures).toContainEqual(
      expect.stringContaining('Prosodia insuficiente')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('65%')
    );
  });

  it('should accept audio above 70% prosody', () => {
    const highProsodyMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(highProsodyMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).not.toContainEqual(
      expect.stringContaining('Prosodia')
    );
  });

  it('should accept audio exactly at 70% prosody', () => {
    const exactProsodyMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 70,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(exactProsodyMetrics);
    
    expect(result.passed).toBe(true);
  });

  it('should warn when prosody is between 70-80%', () => {
    const warningProsodyMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(warningProsodyMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.stringContaining('Prosodia mejorable')
    );
  });
});

// ============================================================
// SNR VALIDATION TESTS
// ============================================================

describe('AudioQualityValidator - SNR Validation', () => {
  it('should reject audio below 25dB SNR', () => {
    const lowSNRMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 20,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(lowSNRMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures).toContainEqual(
      expect.stringContaining('SNR insuficiente')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('20dB')
    );
  });

  it('should accept audio above 25dB SNR', () => {
    const highSNRMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(highSNRMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).not.toContainEqual(
      expect.stringContaining('SNR')
    );
  });

  it('should accept audio exactly at 25dB SNR', () => {
    const exactSNRMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 25,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(exactSNRMetrics);
    
    expect(result.passed).toBe(true);
  });

  it('should warn when SNR is between 25-30dB', () => {
    const warningSNRMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 27,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(warningSNRMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.stringContaining('SNR cercano al mínimo')
    );
  });
});

// ============================================================
// ARTIFACTS VALIDATION TESTS
// ============================================================

describe('AudioQualityValidator - Artifacts Validation', () => {
  it('should reject audio above 5% artifacts', () => {
    const highArtifactsMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 8,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(highArtifactsMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures).toContainEqual(
      expect.stringContaining('Artefactos excesivos')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('8%')
    );
  });

  it('should accept audio below 5% artifacts', () => {
    const lowArtifactsMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(lowArtifactsMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).not.toContainEqual(
      expect.stringContaining('Artefactos')
    );
  });

  it('should accept audio exactly at 5% artifacts', () => {
    const exactArtifactsMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 5,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(exactArtifactsMetrics);
    
    expect(result.passed).toBe(true);
  });

  it('should warn when artifacts are between 3-5%', () => {
    const warningArtifactsMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 4,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(warningArtifactsMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.stringContaining('Artefactos cercanos al máximo')
    );
  });
});

// ============================================================
// DYNAMIC RANGE VALIDATION TESTS
// ============================================================

describe('AudioQualityValidator - Dynamic Range Validation', () => {
  it('should reject audio below 20dB dynamic range', () => {
    const lowDynamicRangeMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 15,
    };
    
    const result = validateAudioQuality(lowDynamicRangeMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures).toContainEqual(
      expect.stringContaining('Rango dinámico insuficiente')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('15dB')
    );
  });

  it('should accept audio above 20dB dynamic range', () => {
    const highDynamicRangeMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 25,
    };
    
    const result = validateAudioQuality(highDynamicRangeMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).not.toContainEqual(
      expect.stringContaining('Rango dinámico')
    );
  });

  it('should accept audio exactly at 20dB dynamic range', () => {
    const exactDynamicRangeMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 20,
    };
    
    const result = validateAudioQuality(exactDynamicRangeMetrics);
    
    expect(result.passed).toBe(true);
  });

  it('should warn when dynamic range is between 20-25dB', () => {
    const warningDynamicRangeMetrics: AudioQualityMetrics = {
      clarity: 95,
      prosody: 75,
      snr: 30,
      artifacts: 3,
      dynamicRange: 22,
    };
    
    const result = validateAudioQuality(warningDynamicRangeMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.stringContaining('Rango dinámico reducido')
    );
  });
});

// ============================================================
// COMBINED VALIDATION TESTS
// ============================================================

describe('AudioQualityValidator - Combined Validation', () => {
  it('should pass all validations with perfect audio', () => {
    const perfectMetrics: AudioQualityMetrics = {
      clarity: 98,
      prosody: 90,
      snr: 40,
      artifacts: 1,
      dynamicRange: 35,
    };
    
    const result = validateAudioQuality(perfectMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should fail multiple validations with poor audio', () => {
    const poorMetrics: AudioQualityMetrics = {
      clarity: 85,
      prosody: 65,
      snr: 20,
      artifacts: 8,
      dynamicRange: 15,
    };
    
    const result = validateAudioQuality(poorMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(1);
  });

  it('should collect all failures', () => {
    const multiFailMetrics: AudioQualityMetrics = {
      clarity: 80,
      prosody: 60,
      snr: 20,
      artifacts: 10,
      dynamicRange: 15,
    };
    
    const result = validateAudioQuality(multiFailMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBe(5);
    expect(result.failures).toContainEqual(
      expect.stringContaining('Claridad')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('Prosodia')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('SNR')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('Artefactos')
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining('Rango dinámico')
    );
  });
});

// ============================================================
// CUSTOM THRESHOLDS TESTS
// ============================================================

describe('AudioQualityValidator - Custom Thresholds', () => {
  it('should use custom thresholds when provided', () => {
    const customThresholds: AudioQualityThresholds = {
      minClarity: 95,
      minProsody: 80,
      minSNR: 30,
      maxArtifacts: 2,
      minDynamicRange: 25,
    };
    
    const metrics: AudioQualityMetrics = {
      clarity: 92,
      prosody: 75,
      snr: 28,
      artifacts: 3,
      dynamicRange: 22,
    };
    
    const result = validateAudioQuality(metrics, customThresholds);
    
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
  });

  it('should pass with custom thresholds', () => {
    const lenientThresholds: AudioQualityThresholds = {
      minClarity: 85,
      minProsody: 60,
      minSNR: 20,
      maxArtifacts: 10,
      minDynamicRange: 15,
    };
    
    const metrics: AudioQualityMetrics = {
      clarity: 90,
      prosody: 70,
      snr: 25,
      artifacts: 5,
      dynamicRange: 20,
    };
    
    const result = validateAudioQuality(metrics, lenientThresholds);
    
    expect(result.passed).toBe(true);
  });
});

// ============================================================
// EDGE CASES TESTS
// ============================================================

describe('AudioQualityValidator - Edge Cases', () => {
  it('should handle minimum values', () => {
    const minMetrics: AudioQualityMetrics = {
      clarity: 0,
      prosody: 0,
      snr: 0,
      artifacts: 100,
      dynamicRange: 0,
    };
    
    const result = validateAudioQuality(minMetrics);
    
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBe(5);
  });

  it('should handle maximum values', () => {
    const maxMetrics: AudioQualityMetrics = {
      clarity: 100,
      prosody: 100,
      snr: 100,
      artifacts: 0,
      dynamicRange: 100,
    };
    
    const result = validateAudioQuality(maxMetrics);
    
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('should handle decimal values', () => {
    const decimalMetrics: AudioQualityMetrics = {
      clarity: 90.5,
      prosody: 70.3,
      snr: 25.7,
      artifacts: 4.9,
      dynamicRange: 20.1,
    };
    
    const result = validateAudioQuality(decimalMetrics);
    
    expect(result.passed).toBe(true);
  });
});
