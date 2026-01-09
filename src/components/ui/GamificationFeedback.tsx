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

  // Añadir feedback
  const addFeedback = useCallback((type: FeedbackItem["type"], amount: number, subtitle?: string) => {
    const id = Date.now() + Math.random();
    setFeedbacks((prev) => [...prev, { id, type, amount, subtitle }]);

    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, FEEDBACK_DURATION);
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

    window.addEventListener("xp-gained", handleXP as EventListener);
    window.addEventListener("level-up", handleLevelUp as EventListener);
    window.addEventListener("coins-gained", handleCoins as EventListener);
    window.addEventListener("materials-gained", handleMaterials as EventListener);

    return () => {
      window.removeEventListener("xp-gained", handleXP as EventListener);
      window.removeEventListener("level-up", handleLevelUp as EventListener);
      window.removeEventListener("coins-gained", handleCoins as EventListener);
      window.removeEventListener("materials-gained", handleMaterials as EventListener);
    };
  }, [addFeedback]);

  const getFeedbackStyle = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "xp":
        return {
          emoji: "⭐",
          color: "from-amber-500 to-yellow-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-400",
        };
      case "coins":
        return {
          emoji: "◈",
          color: "from-yellow-600 to-yellow-400",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          textColor: "text-yellow-400",
        };
      case "gems":
        return {
          emoji: "⬡",
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/30",
          textColor: "text-purple-400",
        };
      case "level":
        return {
          emoji: "🎉",
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          textColor: "text-green-400",
        };
      case "material":
        return {
          emoji: "🧱",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
        };
      default:
        return {
          emoji: "✨",
          color: "from-gray-500 to-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          textColor: "text-gray-400",
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
                    <div className="text-xs text-gray-400">{feedback.subtitle}</div>
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
    window.dispatchEvent(
      new CustomEvent("xp-gained", { detail: { amount, isSurge } })
    );
  };

  const triggerCoins = (amount: number) => {
    window.dispatchEvent(
      new CustomEvent("coins-gained", { detail: { amount } })
    );
  };

  const triggerMaterials = (materials: Record<string, number>) => {
    window.dispatchEvent(
      new CustomEvent("materials-gained", { detail: materials })
    );
  };

  return { triggerXP, triggerCoins, triggerMaterials };
}
