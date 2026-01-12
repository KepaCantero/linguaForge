"use client";

import { useState, useEffect } from "react";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const breakpoints: Record<Breakpoint, number> = {
  xs: 320,
  sm: 375,
  md: 428,
  lg: 768,
  xl: 1024,
  "2xl": 1280,
  "3xl": 1536,
};

interface UseResponsiveReturn {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1024px
  isDesktop: boolean; // > 1024px
  isTouch: boolean; // Dispositivo táctil
  orientation: "portrait" | "landscape";
  isAtLeast: (bp: Breakpoint) => boolean;
  isAtMost: (bp: Breakpoint) => boolean;
}

export function useResponsive(): UseResponsiveReturn {
  const [state, setState] = useState<UseResponsiveReturn>({
    width: typeof window !== "undefined" ? window.innerWidth : 375,
    height: typeof window !== "undefined" ? window.innerHeight : 667,
    breakpoint: "sm",
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    orientation: "portrait",
    isAtLeast: () => false,
    isAtMost: () => true,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determinar breakpoint actual
      let currentBreakpoint: Breakpoint = "xs";
      for (const [bp, minWidth] of Object.entries(breakpoints) as [
        Breakpoint,
        number
      ][]) {
        if (width >= minWidth) {
          currentBreakpoint = bp;
        }
      }

      // Detectar si es táctil
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      setState({
        width,
        height,
        breakpoint: currentBreakpoint,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouch,
        orientation: width > height ? "landscape" : "portrait",
        isAtLeast: (bp: Breakpoint) => width >= breakpoints[bp],
        isAtMost: (bp: Breakpoint) => width <= breakpoints[bp],
      });
    };

    updateState();
    globalThis.addEventListener("resize", updateState);
    globalThis.addEventListener("orientationchange", updateState);

    return () => {
      globalThis.removeEventListener("resize", updateState);
      globalThis.removeEventListener("orientationchange", updateState);
    };
  }, []);

  return state;
}

