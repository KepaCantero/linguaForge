/**
 * Servicio de Circuit Breaker para APIs externas
 * Implementa el patrón Circuit Breaker para prevenir cascadas de fallos
 */

// ============================================
// TIPOS
// ============================================

export enum CircuitState {
  CLOSED = 'closed',      // Funcionamiento normal
  OPEN = 'open',          // Circuito abierto, fallar rápido
  HALF_OPEN = 'half_open', // Intentando recuperar
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Fallos antes de abrir
  successThreshold: number;      // Éxitos para cerrar desde half-open
  timeoutMs: number;             // Tiempo en open antes de intentar half-open
  monitoringPeriodMs?: number;   // Período de monitoreo para resetear contador
}

export interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastStateChange: number;
  nextAttemptTime: number | null;
}

export interface CircuitBreakerResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  state: CircuitState;
}

// ============================================
// IMPLEMENTACIÓN
// ============================================

export class CircuitBreaker {
  public config: CircuitBreakerConfig;
  private state: CircuitBreakerState;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastStateChange: Date.now(),
      nextAttemptTime: null,
    };
  }

  /**
   * Ejecuta una función a través del circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<CircuitBreakerResult<T>> {
    const now = Date.now();

    // Verificar si debe transicionar a half-open
    if (
      this.state.state === CircuitState.OPEN &&
      this.state.nextAttemptTime &&
      now >= this.state.nextAttemptTime
    ) {
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    // Fail fast si el circuito está abierto
    if (this.state.state === CircuitState.OPEN) {
      return {
        success: false,
        error: new Error(
          'Circuit breaker is OPEN. Service temporarily unavailable.'
        ),
        state: this.state.state,
      };
    }

    // Ejecutar la función
    try {
      const result = await fn();
      this.onSuccess();
      return {
        success: true,
        result,
        state: this.state.state,
      };
    } catch (error) {
      this.onFailure();
      return {
        success: false,
        error: error as Error,
        state: this.state.state,
      };
    }
  }

  /**
   * Maneja un éxito en la ejecución
   */
  private onSuccess(): void {
    if (this.state.state === CircuitState.HALF_OPEN) {
      this.state.successCount++;

      // Si alcanzamos el umbral de éxitos, cerrar el circuito
      if (this.state.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else if (this.state.state === CircuitState.CLOSED) {
      // Resetear contador de fallos en estado cerrado
      this.state.failureCount = 0;
    }
  }

  /**
   * Maneja un fallo en la ejecución
   */
  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    // Verificar si debe abrirse el circuito
    if (
      this.state.state === CircuitState.CLOSED &&
      this.state.failureCount >= this.config.failureThreshold
    ) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state.state === CircuitState.HALF_OPEN) {
      // Volver a abrir si falla en half-open
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Transiciona a un nuevo estado
   */
  private transitionTo(newState: CircuitState): void {
    const now = Date.now();

    this.state.state = newState;
    this.state.lastStateChange = now;

    switch (newState) {
      case CircuitState.OPEN:
        this.state.nextAttemptTime = now + this.config.timeoutMs;
        this.state.successCount = 0;
        break;

      case CircuitState.HALF_OPEN:
        this.state.nextAttemptTime = null;
        this.state.successCount = 0;
        break;

      case CircuitState.CLOSED:
        this.state.failureCount = 0;
        this.state.successCount = 0;
        this.state.nextAttemptTime = null;
        this.state.lastFailureTime = null;
        break;
    }
  }

  /**
   * Obtiene el estado actual
   */
  getState(): Readonly<CircuitBreakerState> {
    return { ...this.state };
  }

  /**
   * Resetea el circuit breaker a estado cerrado
   */
  reset(): void {
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastStateChange: Date.now(),
      nextAttemptTime: null,
    };
  }

  /**
   * Fuerza al circuit breaker a abrir (útil para testing)
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
  }

  /**
   * Fuerza al circuit breaker a cerrar (útil para testing)
   */
  forceClose(): void {
    this.transitionTo(CircuitState.CLOSED);
  }
}

// ============================================
// FACTORY PARA CIRCUIT BREAKERS PRECONFIGURADOS
// ============================================

export const CircuitBreakerPresets = {
  // Para APIs externas generales
  standard: new CircuitBreaker({
    failureThreshold: 5,        // 5 fallos antes de abrir
    successThreshold: 2,        // 2 éxitos para cerrar
    timeoutMs: 60000,           // 1 minuto en open
  }),

  // Para servicios críticos
  critical: new CircuitBreaker({
    failureThreshold: 3,        // Más sensible
    successThreshold: 3,        // Requiere más éxitos
    timeoutMs: 30000,           // 30 segundos en open
  }),

  // Para servicios tolerantes a fallos
  tolerant: new CircuitBreaker({
    failureThreshold: 10,       // Más tolerante
    successThreshold: 1,        // Cierra con 1 éxito
    timeoutMs: 120000,          // 2 minutos en open
  }),

  // Para servicios de IA/costosos
  aiService: new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeoutMs: 120000,          // 2 minutos para APIs de IA
  }),
};

// ============================================
// REGISTRO DE CIRCUIT BREAKERS
// ============================================

class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  get(name: string): CircuitBreaker {
    let breaker = this.breakers.get(name);

    if (!breaker) {
      // Usar preset standard por defecto
      breaker = new CircuitBreaker(CircuitBreakerPresets.standard.config);
      this.breakers.set(name, breaker);
    }

    return breaker;
  }

  register(name: string, breaker: CircuitBreaker): void {
    this.breakers.set(name, breaker);
  }

  getAllStates(): Record<string, Readonly<CircuitBreakerState>> {
    const states: Record<string, Readonly<CircuitBreakerState>> = {};

    for (const [name, breaker] of Array.from(this.breakers.entries())) {
      states[name] = breaker.getState();
    }

    return states;
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// ============================================
// WRAPPER PARA USAR CIRCUIT BREAKER
// ============================================

/**
 * Ejecuta una función a través de un circuit breaker nombrado
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>
): Promise<CircuitBreakerResult<T>> {
  const breaker = circuitBreakerRegistry.get(name);
  return breaker.execute(fn);
}

/**
 * Registra un circuit breaker personalizado
 */
export function registerCircuitBreaker(
  name: string,
  config: CircuitBreakerConfig
): CircuitBreaker {
  const breaker = new CircuitBreaker(config);
  circuitBreakerRegistry.register(name, breaker);
  return breaker;
}

/**
 * Obtiene el estado de todos los circuit breakers
 */
export function getAllCircuitBreakerStates(): Record<
  string,
  Readonly<CircuitBreakerState>
> {
  return circuitBreakerRegistry.getAllStates();
}

// ============================================
// MONITOREO Y MÉTRICAS
// ============================================

export interface CircuitBreakerMetrics {
  name: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  timeSinceLastStateChange: number;
  isAvailable: boolean;
}

/**
 * Obtiene métricas de todos los circuit breakers
 */
export function getCircuitBreakerMetrics(): CircuitBreakerMetrics[] {
  const states = getAllCircuitBreakerStates();
  const now = Date.now();

  return Object.entries(states).map(([name, state]) => ({
    name,
    state: state.state,
    failureCount: state.failureCount,
    successCount: state.successCount,
    timeSinceLastStateChange: now - state.lastStateChange,
    isAvailable: state.state !== CircuitState.OPEN,
  }));
}
