/**
 * Servicio de manejo de errores para APIs externas
 * Proporciona wrappers con retry, logging y error handling centralizado
 */

// ============================================
// TIPOS
// ============================================

export enum ErrorCategory {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  AUTH = 'auth',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AppError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  retryable: boolean;
  context?: Record<string, unknown>;
  originalError?: unknown;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableCategories: ErrorCategory[];
}

export interface ErrorHandlerOptions {
  retry?: Partial<RetryConfig>;
  onError?: (error: AppError) => void;
  fallback?: <T>(error: AppError) => T | Promise<T>;
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableCategories: [
    ErrorCategory.NETWORK,
    ErrorCategory.TIMEOUT,
    ErrorCategory.SERVER,
  ],
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Clasifica un error según su tipo y mensaje
 */
function classifyError(error: unknown): ErrorCategory {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ErrorCategory.NETWORK;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorCategory.TIMEOUT;
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorCategory.AUTH;
    }
    if (message.includes('not found') || message.includes('404')) {
      return ErrorCategory.NOT_FOUND;
    }
    if (message.includes('validation') || message.includes('400')) {
      return ErrorCategory.VALIDATION;
    }
    if (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    ) {
      return ErrorCategory.SERVER;
    }
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Determina la severidad de un error según su categoría
 */
function determineSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.AUTH:
    case ErrorCategory.CRITICAL:
      return ErrorSeverity.HIGH;
    case ErrorCategory.SERVER:
    case ErrorCategory.TIMEOUT:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.NETWORK:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.LOW;
    case ErrorCategory.NOT_FOUND:
      return ErrorSeverity.LOW;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Crea un error de aplicación con metadata completa
 */
export function createAppError(
  message: string,
  originalError: unknown,
  context?: Record<string, unknown>
): AppError {
  const category = classifyError(originalError);
  const severity = determineSeverity(category);
  const isRetryable = DEFAULT_RETRY_CONFIG.retryableCategories.includes(category);

  const appError: AppError = {
    name: 'AppError',
    message,
    category,
    severity,
    retryable: isRetryable,
    context,
    originalError,
  } as AppError;

  // Copiar stack trace si existe
  if (originalError instanceof Error && originalError.stack !== undefined) {
    (appError as { stack: string }).stack = originalError.stack;
  }

  return appError;
}

/**
 * Calcula delay con exponential backoff
 */
function calculateBackoff(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Log de error (console por ahora, podría extenderse a servicio de logging)
 */
function logError(error: AppError): void {
  const logLevel = error.severity === ErrorSeverity.CRITICAL ? 'error' :
                   error.severity === ErrorSeverity.HIGH ? 'error' :
                   error.severity === ErrorSeverity.MEDIUM ? 'warn' : 'info';

  const logMessage = `[${error.category.toUpperCase()}] ${error.message}`;

  if (logLevel === 'error') {
    console.error(logMessage, {
      context: error.context,
      originalError: error.originalError,
    });
  } else if (logLevel === 'warn') {
    console.warn(logMessage, {
      context: error.context,
    });
  } else {
    console.log(logMessage, {
      context: error.context,
    });
  }
}

// ============================================
// WRAPPER CON RETRY
// ============================================

/**
 * Ejecuta una función asíncrona con reintento automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options.retry };
  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = createAppError(
        `Operation failed (attempt ${attempt}/${config.maxAttempts})`,
        error
      );

      lastError = appError;

      // Log del error
      if (options.onError) {
        options.onError(appError);
      } else {
        logError(appError);
      }

      // Si no es reintentable o es el último intento, lanzar
      if (!appError.retryable || attempt >= config.maxAttempts) {
        if (options.fallback) {
          return options.fallback(appError);
        }
        throw appError;
      }

      // Esperar antes de reintentar
      const delay = calculateBackoff(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Esto nunca debería alcanzarse, pero TypeScript lo requiere
  throw lastError;
}

// ============================================
// WRAPPERS PARA SUPABASE
// ============================================

/**
 * Wrapper para operaciones de Supabase con error handling
 */
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  return withRetry(async () => {
    const result = await queryFn();

    if (result.error) {
      throw createAppError(
        'Supabase query failed',
        result.error,
        { query: queryFn.toString() }
      );
    }

    if (result.data === null) {
      throw createAppError(
        'Supabase query returned null',
        new Error('Expected data but got null'),
        { query: queryFn.toString() }
      );
    }

    return result.data;
  }, options);
}

/**
 * Wrapper para operaciones de Supabase que pueden retornar null
 */
export async function supabaseQueryOptional<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  return withRetry(async () => {
    const result = await queryFn();

    if (result.error) {
      throw createAppError(
        'Supabase query failed',
        result.error,
        { query: queryFn.toString() }
      );
    }

    return result.data;
  }, options);
}

// ============================================
// GUARDS DE TIPO
// ============================================

/**
 * Verifica si un error es una instancia de AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'category' in error &&
    'severity' in error &&
    'retryable' in error
  );
}

/**
 * Verifica si un error es reintentable
 */
export function isRetryable(error: unknown): boolean {
  return isAppError(error) && error.retryable;
}

/**
 * Verifica si un error es un error de red
 */
export function isNetworkError(error: unknown): boolean {
  return isAppError(error) && error.category === ErrorCategory.NETWORK;
}

/**
 * Verifica si un error es un error de autenticación
 */
export function isAuthError(error: unknown): boolean {
  return isAppError(error) && error.category === ErrorCategory.AUTH;
}

// ============================================
// MANEJO DE ERRORES EN COMPONENTES REACT
// ============================================

/**
 * Hook de utilidad para manejar errores en componentes
 */
export interface ErrorState {
  error: AppError | null;
  isError: boolean;
  reset: () => void;
  setError: (error: AppError) => void;
}

export function createErrorState(initialError?: AppError): ErrorState {
  return {
    error: initialError ?? null,
    isError: !!initialError,
    reset: () => {
      // En un contexto React, esto actualizaría el estado
      // Aquí solo es una función placeholder
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setError: (_error: AppError) => {
      // En un contexto React, esto actualizaría el estado
      // Aquí solo es una función placeholder
    },
  };
}
