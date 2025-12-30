'use client';

import { WorldMap } from '@/components/map/WorldMap';
import { useProgressStore } from '@/store/useProgressStore';

interface WorldPageProps {
  params: { worldId: string };
}

export default function WorldPage({ params }: WorldPageProps) {
  const { worldId } = params;
  const { activeLanguage, activeLevel } = useProgressStore();

  return (
    <WorldMap
      lang={activeLanguage}
      level={activeLevel}
      worldId={worldId}
    />
  );
}
