import { motion } from "framer-motion";
import { WordSelector } from "@/components/transcript/WordSelector";
import { ContentSource } from "@/types/srs";

interface AudioInputSectionProps {
  audioUrl: string;
  setAudioUrl: (value: string) => void;
  audioId: string | null;
  audioTitle: string;
  setAudioTitle: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  transcriptText: string;
  setTranscriptText: (value: string) => void;
  wordsCount: number;
  onLoadAudio: () => void;
  onMarkAsListened: () => void;
}

export function AudioInputSection({
  audioUrl,
  setAudioUrl,
  audioId,
  audioTitle,
  setAudioTitle: _setAudioTitle,
  duration,
  setDuration,
  transcriptText,
  setTranscriptText,
  wordsCount,
  onLoadAudio,
  onMarkAsListened,
}: AudioInputSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-md mx-auto px-4"
    >
      {!audioId ? (
        <div className="space-y-4">
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
                onKeyDown={(e) => e.key === "Enter" && onLoadAudio()}
              />
            </div>
          </motion.div>

          <div className="flex items-center gap-3 px-4">
            <label htmlFor="audio-duration" className="text-sm text-white/70 whitespace-nowrap">
              Duración (seg):
            </label>
            <input
              id="audio-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number.parseInt(e.target.value, 10) || 0)}
              min="0"
              className="flex-1 px-4 py-3 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="300"
            />
          </div>

          <motion.div
            className="flex justify-center mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={onLoadAudio}
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

          <div className="space-y-2">
            <label htmlFor="audio-transcript" className="block text-sm font-medium text-white/90">
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
                id="audio-transcript"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Pega aquí la transcripción del audio..."
                className="w-full h-32 px-4 py-3 rounded-aaa-xl bg-glass-surface backdrop-blur-aaa border border-white/20 text-white placeholder:text-white/50 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            )}
          </div>

          <motion.button
            onClick={onMarkAsListened}
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
  );
}
