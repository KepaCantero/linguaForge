'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NeuralDashboard } from '@/components/visualization/NeuralDashboard';
import { OrbitalHUD } from '@/components/dashboard/OrbitalHUD';
import { CognitiveLoadSection } from '@/components/dashboard/CognitiveLoadSection';
import { useDashboardData } from './hooks/useDashboardData';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const data = useDashboardData();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      <OrbitalHUD
        level={data.level}
        xp={data.xp}
        currentLevel={data.currentLevel}
        rank={data.rank}
        synapsesCount={data.synapsesCount}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NeuralDashboard
          currentLevel={data.currentLevel}
          inputLevel={data.inputLevel}
          synapsesCount={data.synapsesCount}
          synapticStrength={data.synapticStrength}
          activePathways={data.activePathways}
          activatedZones={data.activatedZones}
          neuronalIrrigation={data.neuronalIrrigation}
          variant="standard"
          showAnimations={true}
        />
      </motion.div>

      <CognitiveLoadSection
        intrinsic={data.load.intrinsic}
        germane={data.load.germane}
        extraneous={data.load.extraneous}
      />
    </div>
  );
}
