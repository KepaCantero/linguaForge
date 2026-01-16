/**
 * TTS API Route
 * Genera audio usando Web Speech API (client-side TTS)
 *
 * NOTA: Esta API valida las opciones y retorna metadatos.
 * La generación real de audio se hace en el cliente usando speechSynthesis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { TTS_VOICE_PRESETS, type TTSVoice, type TTSOptions } from '@/types/tts';
import { TTS_TEXT_LIMITS, FRENCH_VOICES, getVoicesForLanguage } from '@/config/tts';

// Validar opciones de TTS
function validateOptions(options: Partial<TTSOptions>): { isValid: boolean; error?: string } {
  if (options.rate !== undefined) {
    const rate = parseFloat(options.rate.toString());
    if (isNaN(rate) || rate < 0.5 || rate > 2.0) {
      return { isValid: false, error: 'Rate must be between 0.5 and 2.0' };
    }
  }

  if (options.pitch !== undefined) {
    const pitch = parseFloat(options.pitch.toString());
    if (isNaN(pitch) || pitch < 0.0 || pitch > 2.0) {
      return { isValid: false, error: 'Pitch must be between 0.0 and 2.0' };
    }
  }

  if (options.volume !== undefined) {
    const volume = parseFloat(options.volume.toString());
    if (isNaN(volume) || volume < 0.0 || volume > 1.0) {
      return { isValid: false, error: 'Volume must be between 0.0 and 1.0' };
    }
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'fr-FR-DeniseNeural', options = {}, language = 'fr' } = body;

    // Use centralized text limits from TTS config
    const { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } = TTS_TEXT_LIMITS;

    // Validar que exista texto
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Validar longitud
    if (text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be at least ${MIN_TEXT_LENGTH} character` },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text cannot exceed ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validar opciones
    const optionsValidation = validateOptions(options);
    if (!optionsValidation.isValid) {
      return NextResponse.json(
        { error: optionsValidation.error },
        { status: 400 }
      );
    }

    // Verificar que la voz existe using centralized config
    const voices = getVoicesForLanguage(language);
    const voiceExists = voices.some(v => v.id === voice || v.shortName === voice);
    if (!voiceExists) {
      return NextResponse.json(
        { error: `Voice "${voice}" not found for language "${language}"` },
        { status: 400 }
      );
    }

    // Retornar metadata para que el cliente genere el audio usando speechSynthesis
    return NextResponse.json({
      voice,
      text,
      textLength: text.length,
      duration: estimateDuration(text.length),
      wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
      // Instrucciones para el cliente
      clientSideGeneration: true,
      message: 'Use speechSynthesis API in the browser to generate audio',
    });

  } catch (error) {
    console.error('TTS generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate TTS metadata. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Estima la duración del audio basado en la longitud del texto
 * Asumiendo ~150 palabras por minuto y ~5 caracteres por palabra promedio
 */
function estimateDuration(charCount: number): number {
  const avgCharsPerWord = 5;
  const wordsPerMinute = 150;
  const wordCount = charCount / avgCharsPerWord;
  return Math.ceil((wordCount / wordsPerMinute) * 60); // en segundos
}

/**
 * GET handler para obtener voces disponibles
 */
export async function GET() {
  try {
    // Use centralized voice configuration
    return NextResponse.json({
      voices: FRENCH_VOICES,
      total: FRENCH_VOICES.length,
      presets: {
        beginner: TTS_VOICE_PRESETS.beginner,
        intermediate: TTS_VOICE_PRESETS.intermediate,
        advanced: TTS_VOICE_PRESETS.advanced,
      },
      textLimits: TTS_TEXT_LIMITS,
    });

  } catch (error) {
    console.error('Failed to get voices:', error);
    return NextResponse.json(
      { error: 'Failed to get available voices' },
      { status: 500 }
    );
  }
}
