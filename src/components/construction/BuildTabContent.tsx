import { motion } from 'framer-motion';
import { Construction3D } from './Construction3D';
import type { Construction3DElement } from './Construction3D';

interface MaterialStats {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  bonusMultiplier: number;
}

interface BuildTabContentProps {
  elementsFor3D: Construction3DElement[];
  materialStats: MaterialStats;
  activeEvents: ActiveEvent[];
  totalBuilds: number;
  onElementClick: (id: string) => void;
}

const MATERIAL_COLORS: Record<string, string> = {
  common: 'bg-gray-700/30 border-gray-600/50',
  uncommon: 'bg-green-900/20 border-green-600/30',
  rare: 'bg-blue-900/20 border-blue-500/30',
  epic: 'bg-purple-900/20 border-purple-500/30',
  legendary: 'bg-amber-900/20 border-amber-500/30',
};

export function BuildTabContent({
  elementsFor3D,
  materialStats,
  activeEvents,
  totalBuilds,
  onElementClick,
}: BuildTabContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 3D View */}
      <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
        <Construction3D
          elements={elementsFor3D}
          onElementClick={onElementClick}
        />
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(materialStats).map(([rarity, count]) => (
          <div
            key={rarity}
            className={`p-3 rounded-xl border text-center ${MATERIAL_COLORS[rarity]}`}
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
  );
}
