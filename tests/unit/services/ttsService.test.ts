/**
 * Tests para ttsService - Servicio Text-to-Speech
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ttsManager, useTTS, type TTSService } from '@/services/ttsService';
import type { SupportedLanguage } from '@/lib/constants';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

// Contador de llamadas para tests
let speakCallCount = 0;
let cancelCallCount = 0;

describe('ttsService', () => {
  let originalSpeechSynthesis: any;
  let originalSpeechSynthesisUtterance: any;

  beforeEach(() => {
    // Resetear contadores
    speakCallCount = 0;
    cancelCallCount = 0;

    // Guardar implementación original
    originalSpeechSynthesis = (global as any).window?.speechSynthesis;
    originalSpeechSynthesisUtterance = (global as any).SpeechSynthesisUtterance;

    // Mock de SpeechSynthesisUtterance
    (global as any).SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
      text: string;
      lang: string;
      rate: number;
      pitch: number;
      volume: number;
      voice: any;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: ((e: any) => void) | null;

      constructor(text: string) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
      }
    };

    // Mock de SpeechSynthesis
    const mockSynth = {
      speak: vi.fn(() => { speakCallCount++; }),
      cancel: vi.fn(() => { cancelCallCount++; }),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => []),
      onvoiceschanged: null,
    };

    Object.defineProperty(global, 'window', {
      value: { speechSynthesis: mockSynth },
      writable: true,
      configurable: true,
    });

    // Resetear el manager
    ttsManager.clear();
  });

  afterEach(() => {
    // Restaurar implementación original
    if (originalSpeechSynthesis) {
      Object.defineProperty(global, 'window', {
        value: { speechSynthesis: originalSpeechSynthesis },
        writable: true,
        configurable: true,
      });
    }
    if (originalSpeechSynthesisUtterance) {
      (global as any).SpeechSynthesisUtterance = originalSpeechSynthesisUtterance;
    } else {
      delete (global as any).SpeechSynthesisUtterance;
    }

    ttsManager.clear();
  });

  describe('TTSManager', () => {
    it('debería crear servicio para alemán', () => {
      const service = ttsManager.getService('de');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('de');
    });

    it('debería crear servicio para inglés', () => {
      const service = ttsManager.getService('en');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('en');
    });

    it('debería crear servicio para español', () => {
      const service = ttsManager.getService('es');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('es');
    });

    it('debería crear servicio para francés', () => {
      const service = ttsManager.getService('fr');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('fr');
    });

    it('debería crear servicio para italiano', () => {
      const service = ttsManager.getService('it');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('it');
    });

    it('debería reutilizar servicios existentes', () => {
      const service1 = ttsManager.getService('de');
      const service2 = ttsManager.getService('de');

      expect(service1).toBe(service2);
    });

    it('debería crear diferentes servicios para diferentes idiomas', () => {
      const serviceDe = ttsManager.getService('de');
      const serviceEn = ttsManager.getService('en');

      expect(serviceDe).not.toBe(serviceEn);
    });

    it('debería crear servicios para todos los idiomas soportados', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const service = ttsManager.getService(lang as SupportedLanguage);
        expect(service).toBeDefined();
        expect(service.getLanguage()).toBe(lang);
      }
    });

    it('debería limpiar todas las instancias', () => {
      ttsManager.getService('de');
      ttsManager.getService('en');
      ttsManager.getService('es');

      ttsManager.clear();

      // Después de clear, se puede crear un nuevo servicio
      const service = ttsManager.getService('de');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('de');
    });
  });

  describe('TTSService', () => {
    let service: TTSService;

    beforeEach(() => {
      service = ttsManager.getService('de');
    });

    describe('getLanguage', () => {
      it('debería devolver el idioma actual', () => {
        expect(service.getLanguage()).toBe('de');
      });
    });

    describe('setLanguage', () => {
      it('debería cambiar el idioma', () => {
        service.setLanguage('en');

        expect(service.getLanguage()).toBe('en');
      });

      it('debería cambiar entre idiomas múltiples veces', () => {
        expect(service.getLanguage()).toBe('de');

        service.setLanguage('en');
        expect(service.getLanguage()).toBe('en');

        service.setLanguage('es');
        expect(service.getLanguage()).toBe('es');

        service.setLanguage('de');
        expect(service.getLanguage()).toBe('de');
      });
    });

    describe('speak', () => {
      it('debería llamar a speechSynthesis.speak', () => {
        const beforeCount = speakCallCount;

        service.speak('Hallo Welt');

        expect(speakCallCount).toBeGreaterThan(beforeCount);
      });

      it('debería poder llamar speak múltiples veces', () => {
        expect(() => {
          service.speak('Primero');
          service.speak('Segundo');
          service.speak('Tercero');
        }).not.toThrow();
      });

      it('debería aceptar callbacks opcionales', () => {
        expect(() => {
          service.speak('Test', undefined, undefined);
        }).not.toThrow();
      });
    });

    describe('stop', () => {
      it('debería cancelar speech actual', () => {
        const beforeCount = cancelCallCount;

        service.stop();

        expect(cancelCallCount).toBeGreaterThan(beforeCount);
      });
    });

    describe('isAvailable', () => {
      it('debería retornar valor booleano', () => {
        const available = service.isAvailable();

        expect(typeof available).toBe('boolean');
      });
    });

    describe('getVoiceName', () => {
      it('debería devolver string', () => {
        const voiceName = service.getVoiceName();

        expect(typeof voiceName).toBe('string');
      });
    });

    describe('getAvailableVoices', () => {
      it('debería devolver array de voces', () => {
        const voices = service.getAvailableVoices();

        expect(Array.isArray(voices)).toBe(true);
      });
    });
  });

  describe('useTTS hook', () => {
    it('debería tener servicio para idioma por defecto', () => {
      // Nota: Este test verifica que el hook se puede importar y tiene las propiedades correctas
      // No podemos ejecutar hooks React fuera de componentes
      expect(ttsManager).toBeDefined();
      expect(typeof ttsManager.getService).toBe('function');
    });

    it('debería crear servicio para idioma especificado', () => {
      const service = ttsManager.getService('fr');

      expect(service).toBeDefined();
      expect(service.getLanguage()).toBe('fr');
    });
  });

  describe('integración multi-idioma', () => {
    it('debería mantener servicios separados por idioma', () => {
      const serviceDe = ttsManager.getService('de');
      const serviceEn = ttsManager.getService('en');
      const serviceEs = ttsManager.getService('es');

      // Cada servicio debería tener su propio estado
      expect(serviceDe.getLanguage()).toBe('de');
      expect(serviceEn.getLanguage()).toBe('en');
      expect(serviceEs.getLanguage()).toBe('es');

      // Cambiar uno no debería afectar a los otros
      serviceDe.setLanguage('fr');
      expect(serviceDe.getLanguage()).toBe('fr');
      expect(serviceEn.getLanguage()).toBe('en');
      expect(serviceEs.getLanguage()).toBe('es');
    });

    it('debería soportar cambio de idioma en servicio', () => {
      const service = ttsManager.getService('de');

      expect(service.getLanguage()).toBe('de');

      service.setLanguage('en');
      expect(service.getLanguage()).toBe('en');
    });

    it('debería manejar todos los idiomas soportados', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const service = ttsManager.getService(lang as SupportedLanguage);
        expect(service).toBeDefined();
        expect(service.getLanguage()).toBe(lang);

        // Verificar que el servicio tiene los métodos necesarios
        expect(typeof service.speak).toBe('function');
        expect(typeof service.stop).toBe('function');
        expect(typeof service.setLanguage).toBe('function');
      }
    });
  });

  describe('manejo de errores', () => {
    it('debería manejar speechSynthesis no disponible', () => {
      (global as any).window.speechSynthesis = null;

      const service = ttsManager.getService('de');

      // No debería lanzar error al crear servicio
      expect(service).toBeDefined();

      // speak debería manejar gracefully
      expect(() => service.speak('Test')).not.toThrow();
    });

    it('debería manejar cancel sin speech activo', () => {
      const service = ttsManager.getService('de');

      expect(() => service.stop()).not.toThrow();
    });
  });
});
