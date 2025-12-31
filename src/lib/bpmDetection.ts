/**
 * BPM Detection Utilities
 * Funciones para detectar y sincronizar con beats musicales
 */

/**
 * Calcula el tiempo hasta el próximo beat basado en BPM
 */
export function getTimeToNextBeat(currentTime: number, bpm: number): number {
  const beatInterval = 60 / bpm; // Segundos entre beats
  const beatsElapsed = Math.floor(currentTime / beatInterval);
  const nextBeatTime = (beatsElapsed + 1) * beatInterval;
  return nextBeatTime - currentTime;
}

/**
 * Verifica si el tiempo actual está sincronizado con un beat
 */
export function isOnBeat(currentTime: number, bpm: number, tolerance: number = 0.1): boolean {
  const beatInterval = 60 / bpm;
  const beatPosition = (currentTime % beatInterval) / beatInterval;
  
  // Considerar sincronizado si está cerca del inicio del beat (0) o del final (1)
  return beatPosition < tolerance || beatPosition > (1 - tolerance);
}

/**
 * Calcula el número de beat actual
 */
export function getCurrentBeat(currentTime: number, bpm: number): number {
  const beatInterval = 60 / bpm;
  return Math.floor(currentTime / beatInterval) + 1;
}

/**
 * Calcula la precisión de sincronización (0-100)
 */
export function calculateBeatAccuracy(
  connectionTimes: number[],
  expectedBeats: number[],
  bpm: number
): number {
  if (connectionTimes.length === 0) return 0;

  let correctBeats = 0;
  const beatInterval = 60 / bpm;
  const tolerance = beatInterval * 0.1; // 10% de tolerancia

  connectionTimes.forEach((time) => {
    const beatNumber = getCurrentBeat(time, bpm);
    if (expectedBeats.includes(beatNumber)) {
      const expectedTime = (beatNumber - 1) * beatInterval;
      if (Math.abs(time - expectedTime) <= tolerance) {
        correctBeats++;
      }
    }
  });

  return (correctBeats / connectionTimes.length) * 100;
}

