'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MissionFeed } from '@/components/missions';
import { useMissionStore, type Mission } from '@/store/useMissionStore';

export default function MissionsPage() {
  const router = useRouter();
  const { generateDailyMissions, checkDailyHP } = useMissionStore();
  const initialized = useRef(false);

  // Generar misiones al cargar (solo una vez)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    checkDailyHP();
    generateDailyMissions();
  }, []);

  // Manejar inicio de misión
  const handleMissionStart = (mission: Mission) => {
    // Navegar según el tipo de misión
    switch (mission.type) {
      case 'input':
        router.push('/input');
        break;
      case 'exercises':
        router.push('/learn');
        break;
      case 'janus':
        router.push('/learn');
        break;
      case 'forgeMandate':
        router.push('/learn');
        break;
      case 'streak':
        // El streak se completa automáticamente
        break;
      default:
        router.push('/learn');
    }
  };

  return (
    <div className="min-h-screen bg-lf-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-lf-soft border-b border-lf-primary/20 px-4 py-4">
        <h1 className="text-xl font-rajdhani font-bold text-lf-secondary">
          Misiones Diarias
        </h1>
        <p className="text-sm text-lf-muted">
          Completa tus misiones para ganar XP y mantener tu racha
        </p>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <MissionFeed
          onMissionStart={handleMissionStart}
          showCognitiveLoad={true}
          compact={false}
        />
      </main>
    </div>
  );
}
