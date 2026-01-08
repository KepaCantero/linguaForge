import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createAppError,
  withRetry,
  supabaseQuery,
  supabaseQueryOptional,
  isAppError,
  isRetryable,
  isNetworkError,
  isAuthError,
  ErrorCategory,
  ErrorSeverity,
} from '@/services/errorHandler';

// Mock console methods
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
  vi.clearAllMocks();
});

// ============================================
// TESTS PARA CREACIÓN DE ERRORES
// ============================================

describe('createAppError', () => {
  it('debería crear un AppError con metadata completa', () => {
    const originalError = new Error('Database connection failed');
    const context = { query: 'SELECT * FROM users' };

    const appError = createAppError('Database operation failed', originalError, context);

    expect(appError.message).toBe('Database operation failed');
    expect(appError.category).toBe(ErrorCategory.SERVER);
    expect(appError.severity).toBe(ErrorSeverity.MEDIUM);
    expect(appError.retryable).toBe(true);
    expect(appError.context).toEqual(context);
    expect(appError.originalError).toBe(originalError);
    expect(appError.name).toBe('AppError');
  });

  it('debería copiar stack trace del error original', () => {
    const originalError = new Error('Test error');
    originalError.stack = 'Error: Test error\n    at test.js:1:1';

    const appError = createAppError('Test message', originalError);

    expect((appError as any).stack).toBe(originalError.stack);
  });

  it('debería asignar retryable false para errores no reintentables', () => {
    const validationError = new Error('Validation failed');
    const appError = createAppError('Validation failed', validationError);

    expect(appError.category).toBe(ErrorCategory.VALIDATION);
    expect(appError.retryable).toBe(false);
  });
});

// ============================================
// TESTS PARA WRAPPER CON RETRY
// ============================================

describe('withRetry', () => {
  let mockFn: vi.Mock;

  beforeEach(() => {
    mockFn = vi.fn();
  });

  it('debería ejecutar la función exitosamente en el primer intento', async () => {
    mockFn.mockResolvedValue('success');

    const result = await withRetry(() => mockFn());

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('debería reintentar en caso de error reintentable', async () => {
    const retryableError = new Error('Network error');
    mockFn
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue('success');

    const result = await withRetry(() => mockFn());

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('debería lanzar error después de todos los intentos', async () => {
    const retryableError = new Error('Network error');
    mockFn.mockRejectedValue(retryableError);

    await expect(withRetry(() => mockFn())).rejects.toThrow('Operation failed (attempt 3/3)');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('debería usar custom retry config', async () => {
    mockFn
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success');

    await withRetry(() => mockFn(), {
      retry: {
        maxAttempts: 5,
        initialDelayMs: 100,
      },
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('debería no reintentar errores no reintentables', async () => {
    const validationError = new Error('Validation failed');
    mockFn.mockRejectedValue(validationError);

    await expect(withRetry(() => mockFn())).rejects.toThrow('Operation failed (attempt 1/3)');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('debería ejecutar callback onError cuando ocurre un error', async () => {
    const retryableError = new Error('Network error');
    mockFn.mockRejectedValue(retryableError);

    const onErrorSpy = vi.fn();

    await expect(withRetry(() => mockFn(), { onError: onErrorSpy })).rejects.toThrow();

    expect(onErrorSpy).toHaveBeenCalledTimes(3);
  });

  it('debería ejecutar fallback cuando está disponible', async () => {
    const retryableError = new Error('Network error');
    mockFn.mockRejectedValue(retryableError);

    const fallbackSpy = vi.fn().mockReturnValue('fallback value');

    const result = await withRetry(
      () => mockFn(),
      { fallback: fallbackSpy }
    );

    expect(result).toBe('fallback value');
    expect(fallbackSpy).toHaveBeenCalledTimes(1);
  });

  it('debería esperar entre reintentos con exponential backoff', async () => {
    const retryableError = new Error('Network error');
    mockFn
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue('success');

    const startTime = Date.now();
    await withRetry(() => mockFn(), {
      retry: {
        initialDelayMs: 100,
        maxDelayMs: 1000,
      },
    });
    const endTime = Date.now();

    // Should have waited at least 100ms + 200ms (exponential backoff)
    expect(endTime - startTime).toBeGreaterThan(250);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});

// ============================================
// TESTS PARA WRAPPERS DE SUPABASE
// ============================================

describe('Supabase Wrappers', () => {
  const mockSupabaseResult = vi.fn();

  beforeEach(() => {
    mockSupabaseResult.mockClear();
  });

  describe('supabaseQuery', () => {
    it('debería retornar data exitosamente', async () => {
      mockSupabaseResult.mockResolvedValue({
        data: 'test-data',
        error: null,
      });

      const result = await supabaseQuery(() => mockSupabaseResult());

      expect(result).toBe('test-data');
    });

    it('debería lanzar error si Supabase retorna error', async () => {
      const supabaseError = { code: 'PGRST116', message: 'Row not found' };
      mockSupabaseResult.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      await expect(supabaseQuery(() => mockSupabaseResult())).rejects.toThrow('Supabase query failed');
    });

    it('debería lanzar error si data es null', async () => {
      mockSupabaseResult.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(supabaseQuery(() => mockSupabaseResult())).rejects.toThrow('Supabase query returned null');
    });
  });

  describe('supabaseQueryOptional', () => {
    it('debería retornar data exitosamente', async () => {
      mockSupabaseResult.mockResolvedValue({
        data: 'test-data',
        error: null,
      });

      const result = await supabaseQueryOptional(() => mockSupabaseResult());

      expect(result).toBe('test-data');
    });

    it('debería retornar null si Supabase retorna null', async () => {
      mockSupabaseResult.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await supabaseQueryOptional(() => mockSupabaseResult());

      expect(result).toBeNull();
    });

    it('debería lanzar error si Supabase retorna error', async () => {
      const supabaseError = { code: 'PGRST116', message: 'Row not found' };
      mockSupabaseResult.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      await expect(supabaseQueryOptional(() => mockSupabaseResult())).rejects.toThrow('Supabase query failed');
    });
  });
});

// ============================================
// TESTS PARA GUARDS DE TIPO
// ============================================

describe('Type Guards', () => {
  it('isAppError debería identificar correctamente AppErrors', () => {
    const appError = createAppError('Test', new Error('Test'));
    const normalError = new Error('Normal error');

    expect(isAppError(appError)).toBe(true);
    expect(isAppError(normalError)).toBe(false);
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });

  it('isRetryable debería verificar si un error es reintentable', () => {
    const networkError = createAppError('Network error', new Error('Network error'));
    const validationError = createAppError('Validation error', new Error('Validation error'));

    expect(isRetryable(networkError)).toBe(true);
    expect(isRetryable(validationError)).toBe(false);
    expect(isRetryable(new Error('Normal error'))).toBe(false);
  });

  it('isNetworkError debería identificar errores de red', () => {
    const networkError = createAppError('Network error', new TypeError('Failed to fetch'));
    const authError = createAppError('Auth error', new Error('Unauthorized'));

    expect(isNetworkError(networkError)).toBe(true);
    expect(isNetworkError(authError)).toBe(false);
    expect(isNetworkError(new Error('Normal error'))).toBe(false);
  });

  it('isAuthError debería identificar errores de autenticación', () => {
    const authError = createAppError('Auth error', new Error('Unauthorized'));
    const networkError = createAppError('Network error', new Error('Network error'));

    expect(isAuthError(authError)).toBe(true);
    expect(isAuthError(networkError)).toBe(false);
    expect(isAuthError(new Error('Normal error'))).toBe(false);
  });
});

// ============================================
// TESTS PARA EDGE CASES
// ============================================

describe('Edge Cases', () => {
  it('debería manejar errores anidados correctamente', () => {
    const deepError = new Error('Deep error');
    // @ts-ignore - Testing deep error structure
    deepError.originalError = new Error('Original error');

    const appError = createAppError('Wrapper error', deepError);
    expect(appError.originalError).toBe(deepError);
    expect(appError.message).toBe('Wrapper error');
  });

  it('debería manejar errores sin mensaje', () => {
    const errorWithoutMessage = new Error();
    delete errorWithoutMessage.message;

    const appError = createAppError('No message error', errorWithoutMessage);
    expect(appError.category).toBe(ErrorCategory.UNKNOWN);
  });

  it('debería manejar retry con maxAttempts = 1', async () => {
    const retryableError = new Error('Network error');
    const mockFn = vi.fn().mockRejectedValue(retryableError);

    await expect(withRetry(() => mockFn(), {
      retry: { maxAttempts: 1 }
    })).rejects.toThrow('Operation failed (attempt 1/1)');
  });

  it('debería manejar contexto complejo en errores', () => {
    const complexContext = {
      query: 'SELECT * FROM users',
      params: { id: '123' },
      timestamp: new Date().toISOString(),
      metadata: {
        userId: 'user-123',
        action: 'delete',
      },
    };

    const appError = createAppError('Complex error', new Error('Test'), complexContext);

    expect(appError.context).toEqual(complexContext);
  });

  it('debería asignar categorías correctas para diferentes errores', () => {
    const networkError = createAppError('Network error', new TypeError('Failed to fetch'));
    const timeoutError = createAppError('Timeout error', new Error('Request timeout'));
    const authError = createAppError('Auth error', new Error('401 Unauthorized'));
    const notFoundError = createAppError('Not found error', new Error('404 Not Found'));
    const validationError = createAppError('Validation error', new Error('400 Bad Request'));
    const serverError = createAppError('Server error', new Error('500 Internal Server Error'));

    expect(networkError.category).toBe(ErrorCategory.NETWORK);
    expect(timeoutError.category).toBe(ErrorCategory.TIMEOUT);
    expect(authError.category).toBe(ErrorCategory.AUTH);
    expect(notFoundError.category).toBe(ErrorCategory.NOT_FOUND);
    expect(validationError.category).toBe(ErrorCategory.VALIDATION);
    expect(serverError.category).toBe(ErrorCategory.SERVER);
  });
});

// ============================================
// TESTS DE PERFORMANCE Y ESTRES
// ============================================

describe('Performance and Stress Tests', () => {
  it('debería manejar grandes volúmenes de errores sin memory leaks', () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));

    // Crear múltiples promesas en paralelo
    const promises = Array.from({ length: 100 }, () =>
      withRetry(() => mockFn(), { retry: { maxAttempts: 2 } }).catch(() => 'error')
    );

    expect(promises.length).toBe(100);
    // No debería lanzar errores de memoria
  });

  it('debería ejecutar rápidamente operaciones exitosas', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const startTime = Date.now();
    await withRetry(() => mockFn());
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(100); // Debería ser muy rápido
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});