import { create } from 'zustand';

type RewardType = 'xp' | 'coins' | 'gems' | 'levelUp' | 'streak';

interface UIStore {
  // Estado
  isLoading: boolean;
  error: string | null;
  showRewardAnimation: boolean;
  rewardType: RewardType | null;
  rewardAmount: number;

  // Acciones
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showReward: (type: RewardType, amount: number) => void;
  hideReward: () => void;
  clearError: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  error: null,
  showRewardAnimation: false,
  rewardType: null,
  rewardAmount: 0,

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  showReward: (type, amount) =>
    set({
      showRewardAnimation: true,
      rewardType: type,
      rewardAmount: amount,
    }),

  hideReward: () =>
    set({
      showRewardAnimation: false,
      rewardType: null,
      rewardAmount: 0,
    }),

  clearError: () => set({ error: null }),
}));
