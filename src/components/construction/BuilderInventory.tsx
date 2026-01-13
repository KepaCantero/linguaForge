'use client';

/**
 * BuilderInventory - Componente de inventario del constructor
 * Muestra materiales disponibles y elementos desbloqueados
 *
 * TAREA 2.8.9.7: UI de colección de elementos constructivos
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useConstructionStore,
  MATERIALS,
  ELEMENTS,
  type MaterialDefinition,
  type ElementDefinition,
} from '@/store/useConstructionStore';
import { type MaterialRarity, type BuildingElementType } from '@/schemas/construction';
import { useHaptic } from '@/lib/haptic';
import { useSoundEngine } from '@/lib/soundEngine';

// ============================================
// TIPOS
// ============================================

interface BuilderInventoryProps {
  onMaterialSelect?: (materialId: string) => void;
  onElementSelect?: (elementId: string) => void;
  showElements?: boolean;
  className?: string;
}

type TabType = 'materials' | 'elements';
type SortType = 'name' | 'rarity' | 'amount';

// ============================================
// CONSTANTES
// ============================================

const RARITY_COLORS: Record<MaterialRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-calm-bg-tertiary', border: 'border-calm-warm-300', text: 'text-calm-text-tertiary', glow: '' },
  uncommon: { bg: 'bg-accent-900/50', border: 'border-accent-500', text: 'text-accent-400', glow: 'shadow-green-500/20' },
  rare: { bg: 'bg-sky-900/50', border: 'border-sky-500', text: 'text-sky-400', glow: 'shadow-blue-500/30' },
  epic: { bg: 'bg-sky-900/50', border: 'border-sky-500', text: 'text-sky-400', glow: 'shadow-sky-500/40' },
  legendary: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-400', glow: 'shadow-yellow-500/50' },
};

const RARITY_LABELS: Record<MaterialRarity, string> = {
  common: 'Común',
  uncommon: 'Poco común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

const ELEMENT_TYPE_ICONS: Record<BuildingElementType, string> = {
  foundation: '🏛️',
  wall: '🧱',
  pillar: '🏛️',
  roof: '🏠',
  tower: '🗼',
  garden: '🌳',
  bridge: '🌉',
  fountain: '⛲',
  statue: '🗿',
  gate: '🚪',
  window: '🪟',
  door: '🚪',
  stair: '🪜',
  balcony: '🏰',
  dome: '🕌',
};

const TEXTURE_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  glass: '🔮',
  metal: '⚙️',
  crystal: '💎',
};

// ============================================
// COMPONENTE: MaterialCard
// ============================================

interface MaterialCardProps {
  material: MaterialDefinition;
  amount: number;
  isSelected: boolean;
  onClick: () => void;
}

function MaterialCard({ material, amount, isSelected, onClick }: MaterialCardProps) {
  const colors = RARITY_COLORS[material.rarity];
  const haptic = useHaptic();

  const handleClick = () => {
    haptic.tap();
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-200
        ${colors.bg} ${colors.border}
        ${isSelected ? `ring-2 ring-white ring-offset-2 ring-offset-gray-900 ${colors.glow} shadow-lg` : ''}
        ${amount === 0 ? 'opacity-50' : 'hover:shadow-lg'}
      `}
    >
      {/* Icono de textura */}
      <div className="text-2xl mb-1">
        {TEXTURE_ICONS[material.texture] || '📦'}
      </div>

      {/* Nombre */}
      <p className={`text-sm font-medium ${colors.text} truncate`}>
        {material.name}
      </p>

      {/* Cantidad */}
      <div className="absolute top-1 right-1 bg-calm-bg-primary/80 px-1.5 py-0.5 rounded text-xs font-bold">
        {amount}
      </div>

      {/* Badge de rareza para épicos y legendarios */}
      {(material.rarity === 'epic' || material.rarity === 'legendary') && (
        <motion.div
          className="absolute -top-1 -left-1"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {material.rarity === 'legendary' ? '✨' : '💫'}
        </motion.div>
      )}
    </motion.button>
  );
}

// ============================================
// COMPONENTE: ElementCard
// ============================================

interface ElementCardProps {
  element: ElementDefinition;
  isUnlocked: boolean;
  progress: number;
  canBuild: boolean;
  onClick: () => void;
}

function ElementCard({ element, isUnlocked, progress, canBuild, onClick }: ElementCardProps) {
  const haptic = useHaptic();

  const handleClick = () => {
    if (isUnlocked) {
      haptic.select();
      onClick();
    } else {
      haptic.error();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={isUnlocked ? { scale: 1.03 } : {}}
      whileTap={isUnlocked ? { scale: 0.97 } : {}}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 text-left
        ${isUnlocked
          ? 'bg-calm-bg-elevated/50 border-calm-warm-200 hover:border-accent-500'
          : 'bg-calm-bg-primary/50 border-calm-warm-200 opacity-60 cursor-not-allowed'
        }
      `}
    >
      {/* Icono */}
      <div className="text-3xl mb-2">
        {ELEMENT_TYPE_ICONS[element.type] || '🏗️'}
      </div>

      {/* Nombre */}
      <p className="text-sm font-semibold text-white mb-1">
        {element.name}
      </p>

      {/* Tipo */}
      <p className="text-xs text-calm-text-muted capitalize">
        {element.type}
      </p>

      {/* Barra de progreso */}
      {isUnlocked && progress > 0 && progress < 100 && (
        <div className="mt-2 h-1 bg-calm-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Badge de estado */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 text-lg">🔒</div>
      )}
      {isUnlocked && progress === 100 && (
        <div className="absolute top-2 right-2 text-lg">✅</div>
      )}
      {isUnlocked && canBuild && progress < 100 && (
        <div className="absolute top-2 right-2 bg-accent-500 text-xs px-1.5 py-0.5 rounded font-medium">
          Construir
        </div>
      )}

      {/* Nivel requerido */}
      <div className="absolute bottom-2 right-2 text-xs text-calm-text-muted">
        Nv. {element.unlockLevel}
      </div>
    </motion.button>
  );
}

// ============================================
// COMPONENTE: FilterBar
// ============================================

interface FilterBarProps {
  activeRarity: MaterialRarity | 'all';
  onRarityChange: (rarity: MaterialRarity | 'all') => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
}

function FilterBar({ activeRarity, onRarityChange, sortBy, onSortChange }: FilterBarProps) {
  const rarities: (MaterialRarity | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Filtros de rareza */}
      <div className="flex gap-1 flex-wrap">
        {rarities.map((rarity) => (
          <button
            key={rarity}
            onClick={() => onRarityChange(rarity)}
            className={`
              px-2 py-1 text-xs rounded-md transition-colors
              ${activeRarity === rarity
                ? 'bg-accent-600 text-white'
                : 'bg-calm-bg-tertiary text-calm-text-tertiary hover:bg-calm-warm-200'
              }
            `}
          >
            {rarity === 'all' ? 'Todos' : RARITY_LABELS[rarity]}
          </button>
        ))}
      </div>

      {/* Ordenamiento */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortType)}
        className="bg-calm-bg-tertiary text-calm-text-tertiary text-xs px-2 py-1 rounded-md ml-auto"
      >
        <option value="name">Nombre</option>
        <option value="rarity">Rareza</option>
        <option value="amount">Cantidad</option>
      </select>
    </div>
  );
}

// ============================================
// COMPONENTE: Stats
// ============================================

interface StatsProps {
  stats: {
    totalBuilds: number;
    uniqueElementsUnlocked: number;
    totalMaterialsCollected: number;
    milestonesReached: number;
    projectsCompleted: number;
  };
}

function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="bg-calm-bg-elevated/50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-accent-400">{stats.totalBuilds}</p>
        <p className="text-xs text-calm-text-muted">Construcciones</p>
      </div>
      <div className="bg-calm-bg-elevated/50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-accent-400">{stats.uniqueElementsUnlocked}</p>
        <p className="text-xs text-calm-text-muted">Elementos</p>
      </div>
      <div className="bg-calm-bg-elevated/50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-amber-400">{stats.totalMaterialsCollected}</p>
        <p className="text-xs text-calm-text-muted">Materiales</p>
      </div>
      <div className="bg-calm-bg-elevated/50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-sky-400">{stats.milestonesReached}</p>
        <p className="text-xs text-calm-text-muted">Hitos</p>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: BuilderInventory
// ============================================

export function BuilderInventory({
  onMaterialSelect,
  onElementSelect,
  showElements = true,
  className = '',
}: BuilderInventoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<MaterialRarity | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortType>('rarity');

  const haptic = useHaptic();
  const sound = useSoundEngine();

  // Store data
  const materialInventory = useConstructionStore((s) => s.materialInventory);
  const unlockedElements = useConstructionStore((s) => s.unlockedElements);
  const elementProgress = useConstructionStore((s) => s.elementProgress);
  const hasMaterials = useConstructionStore((s) => s.hasMaterials);
  const getStats = useConstructionStore((s) => s.getStats);

  const stats = getStats();

  // Materiales filtrados y ordenados
  const filteredMaterials = useMemo(() => {
    let materials = Object.values(MATERIALS);

    // Filtrar por rareza
    if (rarityFilter !== 'all') {
      materials = materials.filter((m) => m.rarity === rarityFilter);
    }

    // Ordenar
    materials.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity': {
          const rarityOrder: MaterialRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        }
        case 'amount':
          return (materialInventory[b.id] || 0) - (materialInventory[a.id] || 0);
        default:
          return 0;
      }
    });

    return materials;
  }, [rarityFilter, sortBy, materialInventory]);

  // Elementos ordenados
  const sortedElements = useMemo(() => {
    return Object.values(ELEMENTS).sort((a, b) => {
      // Desbloqueados primero
      const aUnlocked = unlockedElements.includes(a.id);
      const bUnlocked = unlockedElements.includes(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;

      // Luego por nivel
      return a.unlockLevel - b.unlockLevel;
    });
  }, [unlockedElements]);

  const handleMaterialClick = (materialId: string) => {
    setSelectedMaterial(materialId === selectedMaterial ? null : materialId);
    onMaterialSelect?.(materialId);
    sound.playTap();
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId === selectedElement ? null : elementId);
    onElementSelect?.(elementId);
    sound.playTap();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    haptic.tap();
  };

  return (
    <div className={`bg-calm-bg-primary rounded-xl p-4 ${className}`}>
      {/* Header con estadísticas */}
      <Stats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleTabChange('materials')}
          className={`
            flex-1 py-2 px-4 rounded-lg font-medium transition-colors
            ${activeTab === 'materials'
              ? 'bg-accent-600 text-white'
              : 'bg-calm-bg-elevated text-calm-text-muted hover:bg-calm-bg-tertiary'
            }
          `}
        >
          📦 Materiales
        </button>
        {showElements && (
          <button
            onClick={() => handleTabChange('elements')}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-colors
              ${activeTab === 'elements'
                ? 'bg-accent-600 text-white'
                : 'bg-calm-bg-elevated text-calm-text-muted hover:bg-calm-bg-tertiary'
              }
            `}
          >
            🏗️ Elementos
          </button>
        )}
      </div>

      {/* Contenido según tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'materials' && (
          <motion.div
            key="materials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <FilterBar
              activeRarity={rarityFilter}
              onRarityChange={setRarityFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  amount={materialInventory[material.id] || 0}
                  isSelected={selectedMaterial === material.id}
                  onClick={() => handleMaterialClick(material.id)}
                />
              ))}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-8 text-calm-text-muted">
                No hay materiales con este filtro
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'elements' && showElements && (
          <motion.div
            key="elements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sortedElements.map((element) => {
                const isUnlocked = unlockedElements.includes(element.id);
                const progress = elementProgress[element.id] || 0;
                const canBuild = isUnlocked && hasMaterials(element.requiredMaterials);

                return (
                  <ElementCard
                    key={element.id}
                    element={element}
                    isUnlocked={isUnlocked}
                    progress={progress}
                    canBuild={canBuild}
                    onClick={() => handleElementClick(element.id)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de detalle del material/elemento seleccionado */}
      <AnimatePresence>
        {selectedMaterial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 bg-calm-bg-elevated rounded-lg border border-calm-warm-200"
          >
            <MaterialDetail materialId={selectedMaterial} />
          </motion.div>
        )}
        {selectedElement && activeTab === 'elements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 bg-calm-bg-elevated rounded-lg border border-calm-warm-200"
          >
            <ElementDetail elementId={selectedElement} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// COMPONENTE: MaterialDetail
// ============================================

function MaterialDetail({ materialId }: { materialId: string }) {
  const material = MATERIALS[materialId];
  const amount = useConstructionStore((s) => s.materialInventory[materialId] || 0);

  if (!material) return null;

  const colors = RARITY_COLORS[material.rarity];

  return (
    <div className="flex gap-4">
      <div className={`w-16 h-16 rounded-lg ${colors.bg} ${colors.border} border-2 flex items-center justify-center text-3xl`}>
        {TEXTURE_ICONS[material.texture]}
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${colors.text}`}>{material.name}</h3>
        <p className="text-sm text-calm-text-muted capitalize">{RARITY_LABELS[material.rarity]} • {material.texture}</p>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-calm-text-tertiary">Cantidad: <span className="font-bold text-white">{amount}</span></span>
          <span className="text-calm-text-tertiary">Valor XP: <span className="font-bold text-accent-400">{material.xpCost}</span></span>
          <span className="text-calm-text-tertiary">Valor Coins: <span className="font-bold text-amber-400">{material.coinCost}</span></span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: ElementDetail
// ============================================

function ElementDetail({ elementId }: { elementId: string }) {
  const element = ELEMENTS[elementId];
  const isUnlocked = useConstructionStore((s) => s.unlockedElements.includes(elementId));
  const progress = useConstructionStore((s) => s.elementProgress[elementId] || 0);
  const getMaterialCount = useConstructionStore((s) => s.getMaterialCount);

  if (!element) return null;

  return (
    <div>
      <div className="flex gap-4 mb-3">
        <div className="w-16 h-16 bg-calm-bg-tertiary rounded-lg flex items-center justify-center text-3xl">
          {ELEMENT_TYPE_ICONS[element.type]}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{element.name}</h3>
          <p className="text-sm text-calm-text-muted capitalize">{element.type} • Nivel {element.unlockLevel}</p>
          <p className="text-sm text-accent-400 mt-1">+{element.xpReward} XP al construir</p>
        </div>
      </div>

      {/* Materiales requeridos */}
      <div className="border-t border-calm-warm-200 pt-3">
        <p className="text-sm font-medium text-calm-text-tertiary mb-2">Materiales requeridos:</p>
        <div className="flex flex-wrap gap-2">
          {element.requiredMaterials.map((req) => {
            const mat = MATERIALS[req.materialId];
            const owned = getMaterialCount(req.materialId);
            const hasEnough = owned >= req.amount;

            return (
              <div
                key={req.materialId}
                className={`
                  flex items-center gap-2 px-2 py-1 rounded-md text-sm
                  ${hasEnough ? 'bg-accent-900/30 text-accent-400' : 'bg-semantic-error-bg text-semantic-error'}
                `}
              >
                <span>{TEXTURE_ICONS[mat?.texture || 'wood']}</span>
                <span>{mat?.name || req.materialId}</span>
                <span className="font-bold">{owned}/{req.amount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado */}
      <div className="mt-3 flex items-center gap-2">
        {!isUnlocked && (
          <span className="text-sm text-calm-text-muted">🔒 Elemento bloqueado</span>
        )}
        {isUnlocked && progress < 100 && (
          <span className="text-sm text-amber-400">🔧 En progreso ({progress}%)</span>
        )}
        {isUnlocked && progress === 100 && (
          <span className="text-sm text-accent-400">✅ Completado</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default BuilderInventory;
