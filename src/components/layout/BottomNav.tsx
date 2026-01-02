"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  {
    href: "/tree",
    icon: "⬡",
    label: "Lattice",
    ariaLabel: "Árbol de aprendizaje",
  },
  {
    href: "/input",
    icon: "◎",
    label: "Echo",
    ariaLabel: "Contenido de escucha",
  },
  {
    href: "/dashboard",
    icon: "◈",
    label: "Forge",
    ariaLabel: "Panel de progreso",
  },
  {
    href: "/profile",
    icon: "⬢",
    label: "Glyph",
    ariaLabel: "Perfil de usuario",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 h-nav bg-lf-soft border-t border-lf-primary/20 z-50 safe-bottom"
    >
      <ul className="h-full w-full flex items-center justify-around lg:container lg:mx-auto list-none">
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
                  transition-all duration-200 
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lf-accent
                  ${
                    isActive
                      ? "text-lf-accent"
                      : "text-lf-muted hover:text-lf-secondary"
                  }
                `}
              >
                {/* Fondo activo animado */}
                {isActive && (
                  <motion.div
                    className="absolute inset-x-2 inset-y-1 bg-lf-accent/10 rounded-xl"
                    layoutId="nav-active-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    aria-hidden="true"
                  />
                )}

                <motion.span
                  className="relative z-10 text-xl mb-0.5"
                  aria-hidden="true"
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.span>
                <span className="relative z-10 font-rajdhani text-xs font-medium tracking-wide uppercase">
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
