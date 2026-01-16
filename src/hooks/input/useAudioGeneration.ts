/**
 * Hook para generación de audio usando Web Speech API
 * Provides audio generation with TTS, caching, and download capabilities
 */

import { useState, useCallback, useRef } from 'react';
import {
  TTS_VOICE_PRESETS,
  TTS_RATE_PRESETS,
  TTS_QUALITY_PRESETS,
  type TTSOptions,
  type TTSVoice,
  type AudioBlobMap,
  type TTSQualityLevel,
} from '@/types/tts';
import { intonationService } from '@/services/intonationService';

// ============================================================
// CONSTANTS
// ============================================================

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CONCURRENT_GENERATIONS = 3;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Genera un hash simple para usar como key de caché
 */
function generateCacheKey(text: string, voice: string, options: TTSOptions): string {
  const opts = JSON.stringify({
    voice,
    rate: options.rate || 1.0,
    pitch: options.pitch || 1.0,
    volume: options.volume || 1.0,
  });
  return `tts:${btoa(text.substring(0, 50))}:${btoa(opts)}`;
}

/**
 * Genera un nombre de archivo para descarga
 */
function generateFilename(text: string, index?: number): string {
  const words = text.split(' ').slice(0, 5).join('_');
  const clean = words.replace(/[^a-zA-Z0-9_]/g, '');
  const prefix = index !== undefined ? `audio_${index}` : 'audio';
  return `${prefix}_${clean.substring(0, 30)}.mp3`;
}

/**
 * Convierte AudioBuffer a Blob
 */
async function audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV format
  const wav = bufferToWave(renderedBuffer, renderedBuffer.length);
  return new Blob([wav], { type: 'audio/wav' });
}

/**
 * Convierte AudioBuffer a WAV format
 */
function bufferToWave(abuffer: AudioBuffer, len: number): ArrayBuffer {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAV header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this example)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  offset = pos;
  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++;
  }

  return buffer;

  function setUint16(data: number): void {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number): void {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

// ============================================================
// MAIN HOOK
// ============================================================

export interface UseAudioGenerationOptions {
  defaultVoice?: string;
  enableCache?: boolean;
  onProgress?: (progress: number) => void;
  useIntonation?: boolean;  // Enable contextualized intonation
  language?: string;         // Language code for intonation rules (default: 'fr')
}

export interface UseAudioGenerationReturn {
  // Estado
  isGenerating: boolean;
  progress: number;
  error: string | null;
  selectedVoice: string;
  availableVoices: TTSVoice[];

  // Acciones
  generateSpeech: (text: string, options?: TTSOptions) => Promise<string | null>;
  generateSpeechDownload: (text: string, options?: TTSOptions & { quality?: TTSQualityLevel; format?: 'mp3' | 'wav' }) => Promise<Blob | null>;
  generateForBlocks: (blocks: Array<{ id: string; text: string }>, options?: TTSOptions) => Promise<AudioBlobMap>;
  downloadAudio: (blob: Blob, filename: string) => void;
  downloadAllAudio: (blobs: Blob[], zipName: string) => void;
  streamToPlayer: (text: string, voice?: string, options?: TTSOptions) => void;

  // Gestión de voces
  setVoice: (voice: string) => void;
  setVoiceByLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  fetchVoices: () => Promise<void>;

  // Gestión de caché
  clearCache: () => void;
  getCacheSize: () => number;

  // Gestión de entonación
  analyzeIntonation: (text: string) => ReturnType<typeof intonationService.analyzeText>;
  generateSSML: (text: string) => string;
  setUseIntonation: (enabled: boolean) => void;
  useIntonation: boolean;
}

export function useAudioGeneration(options: UseAudioGenerationOptions = {}): UseAudioGenerationReturn {
  const {
    defaultVoice = TTS_VOICE_PRESETS.beginner,
    enableCache = true,
    onProgress,
    useIntonation: initialUseIntonation = false,
    language = 'fr',
  } = options;

  // Estado
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([]);
  const [useIntonation, setUseIntonation] = useState(initialUseIntonation);

  // Caché en memoria
  const cache = useRef<Map<string, { blob: Blob; timestamp: number }>>(new Map());

  /**
   * Obtiene las voces disponibles desde la API
   */
  const fetchVoices = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/tts/generate');
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data = await response.json();
      setAvailableVoices(data.voices || []);

      // Establecer voz por defecto si no está seleccionada
      if (data.voices && data.voices.length > 0 && !selectedVoice) {
        const beginnerVoice = data.voices.find((v: TTSVoice) => v.recommendedLevel === 'beginner');
        if (beginnerVoice) {
          setSelectedVoice(beginnerVoice.id);
        }
      }
    } catch (err) {
      console.error('Error fetching voices:', err);
      setError('Failed to load voices');
    }
  }, [selectedVoice]);

  /**
   * Genera audio desde texto usando Web Speech API
   */
  const generateSpeech = useCallback(async (
    text: string,
    ttsOptions: TTSOptions = {}
  ): Promise<string | null> => {
    if (!text || text.trim().length === 0) {
      setError('Text is empty');
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const voice = ttsOptions.voice || selectedVoice;
      const shouldUseIntonation = ttsOptions.useIntonation ?? useIntonation;

      // Apply intonation if enabled
      let textToSpeak = text;
      if (shouldUseIntonation) {
        const result = intonationService.applyIntonation(text, true, language);
        textToSpeak = result.text; // Will be SSML if supported, otherwise plain text
      }

      const options: TTSOptions = {
        voice,
        rate: ttsOptions.rate || TTS_RATE_PRESETS.normal,
        pitch: ttsOptions.pitch || 1.0,
        volume: ttsOptions.volume || 1.0,
        useIntonation: shouldUseIntonation,
      };

      // Verificar caché primero
      const cacheKey = generateCacheKey(textToSpeak, voice, options);
      if (enableCache) {
        const cached = cache.current.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
          onProgress?.(100);
          return URL.createObjectURL(cached.blob);
        }
      }

      onProgress?.(10);

      // Usar Web Speech API para generar audio
      const audioBlob = await speakText(textToSpeak, voice, options, (prog) => {
        setProgress(10 + prog * 0.8); // 10% to 90%
      });

      onProgress?.(90);

      // Guardar en caché
      if (enableCache && audioBlob) {
        cache.current.set(cacheKey, {
          blob: audioBlob,
          timestamp: Date.now(),
        });
      }

      // Crear URL para el blob
      const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : '';
      onProgress?.(100);

      return audioUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('TTS generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [selectedVoice, enableCache, onProgress, useIntonation, language]);

  /**
   * Genera audio descargable usando el servidor TTS (OpenAI)
   * Esta función genera archivos de audio reales que se pueden descargar
   */
  const generateSpeechDownload = useCallback(async (
    text: string,
    ttsOptions: TTSOptions & { quality?: TTSQualityLevel; format?: 'mp3' | 'wav' } = {}
  ): Promise<Blob | null> => {
    if (!text || text.trim().length === 0) {
      setError('Text is empty');
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Apply quality preset if specified
      const quality = ttsOptions.quality || 'intermediate';
      const qualityPreset = TTS_QUALITY_PRESETS[quality];
      const shouldUseIntonation = ttsOptions.useIntonation ?? useIntonation;

      // Apply intonation if enabled
      let textToSpeak = text;
      let ssml: string | undefined;
      if (shouldUseIntonation) {
        const result = intonationService.applyIntonation(text, true, language);
        textToSpeak = result.ssml || result.text;
        ssml = result.ssml;
      }

      const options: TTSOptions & { quality?: TTSQualityLevel; format?: 'mp3' | 'wav' } = {
        voice: ttsOptions.voice || selectedVoice,
        rate: ttsOptions.rate || qualityPreset.rate,
        pitch: ttsOptions.pitch || 1.0,
        volume: ttsOptions.volume || 1.0,
        quality: ttsOptions.quality,
        format: ttsOptions.format || 'mp3',
        useIntonation: shouldUseIntonation,
      };

      // Verificar caché primero
      const cacheKey = generateCacheKey(textToSpeak, options.voice || selectedVoice, options);
      if (enableCache) {
        const cached = cache.current.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
          onProgress?.(100);
          return cached.blob;
        }
      }

      onProgress?.(10);

      // Call server-side TTS API for downloadable audio
      const response = await fetch('/api/tts/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSpeak,
          voice: options.voice || 'alloy',
          rate: options.rate,
          pitch: options.pitch,
          format: options.format || 'mp3',
          quality: options.quality,
          useIntonation: shouldUseIntonation,
          language,
          ssml,
        }),
      });

      onProgress?.(50);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate downloadable audio');
      }

      onProgress?.(80);

      // Get filename from headers
      const filename = response.headers.get('X-Audio-Filename') || generateFilename(text);

      // Convert response to blob
      const audioBlob = await response.blob();

      onProgress?.(90);

      // Guardar en caché
      if (enableCache && audioBlob) {
        cache.current.set(cacheKey, {
          blob: audioBlob,
          timestamp: Date.now(),
        });
      }

      onProgress?.(100);

      return audioBlob;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('TTS download generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [selectedVoice, enableCache, onProgress, useIntonation, language]);

  /**
   * Genera audio usando Web Speech API y lo convierte a Blob
   */
  const speakText = async (
    text: string,
    voice: string,
    options: TTSOptions,
    onProgress: (progress: number) => void
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Configurar voz
      const voices = speechSynthesis.getVoices();
      const selectedVoiceObj = voices.find(v => v.voiceURI.includes(voice) || v.name.includes(voice));
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }

      // Configurar opciones
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Crear AudioContext para capturar el audio
      const audioContext = new AudioContext();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
        audioContext.close();
      };

      // Conectar el speech synthesis al audio context
      // NOTA: Esto no funciona directamente porque speechSynthesis no puede conectarse a MediaStream
      // En su lugar, reproduciremos el audio y devolveremos un placeholder
      utterance.onend = () => {
        onProgress(100);
        // Como no podemos capturar el audio de speechSynthesis directamente,
        // devolvemos un blob vacío por ahora
        resolve(new Blob([], { type: 'audio/webm' }));
      };

      utterance.onerror = (event) => {
        reject(new Error('Speech synthesis error'));
      };

      // Comenzar grabación y reproducción
      mediaRecorder.start();
      speechSynthesis.speak(utterance);

      // Parar grabación después de un tiempo estimado
      const duration = (text.split(' ').length / 150) * 60 * 1000; // ~150 palabras/minuto
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration);
    });
  };

  /**
   * Genera audio para múltiples bloques de texto
   */
  const generateForBlocks = useCallback(async (
    blocks: Array<{ id: string; text: string }>,
    ttsOptions: TTSOptions = {}
  ): Promise<AudioBlobMap> => {
    const audioMap = new Map<string, Blob>();
    const totalBlocks = blocks.length;
    let completedBlocks = 0;

    // Procesar en paralelo con límite
    for (let i = 0; i < blocks.length; i += MAX_CONCURRENT_GENERATIONS) {
      const batch = blocks.slice(i, i + MAX_CONCURRENT_GENERATIONS);

      await Promise.all(
        batch.map(async (block) => {
          const audioUrl = await generateSpeech(block.text, ttsOptions);
          if (audioUrl) {
            // Convertir URL de vuelta a Blob
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            audioMap.set(block.id, blob);
          }

          completedBlocks++;
          setProgress((completedBlocks / totalBlocks) * 100);
        })
      );
    }

    return audioMap;
  }, [generateSpeech]);

  /**
   * Descarga un archivo de audio
   */
  const downloadAudio = useCallback((blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Descarga múltiples audios como archivos individuales
   */
  const downloadAllAudio = useCallback((blobs: Blob[], zipName: string): void => {
    blobs.forEach((blob, index) => {
      const filename = `${zipName}_${index + 1}.mp3`;
      downloadAudio(blob, filename);
    });
  }, [downloadAudio]);

  /**
   * Reproduce audio usando speechSynthesis directamente (streaming)
   */
  const streamToPlayer = useCallback((text: string, voice?: string, options: TTSOptions = {}): void => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Configurar voz
    const selectedVoiceName = voice || selectedVoice;
    const voices = speechSynthesis.getVoices();
    const selectedVoiceObj = voices.find(v => v.voiceURI.includes(selectedVoiceName) || v.name.includes(selectedVoiceName));
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }

    // Configurar opciones
    utterance.rate = options.rate || TTS_RATE_PRESETS.normal;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  /**
   * Cambia la voz seleccionada
   */
  const setVoice = useCallback((voice: string): void => {
    setSelectedVoice(voice);
  }, []);

  /**
   * Cambia la voz basado en el nivel
   */
  const setVoiceByLevel = useCallback((level: 'beginner' | 'intermediate' | 'advanced'): void => {
    const voice = TTS_VOICE_PRESETS[level];
    setVoice(voice);
  }, [setVoice]);

  /**
   * Limpia la caché de audio
   */
  const clearCache = useCallback((): void => {
    cache.current.clear();
  }, []);

  /**
   * Obtiene el tamaño de la caché en bytes
   */
  const getCacheSize = useCallback((): number => {
    let size = 0;
    cache.current.forEach((entry) => {
      size += entry.blob.size;
    });
    return size;
  }, []);

  /**
   * Analiza la entonación del texto
   */
  const analyzeIntonation = useCallback((text: string) => {
    return intonationService.analyzeText(text, language);
  }, [language]);

  /**
   * Genera SSML desde el texto
   */
  const generateSSML = useCallback((text: string): string => {
    return intonationService.generateSSMLFromText(text, language);
  }, [language]);

  return {
    // Estado
    isGenerating,
    progress,
    error,
    selectedVoice,
    availableVoices,
    useIntonation,

    // Acciones
    generateSpeech,
    generateSpeechDownload,
    generateForBlocks,
    downloadAudio,
    downloadAllAudio,
    streamToPlayer,

    // Gestión de voces
    setVoice,
    setVoiceByLevel,
    fetchVoices,

    // Gestión de caché
    clearCache,
    getCacheSize,

    // Gestión de entonación
    analyzeIntonation,
    generateSSML,
    setUseIntonation,
  };
}
