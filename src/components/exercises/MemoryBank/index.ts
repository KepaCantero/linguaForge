/**
 * Memory Bank AAA - Exports
 *
 * Sistema de memoria contextual con física AAA para activación episódica somatosensorial
 */

// Componentes
export { EpisodicCard, type EpisodicCardContent, type EpisodicCardProps } from './EpisodicCard';
export { MemoryBankSession, type MemoryBankCard, type SessionMetrics, type MemoryBankSessionProps } from './MemoryBankSession';

// Re-exportar utilidades relacionadas
export { getTextureForContext, getTextureByType, type TextureType, type LearningContext } from '@/lib/textures';
export { useHaptic, hapticSuccess, hapticError, hapticTap } from '@/lib/haptic';
export { useSoundEngine, getSoundEngine } from '@/lib/soundEngine';
