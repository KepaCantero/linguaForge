/**
 * Servicio de Rate Limiting para APIs externas
 * Implementa Token Bucket Algorithm con persistencia opcional
 */

// ============================================
// TIPOS
// ============================================

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // milisegundos hasta que se permite la próxima request
  remainingRequests: number;
}

export interface RateLimiterStorage {
  get(key: string): RateLimitState | null;
  set(key: string, value: RateLimitState): void;
  delete?(key: string): void;
}

export interface RateLimitState {
  count: number;
  resetTime: number;
}

// ============================================
// IMPLEMENTACIÓN EN MEMORIA
// ============================================

class InMemoryRateLimiterStorage implements RateLimiterStorage {
  private store = new Map<string, RateLimitState>();

  get(key: string): RateLimitState | null {
    const value = this.store.get(key);
    if (!value) return null;

    // Limpiar estados expirados
    if (Date.now() > value.resetTime) {
      this.store.delete(key);
      return null;
    }

    return value;
  }

  set(key: string, value: RateLimitState): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

// ============================================
// RATE LIMITER
// ============================================

export class RateLimiter {
  private config: RateLimitConfig;
  private storage: RateLimiterStorage;

  constructor(
    config: RateLimitConfig,
    storage?: RateLimiterStorage
  ) {
    this.config = config;
    this.storage = storage ?? new InMemoryRateLimiterStorage();
  }

  /**
   * Verifica si una request está permitida
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const state = this.storage.get(identifier);

    // Si no hay estado previo, crear uno nuevo
    if (!state) {
      const newState: RateLimitState = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.storage.set(identifier, newState);

      return {
        allowed: true,
        remainingRequests: this.config.maxRequests - 1,
      };
    }

    // Si la ventana de tiempo ya pasó, resetear
    if (now >= state.resetTime) {
      const newState: RateLimitState = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.storage.set(identifier, newState);

      return {
        allowed: true,
        remainingRequests: this.config.maxRequests - 1,
      };
    }

    // Verificar si se excedió el límite
    if (state.count >= this.config.maxRequests) {
      return {
        allowed: false,
        retryAfter: state.resetTime - now,
        remainingRequests: 0,
      };
    }

    // Incrementar contador
    state.count += 1;
    this.storage.set(identifier, state);

    return {
      allowed: true,
      remainingRequests: this.config.maxRequests - state.count,
    };
  }

  /**
   * Resetea el contador para un identificador
   */
  reset(identifier: string): void {
    // En implementación en memoria, eliminamos la entrada
    if (this.storage.delete) {
      this.storage.delete(identifier);
    }
  }

  /**
   * Obtiene el estado actual sin modificarlo
   */
  getState(identifier: string): RateLimitState | null {
    return this.storage.get(identifier);
  }
}

// ============================================
// FACTORY PARA LIMITERS PRECONFIGURADOS
// ============================================

export const RateLimitPresets = {
  // Para APIs públicas generales
  public: new RateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests por minuto
  }),

  // Para APIs externas costosas (TTS, traducción)
  expensive: new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests por minuto
  }),

  // Para operaciones de escritura (database writes)
  write: new RateLimiter({
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests por minuto
  }),

  // Para auth endpoints
  auth: new RateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests por minuto
  }),

  // Para búsqueda
  search: new RateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests por minuto
  }),
};

// ============================================
// DECORADOR PARA FUNCIONES ASÍNCRONAS
// ============================================

/**
 * Decorador que aplica rate limiting a una función asíncrona
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  limiter: RateLimiter,
  getIdentifier: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const identifier = getIdentifier(...args);
    const result = limiter.check(identifier);

    if (!result.allowed) {
      throw new Error(
        `Rate limit exceeded. Retry after ${result.retryAfter}ms`
      );
    }

    return fn(...args);
  }) as T;
}

// ============================================
// RATE LIMITER PERSISTENTE (localStorage)
// ============================================

class LocalStorageRateLimiterStorage implements RateLimiterStorage {
  get(key: string): RateLimitState | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(`ratelimit:${key}`);
      if (!item) return null;

      const state = JSON.parse(item) as RateLimitState;

      // Limpiar estados expirados
      if (Date.now() > state.resetTime) {
        localStorage.removeItem(`ratelimit:${key}`);
        return null;
      }

      return state;
    } catch {
      return null;
    }
  }

  set(key: string, value: RateLimitState): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(`ratelimit:${key}`, JSON.stringify(value));
    } catch {
      // Silenciar errores de localStorage
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`ratelimit:${key}`);
    } catch {
      // Silenciar errores de localStorage
    }
  }
}

/**
 * Crea un RateLimiter con persistencia en localStorage
 */
export function createRateLimiter(
  config: RateLimitConfig
): RateLimiter {
  return new RateLimiter(config, new LocalStorageRateLimiterStorage());
}

// ============================================
// RATE LIMITER PARA SERVER (para futura implementación con Redis)
// ============================================

/**
 * Interfaz para un RateLimiter distribuido (ej. Redis)
 * Pendiente de implementación con Redis o similar
 */
export interface DistributedRateLimiterStorage extends RateLimiterStorage {
  // Método para obtener un lock distribuido
  acquireLock?(key: string, ttl: number): Promise<boolean>;
  releaseLock?(key: string): void;
}

/**
 * Ejemplo de implementación con Redis (pendiente)
 *
 * export class RedisRateLimiterStorage implements DistributedRateLimiterStorage {
 *   private client: Redis;
 *
 *   constructor(redisUrl: string) {
 *     this.client = new Redis(redisUrl);
 *   }
 *
 *   async get(key: string): Promise<RateLimitState | null> {
 *     const data = await this.client.get(`ratelimit:${key}`);
 *     return data ? JSON.parse(data) : null;
 *   }
 *
 *   async set(key: string, value: RateLimitState): Promise<void> {
 *     await this.client.setex(
 *       `ratelimit:${key}`,
 *       Math.ceil((value.resetTime - Date.now()) / 1000),
 *       JSON.stringify(value)
 *     );
 *   }
 *
 *   async acquireLock(key: string, ttl: number): Promise<boolean> {
 *     const result = await this.client.set(
 *       `lock:${key}`,
 *       '1',
 *       'NX',
 *       'EX',
 *       ttl
 *     );
 *     return result === 'OK';
 *   }
 *
 *   async releaseLock(key: string): Promise<void> {
 *     await this.client.del(`lock:${key}`);
 *   }
 * }
 */
