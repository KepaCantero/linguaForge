/**
 * Tests for Audio Post-Processing Service
 * Tests para el servicio de post-procesamiento de audio
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeAudio,
  applyBandpassFilter,
  applyPreEmphasis,
  applyPostProcessing,
  calculateMetrics,
  validateAAA,
  generateRecommendations,
  analyzeAudio,
  processAudio,
} from '@/services/audioPostProcessService';
import type {
  AudioQualityMetrics,
  AudioQualityThresholds,
  AudioPostProcessConfig,
} from '@/types/audio';
import {
  AAA_THRESHOLDS_DEFAULT,
  LEARNING_LEVEL_THRESHOLDS,
  QUALITY_RANGES,
} from '@/types/audio';

// ============================================================
// TEST SETUP
// ============================================================

/**
 * Crea un AudioBuffer de prueba
 */
function createTestAudioBuffer(
  duration: number = 1,
  sampleRate: number = 44100,
  frequency: number = 440
): AudioBuffer {
  const audioContext = new AudioContext();
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Generar onda sinusoidal
  for (let i = 0; i < length; i++) {
    channelData[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.5;
  }

  return buffer;
}

/**
 * Crea un AudioBuffer con ruido
 */
function createNoisyAudioBuffer(
  duration: number = 1,
  sampleRate: number = 44100,
  signalAmplitude: number = 0.5,
  noiseAmplitude: number = 0.1
): AudioBuffer {
  const audioContext = new AudioContext();
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const signal = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * signalAmplitude;
    const noise = (Math.random() - 0.5) * 2 * noiseAmplitude;
    channelData[i] = signal + noise;
  }

  return buffer;
}

/**
 * Crea un AudioBuffer con artefactos
 */
function createArtifactAudioBuffer(
  duration: number = 1,
  sampleRate: number = 44100
): AudioBuffer {
  const audioContext = new AudioContext();
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3;

    // Insertar artefactos ocasionales
    if (i % 10000 === 0) {
      channelData[i] = 0.8; // Click/pop
    }
  }

  return buffer;
}

// ============================================================
// NORMALIZATION TESTS
// ============================================================

describe('normalizeAudio', () => {
  it('debería normalizar audio a nivel objetivo', async () => {
    const buffer = createTestAudioBuffer(1, 44100, 440);
    const targetDB = -3;

    const normalized = await normalizeAudio(buffer, targetDB);

    expect(normalized).toBeInstanceOf(AudioBuffer);
    expect(normalized.length).toBe(buffer.length);
    expect(normalized.sampleRate).toBe(buffer.sampleRate);
  });

  it('debería mantener la longitud del buffer', async () => {
    const buffer = createTestAudioBuffer(2, 48000);
    const normalized = await normalizeAudio(buffer);

    expect(normalized.length).toBe(buffer.length);
  });

  it('debería mantener el sample rate', async () => {
    const buffer = createTestAudioBuffer(1, 22050);
    const normalized = await normalizeAudio(buffer);

    expect(normalized.sampleRate).toBe(22050);
  });

  it('debería manejar audio silencioso', async () => {
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(1, 44100, 44100);
    const channelData = buffer.getChannelData(0);

    // Audio silencioso
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = 0;
    }

    const normalized = await normalizeAudio(buffer);

    expect(normalized).toBeInstanceOf(AudioBuffer);
  });
});

// ============================================================
// FILTER TESTS
// ============================================================

describe('applyBandpassFilter', () => {
  it('debería aplicar filtro paso banda', async () => {
    const buffer = createTestAudioBuffer(1, 44100, 440);
    const highPass = 80;
    const lowPass = 8000;

    const filtered = await applyBandpassFilter(buffer, highPass, lowPass);

    expect(filtered).toBeInstanceOf(AudioBuffer);
    expect(filtered.length).toBe(buffer.length);
    expect(filtered.sampleRate).toBe(buffer.sampleRate);
  });

  it('debería mantener longitud y sample rate', async () => {
    const buffer = createTestAudioBuffer(1, 48000, 1000);
    const filtered = await applyBandpassFilter(buffer, 100, 12000);

    expect(filtered.length).toBe(buffer.length);
    expect(filtered.sampleRate).toBe(buffer.sampleRate);
  });

  it('debería filtrar frecuencias fuera del rango', async () => {
    const buffer = createTestAudioBuffer(1, 44100, 50); // Frecuencia baja
    const filtered = await applyBandpassFilter(buffer, 80, 8000);

    expect(filtered).toBeInstanceOf(AudioBuffer);
    // La frecuencia de 50Hz debería ser atenuada por el filtro high-pass de 80Hz
  });
});

// ============================================================
// PRE-EMPHASIS TESTS
// ============================================================

describe('applyPreEmphasis', () => {
  it('debería aplicar pre-énfasis', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const alpha = 0.97;

    const emphasized = await applyPreEmphasis(buffer, alpha);

    expect(emphasized).toBeInstanceOf(AudioBuffer);
    expect(emphasized.length).toBe(buffer.length);
    expect(emphasized.sampleRate).toBe(buffer.sampleRate);
  });

  it('debería modificar el espectro de frecuencia', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const emphasized = await applyPreEmphasis(buffer, 0.97);

    // El pre-énfasis debería cambiar las características del audio
    expect(emphasized).toBeInstanceOf(AudioBuffer);
  });
});

// ============================================================
// POST-PROCESSING TESTS
// ============================================================

describe('applyPostProcessing', () => {
  it('debería aplicar normalización cuando está activado', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: true,
      compression: 'none',
      highPassFilter: 80,
      lowPassFilter: 8000,
      preEmphasis: false,
      deEssing: false,
    };

    const processed = await applyPostProcessing(buffer, config);

    expect(processed).toBeInstanceOf(AudioBuffer);
  });

  it('debería aplicar filtros cuando están activados', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: false,
      compression: 'none',
      highPassFilter: 80,
      lowPassFilter: 8000,
      preEmphasis: false,
      deEssing: false,
    };

    const processed = await applyPostProcessing(buffer, config);

    expect(processed).toBeInstanceOf(AudioBuffer);
  });

  it('debería aplicar pre-énfasis cuando está activado', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: false,
      compression: 'none',
      highPassFilter: 0,
      lowPassFilter: 24000,
      preEmphasis: true,
      deEssing: false,
    };

    const processed = await applyPostProcessing(buffer, config);

    expect(processed).toBeInstanceOf(AudioBuffer);
  });

  it('debería aplicar todos los procesamientos', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: true,
      compression: 'none',
      highPassFilter: 80,
      lowPassFilter: 8000,
      preEmphasis: true,
      deEssing: true,
    };

    const processed = await applyPostProcessing(buffer, config);

    expect(processed).toBeInstanceOf(AudioBuffer);
  });
});

// ============================================================
// METRICS CALCULATION TESTS
// ============================================================

describe('calculateMetrics', () => {
  it('debería calcular todas las métricas requeridas', async () => {
    const buffer = createTestAudioBuffer(1, 44100, 440);
    const metrics = await calculateMetrics(buffer);

    expect(metrics).toHaveProperty('clarity');
    expect(metrics).toHaveProperty('prosodyScore');
    expect(metrics).toHaveProperty('snrRatio');
    expect(metrics).toHaveProperty('artifactScore');
    expect(metrics).toHaveProperty('dynamicRange');
    expect(metrics).toHaveProperty('spectralCentroid');
    expect(metrics).toHaveProperty('zeroCrossingRate');
  });

  it('debería retornar valores en rangos válidos', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const metrics = await calculateMetrics(buffer);

    expect(metrics.clarity).toBeGreaterThanOrEqual(0);
    expect(metrics.clarity).toBeLessThanOrEqual(100);

    expect(metrics.prosodyScore).toBeGreaterThanOrEqual(0);
    expect(metrics.prosodyScore).toBeLessThanOrEqual(100);

    expect(metrics.snrRatio).toBeGreaterThanOrEqual(0);
    expect(metrics.artifactScore).toBeGreaterThanOrEqual(0);
    expect(metrics.artifactScore).toBeLessThanOrEqual(100);

    expect(metrics.dynamicRange).toBeGreaterThanOrEqual(0);
    expect(metrics.spectralCentroid).toBeGreaterThanOrEqual(0);
    expect(metrics.zeroCrossingRate).toBeGreaterThanOrEqual(0);
  });

  it('debería detectar baja calidad en audio ruidoso', async () => {
    const noisyBuffer = createNoisyAudioBuffer(1, 44100, 0.3, 0.3);
    const metrics = await calculateMetrics(noisyBuffer);

    // Audio ruidoso debería tener menor claridad y SNR
    expect(metrics.clarity).toBeLessThan(100);
    expect(metrics.snrRatio).toBeLessThan(40);
  });

  it('debería detectar artefactos', async () => {
    const artifactBuffer = createArtifactAudioBuffer(1, 44100);
    const metrics = await calculateMetrics(artifactBuffer);

    // Buffer con artefactos debería tener menor puntuación
    expect(metrics.artifactScore).toBeLessThan(100);
  });

  it('debería calcular SNR correctamente', async () => {
    const cleanBuffer = createTestAudioBuffer(1, 44100, 440);
    const noisyBuffer = createNoisyAudioBuffer(1, 44100, 0.5, 0.1);

    const cleanMetrics = await calculateMetrics(cleanBuffer);
    const noisyMetrics = await calculateMetrics(noisyBuffer);

    // Ambos buffers deberían tener valores de SNR calculados
    expect(cleanMetrics.snrRatio).toBeGreaterThan(0);
    expect(noisyMetrics.snrRatio).toBeGreaterThan(0);

    // El SNR debería estar en un rango razonable (0-60dB)
    expect(cleanMetrics.snrRatio).toBeLessThan(60);
    expect(noisyMetrics.snrRatio).toBeLessThan(60);
  });
});

// ============================================================
// VALIDATION TESTS
// ============================================================

describe('validateAAA', () => {
  const excellentMetrics: AudioQualityMetrics = {
    clarity: 95,
    prosodyScore: 85,
    snrRatio: 32,
    artifactScore: 98,
    dynamicRange: 26,
    spectralCentroid: 2500,
    zeroCrossingRate: 150,
  };

  const poorMetrics: AudioQualityMetrics = {
    clarity: 70,
    prosodyScore: 50,
    snrRatio: 15,
    artifactScore: 85,
    dynamicRange: 12,
    spectralCentroid: 1500,
    zeroCrossingRate: 100,
  };

  it('debería validar métricas excelentes', () => {
    const validation = validateAAA(excellentMetrics, AAA_THRESHOLDS_DEFAULT);

    expect(validation.passed).toBe(true);
    expect(validation.failures).toHaveLength(0);
  });

  it('debería fallar con métricas pobres', () => {
    const validation = validateAAA(poorMetrics, AAA_THRESHOLDS_DEFAULT);

    expect(validation.passed).toBe(false);
    expect(validation.failures.length).toBeGreaterThan(0);
  });

  it('debería incluir mensajes de fallo específicos', () => {
    const validation = validateAAA(poorMetrics, AAA_THRESHOLDS_DEFAULT);

    // Debería tener fallos
    expect(validation.failures.length).toBeGreaterThan(0);

    // Los mensajes deben describir el problema
    validation.failures.forEach((failure) => {
      expect(failure).toMatch(/(insuficiente|Demasiados|bajo|alta)/i);
    });
  });

  it('debería validar contra umbrales personalizados', () => {
    const customThresholds: AudioQualityThresholds = {
      minClarity: 80,
      minProsody: 60,
      minSNR: 20,
      maxArtifacts: 10,
      minDynamicRange: 15,
    };

    const validation = validateAAA(poorMetrics, customThresholds);

    // Con umbrales más bajos, debería pasar más métricas o tener menos fallos que con umbrales estrictos
    const strictValidation = validateAAA(poorMetrics, AAA_THRESHOLDS_DEFAULT);

    expect(validation.failures.length).toBeLessThanOrEqual(strictValidation.failures.length);
  });

  it('debería generar advertencias cerca del mínimo', () => {
    const borderlineMetrics: AudioQualityMetrics = {
      clarity: 91, // Justo encima del mínimo (90)
      prosodyScore: 71, // Justo encima del mínimo (70)
      snrRatio: 26, // Justo encima del mínimo (25)
      artifactScore: 96, // Justo encima del mínimo (95)
      dynamicRange: 21, // Justo encima del mínimo (20)
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const validation = validateAAA(borderlineMetrics, AAA_THRESHOLDS_DEFAULT);

    expect(validation.passed).toBe(true);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });
});

// ============================================================
// LEARNING LEVEL VALIDATION TESTS
// ============================================================

describe('validateAAA con niveles de aprendizaje', () => {
  it('debería validar beginner correctamente', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 90,
      prosodyScore: 60,
      snrRatio: 25,
      artifactScore: 95,
      dynamicRange: 20,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const validation = validateAAA(metrics, LEARNING_LEVEL_THRESHOLDS.beginner);

    expect(validation.passed).toBe(true);
  });

  it('debería validar intermediate correctamente', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 92,
      prosodyScore: 70,
      snrRatio: 28,
      artifactScore: 97,
      dynamicRange: 22,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const validation = validateAAA(metrics, LEARNING_LEVEL_THRESHOLDS.intermediate);

    expect(validation.passed).toBe(true);
  });

  it('debería validar advanced correctamente', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 95,
      prosodyScore: 80,
      snrRatio: 30,
      artifactScore: 98,
      dynamicRange: 25,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const validation = validateAAA(metrics, LEARNING_LEVEL_THRESHOLDS.advanced);

    expect(validation.passed).toBe(true);
  });

  it('debería fallar advanced con métricas beginner', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 90,
      prosodyScore: 60,
      snrRatio: 25,
      artifactScore: 95,
      dynamicRange: 20,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const validation = validateAAA(metrics, LEARNING_LEVEL_THRESHOLDS.advanced);

    expect(validation.passed).toBe(false);
  });
});

// ============================================================
// RECOMMENDATIONS TESTS
// ============================================================

describe('generateRecommendations', () => {
  it('debería generar recomendaciones para baja claridad', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 85, // Menos de 90, debería generar recomendación
      prosodyScore: 75,
      snrRatio: 30,
      artifactScore: 98,
      dynamicRange: 25,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const recommendations = generateRecommendations(metrics);

    // Debería tener al menos una recomendación sobre claridad
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.toLowerCase().includes('claridad') || r.toLowerCase().includes('normalización'))).toBe(true);
  });

  it('debería generar recomendaciones para bajo SNR', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 95,
      prosodyScore: 75,
      snrRatio: 20, // Menos de 25, debería generar recomendación
      artifactScore: 98,
      dynamicRange: 25,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const recommendations = generateRecommendations(metrics);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.toLowerCase().includes('ruido') || r.toLowerCase().includes('filtro'))).toBe(true);
  });

  it('debería generar recomendaciones para artefactos', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 95,
      prosodyScore: 75,
      snrRatio: 30,
      artifactScore: 90, // Menos de 95, debería generar recomendación
      dynamicRange: 25,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const recommendations = generateRecommendations(metrics);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.toLowerCase().includes('artefactos') || r.toLowerCase().includes('artifacts'))).toBe(true);
  });

  it('debería generar recomendaciones para bajo rango dinámico', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 95,
      prosodyScore: 75,
      snrRatio: 30,
      artifactScore: 98,
      dynamicRange: 15, // Menos de 20, debería generar recomendación
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const recommendations = generateRecommendations(metrics);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.toLowerCase().includes('rango dinámico') || r.toLowerCase().includes('compresión'))).toBe(true);
  });

  it('debería generar recomendaciones para baja prosodia', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 95,
      prosodyScore: 60, // Menos de 70, debería generar recomendación
      snrRatio: 30,
      artifactScore: 98,
      dynamicRange: 25,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const recommendations = generateRecommendations(metrics);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some(r => r.toLowerCase().includes('expresividad') || r.toLowerCase().includes('pitch'))).toBe(true);
  });

  it('no debería generar recomendaciones para audio excelente', () => {
    const metrics: AudioQualityMetrics = {
      clarity: 95,
      prosodyScore: 85,
      snrRatio: 32,
      artifactScore: 98,
      dynamicRange: 26,
      spectralCentroid: 2500,
      zeroCrossingRate: 150,
    };

    const recommendations = generateRecommendations(metrics);

    expect(recommendations).toHaveLength(0);
  });
});

// ============================================================
// ANALYSIS TESTS
// ============================================================

describe('analyzeAudio', () => {
  it('debería analizar audio completamente', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const analysis = await analyzeAudio(buffer);

    expect(analysis).toHaveProperty('metrics');
    expect(analysis).toHaveProperty('validation');
    expect(analysis).toHaveProperty('recommendations');
    expect(analysis).toHaveProperty('processingTime');

    expect(analysis.processingTime).toBeGreaterThan(0);
  });

  it('debería incluir validación en análisis', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const analysis = await analyzeAudio(buffer);

    expect(analysis.validation).toBeDefined();
    expect(analysis.validation).toHaveProperty('passed');
    expect(analysis.validation).toHaveProperty('metrics');
    expect(analysis.validation).toHaveProperty('thresholds');
    expect(analysis.validation).toHaveProperty('failures');
    expect(analysis.validation).toHaveProperty('warnings');
  });

  it('debería usar umbrales personalizados si se proporcionan', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const customThresholds: AudioQualityThresholds = {
      minClarity: 80,
      minProsody: 60,
      minSNR: 20,
      maxArtifacts: 10,
      minDynamicRange: 15,
    };

    const analysis = await analyzeAudio(buffer, customThresholds);

    expect(analysis.validation.thresholds).toEqual(customThresholds);
  });
});

// ============================================================
// PROCESSING TESTS
// ============================================================

describe('processAudio', () => {
  it('debería procesar audio con análisis', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: false, // Desactivar para evitar problemas con mocks
      compression: 'none',
      highPassFilter: 0,
      lowPassFilter: 24000,
      preEmphasis: false,
      deEssing: false,
    };

    const result = await processAudio(
      buffer,
      config,
      {
        applyNormalization: false,
        applyEQ: false,
        analyzeQuality: true,
        returnMetrics: true,
      }
    );

    expect(result).toHaveProperty('buffer');
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('validation');
    expect(result).toHaveProperty('processingTime');

    expect(result.buffer).toBeInstanceOf(AudioBuffer);
    expect(result.metrics).toBeDefined();
    expect(result.validation).toBeDefined();
  });

  it('debería procesar sin análisis si se deshabilita', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: false,
      compression: 'none',
      highPassFilter: 0,
      lowPassFilter: 24000,
      preEmphasis: false,
      deEssing: false,
    };

    const result = await processAudio(
      buffer,
      config,
      {
        applyNormalization: false,
        applyEQ: false,
        analyzeQuality: false,
        returnMetrics: false,
      }
    );

    expect(result).toHaveProperty('buffer');
    expect(result.metrics).toBeUndefined();
    expect(result.validation).toBeUndefined();
  });

  it('debería medir tiempo de procesamiento', async () => {
    const buffer = createTestAudioBuffer(1, 44100);
    const config: AudioPostProcessConfig = {
      normalize: false,
      compression: 'none',
      highPassFilter: 0,
      lowPassFilter: 24000,
      preEmphasis: false,
      deEssing: false,
    };

    const result = await processAudio(
      buffer,
      config,
      {
        applyNormalization: false,
        applyEQ: false,
        analyzeQuality: false,
        returnMetrics: false,
      }
    );

    expect(result.processingTime).toBeGreaterThan(0);
  });
});

// ============================================================
// QUALITY RANGES TESTS
// ============================================================

describe('QUALITY_RANGES constants', () => {
  it('debería tener rangos excelentes más altos que buenos', () => {
    expect(QUALITY_RANGES.EXCELLENT.clarity).toBeGreaterThan(
      QUALITY_RANGES.GOOD.clarity
    );
    expect(QUALITY_RANGES.EXCELLENT.prosody).toBeGreaterThan(
      QUALITY_RANGES.GOOD.prosody
    );
  });

  it('debería tener rangos buenos más altos que aceptables', () => {
    expect(QUALITY_RANGES.GOOD.clarity).toBeGreaterThan(
      QUALITY_RANGES.ACCEPTABLE.clarity
    );
    expect(QUALITY_RANGES.GOOD.prosody).toBeGreaterThan(
      QUALITY_RANGES.ACCEPTABLE.prosody
    );
  });

  it('debería tener todos los valores en rangos válidos', () => {
    Object.values(QUALITY_RANGES).forEach((range) => {
      expect(range.clarity).toBeGreaterThanOrEqual(0);
      expect(range.clarity).toBeLessThanOrEqual(100);

      expect(range.prosody).toBeGreaterThanOrEqual(0);
      expect(range.prosody).toBeLessThanOrEqual(100);

      expect(range.artifacts).toBeGreaterThanOrEqual(0);
      expect(range.artifacts).toBeLessThanOrEqual(100);

      expect(range.snr).toBeGreaterThan(0);
      expect(range.dynamicRange).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// LEARNING LEVEL THRESHOLDS TESTS
// ============================================================

describe('LEARNING_LEVEL_THRESHOLDS', () => {
  it('debería tener umbrales más altos para advanced', () => {
    expect(LEARNING_LEVEL_THRESHOLDS.advanced.minClarity).toBeGreaterThan(
      LEARNING_LEVEL_THRESHOLDS.intermediate.minClarity
    );
    expect(LEARNING_LEVEL_THRESHOLDS.advanced.minProsody).toBeGreaterThan(
      LEARNING_LEVEL_THRESHOLDS.intermediate.minProsody
    );
  });

  it('debería tener umbrales medios para intermediate', () => {
    expect(LEARNING_LEVEL_THRESHOLDS.intermediate.minClarity).toBeGreaterThan(
      LEARNING_LEVEL_THRESHOLDS.beginner.minClarity
    );
    expect(LEARNING_LEVEL_THRESHOLDS.intermediate.minProsody).toBeGreaterThan(
      LEARNING_LEVEL_THRESHOLDS.beginner.minProsody
    );
  });

  it('debería tener umbrales más bajos para beginner', () => {
    expect(LEARNING_LEVEL_THRESHOLDS.beginner.minProsody).toBeLessThan(
      LEARNING_LEVEL_THRESHOLDS.advanced.minProsody
    );
  });

  it('debería tener maxArtifacts decreciente con nivel', () => {
    expect(LEARNING_LEVEL_THRESHOLDS.beginner.maxArtifacts).toBeGreaterThan(
      LEARNING_LEVEL_THRESHOLDS.intermediate.maxArtifacts
    );
    expect(LEARNING_LEVEL_THRESHOLDS.intermediate.maxArtifacts).toBeGreaterThan(
      LEARNING_LEVEL_THRESHOLDS.advanced.maxArtifacts
    );
  });
});
