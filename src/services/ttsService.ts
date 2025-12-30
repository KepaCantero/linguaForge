/**
 * Text-to-Speech Service using Web Speech API
 * Provides high-quality French pronunciation
 */

type TTSCallback = () => void;

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private frenchVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.initVoice();
    }
  }

  private initVoice() {
    if (!this.synth) return;

    // Try to get voices immediately
    this.selectBestFrenchVoice();

    // Also listen for voiceschanged event (needed for some browsers)
    this.synth.onvoiceschanged = () => {
      this.selectBestFrenchVoice();
    };
  }

  private selectBestFrenchVoice() {
    if (!this.synth) return;

    const voices = this.synth.getVoices();

    // Priority order for French voices (best quality first)
    const preferredVoices = [
      'Google français',           // Google (Chrome)
      'Thomas',                    // macOS premium
      'Amelie',                    // macOS premium
      'Marie',                     // macOS
      'Microsoft Paul - French',   // Windows
      'Microsoft Julie - French',  // Windows
    ];

    // Try to find a preferred voice
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) {
        this.frenchVoice = voice;
        this.isInitialized = true;
        return;
      }
    }

    // Fallback: any French voice
    const frenchVoice = voices.find(v =>
      v.lang.startsWith('fr') ||
      v.lang === 'fr-FR' ||
      v.lang === 'fr-CA'
    );

    if (frenchVoice) {
      this.frenchVoice = frenchVoice;
      this.isInitialized = true;
    }
  }

  /**
   * Speak text in French
   */
  speak(text: string, onEnd?: TTSCallback, onStart?: TTSCallback): void {
    if (!this.synth) {
      console.warn('Speech synthesis not available');
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set French voice if available
    if (this.frenchVoice) {
      utterance.voice = this.frenchVoice;
    }

    // Configure for natural French speech
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;      // Slightly slower for learners
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  /**
   * Speak with a Promise interface
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
   * Check if TTS is available and has a French voice
   */
  isAvailable(): boolean {
    return this.isInitialized && this.frenchVoice !== null;
  }

  /**
   * Get the current voice name
   */
  getVoiceName(): string {
    return this.frenchVoice?.name || 'Default';
  }
}

// Singleton instance
export const tts = new TTSService();

// React hook for TTS
import { useState, useCallback, useEffect } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check availability after mount (client-side only)
    const checkAvailability = () => {
      setIsAvailable(tts.isAvailable());
    };

    checkAvailability();

    // Re-check when voices load
    const timer = setTimeout(checkAvailability, 1000);
    return () => clearTimeout(timer);
  }, []);

  const speak = useCallback((text: string) => {
    tts.speak(
      text,
      () => setIsSpeaking(false),
      () => setIsSpeaking(true)
    );
  }, []);

  const speakAsync = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await tts.speakAsync(text);
    setIsSpeaking(false);
  }, []);

  const stop = useCallback(() => {
    tts.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    speakAsync,
    stop,
    isSpeaking,
    isAvailable,
    voiceName: tts.getVoiceName(),
  };
}
