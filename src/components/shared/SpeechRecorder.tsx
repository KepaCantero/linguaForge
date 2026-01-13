"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import type { SpeechRecordingResult } from "@/types";

// Configuración del grabador
interface RecorderConfig {
  maxDuration?: number;
  minDuration?: number;
  silenceThreshold?: number;
  silenceTimeout?: number;
}

interface SpeechRecorderProps {
  // Callback cuando la grabación se completa
  onRecordingComplete: (result: SpeechRecordingResult) => void;
  // Callback opcional cuando se inicia la grabación
  onRecordingStart?: () => void;
  // Configuración del grabador
  config?: RecorderConfig;
  // Mostrar temporizador
  showTimer?: boolean;
  // Mostrar forma de onda (placeholder)
  showWaveform?: boolean;
  // Etiqueta personalizada
  label?: string;
  // Clases adicionales
  className?: string;
  // Versión legacy: solo devuelve blob
  legacyMode?: boolean;
}

export function SpeechRecorder({
  onRecordingComplete,
  onRecordingStart,
  config = {},
  showTimer = true,
  showWaveform = false,
  label,
  className = "",
}: SpeechRecorderProps) {
  const maxDuration = config.maxDuration ?? 5;
  const minDuration = config.minDuration ?? 0.5;

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalDurationRef = useRef<number>(0);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      finalDurationRef.current = duration;
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
  }, [isRecording, duration]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const recordedDuration = finalDurationRef.current;

        // Verificar duración mínima
        if (recordedDuration >= minDuration) {
          onRecordingComplete({
            audioBlob,
            duration: recordedDuration,
          });
        } else {
          setError(`Grabación muy corta. Mínimo ${minDuration}s`);
        }

        // Limpiar stream
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      setIsRecording(true);
      setDuration(0);
      finalDurationRef.current = 0;
      mediaRecorder.start();

      // Notificar que empezó la grabación
      onRecordingStart?.();

      // Timer de duración
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 0.1;
          finalDurationRef.current = newDuration;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo acceder al micrófono"
      );
    }
  }, [maxDuration, minDuration, onRecordingComplete, onRecordingStart, stopRecording]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  const handleMouseDown = () => {
    if (!isRecording) {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={isRecording ? stopRecording : undefined}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
            : "bg-indigo-500 hover:bg-indigo-600 shadow-md"
        } text-white`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
      >
        {isRecording ? (
          <div className="w-8 h-8 bg-white rounded-sm" />
        ) : (
          <span>🎤</span>
        )}
      </motion.button>

      {/* Placeholder para forma de onda */}
      {showWaveform && isRecording && (
        <div className="flex items-center gap-1 h-8">
          {[...new Array(12)].map((_, i) => (
            <motion.div
              key={`waveform-bar-${i}`}
              className="w-1 bg-indigo-500 rounded-full"
              animate={{
                height: [4, 16 + Math.random() * 16, 4],
              }}
              transition={{
                duration: 0.3 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}

      {showTimer && (
        <div className="text-center">
          {isRecording ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {duration.toFixed(1)}s / {maxDuration}s
              </div>
              <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(duration / maxDuration) * 100}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {label || "Mantén presionado para grabar"}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
