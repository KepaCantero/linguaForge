// ============================================================
// CONSTANTS.TS - Todas las reglas del sistema
// ============================================================

// Idiomas soportados
export const SUPPORTED_LANGUAGES = ['fr', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Niveles soportados
export const SUPPORTED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type SupportedLevel = (typeof SUPPORTED_LEVELS)[number];

// Tipos de input
export const INPUT_TYPES = ['audio', 'video', 'text'] as const;
export type InputType = (typeof INPUT_TYPES)[number];

// Estados de nodo
export const NODE_STATUSES = ['locked', 'active', 'completed'] as const;
export type NodeStatus = (typeof NODE_STATUSES)[number];

// Roles gramaticales para Janus Matrix
export const GRAMMATICAL_ROLES = ['subject', 'modal', 'verb', 'complement'] as const;
export type GrammaticalRole = (typeof GRAMMATICAL_ROLES)[number];

// Umbrales Krashen por nivel
export const LEVEL_THRESHOLDS = {
  A1: { read: 30000, heard: 35000, spoken: 5000 },
  A2: { read: 60000, heard: 70000, spoken: 12000 },
  B1: { read: 100000, heard: 120000, spoken: 25000 },
  B2: { read: 180000, heard: 200000, spoken: 50000 },
  C1: { read: 300000, heard: 350000, spoken: 100000 },
  C2: { read: 500000, heard: 600000, spoken: 200000 },
} as const;

// Reglas de XP
export const XP_RULES = {
  clozeCorrect: 10,
  clozeIncorrect: 2,
  shadowingComplete: 15,
  variationRead: 5,
  miniTaskComplete: 50,
  janusCombination: 5,
  janusMatrixComplete: 100,
  intoningCycleComplete: 20,
  inputAudioComplete: 25,
  inputVideoComplete: 30,
  inputTextComplete: 20,
  comprehensionPass: 15,
  perfectMatrix: 50,
  // Ejercicios Core v2.0
  vocabularyCorrect: 10,       // Correcto
  vocabularyIncorrect: 2,       // Incorrecto
  shardDetectionFast: 20,      // <3s correcto
  shardDetectionNormal: 15,    // >=3s correcto
  shardDetectionIncorrect: 5,  // Incorrecto
  pragmaStrikeFast: 25,        // <3s correcto
  pragmaStrikeNormal: 20,      // >=3s correcto
  pragmaStrikeIncorrect: 10,  // Incorrecto + explicación
  resonancePath80: 30,         // Sincronización >80%
  resonancePath90: 50,         // Sincronización >90%
  echoStreamPowerWord: 10,     // Power Word detectada
  echoStreamComplete: 30,     // Stream completo
  glyphWeavingBeat: 15,        // Conexión en beat (doble)
  glyphWeavingOffBeat: 7,      // Conexión fuera de beat
  glyphWeavingComplete: 50,    // Patrón completo
  forgeMandateComplete: 100,    // Completar Forge Mandate
} as const;

// Reglas de monedas
export const COIN_RULES = {
  inputComplete: 10,
  dailyLogin: 5,
  streak7: 50,
  streak30: 200,
  streak100: 500,
} as const;

// Reglas de gemas
export const GEM_RULES = {
  comprehensionPass: 5,
  perfectComprehension: 10,
} as const;

// Niveles de usuario
export const USER_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Débutant' },
  { level: 2, xpRequired: 100, title: 'Curieux' },
  { level: 3, xpRequired: 300, title: 'Apprenti' },
  { level: 4, xpRequired: 600, title: 'Explorateur' },
  { level: 5, xpRequired: 1000, title: 'Voyageur' },
  { level: 6, xpRequired: 1500, title: 'Aventurier' },
  { level: 7, xpRequired: 2200, title: 'Francophile' },
  { level: 8, xpRequired: 3000, title: 'Parisien' },
  { level: 9, xpRequired: 4000, title: 'Expert' },
  { level: 10, xpRequired: 5500, title: 'Maître' },
] as const;

// Configuración de Janulus
export const JANUS_CONFIG = {
  columnsPerMatrix: 4,
  minCellsPerColumn: 4,
  maxCellsPerColumn: 6,
  targetRepetitions: 25,
  intoningCycles: 3,
} as const;

// Configuración de Shadowing
export const SHADOWING_CONFIG = {
  requiredListens: 2,
} as const;

// Configuración de Input
export const INPUT_CONFIG = {
  minListensToUnlockTest: 2,
  minReadsToUnlockTest: 1,
  historyToAvoid: 3, // Evitar repetir últimos 3 inputs
  maxConsecutiveSameType: 2,
} as const;

// Configuración de MiniTask
export const MINITASK_CONFIG = {
  minKeywordsPercent: 50, // Al menos 50% de keywords
} as const;

// Configuración de Streak
export const STREAK_CONFIG = {
  resetHour: 4, // 4:00 AM hora local = nuevo día
  milestones: [7, 14, 30, 60, 100, 365] as const,
} as const;

// ============================================================
// SISTEMA DE HP (v2.0)
// ============================================================

export const HP_CONFIG = {
  maxHP: 100,
  dailyMissionHP: 20, // HP perdido por misión no completada
  recoveryPerMission: 10, // HP recuperado por misión completada
  minHPForPremium: 50, // HP mínimo para contenido premium
} as const;

// Colores de la app
export const APP_COLORS = {
  primary: '#4F46E5', // Indigo
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  locked: '#9CA3AF', // Gray
} as const;

// Colores de las ramas del árbol de tópicos
export const BRANCH_COLORS = {
  1: '#4F46E5',  // Identidad - Indigo
  2: '#7C3AED',  // Tiempo - Violet
  3: '#2563EB',  // Lugar - Blue
  4: '#0891B2',  // Alojamiento - Cyan
  5: '#059669',  // Comida - Emerald
  6: '#D97706',  // Personas - Amber
  7: '#DC2626',  // Trabajo - Red
  8: '#DB2777',  // Salud - Pink
  9: '#7C3AED',  // Comunicación - Violet
  10: '#0D9488', // Pasado/Futuro - Teal
  11: '#6366F1', // Cultura - Indigo
} as const;

// Función helper para obtener nivel por XP
export function getLevelByXP(xp: number): (typeof USER_LEVELS)[number] {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= USER_LEVELS[i].xpRequired) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
}

// Función helper para calcular XP hasta siguiente nivel
export function getXPToNextLevel(xp: number): number {
  const currentLevel = getLevelByXP(xp);
  const nextLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;

  if (nextLevelIndex >= USER_LEVELS.length) {
    return 0; // Ya está en el nivel máximo
  }

  return USER_LEVELS[nextLevelIndex].xpRequired - xp;
}

// Función helper para calcular progreso del nivel actual (0-100)
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelByXP(xp);
  const currentLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level);
  const nextLevelIndex = currentLevelIndex + 1;

  if (nextLevelIndex >= USER_LEVELS.length) {
    return 100; // Ya está en el nivel máximo
  }

  const currentThreshold = USER_LEVELS[currentLevelIndex].xpRequired;
  const nextThreshold = USER_LEVELS[nextLevelIndex].xpRequired;
  const xpInLevel = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return Math.round((xpInLevel / xpNeeded) * 100);
}

// ============================================================
// SISTEMA DE RANGOS SOLO LEVELING (v2.0)
// ============================================================

// Rangos de cazador lingüístico
export const HUNTER_RANKS = [
  { rank: 'E', name: 'Novato', xpRequired: 0, color: '#9CA3AF' },
  { rank: 'D', name: 'Aprendiz', xpRequired: 500, color: '#3B82F6' },
  { rank: 'C', name: 'Competente', xpRequired: 1500, color: '#10B981' },
  { rank: 'B', name: 'Experto', xpRequired: 3000, color: '#F59E0B' },
  { rank: 'A', name: 'Maestro', xpRequired: 5000, color: '#EF4444' },
  { rank: 'S', name: 'Leyenda Lingüística', xpRequired: 8000, color: '#8B5CF6' },
] as const;

export type HunterRank = (typeof HUNTER_RANKS)[number]['rank'];
export type HunterRankInfo = (typeof HUNTER_RANKS)[number];

// Reglas de desbloqueo de contenido por rango
export const RANK_UNLOCK_RULES: Record<HunterRank, { contentLevels: SupportedLevel[] }> = {
  E: { contentLevels: ['A1'] },
  D: { contentLevels: ['A1', 'A2'] },
  C: { contentLevels: ['A1', 'A2', 'B1'] },
  B: { contentLevels: ['A1', 'A2', 'B1', 'B2'] },
  A: { contentLevels: ['A1', 'A2', 'B1', 'B2', 'C1'] },
  S: { contentLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
};

// Función helper para obtener rango por XP
export function getRankByXP(xp: number): HunterRankInfo {
  for (let i = HUNTER_RANKS.length - 1; i >= 0; i--) {
    if (xp >= HUNTER_RANKS[i].xpRequired) {
      return HUNTER_RANKS[i];
    }
  }
  return HUNTER_RANKS[0];
}

// Función helper para calcular progreso hacia siguiente rango (0-100)
export function getRankProgress(xp: number): number {
  const currentRank = getRankByXP(xp);
  const currentRankIndex = HUNTER_RANKS.findIndex(r => r.rank === currentRank.rank);
  const nextRankIndex = currentRankIndex + 1;

  if (nextRankIndex >= HUNTER_RANKS.length) {
    return 100; // Ya está en el rango máximo
  }

  const currentThreshold = HUNTER_RANKS[currentRankIndex].xpRequired;
  const nextThreshold = HUNTER_RANKS[nextRankIndex].xpRequired;
  const xpInRank = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return Math.round((xpInRank / xpNeeded) * 100);
}

// Función helper para verificar si puede acceder a contenido según rango
export function canAccessContent(rank: HunterRank, level: SupportedLevel): boolean {
  const unlockRules = RANK_UNLOCK_RULES[rank];
  return unlockRules.contentLevels.includes(level);
}
