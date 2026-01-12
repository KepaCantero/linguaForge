/**
 * Custom hook for managing TopicCard state and interactions
 * Handles hover state, expansion, progress calculations, and click handlers
 */

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { UnifiedTopic } from '../types';

export interface TopicCardDataReturn {
  isComingSoon: boolean;
  backgroundClass: string;
  showCompletedBorder: boolean;
  showInProgressBorder: boolean;
  showLockedBorder: boolean;
  iconBackgroundClass: string;
  iconStyle: React.CSSProperties | undefined;
  iconContent: string;
  showProgressRing: boolean;
  typeBadgeClass: string;
  typeBadgeContent: string;
  progressBarClass: string;
  progressText: string;
  actionText: string;
  showActionButton: boolean;
  showGlowEffect: boolean;
  handleClick: () => void;
}

export function useTopicCardData(topic: UnifiedTopic): TopicCardDataReturn {
  const router = useRouter();

  const isComingSoon = topic.type === 'coming-soon';

  const backgroundClass = useMemo(() => {
    if (topic.isCompleted) {
      return 'bg-lf-success/15';
    }
    if (topic.isLocked || isComingSoon) {
      return 'bg-lf-muted/20';
    }
    return 'bg-lf-soft/60';
  }, [topic.isCompleted, topic.isLocked, isComingSoon]);

  const showCompletedBorder = topic.isCompleted;
  const showInProgressBorder = !topic.isCompleted && !topic.isLocked && !isComingSoon;
  const showLockedBorder = topic.isLocked || isComingSoon;

  const iconBackgroundClass = useMemo(() => {
    if (topic.isCompleted) {
      return 'bg-gradient-to-br from-lf-success to-lf-success-dark shadow-glow-success';
    }
    if (topic.isLocked || isComingSoon) {
      return 'bg-lf-muted/40';
    }
    return 'shadow-depth-lg';
  }, [topic.isCompleted, topic.isLocked, isComingSoon]);

  const iconStyle = useMemo(() => {
    if (!topic.isCompleted && !topic.isLocked && !isComingSoon) {
      return { background: topic.gradient };
    }
    return undefined;
  }, [topic.isCompleted, topic.isLocked, isComingSoon, topic.gradient]);

  const iconContent = useMemo(() => {
    if (topic.isLocked) {
      return '🔒';
    }
    if (isComingSoon) {
      return '🔜';
    }
    if (topic.isCompleted) {
      return '✓';
    }
    return topic.icon;
  }, [topic.isLocked, isComingSoon, topic.isCompleted, topic.icon]);

  const showProgressRing = !topic.isLocked && !isComingSoon && topic.progress > 0 && !topic.isCompleted;

  const typeBadgeClass = useMemo(() => {
    const baseClass = 'px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap';
    if (topic.type === 'a0-course') {
      return `${baseClass} bg-lf-primary/25 text-lf-primary`;
    }
    if (topic.type === 'imported') {
      return `${baseClass} bg-lf-secondary/25 text-lf-secondary`;
    }
    return `${baseClass} bg-lf-muted/20 text-lf-muted/70`;
  }, [topic.type]);

  const typeBadgeContent = useMemo(() => {
    if (topic.type === 'a0-course') {
      return '🎓 A0';
    }
    if (topic.type === 'imported') {
      return '📁 Importado';
    }
    return '🔜 Próximamente';
  }, [topic.type]);

  const progressBarClass = useMemo(() => {
    const baseClass = 'h-full rounded-full';
    if (topic.isCompleted) {
      return `${baseClass} bg-lf-success`;
    }
    return `${baseClass} bg-gradient-to-r from-lf-primary to-lf-secondary`;
  }, [topic.isCompleted]);

  const progressText = useMemo(() => {
    if (isComingSoon) {
      return 'Próximamente';
    }
    if (topic.isCompleted) {
      return '✓ Completado';
    }
    return `${topic.progress}%`;
  }, [isComingSoon, topic.isCompleted, topic.progress]);

  const actionText = useMemo(() => {
    if (topic.progress === 0) {
      return 'Comenzar';
    }
    if (topic.isCompleted) {
      return 'Repasar';
    }
    return 'Continuar';
  }, [topic.progress, topic.isCompleted]);

  const showActionButton = !topic.isLocked && !isComingSoon;
  const showGlowEffect = topic.isCompleted;

  const handleClick = () => {
    if (!topic.isLocked && !isComingSoon) {
      router.push(topic.href);
    }
  };

  return {
    isComingSoon,
    backgroundClass,
    showCompletedBorder,
    showInProgressBorder,
    showLockedBorder,
    iconBackgroundClass,
    iconStyle,
    iconContent,
    showProgressRing,
    typeBadgeClass,
    typeBadgeContent,
    progressBarClass,
    progressText,
    actionText,
    showActionButton,
    showGlowEffect,
    handleClick,
  };
}
