"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ResponsiveContainerProps {
  children: ReactNode;
  /** Ocupa toda la altura disponible */
  fullHeight?: boolean;
  /** Padding horizontal */
  padding?: "none" | "sm" | "md" | "lg";
  /** Ancho máximo en pantallas grandes */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Centrar contenido verticalmente */
  centerVertical?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Elemento HTML semántico */
  as?: "div" | "section" | "article" | "aside";
  /** Animación de entrada */
  animate?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "px-2 xs:px-3 sm:px-4",
  md: "px-3 xs:px-4 sm:px-6 lg:px-8",
  lg: "px-4 xs:px-6 sm:px-8 lg:px-12",
};

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

export function ResponsiveContainer({
  children,
  fullHeight = false,
  padding = "md",
  maxWidth = "full",
  centerVertical = false,
  className = "",
  as: Component = "div",
  animate = true,
}: ResponsiveContainerProps) {
  const baseClasses = `
    w-full mx-auto
    ${paddingClasses[padding]}
    ${maxWidth !== "full" ? `lg:${maxWidthClasses[maxWidth]}` : ""}
    ${fullHeight ? "min-h-content flex flex-col" : ""}
    ${centerVertical ? "justify-center" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return <Component className={baseClasses}>{children}</Component>;
}

