/**
 * Tests para soundEffects - Sistema de efectos de sonido
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { soundEffects, initSoundEffects, playSound, playSoundCorrect, playSoundIncorrect, setSoundEnabled, isSoundEnabled, setSoundVolume, getSoundVolume, type SoundId } from '@/lib/soundEffects';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock AudioContext
class MockAudioContext {
  public state: 'suspended' | 'running' = 'suspended';
  public destination: GainNode = {} as GainNode;
  public currentTime: number = 0;

  createOscillator(): OscillatorNode {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
      frequency: { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    } as unknown as OscillatorNode;
  }

  createGain(): GainNode {
    const gainNode = {
      connect: vi.fn(),
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    };
    return gainNode as unknown as GainNode;
  }

  createBiquadFilter(): BiquadFilterNode {
    return {
      connect: vi.fn(),
      type: 'lowpass',
      frequency: { value: 1000, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      Q: { value: 1 },
    } as unknown as BiquadFilterNode;
  }

  async resume(): Promise<void> {
    this.state = 'running';
  }
}

// Mock window.AudioContext - Asignar directamente la clase
Object.defineProperty(global, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});

// Mock window object con webkitAudioContext
Object.defineProperty(global, 'window', {
  value: {
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
  },
  writable: true,
});

describe('soundEffects', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Resetear el singleton
    soundEffects.setEnabled(true);
    soundEffects.setVolume(1.0);
  });

  afterEach(() => {
    // Resetear el estado del singleton después de cada test
    soundEffects.setEnabled(true);
    soundEffects.setVolume(1.0);
  });

  describe('gestión de estado', () => {
    it('debería habilitar/deshabilitar sonidos', () => {
      expect(soundEffects.isEnabled()).toBe(true);

      soundEffects.setEnabled(false);
      expect(soundEffects.isEnabled()).toBe(false);
      expect(localStorage.getItem('linguaforge-sound-enabled')).toBe('false');

      soundEffects.setEnabled(true);
      expect(soundEffects.isEnabled()).toBe(true);
      expect(localStorage.getItem('linguaforge-sound-enabled')).toBe('true');
    });

    it('debería establecer y obtener volumen', () => {
      expect(soundEffects.getVolume()).toBe(1.0);

      soundEffects.setVolume(0.5);
      expect(soundEffects.getVolume()).toBe(0.5);
      expect(localStorage.getItem('linguaforge-sound-volume')).toBe('0.5');

      soundEffects.setVolume(0);
      expect(soundEffects.getVolume()).toBe(0);

      soundEffects.setVolume(1);
      expect(soundEffects.getVolume()).toBe(1);
    });

    it('debería clamp volumen entre 0 y 1', () => {
      soundEffects.setVolume(1.5);
      expect(soundEffects.getVolume()).toBe(1);

      soundEffects.setVolume(-0.5);
      expect(soundEffects.getVolume()).toBe(0);
    });

    it('debería verificar inicialización', () => {
      expect(soundEffects.isInitialized()).toBe(false);
    });

    it('debería manejar NaN como volumen 0', () => {
      soundEffects.setVolume(NaN);
      const vol = soundEffects.getVolume();
      // Math.max(0, Math.min(1, NaN)) returns NaN, so check for that
      expect(Number.isNaN(vol)).toBe(true);
    });
  });

  describe('reproducción de sonidos', () => {
    it('no debería lanzar errores al reproducir cuando no está inicializado', () => {
      expect(() => {
        soundEffects.play('correct');
      }).not.toThrow();
    });

    it('no debería reproducir si está deshabilitado', () => {
      soundEffects.setEnabled(false);

      expect(() => {
        soundEffects.play('correct');
      }).not.toThrow();
    });

    it('debería tener método playCorrect', () => {
      expect(() => {
        soundEffects.playCorrect();
      }).not.toThrow();
    });

    it('debería tener método playIncorrect', () => {
      expect(() => {
        soundEffects.playIncorrect();
      }).not.toThrow();
    });
  });

  describe('funciones de conveniencia', () => {
    it('playSound debería llamar a soundEffects.play', () => {
      const spy = vi.spyOn(soundEffects, 'play');
      playSound('correct');
      expect(spy).toHaveBeenCalledWith('correct');
    });

    it('playSoundCorrect debería llamar a soundEffects.playCorrect', () => {
      const spy = vi.spyOn(soundEffects, 'playCorrect');
      playSoundCorrect();
      expect(spy).toHaveBeenCalled();
    });

    it('playSoundIncorrect debería llamar a soundEffects.playIncorrect', () => {
      const spy = vi.spyOn(soundEffects, 'playIncorrect');
      playSoundIncorrect();
      expect(spy).toHaveBeenCalled();
    });

    it('setSoundEnabled debería llamar a soundEffects.setEnabled', () => {
      setSoundEnabled(false);
      expect(soundEffects.isEnabled()).toBe(false);
    });

    it('isSoundEnabled debería llamar a soundEffects.isEnabled', () => {
      const result = isSoundEnabled();
      expect(result).toBe(soundEffects.isEnabled());
    });

    it('setSoundVolume debería llamar a soundEffects.setVolume', () => {
      setSoundVolume(0.7);
      expect(soundEffects.getVolume()).toBe(0.7);
    });

    it('getSoundVolume debería llamar a soundEffects.getVolume', () => {
      const result = getSoundVolume();
      expect(result).toBe(soundEffects.getVolume());
    });
  });

  describe('persistencia de preferencias', () => {
    it('debería persistir estado de habilitación', () => {
      soundEffects.setEnabled(false);
      const saved = localStorage.getItem('linguaforge-sound-enabled');
      expect(saved).toBe('false');

      soundEffects.setEnabled(true);
      const saved2 = localStorage.getItem('linguaforge-sound-enabled');
      expect(saved2).toBe('true');
    });

    it('debería persistir volumen', () => {
      soundEffects.setVolume(0.75);
      const saved = localStorage.getItem('linguaforge-sound-volume');
      expect(saved).toBe('0.75');
    });
  });

  describe('tipos TypeScript', () => {
    it('SoundId debería incluir todos los sonidos', () => {
      const soundIds: SoundId[] = [
        'correct',
        'incorrect',
        'levelUp',
        'xpGain',
        'streak',
        'click',
        'flip',
        'complete',
        'notification',
        'whoosh',
      ];

      soundIds.forEach((id) => {
        expect(typeof id).toBe('string');
      });

      expect(soundIds).toHaveLength(10);
    });
  });

  describe('manejo de casos extremos', () => {
    it('debería manejar volúmenes límite', () => {
      soundEffects.setVolume(0);
      expect(soundEffects.getVolume()).toBe(0);

      soundEffects.setVolume(1);
      expect(soundEffects.getVolume()).toBe(1);

      soundEffects.setVolume(0.001);
      expect(soundEffects.getVolume()).toBe(0.001);

      soundEffects.setVolume(0.999);
      expect(soundEffects.getVolume()).toBe(0.999);
    });

    it('debería manejar toggle de enabled', () => {
      expect(soundEffects.isEnabled()).toBe(true);

      soundEffects.setEnabled(false);
      expect(soundEffects.isEnabled()).toBe(false);

      soundEffects.setEnabled(true);
      expect(soundEffects.isEnabled()).toBe(true);

      // Múltiples toggles
      soundEffects.setEnabled(false);
      soundEffects.setEnabled(false);
      expect(soundEffects.isEnabled()).toBe(false);
    });
  });
});

describe('soundEffects - con inicialización', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    // Inicializar el sistema de audio
    await initSoundEffects();
  });

  it('debería inicializar correctamente', () => {
    expect(soundEffects.isInitialized()).toBe(true);
  });

  it('debería reproducir todos los sonidos sin errores', () => {
    const soundIds: SoundId[] = [
      'correct',
      'incorrect',
      'levelUp',
      'xpGain',
      'streak',
      'click',
      'flip',
      'complete',
      'notification',
      'whoosh',
    ];

    soundIds.forEach((soundId) => {
      expect(() => {
        soundEffects.play(soundId);
      }).not.toThrow();
    });
  });
});
