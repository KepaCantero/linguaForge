import { useState, useMemo, useCallback } from 'react';
import { useMissionStore, type Mission } from '@/store/useMissionStore';
import { useCognitiveLoad } from '@/store/useCognitiveLoadStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { suggestMissionOrder, shouldTakeBreak } from '@/services/missionGenerator';

interface UseMissionFeedProps {
  sessionMinutes?: number;
  onMissionStart?: (mission: Mission) => void;
}

interface MissionStats {
  completed: number;
  total: number;
  totalXP: number;
  earnedXP: number;
  estimatedMinutes: number;
}

interface BreakSuggestion {
  shouldBreak: boolean;
  reason: string;
  recommendedMinutes: number;
}

interface UseMissionFeedReturn {
  // State
  expandedMission: string | null;
  activeMission: Mission | null;
  showWarmupGate: boolean;

  // Computed values
  sortedMissions: Mission[];
  stats: MissionStats;
  allMissionsComplete: boolean;
  breakSuggestion: BreakSuggestion;

  // Actions
  handleMissionClick: (mission: Mission) => void;
  handleStartWithWarmup: (mission: Mission) => void;
  handleStartMission: (mission: Mission) => void;
  handleWarmupComplete: (score: number) => void;
  handleWarmupSkip: () => void;
  handleMissionStartAfterWarmup: () => void;

  // Utility functions
  getLoadColor: (load: number) => string;
  getMissionIcon: (type: Mission['type']) => string;
  getDifficultyColor: (difficulty?: 'low' | 'medium' | 'high') => string;
}

/**
 * Custom hook that consolidates all mission feed logic
 *
 * Manages:
 * - Mission state (expanded, active, warmup gate)
 * - Computed statistics and sorting
 * - Break suggestions based on cognitive load
 * - Event handlers for mission interactions
 * - Utility functions for styling and icons
 */
export function useMissionFeed({
  sessionMinutes = 0,
  onMissionStart,
}: UseMissionFeedProps = {}): UseMissionFeedReturn {
  // ============================================================
  // STORE STATE
  // ============================================================
  const { dailyMissions } = useMissionStore();
  const { status: loadStatus } = useCognitiveLoad();
  const { level } = useGamificationStore();

  // ============================================================
  // LOCAL STATE
  // ============================================================
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showWarmupGate, setShowWarmupGate] = useState(false);

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  /**
   * Missions sorted by optimal cognitive load order
   */
  const sortedMissions = useMemo(
    () => suggestMissionOrder(dailyMissions),
    [dailyMissions]
  );

  /**
   * Calculate mission statistics
   */
  const stats = useMemo((): MissionStats => {
    const completed = dailyMissions.filter((m) => m.completed).length;
    const total = dailyMissions.length;
    const totalXP = dailyMissions.reduce((acc, m) => acc + m.reward.xp, 0);
    const earnedXP = dailyMissions
      .filter((m) => m.completed)
      .reduce((acc, m) => acc + m.reward.xp, 0);
    const estimatedMinutes = dailyMissions
      .filter((m) => !m.completed)
      .reduce((acc, m) => acc + (m.estimatedMinutes || 0), 0);

    return { completed, total, totalXP, earnedXP, estimatedMinutes };
  }, [dailyMissions]);

  /**
   * Check if all missions are completed
   */
  const allMissionsComplete = useMemo(() => {
    return dailyMissions.length > 0 && dailyMissions.every((m) => m.completed);
  }, [dailyMissions]);

  /**
   * Calculate break suggestion based on progress and cognitive load
   */
  const breakSuggestion = useMemo((): BreakSuggestion => {
    const completedCount = dailyMissions.filter((m) => m.completed).length;
    const currentLoad = loadStatus === 'overload' ? 90 : loadStatus === 'high' ? 75 : 50;
    return shouldTakeBreak(completedCount, sessionMinutes, currentLoad);
  }, [dailyMissions, sessionMinutes, loadStatus]);

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  /**
   * Handle mission click to expand/collapse details
   */
  const handleMissionClick = useCallback(
    (mission: Mission) => {
      if (mission.completed) return;

      if (expandedMission === mission.id) {
        // Already expanded - toggle would close it, but we keep it open
        // The actual toggle can be done by clicking again if needed
      } else {
        // Expand to show details
        setExpandedMission(mission.id);
      }
    },
    [expandedMission]
  );

  /**
   * Handle start with warmup flow
   */
  const handleStartWithWarmup = useCallback(
    (mission: Mission) => {
      setActiveMission(mission);
      setShowWarmupGate(true);
    },
    []
  );

  /**
   * Handle direct mission start (without warmup)
   */
  const handleStartMission = useCallback(
    (mission: Mission) => {
      setActiveMission(null);
      setShowWarmupGate(false);
      onMissionStart?.(mission);
    },
    [onMissionStart]
  );

  /**
   * Handle warmup completion
   * Score is saved in store, no additional action needed
   */
  const handleWarmupComplete = useCallback((_score: number) => {
    // Score is saved in store, no additional action needed
  }, []);

  /**
   * Handle warmup skip
   * User chooses to skip the warmup
   */
  const handleWarmupSkip = useCallback(() => {
    // Warmup skipped - no action needed
  }, []);

  /**
   * Handle mission start after warmup completion
   */
  const handleMissionStartAfterWarmup = useCallback(() => {
    if (activeMission) {
      setShowWarmupGate(false);
      onMissionStart?.(activeMission);
      setActiveMission(null);
    }
  }, [activeMission, onMissionStart]);

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Get color class for cognitive load indicator
   */
  const getLoadColor = useCallback((load: number): string => {
    if (load <= 30) return 'bg-accent-500';
    if (load <= 50) return 'bg-sky-500';
    if (load <= 70) return 'bg-amber-500';
    return 'bg-semantic-error';
  }, []);

  /**
   * Get icon emoji for mission type
   */
  const getMissionIcon = useCallback((type: Mission['type']): string => {
    const icons: Record<string, string> = {
      input: '🎧',
      exercises: '📝',
      janus: '🔀',
      forgeMandate: '⚔️',
      streak: '🔥',
    };
    return icons[type] || '📌';
  }, []);

  /**
   * Get color class for difficulty level
   */
  const getDifficultyColor = useCallback(
    (difficulty?: 'low' | 'medium' | 'high'): string => {
      switch (difficulty) {
        case 'low':
          return 'text-accent-400';
        case 'medium':
          return 'text-amber-400';
        case 'high':
          return 'text-semantic-error';
        default:
          return 'text-calm-text-muted';
      }
    },
    []
  );

  return {
    // State
    expandedMission,
    activeMission,
    showWarmupGate,

    // Computed values
    sortedMissions,
    stats,
    allMissionsComplete,
    breakSuggestion,

    // Actions
    handleMissionClick,
    handleStartWithWarmup,
    handleStartMission,
    handleWarmupComplete,
    handleWarmupSkip,
    handleMissionStartAfterWarmup,

    // Utility functions
    getLoadColor,
    getMissionIcon,
    getDifficultyColor,
  };
}
