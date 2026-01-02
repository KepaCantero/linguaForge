"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LinguaShard, GlyphFrame } from "@/components/ui";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useTreeProgressStore } from "@/store/useTreeProgressStore";

export default function Home() {
  const router = useRouter();
  const { xp } = useGamificationStore();
  const { getOverallProgress, initTreeProgress } = useTreeProgressStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initTreeProgress("fr-a1-topic-tree");
  }, [initTreeProgress]);

  // Calcular progress y resonance solo después de montar para evitar errores de hidratación
  const progress = isMounted
    ? getOverallProgress("fr-a1-topic-tree")
    : { completed: 0, total: 0 };
  const resonance =
    isMounted && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <div className="space-y-6 -mt-2">
      {/* Hero Section */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1
          className="font-rajdhani text-3xl font-bold text-transparent bg-clip-text bg-resonance-gradient mb-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          LinguaForge
        </motion.h1>
        <motion.p
          className="font-atkinson text-lf-muted text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Forja tu dominio del francés
        </motion.p>
      </motion.div>

      {/* Resonance Crystal */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <LinguaShard resonance={resonance} label="Francés A1" size="lg" />
      </motion.div>

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/tree">
          <GlyphFrame
            variant="accent"
            className="hover:shadow-resonance transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-rajdhani text-lg font-bold text-white mb-1">
                  Linguistic Lattice
                </h2>
                <p className="font-atkinson text-sm text-lf-muted">
                  Explora el árbol de tópicos A1
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lf-accent font-rajdhani font-bold">
                  {progress.completed}/{progress.total}
                </span>
                <motion.span
                  className="text-2xl"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ⬡
                </motion.span>
              </div>
            </div>
          </GlyphFrame>
        </Link>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlyphFrame variant="muted" animate={false}>
          <div className="text-center py-2">
            <span className="block text-lf-accent font-rajdhani text-xl font-bold">
              {xp}
            </span>
            <span className="block text-xs text-lf-muted font-atkinson">
              Resonance
            </span>
          </div>
        </GlyphFrame>

        <GlyphFrame variant="muted" animate={false}>
          <div className="text-center py-2">
            <span className="block text-lf-secondary font-rajdhani text-xl font-bold">
              11
            </span>
            <span className="block text-xs text-lf-muted font-atkinson">
              Branches
            </span>
          </div>
        </GlyphFrame>

        <GlyphFrame variant="muted" animate={false}>
          <div className="text-center py-2">
            <span className="block text-lf-primary font-rajdhani text-xl font-bold">
              33
            </span>
            <span className="block text-xs text-lf-muted font-atkinson">
              Glyphs
            </span>
          </div>
        </GlyphFrame>
      </motion.div>

      {/* Mastery Levels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlyphFrame title="Tongue Mastery">
          <div className="space-y-3">
            <MasteryLevel
              name="Novato"
              range="0-33%"
              isActive={resonance < 33}
              isCompleted={resonance >= 33}
            />
            <MasteryLevel
              name="Forjador"
              range="33-66%"
              isActive={resonance >= 33 && resonance < 66}
              isCompleted={resonance >= 66}
            />
            <MasteryLevel
              name="Maestro"
              range="66-100%"
              isActive={resonance >= 66}
              isCompleted={resonance >= 100}
            />
          </div>
        </GlyphFrame>
      </motion.div>

      {/* Enter Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() => router.push("/tree")}
          className="w-full py-4 bg-resonance-gradient text-white font-rajdhani font-bold text-lg rounded-glyph shadow-resonance hover:shadow-resonance-lg transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider"
        >
          Enter the Forge
        </button>
      </motion.div>
    </div>
  );
}

function MasteryLevel({
  name,
  range,
  isActive,
  isCompleted,
}: {
  name: string;
  range: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-glyph transition-all ${
        isActive
          ? "bg-lf-primary/20 border border-lf-primary/40"
          : isCompleted
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : "bg-lf-soft/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-sm ${
            isCompleted
              ? "bg-emerald-500"
              : isActive
              ? "bg-lf-accent animate-resonance-pulse"
              : "bg-lf-muted"
          }`}
        />
        <span
          className={`font-rajdhani font-semibold ${
            isActive
              ? "text-lf-accent"
              : isCompleted
              ? "text-emerald-400"
              : "text-lf-muted"
          }`}
        >
          {name}
        </span>
      </div>
      <span className="font-atkinson text-xs text-lf-muted">{range}</span>
    </div>
  );
}
