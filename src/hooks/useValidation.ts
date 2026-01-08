/**
 * React hook for form validation with Zod
 * Provides real-time validation, error handling, and form state management
 */

import { useState, useCallback, useEffect } from 'react';
import type { ZodSchema } from 'zod';
import {
  ZodValidator,
  FormValidator,
  globalValidator,
  type ValidationResult,
  type FieldValidationResult
} from '@/lib/validators';
import { EntitySchemas } from '@/lib/entityValidators';

export interface UseValidationOptions<T> {
  schema: ZodSchema<T>;
  initialValues?: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (data: T) => void | Promise<void>;
  onError?: (errors: string[]) => void;
}

export interface ValidationState<T> {
  values: Partial<T>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export function useValidation<T extends Record<string, unknown>>({
  schema,
  initialValues = {},
  validateOnChange = true,
  validateOnBlur = true,
  onSubmit,
  onError,
}: UseValidationOptions<T>) {
  // Form state
  const [state, setState] = useState<ValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    submitCount: 0,
  });

  // Update values when initialValues change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      values: { ...initialValues, ...prev.values },
    }));
  }, [initialValues]);

  // Validate entire form
  const validateForm = useCallback((values: Partial<T> = state.values): ValidationResult<T> => {
    return ZodValidator.validate(schema, values);
  }, [schema, state.values]);

  // Validate single field
  const validateField = useCallback((fieldName: keyof T, value: unknown): FieldValidationResult => {
    // Usar type assertion para evitar errores de TypeScript
    const schemaWithShape = schema as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const fieldSchema = schemaWithShape.shape?.[fieldName];
    const result = FormValidator.validateField(fieldSchema, value);

    // Update touched state
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true },
    }));

    return result;
  }, [schema]);

  // Update field value and validate
  const updateFieldValue = useCallback((fieldName: keyof T, value: unknown) => {
    setState(prev => {
      const newValues = { ...prev.values, [fieldName]: value };
      const newTouched = { ...prev.touched, [fieldName]: true };

      // Update isDirty
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValues);

      // Validate if requested
      if (!validateOnChange) {
        return {
          ...prev,
          values: newValues,
          touched: newTouched,
          isDirty,
        };
      }

      const fieldResult = validateField(fieldName, value);
      const newErrors = { ...prev.errors };

      if (fieldResult.error) {
        newErrors[fieldName as string] = fieldResult.error;
      } else {
        delete newErrors[fieldName as string];
      }

      // Check if entire form is valid
      const formResult = validateForm(newValues);

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        touched: newTouched,
        isValid: formResult.success,
        isDirty,
      };
    });
  }, [validateForm, validateField, validateOnChange, initialValues]);

  // Handle field change
  const handleChange = useCallback((fieldName: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    updateFieldValue(fieldName, value);
  }, [updateFieldValue]);

  // Handle blur event
  const handleBlur = useCallback((fieldName: keyof T) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (validateOnBlur) {
      const value = event.target.value;
      const fieldResult = validateField(fieldName, value);

      setState(prev => {
        const newErrors = { ...prev.errors };

        if (fieldResult.error) {
          newErrors[fieldName as string] = fieldResult.error;
        } else {
          delete newErrors[fieldName as string];
        }

        // Check if entire form is valid
        const formResult = validateForm();

        return {
          ...prev,
          errors: newErrors,
          isValid: formResult.success,
          touched: { ...prev.touched, [fieldName]: true },
        };
      });
    }

    // Mark as touched
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true },
    }));
  }, [validateField, validateForm, validateOnBlur]);

  // Reset form
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
      isSubmitting: false,
      submitCount: state.submitCount,
    });
  }, [initialValues, state.submitCount]);

  // Set form values
  const setFormValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValues);

      // Validate if requested
      if (!validateOnChange) {
        return {
          ...prev,
          values: newValues,
          isDirty,
        };
      }

      const formResult = validateForm(newValues);

      return {
        ...prev,
        values: newValues,
        isValid: formResult.success,
        isDirty,
      };
    });
  }, [validateForm, validateOnChange, initialValues]);

  // Submit form
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Validate form
      const result = validateForm();

      if (!result.success) {
        const errorMessages = result.errors?.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        }) || [];

        setState(prev => ({
          ...prev,
          errors: errorMessages.reduce((acc, error) => {
            const [field, ...messageParts] = error.split(': ');
            acc[field] = messageParts.join(': ');
            return acc;
          }, {} as Record<string, string>),
          isValid: false,
          isSubmitting: false,
          submitCount: prev.submitCount + 1,
        }));

        if (onError) {
          onError(errorMessages);
        }

        return;
      }

      // Call submit callback
      if (onSubmit) {
        await onSubmit(result.data as T);
      }

      // Update state on success
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submitCount: prev.submitCount + 1,
      }));

    } catch (error) {
      console.error('Form submission error:', error);

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submitCount: prev.submitCount + 1,
      }));

      if (onError) {
        onError(['An unexpected error occurred. Please try again.']);
      }
    }
  }, [validateForm, onSubmit, onError]);

  // Get field error
  const getFieldError = useCallback((fieldName: keyof T): string | undefined => {
    return state.errors[fieldName as string];
  }, [state.errors]);

  // Check if field is valid
  const isFieldValid = useCallback((fieldName: keyof T): boolean => {
    return !state.errors[fieldName as string] && state.touched[fieldName as string];
  }, [state.errors, state.touched]);

  // Check if field is invalid
  const isFieldInvalid = useCallback((fieldName: keyof T): boolean => {
    return !!state.errors[fieldName as string] && state.touched[fieldName as string];
  }, [state.errors, state.touched]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldName: keyof T): boolean => {
    return !!state.touched[fieldName as string];
  }, [state.touched]);

  // Get field props
  const getFieldProps = useCallback((fieldName: keyof T) => {
    return {
      value: state.values[fieldName] || '',
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
      error: getFieldError(fieldName),
      isValid: isFieldValid(fieldName),
      isInvalid: isFieldInvalid(fieldName),
      isTouched: isFieldTouched(fieldName),
    };
  }, [state.values, handleChange, handleBlur, getFieldError, isFieldValid, isFieldInvalid, isFieldTouched]);

  // Return all state and methods
  return {
    // State
    state,
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isDirty: state.isDirty,
    isSubmitting: state.isSubmitting,
    submitCount: state.submitCount,

    // Methods
    updateFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    validateForm,
    validateField,
    getFieldError,
    isFieldValid,
    isFieldInvalid,
    isFieldTouched,
    getFieldProps,

    // Field shortcuts
    field: getFieldProps,
  };
}

// ============================================
// CUSTOM HOOKS FOR SPECIFIC FORMS
// ============================================

// Hook for login form
export function useLoginForm(
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>,
  onError?: (errors: string[]) => void
) {
  return useValidation({
    schema: EntitySchemas.auth.login,
    initialValues: { email: '', password: '' },
    onSubmit,
    onError,
    validateOnChange: true,
    validateOnBlur: true,
  });
}

// Hook for registration form
export function useRegistrationForm(
  onSubmit: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    native_language?: string;
    learning_language?: string;
  }) => void | Promise<void>,
  onError?: (errors: string[]) => void
) {
  return useValidation({
    schema: EntitySchemas.auth.register,
    initialValues: {
      email: '',
      username: '',
      password: '',
      full_name: '',
      native_language: '',
      learning_language: ''
    },
    onSubmit,
    onError,
    validateOnChange: true,
    validateOnBlur: true,
  });
}

// Hook for profile update form
export function useProfileForm(
  profileData: Record<string, unknown>,
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>,
  onError?: (errors: string[]) => void
) {
  return useValidation({
    schema: EntitySchemas.profile.update,
    initialValues: profileData,
    onSubmit,
    onError,
    validateOnChange: true,
    validateOnBlur: true,
  });
}

// ============================================
// REAL-TIME VALIDATION HOOK
// ============================================

export function useRealtimeValidation(
  fieldName: string,
  schema: ZodSchema<unknown>,
  options: {
    debounceMs?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  } = {}
) {
  const [result, setResult] = useState<FieldValidationResult>({ isValid: true });
  const [touched, setTouched] = useState(false);

  // Register with global validator
  useEffect(() => {
    globalValidator.registerField(
      fieldName,
      schema,
      (validationResult) => {
        setResult(validationResult);
      },
      options
    );

    return () => {
      globalValidator.unregisterField(fieldName);
    };
  }, [fieldName, schema, options]);

  const handleValueChange = useCallback((value: unknown) => {
    setTouched(true);
    return globalValidator.updateField(fieldName, value, options);
  }, [fieldName, options]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const currentResult = globalValidator.validateField(fieldName, globalValidator);
    setResult(currentResult);
  }, [fieldName]);

  return {
    result,
    touched,
    handleValueChange,
    handleBlur,
    isValid: result.isValid,
    error: result.error,
    isDirty: touched,
  };
}