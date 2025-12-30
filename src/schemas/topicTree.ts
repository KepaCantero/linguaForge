import { z } from 'zod';
import { LanguageCodeSchema, LevelCodeSchema } from './content';

// ============================================================
// TOPIC TREE (Árbol de Tópicos)
// ============================================================

export const TopicLeafSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleFr: z.string(),
  grammar: z.array(z.string()),
  icon: z.string().optional(),
  estimatedMinutes: z.number().default(15),
});

export const TopicBranchSchema = z.object({
  id: z.string(),
  order: z.number().min(1).max(11),
  title: z.string(),
  titleFr: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  leaves: z.array(TopicLeafSchema).length(3),
});

export const TopicTreeSchema = z.object({
  id: z.string(),
  languageCode: LanguageCodeSchema,
  levelCode: LevelCodeSchema,
  trunk: z.object({
    title: z.string(),
    titleFr: z.string(),
  }),
  branches: z.array(TopicBranchSchema).length(11),
});

// ============================================================
// TREE PROGRESS
// ============================================================

export const TreeProgressSchema = z.object({
  treeId: z.string(),
  completedLeaves: z.array(z.string()),
  activeBranch: z.string().nullable(),
  activeLeaf: z.string().nullable(),
});

// ============================================================
// TYPE INFERENCE
// ============================================================

export type TopicLeaf = z.infer<typeof TopicLeafSchema>;
export type TopicBranch = z.infer<typeof TopicBranchSchema>;
export type TopicTree = z.infer<typeof TopicTreeSchema>;
export type TreeProgress = z.infer<typeof TreeProgressSchema>;
