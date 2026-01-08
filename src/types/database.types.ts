/**
 * Tipos generados automáticamente de la base de datos Supabase
 * Estos tipos deben ser generados desde la base de datos real usando:
 * supabase gen types typescript --local > src/types/database.types.ts
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          native_language: string | null;
          learning_language: string | null;
          timezone: string | null;
          preferences: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          native_language?: string | null;
          learning_language?: string | null;
          timezone?: string | null;
          preferences?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          native_language?: string | null;
          learning_language?: string | null;
          timezone?: string | null;
          preferences?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          level: string;
          completed: boolean;
          progress_percentage: number;
          started_at: string | null;
          completed_at: string | null;
          time_spent: number;
          exercises_completed: number;
          total_exercises: number;
          accuracy: number | null;
          streak: number;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          level: string;
          completed?: boolean;
          progress_percentage?: number;
          started_at?: string | null;
          completed_at?: string | null;
          time_spent?: number;
          exercises_completed?: number;
          total_exercises?: number;
          accuracy?: number | null;
          streak?: number;
          last_accessed: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          level?: string;
          completed?: boolean;
          progress_percentage?: number;
          started_at?: string | null;
          completed_at?: string | null;
          time_spent?: number;
          exercises_completed?: number;
          total_exercises?: number;
          accuracy?: number | null;
          streak?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_xp_earned: number;
          total_coins_earned: number;
          total_gems_earned: number;
          lessons_completed: number;
          exercises_completed: number;
          review_sessions_completed: number;
          current_streak: number;
          longest_streak: number;
          accuracy_rate: number | null;
          level: number;
          rank: string;
          achievements: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_xp_earned?: number;
          total_coins_earned?: number;
          total_gems_earned?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          review_sessions_completed?: number;
          current_streak?: number;
          longest_streak?: number;
          accuracy_rate?: number | null;
          level?: number;
          rank?: string;
          achievements?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_xp_earned?: number;
          total_coins_earned?: number;
          total_gems_earned?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          review_sessions_completed?: number;
          current_streak?: number;
          longest_streak?: number;
          accuracy_rate?: number | null;
          level?: number;
          rank?: string;
          achievements?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string | null;
          condition: Record<string, unknown>;
          xp_reward: number;
          coin_reward: number;
          gem_reward: number;
          category: 'learning' | 'streak' | 'accuracy' | 'exploration' | 'social';
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon?: string | null;
          condition: Record<string, unknown>;
          xp_reward: number;
          coin_reward: number;
          gem_reward: number;
          category: 'learning' | 'streak' | 'accuracy' | 'exploration' | 'social';
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string | null;
          condition?: Record<string, unknown>;
          xp_reward?: number;
          coin_reward?: number;
          gem_reward?: number;
          category?: 'learning' | 'streak' | 'accuracy' | 'exploration' | 'social';
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
          progress?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: 'lesson' | 'review' | 'practice' | 'challenge';
          duration: number;
          xp_earned: number;
          coins_earned: number;
          gems_earned: number;
          exercises_completed: number;
          accuracy: number;
          lessons_completed: number;
          cards_reviewed: number;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: 'lesson' | 'review' | 'practice' | 'challenge';
          duration?: number;
          xp_earned?: number;
          coins_earned?: number;
          gems_earned?: number;
          exercises_completed?: number;
          accuracy?: number;
          lessons_completed?: number;
          cards_reviewed?: number;
          started_at: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: 'lesson' | 'review' | 'practice' | 'challenge';
          duration?: number;
          xp_earned?: number;
          coins_earned?: number;
          gems_earned?: number;
          exercises_completed?: number;
          accuracy?: number;
          lessons_completed?: number;
          cards_reviewed?: number;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      srs_cards: {
        Row: {
          id: string;
          user_id: string;
          phrase: string;
          translation: string;
          pronunciation: string | null;
          audio_url: string | null;
          status: 'new' | 'learning' | 'review' | 'graduated';
          difficulty: number;
          interval: number;
          ease_factor: number;
          repetitions: number;
          due_date: string;
          created_at: string;
          updated_at: string;
          last_reviewed: string | null;
          review_count: number;
          correct_reviews: number;
          source: 'manual' | 'lesson' | 'video' | 'article';
          tags: string[];
          context: string | null;
          mnemonic: string | null;
          notes: string | null;
          metadata: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        Insert: {
          id?: string;
          user_id: string;
          phrase: string;
          translation: string;
          pronunciation?: string | null;
          audio_url?: string | null;
          status?: 'new' | 'learning' | 'review' | 'graduated';
          difficulty?: number;
          interval?: number;
          ease_factor?: number;
          repetitions?: number;
          due_date: string;
          created_at?: string;
          updated_at?: string;
          last_reviewed?: string | null;
          review_count?: number;
          correct_reviews?: number;
          source?: 'manual' | 'lesson' | 'video' | 'article';
          tags?: string[];
          context?: string | null;
          mnemonic?: string | null;
          notes?: string | null;
          metadata?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        Update: {
          id?: string;
          user_id?: string;
          phrase?: string;
          translation?: string;
          pronunciation?: string | null;
          audio_url?: string | null;
          status?: 'new' | 'learning' | 'review' | 'graduated';
          difficulty?: number;
          interval?: number;
          ease_factor?: number;
          repetitions?: number;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
          last_reviewed?: string | null;
          review_count?: number;
          correct_reviews?: number;
          source?: 'manual' | 'lesson' | 'video' | 'article';
          tags?: string[];
          context?: string | null;
          mnemonic?: string | null;
          notes?: string | null;
          metadata?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
        };
      };
      user_time: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          time_spent: number;
          lessons_completed: number;
          exercises_completed: number;
          xp_earned: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          time_spent?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          xp_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          time_spent?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          xp_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorite_resources: {
        Row: {
          id: string;
          user_id: string;
          resource_type: 'lesson' | 'exercise' | 'video' | 'article' | 'tool';
          resource_id: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resource_type: 'lesson' | 'exercise' | 'video' | 'article' | 'tool';
          resource_id: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resource_type?: 'lesson' | 'exercise' | 'video' | 'article' | 'tool';
          resource_id?: string;
          note?: string | null;
          created_at?: string;
        };
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          daily_reminders: boolean;
          weekly_summary: boolean;
          achievement_notifications: boolean;
          friend_activity: boolean;
          practice_reminders: boolean;
          reminder_time: string | null;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          email_notifications: boolean;
          push_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_reminders?: boolean;
          weekly_summary?: boolean;
          achievement_notifications?: boolean;
          friend_activity?: boolean;
          practice_reminders?: boolean;
          reminder_time?: string | null;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          email_notifications?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_reminders?: boolean;
          weekly_summary?: boolean;
          achievement_notifications?: boolean;
          friend_activity?: boolean;
          practice_reminders?: boolean;
          reminder_time?: string | null;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          email_notifications?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};