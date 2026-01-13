import { motion, type MotionValue } from 'framer-motion';

interface SwipeIndicatorsProps {
  leftIndicatorOpacity: MotionValue<number> | number;
  rightIndicatorOpacity: MotionValue<number> | number;
}

export function SwipeIndicators({ leftIndicatorOpacity, rightIndicatorOpacity }: SwipeIndicatorsProps) {
  return (
    <>
      <motion.div
        className="absolute -left-16 top-1/2 -translate-y-1/2 text-4xl"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <span className="text-semantic-error drop-shadow-lg">✗</span>
      </motion.div>

      <motion.div
        className="absolute -right-16 top-1/2 -translate-y-1/2 text-4xl"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <span className="text-accent-500 drop-shadow-lg">✓</span>
      </motion.div>
    </>
  );
}
