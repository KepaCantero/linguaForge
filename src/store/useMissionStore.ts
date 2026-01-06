import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STREAK_CONFIG, HP_CONFIG } from '@/lib/constants';
import { useGamificationStore } from './useGamificationStore';
import type { MissionType as WarmupMissionType } from '@/schemas/warmup';

// ============================================================
// CONSTANTES CLT (Cognitive Load Theory)
// ============================================================

/**
 * Umbrales de carga cognitiva para misiones
 * Basado en CLT: intrinsic (contenidos) + extraneous (distracciones) - germane (aprendizaje)
 */
export const COGNITIVE_LOAD_THRESHOLDS = {
  LOW: 30,      // Input pasivo, escucha/lectura
  MEDIUM: 50,   // Ejercicios guiados
  HIGH: 65,     // Construcción activa
  VERY_HIGH: 75, // Integración compleja
} as const;

/**
 * Tipos de calentamiento por tipo de misión
 * Mapeo basado en sistemas cerebrales activados
 */
export const WARMUP_BY_MISSION_TYPE: Record<Mission['type'], WarmupMissionType> = {
  input: 'vocabulary',    // Input activa vocabulario (sistema temporal)
  exercises: 'grammar',    // Ejercicios activan gramática (sistema motor)
  janus: 'grammar',        // Janus activa estructuras (Broca)
  streak: 'mixed',         // Streak es variado
  forgeMandate: 'mixed',   // Forge Mandate integra todo
} as const;

// ============================================================
// TIPOS
// ============================================================

export type MissionType =
  | { type: 'input'; targetMinutes: number; currentMinutes: number }
  | { type: 'janus'; targetCombinations: number; currentCombinations: number }
  | { type: 'exercises'; targetCount: number; currentCount: number }
  | { type: 'streak'; targetDays: number; currentDays: number }
  | { type: 'forgeMandate'; completed: boolean };

export interface Mission {
  id: string;
  type: MissionType['type'];
  title: string;
  description: string;
  target: number;
  current: number;
  reward: {
    xp: number;
    coins: number;
    gems?: number;
  };
  completed: boolean;
  completedAt?: string;
  // Campos para calentamientos
  warmupId?: string;
  warmupMissionType?: WarmupMissionType; // 'grammar' | 'vocabulary' | 'pronunciation' | 'mixed'
  difficulty?: 'low' | 'medium' | 'high';
  // Campos CLT (Cognitive Load Theory)
  cognitiveLoadTarget?: number;    // 0-100: Carga cognitiva esperada
  estimatedMinutes?: number;       // Tiempo estimado
  requiresFocus?: boolean;         // Si requiere modo focus
}

export interface MissionCompletion {
  missionId: string;
  completedAt: string;
  rewardEarned: {
    xp: number;
    coins: number;
    gems?: number;
  };
}

interface MissionStore {
  dailyMissions: Mission[];
  completedMissions: string[]; // IDs de misiones completadas hoy
  missionHistory: MissionCompletion[];
  lastGeneratedDate: string | null;

  generateDailyMissions: () => void;
  completeMission: (missionId: string) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  getMissionProgress: (missionId: string) => number;
  areAllMissionsComplete: () => boolean;
  checkDailyHP: () => void; // Verificar y reducir HP si es necesario
  
  // Nuevos métodos para calentamientos
  getWarmupForMission: (missionId: string) => { warmupId?: string; warmupMissionType?: WarmupMissionType } | null;
  setWarmupForMission: (missionId: string, warmupId: string, warmupMissionType: WarmupMissionType) => void;
}

function getDateString(date: Date): string {
  const adjusted = new Date(date);
  adjusted.setHours(adjusted.getHours() - STREAK_CONFIG.resetHour);
  return adjusted.toISOString().split('T')[0];
}

const generateMissionId = (type: string, index: number): string => {
  return `mission-${type}-${Date.now()}-${index}`;
};

// ============================================================
// HELPERS DE GENERACIÓN DE MISIONES
// ============================================================

/**
 * Obtiene la dificultad basada en el nivel del usuario
 */
function getMissionDifficulty(userLevel: number): 'low' | 'medium' | 'high' {
  if (userLevel <= 3) return 'low';
  if (userLevel <= 6) return 'medium';
  return 'high';
}

/**
 * Genera misión de input (siempre presente)
 * CLT: Carga baja (input pasivo), requiere focus para retención
 */
function generateInputMission(index: number, userLevel: number, difficulty: 'low' | 'medium' | 'high'): Mission {
  const targetMinutes = 5 + userLevel * 2;
  return {
    id: generateMissionId('input', index),
    type: 'input',
    title: 'Consumir Input Comprensible',
    description: `Escucha o lee ${targetMinutes} minutos de contenido`,
    target: targetMinutes,
    current: 0,
    reward: { xp: 25, coins: 10 },
    completed: false,
    warmupMissionType: WARMUP_BY_MISSION_TYPE.input,
    difficulty,
    cognitiveLoadTarget: COGNITIVE_LOAD_THRESHOLDS.LOW,
    estimatedMinutes: targetMinutes,
    requiresFocus: true,
  };
}

/**
 * Genera misión de ejercicios
 * CLT: Carga media (ejercicios activos), requiere focus
 */
function generateExercisesMission(index: number, userLevel: number, difficulty: 'low' | 'medium' | 'high'): Mission {
  const targetCount = 3 + Math.floor(userLevel / 2);
  return {
    id: generateMissionId('exercises', index),
    type: 'exercises',
    title: 'Completar Ejercicios',
    description: `Completa ${targetCount} ejercicios`,
    target: targetCount,
    current: 0,
    reward: { xp: 30, coins: 15 },
    completed: false,
    warmupMissionType: WARMUP_BY_MISSION_TYPE.exercises,
    difficulty,
    cognitiveLoadTarget: COGNITIVE_LOAD_THRESHOLDS.MEDIUM,
    estimatedMinutes: targetCount * 2,
    requiresFocus: true,
  };
}

/**
 * Genera misión de Janus (solo si usuario tiene nivel suficiente)
 * CLT: Carga alta (construcción de frases), requiere focus profundo
 */
function generateJanusMission(index: number, userLevel: number): Mission | null {
  if (userLevel < 2) return null;

  const targetCombinations = 5 + userLevel;
  return {
    id: generateMissionId('janus', index),
    type: 'janus',
    title: 'Combinaciones Janus',
    description: `Crea ${targetCombinations} combinaciones en la matriz Janus`,
    target: targetCombinations,
    current: 0,
    reward: { xp: 20, coins: 10 },
    completed: false,
    warmupMissionType: WARMUP_BY_MISSION_TYPE.janus,
    difficulty: userLevel <= 4 ? 'medium' : 'high',
    cognitiveLoadTarget: COGNITIVE_LOAD_THRESHOLDS.HIGH,
    estimatedMinutes: Math.ceil(targetCombinations * 0.5),
    requiresFocus: true,
  };
}

/**
 * Genera misión de Forge Mandate (siempre presente)
 * CLT: Carga muy alta (integración de todo), requiere focus profundo
 */
function generateForgeMandateMission(index: number): Mission {
  return {
    id: generateMissionId('forgeMandate', index),
    type: 'forgeMandate',
    title: 'Forge Mandate',
    description: 'Completa la misión diaria Forge Mandate',
    target: 1,
    current: 0,
    reward: { xp: 100, coins: 50, gems: 20 },
    completed: false,
    warmupMissionType: WARMUP_BY_MISSION_TYPE.forgeMandate,
    difficulty: 'medium',
    cognitiveLoadTarget: COGNITIVE_LOAD_THRESHOLDS.VERY_HIGH,
    estimatedMinutes: 15,
    requiresFocus: true,
  };
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      dailyMissions: [],
      completedMissions: [],
      missionHistory: [],
      lastGeneratedDate: null,

      generateDailyMissions: () => {
        const state = get();
        const todayStr = getDateString(new Date());

        // Si ya se generaron misiones hoy, no hacer nada
        if (state.lastGeneratedDate === todayStr && state.dailyMissions.length > 0) {
          return;
        }

        // Obtener datos del usuario para generar misiones adaptativas
        const gamificationState = useGamificationStore.getState();
        const userLevel = gamificationState.level;
        const difficulty = getMissionDifficulty(userLevel);

        // Generar misiones usando funciones auxiliares
        const missions: Mission[] = [];

        // Misión 1: Input (siempre presente)
        missions.push(generateInputMission(0, userLevel, difficulty));

        // Misión 2: Ejercicios
        missions.push(generateExercisesMission(1, userLevel, difficulty));

        // Misión 3: Janus (solo si usuario tiene nivel suficiente)
        const janusMission = generateJanusMission(2, userLevel);
        if (janusMission) {
          missions.push(janusMission);
        }

        // Misión 4: Forge Mandate (siempre presente)
        missions.push(generateForgeMandateMission(missions.length));

        set({
          dailyMissions: missions,
          completedMissions: [],
          lastGeneratedDate: todayStr,
        });
      },

      completeMission: (missionId: string) => {
        const state = get();
        const mission = state.dailyMissions.find((m) => m.id === missionId);

        if (!mission || mission.completed) return;

        const updatedMissions = state.dailyMissions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                completed: true,
                completedAt: new Date().toISOString(),
              }
            : m
        );

        const completedMissionIds = [...state.completedMissions, missionId];

        // Agregar a historial
        const completion: MissionCompletion = {
          missionId,
          completedAt: new Date().toISOString(),
          rewardEarned: mission.reward,
        };

        // Aplicar recompensas
        const gamificationStore = useGamificationStore.getState();
        gamificationStore.addXP(mission.reward.xp);
        gamificationStore.addCoins(mission.reward.coins);
        if (mission.reward.gems) {
          gamificationStore.addGems(mission.reward.gems);
        }

        // Recuperar HP
        gamificationStore.recoverHP(HP_CONFIG.recoveryPerMission);

        set({
          dailyMissions: updatedMissions,
          completedMissions: completedMissionIds,
          missionHistory: [...state.missionHistory, completion],
        });
      },

      updateMissionProgress: (missionId: string, progress: number) => {
        const state = get();
        const updatedMissions = state.dailyMissions.map((m) => {
          if (m.id === missionId) {
            const newCurrent = Math.min(m.target, progress);
            const isCompleted = newCurrent >= m.target && !m.completed;
            
            if (isCompleted) {
              // Completar automáticamente si alcanza el target
              get().completeMission(missionId);
            }
            
            return { ...m, current: newCurrent };
          }
          return m;
        });

        set({ dailyMissions: updatedMissions });
      },

      getMissionProgress: (missionId: string) => {
        const state = get();
        const mission = state.dailyMissions.find((m) => m.id === missionId);
        if (!mission) return 0;
        return (mission.current / mission.target) * 100;
      },

      areAllMissionsComplete: () => {
        const state = get();
        return state.dailyMissions.length > 0 && state.dailyMissions.every((m) => m.completed);
      },

      checkDailyHP: () => {
        const state = get();
        const todayStr = getDateString(new Date());

        // Solo verificar si es un nuevo día
        if (state.lastGeneratedDate === todayStr) return;

        // Verificar misiones del día anterior
        const yesterdayStr = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
        
        if (state.lastGeneratedDate === yesterdayStr) {
          const incompleteMissions = state.dailyMissions.filter((m) => !m.completed);
          const hpToReduce = incompleteMissions.length * HP_CONFIG.dailyMissionHP;

          if (hpToReduce > 0) {
            const gamificationStore = useGamificationStore.getState();
            gamificationStore.reduceHP(hpToReduce);
          }
        }

        // Generar nuevas misiones para hoy
        get().generateDailyMissions();
      },
      
      // Obtener información de calentamiento para una misión
      getWarmupForMission: (missionId: string) => {
        const state = get();
        const mission = state.dailyMissions.find(m => m.id === missionId);
        if (!mission) return null;

        return {
          ...(mission.warmupId !== undefined && { warmupId: mission.warmupId }),
          ...(mission.warmupMissionType !== undefined && { warmupMissionType: mission.warmupMissionType }),
        };
      },
      
      // Establecer calentamiento para una misión
      setWarmupForMission: (missionId: string, warmupId: string, warmupMissionType: WarmupMissionType) => {
        const state = get();
        const updatedMissions = state.dailyMissions.map(m =>
          m.id === missionId
            ? { ...m, warmupId, warmupMissionType }
            : m
        );
        
        set({ dailyMissions: updatedMissions });
      },
    }),
    {
      name: 'french-app-missions',
    }
  )
);

