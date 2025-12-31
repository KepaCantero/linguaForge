/**
 * Audio Analysis Utilities
 * Funciones para análisis de frecuencia y comparación de entonación
 */

/**
 * Analiza la frecuencia fundamental (F0) de un audio grabado
 * Retorna un array de valores normalizados (0-100)
 */
export async function analyzeIntonation(
  audioBuffer: AudioBuffer,
  sampleRate: number = 44100
): Promise<number[]> {
  const channelData = audioBuffer.getChannelData(0);
  const frameSize = Math.floor(sampleRate * 0.01); // 10ms frames
  const hopSize = Math.floor(frameSize / 2);
  const intonation: number[] = [];

  for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
    const frame = channelData.slice(i, i + frameSize);
    const frequency = estimateFundamentalFrequency(frame, sampleRate);
    
    // Normalizar frecuencia a 0-100 (asumiendo rango vocal humano 80-400 Hz)
    const normalized = Math.max(0, Math.min(100, ((frequency - 80) / 320) * 100));
    intonation.push(normalized);
  }

  return intonation;
}

/**
 * Estima la frecuencia fundamental usando autocorrelación
 */
function estimateFundamentalFrequency(
  frame: Float32Array,
  sampleRate: number
): number {
  const minPeriod = Math.floor(sampleRate / 400); // 400 Hz máximo
  const maxPeriod = Math.floor(sampleRate / 80);  // 80 Hz mínimo

  let maxCorrelation = 0;
  let bestPeriod = minPeriod;

  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0;
    for (let i = 0; i < frame.length - period; i++) {
      correlation += frame[i] * frame[i + period];
    }
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }

  return sampleRate / bestPeriod;
}

/**
 * Calcula la similitud entre dos curvas de entonación usando correlación de Pearson
 * Retorna un valor entre 0-100 (porcentaje de similitud)
 */
export function calculateIntonationSimilarity(
  native: number[],
  user: number[]
): number {
  if (native.length === 0 || user.length === 0) return 0;

  // Interpolar para que tengan la misma longitud
  const interpolatedUser = interpolateArray(user, native.length);
  
  // Calcular correlación de Pearson
  const correlation = pearsonCorrelation(native, interpolatedUser);
  
  // Convertir a porcentaje (correlación puede ser -1 a 1)
  return Math.max(0, Math.min(100, ((correlation + 1) / 2) * 100));
}

/**
 * Interpola un array a una longitud específica
 */
function interpolateArray(arr: number[], targetLength: number): number[] {
  if (arr.length === targetLength) return arr;
  if (arr.length === 0) return new Array(targetLength).fill(0);

  const result: number[] = [];
  const step = (arr.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const index = i * step;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;

    if (upper >= arr.length) {
      result.push(arr[arr.length - 1]);
    } else if (lower === upper) {
      result.push(arr[lower]);
    } else {
      result.push(arr[lower] * (1 - fraction) + arr[upper] * fraction);
    }
  }

  return result;
}

/**
 * Calcula la correlación de Pearson entre dos arrays
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Detecta beats en un audio usando análisis de energía
 * Retorna timestamps de beats en segundos
 */
export async function detectBeats(
  audioBuffer: AudioBuffer,
  bpm: number
): Promise<number[]> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const beatInterval = (60 / bpm) * sampleRate; // Samples entre beats
  const beats: number[] = [];

  // Calcular energía en ventanas
  const windowSize = Math.floor(sampleRate * 0.1); // 100ms
  const energies: number[] = [];

  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    let energy = 0;
    for (let j = i; j < i + windowSize; j++) {
      energy += Math.abs(channelData[j]);
    }
    energies.push(energy / windowSize);
  }

  // Detectar picos de energía que coinciden con el BPM esperado
  const expectedBeatIndex = Math.floor(beatInterval / windowSize);
  for (let i = 0; i < energies.length; i += expectedBeatIndex) {
    const timestamp = (i * windowSize) / sampleRate;
    beats.push(timestamp);
  }

  return beats;
}

