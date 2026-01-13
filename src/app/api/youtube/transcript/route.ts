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

  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

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
    // Obtener transcripción usando youtube-transcript.io API
    const transcript = await fetchYouTubeTranscript(videoId);

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // TODO: Add proper logging service for API errors
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
    throw new Error('API token no configurado');
  }

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
    return data;
  } catch {
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
      return value;
    }
  }

  // Si videoData tiene text/start, es un solo item
  if (videoData.text && videoData.start !== undefined) {
    return [videoData];
  }

  // Si videoData es directamente un array
  if (Array.isArray(videoData)) {
    return videoData;
  }

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

  // 4. Validar respuesta
  validateResponse(response);

  // 5. Parsear JSON
  const data = await parseResponseData(response);

  // 6. Extraer y validar estructura de datos
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No transcript data returned from API');
  }

  const firstItem = data[0];
  if (!firstItem || typeof firstItem !== 'object') {
    throw new Error('Invalid video data format');
  }
  const videoData = firstItem as Record<string, unknown>;

  // 7. Extraer array de transcripciones (soporta múltiples formatos)
  const transcriptArray = extractTranscriptArray(videoData);

  // 8. Convertir a formato estándar
  return convertToStandardFormat(transcriptArray);
}

// Método fallback eliminado - ya no es necesario con la API implementada


