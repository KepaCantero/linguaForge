import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para obtener transcripciones de YouTube
 * Usa youtube-transcript.io API para obtener transcripciones de forma confiable
 */

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

// Interface para referencia de la API de youtube-transcript.io
// Comentada porque usamos parsing dinámico para manejar diferentes formatos
// interface YouTubeTranscriptIOResponse {
//   videoId: string;
//   transcript: Array<{ text: string; start: number; duration: number; }>;
// }

export async function GET(request: NextRequest) {
  console.log('[YouTube Transcript API Route] Request received');

  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  console.log('[YouTube Transcript API Route] Video ID:', videoId);
  console.log('[YouTube Transcript API Route] Environment check:', {
    hasToken: !!process.env.YOUTUBE_TRANSCRIPT_API_TOKEN,
    tokenLength: process.env.YOUTUBE_TRANSCRIPT_API_TOKEN?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  });

  if (!videoId) {
    return NextResponse.json(
      { error: 'videoId is required' },
      { status: 400 }
    );
  }

  // Validar formato del videoId
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json(
      { error: 'Invalid videoId format' },
      { status: 400 }
    );
  }

  try {
    console.log('[YouTube Transcript API Route] Starting transcript fetch...');
    // Obtener transcripción usando youtube-transcript.io API
    const transcript = await fetchYouTubeTranscript(videoId);
    console.log('[YouTube Transcript API Route] Transcript fetched successfully:', transcript.length, 'items');

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        {
          error: 'No transcript available for this video',
          message: 'Este video no tiene subtítulos públicos disponibles. Por favor, pega la transcripción manualmente.',
          videoId
        },
        { status: 404 }
      );
    }

    // Convertir a formato esperado
    const phrases: TranscriptItem[] = transcript.map((item) => ({
      text: item.text,
      start: item.start,
      duration: item.duration || 0,
    }));

    return NextResponse.json({
      videoId,
      title: `Video ${videoId}`, // Se puede obtener con otra llamada si es necesario
      language: 'fr',
      phrases,
    });
  } catch (error) {
    console.error('[YouTube Transcript API Route] Error caught:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detallado para debugging
    console.error('[YouTube Transcript API Route] Error details:', {
      videoId,
      errorMessage,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorStack: errorStack?.substring(0, 1000), // Limitar tamaño del stack
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch transcript',
        details: errorMessage,
        message: errorMessage, // Usar el mensaje específico del error
        videoId,
        // En desarrollo, incluir más detalles
        ...(process.env.NODE_ENV === 'development' && {
          stack: errorStack?.substring(0, 500),
          errorName: error instanceof Error ? error.name : 'Unknown',
        }),
      },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS - Reducen complejidad
// ============================================

/**
 * Valida y extrae el token de API
 */
function getApiToken(): string {
  const apiToken = process.env.YOUTUBE_TRANSCRIPT_API_TOKEN;

  if (!apiToken) {
    console.error('YOUTUBE_TRANSCRIPT_API_TOKEN no está configurado');
    throw new Error('API token no configurado');
  }

  console.log('[YouTube Transcript API] Environment check:', {
    hasToken: !!apiToken,
    tokenLength: apiToken?.length || 0,
    tokenPreview: apiToken ? `${apiToken.substring(0, 10)}...` : 'none',
    nodeEnv: process.env.NODE_ENV,
  });

  return apiToken;
}

/**
 * Maneja errores de fetch con categorización
 */
function handleFetchError(fetchError: unknown): never {
  if (fetchError instanceof Error && fetchError.name === 'AbortError') {
    throw new Error('Request timeout: La petición tardó más de 30 segundos');
  }
  const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
  throw new Error(`Network error: ${errorMessage}`);
}

/**
 * Valifica la respuesta HTTP y maneja errores específicos
 */
function validateResponse(response: Response): void {
  // Rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : 10;
    throw new Error(`Rate limit exceeded. Wait ${waitSeconds} seconds`);
  }

  // Errores de autenticación
  if (response.status === 401 || response.status === 403) {
    throw new Error('API token inválido o no autorizado');
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Parsea y valida la respuesta JSON
 */
async function parseResponseData(response: Response): Promise<unknown> {
  try {
    const data = await response.json();
    console.log('[YouTube Transcript API] Response data structure:', {
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'N/A',
    });
    return data;
  } catch (jsonError) {
    console.error('[YouTube Transcript API] Failed to parse JSON response:', jsonError);
    throw new Error('Invalid JSON response from API');
  }
}

/**
 * Extrae el array de transcripciones del formato de respuesta
 * Soporta múltiples formatos de API de youtube-transcript.io
 */
function extractTranscriptArray(videoData: Record<string, unknown>): unknown[] {
  const possiblePaths = [
    'transcript',           // Formato estándar
    'tracks',              // Formato con tracks
    'segments',            // Formato con segmentos
  ];

  for (const path of possiblePaths) {
    const value = videoData[path];
    if (Array.isArray(value)) {
      console.log(`[YouTube Transcript API] Found transcript in videoData.${path}`);
      return value;
    }
  }

  // Si videoData tiene text/start, es un solo item
  if (videoData.text && videoData.start !== undefined) {
    console.log('[YouTube Transcript API] videoData is a single transcript object');
    return [videoData];
  }

  // Si videoData es directamente un array
  if (Array.isArray(videoData)) {
    console.log('[YouTube Transcript API] videoData is directly an array');
    return videoData;
  }

  console.error('[YouTube Transcript API] Could not find transcript in response');
  throw new Error('No transcript data found in API response');
}

/**
 * Convierte items de transcripción al formato estándar
 */
function convertToStandardFormat(items: unknown[]): TranscriptItem[] {
  return items.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid transcript item');
    }
    const typed = item as Record<string, unknown>;
    return {
      text: String(typed.text || ''),
      start: Number(typed.start || 0) / 1000,
      duration: Number(typed.duration || 0) / 1000,
      offset: Number(typed.offset || 0),
    };
  });
}

/**
 * Obtiene la transcripción de YouTube usando youtube-transcript.io API
 * Refactorizada para reducir complejidad
 */
async function fetchYouTubeTranscript(videoId: string): Promise<TranscriptItem[]> {
  // 1. Obtener token de API
  const apiToken = getApiToken();

  // 2. Preparar request
  const apiUrl = 'https://www.youtube-transcript.io/api/transcripts';
  const requestBody = { ids: [videoId] };

  console.log('[YouTube Transcript API] Making request:', {
    url: apiUrl,
    method: 'POST',
    videoId,
    hasToken: !!apiToken,
  });

  // 3. Ejecutar fetch con timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    handleFetchError(error);
  } finally {
    clearTimeout(timeoutId);
  }

  console.log('[YouTube Transcript API] Response:', {
    status: response.status,
    ok: response.ok,
  });

  // 4. Validar respuesta
  validateResponse(response);

  // 5. Parsear JSON
  const data = await parseResponseData(response);

  // 6. Extraer y validar estructura de datos
  if (!Array.isArray(data) || data.length === 0) {
    console.error('[YouTube Transcript API] Invalid response format');
    throw new Error('No transcript data returned from API');
  }

  const firstItem = data[0];
  if (!firstItem || typeof firstItem !== 'object') {
    console.error('[YouTube Transcript API] First item is not an object');
    throw new Error('Invalid video data format');
  }
  const videoData = firstItem as Record<string, unknown>;
  console.log('[YouTube Transcript API] Video data keys:', Object.keys(videoData || {}));

  // 7. Extraer array de transcripciones (soporta múltiples formatos)
  const transcriptArray = extractTranscriptArray(videoData);

  // 8. Convertir a formato estándar
  return convertToStandardFormat(transcriptArray);
}

// Método fallback eliminado - ya no es necesario con la API implementada


