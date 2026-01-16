/**
 * Audio Post-Processing Service
 * Servicio de post-procesamiento y análisis de calidad de audio
 *
 * Proporciona:
 * - Normalización de audio
 * - Filtrado frecuenciales (EQ)
 * - Análisis de métricas de calidad AAA
 * - Validación de estándares AAA
 */

import type {
  AudioQualityMetrics,
  AudioQualityThresholds,
  AudioQualityValidation,
  AudioAnalysisResult,
  AudioPostProcessConfig,
  ProcessingOptions,
  ProcessingResult,
} from '@/types/audio';
import {
  AAA_THRESHOLDS_DEFAULT,
} from '@/types/audio';

// ============================================================
// CONSTANTS
// ============================================================

const MAX_PEAK_DB = -3; // Maximum peak level

// ============================================================
// AUDIO PROCESSING FUNCTIONS
// ============================================================

/**
 * Normaliza el audio a un nivel objetivo
 * @param audioBuffer - Buffer de audio a normalizar
 * @param targetDB - N objetivo en dB (default: -3dB)
 * @returns AudioBuffer normalizado
 */
export async function normalizeAudio(
  audioBuffer: AudioBuffer,
  targetDB: number = MAX_PEAK_DB
): Promise<AudioBuffer> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  // Crear nuevo buffer
  const normalizedBuffer = new AudioContext().createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );

  // Encontrar el pico máximo actual
  let maxPeak = 0;
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const absValue = Math.abs(channelData[i]);
      if (absValue > maxPeak) {
        maxPeak = absValue;
      }
    }
  }

  // Evitar división por cero
  if (maxPeak < 0.0001) {
    maxPeak = 0.0001;
  }

  // Calcular ganancia necesaria
  const targetAmplitude = Math.pow(10, targetDB / 20);
  const gain = targetAmplitude / maxPeak;

  // Aplicar ganancia a todos los canales
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const targetData = normalizedBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      targetData[i] = sourceData[i] * gain;
    }
  }

  return normalizedBuffer;
}

/**
 * Aplica filtro de paso banda (high-pass + low-pass)
 * @param audioBuffer - Buffer de audio a filtrar
 * @param highPass - Frecuencia de corte high-pass (Hz)
 * @param lowPass - Frecuencia de corte low-pass (Hz)
 * @returns AudioBuffer filtrado
 */
export async function applyBandpassFilter(
  audioBuffer: AudioBuffer,
  highPass: number,
  lowPass: number
): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const highPassFilter = audioContext.createBiquadFilter();
  highPassFilter.type = 'highpass';
  highPassFilter.frequency.value = highPass;
  highPassFilter.Q.value = 0.5;

  const lowPassFilter = audioContext.createBiquadFilter();
  lowPassFilter.type = 'lowpass';
  lowPassFilter.frequency.value = lowPass;
  lowPassFilter.Q.value = 0.5;

  // Crear offline context para procesamiento
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const offlineSource = offlineContext.createBufferSource();
  offlineSource.buffer = audioBuffer;

  const offlineHighPass = offlineContext.createBiquadFilter();
  offlineHighPass.type = 'highpass';
  offlineHighPass.frequency.value = highPass;
  offlineHighPass.Q.value = 0.5;

  const offlineLowPass = offlineContext.createBiquadFilter();
  offlineLowPass.type = 'lowpass';
  offlineLowPass.frequency.value = lowPass;
  offlineLowPass.Q.value = 0.5;

  offlineSource.connect(offlineHighPass);
  offlineHighPass.connect(offlineLowPass);
  offlineLowPass.connect(offlineContext.destination);

  offlineSource.start();

  return await offlineContext.startRendering();
}

/**
 * Aplica pre-énfasis para mejorar claridad
 * @param audioBuffer - Buffer de audio
 * @param alpha - Coeficiente de pre-énfasis (default: 0.97)
 * @returns AudioBuffer con pre-énfasis
 */
export async function applyPreEmphasis(
  audioBuffer: AudioBuffer,
  alpha: number = 0.97
): Promise<AudioBuffer> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  const emphasizedBuffer = new AudioContext().createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const targetData = emphasizedBuffer.getChannelData(channel);

    // Aplicar filtro: y[n] = x[n] - alpha * x[n-1]
    targetData[0] = sourceData[0];
    for (let i = 1; i < length; i++) {
      targetData[i] = sourceData[i] - alpha * sourceData[i - 1];
    }
  }

  return emphasizedBuffer;
}

/**
 * Aplica post-procesamiento completo según configuración
 * @param audioBuffer - Buffer de audio a procesar
 * @param config - Configuración de post-procesamiento
 * @returns AudioBuffer procesado
 */
export async function applyPostProcessing(
  audioBuffer: AudioBuffer,
  config: AudioPostProcessConfig
): Promise<AudioBuffer> {
  let processedBuffer = audioBuffer;

  // Aplicar normalización
  if (config.normalize) {
    processedBuffer = await normalizeAudio(processedBuffer, MAX_PEAK_DB);
  }

  // Aplicar filtros frecuenciales
  if (config.highPassFilter > 0 || config.lowPassFilter < 24000) {
    processedBuffer = await applyBandpassFilter(
      processedBuffer,
      config.highPassFilter,
      config.lowPassFilter
    );
  }

  // Aplicar pre-énfasis
  if (config.preEmphasis) {
    processedBuffer = await applyPreEmphasis(processedBuffer);
  }

  return processedBuffer;
}

// ============================================================
// AUDIO ANALYSIS FUNCTIONS
// ============================================================

/**
 * Calcula métricas de calidad del audio
 * @param audioBuffer - Buffer de audio a analizar
 * @returns Métricas de calidad calculadas
 */
export async function calculateMetrics(
  audioBuffer: AudioBuffer
): Promise<AudioQualityMetrics> {
  const sampleRate = audioBuffer.sampleRate;

  // Usar primer canal para análisis (o mono si esté disponible)
  const channelData = audioBuffer.getChannelData(0);

  // Calcular todas las métricas en paralelo
  const [clarity, snrRatio, artifactScore, dynamicRange, spectralCentroid, zeroCrossingRate] =
    await Promise.all([
      calculateClarity(channelData, sampleRate),
      calculateSNR(channelData),
      calculateArtifactScore(channelData),
      calculateDynamicRange(channelData),
      calculateSpectralCentroid(channelData, sampleRate),
      calculateZeroCrossingRate(channelData),
    ]);

  // Calcular prosody score basado en variación tonal
  const prosodyScore = calculateProsodyScore(channelData, sampleRate);

  return {
    clarity,
    prosodyScore,
    snrRatio,
    artifactScore,
    dynamicRange,
    spectralCentroid,
    zeroCrossingRate,
  };
}

/**
 * Calcula claridad basada en análisis de amplitude
 */
async function calculateClarity(
  channelData: Float32Array,
  _sampleRate: number
): Promise<number> {
  const clarityThreshold = 0.02; // Umbral de claridad
  let clearSamples = 0;
  const totalSamples = channelData.length;

  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) > clarityThreshold) {
      clearSamples++;
    }
  }

  return (clearSamples / totalSamples) * 100;
}

/**
 * Calcula ratio señal-ruido (SNR)
 */
async function calculateSNR(channelData: Float32Array): Promise<number> {
  // Calcular potencia de señal
  let signalPower = 0;
  for (let i = 0; i < channelData.length; i++) {
    signalPower += channelData[i] * channelData[i];
  }
  signalPower /= channelData.length;

  // Estimar ruido de fondo (muestras de baja energía)
  const noiseThreshold = 0.01;
  let noisePower = 0;
  let noiseSamples = 0;

  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) < noiseThreshold) {
      noisePower += channelData[i] * channelData[i];
      noiseSamples++;
    }
  }

  if (noiseSamples > 0) {
    noisePower /= noiseSamples;
  }

  // Evitar división por cero
  if (noisePower < 0.000001) {
    noisePower = 0.000001;
  }

  // SNR en dB
  const snrLinear = signalPower / noisePower;
  const snrDB = 10 * Math.log10(snrLinear);

  return Math.max(0, snrDB);
}

/**
 * Calcula puntuación de artefactos (detecta clicks/pops)
 */
async function calculateArtifactScore(channelData: Float32Array): Promise<number> {
  let artifactCount = 0;
  const windowSize = 3;

  for (let i = windowSize; i < channelData.length - windowSize; i++) {
    // Detectar cambios abruptos (clicks/pops)
    const current = Math.abs(channelData[i]);
    const prev = Math.abs(channelData[i - 1]);
    const next = Math.abs(channelData[i + 1]);

    // Si hay un cambio brusco, contar como artefacto
    if (current > prev * 3 && current > next * 3 && current > 0.1) {
      artifactCount++;
    }
  }

  const artifactPercentage = (artifactCount / channelData.length) * 100;
  return Math.max(0, 100 - artifactPercentage * 10); // Penalizar artefactos
}

/**
 * Calcula rango dinámico en dB
 */
async function calculateDynamicRange(channelData: Float32Array): Promise<number> {
  let maxValue = 0;
  let minValue = 1;

  for (let i = 0; i < channelData.length; i++) {
    const absValue = Math.abs(channelData[i]);
    if (absValue > maxValue) {
      maxValue = absValue;
    }
    if (absValue < minValue && absValue > 0.0001) {
      minValue = absValue;
    }
  }

  // Rango dinámico en dB
  const dynamicRangeDB = 20 * Math.log10(maxValue / minValue);
  return Math.max(0, dynamicRangeDB);
}

/**
 * Calcula centroide espectral (brillo del audio)
 */
async function calculateSpectralCentroid(
  channelData: Float32Array,
  sampleRate: number
): Promise<number> {
  // Implementación simplificada usando FFT
  const fftSize = 2048;
  const magnitudeSpectrum = computeFFT(channelData, fftSize);

  let weightedSum = 0;
  let magnitudeSum = 0;

  for (let i = 0; i < magnitudeSpectrum.length; i++) {
    const frequency = (i * sampleRate) / fftSize;
    weightedSum += frequency * magnitudeSpectrum[i];
    magnitudeSum += magnitudeSpectrum[i];
  }

  return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
}

/**
 * Calcula tasa de cruce por cero (energía/actividad)
 */
async function calculateZeroCrossingRate(channelData: Float32Array): Promise<number> {
  let zeroCrossings = 0;

  for (let i = 1; i < channelData.length; i++) {
    if (
      (channelData[i - 1] >= 0 && channelData[i] < 0) ||
      (channelData[i - 1] < 0 && channelData[i] >= 0)
    ) {
      zeroCrossings++;
    }
  }

  return (zeroCrossings / channelData.length) * 1000;
}

/**
 * Calcula puntuación de prosodia (variación tonal)
 */
function calculateProsodyScore(
  channelData: Float32Array,
  sampleRate: number
): number {
  // Detectar variaciones de amplitude que indican entonación
  const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
  const energies: number[] = [];

  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    let energy = 0;
    for (let j = 0; j < windowSize; j++) {
      energy += channelData[i + j] * channelData[i + j];
    }
    energies.push(energy / windowSize);
  }

  // Calcular variación
  if (energies.length < 2) return 50;

  const meanEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
  const variance =
    energies.reduce((sum, e) => sum + Math.pow(e - meanEnergy, 2), 0) / energies.length;
  const stdDev = Math.sqrt(variance);

  // Normalizar a 0-100
  const normalizedVariation = Math.min((stdDev / meanEnergy) * 100, 100);
  return Math.max(0, normalizedVariation);
}

/**
 * Calcula FFT simplificada
 */
function computeFFT(data: Float32Array, fftSize: number): Float32Array {
  // Implementación simplificada - en producción usar FFT real
  const magnitudeSpectrum = new Float32Array(fftSize / 2);

  for (let i = 0; i < fftSize / 2; i++) {
    let real = 0;
    let imag = 0;

    for (let j = 0; j < Math.min(data.length, fftSize); j++) {
      const angle = (2 * Math.PI * i * j) / fftSize;
      real += data[j] * Math.cos(angle);
      imag -= data[j] * Math.sin(angle);
    }

    magnitudeSpectrum[i] = Math.sqrt(real * real + imag * imag);
  }

  return magnitudeSpectrum;
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Valida que las métricas cumplan con los estándares AAA
 * @param metrics - Métricas a validar
 * @param thresholds - Umbrales mínimos requeridos
 * @returns Resultado de validación
 */
export function validateAAA(
  metrics: AudioQualityMetrics,
  thresholds: AudioQualityThresholds = AAA_THRESHOLDS_DEFAULT
): AudioQualityValidation {
  const failures: string[] = [];
  const warnings: string[] = [];

  // Validar claridad
  if (metrics.clarity < thresholds.minClarity) {
    failures.push(
      `Claridad insuficiente: ${metrics.clarity.toFixed(1)}% (mínimo: ${thresholds.minClarity}%)`
    );
  } else if (metrics.clarity < thresholds.minClarity + 5) {
    warnings.push(
      `Claridad cerca del mínimo: ${metrics.clarity.toFixed(1)}%`
    );
  }

  // Validar prosodia
  if (metrics.prosodyScore < thresholds.minProsody) {
    failures.push(
      `Prosodia insuficiente: ${metrics.prosodyScore.toFixed(1)}% (mínimo: ${thresholds.minProsody}%)`
    );
  }

  // Validar SNR
  if (metrics.snrRatio < thresholds.minSNR) {
    failures.push(
      `SNR insuficiente: ${metrics.snrRatio.toFixed(1)}dB (mínimo: ${thresholds.minSNR}dB)`
    );
  }

  // Validar artefactos
  const artifactPercent = 100 - metrics.artifactScore;
  if (artifactPercent > thresholds.maxArtifacts) {
    failures.push(
      `Demasiados artefactos: ${artifactPercent.toFixed(1)}% (máximo: ${thresholds.maxArtifacts}%)`
    );
  }

  // Validar rango dinámico
  if (metrics.dynamicRange < thresholds.minDynamicRange) {
    failures.push(
      `Rango dinámico insuficiente: ${metrics.dynamicRange.toFixed(1)}dB (mínimo: ${thresholds.minDynamicRange}dB)`
    );
  }

  const passed = failures.length === 0;

  return {
    passed,
    metrics,
    thresholds,
    failures,
    warnings,
  };
}

/**
 * Genera recomendaciones basadas en métricas
 */
export function generateRecommendations(
  metrics: AudioQualityMetrics
): string[] {
  const recommendations: string[] = [];

  if (metrics.clarity < 90) {
    recommendations.push('Aplicar normalización de volumen para mejorar claridad');
  }

  if (metrics.snrRatio < 25) {
    recommendations.push('Aplicar filtro high-pass para reducir ruido de fondo');
  }

  if (metrics.artifactScore < 95) {
    recommendations.push('Revisar configuración TTS para reducir artefactos');
  }

  if (metrics.dynamicRange < 20) {
    recommendations.push('Aplicar compresión suave para mejorar rango dinámico');
  }

  if (metrics.prosodyScore < 70) {
    recommendations.push('Ajustar parámetros de pitch para mejorar expresividad');
  }

  return recommendations;
}

/**
 * Analiza audio completamente
 * @param audioBuffer - Buffer de audio a analizar
 * @param thresholds - Umbrales de validación (opcional)
 * @returns Resultado completo del análisis
 */
export async function analyzeAudio(
  audioBuffer: AudioBuffer,
  thresholds?: AudioQualityThresholds
): Promise<AudioAnalysisResult> {
  const startTime = performance.now();

  const metrics = await calculateMetrics(audioBuffer);
  const validation = validateAAA(metrics, thresholds);
  const recommendations = generateRecommendations(metrics);

  const processingTime = performance.now() - startTime;

  return {
    metrics,
    validation,
    recommendations,
    processingTime,
  };
}

/**
 * Procesa audio con opción de análisis
 * @param audioBuffer - Buffer de audio a procesar
 * @param postProcessConfig - Configuración de post-procesamiento
 * @param options - Opciones de procesamiento
 * @returns Resultado del procesamiento
 */
export async function processAudio(
  audioBuffer: AudioBuffer,
  postProcessConfig: AudioPostProcessConfig,
  options: ProcessingOptions = {
    applyNormalization: true,
    applyEQ: true,
    analyzeQuality: true,
    returnMetrics: true,
  }
): Promise<ProcessingResult> {
  const startTime = performance.now();

  let processedBuffer = audioBuffer;

  // Aplicar post-procesamiento
  if (options.applyNormalization || options.applyEQ) {
    processedBuffer = await applyPostProcessing(audioBuffer, postProcessConfig);
  }

  // Analizar calidad si se solicita
  let metrics: AudioQualityMetrics | undefined;
  let validation: AudioQualityValidation | undefined;

  if (options.analyzeQuality) {
    metrics = await calculateMetrics(processedBuffer);
    validation = validateAAA(metrics);
  }

  const processingTime = performance.now() - startTime;

  return {
    buffer: processedBuffer,
    metrics,
    validation,
    processingTime,
  };
}
