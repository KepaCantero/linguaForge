"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface XPNotification {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export function FloatingXP() {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  useEffect(() => {
    const handleXP = (
      event: CustomEvent<{ amount: number; x?: number; y?: number }>
    ) => {
      const {
        amount,
        x = window.innerWidth / 2,
        y = window.innerHeight / 2,
      } = event.detail;

      const id = Date.now();
      setNotifications((prev) => [...prev, { id, amount, x, y }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 1500);
    };

    globalThis.addEventListener("xp-gained", handleXP as EventListener);
    return () =>
      globalThis.removeEventListener("xp-gained", handleXP as EventListener);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {notifications.map(({ id, amount, x, y }) => (
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
        ))}
      </AnimatePresence>
    </div>
  );
}

