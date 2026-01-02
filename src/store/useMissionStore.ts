import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STREAK_CONFIG, HP_CONFIG } from '@/lib/constants';
import { useGamificationStore } from './useGamificationStore';
import type { MissionType as WarmupMissionType } from '@/schemas/warmup';

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
  // Nuevos campos para calentamientos
  warmupId?: string;
  warmupMissionType?: WarmupMissionType; // 'grammar' | 'vocabulary' | 'pronunciation' | 'mixed'
  difficulty?: 'low' | 'medium' | 'high';
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

        // Generar 3-4 misiones diarias
        const missions: Mission[] = [];

        // Determinar dificultad basada en nivel
        const getDifficulty = (): 'low' | 'medium' | 'high' => {
          if (userLevel <= 3) return 'low';
          if (userLevel <= 6) return 'medium';
          return 'high';
        };
        const difficulty = getDifficulty();

        // Misión 1: Input (siempre presente) - Calentamiento: Visual Match (vocabulario)
        missions.push({
          id: generateMissionId('input', 0),
          type: 'input',
          title: 'Consumir Input Comprensible',
          description: `Escucha o lee ${5 + userLevel * 2} minutos de contenido`,
          target: 5 + userLevel * 2,
          current: 0,
          reward: { xp: 25, coins: 10 },
          completed: false,
          warmupMissionType: 'vocabulary', // Input activa vocabulario
          difficulty,
        });

        // Misión 2: Ejercicios - Calentamiento: Rhythm Sequence (gramática)
        missions.push({
          id: generateMissionId('exercises', 1),
          type: 'exercises',
          title: 'Completar Ejercicios',
          description: `Completa ${3 + Math.floor(userLevel / 2)} ejercicios`,
          target: 3 + Math.floor(userLevel / 2),
          current: 0,
          reward: { xp: 30, coins: 15 },
          completed: false,
          warmupMissionType: 'grammar', // Ejercicios activan gramática
          difficulty,
        });

        // Misión 3: Janus (si el usuario tiene nivel suficiente) - Calentamiento: Rhythm Sequence (gramática)
        if (userLevel >= 2) {
          missions.push({
            id: generateMissionId('janus', 2),
            type: 'janus',
            title: 'Combinaciones Janus',
            description: `Crea ${5 + userLevel} combinaciones en la matriz Janus`,
            target: 5 + userLevel,
            current: 0,
            reward: { xp: 20, coins: 10 },
            completed: false,
            warmupMissionType: 'grammar', // Janus activa gramática
            difficulty: userLevel <= 4 ? 'medium' : 'high',
          });
        }

        // Misión 4: Forge Mandate (siempre presente) - Calentamiento: Mixed (usa el más relevante)
        missions.push({
          id: generateMissionId('forgeMandate', 3),
          type: 'forgeMandate',
          title: 'Forge Mandate',
          description: 'Completa la misión diaria Forge Mandate',
          target: 1,
          current: 0,
          reward: { xp: 100, coins: 50, gems: 20 },
          completed: false,
          warmupMissionType: 'mixed', // Forge Mandate es mixto
          difficulty: 'medium',
        });

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
          warmupId: mission.warmupId,
          warmupMissionType: mission.warmupMissionType,
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

