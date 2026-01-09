'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  useConstructionStore,
  MATERIALS,
  ELEMENTS,
} from '@/store/useConstructionStore';
import { BuilderInventory } from '@/components/construction/BuilderInventory';
import { ConstructionMilestones } from '@/components/construction/ConstructionMilestones';
import { MaterialGallery } from '@/components/construction/MaterialGallery';
import {
  getMasteryLevel,
  getActiveEvents,
} from '@/lib/progression/construction';
import { useConstructionSound } from '@/lib/sound/construction';

// Dynamic import for Three.js component (client-side only)
const Construction3D = dynamic(
  () => import('@/components/construction/Construction3D').then(mod => ({ default: mod.Construction3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-800/50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🏗️</div>
          <p className="text-gray-400">Cargando vista 3D...</p>
        </div>
      </div>
    )
  }
);

type TabId = 'build' | 'inventory' | 'gallery' | 'milestones';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'build', label: 'Construir', icon: '🏗️' },
  { id: 'inventory', label: 'Inventario', icon: '📦' },
  { id: 'gallery', label: 'Galería', icon: '🎨' },
  { id: 'milestones', label: 'Hitos', icon: '🏆' },
];

export default function ConstructionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('build');
  const [showWelcome, setShowWelcome] = useState(true);

  const {
    materialInventory,
    elementProgress,
    totalBuilds,
    constructionMilestones,
  } = useConstructionStore();

  const sound = useConstructionSound();

  // Derived metrics
  const masteryLevel = useMemo(() => getMasteryLevel(totalBuilds), [totalBuilds]);
  const activeEvents = useMemo(() => getActiveEvents(), []);
  const constructionStreak = constructionMilestones.length; // Approximation

  // Material counts by rarity
  const materialStats = useMemo(() => {
    const stats = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    Object.entries(materialInventory).forEach(([id, qty]) => {
      const mat = MATERIALS[id];
      if (mat && qty > 0) {
        stats[mat.rarity] += qty;
      }
    });
    return stats;
  }, [materialInventory]);

  // Material colors for 3D view
  const MATERIAL_COLORS: Record<string, string> = {
    wood: '#8B4513',
    stone: '#808080',
    glass: '#87CEEB',
    metal: '#C0C0C0',
    crystal: '#E0FFFF',
  };

  // Elements for 3D view
  const elementsFor3D = useMemo(() => {
    return Object.entries(elementProgress)
      .filter(([, progress]) => progress >= 100)
      .map(([id], index) => {
        const element = ELEMENTS[id];
        // Get material from first required material or default to wood
        const primaryMat = element?.requiredMaterials?.[0]?.materialId;
        const matDef = primaryMat ? MATERIALS[primaryMat] : null;
        const texture = matDef?.texture || 'wood';
        return {
          id,
          type: element?.type || 'foundation',
          position: [index * 2, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          material: texture,
          color: MATERIAL_COLORS[texture] || '#8B4513',
        };
      });
  }, [elementProgress]);

  const handleTabChange = (tab: TabId) => {
    sound.playUIClick();
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🏰</span>
                Tu Palacio del Conocimiento
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Construye mientras aprendes francés
              </p>
            </div>

            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="text-amber-400 font-bold">{totalBuilds}</div>
                <div className="text-xs text-gray-400">Construido</div>
              </div>
              <div className="text-center px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 font-bold">{masteryLevel.level}</div>
                <div className="text-xs text-gray-400">Maestría</div>
              </div>
              <div className="text-center px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-orange-400 font-bold">{constructionStreak}🔥</div>
                <div className="text-xs text-gray-400">Racha</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Welcome modal for first-time users */}
      <AnimatePresence>
        {showWelcome && totalBuilds === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-amber-500/30"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏰</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Bienvenido al Constructor!
                </h2>
                <p className="text-gray-300 mb-4">
                  Cada tema de francés que completes te dará materiales para construir
                  tu propio palacio del conocimiento.
                </p>
                <ul className="text-left text-sm text-gray-400 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">🪵</span>
                    Completa lecciones para ganar madera, piedra y más
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">💎</span>
                    Materiales raros por rachas y logros especiales
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">🏗️</span>
                    Desbloquea elementos arquitectónicos únicos
                  </li>
                </ul>
                <button
                  onClick={() => {
                    sound.playUIClick();
                    setShowWelcome(false);
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl transition-colors"
                >
                  ¡Empezar a Construir!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'build' && (
            <motion.div
              key="build"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 3D View */}
              <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
                <Construction3D
                  elements={elementsFor3D}
                  onElementClick={(id) => {
                    sound.playUIClick();
                    console.log('Element clicked:', id);
                  }}
                />
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(materialStats).map(([rarity, count]) => (
                  <div
                    key={rarity}
                    className={`
                      p-3 rounded-xl border text-center
                      ${rarity === 'common' ? 'bg-gray-700/30 border-gray-600/50' : ''}
                      ${rarity === 'uncommon' ? 'bg-green-900/20 border-green-600/30' : ''}
                      ${rarity === 'rare' ? 'bg-blue-900/20 border-blue-500/30' : ''}
                      ${rarity === 'epic' ? 'bg-purple-900/20 border-purple-500/30' : ''}
                      ${rarity === 'legendary' ? 'bg-amber-900/20 border-amber-500/30' : ''}
                    `}
                  >
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-xs text-gray-400 capitalize">{rarity}</div>
                  </div>
                ))}
              </div>

              {/* Active events */}
              {activeEvents.length > 0 && (
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-4 border border-purple-500/30">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span>🎉</span> Eventos Activos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeEvents.map(event => (
                      <div key={event.id} className="bg-black/20 rounded-xl p-3">
                        <div className="font-medium text-white">{event.name}</div>
                        <div className="text-sm text-gray-400">{event.description}</div>
                        <div className="text-xs text-purple-400 mt-1">
                          Bonus: x{event.bonusMultiplier} materiales
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {totalBuilds === 0 && (
                <div className="text-center py-12 bg-gray-800/20 rounded-2xl border border-dashed border-gray-600">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Tu palacio está vacío
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Completa lecciones de francés para ganar materiales y
                    empezar a construir tu palacio del conocimiento.
                  </p>
                  <a
                    href="/learn"
                    className="inline-block mt-4 px-6 py-2 bg-lf-primary hover:bg-lf-primary/80 text-white rounded-xl transition-colors"
                  >
                    Ir a Aprender
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BuilderInventory />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MaterialGallery />
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConstructionMilestones />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
