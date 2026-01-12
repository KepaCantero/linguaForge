/**
 * Exercise Categorizer Service
 *
 * Extracts exercise categorization logic from page components
 * to reduce cyclomatic complexity and improve testability.
 *
 * All functions are pure (no side effects) and have complexity < 10.
 */

import type { LessonContent, Phrase, Vocabulary, PragmaStrike, GlyphWeaving, ConversationalEcho, DialogueIntonation, JanusComposer } from '@/types';

// ============================================================
// TYPES
// ============================================================

/**
 * Exercise item with metadata
 */
export interface ExerciseItem {
  id: string;
  type: string;
  data: unknown;
}

/**
 * Exercise category with metadata and items
 */
export interface ExerciseCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: ExerciseItem[];
}

// ============================================================
// CATEGORY DEFINITIONS
// ============================================================

/**
 * Category metadata registry
 * Centralized configuration for all exercise categories
 */
const CATEGORY_CONFIGS = {
  vocabulary: {
    id: 'vocabulary',
    title: 'Vocabulario',
    icon: '📚',
    description: 'Aprende palabras nuevas con imágenes',
  },
  cloze: {
    id: 'cloze',
    title: 'Cloze',
    icon: '✏️',
    description: 'Completa las frases con la palabra correcta',
  },
  pragmaStrike: {
    id: 'pragmaStrike',
    title: 'Pragma Strike',
    icon: '⚡',
    description: 'Elige la respuesta correcta bajo presión',
  },
  glyphWeaving: {
    id: 'glyphWeaving',
    title: 'Glyph Weaving',
    icon: '🔀',
    description: 'Conecta los glifos en el orden correcto',
  },
  conversationalEcho: {
    id: 'conversationalEcho',
    title: 'Echo Conversacional',
    icon: '💬',
    description: 'Responde en contexto conversacional',
  },
  dialogueIntonation: {
    id: 'dialogueIntonation',
    title: 'Entonación de Diálogo',
    icon: '🎤',
    description: 'Practica el ritmo y entonación',
  },
  janusComposer: {
    id: 'janusComposer',
    title: 'Matriz Janus',
    icon: '🧩',
    description: 'Construye frases combinando columnas',
  },
  variations: {
    id: 'variations',
    title: 'Variaciones',
    icon: '🔄',
    description: 'Aprende diferentes formas de decir lo mismo',
  },
} as const;

// ============================================================
// EXTRACTORS - Get exercises from lesson content
// ============================================================

/**
 * Extract vocabulary exercises from lesson content
 * Complexity: 2
 */
function extractVocabularyExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const vocabulary = lessonContent.coreExercises?.vocabulary;
  if (!vocabulary || vocabulary.length === 0) {
    return [];
  }

  return vocabulary.map((ex: Vocabulary, i: number) => ({
    id: `vocab-${i}`,
    type: 'vocabulary',
    data: ex,
  }));
}

/**
 * Extract cloze exercises from conversational blocks
 * Complexity: 4
 */
function extractClozeExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const clozeItems: ExerciseItem[] = [];
  const blocks = lessonContent.conversationalBlocks;

  if (!blocks || blocks.length === 0) {
    return clozeItems;
  }

  blocks.forEach((block) => {
    block.phrases.forEach((phrase: Phrase, i: number) => {
      if (phrase.clozeWord && phrase.clozeOptions) {
        clozeItems.push({
          id: `cloze-${block.id}-${i}`,
          type: 'cloze',
          data: phrase,
        });
      }
    });
  });

  return clozeItems;
}

/**
 * Extract PragmaStrike exercises from lesson content
 * Complexity: 2
 */
function extractPragmaStrikeExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const pragmaStrike = lessonContent.coreExercises?.pragmaStrike;
  if (!pragmaStrike || pragmaStrike.length === 0) {
    return [];
  }

  return pragmaStrike.map((ex: PragmaStrike, i: number) => ({
    id: `pragma-${i}`,
    type: 'pragmaStrike',
    data: ex,
  }));
}

/**
 * Extract GlyphWeaving exercises from lesson content
 * Complexity: 2
 */
function extractGlyphWeavingExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const glyphWeaving = lessonContent.coreExercises?.glyphWeaving;
  if (!glyphWeaving || glyphWeaving.length === 0) {
    return [];
  }

  return glyphWeaving.map((ex: GlyphWeaving, i: number) => ({
    id: `glyph-${i}`,
    type: 'glyphWeaving',
    data: ex,
  }));
}

/**
 * Extract ConversationalEcho exercises from lesson content
 * Complexity: 2
 */
function extractConversationalEchoExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const conversationalEcho = lessonContent.coreExercises?.conversationalEcho;
  if (!conversationalEcho || conversationalEcho.length === 0) {
    return [];
  }

  return conversationalEcho.map((ex: ConversationalEcho, i: number) => ({
    id: `convEcho-${i}`,
    type: 'conversationalEcho',
    data: ex,
  }));
}

/**
 * Extract DialogueIntonation exercises from lesson content
 * Complexity: 2
 */
function extractDialogueIntonationExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const dialogueIntonation = lessonContent.coreExercises?.dialogueIntonation;
  if (!dialogueIntonation || dialogueIntonation.length === 0) {
    return [];
  }

  return dialogueIntonation.map((ex: DialogueIntonation, i: number) => ({
    id: `dialogue-${i}`,
    type: 'dialogueIntonation',
    data: ex,
  }));
}

/**
 * Extract JanusComposer exercises from lesson content
 * Complexity: 2
 */
function extractJanusComposerExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const janusComposer = lessonContent.coreExercises?.janusComposer;
  if (!janusComposer || janusComposer.length === 0) {
    return [];
  }

  return janusComposer.map((ex: JanusComposer, i: number) => ({
    id: `janus-${i}`,
    type: 'janusComposer',
    data: ex,
  }));
}

/**
 * Extract variation exercises from conversational blocks
 * Complexity: 4
 */
function extractVariationExercises(
  lessonContent: LessonContent
): ExerciseItem[] {
  const variationItems: ExerciseItem[] = [];
  const blocks = lessonContent.conversationalBlocks;

  if (!blocks || blocks.length === 0) {
    return variationItems;
  }

  blocks.forEach((block) => {
    block.phrases.forEach((phrase: Phrase, i: number) => {
      if (phrase.variations && phrase.variations.length > 0) {
        variationItems.push({
          id: `var-${block.id}-${i}`,
          type: 'variations',
          data: phrase,
        });
      }
    });
  });

  return variationItems;
}

// ============================================================
// BUILDERS - Create category objects
// ============================================================

/**
 * Build a category object from items and config
 * Complexity: 2
 */
function buildCategory(
  categoryId: keyof typeof CATEGORY_CONFIGS,
  items: ExerciseItem[]
): ExerciseCategory | null {
  if (items.length === 0) {
    return null;
  }

  const config = CATEGORY_CONFIGS[categoryId];
  return {
    id: config.id,
    title: config.title,
    icon: config.icon,
    description: config.description,
    items,
  };
}

// ============================================================
// MAIN EXPORT FUNCTIONS
// ============================================================

/**
 * Categorize all exercises from lesson content
 * Main entry point for exercise categorization
 * Complexity: 8 (below threshold of 10)
 */
export function categorizeExercises(
  lessonContent: LessonContent
): ExerciseCategory[] {
  const categories: ExerciseCategory[] = [];

  // Extract all exercise types
  const vocabularyItems = extractVocabularyExercises(lessonContent);
  const clozeItems = extractClozeExercises(lessonContent);
  const pragmaStrikeItems = extractPragmaStrikeExercises(lessonContent);
  const glyphWeavingItems = extractGlyphWeavingExercises(lessonContent);
  const conversationalEchoItems = extractConversationalEchoExercises(lessonContent);
  const dialogueIntonationItems = extractDialogueIntonationExercises(lessonContent);
  const janusComposerItems = extractJanusComposerExercises(lessonContent);
  const variationItems = extractVariationExercises(lessonContent);

  // Build categories from extracted items
  const vocabularyCategory = buildCategory('vocabulary', vocabularyItems);
  const clozeCategory = buildCategory('cloze', clozeItems);
  const pragmaStrikeCategory = buildCategory('pragmaStrike', pragmaStrikeItems);
  const glyphWeavingCategory = buildCategory('glyphWeaving', glyphWeavingItems);
  const conversationalEchoCategory = buildCategory('conversationalEcho', conversationalEchoItems);
  const dialogueIntonationCategory = buildCategory('dialogueIntonation', dialogueIntonationItems);
  const janusComposerCategory = buildCategory('janusComposer', janusComposerItems);
  const variationsCategory = buildCategory('variations', variationItems);

  // Add non-null categories to result
  if (vocabularyCategory) categories.push(vocabularyCategory);
  if (clozeCategory) categories.push(clozeCategory);
  if (pragmaStrikeCategory) categories.push(pragmaStrikeCategory);
  if (glyphWeavingCategory) categories.push(glyphWeavingCategory);
  if (conversationalEchoCategory) categories.push(conversationalEchoCategory);
  if (dialogueIntonationCategory) categories.push(dialogueIntonationCategory);
  if (janusComposerCategory) categories.push(janusComposerCategory);
  if (variationsCategory) categories.push(variationsCategory);

  return categories;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use categorizeExercises instead
 */
export function buildExerciseCategories(
  lessonContent: LessonContent
): ExerciseCategory[] {
  return categorizeExercises(lessonContent);
}

// ============================================================
// TYPE GUARDS
// ============================================================

/**
 * Type guard for vocabulary exercise item
 */
export function isVocabularyItem(item: ExerciseItem): item is ExerciseItem & { data: Vocabulary } {
  return item.type === 'vocabulary';
}

/**
 * Type guard for cloze exercise item
 */
export function isClozeItem(item: ExerciseItem): item is ExerciseItem & { data: Phrase } {
  return item.type === 'cloze';
}

/**
 * Type guard for pragma strike exercise item
 */
export function isPragmaStrikeItem(item: ExerciseItem): item is ExerciseItem & { data: PragmaStrike } {
  return item.type === 'pragmaStrike';
}

/**
 * Type guard for glyph weaving exercise item
 */
export function isGlyphWeavingItem(item: ExerciseItem): item is ExerciseItem & { data: GlyphWeaving } {
  return item.type === 'glyphWeaving';
}

/**
 * Type guard for conversational echo exercise item
 */
export function isConversationalEchoItem(item: ExerciseItem): item is ExerciseItem & { data: ConversationalEcho } {
  return item.type === 'conversationalEcho';
}

/**
 * Type guard for dialogue intonation exercise item
 */
export function isDialogueIntonationItem(item: ExerciseItem): item is ExerciseItem & { data: DialogueIntonation } {
  return item.type === 'dialogueIntonation';
}

/**
 * Type guard for janus composer exercise item
 */
export function isJanusComposerItem(item: ExerciseItem): item is ExerciseItem & { data: JanusComposer } {
  return item.type === 'janusComposer';
}

/**
 * Type guard for variations exercise item
 */
export function isVariationsItem(item: ExerciseItem): item is ExerciseItem & { data: Phrase } {
  return item.type === 'variations';
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Get total exercise count across all categories
 * Complexity: 2
 */
export function getTotalExerciseCount(
  categories: ExerciseCategory[]
): number {
  return categories.reduce((sum, category) => sum + category.items.length, 0);
}

/**
 * Check if categories contain specific exercise type
 * Complexity: 2
 */
export function hasExerciseType(
  categories: ExerciseCategory[],
  typeId: string
): boolean {
  return categories.some((category) => category.id === typeId);
}

/**
 * Filter categories by exercise types
 * Complexity: 3
 */
export function filterCategoriesByTypes(
  categories: ExerciseCategory[],
  typeIds: string[]
): ExerciseCategory[] {
  return categories.filter((category) => typeIds.includes(category.id));
}

/**
 * Get category by ID
 * Complexity: 2
 */
export function getCategoryById(
  categories: ExerciseCategory[],
  categoryId: string
): ExerciseCategory | undefined {
  return categories.find((category) => category.id === categoryId);
}
