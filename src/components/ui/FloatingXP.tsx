"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface XPNotification {
  id: number;
  amount: number;
  x: number;
  y: number;
}

const NOTIFICATION_DURATION = 1500;

// Helper: Crear removedor de notificación
function createNotificationRemover(
  id: number,
  setNotifications: React.Dispatch<React.SetStateAction<XPNotification[]>>
) {
  return () => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
}

// Helper: Obtener coordenadas por defecto
function getDefaultCoordinates(): { x: number; y: number } {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

// Helper: Crear controlador de evento XP
function createXPHandler(
  addNotification: (amount: number, x: number, y: number) => void
) {
  return (event: CustomEvent<{ amount: number; x?: number; y?: number }>) => {
    const { amount, x, y } = event.detail;
    const coords = x !== undefined && y !== undefined ? { x, y } : getDefaultCoordinates();
    addNotification(amount, coords.x, coords.y);
  };
}

// Helper: Renderizar notificación individual
function renderNotification({ id, amount, x, y }: XPNotification) {
  return (
    <motion.div
      key={id}
      className="absolute text-2xl font-bold text-amber-500 drop-shadow-lg"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -80, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      +{amount} XP
    </motion.div>
  );
}

export function FloatingXP() {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const addNotification = useCallback((amount: number, x: number, y: number) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, amount, x, y }]);

    const removeNotification = createNotificationRemover(id, setNotifications);
    setTimeout(removeNotification, NOTIFICATION_DURATION);
  }, []);

  useEffect(() => {
    const handleXP = createXPHandler(addNotification);

    globalThis.addEventListener("xp-gained", handleXP as EventListener);
    return () =>
      globalThis.removeEventListener("xp-gained", handleXP as EventListener);
  }, [addNotification]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {notifications.map(renderNotification)}
      </AnimatePresence>
    </div>
  );
}
