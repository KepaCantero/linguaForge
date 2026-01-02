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

interface YouTubeTranscriptIOResponse {
  videoId: string;
  transcript: Array<{
    text: string;
    start: number;
    duration: number;
  }>;
}

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

/**
 * Obtiene la transcripción de YouTube usando youtube-transcript.io API
 * Esta API es más confiable que el scraping manual
 */
async function fetchYouTubeTranscript(videoId: string): Promise<TranscriptItem[]> {
  // TODO: Mover el token a variable de entorno (.env.local) antes de producción
  // Token hardcodeado temporalmente - NO COMMITEAR ESTO A PRODUCCIÓN
  const apiToken = process.env.YOUTUBE_TRANSCRIPT_API_TOKEN || '695811745bddf83b19b86ef5';
  
  console.log('[YouTube Transcript API] Environment check:', {
    hasToken: !!apiToken,
    tokenLength: apiToken?.length || 0,
    tokenPreview: apiToken ? `${apiToken.substring(0, 10)}...` : 'none',
    nodeEnv: process.env.NODE_ENV,
    usingHardcoded: !process.env.YOUTUBE_TRANSCRIPT_API_TOKEN,
  });
  
  if (!apiToken) {
    console.error('YOUTUBE_TRANSCRIPT_API_TOKEN no está configurado. Verifica tu archivo .env.local');
    throw new Error('API token no configurado. Por favor, configura YOUTUBE_TRANSCRIPT_API_TOKEN en .env.local');
  }

  try {
    const apiUrl = 'https://www.youtube-transcript.io/api/transcripts';
    const requestBody = {
      ids: [videoId],
    };
    
    console.log('[YouTube Transcript API] Making request:', {
      url: apiUrl,
      method: 'POST',
      videoId,
      hasToken: !!apiToken,
      requestBody,
    });
    
    const fetchStartTime = Date.now();
    
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 segundos timeout
    
    let response: Response;
    try {
      console.log('[YouTube Transcript API] Starting fetch...');
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: La petición tardó más de 30 segundos');
      }
      throw new Error(`Network error: ${fetchError.message}`);
    }
    
    const fetchDuration = Date.now() - fetchStartTime;
    console.log('[YouTube Transcript API] Response received:', {
      status: response.status,
      statusText: response.statusText,
      duration: `${fetchDuration}ms`,
      ok: response.ok,
    });

    // Manejar rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 10;
      throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds before trying again.`);
    }

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`[YouTube Transcript API] API error response:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500),
        });
      } catch (e) {
        console.error(`[YouTube Transcript API] Failed to read error response body`);
      }
      
      // Mensajes de error más específicos
      if (response.status === 401 || response.status === 403) {
        throw new Error('API token inválido o no autorizado. Verifica tu YOUTUBE_TRANSCRIPT_API_TOKEN');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText.substring(0, 200)}`);
    }

    let data: any;
    try {
      data = await response.json();
      console.log('[YouTube Transcript API] Response data structure:', {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        keys: !Array.isArray(data) && data ? Object.keys(data) : 'N/A',
        fullResponse: JSON.stringify(data).substring(0, 1000), // Mostrar más del response
      });
    } catch (jsonError) {
      console.error('[YouTube Transcript API] Failed to parse JSON response:', jsonError);
      const textResponse = await response.text();
      console.error('[YouTube Transcript API] Raw response:', textResponse.substring(0, 1000));
      throw new Error('Invalid JSON response from API');
    }
    
    // La API de youtube-transcript.io devuelve un array de resultados
    // Cada resultado tiene: { videoId: string, transcript: Array<{text, start, duration}> }
    if (!Array.isArray(data) || data.length === 0) {
      console.error('[YouTube Transcript API] Invalid response format - not an array or empty:', {
        type: typeof data,
        isArray: Array.isArray(data),
        data: JSON.stringify(data).substring(0, 500),
      });
      throw new Error('No transcript data returned from API - response is not an array');
    }

    const videoData = data[0] as any;
    console.log('[YouTube Transcript API] Video data structure:', {
      hasVideoId: !!videoData?.videoId,
      hasTranscript: !!videoData?.transcript,
      transcriptIsArray: Array.isArray(videoData?.transcript),
      transcriptLength: videoData?.transcript?.length,
      allKeys: Object.keys(videoData || {}),
      fullVideoData: JSON.stringify(videoData).substring(0, 1000),
    });
    
    // Verificar diferentes posibles estructuras de respuesta
    let transcriptArray: any[] = [];
    
    // Caso 1: videoData.transcript es un array (formato esperado original)
    if (videoData?.transcript && Array.isArray(videoData.transcript)) {
      transcriptArray = videoData.transcript;
      console.log('[YouTube Transcript API] Found transcript array in videoData.transcript');
    } 
    // Caso 2: videoData.tracks contiene la transcripción (formato de youtube-transcript.io)
    else if (videoData?.tracks && Array.isArray(videoData.tracks)) {
      // Los tracks pueden tener diferentes formatos, buscar el que tenga transcript
      const trackWithTranscript = videoData.tracks.find((track: any) => 
        track.transcript && Array.isArray(track.transcript)
      );
      if (trackWithTranscript?.transcript) {
        transcriptArray = trackWithTranscript.transcript;
        console.log('[YouTube Transcript API] Found transcript in videoData.tracks[].transcript');
      } else if (videoData.tracks.length > 0 && videoData.tracks[0].text) {
        // Si tracks es directamente un array de items de transcripción
        transcriptArray = videoData.tracks;
        console.log('[YouTube Transcript API] Found transcript directly in videoData.tracks');
      }
    }
    // Caso 3: videoData es directamente un array de transcripciones
    else if (Array.isArray(videoData)) {
      transcriptArray = videoData;
      console.log('[YouTube Transcript API] videoData is directly an array');
    } 
    // Caso 4: videoData tiene propiedades text/start (objeto único)
    else if (videoData?.text && videoData?.start !== undefined) {
      transcriptArray = [videoData];
      console.log('[YouTube Transcript API] videoData is a single transcript object');
    }
    // Caso 5: Buscar en otras propiedades posibles
    else if (videoData?.segments && Array.isArray(videoData.segments)) {
      transcriptArray = videoData.segments;
      console.log('[YouTube Transcript API] Found transcript in videoData.segments');
    }
    else if (videoData?.items && Array.isArray(videoData.items)) {
      transcriptArray = videoData.items;
      console.log('[YouTube Transcript API] Found transcript in videoData.items');
    }
    else {
      // Log detallado para debugging
      console.error('[YouTube Transcript API] Could not find transcript array. Structure:', {
        keys: Object.keys(videoData || {}),
        tracksType: typeof videoData?.tracks,
        tracksIsArray: Array.isArray(videoData?.tracks),
        tracksLength: Array.isArray(videoData?.tracks) ? videoData.tracks.length : 'N/A',
        tracksPreview: videoData?.tracks ? JSON.stringify(videoData.tracks).substring(0, 500) : 'N/A',
        fullVideoData: JSON.stringify(videoData, null, 2).substring(0, 2000),
      });
      throw new Error(`Invalid transcript format from API - transcript array not found. Available keys: ${Object.keys(videoData || {}).join(', ')}. Check logs for details.`);
    }

    // Convertir al formato esperado
    const transcriptItems: TranscriptItem[] = transcriptArray.map((item: any) => {
      // Manejar diferentes formatos posibles
      const text = item.text || item.utf8 || item.content || '';
      const start = item.start !== undefined ? item.start : (item.tStartMs !== undefined ? item.tStartMs / 1000 : 0);
      const duration = item.duration !== undefined 
        ? item.duration 
        : (item.dDurationMs !== undefined ? item.dDurationMs / 1000 : 0);
      
      return {
        text: String(text).trim(),
        start: Number(start),
        duration: Number(duration) || 0,
      };
    }).filter((item: TranscriptItem) => item.text.length > 0);

    if (transcriptItems.length === 0) {
      console.error('[YouTube Transcript API] No valid transcript items found after parsing');
      throw new Error('Empty transcript returned from API');
    }

    console.log(`[YouTube Transcript API] Successfully parsed ${transcriptItems.length} transcript items`);
    return transcriptItems;
  } catch (error) {
    console.error('[YouTube Transcript API] Error fetching transcript from youtube-transcript.io API:', error);
    
    // Re-lanzar el error con más contexto
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching transcript');
  }
}

/**
 * Método fallback usando scraping manual (solo si la API falla)
 */
async function fetchYouTubeTranscriptFallback(videoId: string): Promise<TranscriptItem[]> {
  console.error('[YouTube Transcript API] Fallback llamado pero no disponible');
  throw new Error('API token no configurado. Por favor:\n1. Crea el archivo .env.local en la raíz del proyecto\n2. Agrega: YOUTUBE_TRANSCRIPT_API_TOKEN=tu-token-aqui\n3. Reinicia el servidor (detén y vuelve a ejecutar npm run dev)');
}


