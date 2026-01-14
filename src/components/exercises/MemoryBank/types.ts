/**
 * Tipos compartidos para Memory Bank
 * Evita dependencias circulares entre componentes y hooks
 */

import type { EpisodicCardContent } from './EpisodicCard';

export interface MemoryBankCard extends EpisodicCardContent {
  isKnown?: boolean;
  reviewCount: number;
  lastReviewedAt?: string;
}

export interface SessionMetrics {
  totalCards: number;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  sessionDuration: number;
  accuracy: number;
}
