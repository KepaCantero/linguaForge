/**
 * Text-to-Speech Service using Web Speech API
 * Multi-language support with voice selection per language
 */

import type { SupportedLanguage } from '@/lib/constants';
import { getLanguageConfig } from '@/lib/languageConfig';
import { useProgressStore } from '@/store/useProgressStore';

type TTSCallback = () => void;

export class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentLanguage: SupportedLanguage;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor(language: SupportedLanguage = 'de') {
    this.currentLanguage = language;

    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.initVoice();
    }
  }

  /**
   * Cambia el idioma actual del servicio TTS
   * @param language - Nuevo idioma a usar
   */
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    this.currentVoice = null;
    this.isInitialized = false;
    this.selectBestVoice();
  }

  /**
   * Obtiene el idioma actual
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  private initVoice() {
    if (!this.synth) return;

    // Try to get voices immediately
    this.selectBestVoice();

    // Also listen for voiceschanged event (needed for some browsers)
    this.synth.onvoiceschanged = () => {
      this.selectBestVoice();
    };
  }

  /**
   * Selecciona la mejor voz disponible para el idioma actual
   */
  private selectBestVoice() {
    if (!this.synth) return;

    const voices = this.synth.getVoices();
    const config = getLanguageConfig(this.currentLanguage);

    // Try to find a preferred voice
    for (const preferred of config.voice.preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) {
        this.currentVoice = voice;
        this.isInitialized = true;
        return;
      }
    }

    // Fallback: any voice matching the language codes
    const voice = voices.find(v =>
      config.voice.langCodes.some(code =>
        v.lang.startsWith(code) || v.lang === code
      )
    );

    if (voice) {
      this.currentVoice = voice;
      this.isInitialized = true;
    }
  }

  /**
   * Speak text in the current language
   * @param text - Text to speak
   * @param onEnd - Callback when speech ends
   * @param onStart - Callback when speech starts
   */
  speak(text: string, onEnd?: TTSCallback, onStart?: TTSCallback): void {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const config = getLanguageConfig(this.currentLanguage);

    // Set voice if available
    if (this.currentVoice) {
      utterance.voice = this.currentVoice;
    }

    // Configure for natural speech
    utterance.lang = config.voice.ttsLang;
    utterance.rate = config.voice.rate;      // Language-specific rate
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (event) => {
      import('@/services/logger').then(({ logger }) => {
        logger.serviceError('ttsService', 'TTS speech error', event, { text });
      });
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  /**
   * Speak with a Promise interface
   * @param text - Text to speak
   * @returns Promise that resolves when speech ends
   */
  speakAsync(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.speak(text, resolve);
    });
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    this.synth?.cancel();
  }

  /**
   * Check if TTS is available and has a voice for current language
   */
  isAvailable(): boolean {
    return this.isInitialized && this.currentVoice !== null;
  }

  /**
   * Get the current voice name
   */
  getVoiceName(): string {
    return this.currentVoice?.name || 'Default';
  }

  /**
   * Get available voices for the current language
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const config = getLanguageConfig(this.currentLanguage);
    return this.synth.getVoices().filter(v =>
      config.voice.langCodes.some(code =>
        v.lang.startsWith(code) || v.lang === code
      )
    );
  }
}

// ============================================
// SINGLETON CON INSTANCIA POR IDIOMA
// ============================================

class TTSManager {
  private instances: Map<string, TTSService> = new Map();

  /**
   * Obtiene o crea una instancia de TTSService para un idioma específico
   * @param language - Idioma deseado
   * @returns Instancia de TTSService para el idioma
   */
  getService(language: SupportedLanguage = 'de'): TTSService {
    if (!this.instances.has(language)) {
      this.instances.set(language, new TTSService(language));
    }
    return this.instances.get(language)!;
  }

  /**
   * Obtiene el servicio TTS para el idioma actual del usuario
   * @param userLanguage - Idioma del usuario
   * @returns Instancia de TTSService
   */
  getServiceForLanguage(userLanguage: SupportedLanguage): TTSService {
    return this.getService(userLanguage);
  }

  /**
   * Limpia todas las instancias
   */
  clear(): void {
    this.instances.forEach(service => service.stop());
    this.instances.clear();
  }
}

// Manager singleton
const ttsManager = new TTSManager();

// Export default service (usando 'de' como idioma por defecto - primer idioma soportado)
export const tts = ttsManager.getService();

// Export manager para acceso multi-idioma
export { ttsManager };

// ============================================
// REACT HOOK PARA TTS
// ============================================

import { useState, useCallback, useEffect } from 'react';

export function useTTS(language?: SupportedLanguage) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(language || 'de');

  // Obtener servicio para el idioma especificado
  const service = ttsManager.getService(currentLanguage);

  useEffect(() => {
    // Check availability after mount (client-side only)
    const checkAvailability = () => {
      setIsAvailable(service.isAvailable());
    };

    checkAvailability();

    // Re-check when voices load
    const timer = setTimeout(checkAvailability, 1000);
    return () => clearTimeout(timer);
  }, [service, currentLanguage]);

  const speak = useCallback((text: string) => {
    service.speak(
      text,
      () => setIsSpeaking(false),
      () => setIsSpeaking(true)
    );
  }, [service]);

  const speakAsync = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await service.speakAsync(text);
    setIsSpeaking(false);
  }, [service]);

  const stop = useCallback(() => {
    service.stop();
    setIsSpeaking(false);
  }, [service]);

  const changeLanguage = useCallback((newLanguage: SupportedLanguage) => {
    setCurrentLanguage(newLanguage);
    const newService = ttsManager.getService(newLanguage);
    setIsAvailable(newService.isAvailable());
  }, []);

  return {
    speak,
    speakAsync,
    stop,
    changeLanguage,
    isSpeaking,
    isAvailable,
    currentLanguage,
    voiceName: service.getVoiceName(),
    availableVoices: service.getAvailableVoices(),
  };
}

/**
 * Hook para TTS con idioma del store de progreso
 * Útil para componentes que necesitan usar el idioma activo del usuario
 */
export function useTTSWithProgress() {
  const { activeLanguage } = useProgressStore();
  return useTTS(activeLanguage as SupportedLanguage);
}
