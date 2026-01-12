'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInputHubStats } from './hooks/useInputHubStats';
import { useInputOptions } from './hooks/useInputOptions';
import { InputHubOrbital } from './components/InputHubOrbital';

export default function InputHubPage() {
  const prefersReducedMotion = useReducedMotion();
  const stats = useInputHubStats();
  const inputOptions = useInputOptions(stats);
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div className="space-y-8">
      <InputHubOrbital
        inputOptions={inputOptions}
        shouldAnimate={shouldAnimate}
      />
    </div>
  );
}
