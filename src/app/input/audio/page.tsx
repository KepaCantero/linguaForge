"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInputStore } from "@/store/useInputStore";
import { useProgressStore } from "@/store/useProgressStore";
import { QuickReviewButton } from "@/components/transcript/QuickReviewButton";
import { useAudioStats } from "./hooks/useAudioStats";
import { AudioOrbitalHUD } from "./components/AudioOrbitalHUD";
import { AudioInputSection } from "./components/AudioInputSection";

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

  const audioStats = useAudioStats();

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
      <AudioOrbitalHUD audioStats={audioStats} />

      <AudioInputSection
        audioUrl={audioUrl}
        setAudioUrl={setAudioUrl}
        audioId={audioId}
        audioTitle={audioTitle}
        setAudioTitle={setAudioTitle}
        duration={duration}
        setDuration={setDuration}
        transcriptText={transcriptText}
        setTranscriptText={setTranscriptText}
        wordsCount={wordsCount}
        onLoadAudio={handleLoadAudio}
        onMarkAsListened={handleMarkAsListened}
      />

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
            background: "radial-gradient(circle at 30% 30%, var(--accent-500), var(--accent-600))",
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: "radialGlow('accent', 0.6)",
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
