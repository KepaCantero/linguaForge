'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BuilderInventory } from '@/components/construction/BuilderInventory';
import { ConstructionMilestones } from '@/components/construction/ConstructionMilestones';
import { MaterialGallery } from '@/components/construction/MaterialGallery';
import { ConstructionHeader } from '@/components/construction/ConstructionHeader';
import { WelcomeModal } from '@/components/construction/WelcomeModal';
import { BuildTabContent } from '@/components/construction/BuildTabContent';
import { useConstructionData } from './hooks/useConstructionData';
import { useConstructionSound } from '@/lib/sound/construction';

type TabId = 'build' | 'inventory' | 'gallery' | 'milestones';

const TAB_CONTENT = {
  inventory: BuilderInventory,
  gallery: MaterialGallery,
  milestones: ConstructionMilestones,
} as const;

export default function ConstructionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('build');
  const [showWelcome, setShowWelcome] = useState(true);

  const sound = useConstructionSound();
  const data = useConstructionData();

  const handleTabChange = (tab: TabId) => {
    sound.playUIClick();
    setActiveTab(tab);
  };

  const handleElementClick = (_id: string) => {
    sound.playUIClick();
  };

  const handleWelcomeDismiss = () => {
    sound.playUIClick();
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-bg-tertiary via-calm-bg-tertiary to-calm-bg-tertiary pb-24">
      <ConstructionHeader
        activeTab={activeTab}
        totalBuilds={data.totalBuilds}
        masteryLevel={data.masteryLevelValue}
        constructionStreak={data.constructionStreak}
        onTabChange={handleTabChange}
      />

      <WelcomeModal
        show={showWelcome && data.totalBuilds === 0}
        onDismiss={handleWelcomeDismiss}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'build' && (
            <BuildTabContent
              key="build"
              elementsFor3D={data.elementsFor3D}
              materialStats={data.materialStats}
              activeEvents={data.activeEvents}
              totalBuilds={data.totalBuilds}
              onElementClick={handleElementClick}
            />
          )}

          {activeTab !== 'build' && (
            <TabWrapper key={activeTab}>
              {(() => {
                const Component = TAB_CONTENT[activeTab];
                return <Component />;
              })()}
            </TabWrapper>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {children}
    </motion.div>
  );
}
