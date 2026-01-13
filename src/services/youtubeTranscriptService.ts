/**
 * Servicio para obtener transcripciones de YouTube con timestamps
 * Usa la API de YouTube para obtener subtítulos/captions
 */

import { withCircuitBreaker } from './circuitBreaker';

export interface TranscriptPhrase {
  text: string;
  start: number; // Tiempo de inicio en segundos
  duration: number; // Duración en segundos
}

export interface YouTubeTranscript {
  videoId: string;
  title: string;
  language: string;
  phrases: TranscriptPhrase[];
}

/**
 * Extrae el ID del video de una URL de YouTube
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Convierte una transcripción con timestamps en frases agrupadas
 */
export function convertTranscriptToPhrases(transcript: YouTubeTranscript): string[] {
  // Agrupar frases por oraciones (detectar puntos finales)
  const phrases: string[] = [];
  let currentPhrase = '';

  for (const phrase of transcript.phrases) {
    currentPhrase += phrase.text + ' ';

    // Detectar fin de oración
    if (/[.!?]\s*$/.test(phrase.text)) {
      const trimmed = currentPhrase.trim();
      if (trimmed.length > 10) {
        phrases.push(trimmed);
      }
      currentPhrase = '';
    }
  }

  // Agregar última frase si existe
  if (currentPhrase.trim().length > 10) {
    phrases.push(currentPhrase.trim());
  }

  return phrases;
}

/**
 * Obtiene información básica del video (título, duración, etc.)
 */
export async function getVideoInfo(originalVideoId: string): Promise<{ title: string; duration: number } | null> {
  return withCircuitBreaker(
    'youtube-info',
    async () => {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/youtube/info?videoId=${originalVideoId}`);
      return { response, videoId: originalVideoId };
    }
  ).then(async (result) => {
    if (!result.success) {
      // TODO: Add proper logging service for video info errors
      return {
        title: `Video ${originalVideoId}`,
        duration: 300,
      };
    }

    if (!result.result) {
      throw new Error('No result from circuit breaker');
    }

    const { response, videoId } = result.result;

    if (!response.ok) {
      throw new Error(`Failed to fetch video info: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title || `Video ${videoId}`,
      duration: data.duration || 300,
    };
  }).catch(() => {
    // Fallback si circuit breaker o fallan
    return {
      title: `Video ${originalVideoId}`,
      duration: 300,
    };
  });
}

/**
 * Obtiene la transcripción de un video de YouTube
 * Usa la API route que obtiene la transcripción real del video
 */
export async function getYouTubeTranscript(videoId: string): Promise<YouTubeTranscript | null> {
  return withCircuitBreaker(
    'youtube-transcript',
    async () => {
      // Llamar a la API route que obtiene la transcripción real
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000');

      const apiUrl = `${baseUrl}/api/youtube/transcript?videoId=${videoId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return { response, baseUrl, videoId };
    }
  ).then(async (result) => {
    if (!result.success || !result.result) {
      throw result.error || new Error('Failed to fetch YouTube transcript');
    }

    const { response, videoId } = result.result;

    if (!response.ok) {
      let errorData: { message?: string; error?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Si no se puede parsear JSON, usar el texto de respuesta
        const text = await response.text();
        errorData = { error: text || response.statusText };
      }

      const errorMessage = errorData.message || errorData.error || `Failed to fetch transcript: ${response.status} ${response.statusText}`;
      // TODO: Add proper logging service for transcript API errors
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validar que la respuesta tiene el formato esperado
    if (!data.phrases || !Array.isArray(data.phrases)) {
      throw new Error('Invalid transcript format received from API');
    }

    // Convertir el formato de la API al formato esperado
    return {
      videoId: data.videoId || videoId,
      title: data.title || `Video ${videoId}`,
      language: data.language || 'fr',
      phrases: data.phrases.map((p: TranscriptPhrase) => ({
        text: p.text || '',
        start: p.start || 0,
        duration: p.duration || 0,
      })).filter((p: TranscriptPhrase) => p.text.length > 0), // Filtrar frases vacías
    };
  });
}


