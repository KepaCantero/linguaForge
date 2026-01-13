import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para traducción usando Google Translate API
 * En producción, configurar GOOGLE_TRANSLATE_API_KEY en .env.local
 */

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang = 'es', sourceLang = 'fr' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Usar Google Translate API (gratuita hasta cierto límite)
    // Alternativa: usar @vitalets/google-translate-api (sin API key)
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (apiKey) {
      // Usar Google Cloud Translate API oficial
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: sourceLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.data?.translations?.[0]?.translatedText || text;
      
      return NextResponse.json({
        translatedText,
        detectedSourceLanguage: data.data?.translations?.[0]?.detectedSourceLanguage,
      });
    } else {
      // Fallback: usar una API gratuita alternativa (MyMemory Translation API)
      const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(fallbackUrl);
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.responseData?.translatedText || text;
      
      return NextResponse.json({
        translatedText,
        detectedSourceLanguage: sourceLang,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

