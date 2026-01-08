'use client';

/**
 * Construction3D - Componente de visualización 3D del sistema de construcción
 * Renderiza elementos constructivos con materiales PBR y animaciones
 *
 * TAREA 2.8.9.3: Construction3D Component con Three.js
 */

import { useRef, useState, useCallback, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Float,
  MeshReflectorMaterial,
} from '@react-three/drei';
import * as THREE from 'three';
import { type BuildingElementType, type MaterialTexture } from '@/schemas/construction';
import { useHaptic } from '@/lib/haptic';
import { useSoundEngine } from '@/lib/soundEngine';

// ============================================
// TIPOS
// ============================================

export interface Construction3DElement {
  id: string;
  type: BuildingElementType;
  material: MaterialTexture;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  isNew?: boolean;
  isSelected?: boolean;
}

export interface Construction3DProps {
  elements: Construction3DElement[];
  onElementClick?: (elementId: string) => void;
  onElementHover?: (elementId: string | null) => void;
  showGrid?: boolean;
  showEnvironment?: boolean;
  cameraPosition?: [number, number, number];
  autoRotate?: boolean;
  className?: string;
}

// ============================================
// CONSTANTES DE MATERIALES PBR
// ============================================

const MATERIAL_PROPERTIES: Record<MaterialTexture, {
  roughness: number;
  metalness: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}> = {
  wood: { roughness: 0.8, metalness: 0, color: '#8B7355' },
  stone: { roughness: 0.9, metalness: 0, color: '#808080' },
  glass: { roughness: 0.1, metalness: 0.1, color: '#E0F0FF' },
  metal: { roughness: 0.3, metalness: 0.9, color: '#C0C0C0' },
  crystal: { roughness: 0.05, metalness: 0.2, color: '#9B59B6', emissive: '#4A1A6B', emissiveIntensity: 0.3 },
};

// ============================================
// GEOMETRÍAS POR TIPO DE ELEMENTO
// ============================================

const ELEMENT_GEOMETRIES: Record<BuildingElementType, {
  type: 'box' | 'cylinder' | 'cone' | 'sphere' | 'torus';
  args: number[];
}> = {
  foundation: { type: 'box', args: [2, 0.3, 2] },
  wall: { type: 'box', args: [2, 1.5, 0.2] },
  pillar: { type: 'cylinder', args: [0.15, 0.15, 2, 16] },
  roof: { type: 'cone', args: [1.5, 0.8, 4] },
  tower: { type: 'cylinder', args: [0.4, 0.3, 3, 8] },
  garden: { type: 'box', args: [1.5, 0.1, 1.5] },
  bridge: { type: 'box', args: [3, 0.2, 0.8] },
  fountain: { type: 'torus', args: [0.5, 0.15, 16, 32] },
  statue: { type: 'box', args: [0.4, 1.2, 0.4] },
  gate: { type: 'box', args: [1.5, 2, 0.3] },
  window: { type: 'box', args: [0.6, 0.8, 0.05] },
  door: { type: 'box', args: [0.8, 1.5, 0.1] },
  stair: { type: 'box', args: [1, 0.8, 0.5] },
  balcony: { type: 'box', args: [1.2, 0.1, 0.6] },
  dome: { type: 'sphere', args: [0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2] },
};

// ============================================
// COMPONENTE: BuildingElement3D
// ============================================

interface BuildingElement3DProps {
  element: Construction3DElement;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
}

function BuildingElement3D({ element, onClick, onHover }: BuildingElement3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const haptic = useHaptic();
  const sound = useSoundEngine();

  // Animación de aparición para elementos nuevos
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (element.isNew) {
      // Animación de escala de entrada
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, element.scale[0], delta * 3);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, element.scale[1], delta * 3);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, element.scale[2], delta * 3);
    }

    // Efecto de hover
    if (hovered || element.isSelected) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        element.position[1] + 0.1,
        delta * 5
      );
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        element.position[1],
        delta * 5
      );
    }
  });

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    onHover?.(true);
    haptic.tap();
    document.body.style.cursor = 'pointer';
  }, [onHover, haptic]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback(() => {
    onClick?.();
    haptic.select();
    sound.playTextureSound(element.material);
  }, [onClick, haptic, sound, element.material]);

  // Obtener propiedades del material
  const materialProps = MATERIAL_PROPERTIES[element.material];
  const geometry = ELEMENT_GEOMETRIES[element.type];

  // Color con highlight si está seleccionado o hover
  const displayColor = useMemo(() => {
    if (element.isSelected) return '#FFD700';
    if (hovered) return new THREE.Color(element.color).offsetHSL(0, 0, 0.2).getHexString();
    return element.color || materialProps.color;
  }, [element.isSelected, element.color, hovered, materialProps.color]);

  // Renderizar geometría según tipo
  const renderGeometry = () => {
    switch (geometry.type) {
      case 'box':
        return <boxGeometry args={geometry.args as [number, number, number]} />;
      case 'cylinder':
        return <cylinderGeometry args={geometry.args as [number, number, number, number]} />;
      case 'cone':
        return <coneGeometry args={geometry.args as [number, number, number]} />;
      case 'sphere':
        return <sphereGeometry args={geometry.args as [number, number, number, number, number, number, number]} />;
      case 'torus':
        return <torusGeometry args={geometry.args as [number, number, number, number]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={element.position}
      rotation={element.rotation.map(r => r * Math.PI / 180) as [number, number, number]}
      scale={element.isNew ? [0.01, 0.01, 0.01] : element.scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      <meshStandardMaterial
        color={displayColor}
        roughness={materialProps.roughness}
        metalness={materialProps.metalness}
        emissive={materialProps.emissive || '#000000'}
        emissiveIntensity={materialProps.emissiveIntensity || 0}
        transparent={element.material === 'glass'}
        opacity={element.material === 'glass' ? 0.6 : 1}
      />
    </mesh>
  );
}

// ============================================
// COMPONENTE: Ground
// ============================================

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#1a1a2e"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  );
}

// ============================================
// COMPONENTE: GridHelper
// ============================================

function GridHelper() {
  return (
    <gridHelper
      args={[20, 20, '#2a2a4a', '#1a1a3a']}
      position={[0, 0.01, 0]}
    />
  );
}

// ============================================
// COMPONENTE: Scene
// ============================================

interface SceneProps {
  elements: Construction3DElement[];
  onElementClick?: (elementId: string) => void;
  onElementHover?: (elementId: string | null) => void;
  showGrid: boolean;
  autoRotate: boolean;
}

function Scene({ elements, onElementClick, onElementHover, showGrid, autoRotate }: SceneProps) {
  const controlsRef = useRef(null);

  return (
    <>
      {/* Cámara */}
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />

      {/* Controles */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      {/* Luces */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#B8D4E3" />

      {/* Suelo */}
      <Ground />

      {/* Grid */}
      {showGrid && <GridHelper />}

      {/* Elementos constructivos */}
      {elements.map((element) => (
        <BuildingElement3D
          key={element.id}
          element={element}
          onClick={() => onElementClick?.(element.id)}
          onHover={(isHovered) => onElementHover?.(isHovered ? element.id : null)}
        />
      ))}

      {/* Sombras de contacto */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4}
      />
    </>
  );
}

// ============================================
// COMPONENTE: LoadingFallback
// ============================================

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando escena 3D...</p>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: Construction3D
// ============================================

export function Construction3D({
  elements,
  onElementClick,
  onElementHover,
  showGrid = true,
  showEnvironment = true,
  autoRotate = false,
  className = '',
}: Construction3DProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full h-full min-h-[400px] bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={() => setIsLoaded(true)}
      >
        <Suspense fallback={null}>
          <Scene
            elements={elements}
            onElementClick={onElementClick}
            onElementHover={onElementHover}
            showGrid={showGrid}
            autoRotate={autoRotate}
          />
          {showEnvironment && (
            <Environment preset="city" background={false} />
          )}
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      {!isLoaded && <LoadingFallback />}

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        <p>Arrastra para rotar | Scroll para zoom</p>
      </div>

      {/* Contador de elementos */}
      <div className="absolute top-4 right-4 bg-gray-800/80 px-3 py-1.5 rounded-lg">
        <span className="text-gray-400 text-sm">{elements.length} elementos</span>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Construction3DPreview
// ============================================

export interface Construction3DPreviewProps {
  element: Construction3DElement;
  size?: number;
  className?: string;
}

export function Construction3DPreview({
  element,
  size = 150,
  className = '',
}: Construction3DPreviewProps) {
  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [2, 2, 2], fov: 50 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <BuildingElement3D
              element={{
                ...element,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
              }}
            />
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ============================================
// EXPORTACIONES
// ============================================

export default Construction3D;
