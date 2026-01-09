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
  // Palace option hidden - can be enabled later when feature is ready
  // {
  //   href: "/construction",
  //   icon: "🏰",
  //   label: "Palacio",
  //   ariaLabel: "Palacio de construcción",
  // },
  {
    href: "/decks",
    icon: "📚",
    label: "Deck",
    ariaLabel: "Mazo de tarjetas",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 h-nav z-50 safe-bottom"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-glass-surface backdrop-blur-aaa border-t border-white/20" />

      {/* Gradient glow at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lf-primary/50 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

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
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lf-accent
                  ${
                    isActive
                      ? "text-lf-accent"
                      : "text-lf-muted hover:text-lf-secondary"
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-x-3 inset-y-2 bg-lf-accent/20 rounded-xl backdrop-blur-sm"
                    layoutId="nav-active-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    aria-hidden="true"
                  />
                )}

                {/* Icon with glow */}
                <motion.div
                  className="relative z-10 mb-1"
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 blur-md bg-lf-accent/50 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <span className="relative text-xl">{item.icon}</span>
                </motion.div>

                {/* Label */}
                <span className="relative z-10 font-rajdhani text-xs font-semibold tracking-wide uppercase">
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
