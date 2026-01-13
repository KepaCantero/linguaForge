"use client";

import { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { motion, AnimatePresence } from "framer-motion";

interface ParticlesSurgeProps {
  active: boolean;
  type?: "surge" | "level-up" | "rank-up";
  onComplete?: () => void;
}

/**
 * Componente de partículas para efectos de gamificación
 * Usado para "Wordweave Surge", Level Up, Rank Up, etc.
 */
export function ParticlesSurge({
  active,
  type = "surge",
  onComplete,
}: ParticlesSurgeProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options: ISourceOptions = useMemo(() => {
    const baseConfig: ISourceOptions = {
      particles: {
        number: {
          value: type === "rank-up" ? 100 : 50,
        },
        color: {
          value:
            type === "surge"
              ? "#F59E0B"
              : type === "level-up"
              ? "var(--accent-500)"
              : "#8B5CF6",
        },
        shape: {
          type: ["circle", "triangle", "star"],
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        size: {
          value: { min: 2, max: 8 },
          animation: {
            enable: true,
            speed: 2,
            sync: false,
          },
        },
        move: {
          enable: true,
          speed: { min: 1, max: 3 },
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
          attract: {
            enable: false,
          },
        },
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          push: {
            quantity: 4,
          },
        },
      },
      detectRetina: true,
    };

    // Configuración específica para "surge crítico"
    if (type === "surge") {
      baseConfig.particles!.shape = {
        type: ["star", "triangle"],
      };
      baseConfig.particles!.color = {
        value: ["#F59E0B", "#EF4444", "#F97316"],
      };
    }

    return baseConfig;
  }, [type]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            setTimeout(() => {
              onComplete?.();
            }, 2000);
          }}
        >
          <Particles
            id="surge-particles"
            options={options}
            className="w-full h-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
