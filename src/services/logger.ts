/**
 * Centralized Logging Service
 * Provides structured logging with different levels and contexts
 *
 * Usage:
 *   import { logger } from '@/services/logger';
 *   logger.error('Error message', { error, context: 'api' });
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

export interface ContextMetadata {
  userId?: string;
  sessionId?: string;
  route?: string;
  [key: string]: unknown;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: false, // Enable when remote logging service is available
};

class Logger {
  private config: LoggerConfig;
  private context: Map<string, ContextMetadata> = new Map();

  constructor(config: LoggerConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Set global logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add context metadata that will be included in all log entries
   */
  setContext(key: string, metadata: ContextMetadata): void {
    this.context.set(key, metadata);
  }

  /**
   * Remove context metadata
   */
  clearContext(key?: string): void {
    if (key) {
      this.context.delete(key);
    } else {
      this.context.clear();
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown, error?: Error, context?: string): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    };

    // Add context metadata
    const contextData: Record<string, unknown> = {};
    this.context.forEach((metadata, key) => {
      contextData[key] = metadata;
    });

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry, contextData);
    }

    // Remote logging (for production error tracking)
    if (this.config.enableRemote && level >= LogLevel.ERROR && this.config.remoteEndpoint) {
      this.logRemote(entry, contextData).catch((err) => {
        // Silently fail to avoid infinite loops
        console.error('Failed to send log to remote service:', err);
      });
    }
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry, contextData: Record<string, unknown>): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelColors = ['#6b7280', '#3b82f6', '#f59e0b', '#ef4444', '#7f1d1d'];
    const levelName = levelNames[entry.level];
    const color = levelColors[entry.level];

    const prefix = `%c[${levelName}] ${entry.timestamp}`;
    const args: unknown[] = [`color: ${color}; font-weight: bold`];

    // Add context if present
    if (entry.context) {
      args.push(`%c[${entry.context}]`, 'color: #6b7280');
    }

    args.push(entry.message);

    // Add data
    if (entry.data) {
      args.push(entry.data);
    }

    // Add context metadata
    if (Object.keys(contextData).length > 0) {
      args.push({ context: contextData });
    }

    // Add error stack if present
    if (entry.error) {
      args.push('\n', entry.error.stack || entry.error.toString());
    }

    const consoleMethod = entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL ? 'error' : entry.level === LogLevel.WARN ? 'warn' : 'log';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console[consoleMethod](...args);
  }

  /**
   * Send log to remote service (for error tracking)
   */
  private async logRemote(entry: LogEntry, contextData: Record<string, unknown>): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          contextData,
          environment: process.env.NODE_ENV,
          appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        }),
      });
    } catch (error) {
      // Silently fail to avoid infinite loops
      console.error('Failed to send log to remote service:', error);
    }
  }

  /**
   * Public logging methods
   */
  debug(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, undefined, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, data, undefined, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.WARN, message, data, undefined, context);
  }

  error(message: string, error?: Error | unknown, data?: unknown, context?: string): void {
    const err = error instanceof Error ? error : error !== undefined ? new Error(String(error)) : undefined;
    this.log(LogLevel.ERROR, message, data, err, context);
  }

  fatal(message: string, error?: Error | unknown, data?: unknown, context?: string): void {
    const err = error instanceof Error ? error : error !== undefined ? new Error(String(error)) : undefined;
    this.log(LogLevel.FATAL, message, data, err, context);
  }

  /**
   * Convenience method for API errors
   */
  apiError(message: string, error?: unknown, route?: string): void {
    this.error(message, error, { route }, 'api');
  }

  /**
   * Convenience method for service errors
   */
  serviceError(serviceName: string, message: string, error?: unknown, data?: unknown): void {
    this.error(message, error, data, serviceName);
  }

  /**
   * Convenience method for validation errors
   */
  validationError(message: string, errors?: unknown[], entity?: string): void {
    this.error(message, undefined, { errors: errors?.map((e) => String(e)).join(', ') }, `validation:${entity}`);
  }

  /**
   * Convenience method for component lifecycle errors
   */
  componentError(componentName: string, message: string, error?: unknown): void {
    this.error(message, error, undefined, `component:${componentName}`);
  }
}

// Singleton instance
export const logger = new Logger();

// Export convenience function for quick logging
export const log = {
  debug: (message: string, data?: unknown) => logger.debug(message, data),
  info: (message: string, data?: unknown) => logger.info(message, data),
  warn: (message: string, data?: unknown) => logger.warn(message, data),
  error: (message: string, error?: unknown, data?: unknown) => logger.error(message, error, data),
};
