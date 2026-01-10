'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { GlyphWeaving } from '@/types';
import { useGamificationStore } from '@/store/useGamificationStore';
import { XP_RULES } from '@/lib/constants';
import { isOnBeat, getCurrentBeat, calculateBeatAccuracy } from '@/lib/bpmDetection';

interface GlyphWeavingExerciseProps {
  exercise: GlyphWeaving;
  onComplete: (accuracy: number) => void;
}

type GlyphPhase = 'intro' | 'playing' | 'complete';

interface Connection {
  from: string;
  to: string;
  time: number;
  beat: number;
}

export function GlyphWeavingExercise({ exercise, onComplete }: GlyphWeavingExerciseProps) {
  const { addXP, addGems } = useGamificationStore();
  const [phase, setPhase] = useState<GlyphPhase>('playing');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedGlyph, setSelectedGlyph] = useState<string | null>(null);
  const [completedPatterns, setCompletedPatterns] = useState<Set<string>>(new Set());
  
  const soundRef = useRef<Howl | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  // Timer para actualizar tiempo y beat
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (soundRef.current) {
          const time = soundRef.current.seek() as number;
          setCurrentTime(time);
          setCurrentBeat(getCurrentBeat(time, exercise.bpm));
        }
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, exercise.bpm]);

  const handleComplete = useCallback(() => {
    setPhase('complete');
    
    const expectedBeats = exercise.pattern.map((p) => p.beat);
    const connectionTimes = connections.map((c) => c.time);
    const accuracy = calculateBeatAccuracy(connectionTimes, expectedBeats, exercise.bpm);

    // Bonus por completar patrón
    if (completedPatterns.size === exercise.pattern.length) {
      addXP(XP_RULES.glyphWeavingComplete);
    }

    // Bonus por sincronización perfecta
    if (accuracy >= 95) {
      addGems(20); // Bonus especial por sincronización perfecta
    }

    setTimeout(() => {
      onComplete(accuracy);
    }, 2000);
  }, [connections, exercise.pattern, completedPatterns.size, exercise.bpm, addXP, addGems, onComplete]);

  const startPlaying = useCallback(() => {
    console.log('Starting play, exercise:', exercise);
    // Inicializar audio automáticamente al montar el componente
    if (soundRef.current) {
      soundRef.current.unload();
    }

    try {
      soundRef.current = new Howl({
        src: [exercise.audioUrl],
        format: ['mp3', 'ogg', 'wav'],
        autoplay: false,
        onplay: () => setIsPlaying(true),
        onend: () => {
          setIsPlaying(false);
          handleComplete();
        },
        onloaderror: (_id, error) => {
          console.warn('Error loading audio, continuing without audio:', error);
          setIsPlaying(false);
          // Continuar sin audio - el usuario puede seguir jugando
        },
      });
      
      // Pequeño delay para asegurar que el canvas esté listo antes de reproducir audio
      setTimeout(() => {
        if (soundRef.current) {
          try {
            const soundId = soundRef.current.play();
            if (soundId === undefined) {
              console.warn('Error playing audio, continuing without audio');
            }
          } catch (error) {
            console.warn('Error playing audio, continuing without audio:', error);
            // Continuar sin audio - el usuario puede seguir jugando
          }
        }
      }, 200);
    } catch (error) {
      console.warn('Error initializing audio, continuing without audio:', error);
      // Continuar sin audio
    }
    
    // El canvas se dibujará automáticamente cuando cambie la fase a 'playing'
    // gracias a los useEffect que monitorean el cambio de fase
  }, [exercise, handleComplete]);

  const handleGlyphClick = useCallback((glyphId: string) => {
    if (!isPlaying) return;

    if (!selectedGlyph) {
      // Seleccionar primer glifo
      setSelectedGlyph(glyphId);
    } else {
      // Conectar con segundo glifo
      const isOnBeatNow = isOnBeat(currentTime, exercise.bpm);
      const beat = getCurrentBeat(currentTime, exercise.bpm);

      const newConnection: Connection = {
        from: selectedGlyph,
        to: glyphId,
        time: currentTime,
        beat,
      };

      setConnections((prev) => [...prev, newConnection]);

      // Verificar si completa un patrón
      const matchingPattern = exercise.pattern.find(
        (p) => p.fromGlyph === selectedGlyph && p.toGlyph === glyphId && p.beat === beat
      );

      if (matchingPattern) {
        setCompletedPatterns((prev) => {
          const newSet = new Set(prev);
          newSet.add(`${selectedGlyph}-${glyphId}-${beat}`);
          return newSet;
        });
        
        // XP según sincronización
        if (isOnBeatNow) {
          addXP(XP_RULES.glyphWeavingBeat);
        } else {
          addXP(XP_RULES.glyphWeavingOffBeat);
        }
      }

      setSelectedGlyph(null);
    }
  }, [selectedGlyph, currentTime, exercise.bpm, exercise.pattern, isPlaying, addXP]);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) {
      console.log('Canvas ref is null');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Could not get 2d context');
      return;
    }

    if (!exercise.glyphs || exercise.glyphs.length === 0) {
      console.log('No glyphs available', exercise);
      return;
    }

    // Calcular tamaño del grid dinámicamente basado en las posiciones de los glifos
    const maxX = Math.max(...exercise.glyphs.map(g => g.position.x));
    const maxY = Math.max(...exercise.glyphs.map(g => g.position.y));
    const gridCols = maxX + 1;
    const gridRows = maxY + 1;

    const width = canvas.width;
    const height = canvas.height;
    const cellWidth = width / gridCols;
    const cellHeight = height / gridRows;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Dibujar fondo (blanco para mejor contraste)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Dibujar grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    for (let i = 0; i <= gridCols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();
    }
    for (let i = 0; i <= gridRows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }

    // Dibujar conexiones
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    connections.forEach((conn) => {
      const fromGlyph = exercise.glyphs.find((g) => g.id === conn.from);
      const toGlyph = exercise.glyphs.find((g) => g.id === conn.to);

      if (fromGlyph && toGlyph) {
        const x1 = fromGlyph.position.x * cellWidth + cellWidth / 2;
        const y1 = fromGlyph.position.y * cellHeight + cellHeight / 2;
        const x2 = toGlyph.position.x * cellWidth + cellWidth / 2;
        const y2 = toGlyph.position.y * cellHeight + cellHeight / 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Dibujar glifos
    exercise.glyphs.forEach((glyph) => {
      const x = glyph.position.x * cellWidth + cellWidth / 2;
      const y = glyph.position.y * cellHeight + cellHeight / 2;
      const isSelected = selectedGlyph === glyph.id;
      const radius = Math.min(cellWidth, cellHeight) * 0.3;

      // Círculo de fondo
      ctx.fillStyle = isSelected ? '#F59E0B' : '#4F46E5';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Borde del círculo
      ctx.strokeStyle = isSelected ? '#D97706' : '#4338CA';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Símbolo (texto o emoji)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.floor(radius * 0.8)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph.symbol, x, y);
    });

    // Efecto de resonancia en beat
    if (isOnBeat(currentTime, exercise.bpm)) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Continuar animación solo si está reproduciendo
    if (isPlaying && phase === 'playing') {
      animationFrameRef.current = requestAnimationFrame(drawCanvas);
    }
  }, [connections, exercise, selectedGlyph, currentTime, isPlaying, phase]);

  // Inicializar y dibujar canvas cuando cambia la fase
  useEffect(() => {
    if (phase === 'playing' && canvasRef.current) {
      // Asegurar que el canvas tenga el tamaño correcto
      const canvas = canvasRef.current;
      if (canvas.width !== 600 || canvas.height !== 600) {
        canvas.width = 600;
        canvas.height = 600;
      }
      // Dibujar inmediatamente
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          drawCanvas();
        }
      });
    }
  }, [phase, drawCanvas]);

  // Asegurar que el canvas se dibuje cuando cambian los glifos o conexiones
  useEffect(() => {
    if (phase === 'playing' && canvasRef.current) {
      // Dibujar canvas inmediatamente cuando cambia la fase o los datos
      drawCanvas();
    }
  }, [phase, exercise.glyphs, connections, selectedGlyph, currentTime, drawCanvas]);

  // Dibujar canvas cuando cambia el phase a 'playing' incluso si no está reproduciendo
  useEffect(() => {
    if (phase === 'playing' && canvasRef.current && !isPlaying) {
      // Dibujar una vez cuando entra en fase playing pero aún no está reproduciendo
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          drawCanvas();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [phase, isPlaying, drawCanvas]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      soundRef.current?.unload();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Iniciar automáticamente al montar el componente (solo una vez)
  useEffect(() => {
    startPlaying();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = (completedPatterns.size / exercise.pattern.length) * 100;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Fase: Playing */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Canvas con matriz de glifos */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                style={{ display: 'block', backgroundColor: '#FFFFFF' }}
                className="w-full max-w-lg mx-auto aspect-square touch-none cursor-pointer border-2 border-gray-200 dark:border-gray-700 rounded-lg"
                onClick={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;

                  const rect = canvas.getBoundingClientRect();
                  const scaleX = canvas.width / rect.width;
                  const scaleY = canvas.height / rect.height;
                  const x = (e.clientX - rect.left) * scaleX;
                  const y = (e.clientY - rect.top) * scaleY;

                  // Calcular tamaño del grid dinámicamente
                  const maxX = Math.max(...exercise.glyphs.map(g => g.position.x));
                  const maxY = Math.max(...exercise.glyphs.map(g => g.position.y));
                  const gridCols = maxX + 1;
                  const gridRows = maxY + 1;
                  const cellWidth = canvas.width / gridCols;
                  const cellHeight = canvas.height / gridRows;
                  const glyphX = Math.floor(x / cellWidth);
                  const glyphY = Math.floor(y / cellHeight);

                  const clickedGlyph = exercise.glyphs.find(
                    (g) => g.position.x === glyphX && g.position.y === glyphY
                  );

                  if (clickedGlyph) {
                    handleGlyphClick(clickedGlyph.id);
                  }
                }}
              />
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {currentBeat}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Beat
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedPatterns.size}/{exercise.pattern.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Patrones
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4 text-center">
                <motion.div
                  className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                  animate={isOnBeat(currentTime, exercise.bpm) ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isOnBeat(currentTime, exercise.bpm) ? '✓' : '○'}
                </motion.div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Sincronizado
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="bg-white dark:bg-gray-800 rounded-aaa-xl p-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {progress.toFixed(0)}% completado
              </div>
            </div>

            {/* Instrucciones */}
            {selectedGlyph && (
              <motion.div
                className="bg-indigo-100 dark:bg-indigo-900 rounded-aaa-xl p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Selecciona el siguiente glifo para conectar
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Fase: Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-aaa-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.5, rotateZ: -5 }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.span
              className="text-6xl mb-4 block"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              🎉
            </motion.span>
            <h3 className="text-white text-xl font-bold mb-2">
              ¡Patrón completado!
            </h3>
            <p className="text-white/90 mb-2">
              Conexiones: {connections.length}
            </p>
            <p className="text-white/80 text-sm">
              +{XP_RULES.glyphWeavingComplete} XP
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

