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

    window.addEventListener('xp-surge', handleXPSurge as EventListener);
    window.addEventListener('level-up', handleLevelUp);
    window.addEventListener('rank-up', handleRankUp);

    return () => {
      window.removeEventListener('xp-surge', handleXPSurge as EventListener);
      window.removeEventListener('level-up', handleLevelUp);
      window.removeEventListener('rank-up', handleRankUp);
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

