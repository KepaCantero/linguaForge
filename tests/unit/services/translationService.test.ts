import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  translateToSpanish,
  translateWords,
  preloadCommonTranslations,
  getCacheStats,
  clearTranslationCache,
} from '@/services/translationService';
import { RateLimiter } from '@/services/rateLimiter';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('translationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetear localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue();
    mockLocalStorage.removeItem.mockReturnValue();
    mockLocalStorage.clear.mockReturnValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('translateToSpanish', () => {
    it('debería retornar traducción desde API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'hola mundo' }),
      });

      const result = await translateToSpanish('bonjour monde');
      expect(result).toBe('hola mundo');
      expect(mockFetch).toHaveBeenCalledWith('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'bonjour monde',
          targetLang: 'es',
          sourceLang: 'fr',
        }),
      });
    });

    it('debería retornar texto original si API falla', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await translateToSpanish('bonjour monde');
      expect(result).toBe('bonjour monde');
    });

    it('debería guardar en cache después de traducir', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'hola mundo' }),
      });

      await translateToSpanish('bonjour monde');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'linguaforge-translation-cache',
        expect.stringContaining('"bonjour monde":{"translation":"hola mundo"')
      );
    });
  });

  describe('translateWords', () => {
    it('debería traducir múltiples palabras en paralelo', async () => {
      mockFetch.mockImplementation((url, options) => {
        const body = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            translatedText: body.text === 'bonjour' ? 'hola' : 'mundo'
          }),
        });
      });

      const result = await translateWords(['bonjour', 'monde']);
      expect(result).toEqual({
        'bonjour': 'hola',
        'monde': 'mundo'
      });
    });

    it('debería procesar múltiples palabras', async () => {
      mockFetch.mockImplementation((url, options) => {
        const body = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            translatedText: body.text
          }),
        });
      });

      const words = Array(5).fill('').map((_, i) => `palabra${i + 1}`);
      await translateWords(words);

      // Debería hacer 5 llamadas (una por palabra en este caso simple)
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('getCacheStats', () => {
    it('debería retornar estadísticas de cache', () => {
      // Simular cache con algunas entradas
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        entries: {
          word1: { translation: 'translation1', timestamp: Date.now() },
          word2: { translation: 'translation2', timestamp: Date.now() },
        }
      }));

      const stats = getCacheStats();
      expect(stats).toEqual({
        size: 2,
        maxSize: 5000,
      });
    });

    it('debería manejar cache vacía', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const stats = getCacheStats();
      expect(stats).toEqual({
        size: 0,
        maxSize: 5000,
      });
    });
  });

  describe('preloadCommonTranslations', () => {
    it('debería pre-cargar traducciones comunes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ translatedText: 'hola' }),
      });

      await preloadCommonTranslations();

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('clearTranslationCache', () => {
    it('debería limpiar la cache', () => {
      clearTranslationCache();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('linguaforge-translation-cache');
    });

    it('no debería hacer nada en servidor', () => {
      // Simular entorno de servidor
      const originalWindow = global.window;
      (global as any).window = undefined;

      clearTranslationCache();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();

      // Restaurar
      global.window = originalWindow;
    });
  });

  describe('getCacheStats', () => {
    it('debería retornar estadísticas de cache', () => {
      // Simular cache con algunas entradas
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        entries: {
          word1: { translation: 'translation1', timestamp: Date.now() },
          word2: { translation: 'translation2', timestamp: Date.now() },
        }
      }));

      const stats = getCacheStats();
      expect(stats).toEqual({
        size: 2,
        maxSize: 5000,
      });
    });

    it('debería manejar cache vacía', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const stats = getCacheStats();
      expect(stats).toEqual({
        size: 0,
        maxSize: 5000,
      });
    });
  });
});

describe('rate limiting', () => {
  it('debería permitir múltiples traducciones en rápida sucesión', async () => {
    // Mock exitoso para todas las peticiones
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ translatedText: 'hola' }),
    });

    // Traducir 5 palabras rápidamente
    const promises = Array(5).fill('').map((_, i) =>
      translateToSpanish(`palabra${i + 1}`)
    );

    const results = await Promise.all(promises);

    // Todas deberían tener éxito
    results.forEach(result => expect(result).toBe('hola'));

    // Verificar que fetch fue llamado 5 veces
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });
});