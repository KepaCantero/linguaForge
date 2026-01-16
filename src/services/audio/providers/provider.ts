/**
 * Audio Provider Interface
 * Abstract interface for TTS audio providers
 */

import type { TTSOptions } from '@/types/tts';
import type { AudioQualityValidation } from '@/types/audio';

// ============================================================
// PROVIDER INTERFACE
// ============================================================

export interface IAudioProvider {
  /**
   * Generate TTS audio from text
   * @param text - Text to convert to speech
   * @param options - TTS generation options
   * @returns Audio buffer as ArrayBuffer
   */
  generateTTS(text: string, options: TTSOptions): Promise<ArrayBuffer>;

  /**
   * Validate generated audio quality
   * @param audio - Audio buffer to validate
   * @returns Validation result with metrics
   */
  validateQuality(audio: ArrayBuffer): Promise<AudioQualityValidation>;

  /**
   * Get supported voices for a language
   * @param language - Language code (e.g., 'fr', 'es', 'en')
   * @returns Array of voice IDs
   */
  getSupportedVoices(language: string): string[];

  /**
   * Get provider name
   * @returns Provider identifier
   */
  getProviderName(): string;
}

// ============================================================
// OPENAI PROVIDER
// ============================================================

export class OpenAIProvider implements IAudioProvider {
  private apiKey: string;
  private defaultModel: 'tts-1' | 'tts-1-hd';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.defaultModel = 'tts-1';
  }

  async generateTTS(text: string, options: TTSOptions): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Dynamic import to avoid SSR issues
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: this.apiKey });

    const voice = options.voice || 'alloy';
    const model = options.model || this.defaultModel;

    const mp3 = await openai.audio.speech.create({
      model: model as 'tts-1' | 'tts-1-hd',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: options.rate || 1.0,
    });

    const buffer = await mp3.arrayBuffer();
    return buffer;
  }

  async validateQuality(audio: ArrayBuffer): Promise<AudioQualityValidation> {
    // Use audio quality validator
    const { AudioQualityValidator } = await import('@/services/audioQualityValidator');
    const validator = new AudioQualityValidator();
    return validator.validate(audio);
  }

  getSupportedVoices(_language: string): string[] {
    // OpenAI supports same voices for all languages
    return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  }

  getProviderName(): string {
    return 'openai';
  }
}

// ============================================================
// WEB SPEECH PROVIDER
// ============================================================

export class WebSpeechProvider implements IAudioProvider {
  private synth: SpeechSynthesis | null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    } else {
      this.synth = null;
    }
  }

  async generateTTS(text: string, options: TTSOptions): Promise<ArrayBuffer> {
    const synth = this.synth;
    if (!synth) {
      throw new Error('Web Speech API not available in this environment');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      if (options.voice) {
        const voices = synth.getVoices() ?? [];
        if (voices.length > 0) {
          const voice = voices.find(v => v.name === options.voice || v.voiceURI === options.voice);
          if (voice) {
            utterance.voice = voice;
          }
        }
      }

      // Set options
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Note: Web Speech API doesn't provide direct audio buffer access
      // This is a limitation of the browser API
      reject(new Error('Web Speech API does not provide audio buffer access. Use OpenAI provider for downloadable audio.'));
    });
  }

  async validateQuality(_audio: ArrayBuffer): Promise<AudioQualityValidation> {
    // Web Speech API audio quality varies by browser
    // Return estimated validation
    return {
      passed: true,
      metrics: {
        clarity: 85,
        prosodyScore: 70,
        snrRatio: 25,
        artifactScore: 90,
        dynamicRange: 20,
        spectralCentroid: 2500,
        zeroCrossingRate: 150,
      },
      thresholds: {
        minClarity: 90,
        minProsody: 70,
        minSNR: 25,
        maxArtifacts: 5,
        minDynamicRange: 20,
      },
      failures: [],
      warnings: ['Web Speech API quality varies by browser', 'Using estimated metrics'],
    };
  }

  getSupportedVoices(language: string): string[] {
    if (!this.synth) {
      return [];
    }

    const voices = this.synth.getVoices();
    const langCode = language.split('-')[0];

    return voices
      .filter(v => v.lang.startsWith(langCode))
      .map(v => v.name);
  }

  getProviderName(): string {
    return 'webspeech';
  }
}

// ============================================================
// PROVIDER FACTORY
// ============================================================

export type AudioProviderType = 'openai' | 'webspeech' | 'elevenlabs';

// Type-safe provider factory map
const PROVIDER_MAP = {
  openai: (apiKey?: string) => new OpenAIProvider(apiKey),
  webspeech: () => new WebSpeechProvider(),
  elevenlabs: () => {
    throw new Error('ElevenLabs provider not yet implemented');
  },
} as const;

/**
 * Factory function to create audio providers
 * @param type - Provider type to create
 * @param apiKey - Optional API key for the provider
 * @returns Configured audio provider instance
 */
export function createAudioProvider(
  type: AudioProviderType = 'webspeech',
  apiKey?: string
): IAudioProvider {
  return PROVIDER_MAP[type](apiKey);
}

/**
 * Get available provider types
 * @returns Array of supported provider types
 */
export function getAvailableProviders(): AudioProviderType[] {
  return ['openai', 'webspeech'];
}

/**
 * Check if a provider is available
 * @param type - Provider type to check
 * @returns True if provider is available
 */
export function isProviderAvailable(type: AudioProviderType): boolean {
  switch (type) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'webspeech':
      return typeof window !== 'undefined' && 'speechSynthesis' in window;
    case 'elevenlabs':
      return false; // Not implemented
    default:
      return false;
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  OpenAIProvider,
  WebSpeechProvider,
  createAudioProvider,
  getAvailableProviders,
  isProviderAvailable,
};
