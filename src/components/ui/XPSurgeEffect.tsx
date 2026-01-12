'use client';

import { useEffect, useState } from 'react';
import { ParticlesSurge } from './ParticlesSurge';

/**
 * Componente que escucha eventos de XP surge y muestra partículas
 * Debe estar en el layout principal para funcionar globalmente
 */
export function XPSurgeEffect() {
  const [surgeActive, setSurgeActive] = useState(false);
  const [surgeType, setSurgeType] = useState<'surge' | 'level-up' | 'rank-up'>('surge');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleXPSurge = (_event: CustomEvent) => {
      setSurgeType('surge');
      setSurgeActive(true);
    };

    const handleLevelUp = () => {
      setSurgeType('level-up');
      setSurgeActive(true);
    };

    const handleRankUp = () => {
      setSurgeType('rank-up');
      setSurgeActive(true);
    };

    globalThis.addEventListener('xp-surge', handleXPSurge as EventListener);
    globalThis.addEventListener('level-up', handleLevelUp);
    globalThis.addEventListener('rank-up', handleRankUp);

    return () => {
      globalThis.removeEventListener('xp-surge', handleXPSurge as EventListener);
      globalThis.removeEventListener('level-up', handleLevelUp);
      globalThis.removeEventListener('rank-up', handleRankUp);
    };
  }, []);

  return (
    <ParticlesSurge
      active={surgeActive}
      type={surgeType}
      onComplete={() => setSurgeActive(false)}
    />
  );
}

