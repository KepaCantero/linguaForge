import { useMemo } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useCognitiveLoad } from '@/store/useCognitiveLoadStore';
import { useMissionStore } from '@/store/useMissionStore';

type BrainZoneId = 'prefrontal' | 'temporal' | 'parietal' | 'broca' | 'wernicke';

export function useDashboardData() {
  const { xp, level, rank } = useGamificationStore();
  const { load } = useCognitiveLoad();
  const { dailyMissions } = useMissionStore();

  const synapsesCount = useMemo(() => {
    return Math.floor(xp / 10) + (level * 100);
  }, [xp, level]);

  const synapticStrength = useMemo(() => {
    return Math.min(100, level * 5 + load.germane);
  }, [level, load.germane]);

  const activePathways = useMemo(() => {
    const completed = dailyMissions.filter(m => m.completed).length;
    const pathways: string[] = [];

    if (completed >= 1) pathways.push('comprehension');
    if (completed >= 2) pathways.push('production');
    if (completed >= 3) pathways.push('retention');
    if (completed >= 4) pathways.push('fluency');

    return pathways;
  }, [dailyMissions]);

  const activatedZones = useMemo((): BrainZoneId[] => {
    const zones: BrainZoneId[] = [];

    if (load.germane > 60) zones.push('prefrontal');
    if (load.germane > 40) zones.push('temporal');
    if (load.intrinsic > 50) zones.push('parietal');
    if (load.germane > 30 && load.extraneous < 40) zones.push('broca');
    if (load.germane > 70) zones.push('wernicke');

    return zones;
  }, [load]);

  const neuronalIrrigation = useMemo(() => ({
    totalMinutes: Math.floor(xp / 10),
    effectiveMinutes: Math.floor((xp / 10) * (load.germane / 100)),
    wordsProcessed: synapsesCount * 10,
    comprehensionLevel: load.germane / 100,
    irrigationRate: Math.max(0, load.germane),
    streakDays: 0,
    lastIrrigationTime: Date.now(),
  }), [xp, synapsesCount, load]);

  const currentLevel = useMemo(() => {
    const xpForCurrentLevel = level * 1000;
    const xpForNextLevel = (level + 1) * 1000;
    const progress = (xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);
    return Math.round(progress * 100);
  }, [xp, level]);

  const inputLevel = useMemo(() => {
    const inputMissions = dailyMissions.filter(m => m.type === 'input' && m.completed).length;
    return Math.min(100, inputMissions * 25);
  }, [dailyMissions]);

  return {
    level,
    xp,
    rank,
    synapsesCount,
    synapticStrength,
    activePathways,
    activatedZones,
    neuronalIrrigation,
    currentLevel,
    inputLevel,
    load,
  };
}
