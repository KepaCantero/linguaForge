/**
 * Servicio de traducción automática
 * Usa la API de Google Translate (gratuita) o una alternativa
 */

interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

/**
 * Traduce texto de francés a español usando Google Translate API
 * En producción, usar una API key de Google Cloud Translate
 */
export async function translateToSpanish(text: string): Promise<string> {
  try {
    // Usar la API route de Next.js para evitar problemas de CORS
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang: 'es',
        sourceLang: 'fr',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Error translating text:', error);
    // Fallback: retornar el texto original si falla la traducción
    return text;
  }
}

/**
 * Traduce múltiples palabras en paralelo
 */
export async function translateWords(words: string[]): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};
  
  // Traducir en lotes para evitar demasiadas peticiones
  const batchSize = 10;
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    const promises = batch.map(async (word) => {
      const translation = await translateToSpanish(word);
      return { word, translation };
    });
    
    const results = await Promise.all(promises);
    results.forEach(({ word, translation }) => {
      translations[word] = translation;
    });
    
    // Pequeña pausa entre lotes para evitar rate limiting
    if (i + batchSize < words.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return translations;
}

