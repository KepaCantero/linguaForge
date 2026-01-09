"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInputStore } from "@/store/useInputStore";
import { useProgressStore } from "@/store/useProgressStore";
import { WordSelector } from "@/components/transcript/WordSelector";
import { QuickReviewButton } from "@/components/transcript/QuickReviewButton";
import { ContentSource } from "@/types/srs";

// Circular Stat Component
interface AudioStatOrbProps {
  value: string | number;
  label: string;
  icon: string;
  color: string;
  angle: number;
  distance: number;
  delay: number;
}

function AudioStatOrb({ value, label, icon, color, angle, distance, delay }: AudioStatOrbProps) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 50px)`,
        top: `calc(50% + ${y}px - 50px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 200,
      }}
    >
      <motion.div
        className="relative w-24 h-24 rounded-full cursor-pointer"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}DD)`,
        }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.15, y: -18 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
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
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {icon}
        </div>

        {/* Value */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm font-bold text-white">{value}</div>
          <div className="text-xs text-lf-muted">{label}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AudioInputPage() {
  const router = useRouter();
  const inputStore = useInputStore();
  const { activeLanguage, activeLevel } = useProgressStore();

  const [audioUrl, setAudioUrl] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [audioId, setAudioId] = useState<string | null>(null);
  const [wordsCount, setWordsCount] = useState(0);
  const [duration, setDuration] = useState(300);
  const [transcriptText, setTranscriptText] = useState("");

  const statsKey = `${activeLanguage}-${activeLevel}`;
  const statsData = inputStore.stats[statsKey];

  // Calcular estadísticas de audio
  const audioStats = useMemo(() => {
    const audioEvents = inputStore.events.filter(
      (e) => e.type === "audio" && (e.durationSeconds || 0) > 0
    );
    const uniqueAudioIds = new Set(
      audioEvents.map((e) => e.contentId).filter(Boolean)
    );
    const audioCount = uniqueAudioIds.size;
    const minutesListened = statsData?.minutesListened || 0;
    const totalHours = (minutesListened / 60).toFixed(2);
    const wordsHeard = statsData?.wordsHeard || 0;

    return {
      audioCount,
      totalHours,
      minutesListened,
      wordsHeard,
    };
  }, [inputStore.events, statsData]);

  const handleImport = useCallback(() => {
    router.push("/import?source=podcast");
  }, [router]);

  const handleLoadAudio = useCallback(() => {
    if (!audioUrl.trim()) return;

    const id = `audio-${Date.now()}`;
    setAudioId(id);
    setAudioTitle(audioUrl);
    setWordsCount(Math.floor((duration / 60) * 150));
  }, [audioUrl, duration]);

  const handleMarkAsListened = useCallback(() => {
    if (!audioId || duration === 0) {
      alert("Primero carga y reproduce un audio");
      return;
    }

    const words = wordsCount || Math.floor((duration / 60) * 150);
    inputStore.markAudioAsListened(
      audioId,
      duration,
      words,
      activeLanguage,
      activeLevel
    );
    alert("¡Audio marcado como escuchado!");
  }, [audioId, duration, wordsCount, activeLanguage, activeLevel, inputStore]);

  return (
    <div className="space-y-8 pb-32">
      {/* Stats Orbital HUD */}
      <div className="relative w-full h-[45vh] flex items-center justify-center">
        {/* Outer decorative rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${200 + i * 40}px`,
              height: `${200 + i * 40}px`,
              borderColor: `rgba(16, 185, 129, ${0.15 - i * 0.03})`,
              borderStyle: i % 2 === 0 ? "solid" : "dashed",
            }}
            animate={{
              rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 25 + i * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Central Core - Audio */}
        <motion.div
          className="relative w-32 h-32 rounded-full z-10"
          style={{
            background: "radial-gradient(circle at 30% 30%, #10B981, #059669)",
          }}
          animate={{
            scale: [1, 1.06, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          whileHover={{ scale: 1.12 }}
        >
          {/* Core glow */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.8), transparent)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Core icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              className="text-5xl"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎧
            </motion.div>
          </div>
        </motion.div>

        {/* Stat orbs in orbital arrangement */}
        <AudioStatOrb
          value={audioStats.audioCount}
          label="Audios"
          icon="📼"
          color="#10B981"
          angle={-90}
          distance={120}
          delay={0}
        />

        <AudioStatOrb
          value={`${audioStats.totalHours}h`}
          label="Horas"
          icon="⏱️"
          color="#34D399"
          angle={30}
          distance={120}
          delay={0.1}
        />

        <AudioStatOrb
          value={audioStats.wordsHeard.toLocaleString()}
          label="Palabras"
          icon="📝"
          color="#6EE7B7"
          angle={150}
          distance={120}
          delay={0.2}
        />

        {/* Floating particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-70"
            style={{
              background: i % 2 === 0 ? "#10B981" : "#34D399",
              left: `${25 + (i * 8) % 50}%`,
              top: `${15 + (i * 10) % 70}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              scale: [1, 0.6, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Input Section with Orbital Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto px-4"
      >
        {!audioId ? (
          <div className="space-y-4">
            {/* URL Input Orb */}
            <motion.div
              className="relative w-full flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="URL del audio o nombre del podcast..."
                  className="w-full px-6 py-4 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleLoadAudio()}
                />
              </div>
            </motion.div>

            {/* Duration Input */}
            <div className="flex items-center gap-3 px-4">
              <label className="text-sm text-white/70 whitespace-nowrap">
                Duración (seg):
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                min="0"
                className="flex-1 px-4 py-3 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="300"
              />
            </div>

            {/* Load Button Orb */}
            <motion.div
              className="flex justify-center mt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleLoadAudio}
                disabled={!audioUrl.trim()}
                className="relative w-20 h-20 rounded-full"
                style={{
                  background: !audioUrl.trim()
                    ? "radial-gradient(circle at 30% 30%, #4B5563, #374151)"
                    : "radial-gradient(circle at 30% 30%, #10B981, #059669)",
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{
                    background: !audioUrl.trim()
                      ? "transparent"
                      : "radial-gradient(circle, rgba(16, 185, 129, 0.6), transparent)",
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative text-3xl">⚡</span>
              </button>
            </motion.div>

            {/* Empty State */}
            <div className="text-center py-8">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🎵
              </motion.div>
              <p className="text-sm text-white/60">
                No hay audios disponibles. Haz clic en &quot;Importar&quot; para agregar podcasts o audios.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Audio Info Orb */}
            <motion.div
              className="relative w-full flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <div className="relative w-28 h-28 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #10B981, #059669)",
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: "radial-gradient(circle, rgba(16, 185, 129, 0.7), transparent)",
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-5xl">
                  🎧
                </div>
              </div>
            </motion.div>

            {/* Audio Details */}
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">{audioTitle}</p>
              <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                <span>
                  Duración: {duration > 0
                    ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, "0")}`
                    : "N/A"}
                </span>
                <span>
                  Palabras: {wordsCount > 0 ? wordsCount.toLocaleString() : "N/A"}
                </span>
              </div>
            </div>

            {/* Transcription */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">
                Transcripción
              </label>
              {transcriptText ? (
                <WordSelector
                  transcript={transcriptText}
                  source={{
                    type: "audio",
                    id: audioId || "",
                    title: audioTitle || `Audio ${audioId}`,
                    url: audioUrl,
                  } as ContentSource}
                />
              ) : (
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Pega aquí la transcripción del audio..."
                  className="w-full h-32 px-4 py-3 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* Mark as Listened Button */}
            <motion.button
              onClick={handleMarkAsListened}
              disabled={duration === 0}
              className="w-full py-4 rounded-aaa-xl font-bold text-white flex items-center justify-center gap-3"
              style={{
                background: duration === 0
                  ? "radial-gradient(circle at 30% 30%, #4B5563, #374151)"
                  : "radial-gradient(circle at 30% 30%, #22C55E, #16A34A)",
              }}
              whileHover={{ scale: duration === 0 ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">✓</span>
              <span>Marcar como escuchado</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Import Button - Fixed */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-20 right-4 z-50"
      >
        <motion.button
          onClick={handleImport}
          className="relative w-16 h-16 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #10B981, #059669)",
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.6), transparent)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative text-3xl">✨</span>
        </motion.button>
      </motion.div>

      {/* Quick Review Button */}
      {audioId && (
        <QuickReviewButton
          source={{
            type: "audio",
            id: audioId,
            title: audioTitle || `Audio ${audioId}`,
            url: audioUrl,
          }}
        />
      )}
    </div>
  );
}
