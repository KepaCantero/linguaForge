/**
 * Analytics Type Definitions
 *
 * Privacy-compliant analytics with local-first approach
 */

// ============================================
// EVENT TYPES
// ============================================

export enum AnalyticsEvent {
  // Session
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',

  // Learning
  LESSON_START = 'lesson_start',
  LESSON_COMPLETE = 'lesson_complete',
  EXERCISE_START = 'exercise_start',
  EXERCISE_COMPLETE = 'exercise_complete',
  EXERCISE_SKIP = 'exercise_skip',
  EXERCISE_HINT = 'exercise_hint',

  // SRS/Review
  REVIEW_START = 'review_start',
  REVIEW_CARD = 'review_card',
  REVIEW_COMPLETE = 'review_complete',

  // Progression
  LEVEL_UP = 'level_up',
  STREAK_MILESTONE = 'streak_milestone',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',

  // Engagement
  NODE_UNLOCK = 'node_unlock',
  THEME_CHANGE = 'theme_change',
  SOUND_TOGGLE = 'sound_toggle',

  // Import
  IMPORT_START = 'import_start',
  IMPORT_COMPLETE = 'import_complete',
  IMPORT_ERROR = 'import_error',

  // Navigation
  PAGE_VIEW = 'page_view',
  FAQ_SEARCH = 'faq_search',
  FAQ_CATEGORY_OPEN = 'faq_category_open',

  // Errors
  ERROR = 'error',
}

// ============================================
// EVENT PROPERTIES
// ============================================

export interface BaseEventProperties {
  timestamp: number;
  sessionId: string;
  userId?: string;
  // Additional optional properties for specific event types
  pathname?: string;
  rating?: number;
  theme?: string;
  enabled?: boolean;
  nodeId?: string;
}

export interface SessionStartProperties extends BaseEventProperties {
  screen_width: number;
  screen_height: number;
  user_agent: string;
  referrer?: string;
}

export interface LessonProperties extends BaseEventProperties {
  nodeId: string;
  lessonId: string;
  lessonType: string;
  duration?: number; // seconds
}

export interface ExerciseProperties extends BaseEventProperties {
  exerciseType: string;
  isCorrect?: boolean;
  attempts: number;
  timeToComplete?: number; // milliseconds
  usedHint?: boolean;
}

export interface ReviewProperties extends BaseEventProperties {
  cardCount: number;
  correctCount: number;
  difficultCount: number;
  duration: number;
}

export interface ProgressProperties extends BaseEventProperties {
  level?: number;
  streak?: number;
  achievementId?: string;
  xpGained?: number;
}

export interface FAQProperties extends BaseEventProperties {
  searchQuery?: string;
  categoryId?: string;
}

export interface ErrorProperties extends BaseEventProperties {
  errorType: string;
  errorMessage: string;
  context?: string;
}

export type EventProperties =
  | SessionStartProperties
  | LessonProperties
  | ExerciseProperties
  | ReviewProperties
  | ProgressProperties
  | FAQProperties
  | ErrorProperties
  | BaseEventProperties;

// ============================================
// ANALYTICS CONFIG
// ============================================

export interface AnalyticsConfig {
  enabled: boolean;
  samplingRate: number; // 0-1, e.g., 0.1 = 10% of events
  batchSize: number;
  flushInterval: number; // milliseconds
  maxQueueSize: number;
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  samplingRate: 1.0,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  maxQueueSize: 50,
} as const;

// ============================================
// STORAGE TYPES
// ============================================

export interface StoredEvent {
  id: string;
  event: AnalyticsEvent;
  properties: EventProperties;
  timestamp: number;
}

export interface AnalyticsData {
  sessionId: string;
  events: StoredEvent[];
  config: AnalyticsConfig;
  firstSession: number;
  lastSession: number;
  totalSessions: number;
}
