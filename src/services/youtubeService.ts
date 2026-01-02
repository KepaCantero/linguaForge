/**
 * Servicio para interactuar con videos de YouTube
 *
 * Funcionalidades:
 * - Obtener información del video (título, duración, thumbnail)
 * - Obtener transcripciones/captions
 * - Buscar videos (para contenido curado)
 */

import { TranscriptPhrase } from '@/types/srs';

// ============================================
// TIPOS
// ============================================

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: number; // en segundos
  publishedAt: string;
}

export interface YouTubeSearchResult {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  description: string;
}

export interface YouTubeTranscript {
  videoId: string;
  language: string;
  phrases: TranscriptPhrase[];
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Extrae el ID del video de una URL de YouTube
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Solo el ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Construye la URL de embed de YouTube
 */
export function getEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  startTime?: number;
  enableJsApi?: boolean;
}): string {
  const params = new URLSearchParams();

  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.startTime) params.set('start', String(options.startTime));
  if (options?.enableJsApi) params.set('enablejsapi', '1');

  // Opciones por defecto para mejor experiencia
  params.set('rel', '0'); // No mostrar videos relacionados
  params.set('modestbranding', '1'); // Branding mínimo
  params.set('cc_load_policy', '1'); // Cargar captions si están disponibles

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`;
}

/**
 * Obtiene la URL del thumbnail
 */
export function getThumbnailUrl(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Obtiene información básica del video usando oEmbed (no requiere API key)
 */
export async function getVideoInfo(videoId: string): Promise<YouTubeVideoInfo | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Error fetching video info:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      id: videoId,
      title: data.title || 'Video sin título',
      description: '', // oEmbed no proporciona descripción
      thumbnailUrl: data.thumbnail_url || getThumbnailUrl(videoId),
      channelTitle: data.author_name || 'Canal desconocido',
      duration: 0, // oEmbed no proporciona duración
      publishedAt: '',
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    return null;
  }
}

/**
 * Obtiene transcripción del video
 *
 * NOTA: Esta función usa un endpoint de transcripción de terceros
 * o transcripciones pre-cargadas. En producción, considerar:
 * - youtube-transcript npm package (para servidor)
 * - API propia con caché
 * - Whisper API para transcripción automática
 */
export async function getVideoTranscript(
  videoId: string,
  language: string = 'fr'
): Promise<YouTubeTranscript | null> {
  try {
    // Primero intentar cargar transcripción local (curada)
    const localTranscript = await loadLocalTranscript(videoId);
    if (localTranscript) {
      return localTranscript;
    }

    // En desarrollo, retornar transcripción de ejemplo
    // En producción, usar API de transcripción real
    if (process.env.NODE_ENV === 'development') {
      return getMockTranscript(videoId, language);
    }

    // TODO: Implementar llamada a API de transcripción real
    // Opciones:
    // 1. youtube-transcript-api (npm) - requiere servidor
    // 2. RapidAPI YouTube Transcript
    // 3. Whisper API de OpenAI

    return null;
  } catch (error) {
    console.error('Error getting transcript:', error);
    return null;
  }
}

/**
 * Carga transcripción local (para contenido curado)
 */
async function loadLocalTranscript(videoId: string): Promise<YouTubeTranscript | null> {
  try {
    const response = await fetch(`/content/transcripts/${videoId}.json`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      videoId,
      language: data.language || 'fr',
      phrases: data.phrases.map((p: {
        id?: string;
        text: string;
        translation?: string;
        start: number;
        end: number;
      }, index: number) => ({
        id: p.id || `phrase-${index}`,
        text: p.text,
        translation: p.translation || '',
        startTime: p.start,
        endTime: p.end,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Transcripción de ejemplo para desarrollo
 */
function getMockTranscript(videoId: string, language: string): YouTubeTranscript {
  // Transcripción de ejemplo de un diálogo A1
  const mockPhrases: TranscriptPhrase[] = [
    {
      id: 'p1',
      text: 'Bonjour, comment allez-vous ?',
      translation: 'Buenos días, ¿cómo está usted?',
      startTime: 0,
      endTime: 2.5,
    },
    {
      id: 'p2',
      text: 'Je vais très bien, merci. Et vous ?',
      translation: 'Estoy muy bien, gracias. ¿Y usted?',
      startTime: 2.5,
      endTime: 5,
    },
    {
      id: 'p3',
      text: 'Très bien aussi, merci.',
      translation: 'Muy bien también, gracias.',
      startTime: 5,
      endTime: 7,
    },
    {
      id: 'p4',
      text: 'Je m\'appelle Marie. Et vous ?',
      translation: 'Me llamo Marie. ¿Y usted?',
      startTime: 7,
      endTime: 9.5,
    },
    {
      id: 'p5',
      text: 'Je m\'appelle Pierre. Enchanté !',
      translation: 'Me llamo Pierre. ¡Encantado!',
      startTime: 9.5,
      endTime: 12,
    },
    {
      id: 'p6',
      text: 'Enchantée ! Vous êtes français ?',
      translation: '¡Encantada! ¿Es usted francés?',
      startTime: 12,
      endTime: 14.5,
    },
    {
      id: 'p7',
      text: 'Oui, je suis français. Et vous ?',
      translation: 'Sí, soy francés. ¿Y usted?',
      startTime: 14.5,
      endTime: 17,
    },
    {
      id: 'p8',
      text: 'Je suis espagnole, de Madrid.',
      translation: 'Soy española, de Madrid.',
      startTime: 17,
      endTime: 19.5,
    },
    {
      id: 'p9',
      text: 'Ah, c\'est très bien ! J\'adore l\'Espagne.',
      translation: '¡Ah, muy bien! Me encanta España.',
      startTime: 19.5,
      endTime: 22,
    },
    {
      id: 'p10',
      text: 'Merci ! Au revoir, Pierre.',
      translation: '¡Gracias! Adiós, Pierre.',
      startTime: 22,
      endTime: 24,
    },
    {
      id: 'p11',
      text: 'Au revoir, Marie. À bientôt !',
      translation: 'Adiós, Marie. ¡Hasta pronto!',
      startTime: 24,
      endTime: 26,
    },
  ];

  return {
    videoId,
    language,
    phrases: mockPhrases,
  };
}

// ============================================
// VIDEOS CURADOS A1
// ============================================

export interface CuratedVideo {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: number; // segundos
  level: string;
  topics: string[];
  hasTranscript: boolean;
}

/**
 * Lista de videos curados para nivel A1
 */
export const CURATED_VIDEOS_A1: CuratedVideo[] = [
  {
    id: 'dQw4w9WgXcQ', // Reemplazar con IDs reales
    title: 'Basic French Greetings',
    titleFr: 'Salutations de base',
    description: 'Aprende los saludos básicos en francés con diálogos simples.',
    thumbnailUrl: getThumbnailUrl('dQw4w9WgXcQ'),
    channelTitle: 'Learn French',
    duration: 180,
    level: 'A1',
    topics: ['saludos', 'presentaciones'],
    hasTranscript: true,
  },
  {
    id: 'VIDEO_ID_2',
    title: 'At the Café - French Dialogue',
    titleFr: 'Au café - Dialogue',
    description: 'Diálogo en un café francés. Aprende a pedir bebidas.',
    thumbnailUrl: getThumbnailUrl('VIDEO_ID_2'),
    channelTitle: 'French with Pierre',
    duration: 240,
    level: 'A1',
    topics: ['café', 'comida', 'pedidos'],
    hasTranscript: true,
  },
  {
    id: 'VIDEO_ID_3',
    title: 'Numbers 1-100 in French',
    titleFr: 'Les nombres de 1 à 100',
    description: 'Aprende los números del 1 al 100 en francés.',
    thumbnailUrl: getThumbnailUrl('VIDEO_ID_3'),
    channelTitle: 'FrenchPod101',
    duration: 300,
    level: 'A1',
    topics: ['números', 'vocabulario básico'],
    hasTranscript: true,
  },
];

/**
 * Obtiene videos curados por nivel
 */
export function getCuratedVideos(level: string): CuratedVideo[] {
  if (level === 'A1' || level === 'A0') {
    return CURATED_VIDEOS_A1;
  }
  // TODO: Añadir más niveles
  return [];
}

/**
 * Obtiene videos curados por tema
 */
export function getCuratedVideosByTopic(topic: string): CuratedVideo[] {
  return CURATED_VIDEOS_A1.filter((v) =>
    v.topics.some((t) => t.toLowerCase().includes(topic.toLowerCase()))
  );
}

// ============================================
// TRACKING
// ============================================

export interface VideoWatchSession {
  videoId: string;
  startTime: number; // segundos desde inicio
  watchedSegments: Array<{ start: number; end: number }>;
  totalWatchedSeconds: number;
  startedAt: string; // ISO date
  lastUpdated: string;
}

/**
 * Calcula el tiempo total visto (sin duplicar segmentos)
 */
export function calculateTotalWatchTime(
  segments: Array<{ start: number; end: number }>
): number {
  if (segments.length === 0) return 0;

  // Ordenar segmentos por tiempo de inicio
  const sorted = [...segments].sort((a, b) => a.start - b.start);

  // Fusionar segmentos superpuestos
  const merged: Array<{ start: number; end: number }> = [];

  for (const segment of sorted) {
    if (merged.length === 0) {
      merged.push({ ...segment });
    } else {
      const last = merged[merged.length - 1];
      if (segment.start <= last.end) {
        // Segmentos se superponen, extender el último
        last.end = Math.max(last.end, segment.end);
      } else {
        merged.push({ ...segment });
      }
    }
  }

  // Sumar duración de segmentos fusionados
  return merged.reduce((total, seg) => total + (seg.end - seg.start), 0);
}

/**
 * Formatea segundos a MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea duración larga a HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
