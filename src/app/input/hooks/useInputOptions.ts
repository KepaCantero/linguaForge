import { useMemo } from 'react';
import type { InputHubStats } from './useInputHubStats';
import { BRANCH_COLORS } from '@/lib/constants';
import { useUserStore } from '@/store/useUserStore';
import { getTranslations } from '@/i18n';

export interface InputOption {
  id: string;
  href: string;
  icon: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
  gradient: string;
  color: string;
}

// Colores para cada tipo de input - usando BRANCH_COLORS
const INPUT_COLORS = {
  video: BRANCH_COLORS[9], // #EC4899 - Comunicación (Pink 500)
  audio: BRANCH_COLORS[5], // #10B981 - Comida (Emerald 500)
  text: BRANCH_COLORS[4],  // #06B6D4 - Alojamiento (Cyan 500)
} as const;

// Gradientes para cada tipo de input
const INPUT_GRADIENTS = {
  video: `radial-gradient(circle at 30% 30%, ${INPUT_COLORS.video}, #DB2777)`,
  audio: `radial-gradient(circle at 30% 30%, ${INPUT_COLORS.audio}, #059669)`,
  text: `radial-gradient(circle at 30% 30%, ${INPUT_COLORS.text}, #0891B2)`,
} as const;

export function useInputOptions(stats: InputHubStats): InputOption[] {
  const { appLanguage } = useUserStore();
  const t = getTranslations(appLanguage);

  return useMemo(() => [
    {
      id: 'video',
      href: '/input/video',
      icon: '🎬',
      title: t.input.video.title,
      description: t.input.video.description,
      stats: [
        { label: t.input.video.views, value: stats.videoViews },
        { label: t.input.video.totalHours, value: `${stats.videoHours}h` },
      ],
      gradient: INPUT_GRADIENTS.video,
      color: INPUT_COLORS.video,
    },
    {
      id: 'audio',
      href: '/input/audio',
      icon: '🎧',
      title: t.input.audio.title,
      description: t.input.audio.description,
      stats: [
        { label: t.input.audio.listened, value: stats.audioCount },
        { label: t.input.audio.totalHours, value: `${stats.audioHours}h` },
      ],
      gradient: INPUT_GRADIENTS.audio,
      color: INPUT_COLORS.audio,
    },
    {
      id: 'text',
      href: '/input/text',
      icon: '📖',
      title: t.input.text.title,
      description: t.input.text.description,
      stats: [
        { label: t.input.text.read, value: stats.textCount },
        { label: t.input.text.wordsRead, value: stats.wordsRead.toLocaleString() },
      ],
      gradient: INPUT_GRADIENTS.text,
      color: INPUT_COLORS.text,
    },
  ], [stats, t]);
}
