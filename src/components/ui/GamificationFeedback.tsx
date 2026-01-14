"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackItem {
  id: number;
  type: "xp" | "coins" | "gems" | "level" | "material";
  amount: number;
  subtitle?: string;
}

const FEEDBACK_DURATION = 2000;

// Helper: Obtener estilo de feedback por tipo
function getFeedbackStyle(type: FeedbackItem["type"]) {
  const styles = {
    xp: {
      emoji: "⭐",
      color: "from-amber-500 to-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
    },
    coins: {
      emoji: "◈",
      color: "from-amber-600 to-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
    },
    gems: {
      emoji: "⬡",
      color: "from-sky-500 to-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      textColor: "text-sky-400",
    },
    level: {
      emoji: "🎉",
      color: "from-accent-500 to-accent-500",
      bgColor: "bg-accent-500/10",
      borderColor: "border-accent-500/30",
      textColor: "text-accent-400",
    },
    material: {
      emoji: "🧱",
      color: "from-sky-500 to-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      textColor: "text-sky-400",
    },
  };

  return styles[type] || {
    emoji: "✨",
    color: "from-calm-text-tertiary to-calm-warm-400",
    bgColor: "bg-calm-bg-primary0/10",
    borderColor: "border-calm-warm-300/30",
    textColor: "text-calm-text-muted",
  };
}

// Helper: Obtener texto de cantidad
function getAmountText(feedback: FeedbackItem): string {
  if (feedback.type === "level") {
    return `¡Nivel ${feedback.amount}!`;
  }
  
  if (feedback.type === "material") {
    return `+${feedback.amount} materiales`;
  }
  
  return `+${feedback.amount}`;
}

// Helper: Crear removedor de feedback
function createFeedbackRemover(
  id: number,
  setFeedbacks: React.Dispatch<React.SetStateAction<FeedbackItem[]>>
) {
  return () => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };
}

// Helper: Crear controlador de evento XP
function createXPHandler(addFeedback: (type: FeedbackItem["type"], amount: number, subtitle?: string) => void) {
  return (event: Event) => {
    const customEvent = event as CustomEvent<{ amount: number; isSurge?: boolean }>;
    const { amount, isSurge } = customEvent.detail;
    addFeedback("xp", amount, isSurge ? "¡SURGE CRÍTICO!" : undefined);
  };
}

// Helper: Crear controlador de evento level up
function createLevelUpHandler(addFeedback: (type: FeedbackItem["type"], amount: number, subtitle?: string) => void) {
  return (event: Event) => {
    const customEvent = event as CustomEvent<{ newLevel: number }>;
    addFeedback("level", customEvent.detail.newLevel, `¡Nivel ${customEvent.detail.newLevel}!`);
  };
}

// Helper: Crear controlador de evento coins
function createCoinsHandler(addFeedback: (type: FeedbackItem["type"], amount: number, subtitle?: string) => void) {
  return (event: Event) => {
    const customEvent = event as CustomEvent<{ amount: number }>;
    addFeedback("coins", customEvent.detail.amount);
  };
}

// Helper: Crear controlador de evento materials
function createMaterialsHandler(addFeedback: (type: FeedbackItem["type"], amount: number, subtitle?: string) => void) {
  return (event: Event) => {
    const customEvent = event as CustomEvent<Record<string, number>>;
    const materials = customEvent.detail;
    const totalMaterials = Object.values(materials).reduce((sum, amount) => sum + amount, 0);
    
    if (totalMaterials > 0) {
      addFeedback("material", totalMaterials, "Materiales");
    }
  };
}

// Helper: Renderizar emoji animado
function renderAnimatedEmoji(style: ReturnType<typeof getFeedbackStyle>) {
  return (
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
  );
}

// Helper: Renderizar barra de progreso
function renderProgressBar(style: ReturnType<typeof getFeedbackStyle>) {
  return (
    <motion.div
      className={`h-8 w-1 rounded-full bg-gradient-to-b ${style.color}`}
      initial={{ height: 0 }}
      animate={{ height: "100%" }}
      transition={{ duration: 0.3 }}
    />
  );
}

// Helper: Renderizar item de feedback
function renderFeedbackItem(feedback: FeedbackItem) {
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
        {renderAnimatedEmoji(style)}

        <div className="flex flex-col">
          <div className={`text-sm font-semibold ${style.textColor}`}>
            {getAmountText(feedback)}
          </div>
          {feedback.subtitle && (
            <div className="text-xs text-calm-text-muted">{feedback.subtitle}</div>
          )}
        </div>

        {renderProgressBar(style)}
      </div>
    </motion.div>
  );
}

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

  const addFeedback = useCallback((type: FeedbackItem["type"], amount: number, subtitle?: string) => {
    const id = Date.now() + Math.random();
    setFeedbacks((prev) => [...prev, { id, type, amount, subtitle }]);

    const removeFeedback = createFeedbackRemover(id, setFeedbacks);
    setTimeout(removeFeedback, FEEDBACK_DURATION);
  }, []);

  useEffect(() => {
    const handleXP = createXPHandler(addFeedback);
    const handleLevelUp = createLevelUpHandler(addFeedback);
    const handleCoins = createCoinsHandler(addFeedback);
    const handleMaterials = createMaterialsHandler(addFeedback);

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

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {feedbacks.map(renderFeedbackItem)}
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
