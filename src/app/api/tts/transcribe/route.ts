/**
 * API Route for Audio Transcription
 * Ruta API para transcripción de audio usando OpenAI Whisper
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

interface TranscribeRequestBody {
  file?: File;
}

interface WhisperVerboseJsonResponse {
  text: string;
  duration?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

interface WhisperTextResponse {
  text?: string;
}

// ============================================================
// CONFIGURATION
// ============================================================

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

// ============================================================
// VALIDATION
// ============================================================

function validateApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return apiKey;
}

function validateFormData(formData: FormData): { file: File; error?: string } {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { file: null as any, error: 'No file provided' };
  }

  // Validate file size (25MB max for Whisper API)
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return {
      file: null as any,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB`,
    };
  }

  // Validate file type
  const SUPPORTED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'];
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      file: null as any,
      error: `Unsupported file type: ${file.type}. Supported types: MP3, WAV, M4A`,
    };
  }

  return { file };
}

// ============================================================
// MAIN HANDLER
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    const apiKey = validateApiKey();

    // Parse form data
    const formData = await request.formData();

    // Validate file
    const { file, error: validationError } = validateFormData(formData);

    if (validationError || !file) {
      return NextResponse.json(
        { error: validationError || 'No file provided' },
        { status: 400 }
      );
    }

    // Get request options
    const model = formData.get('model') as string || 'whisper-1';
    const language = formData.get('language') as string || 'fr';
    const responseFormat = formData.get('response_format') as string || 'verbose_json';
    const temperature = formData.get('temperature') as string | null;
    const prompt = formData.get('prompt') as string | null;

    // Create request form data for OpenAI
    const openaiFormData = new FormData();
    openaiFormData.append('file', file);
    openaiFormData.append('model', model);
    openaiFormData.append('language', language);
    openaiFormData.append('response_format', responseFormat);

    if (prompt) {
      openaiFormData.append('prompt', prompt);
    }

    if (temperature !== null) {
      openaiFormData.append('temperature', temperature);
    }

    // Call OpenAI Whisper API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error?.message || `Transcription failed with status ${response.status}`,
          code: `HTTP_${response.status}`,
        },
        { status: response.status }
      );
    }

    // Parse response
    const data = await response.json();

    // Return success response
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Audio transcription error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS HANDLER (CORS)
// ============================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
