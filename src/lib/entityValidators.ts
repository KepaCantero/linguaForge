/**
 * Entity-specific validators using the base validator system
 * Provides runtime validation for all domain entities
 */

import { z } from 'zod';
import {
  ProfileSchema,
  LessonProgressSchema,
  UserStatsSchema,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AchievementSchema,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UserAchievementSchema,
  StudySessionSchema,
  UserTimeSchema,
  FavoriteResourceSchema,
  NotificationSettingsSchema,
} from '@/schemas/supabase';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ZodValidator, FormValidator, DataSanitizer } from '@/lib/validators';

// ============================================
// PROFILE VALIDATORS
// ============================================

export const CreateProfileValidator = ProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
});

export const UpdateProfileValidator = ProfileSchema.partial().extend({
  id: z.string().uuid('Invalid profile ID'),
}).omit({ created_at: true, updated_at: true });

export const ProfileSearchValidator = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  native_language: z.string().max(10).optional(),
  learning_language: z.string().max(10).optional(),
});

// ============================================
// LESSON PROGRESS VALIDATORS
// ============================================

export const CreateLessonProgressValidator = LessonProgressSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  started_at: true,
  last_accessed: true,
}).extend({
  user_id: z.string().uuid('Invalid user ID'),
  lesson_id: z.string().min(1, 'Lesson ID is required'),
  level: z.string().min(1, 'Level is required'),
  completed: z.boolean().default(false),
  progress_percentage: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
});

export const UpdateLessonProgressValidator = LessonProgressSchema.partial().extend({
  id: z.string().uuid('Invalid progress ID'),
  user_id: z.string().uuid('Invalid user ID'),
  lesson_id: z.string().min(1, 'Lesson ID is required'),
}).omit({ created_at: true, updated_at: true });

export const LessonProgressStatsValidator = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

// ============================================
// USER STATS VALIDATORS
// ============================================

export const CreateUserStatsValidator = UserStatsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  user_id: z.string().uuid('Invalid user ID'),
  total_xp_earned: z.number().min(0, 'XP cannot be negative'),
  total_coins_earned: z.number().min(0, 'Coins cannot be negative'),
  level: z.number().min(1, 'Level must be at least 1'),
  rank: z.string().min(1, 'Rank is required'),
});

export const UpdateUserStatsValidator = UserStatsSchema.partial().extend({
  id: z.string().uuid('Invalid stats ID'),
  user_id: z.string().uuid('Invalid user ID'),
}).omit({ created_at: true, updated_at: true });

export const UserStatsUpdateValidator = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  xp_earned: z.number().min(0, 'XP cannot be negative').optional(),
  coins_earned: z.number().min(0, 'Coins cannot be negative').optional(),
  gems_earned: z.number().min(0, 'Gems cannot be negative').optional(),
  lessons_completed: z.number().min(0).optional(),
  exercises_completed: z.number().min(0).optional(),
  streak: z.number().min(0).optional(),
});

// ============================================
// ACHIEVEMENT VALIDATORS
// ============================================

export const CreateAchievementValidator = AchievementSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().min(1, 'Description is required'),
  condition: z.record(z.string(), z.unknown()),
  xp_reward: z.number().min(0, 'XP reward cannot be negative'),
  coin_reward: z.number().min(0, 'Coin reward cannot be negative'),
  gem_reward: z.number().min(0, 'Gem reward cannot be negative'),
  category: z.enum(['learning', 'streak', 'accuracy', 'exploration', 'social']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
});

export const UnlockAchievementValidator = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  achievement_id: z.string().uuid('Invalid achievement ID'),
});

// ============================================
// STUDY SESSION VALIDATORS
// ============================================

export const CreateStudySessionValidator = StudySessionSchema.omit({
  id: true,
  created_at: true
}).extend({
  user_id: z.string().uuid('Invalid user ID'),
  session_type: z.enum(['lesson', 'review', 'practice', 'challenge']),
  duration: z.number().min(0, 'Duration cannot be negative'),
  xp_earned: z.number().min(0, 'XP earned cannot be negative'),
  coins_earned: z.number().min(0, 'Coins earned cannot be negative'),
  gems_earned: z.number().min(0, 'Gems earned cannot be negative'),
  accuracy: z.number().min(0).max(100, 'Accuracy must be between 0 and 100'),
});

// ============================================
// USER TIME VALIDATORS
// ============================================

export const CreateUserTimeValidator = UserTimeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  user_id: z.string().uuid('Invalid user ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time_spent: z.number().min(0, 'Time spent cannot be negative'),
  lessons_completed: z.number().min(0),
  exercises_completed: z.number().min(0),
  xp_earned: z.number().min(0, 'XP earned cannot be negative'),
});

// ============================================
// FAVORITE RESOURCE VALIDATORS
// ============================================

export const CreateFavoriteResourceValidator = FavoriteResourceSchema.omit({
  id: true,
  created_at: true
}).extend({
  user_id: z.string().uuid('Invalid user ID'),
  resource_type: z.enum(['lesson', 'exercise', 'video', 'article', 'tool']),
  resource_id: z.string().min(1, 'Resource ID is required'),
  note: z.string().max(500, 'Note must be at most 500 characters').optional(),
});

// ============================================
// NOTIFICATION SETTINGS VALIDATORS
// ============================================

export const CreateNotificationSettingsValidator = NotificationSettingsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  user_id: z.string().uuid('Invalid user ID'),
  reminder_time: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Reminder time must be in HH:mm format').optional(),
  quiet_hours_start: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Quiet hours start must be in HH:mm format').optional(),
  quiet_hours_end: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Quiet hours end must be in HH:mm format').optional(),
});

// ============================================
// AGGREGATE VALIDATORS
// ============================================

// Complete user profile creation
export const CompleteUserProfileValidator = z.object({
  profile: CreateProfileValidator,
  user_stats: CreateUserStatsValidator.optional(),
  notification_settings: CreateNotificationSettingsValidator.optional(),
});

// Login credentials
export const LoginCredentialsValidator = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Registration data
export const RegistrationDataValidator = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().max(100, 'Full name must be at most 100 characters').optional(),
  native_language: z.string().max(10, 'Invalid language code').optional(),
  learning_language: z.string().max(10, 'Invalid language code').optional(),
});

// Password update
export const PasswordUpdateValidator = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// ============================================
// VALIDATION SERVICE WRAPPER
// ============================================

export class EntityValidator {
  /**
   * Validate any entity against its schema
   */
  static validateEntity<T>(schema: z.ZodSchema<T>, data: unknown, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    entityName: string) {
    return ZodValidator.validate(schema, data);
  }

  /**
   * Validate form data for entity creation
   */
  static validateCreateEntity<T>(schema: z.ZodSchema<T>, data: unknown, entityName: string) {
    const result = ZodValidator.validate(schema, data);

    if (!result.success) {
      // TODO: Add proper logging service for validation errors
    }

    return result;
  }

  /**
   * Validate form data for entity update
   */
  static validateUpdateEntity<T>(schema: z.ZodSchema<T>, data: unknown, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    entityName: string) {
    const partialSchema = (schema as any).partial(); // eslint-disable-line @typescript-eslint/no-explicit-any
    const result = ZodValidator.validate(partialSchema, data);

    if (!result.success) {
      // TODO: Add proper logging service for validation errors
    }

    return result;
  }

  /**
   * Sanitize and validate entity data
   */
  static sanitizeAndValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    entityName: string,
    sanitizeOptions: {
      clean?: boolean;
      trimStrings?: boolean;
    } = {}
  ) {
    const result = DataSanitizer.sanitizeAndValidate(schema, data, sanitizeOptions);

    if (!result.success) {
      // TODO: Add proper logging service for validation errors
    }

    return result;
  }

  /**
   * Get validation error summary
   */
  static getValidationSummary<T>(result: import('@/lib/validators').ValidationResult<T>): string {
    if (result.success) return '';
    return result.formattedError || 'Validation failed';
  }

  /**
   * Check if validation has critical errors (security-related)
   */
  static hasCriticalErrors(errors: import('@/lib/validators').ValidationError[]): boolean {
    const criticalErrorCodes = ['invalid_type', 'invalid_union', 'invalid_string'];
    return errors.some(error => criticalErrorCodes.includes(error.code));
  }
}

// ============================================
// EXPORTS
// ============================================

// Export all schemas for use in components
export const EntitySchemas = {
  profile: {
    create: CreateProfileValidator,
    update: UpdateProfileValidator,
    search: ProfileSearchValidator,
  },
  lessonProgress: {
    create: CreateLessonProgressValidator,
    update: UpdateLessonProgressValidator,
    stats: LessonProgressStatsValidator,
  },
  userStats: {
    create: CreateUserStatsValidator,
    update: UpdateUserStatsValidator,
    increment: UserStatsUpdateValidator,
  },
  achievement: {
    create: CreateAchievementValidator,
    unlock: UnlockAchievementValidator,
  },
  studySession: {
    create: CreateStudySessionValidator,
  },
  userTime: {
    create: CreateUserTimeValidator,
  },
  favoriteResource: {
    create: CreateFavoriteResourceValidator,
  },
  notificationSettings: {
    create: CreateNotificationSettingsValidator,
  },
  auth: {
    login: LoginCredentialsValidator,
    register: RegistrationDataValidator,
    passwordUpdate: PasswordUpdateValidator,
  },
  complete: {
    userProfile: CompleteUserProfileValidator,
  },
};