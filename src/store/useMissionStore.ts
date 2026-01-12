import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STREAK_CONFIG, HP_CONFIG } from '@/lib/constants';
import { useGamificationStore } from './useGamificationStore';
import type { MissionType as WarmupMissionType } from '@/schemas/warmup';

// ============================================================
// CONSTANTS (CLT - Cognitive Load Theory)
// ============================================================

export const COGNITIVE_LOAD_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 50,
  HIGH: 65,
  VERY_HIGH: 75,
} as const;

export const WARMUP_BY_MISSION_TYPE: Record<Mission['type'], WarmupMissionType> = {
  input: 'vocabulary',
  exercises: 'grammar',
  janus: 'grammar',
  streak: 'mixed',
  forgeMandate: 'mixed',
} as const;

// ============================================================
// TYPES
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
  warmupId?: string;
  warmupMissionType?: WarmupMissionType;
  difficulty?: 'low' | 'medium' | 'high';
  cognitiveLoadTarget?: number;
  estimatedMinutes?: number;
  requiresFocus?: boolean;
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
  completedMissions: string[];
  missionHistory: MissionCompletion[];
  lastGeneratedDate: string | null;

  generateDailyMissions: () => void;
  completeMission: (missionId: string) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  getMissionProgress: (missionId: string) => number;
  areAllMissionsComplete: () => boolean;
  checkDailyHP: () => void;

  getWarmupForMission: (missionId: string) => { warmupId?: string; warmupMissionType?: WarmupMissionType } | null;
  setWarmupForMission: (missionId: string, warmupId: string, warmupMissionType: WarmupMissionType) => void;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDateString(date: Date): string {
  const adjusted = new Date(date);
  adjusted.setHours(adjusted.getHours() - STREAK_CONFIG.resetHour);
  return adjusted.toISOString().split('T')[0];
}

function generateMissionId(type: string, index: number): string {
  return `mission-${type}-${Date.now()}-${index}`;
}

function getMissionDifficulty(userLevel: number): 'low' | 'medium' | 'high' {
  if (userLevel <= 3) return 'low';
  if (userLevel <= 6) return 'medium';
  return 'high';
}

function shouldGenerateNewMissions(lastDate: string | null, todayStr: string, currentMissionsCount: number): boolean {
  return lastDate !== todayStr || currentMissionsCount === 0;
}

function applyMissionRewards(mission: Mission): void {
  const gamificationStore = useGamificationStore.getState();
  gamificationStore.addXP(mission.reward.xp);
  gamificationStore.addCoins(mission.reward.coins);
  if (mission.reward.gems) {
    gamificationStore.addGems(mission.reward.gems);
  }
  gamificationStore.recoverHP(HP_CONFIG.recoveryPerMission);
}

function createCompletion(missionId: string, reward: Mission['reward']): MissionCompletion {
  return {
    missionId,
    completedAt: new Date().toISOString(),
    rewardEarned: reward,
  };
}

function updateMissionInList(
  missions: Mission[],
  missionId: string,
  updater: (mission: Mission) => Mission
): Mission[] {
  return missions.map((m) => (m.id === missionId ? updater(m) : m));
}

function calculateHPPenalty(incompleteCount: number): number {
  return incompleteCount * HP_CONFIG.dailyMissionHP;
}

// ============================================================
// MISSION GENERATORS
// ============================================================

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

function generateAllMissions(userLevel: number): Mission[] {
  const missions: Mission[] = [];
  const difficulty = getMissionDifficulty(userLevel);

  missions.push(generateInputMission(0, userLevel, difficulty));
  missions.push(generateExercisesMission(1, userLevel, difficulty));

  const janusMission = generateJanusMission(2, userLevel);
  if (janusMission) {
    missions.push(janusMission);
  }

  missions.push(generateForgeMandateMission(missions.length));
  return missions;
}

// ============================================================
// STORE
// ============================================================

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

        if (!shouldGenerateNewMissions(state.lastGeneratedDate, todayStr, state.dailyMissions.length)) {
          return;
        }

        const userLevel = useGamificationStore.getState().level;
        const missions = generateAllMissions(userLevel);

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

        const updatedMissions = updateMissionInList(state.dailyMissions, missionId, (m) => ({
          ...m,
          completed: true,
          completedAt: new Date().toISOString(),
        }));

        applyMissionRewards(mission);

        set({
          dailyMissions: updatedMissions,
          completedMissions: [...state.completedMissions, missionId],
          missionHistory: [...state.missionHistory, createCompletion(missionId, mission.reward)],
        });
      },

      updateMissionProgress: (missionId: string, progress: number) => {
        const state = get();
        let shouldComplete = false;

        const updatedMissions = state.dailyMissions.map((m) => {
          if (m.id === missionId) {
            const newCurrent = Math.min(m.target, progress);
            shouldComplete = newCurrent >= m.target && !m.completed;
            return { ...m, current: newCurrent };
          }
          return m;
        });

        set({ dailyMissions: updatedMissions });

        if (shouldComplete) {
          get().completeMission(missionId);
        }
      },

      getMissionProgress: (missionId: string) => {
        const mission = get().dailyMissions.find((m) => m.id === missionId);
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

        if (state.lastGeneratedDate === todayStr) return;

        const yesterdayStr = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

        if (state.lastGeneratedDate === yesterdayStr) {
          const incompleteCount = state.dailyMissions.filter((m) => !m.completed).length;
          const hpToReduce = calculateHPPenalty(incompleteCount);

          if (hpToReduce > 0) {
            useGamificationStore.getState().reduceHP(hpToReduce);
          }
        }

        get().generateDailyMissions();
      },

      getWarmupForMission: (missionId: string) => {
        const mission = get().dailyMissions.find((m) => m.id === missionId);
        if (!mission) return null;

        return {
          ...(mission.warmupId !== undefined && { warmupId: mission.warmupId }),
          ...(mission.warmupMissionType !== undefined && { warmupMissionType: mission.warmupMissionType }),
        };
      },

      setWarmupForMission: (missionId: string, warmupId: string, warmupMissionType: WarmupMissionType) => {
        set((state) => ({
          dailyMissions: updateMissionInList(state.dailyMissions, missionId, (m) => ({
            ...m,
            warmupId,
            warmupMissionType,
          })),
        }));
      },
    }),
    {
      name: 'french-app-missions',
    }
  )
);
