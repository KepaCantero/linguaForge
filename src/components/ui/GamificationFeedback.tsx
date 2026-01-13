"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackItem {
  id: number;
  type: "xp" | "coins" | "gems" | "level" | "material";
  amount: number;
  subtitle?: string; // Para level up, materials, etc
}

const FEEDBACK_DURATION = 2000;

/**
 * GamificationFeedback - Feedback visual inmediato
 *
 * Muestra animaciones satisfactorias cuando el usuario gana:
 * - XP (puntos de experiencia)
 * - Coins (monedas)
 * - Gems (gemas)
 * - Level up
 * - Materials (materiales de construcción)
 */
export function GamificationFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  // Añadir feedback con eliminación automática
  const addFeedback = useCallback((type: FeedbackItem["type"], amount: number, subtitle?: string) => {
    const id = Date.now() + Math.random();
    setFeedbacks((prev) => [...prev, { id, type, amount, subtitle }]);

    // Programar eliminación
    const removeFeedback = () => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    };
    setTimeout(removeFeedback, FEEDBACK_DURATION);
  }, []);

  useEffect(() => {
    // XP ganado
    const handleXP = (event: Event) => {
      const customEvent = event as CustomEvent<{ amount: number; isSurge?: boolean }>;
      const { amount, isSurge } = customEvent.detail;
      addFeedback("xp", amount, isSurge ? "¡SURGE CRÍTICO!" : undefined);
    };

    // Level up
    const handleLevelUp = (event: Event) => {
      const customEvent = event as CustomEvent<{ newLevel: number }>;
      addFeedback("level", customEvent.detail.newLevel, `¡Nivel ${customEvent.detail.newLevel}!`);
    };

    // Coins ganados
    const handleCoins = (event: Event) => {
      const customEvent = event as CustomEvent<{ amount: number }>;
      addFeedback("coins", customEvent.detail.amount);
    };

    // Materials ganados
    const handleMaterials = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, number>>;
      const materials = customEvent.detail;
      const totalMaterials = Object.values(materials).reduce((sum, amount) => sum + amount, 0);
      if (totalMaterials > 0) {
        addFeedback("material", totalMaterials, "Materiales");
      }
    };

    globalThis.addEventListener("xp-gained", handleXP as EventListener);
    globalThis.addEventListener("level-up", handleLevelUp as EventListener);
    globalThis.addEventListener("coins-gained", handleCoins as EventListener);
    globalThis.addEventListener("materials-gained", handleMaterials as EventListener);

    return () => {
      globalThis.removeEventListener("xp-gained", handleXP as EventListener);
      globalThis.removeEventListener("level-up", handleLevelUp as EventListener);
      globalThis.removeEventListener("coins-gained", handleCoins as EventListener);
      globalThis.removeEventListener("materials-gained", handleMaterials as EventListener);
    };
  }, [addFeedback]);

  const getFeedbackStyle = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "xp":
        return {
          emoji: "⭐",
          color: "from-amber-500 to-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-400",
        };
      case "coins":
        return {
          emoji: "◈",
          color: "from-amber-600 to-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-400",
        };
      case "gems":
        return {
          emoji: "⬡",
          color: "from-sky-500 to-sky-500",
          bgColor: "bg-sky-500/10",
          borderColor: "border-sky-500/30",
          textColor: "text-sky-400",
        };
      case "level":
        return {
          emoji: "🎉",
          color: "from-accent-500 to-accent-500",
          bgColor: "bg-accent-500/10",
          borderColor: "border-accent-500/30",
          textColor: "text-accent-400",
        };
      case "material":
        return {
          emoji: "🧱",
          color: "from-sky-500 to-sky-500",
          bgColor: "bg-sky-500/10",
          borderColor: "border-sky-500/30",
          textColor: "text-sky-400",
        };
      default:
        return {
          emoji: "✨",
          color: "from-calm-text-tertiary to-calm-warm-400",
          bgColor: "bg-calm-bg-primary0/10",
          borderColor: "border-calm-warm-300/30",
          textColor: "text-calm-text-muted",
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {feedbacks.map((feedback) => {
          const style = getFeedbackStyle(feedback.type);

          return (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`px-4 py-3 rounded-xl ${style.bgColor} ${style.borderColor} border shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3">
                {/* Emoji animado */}
                <motion.div
                  className="text-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    times: [0, 0.5, 0.75, 1],
                  }}
                >
                  {style.emoji}
                </motion.div>

                {/* Contenido */}
                <div className="flex flex-col">
                  <div className={`text-sm font-semibold ${style.textColor}`}>
                    {feedback.type === "level"
                      ? `¡Nivel ${feedback.amount}!`
                      : feedback.type === "material"
                      ? `+${feedback.amount} materiales`
                      : `+${feedback.amount}`}
                  </div>
                  {feedback.subtitle && (
                    <div className="text-xs text-calm-text-muted">{feedback.subtitle}</div>
                  )}
                </div>

                {/* Barra de progreso decorativa */}
                <motion.div
                  className={`h-8 w-1 rounded-full bg-gradient-to-b ${style.color}`}
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook para disparar feedback de gamificación
 */
export function useGamificationFeedback() {
  const triggerXP = (amount: number, isSurge = false) => {
    globalThis.dispatchEvent(
      new CustomEvent("xp-gained", { detail: { amount, isSurge } })
    );
  };

  const triggerCoins = (amount: number) => {
    globalThis.dispatchEvent(
      new CustomEvent("coins-gained", { detail: { amount } })
    );
  };

  const triggerMaterials = (materials: Record<string, number>) => {
    globalThis.dispatchEvent(
      new CustomEvent("materials-gained", { detail: materials })
    );
  };

  return { triggerXP, triggerCoins, triggerMaterials };
}
