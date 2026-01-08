/**
 * Runtime validation helpers for Zod schemas
 * Provides utilities for validating data at runtime with detailed error reporting
 */

import { z, ZodError, ZodSchema } from 'zod';

// ============================================
// TIPOS DE ERRORES DE VALIDACIÓN
// ============================================

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  formattedError?: string;
}

// ============================================
// VALIDADOR GENÉRICO
// ============================================

export class ZodValidator {
  /**
   * Valida datos contra un schema Zod
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const result = schema.safeParse(data);

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        errors: this.formatZodErrors(result.error),
        formattedError: this.formatZodError(result.error),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: this.formatZodErrors(error),
          formattedError: this.formatZodError(error),
        };
      }

      return {
        success: false,
        errors: [{
          path: [] as string[],
          message: 'Unexpected validation error',
          code: 'custom' as ZodError['issues'][0]['code'],
        }],
        formattedError: 'Unexpected validation error',
      };
    }
  }

  /**
   * Valida datos de forma parcial (para updates)
   */
  static partialValidate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const result = (schema as any).partial().safeParse(data); // eslint-disable-line @typescript-eslint/no-explicit-any

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        errors: this.formatZodErrors(result.error),
        formattedError: this.formatZodError(result.error),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: this.formatZodErrors(error),
          formattedError: this.formatZodError(error),
        };
      }

      return {
        success: false,
        errors: [{
          path: [] as string[],
          message: 'Unexpected validation error',
          code: 'custom' as ZodError['issues'][0]['code'],
        }],
        formattedError: 'Unexpected validation error',
      };
    }
  }

  // ============================================
  // UTILIDADES DE FORMATEO
  // ============================================

  private static formatZodErrors(error: ZodError): ValidationError[] {
    return error.issues.map(err => ({
      path: err.path.map(p => String(p)),
      message: err.message,
      code: err.code as string,
    }));
  }

  private static formatZodError(error: ZodError): string {
    return error.issues
      .map(err => err.message)
      .join('; ');
  }
}

// ============================================
// VALIDADORES ESPECÍFICOS
// ============================================

// Email validator
export const EmailValidator = z.string().email();
export type Email = z.infer<typeof EmailValidator>;

// Password validator (strong)
export const PasswordValidator = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
export type Password = z.infer<typeof PasswordValidator>;

// Username validator
export const UsernameValidator = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores');
export type Username = z.infer<typeof UsernameValidator>;

// URL validator
export const URLValidator = z.string().url();
export type URL = z.infer<typeof URLValidator>;

// Date validator (ISO format)
export const DateValidator = z.string().datetime();
export type DateString = z.infer<typeof DateValidator>;

// UUID validator
export const UUIDValidator = z.string().uuid();
export type UUID = z.infer<typeof UUIDValidator>;

// ============================================
// DECORADORES DE VALIDACIÓN (RUNTIME)
// ============================================

export function ValidateSchema<T>(schema: ZodSchema<T>) {
  return function (target: unknown,
    propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      // Validate this if it's an instance method
      const targetObj = target as { constructor: { name: string } };
      if (targetObj.constructor.name !== 'Function') {
        const validationResult = ZodValidator.validate(schema, this);
        if (!validationResult.success) {
          throw new Error(`Validation failed for ${targetObj.constructor.name}.${propertyKey}: ${validationResult.formattedError}`);
        }
      }

      // Validate arguments
      args.forEach((arg, index) => {
        const validationResult = ZodValidator.validate(schema, arg);
        if (!validationResult.success) {
          throw new Error(`Validation failed for argument ${index} in ${targetObj.constructor.name}.${propertyKey}: ${validationResult.formattedError}`);
        }
      });

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// ============================================
// UTILIDADES DE FORMULARIOS
// ============================================

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

export class FormValidator {
  /**
   * Valida un campo de formulario individual
   */
  static validateField<T>(schema: ZodSchema<T>, value: unknown): FieldValidationResult {
    const result = ZodValidator.validate(schema, value);

    return {
      isValid: result.success,
      error: result.success ? undefined : result.formattedError,
    };
  }

  /**
   * Valida múltiples campos de formulario
   */
  static validateForm(_data: Record<string, unknown>, schemas: Record<string, ZodSchema>): Record<string, FieldValidationResult> {
    const results: Record<string, FieldValidationResult> = {};

    for (const [fieldName, schema] of Object.entries(schemas)) {
      results[fieldName] = this.validateField(schema, _data[fieldName]);
    }

    return results;
  }

  /**
   * Check if form has any validation errors
   */
  static hasErrors(validationResults: Record<string, FieldValidationResult>): boolean {
    return Object.values(validationResults).some(result => !result.isValid);
  }

  /**
   * Get all error messages from validation results
   */
  static getErrorMessages(validationResults: Record<string, FieldValidationResult>): string[] {
    return Object.entries(validationResults)
      .filter(([, result]) => !result.isValid)
      .map(([fieldName, result]) => `${fieldName}: ${result.error}`);
  }
}

// ============================================
// VALIDACIÓN TIEMPO REAL (PARA FORMULARIOS)
// ============================================

export interface RealtimeValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export class RealtimeValidator {
  private debounceTimeout: NodeJS.Timeout | null = null;
  private validators = new Map<string, ZodSchema>();
  private callbacks = new Map<string, (result: FieldValidationResult) => void>();

  /**
   * Register a field for real-time validation
   */
  registerField(
    fieldName: string,
    schema: ZodSchema,
    callback: (result: FieldValidationResult) => void,
    options: RealtimeValidationOptions = {}
  ) {
    this.validators.set(fieldName, schema);
    this.callbacks.set(fieldName, callback);

    if (options.debounceMs) {
      this.setupDebouncedValidation(fieldName, options.debounceMs);
    }
  }

  /**
   * Unregister a field
   */
  unregisterField(fieldName: string) {
    this.validators.delete(fieldName);
    this.callbacks.delete(fieldName);
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }

  /**
   * Validate a field value immediately
   */
  validateField(fieldName: string, value: unknown): FieldValidationResult {
    const schema = this.validators.get(fieldName);
    if (!schema) {
      return { isValid: true };
    }

    return FormValidator.validateField(schema, value);
  }

  /**
   * Update field value and trigger validation
   */
  updateField(fieldName: string, value: unknown, options: RealtimeValidationOptions = {}) {
    const result = this.validateField(fieldName, value);

    const callback = this.callbacks.get(fieldName);
    if (callback) {
      if (options.debounceMs && options.debounceMs > 0) {
        this.debounceValidation(fieldName, value, options.debounceMs, callback);
      } else {
        callback(result);
      }
    }

    return result;
  }

  private setupDebouncedValidation(fieldName: string, debounceMs: number) {
    this.updateField = (field, value, options = {}) => {
      const result = this.validateField(field, value);

      const callback = this.callbacks.get(field);
      if (callback) {
        const finalDebounceMs = options.debounceMs ?? debounceMs;
        if (finalDebounceMs > 0) {
          this.debounceValidation(field, value, finalDebounceMs, callback);
        } else {
          callback(result);
        }
      }

      return result;
    };
  }

  private debounceValidation(
    fieldName: string,
    value: unknown,
    debounceMs: number,
    callback: (result: FieldValidationResult) => void
  ) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      const result = this.validateField(fieldName, value);
      callback(result);
    }, debounceMs);
  }
}

// ============================================
// INSTANCIA GLOBAL DE VALIDACIÓN TIEMPO REAL
// ============================================

export const globalValidator = new RealtimeValidator();

// ============================================
// SANITIZACIÓN DE DATOS
// ============================================

export class DataSanitizer {
  /**
   * Remove undefined/null values from an object
   */
  static clean<T extends Record<string, any>>(obj: T): Partial<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== '') {
        (result as Record<string, any>)[key] = value; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }

    return result;
  }

  /**
   * Trim all string values
   */
  static trimStrings<T extends Record<string, any>>(obj: T): T { // eslint-disable-line @typescript-eslint/no-explicit-any
    const result = { ...obj };

    const trimRecursive = (item: any): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (typeof item === 'string') {
        return item.trim();
      }

      if (Array.isArray(item)) {
        return item.map(trimRecursive);
      }

      if (item && typeof item === 'object') {
        const trimmedObj: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        for (const [key, value] of Object.entries(item)) {
          trimmedObj[key] = trimRecursive(value);
        }
        return trimmedObj;
      }

      return item;
    };

    return trimRecursive(result);
  }

  /**
   * Sanitize and validate data
   */
  static sanitizeAndValidate<T>(
    schema: ZodSchema<T>,
    data: unknown,
    sanitizeOptions: {
      clean?: boolean;
      trimStrings?: boolean;
    } = {}
  ): ValidationResult<T> {
    let sanitizedData = data;

    if (sanitizeOptions.trimStrings) {
      sanitizedData = this.trimStrings(sanitizedData as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    if (sanitizeOptions.clean) {
      sanitizedData = this.clean(sanitizedData as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    return ZodValidator.validate(schema, sanitizedData);
  }
}

// ============================================
// UTILIDADES DE DEBUG
// ============================================

export class ValidationDebugger {
  /**
   * Log validation errors in development
   */
  static logValidationErrors<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context?: string
  ) {
    if (process.env.NODE_ENV !== 'development') return;

    const result = ZodValidator.validate(schema, data);

    if (!result.success) {
      console.group('🔍 Validation Errors');
      console.log('Context:', context);
      console.log('Data:', data);
      console.log('Schema:', schema);
      console.log('Errors:', result.errors);
      console.log('Formatted:', result.formattedError);
      console.groupEnd();
    }
  }

  /**
   * Generate a schema preview
   */
  static previewSchema(schema: ZodSchema): string {
    return JSON.stringify(schema._def, null, 2);
  }
}