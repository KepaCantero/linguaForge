/**
 * Theme Schemas - Zod Validation Schemas for Theme System
 *
 * This file re-exports all theme-related schemas from the types file
 * for consistency with the project's schema-first pattern.
 *
 * Location: src/schemas/theme.ts
 */

export {
  // Core Schemas
  ThemeSchema,
  ThemeMetadataSchema,
  CreateThemeInputSchema,
  UpdateThemeInputSchema,
  ThemeFiltersSchema,
  ThemeRecommendationSchema,

  // Enums
  ThemeCategoryValues,
  CEFRLevelSchema,

  // Types
  type Theme,
  type ThemeMetadata,
  type ThemeCategory,
  type CEFRLevel,
  type CreateThemeInput,
  type UpdateThemeInput,
  type ThemeFilters,
  type ThemeRecommendation,
} from '@/types/theme';
