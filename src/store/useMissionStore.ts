import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STREAK_CONFIG, HP_CONFIG } from '@/lib/constants';
import { useGamificationStore } from './useGamificationStore';

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

        // Misión 1: Input (siempre presente)
        missions.push({
          id: generateMissionId('input', 0),
          type: 'input',
          title: 'Consumir Input Comprensible',
          description: `Escucha o lee ${5 + userLevel * 2} minutos de contenido`,
          target: 5 + userLevel * 2,
          current: 0,
          reward: { xp: 25, coins: 10 },
          completed: false,
        });

        // Misión 2: Ejercicios
        missions.push({
          id: generateMissionId('exercises', 1),
          type: 'exercises',
          title: 'Completar Ejercicios',
          description: `Completa ${3 + Math.floor(userLevel / 2)} ejercicios`,
          target: 3 + Math.floor(userLevel / 2),
          current: 0,
          reward: { xp: 30, coins: 15 },
          completed: false,
        });

        // Misión 3: Janus (si el usuario tiene nivel suficiente)
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
          });
        }

        // Misión 4: Forge Mandate (siempre presente)
        missions.push({
          id: generateMissionId('forgeMandate', 3),
          type: 'forgeMandate',
          title: 'Forge Mandate',
          description: 'Completa la misión diaria Forge Mandate',
          target: 1,
          current: 0,
          reward: { xp: 100, coins: 50, gems: 20 },
          completed: false,
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
    }),
    {
      name: 'french-app-missions',
    }
  )
);

