/**
 * Schemas para modelos de Supabase
 * Estos schemas definen la estructura de las tablas en la base de datos
 */

import { z } from 'zod';

// ============================================================
// PERFIL DE USUARIO
// ============================================================

export const ProfileSchema = z.object({
  id: z.string(),
  user_id: z.string().uuid(),
  username: z.string().min(2).max(50),
  email: z.string().email(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  native_language: z.string().max(10).nullable(),
  learning_language: z.string().max(10).nullable(),
  timezone: z.string().nullable(),
  preferences: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ============================================================
// PROGRESO DE LECCIÓN
// ============================================================

export const LessonProgressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  lesson_id: z.string(),
  level: z.string(),
  completed: z.boolean().default(false),
  progress_percentage: z.number().min(0).max(100).default(0),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  time_spent: z.number().min(0).default(0), // en segundos
  exercises_completed: z.number().min(0).default(0),
  total_exercises: z.number().min(0).default(0),
  accuracy: z.number().min(0).max(100).nullable(),
  streak: z.number().min(0).default(0),
  last_accessed: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;

// ============================================================
// ESTADÍSTICAS DE USUARIO
// ============================================================

export const UserStatsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  total_xp_earned: z.number().min(0).default(0),
  total_coins_earned: z.number().min(0).default(0),
  total_gems_earned: z.number().min(0).default(0),
  lessons_completed: z.number().min(0).default(0),
  exercises_completed: z.number().min(0).default(0),
  review_sessions_completed: z.number().min(0).default(0),
  current_streak: z.number().min(0).default(0),
  longest_streak: z.number().min(0).default(0),
  accuracy_rate: z.number().min(0).max(100).nullable(),
  time_spent_total: z.number().min(0).default(0), // en segundos
  level: z.number().min(1).default(1),
  rank: z.string().default('Beginner'),
  achievements: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

// ============================================================
// LOGROS
// ============================================================

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string(),
  icon: z.string().nullable(),
  condition: z.record(z.string(), z.unknown()), // Define la condición para desbloquear
  xp_reward: z.number().min(0),
  coin_reward: z.number().min(0),
  gem_reward: z.number().min(0),
  category: z.enum(['learning', 'streak', 'accuracy', 'exploration', 'social']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Achievement = z.infer<typeof AchievementSchema>;

// ============================================================
// PROGRESO DE LOGROS
// ============================================================

export const UserAchievementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  unlocked_at: z.string().datetime(),
  progress: z.record(z.string(), z.unknown()).default({}), // Progreso parcial
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;

// ============================================================
// SESIONES DE ESTUDIO
// ============================================================

export const StudySessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_type: z.enum(['lesson', 'review', 'practice', 'challenge']),
  duration: z.number().min(0), // en segundos
  xp_earned: z.number().min(0),
  coins_earned: z.number().min(0),
  gems_earned: z.number().min(0),
  exercises_completed: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  lessons_completed: z.number().min(0),
  cards_reviewed: z.number().min(0),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export type StudySession = z.infer<typeof StudySessionSchema>;

// ============================================================
// TIEMPO DE USO
// ============================================================

export const UserTimeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string().date(), // YYYY-MM-DD
  time_spent: z.number().min(0), // en segundos
  lessons_completed: z.number().min(0),
  exercises_completed: z.number().min(0),
  xp_earned: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UserTime = z.infer<typeof UserTimeSchema>;

// ============================================================
// RECURSOS FAVORITOS
// ============================================================

export const FavoriteResourceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  resource_type: z.enum(['lesson', 'exercise', 'video', 'article', 'tool']),
  resource_id: z.string(),
  note: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type FavoriteResource = z.infer<typeof FavoriteResourceSchema>;

// ============================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================================

export const NotificationSettingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  daily_reminders: z.boolean().default(true),
  weekly_summary: z.boolean().default(true),
  achievement_notifications: z.boolean().default(true),
  friend_activity: z.boolean().default(false),
  practice_reminders: z.boolean().default(true),
  reminder_time: z.string().nullable(), // HH:mm format
  quiet_hours_start: z.string().nullable(),
  quiet_hours_end: z.string().nullable(),
  email_notifications: z.boolean().default(false),
  push_notifications: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

// ============================================================
// EXPORTACIÓN DE SCHEMAS
// ============================================================
// Los schemas ya están exportados individualmente arriba
// No es necesario exportarlos nuevamente aquí