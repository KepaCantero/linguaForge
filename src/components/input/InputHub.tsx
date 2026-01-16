'use client';

import { motion } from 'framer-motion';
import { InputCard, type InputCardData } from './InputCard';
import { useInputHubStats } from '@/app/input/hooks/useInputHubStats';
import { INPUT_COLORS } from '@/lib/constants';

// ============================================================
// TYPES
// ============================================================

export interface InputHubProps {
  shouldAnimate?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const INPUT_CARDS: Omit<InputCardData, 'stats'>[] = [
  {
    id: 'text',
    type: 'text',
    title: 'Texto',
    description: 'Pega texto para analizar, escuchar con TTS premium y estudiar en bloques',
    icon: '📝',
    href: '/input/text',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    color: '#10B981',
  },
  {
    id: 'video',
    type: 'video',
    title: 'Video',
    description: 'Importa videos de YouTube con transcripción y controles premium',
    icon: '🎬',
    href: '/input/video',
    gradient: 'from-sky-500/20 to-sky-600/10',
    color: '#0EA5E9',
  },
  {
    id: 'audio',
    type: 'audio',
    title: 'Audio',
    description: 'Sube archivos de audio para transcribir y estudiar fragmentos',
    icon: '🎧',
    href: '/input/audio',
    gradient: 'from-amber-500/20 to-amber-600/10',
    color: '#F59E0B',
  },
];

// AAA Typography configuration
const AAA_TYPOGRAPHY = {
  fontFamily: 'Quicksand, Inter, system-ui, sans-serif',
  headingSize: 'text-3xl md:text-4xl lg:text-5xl',
  subheadingSize: 'text-base md:text-lg',
  textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)',
};

// AAA Spring physics for premium animations
const AAA_SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 20,
  mass: 0.5,
};

// ============================================================
// COMPONENT
// ============================================================

/**
 * InputHub - Premium AAA UI hub with improved accessibility and animations
 *
 * Features:
 * - Quicksand/Inter typography for premium feel
 * - Framer Motion spring physics for smooth transitions
 * - WCAG AAA compliant color contrasts
 * - Reduced motion support
 * - Immediate visual feedback
 */
export function InputHub({ shouldAnimate = true }: InputHubProps) {
  const stats = useInputHubStats();

  // Enrich cards with stats
  const cards: InputCardData[] = INPUT_CARDS.map((card) => {
    switch (card.id) {
      case 'text':
        return {
          ...card,
          stats: [
            { label: 'Importados', value: stats.textCount },
            { label: 'Palabras', value: stats.wordsRead.toLocaleString() },
          ],
          status: stats.textCount > 0 ? 'ready' : 'empty',
        };
      case 'video':
        return {
          ...card,
          stats: [
            { label: 'Vistos', value: stats.videoViews },
            { label: 'Horas', value: stats.videoHours },
          ],
          status: stats.videoViews > 0 ? 'ready' : 'empty',
        };
      case 'audio':
        return {
          ...card,
          stats: [
            { label: 'Escuchados', value: stats.audioCount },
            { label: 'Horas', value: stats.audioHours },
          ],
          status: stats.audioCount > 0 ? 'ready' : 'empty',
        };
      default:
        return { ...card, stats: [], status: 'empty' as const };
    }
  });

  return (
    <section 
      className="w-full space-y-8"
      aria-label="Hub de entrada - Selecciona tipo de contenido"
    >
      {/* Header with AAA typography and animations */}
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={AAA_SPRING_CONFIG}
        className="text-center space-y-2"
      >
        <h1 
          className={`${AAA_TYPOGRAPHY.headingSize} font-bold text-white`}
          style={{
            fontFamily: AAA_TYPOGRAPHY.fontFamily,
            textShadow: AAA_TYPOGRAPHY.textShadow,
          }}
        >
          Importar Contenido
        </h1>
        <p 
          className={`${AAA_TYPOGRAPHY.subheadingSize} text-calm-text-muted`}
          style={{
            fontFamily: AAA_TYPOGRAPHY.fontFamily,
          }}
        >
          Elige cómo quieres agregar nuevo material para estudiar
        </p>
      </motion.div>

      {/* Grid de Cards - Layout principal with enhanced animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ...AAA_SPRING_CONFIG,
              delay: shouldAnimate ? index * 0.1 : 0,
            }}
            whileHover={shouldAnimate ? { scale: 1.02 } : undefined}
            whileTap={shouldAnimate ? { scale: 0.98 } : undefined}
            style={{
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
          >
            <InputCard
              data={card}
              index={index}
              shouldAnimate={shouldAnimate}
            />
          </motion.div>
        ))}
      </div>

      {/* Orbital Animation Accent - Decorativo, no funcional */}
      <div className="relative h-32 flex items-center justify-center overflow-hidden pointer-events-none">
        <OrbitalAccent shouldAnimate={shouldAnimate} />
      </div>
    </section>
  );
}

// ============================================================
// SUBCOMPONENT: OrbitalAccent
// ============================================================

interface OrbitalAccentProps {
  shouldAnimate: boolean;
}

/**
 * OrbitalAccent - Premium orbital animation with reduced motion support
 *
 * Features:
 * - Smooth spring-based animations
 * - CPU-friendly reduced motion mode
 * - Subtle particle effects
 */
function OrbitalAccent({ shouldAnimate }: OrbitalAccentProps) {
  // Get orbital colors from centralized constants
  const orbitalColors = [
    INPUT_COLORS.text.borderColor.replace('border-', '').replace('/30', '/10'),
    INPUT_COLORS.video.borderColor.replace('border-', '').replace('/30', '/10'),
    INPUT_COLORS.audio.borderColor.replace('border-', '').replace('/30', '/10'),
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Curvas orbitales decorativas (arcos, no círculos completos) */}
      {shouldAnimate && (
        <>
          {/* Arco izquierdo */}
          <motion.div
            className={`absolute w-48 h-48 rounded-full border-2 ${orbitalColors[0]}`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
              willChange: 'transform',
            }}
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Arco derecho */}
          <motion.div
            className={`absolute w-48 h-48 rounded-full border-2 ${orbitalColors[1]}`}
            style={{
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
              willChange: 'transform',
            }}
            animate={{
              rotate: [0, -15, 15, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Arco superior */}
          <motion.div
            className={`absolute w-56 h-56 rounded-full border-2 ${orbitalColors[2]}`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 30%)',
              willChange: 'transform',
            }}
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Partículas flotantes - movimiento orgánico */}
      {shouldAnimate && [0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 60 + (i % 3) * 20;
        // Use centralized colors for particles
        const particleColors = [
          INPUT_COLORS.text.hex,
          INPUT_COLORS.video.hex,
          INPUT_COLORS.audio.hex,
        ];
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: particleColors[i % 3],
              willChange: 'transform, opacity',
            }}
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI / 4) * radius * 1.2],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI / 4) * radius * 1.2],
              scale: [1, 0.6, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        );
      })}

      {/* Centro decorativo sutil */}
      {shouldAnimate && (
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-accent-500/20 to-sky-500/10 border border-accent-500/20"
          style={{
            willChange: 'transform, opacity',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

export default InputHub;
