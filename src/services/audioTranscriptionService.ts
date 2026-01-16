/**
 * Audio Transcription Service
 * Servicio de transcripción de audio usando OpenAI Whisper API
 */

import { DEFAULT_LANGUAGE } from '@/config/languages';

// ============================================================
// TYPES
// ============================================================

export interface AudioTranscriptionOptions {
  language?: string;
  prompt?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestampGranularities?: ('word' | 'segment')[];
}

export interface AudioTranscriptionResult {
  transcript: string;
  duration: number;
  confidence: number;
  words?: TranscribedWord[];
}

export interface TranscribedWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avgLogprob: number;
  compressionRatio: number;
  noSpeechProb: number;
}

export interface AudioFileMetadata {
  name: string;
  size: number;
  type: string;
  duration?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'] as const;

type SupportedFormat = typeof SUPPORTED_FORMATS[number];

/**
 * Type guard to check if a mime type is a supported format
 */
function isSupportedFormat(mimeType: string): mimeType is SupportedFormat {
  return SUPPORTED_FORMATS.includes(mimeType as SupportedFormat);
}

const DEFAULT_TRANSCRIPTION_OPTIONS: AudioTranscriptionOptions = {
  language: DEFAULT_LANGUAGE,
  responseFormat: 'verbose_json',
  temperature: 0,
};

const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
} as const;

// ============================================================
// ERROR TYPES
// ============================================================

export class AudioTranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AudioTranscriptionError';
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Validates if a file is supported for transcription
 */
export function validateAudioFile(file: File): AudioFileMetadata {
  if (!file) {
    throw new AudioTranscriptionError('No file provided', 'NO_FILE', false);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AudioTranscriptionError(
      `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB`,
      'FILE_TOO_LARGE',
      false
    );
  }

  if (!isSupportedFormat(file.type)) {
    throw new AudioTranscriptionError(
      `Unsupported format: ${file.type}. Supported formats: MP3, WAV, M4A`,
      'UNSUPPORTED_FORMAT',
      false
    );
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Extracts duration from an audio file
 */
export async function extractAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new AudioTranscriptionError('Could not read audio file metadata', 'METADATA_ERROR', false));
    };

    audio.src = URL.createObjectURL(file);
  });
}

/**
 * Calculates delay with exponential backoff
 */
function calculateBackoff(attempt: number): number {
  const delay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Converts file to FormData for API request
 */
function createFormData(file: File, options: AudioTranscriptionOptions): FormData {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');

  if (options.language) {
    formData.append('language', options.language);
  }

  if (options.prompt) {
    formData.append('prompt', options.prompt);
  }

  if (options.responseFormat) {
    formData.append('response_format', options.responseFormat);
  }

  if (options.temperature !== undefined) {
    formData.append('temperature', options.temperature.toString());
  }

  if (options.timestampGranularities) {
    options.timestampGranularities.forEach(granularity => {
      formData.append('timestamp_granularities[]', granularity);
    });
  }

  return formData;
}

/**
 * Parses verbose JSON response from Whisper API
 */
function parseVerboseJsonResponse(data: unknown): AudioTranscriptionResult {
  if (typeof data !== 'object' || data === null) {
    throw new AudioTranscriptionError('Invalid response format', 'INVALID_RESPONSE', false);
  }

  const response = data as {
    text?: string;
    duration?: number;
    words?: TranscribedWord[];
    segments?: TranscriptionSegment[];
  };

  if (!response.text) {
    throw new AudioTranscriptionError('No transcription in response', 'NO_TRANSCRIPTION', false);
  }

  // Calculate average confidence from words if available
  let confidence = 0.8;
  if (response.words && response.words.length > 0) {
    const totalConfidence = response.words.reduce((sum, word) => sum + word.confidence, 0);
    confidence = totalConfidence / response.words.length;
  }

  return {
    transcript: response.text,
    duration: response.duration || 0,
    confidence,
    words: response.words,
  };
}

/**
 * Parses text-only response from Whisper API
 */
function parseTextResponse(text: string, duration: number): AudioTranscriptionResult {
  return {
    transcript: text,
    duration,
    confidence: 0.8, // Default confidence when not provided
  };
}

/**
 * Sleep utility for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// MAIN TRANSCRIPTION FUNCTION
// ============================================================

/**
 * Transcribes an audio file using OpenAI Whisper API
 *
 * @param file - Audio file to transcribe
 * @param options - Transcription options
 * @returns Transcription result with text, duration, and confidence
 *
 * @example
 * ```typescript
 * const result = await transcribeAudio(file, {
 *   language: 'fr',
 *   responseFormat: 'verbose_json',
 * });
 * console.log(result.transcript);
 * console.log(result.duration);
 * ```
 */
export async function transcribeAudio(
  file: File,
  options: Partial<AudioTranscriptionOptions> = {}
): Promise<AudioTranscriptionResult> {
  // Validate file
  validateAudioFile(file);

  // Extract duration
  let duration = 0;
  try {
    duration = await extractAudioDuration(file);
  } catch {
    // Duration is optional, continue without it
  }

  // Merge options with defaults
  const finalOptions: AudioTranscriptionOptions = {
    ...DEFAULT_TRANSCRIPTION_OPTIONS,
    ...options,
  };

  // Create form data
  const formData = createFormData(file, finalOptions);

  // Retry logic
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      // Call Next.js API route
      const response = await fetch('/api/tts/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AudioTranscriptionError(
          errorData.error || `Transcription failed with status ${response.status}`,
          `HTTP_${response.status}`,
          response.status >= 500 && response.status < 600
        );
      }

      const data = await response.json();

      // Parse response based on format
      if (finalOptions.responseFormat === 'verbose_json') {
        return parseVerboseJsonResponse(data);
      }

      return parseTextResponse(data.text || data, duration);

    } catch (error) {
      lastError = error as Error;

      // Don't retry if error is not retryable
      if (error instanceof AudioTranscriptionError && !error.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt >= RETRY_CONFIG.maxAttempts) {
        break;
      }

      // Wait before retrying
      const delay = calculateBackoff(attempt);
      await sleep(delay);
    }
  }

  // All retries failed
  throw lastError || new AudioTranscriptionError('Transcription failed after all retries', 'UNKNOWN', false);
}

/**
 * Fallback transcription method (manual entry)
 *
 * @param transcriptText - Manually entered transcript
 * @param estimatedDuration - Estimated duration in seconds
 * @returns Transcription result
 */
export function createManualTranscription(
  transcriptText: string,
  estimatedDuration: number = 300
): AudioTranscriptionResult {
  const wordCount = transcriptText.split(/\s+/).length;
  const estimatedWordsPerMinute = 150;
  const calculatedDuration = Math.max(estimatedDuration, (wordCount / estimatedWordsPerMinute) * 60);

  return {
    transcript: transcriptText,
    duration: calculatedDuration,
    confidence: 1.0, // Manual transcription is considered 100% confident
  };
}

/**
 * Converts transcription result to phrases for WordSelector
 *
 * @param result - Transcription result
 * @returns Array of phrases with timestamps
 */
export function convertTranscriptionToPhrases(
  result: AudioTranscriptionResult
): Array<{ text: string; start: number; duration: number }> {
  // If we have word-level timestamps, use them
  if (result.words && result.words.length > 0) {
    return result.words.map(word => ({
      text: word.word,
      start: word.start,
      duration: word.end - word.start,
    }));
  }

  // Otherwise, split by sentences and estimate timestamps
  const sentences = result.transcript.match(/[^.!?]+[.!?]+/g) || [result.transcript];
  const durationPerSentence = result.duration / sentences.length;

  return sentences.map((sentence, index) => ({
    text: sentence.trim(),
    start: index * durationPerSentence,
    duration: durationPerSentence,
  }));
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Formats duration in seconds to readable time string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Estimates word count from transcript
 */
export function estimateWordCount(transcript: string): number {
  return transcript.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates reading time for transcript
 */
export function estimateReadingTime(transcript: string, wordsPerMinute: number = 150): number {
  const wordCount = estimateWordCount(transcript);
  return Math.ceil(wordCount / wordsPerMinute);
}
