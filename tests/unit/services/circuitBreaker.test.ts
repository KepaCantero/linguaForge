import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CircuitBreaker,
  CircuitBreakerPresets,
  withCircuitBreaker,
  getAllCircuitBreakerStates,
  getCircuitBreakerMetrics,
  CircuitState,
} from '@/services/circuitBreaker';
import { circuitBreakerRegistry } from '@/services/circuitBreaker';

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
beforeEach(() => {
  mockConsoleError.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeoutMs: 60000,
    });
  });

  it('debería iniciar en estado CLOSED', () => {
    const state = breaker.getState();
    expect(state.state).toBe(CircuitState.CLOSED);
    expect(state.failureCount).toBe(0);
    expect(state.successCount).toBe(0);
  });

  it('debería ejecutar exitosamente una función en estado CLOSED', async () => {
    const result = await breaker.execute(async () => {
      return 'success';
    });

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(result.state).toBe(CircuitState.CLOSED);
  });

  it('debería registrar fallos en estado CLOSED', async () => {
    await breaker.execute(async () => {
      throw new Error('failed');
    });

    const state = breaker.getState();
    expect(state.failureCount).toBe(1);
    expect(state.state).toBe(CircuitState.CLOSED);
  });

  it('debería abrir el circuito después del umbral de fallos', async () => {
    // Hacer 3 fallos para alcanzar el umbral
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error(`failed ${i}`);
      });
    }

    const state = breaker.getState();
    expect(state.state).toBe(CircuitState.OPEN);
    expect(state.failureCount).toBe(3);
  });

  it('debería fall rápido en estado OPEN', async () => {
    // Abrir el circuito primero
    breaker.forceOpen();

    const result = await breaker.execute(async () => {
      return 'success';
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Circuit breaker is OPEN');
    expect(result.state).toBe(CircuitState.OPEN);
  });

  it('debería transicionar a HALF_OPEN después del timeout', async () => {
    // Abrir el circuito
    breaker.forceOpen();

    // Avanzar tiempo para que expire el timeout
    vi.useFakeTimers();
    vi.advanceTimersByTime(65000); // Más de 60 segundos

    // La siguiente ejecución debería transicionar a HALF_OPEN
    const result = await breaker.execute(async () => {
      return 'test';
    });

    const state = breaker.getState();
    expect(state.state).toBe(CircuitState.HALF_OPEN);
    expect(result.success).toBe(true);
    expect(result.state).toBe(CircuitState.HALF_OPEN);

    vi.useRealTimers();
  });

  it('debería cerrar el circuito después de éxitos en HALF_OPEN', async () => {
    // Forzar a HALF_OPEN
    breaker.forceClose();
    breaker['transitionTo'](CircuitState.HALF_OPEN);

    // Realizar 2 éxitos para alcanzar el umbral
    for (let i = 0; i < 2; i++) {
      await breaker.execute(async () => {
        return `success ${i}`;
      });
    }

    const state = breaker.getState();
    expect(state.state).toBe(CircuitState.CLOSED);
    expect(state.successCount).toBe(0); // Se resetea al cerrar
  });

  it('debería volver a abrir si falla en HALF_OPEN', async () => {
    // Forzar a HALF_OPEN
    breaker.forceClose();
    breaker['transitionTo'](CircuitState.HALF_OPEN);

    // Realizar 1 fallo en HALF_OPEN
    await breaker.execute(async () => {
      throw new Error('failed');
    });

    const state = breaker.getState();
    expect(state.state).toBe(CircuitState.OPEN);
  });

  it('debería resetear correctamente', () => {
    // Añadir algunos fallos
    breaker['state'].failureCount = 5;
    breaker['state'].successCount = 2;
    breaker['state'].state = CircuitState.OPEN;

    breaker.reset();

    const state = breaker.getState();
    expect(state.state).toBe(CircuitState.CLOSED);
    expect(state.failureCount).toBe(0);
    expect(state.successCount).toBe(0);
  });
});

describe('CircuitBreakerPresets', () => {
  it('debería tener presets con configuraciones diferentes', () => {
    expect(CircuitBreakerPresets.standard.config.failureThreshold).toBe(5);
    expect(CircuitBreakerPresets.critical.config.failureThreshold).toBe(3);
    expect(CircuitBreakerPresets.tolerant.config.failureThreshold).toBe(10);
  });

  it('debería tener presets con timeouts diferentes', () => {
    expect(CircuitBreakerPresets.standard.config.timeoutMs).toBe(60000);
    expect(CircuitBreakerPresets.critical.config.timeoutMs).toBe(30000);
    expect(CircuitBreakerPresets.tolerant.config.timeoutMs).toBe(120000);
  });
});

describe('CircuitBreakerRegistry', () => {
  beforeEach(() => {
    // Limpiar el registry entre tests
    const keys = Array.from(circuitBreakerRegistry['breakers'].keys());
    keys.forEach(key => circuitBreakerRegistry['breakers'].delete(key));
  });

  it('debería crear breakers automáticamente', () => {
    const breaker1 = circuitBreakerRegistry.get('service1');
    const breaker2 = circuitBreakerRegistry.get('service1');

    // Debería ser la misma instancia
    expect(breaker1).toBe(breaker2);
  });

  it('debería registrar breakers personalizados', () => {
    const customBreaker = new CircuitBreaker({
      failureThreshold: 1,
      successThreshold: 1,
      timeoutMs: 1000,
    });

    circuitBreakerRegistry.register('custom', customBreaker);
    const retrieved = circuitBreakerRegistry.get('custom');

    expect(retrieved).toBe(customBreaker);
  });

  it('debería obtener estados de todos los breakers', () => {
    circuitBreakerRegistry.get('service1');
    circuitBreakerRegistry.get('service2');

    const states = circuitBreakerRegistry.getAllStates();
    expect(Object.keys(states)).toContain('service1');
    expect(Object.keys(states)).toContain('service2');
  });
});

describe('withCircuitBreaker', () => {
  it('debería ejecutar a través del circuit breaker', async () => {
    const result = await withCircuitBreaker('test-service', async () => {
      return 'test result';
    });

    expect(result.success).toBe(true);
    expect(result.result).toBe('test result');
    expect(result.state).toBe(CircuitState.CLOSED);
  });

  it('debería capturar errores a través del circuit breaker', async () => {
    const result = await withCircuitBreaker('test-service-fail', async () => {
      throw new Error('test error');
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('test error');
  });
});

describe('CircuitBreakerMetrics', () => {
  beforeEach(() => {
    // Limpiar el registry
    const keys = Array.from(circuitBreakerRegistry['breakers'].keys());
    keys.forEach(key => circuitBreakerRegistry['breakers'].delete(key));
  });

  it('debería obtener métricas de todos los circuit breakers', () => {
    // Crear algunos breakers con estados diferentes
    const breaker1 = circuitBreakerRegistry.get('service1');
    const breaker2 = circuitBreakerRegistry.get('service2');

    // Forzar estados diferentes
    breaker1.forceOpen();
    breaker2.forceClose();

    const metrics = getCircuitBreakerMetrics();

    expect(metrics).toHaveLength(2);
    expect(metrics[0]).toMatchObject({
      name: expect.any(String),
      state: expect.any(String),
      failureCount: expect.any(Number),
      successCount: expect.any(Number),
      isAvailable: expect.any(Boolean),
    });
  });

  it('debería marcar correctamente disponibilidad', () => {
    const breaker = circuitBreakerRegistry.get('available-service');
    const metrics = getCircuitBreakerMetrics();

    // En estado cerrado, debería estar disponible
    expect(metrics[0].isAvailable).toBe(true);

    // Abrir el circuito
    breaker.forceOpen();
    const metricsAfterOpen = getCircuitBreakerMetrics();

    // Ahora debería estar no disponible
    expect(metricsAfterOpen[0].isAvailable).toBe(false);
  });
});