'use client';

/**
 * MaterialGallery - Galería visual de materiales 3D
 * Muestra materiales con preview 3D y detalles de PBR
 *
 * TAREA 2.8.9.7: UI de colección de elementos constructivos
 */

import { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  useConstructionStore,
  MATERIALS,
  type MaterialDefinition,
} from '@/store/useConstructionStore';
import { type MaterialRarity, type MaterialTexture } from '@/schemas/construction';
import { PBR_MATERIALS, createPBRMaterial } from '@/lib/materials/pbr';
import { useHaptic } from '@/lib/haptic';
import { useSoundEngine } from '@/lib/soundEngine';

// ============================================
// TIPOS
// ============================================

interface MaterialGalleryProps {
  onMaterialSelect?: (materialId: string) => void;
  filterRarity?: MaterialRarity[];
  filterTexture?: MaterialTexture[];
  showOnlyOwned?: boolean;
  compact?: boolean;
  className?: string;
}

interface Material3DPreviewProps {
  materialId: string;
  size?: number;
}

// ============================================
// CONSTANTES
// ============================================

const RARITY_CONFIG: Record<MaterialRarity, {
  label: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
}> = {
  common: {
    label: 'Común',
    color: '#9CA3AF',
    bgGradient: 'from-gray-800 to-gray-900',
    borderColor: 'border-gray-600',
    glowColor: '',
  },
  uncommon: {
    label: 'Poco Común',
    color: '#34D399',
    bgGradient: 'from-green-900/50 to-gray-900',
    borderColor: 'border-green-500/50',
    glowColor: 'shadow-green-500/20',
  },
  rare: {
    label: 'Raro',
    color: '#60A5FA',
    bgGradient: 'from-blue-900/50 to-gray-900',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
  },
  epic: {
    label: 'Épico',
    color: '#A78BFA',
    bgGradient: 'from-purple-900/50 to-gray-900',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/40',
  },
  legendary: {
    label: 'Legendario',
    color: '#FBBF24',
    bgGradient: 'from-yellow-900/50 to-gray-900',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/50',
  },
};

const TEXTURE_CONFIG: Record<MaterialTexture, {
  label: string;
  icon: string;
  description: string;
}> = {
  wood: { label: 'Madera', icon: '🪵', description: 'Material orgánico y cálido' },
  stone: { label: 'Piedra', icon: '🪨', description: 'Material sólido y duradero' },
  glass: { label: 'Vidrio', icon: '🔮', description: 'Material transparente y elegante' },
  metal: { label: 'Metal', icon: '⚙️', description: 'Material resistente y brillante' },
  crystal: { label: 'Cristal', icon: '💎', description: 'Material mágico y luminoso' },
};

// ============================================
// COMPONENTE: Material3DPreview
// ============================================

function Material3DMesh({ materialId }: { materialId: string }) {
  const pbrConfig = PBR_MATERIALS[materialId];

  // Crear material Three.js
  const material = useMemo(() => {
    if (pbrConfig) {
      return createPBRMaterial(pbrConfig);
    }
    // Fallback material
    return new THREE.MeshStandardMaterial({
      color: '#808080',
      roughness: 0.5,
      metalness: 0.5,
    });
  }, [pbrConfig]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.8, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
    </Float>
  );
}

export function Material3DPreview({ materialId, size = 120 }: Material3DPreviewProps) {
  return (
    <div
      className="bg-gray-900 rounded-lg overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={50} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[-3, 3, -3]} intensity={0.3} color="#B8D4E3" />
          <Material3DMesh materialId={materialId} />
          <Environment preset="studio" background={false} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ============================================
// COMPONENTE: MaterialCard (Galería)
// ============================================

interface GalleryCardProps {
  material: MaterialDefinition;
  amount: number;
  isSelected: boolean;
  compact: boolean;
  onClick: () => void;
}

function GalleryCard({ material, amount, isSelected, compact, onClick }: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = RARITY_CONFIG[material.rarity];
  const textureConfig = TEXTURE_CONFIG[material.texture];
  const haptic = useHaptic();
  const sound = useSoundEngine();

  const handleClick = () => {
    haptic.select();
    sound.playTextureSound(material.texture);
    onClick();
  };

  if (compact) {
    return (
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative p-2 rounded-lg border transition-all duration-200
          bg-gradient-to-br ${config.bgGradient} ${config.borderColor}
          ${isSelected ? `ring-2 ring-white ${config.glowColor} shadow-lg` : ''}
          ${amount === 0 ? 'opacity-40' : ''}
        `}
      >
        <div className="text-2xl mb-1">{textureConfig.icon}</div>
        <p className="text-xs font-medium truncate" style={{ color: config.color }}>
          {material.name}
        </p>
        <div className="absolute top-1 right-1 bg-black/60 px-1 rounded text-xs font-bold">
          {amount}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative rounded-xl border-2 overflow-hidden transition-all duration-300
        bg-gradient-to-br ${config.bgGradient} ${config.borderColor}
        ${isSelected ? `ring-2 ring-offset-2 ring-offset-gray-900 ring-white ${config.glowColor} shadow-xl` : ''}
        ${amount === 0 ? 'opacity-50 grayscale' : 'hover:shadow-lg'}
      `}
    >
      {/* Preview 3D */}
      <div className="relative">
        <Material3DPreview materialId={material.id} size={140} />

        {/* Overlay con cantidad */}
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md">
          <span className="text-sm font-bold text-white">{amount}</span>
        </div>

        {/* Badge de rareza */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {config.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{textureConfig.icon}</span>
          <h3 className="font-semibold text-white truncate">{material.name}</h3>
        </div>

        <p className="text-xs text-gray-400 mb-2">{textureConfig.label}</p>

        {/* Valores */}
        <div className="flex justify-between text-xs">
          <span className="text-indigo-400">
            <span className="text-gray-500">XP:</span> {material.xpCost}
          </span>
          <span className="text-yellow-400">
            <span className="text-gray-500">Coins:</span> {material.coinCost}
          </span>
        </div>
      </div>

      {/* Efecto de brillo para legendarios */}
      {material.rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 40%, rgba(251,191,36,0.1) 50%, transparent 60%)',
              'linear-gradient(45deg, transparent 60%, rgba(251,191,36,0.1) 70%, transparent 80%)',
              'linear-gradient(45deg, transparent 40%, rgba(251,191,36,0.1) 50%, transparent 60%)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Tooltip en hover */}
      <AnimatePresence>
        {isHovered && !compact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-10
                       bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-gray-300
                       shadow-xl min-w-[150px]"
          >
            {textureConfig.description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ============================================
// COMPONENTE: FilterTabs
// ============================================

interface FilterTabsProps {
  activeTexture: MaterialTexture | 'all';
  onTextureChange: (texture: MaterialTexture | 'all') => void;
}

function FilterTabs({ activeTexture, onTextureChange }: FilterTabsProps) {
  const textures: (MaterialTexture | 'all')[] = ['all', 'wood', 'stone', 'glass', 'metal', 'crystal'];

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {textures.map((texture) => {
        const isActive = activeTexture === texture;
        const config = texture !== 'all' ? TEXTURE_CONFIG[texture] : null;

        return (
          <button
            key={texture}
            onClick={() => onTextureChange(texture)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              whitespace-nowrap transition-colors
              ${isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
          >
            {config ? (
              <>
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </>
            ) : (
              <span>Todos</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// COMPONENTE: CollectionProgress
// ============================================

function CollectionProgress() {
  const inventory = useConstructionStore((s) => s.materialInventory);

  const stats = useMemo(() => {
    const total = Object.keys(MATERIALS).length;
    const owned = Object.entries(inventory).filter(([, amount]) => amount > 0).length;
    const byRarity: Record<MaterialRarity, { owned: number; total: number }> = {
      common: { owned: 0, total: 0 },
      uncommon: { owned: 0, total: 0 },
      rare: { owned: 0, total: 0 },
      epic: { owned: 0, total: 0 },
      legendary: { owned: 0, total: 0 },
    };

    Object.values(MATERIALS).forEach((mat) => {
      byRarity[mat.rarity].total++;
      if (inventory[mat.id] > 0) {
        byRarity[mat.rarity].owned++;
      }
    });

    return { total, owned, byRarity };
  }, [inventory]);

  const percentage = Math.round((stats.owned / stats.total) * 100);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Progreso de Colección</h3>
        <span className="text-sm text-gray-400">
          {stats.owned}/{stats.total} ({percentage}%)
        </span>
      </div>

      {/* Barra de progreso general */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Progreso por rareza */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(stats.byRarity) as [MaterialRarity, { owned: number; total: number }][]).map(
          ([rarity, data]) => {
            const config = RARITY_CONFIG[rarity];

            return (
              <div key={rarity} className="text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${config.color}30`, color: config.color }}
                >
                  {data.owned}
                </div>
                <p className="text-[10px] text-gray-500 truncate">{config.label}</p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: MaterialGallery
// ============================================

export function MaterialGallery({
  onMaterialSelect,
  filterRarity,
  filterTexture,
  showOnlyOwned = false,
  compact = false,
  className = '',
}: MaterialGalleryProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [activeTexture, setActiveTexture] = useState<MaterialTexture | 'all'>('all');

  const inventory = useConstructionStore((s) => s.materialInventory);

  // Filtrar materiales
  const filteredMaterials = useMemo(() => {
    let materials = Object.values(MATERIALS);

    // Filtrar por textura
    if (activeTexture !== 'all') {
      materials = materials.filter((m) => m.texture === activeTexture);
    }

    // Filtrar por rareza (prop)
    if (filterRarity && filterRarity.length > 0) {
      materials = materials.filter((m) => filterRarity.includes(m.rarity));
    }

    // Filtrar por textura (prop)
    if (filterTexture && filterTexture.length > 0) {
      materials = materials.filter((m) => filterTexture.includes(m.texture));
    }

    // Mostrar solo poseídos
    if (showOnlyOwned) {
      materials = materials.filter((m) => (inventory[m.id] || 0) > 0);
    }

    // Ordenar por rareza (legendarios primero) y luego por nombre
    const rarityOrder: MaterialRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    materials.sort((a, b) => {
      const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });

    return materials;
  }, [activeTexture, filterRarity, filterTexture, showOnlyOwned, inventory]);

  const handleMaterialClick = (materialId: string) => {
    setSelectedMaterial(materialId === selectedMaterial ? null : materialId);
    onMaterialSelect?.(materialId);
  };

  return (
    <div className={`${className}`}>
      {/* Progreso de colección */}
      {!compact && <CollectionProgress />}

      {/* Filtros */}
      <FilterTabs activeTexture={activeTexture} onTextureChange={setActiveTexture} />

      {/* Grid de materiales */}
      <div
        className={`
          grid gap-3 mt-4
          ${compact
            ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          }
        `}
      >
        {filteredMaterials.map((material) => (
          <GalleryCard
            key={material.id}
            material={material}
            amount={inventory[material.id] || 0}
            isSelected={selectedMaterial === material.id}
            compact={compact}
            onClick={() => handleMaterialClick(material.id)}
          />
        ))}
      </div>

      {/* Mensaje si no hay materiales */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📦</p>
          <p>No hay materiales que mostrar</p>
          {showOnlyOwned && (
            <p className="text-sm mt-1">Completa temas para ganar materiales</p>
          )}
        </div>
      )}

      {/* Panel de detalle */}
      <AnimatePresence>
        {selectedMaterial && !compact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700"
          >
            <MaterialDetailPanel materialId={selectedMaterial} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// COMPONENTE: MaterialDetailPanel
// ============================================

function MaterialDetailPanel({ materialId }: { materialId: string }) {
  const material = MATERIALS[materialId];
  const pbrConfig = PBR_MATERIALS[materialId];
  const amount = useConstructionStore((s) => s.materialInventory[materialId] || 0);

  if (!material) return null;

  const config = RARITY_CONFIG[material.rarity];
  const textureConfig = TEXTURE_CONFIG[material.texture];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Preview 3D grande */}
      <div className="flex-shrink-0">
        <Material3DPreview materialId={materialId} size={200} />
      </div>

      {/* Información */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{textureConfig.icon}</span>
              <h2 className="text-xl font-bold text-white">{material.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-sm text-gray-400">{textureConfig.label}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{amount}</p>
            <p className="text-xs text-gray-500">en inventario</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">{textureConfig.description}</p>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Valor XP</p>
            <p className="text-lg font-bold text-indigo-400">{material.xpCost}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Valor Coins</p>
            <p className="text-lg font-bold text-yellow-400">{material.coinCost}</p>
          </div>
        </div>

        {/* Propiedades PBR */}
        {pbrConfig && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Propiedades PBR</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Rugosidad</p>
                <div className="h-1 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${pbrConfig.properties.roughness * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-500">Metalizado</p>
                <div className="h-1 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${pbrConfig.properties.metalness * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-500">Transmisión</p>
                <div className="h-1 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${pbrConfig.properties.transmission * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Variantes disponibles */}
        {pbrConfig && pbrConfig.variants.length > 0 && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Variantes</h4>
            <div className="flex gap-2">
              {pbrConfig.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                  style={{ backgroundColor: variant.colorModifier }}
                  title={variant.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default MaterialGallery;
