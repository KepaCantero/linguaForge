import { motion } from 'framer-motion';

interface CardFaceProps {
  text: string;
  subtext?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  rotateY: number;
  zIndex: number;
  showFlipHint?: boolean;
}

export function CardFace({ text, subtext, difficulty, rotateY, zIndex, showFlipHint = false }: CardFaceProps) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        border: '2px solid rgba(99, 102, 241, 0.5)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        rotateY,
        zIndex,
      }}
    >
      <div className="text-center">
        <p className="text-2xl font-bold text-white drop-shadow-lg">
          {text}
        </p>
        {subtext && (
          <p className="text-base mt-3 text-white/80 font-medium">
            {subtext}
          </p>
        )}
      </div>

      {difficulty && (
        <div className="absolute bottom-3 right-3">
          <DifficultyIndicator difficulty={difficulty} />
        </div>
      )}

      {showFlipHint && (
        <div className="absolute bottom-3 left-3 text-xs text-white/50 bg-black/30 px-2 py-1 rounded-full">
          Doble click para voltear
        </div>
      )}
    </motion.div>
  );
}

interface DifficultyIndicatorProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

function DifficultyIndicator({ difficulty }: DifficultyIndicatorProps) {
  const colors = {
    easy: 'bg-green-400 shadow-green-400/50',
    medium: 'bg-yellow-400 shadow-yellow-400/50',
    hard: 'bg-red-400 shadow-red-400/50',
  };

  const dots = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return (
    <div className="flex gap-1.5 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
      {Array.from({ length: dots[difficulty] }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${colors[difficulty]} shadow-lg`}
        />
      ))}
    </div>
  );
}
