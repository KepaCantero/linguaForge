import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para obtener información básica de un video de YouTube
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'videoId is required' },
      { status: 400 }
    );
  }

  try {
    // Obtener información del video desde oEmbed API de YouTube
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }

    const data = await response.json();

    // Estimar duración (oEmbed no proporciona duración, usar valor por defecto)
    // En producción, podrías usar la API de YouTube Data v3 para obtener duración real
    const duration = 300; // 5 minutos por defecto

    return NextResponse.json({
      title: data.title || `Video ${videoId}`,
      duration,
      thumbnail: data.thumbnail_url,
      author: data.author_name,
    });
  } catch {

    // Retornar valores por defecto en caso de error
    return NextResponse.json({
      title: `Video ${videoId}`,
      duration: 300,
      thumbnail: null,
      author: null,
    });
  }
}

