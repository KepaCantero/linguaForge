/**
 * Servicios de la aplicación
 * Exporta todos los servicios y repositorios de la aplicación
 */

// Core Services
// Progress functions are now available through lessonProgressRepository

// Word Extractor
export {
  normalizeWord,
  detectWordType,
  extractKeywords,
  extractKeywordsFromPhrases,
} from './wordExtractor';

// SM2 Algorithm
export {
  calculateNextReview,
  applyReview,
  isDueForReview,
  getCardsForReview,
  getNewCards,
  createCard,
} from '../lib/sm2';

// Translation Service
export {
  translateWords,
  preloadCommonTranslations,
  getCacheStats,
  clearTranslationCache,
} from './translationService';

// YouTube Transcript Service
export {
  getYouTubeTranscript,
  extractVideoId,
  convertTranscriptToPhrases,
  getVideoInfo,
} from './youtubeTranscriptService';

// Lesson Loader
export {
  loadLesson,
  getAvailableLessons,
} from './lessonLoader';


// Rate Limiter
export {
  RateLimitPresets,
  withRateLimit,
  createRateLimiter,
} from './rateLimiter';

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitBreakerPresets,
  withCircuitBreaker,
  getAllCircuitBreakerStates,
  getCircuitBreakerMetrics,
  CircuitState,
  circuitBreakerRegistry,
} from './circuitBreaker';

// ============================================================
// REPOSITORIES (Repository Pattern for Supabase)
// ============================================================

// Base Repository
export { BaseRepository } from './repository/baseRepository';

// SRS Card Repository
export {
  SRSCardRepository,
  srsCardRepository,
} from './repository/srsCardRepository';

// Profile Repository
export {
  ProfileRepository,
  profileRepository,
} from './repository/profileRepository';

// Lesson Progress Repository
export {
  LessonProgressRepository,
  lessonProgressRepository,
} from './repository/lessonProgressRepository';

// User Stats Repository
export {
  UserStatsRepository,
  userStatsRepository,
} from './repository/userStatsRepository';

// Achievement Repository
export {
  AchievementRepository,
  UserAchievementRepository,
  achievementRepository,
  userAchievementRepository,
} from './repository/achievementRepository';

// Study Session Repository
export {
  StudySessionRepository,
  studySessionRepository,
} from './repository/studySessionRepository';

// Add other repositories as they are created
// FavoriteResourceRepository,
// NotificationSettingsRepository,
// UserTimeRepository,