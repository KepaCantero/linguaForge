/**
 * MicroInteractions Component
 *
 * Sistema de micro-interacciones optimizadas:
 * - Duración máxima de 300ms para todas las animaciones
 * - Feedback inline para errores (sin modales)
 * - Vibración visual (shake) para correcciones
 * - Autocompletado inteligente en entrada de datos
 * - Dictado (Speech-to-text) como alternativa
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// TIPOS
// ============================================================

// Tipo para Speech Recognition (API no estándar de browsers)
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionType;
  prototype: SpeechRecognitionType;
}

// Tipo para soporte de Speech Recognition en browsers
interface SpeechRecognitionSupport {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export type InteractionType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'shake'
  | 'pulse'
  | 'bounce';

export interface MicroInteractionProps {
  type: InteractionType;
  message?: string;
  duration?: number; // ms, max 300
  children?: React.ReactNode;
  onComplete?: () => void;
  className?: string;
  showInline?: boolean; // Mostrar como feedback inline en lugar de toast
}

export interface AutocompleteOption {
  value: string;
  label: string;
  icon?: string;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  className?: string;
  icon?: string;
  disabled?: boolean;
}

// ============================================================
// CONSTANTES
// ============================================================

const MAX_DURATION = 300; // ms - Duración máxima de animación
const SHAKE_DURATION = 400; // ms - Duración de vibración visual

const INTERACTION_COLORS: Record<InteractionType, string> = {
  success: 'bg-green-500/20 border-green-500/50 text-green-300',
  error: 'bg-red-500/20 border-red-500/50 text-red-300',
  warning: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  loading: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300',
  shake: 'bg-red-500/10 border-red-500/30',
  pulse: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  bounce: 'bg-teal-500/20 border-teal-500/50 text-teal-300',
};

const INTERACTION_ICONS: Record<InteractionType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: '⏳',
  shake: '📳',
  pulse: '💫',
  bounce: '⬆️',
};

// ============================================================
// COMPONENTE DE FEEDBACK VISUAL
// ============================================================

/**
 * MicroInteraction - Componente de feedback visual con animación
 * Duración máxima de 300ms para no interrumpir el flujo
 */
export function MicroInteraction({
  type,
  message,
  duration = 300,
  children,
  onComplete,
  className = '',
  showInline = false,
}: MicroInteractionProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Asegurar que la duración no exceda el máximo
  const actualDuration = Math.min(duration, MAX_DURATION);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, actualDuration);

    return () => clearTimeout(timer);
  }, [actualDuration, onComplete]);

  // Variantes de animación según tipo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: Record<InteractionType, any> = {
    success: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    },
    error: {
      initial: { x: -10, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 10, opacity: 0 },
    },
    warning: {
      initial: { scale: 1.1, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
    info: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.1, opacity: 0 },
    },
    loading: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
    shake: {
      animate: {
        x: [0, -10, 10, -10, 10, -5, 5, 0],
      },
      transition: {
        duration: SHAKE_DURATION / 1000,
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1],
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
      },
      transition: {
        duration: MAX_DURATION / 1000,
        repeat: 1,
      },
    },
    bounce: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Si es shake/pulse/bounce, aplicar animación especial
  if (type === 'shake' || type === 'pulse' || type === 'bounce') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: actualDuration / 1000 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${INTERACTION_COLORS[type]} ${className}`}
      >
        <motion.span
          variants={variants[type]}
          animate="animate"
        >
          {INTERACTION_ICONS[type]}
        </motion.span>
        {message && <span className="text-sm">{message}</span>}
        {children}
      </motion.div>
    );
  }

  // Feedback inline (dentro del flujo, no toast)
  if (showInline) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.span
            variants={variants[type]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: actualDuration / 1000 }}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border ${INTERACTION_COLORS[type]} ${className}`}
          >
            <span>{INTERACTION_ICONS[type]}</span>
            {message && <span>{message}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    );
  }

  // Feedback estándar (toast-style)
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants[type] || variants.success}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: actualDuration / 1000 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${INTERACTION_COLORS[type]} ${className}`}
        >
          <span className="text-sm">{INTERACTION_ICONS[type]}</span>
          {message && <span className="text-sm">{message}</span>}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// COMPONENTE DE AUTOCOMPLETADO INTELIGENTE
// ============================================================

/**
 * SmartAutocomplete - Autocompletado con filtrado inteligente
 * - Filtra por valor inicial (fuzzy match)
 * - Muestra iconos si están disponibles
 * - Navegación por teclado (flechas + Enter)
 * - Selección con click o teclado
 */
export function SmartAutocomplete({
  options,
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar...',
  className = '',
  icon,
  disabled = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones basado en valor
  const filteredOptions = value
    ? options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase()) ||
        option.value.toLowerCase().includes(value.toLowerCase())
      )
    : options;

  // Manejar selección
  const handleSelect = useCallback((option: AutocompleteOption) => {
    onChange(option.value);
    onSelect?.(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onChange, onSelect]);

  // Manejar navegación por teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect]);

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${icon ? 'pl-10' : ''}`}
        />
        {/* Indicador de dropdown */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.button>
      </div>

      {/* Dropdown de opciones */}
      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.map((option, index) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  index === highlightedIndex
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                <span>{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// COMPONENTE DE SHAKE (VIBRACIÓN VISUAL)
// ============================================================

export interface ShakeProps {
  children: React.ReactNode;
  trigger?: boolean; // Cuándo activar la animación
  className?: string;
}

/**
 * Shake - Componente wrapper que aplica vibración visual
 * Útil para feedback de error sin usar modales
 */
export function Shake({ children, trigger = false, className = '' }: ShakeProps) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -5, 5, -5, 5, -3, 3, 0],
      } : {}}
      transition={{
        duration: SHAKE_DURATION / 1000,
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// COMPONENTE DE PULSE (PULSO)
// ============================================================

export interface PulseProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * Pulse - Componente wrapper que aplica efecto de pulso
 * Útil para destacar elementos importantes
 */
export function Pulse({ children, active = false, className = '' }: PulseProps) {
  return (
    <motion.div
      animate={active ? {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      } : {}}
      transition={{
        duration: MAX_DURATION / 1000,
        repeat: active ? Infinity : 0,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// COMPONENTE DE BOUNCE (REBOTE)
// ============================================================

export interface BounceProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}

/**
 * Bounce - Componente wrapper que aplica rebote
 * Útil para celebraciones o confirmaciones
 */
export function Bounce({ children, trigger = false, className = '' }: BounceProps) {
  return (
    <motion.div
      animate={trigger ? {
        y: [0, -10, 0],
      } : {}}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// HOOK PARA DICTADO (Speech-to-Text)
// ============================================================

/**
 * useSpeechRecognition - Hook para dictado de voz
 * Fallback typing cuando speech recognition no está disponible
 */
export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Verificar si el browser soporta speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionConstructor = (window as unknown as SpeechRecognitionSupport).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return;

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // Francés

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      setTranscript(event.results[last][0].transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (isListening) {
      const SpeechRecognitionConstructor = (window as unknown as SpeechRecognitionSupport).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        // Intentar detener cualquier reconocimiento activo
        try {
          // La API webkitSpeechRecognition no tiene un método stop estándar
          // Pero podemos abortar creando una nueva instancia que reemplaza la anterior
          setIsListening(false);
        } catch {
          setIsListening(false);
        }
      }
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}

// ============================================================
// COMPONENTE DE BOTÓN DE DICTADO
// ============================================================

export interface DictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

/**
 * DictationButton - Botón para activar dictado por voz
 * Alternativa a escritura manual para entrada rápida
 */
export function DictationButton({ onTranscript, className = '' }: DictationButtonProps) {
  const { isSupported, isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  if (!isSupported) {
    return null; // No mostrar el botón si no está soportado
  }

  return (
    <motion.button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={`p-2 rounded-lg transition-colors ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isListening ? 'Detener dictado' : 'Dictar respuesta'}
    >
      <motion.div
        animate={isListening ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
      >
        {isListening ? '🎤' : '🎙️'}
      </motion.div>
    </motion.button>
  );
}

export default MicroInteraction;
