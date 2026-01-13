"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  {
    href: "/dashboard",
    icon: "📊",
    label: "Dashboard",
    ariaLabel: "Panel de control",
  },
  {
    href: "/learn",
    icon: "⬡",
    label: "Mapa",
    ariaLabel: "Mapa de aprendizaje",
  },
  {
    href: "/missions",
    icon: "⚔️",
    label: "Misiones",
    ariaLabel: "Misiones diarias",
  },
  {
    href: "/decks",
    icon: "📚",
    label: "Deck",
    ariaLabel: "Mazo de tarjetas",
  },
];

/**
 * CALM Bottom Navigation - Gentle, unobtrusive
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 h-nav z-50 safe-bottom"
    >
      {/* Calm backdrop */}
      <div className="absolute inset-0 bg-calm-bg-elevated/95 backdrop-blur-calm border-t border-calm-warm-200 shadow-calm-md" />

      <ul className="relative h-full w-full flex items-center justify-around lg:container lg:mx-auto list-none">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <li key={item.href} className="flex-1 h-full">
              <Link
                href={item.href}
                aria-label={item.ariaLabel}
                aria-current={isActive ? "page" : undefined}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full
                  transition-colors duration-300
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-calm-sage-400
                  ${
                    isActive
                      ? "text-calm-sage-500"
                      : "text-calm-text-tertiary hover:text-calm-text-secondary"
                  }
                `}
              >
                {/* Active indicator - subtle sage background */}
                {isActive && (
                  <motion.div
                    className="absolute inset-x-3 inset-y-2 bg-calm-sage-50 rounded-xl"
                    layoutId="nav-active-indicator"
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 25
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 mb-1"
                  whileTap={{ opacity: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xl">{item.icon}</span>
                </motion.div>

                {/* Label */}
                <span className={`
                  relative z-10 font-quicksand text-xs font-medium tracking-wide
                  ${isActive ? "text-calm-sage-600" : ""}
                `}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
