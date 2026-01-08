import { describe, it, expect, beforeEach } from 'vitest';
import { ZodValidator, FormValidator, DataSanitizer, globalValidator } from '@/lib/validators';
import { z } from 'zod';

describe('ZodValidator', () => {
  const testSchema = z.object({
    name: z.string().min(2, 'Name too short'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18 or older'),
  });

  describe('validate', () => {
    it('should validate correct data successfully', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const result = ZodValidator.validate(testSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const data = {
        name: 'J', // Too short
        email: 'invalid-email',
        age: 15, // Too young
      };

      const result = ZodValidator.validate(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(3);
      expect(result.formattedError).toContain('Name too short');
      expect(result.formattedError).toContain('Invalid email');
      expect(result.formattedError).toContain('Must be 18 or older');
    });

    it('should handle partial validation errors', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        extra: 'should be ignored',
      };

      const result = ZodValidator.validate(testSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      });
    });
  });

  describe('partialValidate', () => {
    it('should validate partial data for updates', () => {
      const partialSchema = testSchema.partial();
      const data = {
        name: 'Updated Name',
        // email and age are missing, should be OK
      };

      const result = ZodValidator.partialValidate(partialSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'Updated Name',
        email: undefined,
        age: undefined,
      });
    });

    it('should validate partial data with required fields', () => {
      const data = {
        email: 'invalid-email', // Invalid format
        age: 15, // Invalid value
      };

      const result = ZodValidator.partialValidate(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});

describe('FormValidator', () => {
  const emailSchema = z.string().email('Invalid email address');
  const userSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    age: z.number().min(18),
  });

  describe('validateField', () => {
    it('should validate a single field correctly', () => {
      const result = FormValidator.validateField(emailSchema, 'valid@example.com', 'email');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid field', () => {
      const result = FormValidator.validateField(emailSchema, 'invalid-email', 'email');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email address');
    });
  });

  describe('validateForm', () => {
    it('should validate multiple fields', () => {
      const formData = {
        username: 'john',
        email: 'john@example.com',
        age: 25,
      };

      const schemas = {
        username: userSchema.shape.username,
        email: userSchema.shape.email,
        age: userSchema.shape.age,
      };

      const results = FormValidator.validateForm(formData, schemas);

      expect(results.username.isValid).toBe(true);
      expect(results.email.isValid).toBe(true);
      expect(results.age.isValid).toBe(true);
      expect(FormValidator.hasErrors(results)).toBe(false);
    });

    it('should detect validation errors in form', () => {
      const formData = {
        username: 'j', // Too short
        email: 'invalid-email', // Invalid format
        age: 15, // Too young
      };

      const schemas = {
        username: userSchema.shape.username,
        email: userSchema.shape.email,
        age: userSchema.shape.age,
      };

      const results = FormValidator.validateForm(formData, schemas);

      expect(results.username.isValid).toBe(false);
      expect(results.email.isValid).toBe(false);
      expect(results.age.isValid).toBe(false);
      expect(FormValidator.hasErrors(results)).toBe(true);
    });
  });

  describe('getErrorMessages', () => {
    it('should get all error messages', () => {
      const results = {
        username: { isValid: false, error: 'Username too short' },
        email: { isValid: true },
        age: { isValid: false, error: 'Must be 18 or older' },
      };

      const messages = FormValidator.getErrorMessages(results);

      expect(messages).toEqual([
        'username: Username too short',
        'age: Must be 18 or older',
      ]);
    });

    it('should return empty array when no errors', () => {
      const results = {
        username: { isValid: true },
        email: { isValid: true },
        age: { isValid: true },
      };

      const messages = FormValidator.getErrorMessages(results);

      expect(messages).toEqual([]);
    });
  });
});

describe('DataSanitizer', () => {
  describe('clean', () => {
    it('should remove undefined, null, and empty string values', () => {
      const dirtyData = {
        name: 'John',
        email: '  john@example.com  ',
        age: undefined,
        phone: null,
        bio: '',
        active: true,
      };

      const cleanData = DataSanitizer.clean(dirtyData);

      expect(cleanData).toEqual({
        name: 'John',
        email: '  john@example.com  ',
        active: true,
      });
    });

    it('should preserve falsy values that are valid', () => {
      const data = {
        count: 0,
        isEmpty: false,
        value: null as any, // Explicit null should be removed
        zero: 0,
      };

      const clean = DataSanitizer.clean(data);

      expect(clean).toEqual({
        count: 0,
        isEmpty: false,
        zero: 0,
      });
    });
  });

  describe('trimStrings', () => {
    it('should trim all string values', () => {
      const data = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        bio: '  Some bio text  ',
        age: 25,
        active: true,
      };

      const trimmed = DataSanitizer.trimStrings(data);

      expect(trimmed).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Some bio text',
        age: 25,
        active: true,
      });
    });

    it('should preserve non-string values', () => {
      const data = {
        age: 25,
        score: 95.5,
        active: true,
        nested: {
          value: '  nested  ',
          number: 42,
        },
      };

      const trimmed = DataSanitizer.trimStrings(data);

      expect(trimmed).toEqual({
        age: 25,
        score: 95.5,
        active: true,
        nested: {
          value: 'nested',
          number: 42,
        },
      });
    });
  });

  describe('sanitizeAndValidate', () => {
    const schema = z.object({
      name: z.string().min(2, 'Name too short'),
      email: z.string().email('Invalid email address'),
    });

    it('should sanitize and validate in one step', () => {
      const data = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        extra: 'should be removed',
      };

      const result = DataSanitizer.sanitizeAndValidate(schema, data, {
        clean: true,
        trimStrings: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should return validation errors after sanitization', () => {
      const data = {
        name: '  J  ', // Too short after trim
        email: '  invalid-email  ',
      };

      const result = DataSanitizer.sanitizeAndValidate(schema, data, {
        clean: true,
        trimStrings: true,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.message).toContain('Name too short');
    });
  });
});

describe('Global Realtime Validator', () => {
  beforeEach(() => {
    // Clear any registered fields
    globalValidator.unregisterField('test');
  });

  describe('registerField', () => {
    it('should register a field for validation', () => {
      const schema = z.string().min(3);
      const callback = vi.fn();

      expect(() => {
        globalValidator.registerField('test', schema, callback);
      }).not.toThrow();
    });
  });

  describe('validateField', () => {
    it('should validate a registered field', () => {
      const schema = z.string().min(3, 'Too small: expected string to have >=3 characters');
      const callback = vi.fn();

      globalValidator.registerField('test', schema, callback);

      const result = globalValidator.validateField('test', 'ab'); // Too short

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Too small: expected string to have >=3 characters');
    });

    it('should handle unknown fields gracefully', () => {
      const result = globalValidator.validateField('unknown', 'value');

      expect(result.isValid).toBe(true); // Unknown fields pass validation
    });
  });

  describe('updateField', () => {
    it('should update field and trigger validation', () => {
      const schema = z.string().min(3);
      const callback = vi.fn();

      globalValidator.registerField('test', schema, callback, { debounceMs: 0 });

      globalValidator.updateField('test', 'valid');

      expect(callback).toHaveBeenCalled();
    });

    it('should return validation result', () => {
      const schema = z.string().min(3);
      const callback = vi.fn();

      globalValidator.registerField('test', schema, callback, { debounceMs: 0 });

      const result = globalValidator.updateField('test', 'valid');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('unregisterField', () => {
    it('should remove a registered field', () => {
      const schema = z.string();
      const callback = vi.fn();

      globalValidator.registerField('test', schema, callback);
      globalValidator.unregisterField('test');

      // Should not throw and should not validate
      expect(() => {
        globalValidator.validateField('test', 'value');
      }).not.toThrow();
    });
  });
});

describe('Validation Error Handling', () => {
  const complexSchema = z.object({
    username: z.string().min(3, 'Too small: expected string to have >=3 characters').max(20),
    email: z.string().email('Invalid email'),
    preferences: z.object({
      theme: z.enum(['light', 'dark'], 'Invalid enum value'),
      notifications: z.boolean(),
    }),
    settings: z.array(z.string()),
  });

  it('should handle nested object validation errors', () => {
    const data = {
      username: 'ab', // Too short
      email: 'invalid',
      preferences: {
        theme: 'invalid-theme', // Invalid enum
        notifications: true,
      },
      settings: ['setting1', 'setting2'],
    };

    const result = ZodValidator.validate(complexSchema, data);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(3);

    // Check error paths
    const usernameError = result.errors?.find(err => err.path.join('.') === 'username');
    const emailError = result.errors?.find(err => err.path.join('.') === 'email');
    const themeError = result.errors?.find(err => err.path.join('.') === 'preferences.theme');

    expect(usernameError?.message).toContain('Too small: expected string to have >=3 characters');
    expect(emailError?.message).toContain('Invalid email');
    expect(themeError?.message).toContain('Invalid enum');
  });

  it('should handle array validation errors', () => {
    const data = {
      username: 'validuser',
      email: 'valid@example.com',
      preferences: {
        theme: 'light',
        notifications: true,
      },
      settings: 'invalid', // Should be array
    };

    const result = ZodValidator.validate(complexSchema, data);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();

    const settingsError = result.errors?.find(err => err.path.join('.') === 'settings');
    expect(settingsError?.code).toBe('invalid_type');
  });
});