'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { InputHub } from '@/components/input/InputHub';

export default function InputHubPage() {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div className="w-full">
      <InputHub shouldAnimate={shouldAnimate} />
    </div>
  );
}
