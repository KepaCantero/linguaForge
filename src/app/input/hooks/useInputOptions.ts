import { useMemo } from 'react';
import type { InputHubStats } from './useInputHubStats';

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

export function useInputOptions(stats: InputHubStats): InputOption[] {
  return useMemo(() => [
    {
      id: 'video',
      href: '/input/video',
      icon: '🎬',
      title: 'Video',
      description: 'Videos de YouTube con transcripción',
      stats: [
        { label: 'Visualizaciones', value: stats.videoViews },
        { label: 'Horas totales', value: `${stats.videoHours}h` },
      ],
      gradient: 'radial-gradient(circle at 30% 30%, #EC4899, #DB2777)',
      color: '#EC4899',
    },
    {
      id: 'audio',
      href: '/input/audio',
      icon: '🎧',
      title: 'Audio',
      description: 'Podcasts y diálogos con texto',
      stats: [
        { label: 'Audios escuchados', value: stats.audioCount },
        { label: 'Horas totales', value: `${stats.audioHours}h` },
      ],
      gradient: 'radial-gradient(circle at 30% 30%, #10B981, #059669)',
      color: '#10B981',
    },
    {
      id: 'text',
      href: '/input/text',
      icon: '📖',
      title: 'Texto',
      description: 'Lecturas con audio generado',
      stats: [
        { label: 'Textos leídos', value: stats.textCount },
        { label: 'Palabras leídas', value: stats.wordsRead.toLocaleString() },
      ],
      gradient: 'radial-gradient(circle at 30% 30%, #06B6D4, #0891B2)',
      color: '#06B6D4',
    },
  ], [stats]);
}
