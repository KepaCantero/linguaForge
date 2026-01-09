'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Hook to monitor FPS and disable animations if performance drops
 * Prevents jank on mid-range/low-end devices
 */
export function useAnimationBudget() {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime >= lastTime.current + 1000) {
        const currentFps = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );
        setFps(currentFps);

        // Disable animations if FPS drops below 30
        if (currentFps < 30 && shouldAnimate) {
          setShouldAnimate(false);
        } else if (currentFps > 50 && !shouldAnimate) {
          setShouldAnimate(true);
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, [shouldAnimate]);

  return { shouldAnimate, fps };
}

/**
 * Combined hook that respects both reduced motion preference and performance
 */
export function useAnimationControl() {
  const { shouldAnimate: canAnimateByPerf, fps } = useAnimationBudget();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    shouldAnimate: canAnimateByPerf && !prefersReduced,
    fps,
    prefersReduced,
  };
}
