import { motion } from 'framer-motion';
import Link from 'next/link';
import type { InputOption } from '../hooks/useInputOptions';

interface InputHubOrbitalProps {
  inputOptions: InputOption[];
  shouldAnimate: boolean;
}

export function InputHubOrbital({ inputOptions, shouldAnimate }: InputHubOrbitalProps) {
  const animationConfig = shouldAnimate
    ? { type: 'spring' as const, stiffness: 150, damping: 20 }
    : { duration: 0.01 };

  return (
    <section className="relative w-full h-[70vh] flex items-center justify-center" aria-label="Selector de tipo de contenido">
      {/* Central core - Input Hub */}
      <motion.div
        className="absolute w-36 h-36 rounded-full z-10 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-lf-dark"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #8B5CF6, #7C3AED)',
          willChange: shouldAnimate ? 'transform, opacity' : 'auto',
        }}
        animate={shouldAnimate ? {
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{ duration: 4, repeat: shouldAnimate ? Infinity : 0 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Hub de entrada - Selecciona un tipo de contenido"
        tabIndex={0}
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8), transparent)',
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
          animate={shouldAnimate ? {
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.9, 0.5],
          } : {}}
          transition={{ duration: 3, repeat: shouldAnimate ? Infinity : 0 }}
          aria-hidden="true"
        />

        {[0, 1, 2].map((i) => (
          <motion.div
            key={`input-orbital-ring-${i}`}
            className="absolute rounded-full border-2 border-purple-500/30"
            style={{
              width: `${100 + i * 30}px`,
              height: `${100 + i * 30}px`,
              left: `${18 - i * 15}px`,
              top: `${18 - i * 15}px`,
              willChange: shouldAnimate ? 'transform, opacity' : 'auto',
            }}
            animate={shouldAnimate ? {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360, 0],
            } : {}}
            transition={{
              duration: 8 + i * 2,
              repeat: shouldAnimate ? Infinity : 0,
              ease: 'linear',
            }}
            aria-hidden="true"
          />
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            className="text-5xl"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 16px rgba(139, 92, 246, 0.4)',
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
            animate={shouldAnimate ? {
              scale: [1, 1.15, 1],
              rotate: [0, 10, -10, 0],
            } : {}}
            transition={{ duration: 3, repeat: shouldAnimate ? Infinity : 0 }}
            role="img"
            aria-label="Centro de control"
          >
            ⚡
          </motion.div>
        </div>
      </motion.div>

      {/* Orbital input type orbs */}
      {inputOptions.map((option, index) => {
        const angle = (index / inputOptions.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 160;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Build stats string for accessibility
        const statsString = option.stats.map(s => `${s.label}: ${s.value}`).join(', ');
        const ariaLabel = `${option.title}: ${option.description}. ${statsString}`;

        return (
          <motion.div
            key={option.id}
            className="absolute group"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: x - 70,
              marginTop: y - 70,
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.15,
              ...animationConfig,
            }}
          >
            <Link
              href={option.href}
              className="block focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-lf-dark"
              style={{
                display: 'block',
                width: 'max(128px, 44px)',
                height: 'max(128px, 44px)',
              }}
              aria-label={ariaLabel}
            >
              <motion.div
                className="relative rounded-full mx-auto"
                style={{
                  width: 'min(128px, 100%)',
                  height: 'min(128px, 100%)',
                  background: option.gradient,
                  willChange: shouldAnimate ? 'transform' : 'auto',
                  minWidth: '44px',
                  minHeight: '44px',
                }}
                animate={shouldAnimate ? {
                  y: [0, -8, 0],
                } : {}}
                transition={{
                  duration: 3 + index * 0.5,
                  repeat: shouldAnimate ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.15, y: -15 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{
                    background: `radial-gradient(circle, ${option.color}CC, transparent)`,
                    willChange: shouldAnimate ? 'transform, opacity' : 'auto',
                  }}
                  animate={shouldAnimate ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  } : {}}
                  transition={{ duration: 2.5, repeat: shouldAnimate ? Infinity : 0, delay: index * 0.4 }}
                  aria-hidden="true"
                />

                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  animate={shouldAnimate ? { rotate: 360 } : {}}
                  transition={{ duration: 12, repeat: shouldAnimate ? Infinity : 0, ease: 'linear' }}
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-0 flex items-center justify-center text-5xl"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)',
                  }}
                  aria-hidden="true"
                >
                  {option.icon}
                </div>
              </motion.div>

              <motion.div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 rounded-xl bg-lf-dark/90 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                initial={{ y: 10 }}
                whileHover={{ y: 0, opacity: 1 }}
                role="tooltip"
                aria-hidden="true"
              >
                <p
                  className="text-sm font-semibold text-white"
                  style={{
                    textShadow: '0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {option.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-lf-muted">
                  {option.stats.map((stat) => (
                    <span key={`${stat.label}-${stat.value}`}>{stat.label}: {stat.value}</span>
                  ))}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}

      {/* Connection lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
        {inputOptions.map((option, index) => {
          const angle = (index / inputOptions.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 160;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.line
              key={`line-${option.id}`}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${x}px)`}
              y2={`calc(50% + ${y}px)`}
              stroke="url(#gradient-line-input)"
              strokeWidth="2"
              strokeOpacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          );
        })}
        <defs>
          <linearGradient id="gradient-line-input" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating particles */}
      {shouldAnimate && [0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={`input-particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-lf-accent opacity-70"
          style={{
            left: `${20 + (i * 10) % 60}%`,
            top: `${15 + (i * 12) % 70}%`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, (i % 2 === 0 ? 35 : -35), 0],
            scale: [1, 0.5, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
          aria-hidden="true"
        />
      ))}
    </section>
  );
}
