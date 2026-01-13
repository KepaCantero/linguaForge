import { motion } from 'framer-motion';
import { COLORS, radialGlow, borderAlpha } from '@/constants/colors';

interface StatOrbProps {
  value: string | number;
  label: string;
  icon: string;
  color: string;
  angle: number;
  distance: number;
  delay: number;
}

interface OrbitalHUDProps {
  level: number;
  xp: number;
  currentLevel: number;
  rank: string;
  synapsesCount: number;
}

function StatOrb({ value, label, icon, color, angle, distance, delay }: StatOrbProps) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 40px)`,
        top: `calc(50% + ${y}px - 40px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
      }}
    >
      <motion.div
        className="relative w-20 h-20 rounded-full cursor-pointer"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}DD)`,
        }}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 3 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.15, y: -15 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-md"
          style={{
            background: `radial-gradient(circle, ${color}CC, transparent)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {icon}
        </div>

        {/* Value */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-bold text-white">{value}</div>
          <div className="text-xs text-calm-text-muted">{label}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function OrbitalHUD({ level, xp, currentLevel, rank, synapsesCount }: OrbitalHUDProps) {
  return (
    <div className="relative w-full h-[55vh] flex items-center justify-center">
      {/* Outer decorative rings */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`orbital-ring-${i}`}
          className="absolute rounded-full border"
          style={{
            width: `${250 + i * 50}px`,
            height: `${250 + i * 50}px`,
            borderColor: borderAlpha('sky', 0.15 - i * 0.02),
            borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
          }}
          animate={{
            rotate: i % 2 === 0 ? [0, 360] : [360, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 30 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Main stats in orbital arrangement */}
      <StatOrb value={level} label="Nivel" icon="⭐" color="#FDE047" angle={-90} distance={140} delay={0} />
      <StatOrb value={xp.toLocaleString()} label="XP" icon="✨" color="var(--sky-500)" angle={-18} distance={140} delay={0.1} />
      <StatOrb value={synapsesCount.toLocaleString()} label="Sinapsis" icon="🔗" color="var(--accent-500)" angle={54} distance={140} delay={0.2} />
      <StatOrb value={rank} label="Rango" icon="🏅" color="#C026D3" angle={126} distance={140} delay={0.3} />
      <StatOrb value={`${currentLevel}%`} label="Progreso" icon="📈" color="#F59E0B" angle={198} distance={140} delay={0.4} />

      {/* Central Core */}
      <motion.div
        className="relative w-40 h-40 rounded-full cursor-pointer z-10"
        style={{
          background: 'radial-gradient(circle at 30% 30%, var(--sky-500), var(--sky-600), #0369A1)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 3, -3, 0],
        }}
        transition={{ duration: 5, repeat: Infinity }}
        whileHover={{ scale: 1.15 }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: radialGlow('sky', 0.8),
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Animated inner rings */}
        {[0, 1].map((i) => (
          <motion.div
            key={`inner-ring-${i}`}
            className="absolute rounded-full border-2 border-calm-warm-100/30"
            style={{
              width: `${60 + i * 15}px`,
              height: `${60 + i * 15}px`,
              left: `${20 - i * 7.5}px`,
              top: `${20 - i * 7.5}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 4 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            className="text-5xl mb-1"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🧠
          </motion.div>
          <motion.div
            className="text-2xl font-bold text-white"
            animate={{
              textShadow: [
                COLORS.effects.whiteGlowSm,
                COLORS.effects.whiteGlowMd,
                COLORS.effects.whiteGlowSm,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level}
          </motion.div>
          <div className="text-xs text-calm-text-muted">
            Nivel
          </div>
        </div>
      </motion.div>

      {/* Floating particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={`orbital-particle-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-500 opacity-70"
          style={{
            left: `${25 + (i * 9) % 50}%`,
            top: `${20 + (i * 7) % 60}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, (i % 2 === 0 ? 40 : -40), 0],
            scale: [1, 0.5, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
