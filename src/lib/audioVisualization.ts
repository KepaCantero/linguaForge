/**
 * Audio Visualization Utilities
 * Funciones para visualizar ondas de audio y detectar eventos
 */

/**
 * Genera datos de onda de audio para visualización
 */
export function generateWaveformData(
  audioBuffer: AudioBuffer,
  width: number = 600
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const samplesPerPixel = Math.floor(channelData.length / width);
  const waveform: number[] = [];

  for (let i = 0; i < width; i++) {
    let sum = 0;
    const start = i * samplesPerPixel;
    const end = Math.min(start + samplesPerPixel, channelData.length);

    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }

    const average = sum / (end - start);
    waveform.push(average);
  }

  return waveform;
}

/**
 * Detecta si un timestamp está dentro del rango de tolerancia de un Power Word
 */
export function isPowerWordDetected(
  currentTime: number,
  powerWordTimestamp: number,
  tolerance: number
): boolean {
  return Math.abs(currentTime - powerWordTimestamp) <= tolerance;
}

