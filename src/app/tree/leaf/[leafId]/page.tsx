"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TopicTreeSchema } from "@/types";
import type {
  TopicLeaf,
  TopicBranch,
  LessonContent,
  LessonMode,
} from "@/types";
import { ClozeExercise } from "@/components/exercises/ClozeExercise";
import { VariationsExercise } from "@/components/exercises/VariationsExercise";
import { VocabularyExercise } from "@/components/exercises/VocabularyExercise";
import { PragmaStrikeExercise } from "@/components/exercises/PragmaStrikeExercise";
import { ShardDetectionExercise } from "@/components/exercises/ShardDetectionExercise";
import { EchoStreamExercise } from "@/components/exercises/EchoStreamExercise";
import { GlyphWeavingExercise } from "@/components/exercises/GlyphWeavingExercise";
import { ResonancePathExercise } from "@/components/exercises/ResonancePathExercise";
import { InputPlayer } from "@/components/input/InputPlayer";
import { ComprehensionTest } from "@/components/input/ComprehensionTest";
import { MiniTaskExercise } from "@/components/exercises/MiniTaskExercise";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useProgressStore } from "@/store/useProgressStore";
import { loadLesson } from "@/services/lessonLoader";
import { loadWorld } from "@/services/contentLoader";
import { XP_RULES, getLevelByXP } from "@/lib/constants";

type LessonPhase =
  | "intro"
  | "exercise-menu"
  | "exercises"
  | "input"
  | "test"
  | "complete";

type PhrasePhase = "cloze" | "shadowing" | "variations";

export default function LeafPage() {
  const params = useParams();
  const router = useRouter();
  const leafId = params.leafId as string;
  const { addXP, addGems, xp } = useGamificationStore();
  const { activeLanguage, activeLevel } = useProgressStore();
  const levelInfo = getLevelByXP(xp);

  const [leaf, setLeaf] = useState<TopicLeaf | null>(null);
  const [branch, setBranch] = useState<TopicBranch | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(
    null
  );
  const [world, setWorld] = useState<{ id: string; janusMatrix: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<LessonPhase>("intro");
  const [lessonMode, setLessonMode] = useState<LessonMode | null>(null);
  const [phrasePhase, setPhrasePhase] = useState<PhrasePhase>("cloze");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(
    null
  );

  // Core exercises v2.0 tracking
  const [currentVocabularyIndex, setCurrentVocabularyIndex] = useState(0);
  const [currentPragmaIndex, setCurrentPragmaIndex] = useState(0);
  const [currentShardIndex, setCurrentShardIndex] = useState(0);
  const [currentEchoStreamIndex, setCurrentEchoStreamIndex] = useState(0);
  const [currentGlyphWeavingIndex, setCurrentGlyphWeavingIndex] = useState(0);
  const [currentResonancePathIndex, setCurrentResonancePathIndex] = useState(0);
  const [currentExerciseType, setCurrentExerciseType] = useState<
    | "phrases"
    | "vocabulary"
    | "pragmaStrike"
    | "shardDetection"
    | "echoStream"
    | "glyphWeaving"
    | "resonancePath"
  >("phrases");

  // Exercise completion tracking for menu
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set()
  );

  // Selected exercise from menu
  const [selectedExercise, setSelectedExercise] = useState<{
    type:
      | "phrases"
      | "vocabulary"
      | "pragmaStrike"
      | "shardDetection"
      | "echoStream"
      | "glyphWeaving"
      | "resonancePath";
    phraseIndex?: number;
    phrasePhase?: PhrasePhase;
    vocabularyIndex?: number;
    pragmaIndex?: number;
    shardIndex?: number;
    echoStreamIndex?: number;
    glyphWeavingIndex?: number;
    resonancePathIndex?: number;
  } | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        // Load topic tree
        const treeData = await import("@/../content/fr/A1/topic-tree.json");
        const parsedTree = TopicTreeSchema.parse(treeData.default || treeData);

        // Find the leaf
        let foundLeaf: TopicLeaf | null = null;
        let foundBranch: TopicBranch | null = null;
        for (const b of parsedTree.branches) {
          const found = b.leaves.find((l) => l.id === leafId);
          if (found) {
            foundLeaf = found;
            foundBranch = b;
            break;
          }
        }

        if (!foundLeaf || !foundBranch) {
          setError("Leaf not found");
          return;
        }

        setLeaf(foundLeaf);
        setBranch(foundBranch);

        // Try to load lesson content using lessonLoader
        const loadedLesson = await loadLesson(
          activeLanguage || "fr",
          activeLevel || "A1",
          leafId
        );

        if (loadedLesson) {
          console.log("Successfully loaded lesson content:", loadedLesson);
          setLessonContent(loadedLesson);
        } else {
          console.log("Lesson content not available for:", leafId);
        }

        // Cargar mundo para obtener Janus Matrix
        try {
          const worldId = activeLanguage === 'fr' && activeLevel === 'A1' ? 'airbnb' : 
                         activeLanguage === 'fr' && activeLevel === 'A2' ? 'restaurant' :
                         activeLanguage === 'de' && activeLevel === 'A1' ? 'airbnb' : 'airbnb';
          const worldData = await loadWorld(
            (activeLanguage || 'fr') as 'fr' | 'de',
            (activeLevel || 'A1') as 'A1' | 'A2',
            worldId
          );
          if (worldData?.janusMatrix) {
            setWorld({ id: worldId, janusMatrix: worldData.janusMatrix });
          }
        } catch (worldErr) {
          console.warn("Could not load world for Janus Matrix:", worldErr);
        }
      } catch (err) {
        console.error("Error loading leaf:", err);
        setError(err instanceof Error ? err.message : "Error loading content");
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [leafId, activeLanguage, activeLevel]);

  // Obtener todas las frases: de bloques conversacionales o de phrases directas
  const conversationalBlocks = lessonContent?.conversationalBlocks || [];
  const directPhrases = lessonContent?.phrases || [];
  
  // Si hay bloques conversacionales, extraer todas las frases de todos los bloques
  const allPhrases = conversationalBlocks.length > 0
    ? conversationalBlocks.flatMap(block => block.phrases)
    : directPhrases;
  
  const currentPhrase = allPhrases[currentPhraseIndex];
  const totalPhrases = allPhrases.length;
  const currentInput = lessonContent?.inputContent[currentInputIndex];
  const totalInputs = lessonContent?.inputContent.length || 0;

  // Core exercises v2.0 - Todos los tipos disponibles
  const vocabularyExercises = lessonContent?.coreExercises?.vocabulary || [];
  const pragmaExercises = lessonContent?.coreExercises?.pragmaStrike || [];
  const shardExercises = lessonContent?.coreExercises?.shardDetection || [];
  const echoStreamExercises = lessonContent?.coreExercises?.echoStream || [];
  const glyphWeavingExercises =
    lessonContent?.coreExercises?.glyphWeaving || [];
  const resonancePathExercises =
    lessonContent?.coreExercises?.resonancePath || [];

  // Debug: verificar carga de ejercicios core
  useEffect(() => {
    if (lessonContent) {
      console.log("[Lesson Content Debug]", {
        hasCoreExercises: !!lessonContent.coreExercises,
        pragmaStrike: lessonContent.coreExercises?.pragmaStrike?.length || 0,
        shardDetection:
          lessonContent.coreExercises?.shardDetection?.length || 0,
        echoStream: lessonContent.coreExercises?.echoStream?.length || 0,
        glyphWeaving: lessonContent.coreExercises?.glyphWeaving?.length || 0,
        resonancePath: lessonContent.coreExercises?.resonancePath?.length || 0,
        pragmaExercisesLength: pragmaExercises.length,
        shardExercisesLength: shardExercises.length,
      });
    }
  }, [lessonContent, pragmaExercises.length, shardExercises.length]);

  const currentVocabulary = vocabularyExercises[currentVocabularyIndex];
  const currentPragma = pragmaExercises[currentPragmaIndex];
  const currentShard = shardExercises[currentShardIndex];
  const currentEchoStream = echoStreamExercises[currentEchoStreamIndex];
  const currentGlyphWeaving = glyphWeavingExercises[currentGlyphWeavingIndex];
  const currentResonancePath =
    resonancePathExercises[currentResonancePathIndex];

  // Calcular total de ejercicios (clásicos + core v2.0)
  const totalClassicExercises = totalPhrases * 2; // Cada frase tiene 2 ejercicios (cloze, variations) - Shadowing fusionado con Resonance Path
  const totalCoreExercises =
    vocabularyExercises.length +
    pragmaExercises.length +
    shardExercises.length +
    echoStreamExercises.length +
    glyphWeavingExercises.length +
    resonancePathExercises.length;
  const totalExercises = totalClassicExercises + totalCoreExercises;

  // Debug: verificar que los ejercicios se están cargando correctamente
  useEffect(() => {
    if (lessonContent && phase === "exercises") {
      console.log("[Exercise State]", {
        currentExerciseType,
        currentPragmaIndex,
        pragmaExercisesCount: pragmaExercises.length,
        currentPragma: currentPragma?.id,
        currentPhraseIndex,
        totalPhrases,
        currentShardIndex,
        shardExercisesCount: shardExercises.length,
        currentEchoStreamIndex,
        echoStreamExercisesCount: echoStreamExercises.length,
        currentGlyphWeavingIndex,
        glyphWeavingExercisesCount: glyphWeavingExercises.length,
        currentResonancePathIndex,
        resonancePathExercisesCount: resonancePathExercises.length,
        totalExercises,
        completedExercises: Array.from(completedExercises),
      });
    }
  }, [
    currentExerciseType,
    currentPragmaIndex,
    currentPhraseIndex,
    currentShardIndex,
    currentEchoStreamIndex,
    currentGlyphWeavingIndex,
    currentResonancePathIndex,
    lessonContent,
    phase,
    pragmaExercises,
    currentPragma,
    shardExercises,
    echoStreamExercises,
    glyphWeavingExercises,
    resonancePathExercises,
    totalExercises,
    completedExercises,
  ]);

  const selectMode = useCallback(
    (mode: LessonMode) => {
      setLessonMode(mode);
      setCorrectAnswers(0);
      setCompletedExercises(new Set()); // Reset completion tracking

      if (mode === "academia") {
        // En modo academia, mostrar menú de ejercicios
        setPhase("exercise-menu");
      } else {
        // En modo desafío, ir directamente a ejercicios secuenciales
        setPhase("exercises");

        // Decidir qué tipo de ejercicio mostrar primero
        // Prioridad: Vocabulary -> Pragma Strike -> Phrases -> Shard Detection
        if (
          lessonContent?.coreExercises?.vocabulary &&
          lessonContent.coreExercises.vocabulary.length > 0
        ) {
          setCurrentExerciseType("vocabulary");
          setCurrentVocabularyIndex(0);
        } else if (
          lessonContent?.coreExercises?.pragmaStrike &&
          lessonContent.coreExercises.pragmaStrike.length > 0
        ) {
          setCurrentExerciseType("pragmaStrike");
          setCurrentPragmaIndex(0);
        } else if (lessonContent?.phrases && lessonContent.phrases.length > 0) {
          setCurrentExerciseType("phrases");
          setPhrasePhase("cloze");
          setCurrentPhraseIndex(0);
        } else if (
          lessonContent?.coreExercises?.shardDetection &&
          lessonContent.coreExercises.shardDetection.length > 0
        ) {
          setCurrentExerciseType("shardDetection");
          setCurrentShardIndex(0);
        }

        // Iniciar timer si es modo desafío
        if (lessonContent?.modeConfig?.desafio.timeLimit) {
          const limitMinutes = lessonContent.modeConfig.desafio.timeLimit;
          setTimeRemaining(limitMinutes * 60); // Convertir a segundos
          setStartTime(Date.now());
        }
      }
    },
    [lessonContent]
  );

  // Función para seleccionar un ejercicio desde el menú
  const selectExercise = useCallback(
    (exercise: {
      type:
        | "phrases"
        | "vocabulary"
        | "pragmaStrike"
        | "shardDetection"
        | "echoStream"
        | "glyphWeaving"
        | "resonancePath";
      phraseIndex?: number;
      phrasePhase?: PhrasePhase;
      vocabularyIndex?: number;
      pragmaIndex?: number;
      shardIndex?: number;
      echoStreamIndex?: number;
      glyphWeavingIndex?: number;
      resonancePathIndex?: number;
    }) => {
      setSelectedExercise(exercise);
      setCurrentExerciseType(exercise.type);

      if (
        exercise.type === "phrases" &&
        exercise.phraseIndex !== undefined &&
        exercise.phrasePhase
      ) {
        setCurrentPhraseIndex(exercise.phraseIndex);
        setPhrasePhase(exercise.phrasePhase);
      } else if (
        exercise.type === "vocabulary" &&
        exercise.vocabularyIndex !== undefined
      ) {
        setCurrentVocabularyIndex(exercise.vocabularyIndex);
      } else if (
        exercise.type === "pragmaStrike" &&
        exercise.pragmaIndex !== undefined
      ) {
        setCurrentPragmaIndex(exercise.pragmaIndex);
      } else if (
        exercise.type === "shardDetection" &&
        exercise.shardIndex !== undefined
      ) {
        setCurrentShardIndex(exercise.shardIndex);
      } else if (
        exercise.type === "echoStream" &&
        exercise.echoStreamIndex !== undefined
      ) {
        setCurrentEchoStreamIndex(exercise.echoStreamIndex);
      } else if (
        exercise.type === "glyphWeaving" &&
        exercise.glyphWeavingIndex !== undefined
      ) {
        setCurrentGlyphWeavingIndex(exercise.glyphWeavingIndex);
      } else if (
        exercise.type === "resonancePath" &&
        exercise.resonancePathIndex !== undefined
      ) {
        setCurrentResonancePathIndex(exercise.resonancePathIndex);
      }

      setPhase("exercises");
    },
    []
  );

  // Función para volver al menú después de completar un ejercicio
  const returnToMenu = useCallback(() => {
    // Guardar progreso antes de salir
    if (lessonContent) {
      // El progreso ya se guarda automáticamente en completedExercises
      // que se persiste en el estado del componente
    }

    setPhase("exercise-menu");
    setSelectedExercise(null);
  }, [lessonContent]);

  // Rastrear tiempo de inicio de ejercicio para confirmación de salida
  useEffect(() => {
    if (phase === "exercises" && selectedExercise) {
      setExerciseStartTime(Date.now());
    } else if (phase === "exercise-menu") {
      setExerciseStartTime(null);
    }
  }, [phase, selectedExercise]);

  const handleReturnToMenuWithConfirm = useCallback(() => {
    const timeSpent = exerciseStartTime
      ? (Date.now() - exerciseStartTime) / 1000
      : 0;

    // Si ha pasado más de 10 segundos, pedir confirmación
    if (timeSpent > 10 && lessonMode === "academia") {
      setShowExitConfirm(true);
    } else {
      returnToMenu();
    }
  }, [exerciseStartTime, lessonMode, returnToMenu]);

  // Timer para modo desafío
  useEffect(() => {
    if (
      lessonMode === "desafio" &&
      timeRemaining !== null &&
      timeRemaining > 0 &&
      phase !== "complete"
    ) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // Tiempo agotado
            setPhase("complete");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lessonMode, timeRemaining, phase]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClozeComplete = useCallback(
    (correct: boolean) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      const multiplier =
        lessonMode === "academia"
          ? lessonContent.modeConfig.academia.xpMultiplier
          : lessonContent.modeConfig.desafio.xpMultiplier;

      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
        addXP(Math.round(XP_RULES.clozeCorrect * multiplier));
      } else {
        addXP(Math.round(XP_RULES.clozeIncorrect * multiplier));
      }

      // Marcar ejercicio como completado
      const exerciseId = `phrase-${currentPhraseIndex}-cloze`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      if (lessonMode === "academia") {
        // En modo academia, pasar a la siguiente frase del mismo tipo (cloze)
        if (currentPhraseIndex < totalPhrases - 1) {
          setCurrentPhraseIndex((prev) => prev + 1);
          // Mantener el mismo tipo de ejercicio (cloze)
        } else {
          // Todas las frases completadas, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente (saltar shadowing, ir a variations)
        setPhrasePhase("variations");
      }
    },
    [
      addXP,
      lessonMode,
      lessonContent,
      currentPhraseIndex,
      totalPhrases,
      returnToMenu,
    ]
  );

  const handleShadowingComplete = useCallback(() => {
    if (!lessonMode || !lessonContent?.modeConfig) return;

    const multiplier =
      lessonMode === "academia"
        ? lessonContent.modeConfig.academia.xpMultiplier
        : lessonContent.modeConfig.desafio.xpMultiplier;

    addXP(Math.round(XP_RULES.shadowingComplete * multiplier));

    // Marcar ejercicio como completado
    const exerciseId = `phrase-${currentPhraseIndex}-shadowing`;
    setCompletedExercises((prev) => new Set(prev).add(exerciseId));

    if (lessonMode === "academia") {
      // En modo academia, pasar a la siguiente frase del mismo tipo (shadowing)
      if (currentPhraseIndex < totalPhrases - 1) {
        setCurrentPhraseIndex((prev) => prev + 1);
        // Mantener el mismo tipo de ejercicio (shadowing)
      } else {
        // Todas las frases completadas, volver al menú
        returnToMenu();
      }
    } else {
      // En modo desafío, continuar secuencialmente
      setPhrasePhase("variations");
    }
  }, [
    addXP,
    lessonMode,
    lessonContent,
    currentPhraseIndex,
    totalPhrases,
    returnToMenu,
  ]);

  const moveToNextExerciseType = useCallback(() => {
    if (!lessonContent) return;

    const hasVocabulary =
      (lessonContent.coreExercises?.vocabulary?.length || 0) > 0;
    const hasPhrases = (lessonContent.phrases?.length || 0) > 0 || (lessonContent.conversationalBlocks?.length || 0) > 0;
    const hasPragmaStrike =
      (lessonContent.coreExercises?.pragmaStrike?.length || 0) > 0;
    const hasShardDetection =
      (lessonContent.coreExercises?.shardDetection?.length || 0) > 0;
    const hasEchoStream =
      (lessonContent.coreExercises?.echoStream?.length || 0) > 0;
    const hasGlyphWeaving =
      (lessonContent.coreExercises?.glyphWeaving?.length || 0) > 0;
    const hasResonancePath =
      (lessonContent.coreExercises?.resonancePath?.length || 0) > 0;

    // Secuencia: Vocabulary -> Pragma Strike -> Phrases -> Shard Detection -> Echo Stream -> Glyph Weaving -> Resonance Path -> Input -> Test
    if (currentExerciseType === "vocabulary" && hasPragmaStrike) {
      setCurrentExerciseType("pragmaStrike");
      setCurrentPragmaIndex(0);
    } else if (currentExerciseType === "vocabulary" && hasPhrases) {
      setCurrentExerciseType("phrases");
      setPhrasePhase("cloze");
      setCurrentPhraseIndex(0);
    } else if (currentExerciseType === "pragmaStrike" && hasPhrases) {
      setCurrentExerciseType("phrases");
      setPhrasePhase("cloze");
      setCurrentPhraseIndex(0);
    } else if (currentExerciseType === "phrases" && hasShardDetection) {
      setCurrentExerciseType("shardDetection");
      setCurrentShardIndex(0);
    } else if (currentExerciseType === "shardDetection" && hasEchoStream) {
      setCurrentExerciseType("echoStream");
      setCurrentEchoStreamIndex(0);
    } else if (currentExerciseType === "echoStream" && hasGlyphWeaving) {
      setCurrentExerciseType("glyphWeaving");
      setCurrentGlyphWeavingIndex(0);
    } else if (currentExerciseType === "glyphWeaving" && hasResonancePath) {
      setCurrentExerciseType("resonancePath");
      setCurrentResonancePathIndex(0);
    } else {
      // All exercises completed, move to input
      if (lessonContent.inputContent && lessonContent.inputContent.length > 0) {
        setPhase("input");
        setCurrentInputIndex(0);
      } else if (lessonContent.miniTest) {
        setPhase("test");
      } else {
        setPhase("complete");
      }
    }
  }, [currentExerciseType, lessonContent]);

  const handleVariationsComplete = useCallback(() => {
    if (!lessonMode || !lessonContent?.modeConfig) return;

    const multiplier =
      lessonMode === "academia"
        ? lessonContent.modeConfig.academia.xpMultiplier
        : lessonContent.modeConfig.desafio.xpMultiplier;

    addXP(Math.round(XP_RULES.variationRead * multiplier));

    // Marcar ejercicio como completado
    const exerciseId = `phrase-${currentPhraseIndex}-variations`;
    setCompletedExercises((prev) => new Set(prev).add(exerciseId));

    if (lessonMode === "academia") {
      // En modo academia, pasar a la siguiente frase del mismo tipo (variations)
      if (currentPhraseIndex < totalPhrases - 1) {
        setCurrentPhraseIndex((prev) => prev + 1);
        // Mantener el mismo tipo de ejercicio (variations)
      } else {
        // Todas las frases completadas, volver al menú
        returnToMenu();
      }
    } else {
      // En modo desafío, continuar secuencialmente
      if (currentPhraseIndex < totalPhrases - 1) {
        setCurrentPhraseIndex((prev) => prev + 1);
        setPhrasePhase("cloze");
      } else {
        // All phrases completed, check for core exercises or move to next phase
        moveToNextExerciseType();
      }
    }
  }, [
    currentPhraseIndex,
    totalPhrases,
    lessonContent,
    addXP,
    lessonMode,
    moveToNextExerciseType,
    returnToMenu,
  ]);

  const handleVocabularyComplete = useCallback(
    (correct: boolean) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      // XP ya se calcula dentro del componente VocabularyExercise
      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Marcar ejercicio como completado
      const exerciseId = `vocabulary-${currentVocabularyIndex}`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      const vocabularyCount =
        lessonContent?.coreExercises?.vocabulary?.length || 0;

      if (lessonMode === "academia") {
        // En modo academia, pasar al siguiente ejercicio Vocabulary
        if (currentVocabularyIndex < vocabularyCount - 1) {
          setCurrentVocabularyIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Vocabulary completados, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente
        if (currentVocabularyIndex < vocabularyCount - 1) {
          // Hay más ejercicios Vocabulary, pasar al siguiente
          setCurrentVocabularyIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Vocabulary completados, pasar al siguiente tipo
          moveToNextExerciseType();
        }
      }
    },
    [
      currentVocabularyIndex,
      lessonMode,
      lessonContent,
      moveToNextExerciseType,
      returnToMenu,
    ]
  );

  const handlePragmaComplete = useCallback(
    (correct: boolean, timeSpent: number) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      // XP ya se calcula dentro del componente PragmaStrikeExercise
      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Marcar ejercicio como completado
      const exerciseId = `pragma-${currentPragmaIndex}`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      const pragmaCount =
        lessonContent?.coreExercises?.pragmaStrike?.length || 0;

      if (lessonMode === "academia") {
        // En modo academia, pasar al siguiente ejercicio Pragma Strike
        if (currentPragmaIndex < pragmaCount - 1) {
          setCurrentPragmaIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Pragma Strike completados, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente
        if (currentPragmaIndex < pragmaCount - 1) {
          // Hay más ejercicios Pragma Strike, pasar al siguiente
          setCurrentPragmaIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Pragma Strike completados, pasar al siguiente tipo
          moveToNextExerciseType();
        }
      }
    },
    [
      currentPragmaIndex,
      lessonMode,
      lessonContent,
      moveToNextExerciseType,
      returnToMenu,
    ]
  );

  const handleShardComplete = useCallback(
    (correct: boolean, timeSpent: number) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      // XP ya se calcula dentro del componente ShardDetectionExercise
      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Marcar ejercicio como completado
      const exerciseId = `shard-${currentShardIndex}`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      const shardCount =
        lessonContent?.coreExercises?.shardDetection?.length || 0;

      if (lessonMode === "academia") {
        // En modo academia, pasar al siguiente ejercicio Shard Detection
        if (currentShardIndex < shardCount - 1) {
          setCurrentShardIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Shard Detection completados, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente
        if (currentShardIndex < shardCount - 1) {
          // Hay más ejercicios Shard Detection, pasar al siguiente
          setCurrentShardIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Shard Detection completados, pasar al siguiente tipo
          moveToNextExerciseType();
        }
      }
    },
    [
      currentShardIndex,
      lessonMode,
      lessonContent,
      moveToNextExerciseType,
      returnToMenu,
    ]
  );

  const handleEchoStreamComplete = useCallback(
    (correct: boolean, accuracy: number) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Marcar ejercicio como completado
      const exerciseId = `echoStream-${currentEchoStreamIndex}`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      const echoStreamCount =
        lessonContent?.coreExercises?.echoStream?.length || 0;

      if (lessonMode === "academia") {
        // En modo academia, pasar al siguiente ejercicio Echo Stream
        if (currentEchoStreamIndex < echoStreamCount - 1) {
          setCurrentEchoStreamIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Echo Stream completados, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente
        if (currentEchoStreamIndex < echoStreamCount - 1) {
          setCurrentEchoStreamIndex((prev) => prev + 1);
        } else {
          moveToNextExerciseType();
        }
      }
    },
    [
      currentEchoStreamIndex,
      lessonMode,
      lessonContent,
      moveToNextExerciseType,
      returnToMenu,
    ]
  );

  const handleGlyphWeavingComplete = useCallback(
    (correct: boolean, syncAccuracy: number) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      if (correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Marcar ejercicio como completado
      const exerciseId = `glyphWeaving-${currentGlyphWeavingIndex}`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      const glyphWeavingCount =
        lessonContent?.coreExercises?.glyphWeaving?.length || 0;

      if (lessonMode === "academia") {
        // En modo academia, pasar al siguiente ejercicio Glyph Weaving
        if (currentGlyphWeavingIndex < glyphWeavingCount - 1) {
          setCurrentGlyphWeavingIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Glyph Weaving completados, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente
        if (currentGlyphWeavingIndex < glyphWeavingCount - 1) {
          setCurrentGlyphWeavingIndex((prev) => prev + 1);
        } else {
          moveToNextExerciseType();
        }
      }
    },
    [
      currentGlyphWeavingIndex,
      lessonMode,
      lessonContent,
      moveToNextExerciseType,
      returnToMenu,
    ]
  );

  const handleResonancePathComplete = useCallback(
    (accuracy: number) => {
      if (!lessonMode || !lessonContent?.modeConfig) return;

      // Determinar si es correcto basándose en la precisión objetivo
      const currentExercise = resonancePathExercises[currentResonancePathIndex];
      const targetAccuracy = currentExercise?.targetAccuracy || 80;
      const isCorrect = accuracy >= targetAccuracy;

      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Marcar ejercicio como completado
      const exerciseId = `resonancePath-${currentResonancePathIndex}`;
      setCompletedExercises((prev) => new Set(prev).add(exerciseId));

      const resonancePathCount =
        lessonContent?.coreExercises?.resonancePath?.length || 0;

      if (lessonMode === "academia") {
        // En modo academia, pasar al siguiente ejercicio Resonance Path
        if (currentResonancePathIndex < resonancePathCount - 1) {
          setCurrentResonancePathIndex((prev) => prev + 1);
        } else {
          // Todos los ejercicios Resonance Path completados, volver al menú
          returnToMenu();
        }
      } else {
        // En modo desafío, continuar secuencialmente
        if (currentResonancePathIndex < resonancePathCount - 1) {
          setCurrentResonancePathIndex((prev) => prev + 1);
        } else {
          moveToNextExerciseType();
        }
      }
    },
    [
      currentResonancePathIndex,
      lessonMode,
      lessonContent,
      resonancePathExercises,
      moveToNextExerciseType,
      returnToMenu,
    ]
  );

  const handleInputComplete = useCallback(() => {
    if (currentInputIndex < totalInputs - 1) {
      setCurrentInputIndex((prev) => prev + 1);
    } else {
      // All inputs completed, move to test
      if (lessonContent?.miniTest) {
        setPhase("test");
      } else {
        setPhase("complete");
      }
    }
  }, [currentInputIndex, totalInputs, lessonContent]);

  const handleTestComplete = useCallback(
    (passed: boolean, score: number) => {
      if (passed && lessonMode && lessonContent?.modeConfig) {
        const multiplier =
          lessonMode === "academia"
            ? lessonContent.modeConfig.academia.xpMultiplier
            : lessonContent.modeConfig.desafio.xpMultiplier;

        addXP(Math.round(XP_RULES.miniTestPassed * multiplier));

        // Recompensa especial en modo desafío
        if (
          lessonMode === "desafio" &&
          lessonContent.modeConfig.desafio.gemsReward
        ) {
          addGems(lessonContent.modeConfig.desafio.gemsReward);
        }
      }
      setPhase("complete");
    },
    [addXP, addGems, lessonMode, lessonContent]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (error || !leaf || !branch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-4xl mb-4">🍂</span>
        <p className="text-gray-600 dark:text-gray-400">
          {error || "Hoja no encontrada"}
        </p>
        <button
          onClick={() => router.push("/tree")}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg"
        >
          Volver al árbol
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto w-full">
      {/* Back button */}
      <motion.button
        onClick={() => router.push("/tree")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span>←</span>
        <span>Volver al árbol</span>
      </motion.button>

      {/* Header */}
      <motion.div
        className="rounded-2xl overflow-hidden shadow-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="p-6 text-white"
          style={{ backgroundColor: branch.color }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{leaf.icon || branch.icon}</span>
            <div>
              <p className="text-sm opacity-80">{branch.title}</p>
              <h1 className="text-xl font-bold">{leaf.title}</h1>
            </div>
          </div>
          <p className="text-sm opacity-90 italic">{leaf.titleFr}</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Intro Phase */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {!lessonContent ? (
              // Coming soon placeholder
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-5xl mb-4 block">🚧</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Contenido próximamente
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Estamos preparando ejercicios interactivos para este tema.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <span>⏱️</span>
                  <span>
                    Duración estimada: {leaf.estimatedMinutes} minutos
                  </span>
        </div>
      </motion.div>
            ) : (
              // Lesson content available
              <>
      <motion.div
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>📌</span>
          Gramática que aprenderás
        </h3>
        <ul className="space-y-2">
          {leaf.grammar.map((g, i) => (
            <motion.li
              key={i}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {g}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>🎯</span>
          Lo que incluirá esta lección
        </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    {totalPhrases > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span>📝</span>
                        <span>
                          {conversationalBlocks.length > 0
                            ? `${conversationalBlocks.length} bloques (${totalPhrases} frases)`
                            : `${totalPhrases} frases con ejercicios`}
                        </span>
                      </div>
                    )}
                    {vocabularyExercises.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span>📚</span>
                        <span>
                          {vocabularyExercises.length} ejercicios Vocabulario
                        </span>
                      </div>
                    )}
                    {pragmaExercises.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span>⚡</span>
                        <span>
                          {pragmaExercises.length} ejercicios Pragma Strike
                        </span>
                      </div>
                    )}
                    {shardExercises.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span>🔍</span>
                        <span>
                          {shardExercises.length} ejercicios Shard Detection
                        </span>
                      </div>
                    )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>📘</span>
                      <span>{totalInputs} input comprensible</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>🎧</span>
            <span>Audio nativo</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>✅</span>
            <span>Mini-test</span>
          </div>
        </div>
                  {/* Opciones de modo - mostrar solo el modo seleccionado o ambos si no hay selección */}
                  <div className="space-y-3">
                    {lessonMode === null ? (
                      // Mostrar ambos modos para seleccionar
                      <>
                        <motion.button
                          onClick={() => selectMode("academia")}
                          className="w-full p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">🎓</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Modo Academia
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Aprende a tu ritmo con ayuda y práctica
                              </p>
                              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <li>✓ Sin límite de tiempo</li>
                                <li>✓ Pistas y explicaciones disponibles</li>
                                <li>✓ Reintentos ilimitados</li>
                                <li>✓ XP estándar</li>
                              </ul>
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          onClick={() => selectMode("desafio")}
                          className="w-full p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 transition-all text-left"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">⚡</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Modo Desafío
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Prueba tus habilidades bajo presión
                              </p>
                              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <li>
                                  ⚡ Límite de tiempo:{" "}
                                  {lessonContent.modeConfig?.desafio.timeLimit ||
                                    15}{" "}
                                  min
                                </li>
                                <li>⚡ Sin pistas ni explicaciones</li>
                                <li>⚡ Sin reintentos</li>
                                <li>
                                  ⚡{" "}
                                  {Math.round(
                                    (lessonContent.modeConfig?.desafio
                                      .xpMultiplier || 1.5) * 100
                                  )}
                                  % más XP +{" "}
                                  {lessonContent.modeConfig?.desafio.gemsReward ||
                                    10}{" "}
                                  gems
                                </li>
                              </ul>
                            </div>
                          </div>
                        </motion.button>
                      </>
                    ) : (
                      // Mostrar solo el modo seleccionado
                      <motion.div
                        className={`w-full p-4 rounded-xl border-2 text-left ${
                          lessonMode === "academia"
                            ? "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800"
                            : "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800"
                        }`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">
                            {lessonMode === "academia" ? "🎓" : "⚡"}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {lessonMode === "academia"
                                ? "Modo Academia"
                                : "Modo Desafío"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {lessonMode === "academia"
                                ? "Aprende a tu ritmo con ayuda y práctica"
                                : "Prueba tus habilidades bajo presión"}
                            </p>
                            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              {lessonMode === "academia" ? (
                                <>
                                  <li>✓ Sin límite de tiempo</li>
                                  <li>✓ Pistas y explicaciones disponibles</li>
                                  <li>✓ Reintentos ilimitados</li>
                                  <li>✓ XP estándar</li>
                                </>
                              ) : (
                                <>
                                  <li>
                                    ⚡ Límite de tiempo:{" "}
                                    {lessonContent.modeConfig?.desafio
                                      .timeLimit || 15}{" "}
                                    min
                                  </li>
                                  <li>⚡ Sin pistas ni explicaciones</li>
                                  <li>⚡ Sin reintentos</li>
                                  <li>
                                    ⚡{" "}
                                    {Math.round(
                                      (lessonContent.modeConfig?.desafio
                                        .xpMultiplier || 1.5) * 100
                                    )}
                                    % más XP +{" "}
                                    {lessonContent.modeConfig?.desafio
                                      .gemsReward || 10}{" "}
                                    gems
                                  </li>
                                </>
                              )}
                            </ul>
                            <button
                              onClick={() => setLessonMode(null)}
                              className="mt-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
                            >
                              Cambiar modo
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
      </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Exercise Menu Phase - Solo en modo Academia */}
        {phase === "exercise-menu" &&
          lessonMode === "academia" &&
          lessonContent && (
            <motion.div
              key="exercise-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      🎓 Menú de Ejercicios
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Nivel {levelInfo.level}: {levelInfo.title}
                    </p>
    </div>
                  <button
                    onClick={() => setPhase("intro")}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    ← Cambiar modo
                  </button>
                </div>

                {/* Ejercicios de Frases */}
                {totalPhrases > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-lg">📝</span>
                        <span>
                          {conversationalBlocks.length > 0
                            ? `Ejercicios de Bloques (${conversationalBlocks.length} bloques)`
                            : "Ejercicios de Frases"}
                        </span>
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {totalPhrases} frases
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        ["cloze", "variations"] as PhrasePhase[]
                      ).map((exercisePhase) => {
                        // Contar cuántas frases de este tipo están completadas
                        const completedCount = Array.from(
                          completedExercises
                        ).filter((id) =>
                          id.endsWith(`-${exercisePhase}`)
                        ).length;
                        const isFullyCompleted =
                          completedCount === totalPhrases;
                        const progressPercent =
                          (completedCount / totalPhrases) * 100;

                        const exerciseNames = {
                          cloze: "Cloze",
                          shadowing: "Shadowing",
                          variations: "Variaciones",
                        };
                        const exerciseIcons = {
                          cloze: "✏️",
                          shadowing: "🎤",
                          variations: "🔄",
                        };
                        const exerciseGradients = {
                          cloze: "from-blue-500 to-cyan-500",
                          shadowing: "from-purple-500 to-pink-500",
                          variations: "from-orange-500 to-red-500",
                        };
                        const exerciseBorders = {
                          cloze: "border-blue-300 dark:border-blue-700",
                          shadowing: "border-purple-300 dark:border-purple-700",
                          variations:
                            "border-orange-300 dark:border-orange-700",
                        };

                        // Encontrar la primera frase no completada de este tipo
                        const findFirstIncomplete = () => {
                          for (let i = 0; i < totalPhrases; i++) {
                            const exerciseId = `phrase-${i}-${exercisePhase}`;
                            if (!completedExercises.has(exerciseId)) {
                              return i;
                            }
                          }
                          return 0; // Si todas están completadas, empezar desde el principio
                        };

                        return (
                          <motion.button
                            key={exercisePhase}
                            onClick={() =>
                              selectExercise({
                                type: "phrases",
                                phraseIndex: findFirstIncomplete(),
                                phrasePhase: exercisePhase,
                              })
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative overflow-hidden rounded-lg p-3 text-center transition-all border ${
                              isFullyCompleted
                                ? `bg-gradient-to-br ${exerciseGradients[exercisePhase]} text-white ${exerciseBorders[exercisePhase]} shadow-md`
                                : `bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600`
                            }`}
                          >
                            {isFullyCompleted && (
                              <motion.div
                                className="absolute top-1 right-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                              >
                                <span className="text-sm">✓</span>
                              </motion.div>
                            )}

                            <div className="flex flex-col items-center gap-1.5">
                              <div className="text-2xl">
                                {exerciseIcons[exercisePhase]}
                              </div>

                              <div
                                className={`font-bold text-xs ${
                                  isFullyCompleted
                                    ? "text-white"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {exerciseNames[exercisePhase]}
                              </div>

                              <div className="w-full">
                                <div
                                  className={`flex items-center justify-between mb-0.5 text-[10px] ${
                                    isFullyCompleted
                                      ? "text-white/90"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  <span>
                                    {completedCount}/{totalPhrases}
                                  </span>
                                  <span>{Math.round(progressPercent)}%</span>
                                </div>
                                <div
                                  className={`h-1 rounded-full overflow-hidden ${
                                    isFullyCompleted
                                      ? "bg-white/30"
                                      : "bg-gray-200 dark:bg-gray-700"
                                  }`}
                                >
                                  <motion.div
                                    className={`h-full rounded-full ${
                                      isFullyCompleted
                                        ? "bg-white"
                                        : `bg-gradient-to-r ${exerciseGradients[exercisePhase]}`
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ejercicios Vocabulary - Un solo botón */}
                {vocabularyExercises.length > 0 && (() => {
                  const completedVocabularyCount = vocabularyExercises.filter((_, idx) => 
                    completedExercises.has(`vocabulary-${idx}`)
                  ).length;
                  const isFullyCompleted = completedVocabularyCount === vocabularyExercises.length;
                  const progressPercent = vocabularyExercises.length > 0 
                    ? (completedVocabularyCount / vocabularyExercises.length) * 100 
                    : 0;

                  // Encontrar el primer ejercicio no completado
                  const findFirstIncomplete = () => {
                    for (let i = 0; i < vocabularyExercises.length; i++) {
                      const exerciseId = `vocabulary-${i}`;
                      if (!completedExercises.has(exerciseId)) {
                        return i;
                      }
                    }
                    return 0; // Si todas están completadas, empezar desde el principio
                  };

                  return (
                    <div className="mb-4">
                      <motion.button
                        onClick={() =>
                          selectExercise({
                            type: "vocabulary",
                            vocabularyIndex: findFirstIncomplete(),
                          })
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border ${
                          isFullyCompleted
                            ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-blue-300 dark:border-blue-700 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                        }`}
                      >
                        {isFullyCompleted && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <span className="text-sm">✓</span>
                          </motion.div>
                        )}

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-3xl">📚</div>
                          <div
                            className={`font-bold text-sm ${
                              isFullyCompleted
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            Vocabulario
                          </div>
                          <div className="w-full">
                            <div
                              className={`flex items-center justify-between mb-0.5 text-xs ${
                                isFullyCompleted
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span>
                                {completedVocabularyCount}/{vocabularyExercises.length} ejercicios
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div
                              className={`h-1 rounded-full overflow-hidden ${
                                isFullyCompleted
                                  ? "bg-white/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  isFullyCompleted
                                    ? "bg-white"
                                    : "bg-gradient-to-r from-blue-400 to-indigo-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Ejercicios Pragma Strike - Un solo botón */}
                {pragmaExercises.length > 0 && (() => {
                  const completedPragmaCount = pragmaExercises.filter((_, idx) => 
                    completedExercises.has(`pragma-${idx}`)
                  ).length;
                  const isFullyCompleted = completedPragmaCount === pragmaExercises.length;
                  const progressPercent = pragmaExercises.length > 0 
                    ? (completedPragmaCount / pragmaExercises.length) * 100 
                    : 0;

                  // Encontrar el primer ejercicio no completado
                  const findFirstIncomplete = () => {
                    for (let i = 0; i < pragmaExercises.length; i++) {
                      const exerciseId = `pragma-${i}`;
                      if (!completedExercises.has(exerciseId)) {
                        return i;
                      }
                    }
                    return 0; // Si todas están completadas, empezar desde el principio
                  };

                  return (
                    <div className="mb-4">
                      <motion.button
                        onClick={() =>
                          selectExercise({
                            type: "pragmaStrike",
                            pragmaIndex: findFirstIncomplete(),
                          })
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border ${
                          isFullyCompleted
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300 dark:border-yellow-700 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-600"
                        }`}
                      >
                        {isFullyCompleted && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <span className="text-sm">✓</span>
                          </motion.div>
                        )}

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-3xl">💬</div>
                          <div
                            className={`font-bold text-sm ${
                              isFullyCompleted
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            Comunicación Situacional
                          </div>
                          <div className="w-full">
                            <div
                              className={`flex items-center justify-between mb-1 text-xs ${
                                isFullyCompleted
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span>
                                {completedPragmaCount}/{pragmaExercises.length} ejercicios
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div
                              className={`h-2 rounded-full overflow-hidden ${
                                isFullyCompleted
                                  ? "bg-white/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  isFullyCompleted
                                    ? "bg-white"
                                    : "bg-gradient-to-r from-yellow-400 to-orange-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Ejercicios Shard Detection - Un solo botón */}
                {shardExercises.length > 0 && (() => {
                  const completedShardCount = shardExercises.filter((_, idx) => 
                    completedExercises.has(`shard-${idx}`)
                  ).length;
                  const isFullyCompleted = completedShardCount === shardExercises.length;
                  const progressPercent = shardExercises.length > 0 
                    ? (completedShardCount / shardExercises.length) * 100 
                    : 0;

                  // Encontrar el primer ejercicio no completado
                  const findFirstIncomplete = () => {
                    for (let i = 0; i < shardExercises.length; i++) {
                      const exerciseId = `shard-${i}`;
                      if (!completedExercises.has(exerciseId)) {
                        return i;
                      }
                    }
                    return 0; // Si todas están completadas, empezar desde el principio
                  };

                  return (
                    <div className="mb-4">
                      <motion.button
                        onClick={() =>
                          selectExercise({
                            type: "shardDetection",
                            shardIndex: findFirstIncomplete(),
                          })
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border ${
                          isFullyCompleted
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-300 dark:border-emerald-700 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600"
                        }`}
                      >
                        {isFullyCompleted && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <span className="text-sm">✓</span>
                          </motion.div>
                        )}

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-3xl">🎯</div>
                          <div
                            className={`font-bold text-sm ${
                              isFullyCompleted
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            Reconocimiento de Audio
                          </div>
                          <div className="w-full">
                            <div
                              className={`flex items-center justify-between mb-1 text-xs ${
                                isFullyCompleted
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span>
                                {completedShardCount}/{shardExercises.length} ejercicios
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div
                              className={`h-2 rounded-full overflow-hidden ${
                                isFullyCompleted
                                  ? "bg-white/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  isFullyCompleted
                                    ? "bg-white"
                                    : "bg-gradient-to-br from-emerald-400 to-teal-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Ejercicios Repetición de Audio - Un solo botón */}
                {echoStreamExercises.length > 0 && (() => {
                  const completedEchoStreamCount = echoStreamExercises.filter((_, idx) => 
                    completedExercises.has(`echoStream-${idx}`)
                  ).length;
                  const isFullyCompleted = completedEchoStreamCount === echoStreamExercises.length;
                  const progressPercent = echoStreamExercises.length > 0 
                    ? (completedEchoStreamCount / echoStreamExercises.length) * 100 
                    : 0;

                  // Encontrar el primer ejercicio no completado
                  const findFirstIncomplete = () => {
                    for (let i = 0; i < echoStreamExercises.length; i++) {
                      const exerciseId = `echoStream-${i}`;
                      if (!completedExercises.has(exerciseId)) {
                        return i;
                      }
                    }
                    return 0; // Si todas están completadas, empezar desde el principio
                  };

                  return (
                    <div className="mb-4">
                      <motion.button
                        onClick={() =>
                          selectExercise({
                            type: "echoStream",
                            echoStreamIndex: findFirstIncomplete(),
                          })
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border ${
                          isFullyCompleted
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-300 dark:border-cyan-700 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600"
                        }`}
                      >
                        {isFullyCompleted && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <span className="text-sm">✓</span>
                          </motion.div>
                        )}

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-3xl">🎧</div>
                          <div
                            className={`font-bold text-sm ${
                              isFullyCompleted
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            Repetición de Audio
                          </div>
                          <div className="w-full">
                            <div
                              className={`flex items-center justify-between mb-1 text-xs ${
                                isFullyCompleted
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span>
                                {completedEchoStreamCount}/{echoStreamExercises.length} ejercicios
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div
                              className={`h-2 rounded-full overflow-hidden ${
                                isFullyCompleted
                                  ? "bg-white/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  isFullyCompleted
                                    ? "bg-white"
                                    : "bg-gradient-to-r from-cyan-400 to-blue-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Ejercicios Construcción de Frases - Un solo botón */}
                {glyphWeavingExercises.length > 0 && (() => {
                  const completedGlyphWeavingCount = glyphWeavingExercises.filter((_, idx) => 
                    completedExercises.has(`glyphWeaving-${idx}`)
                  ).length;
                  const isFullyCompleted = completedGlyphWeavingCount === glyphWeavingExercises.length;
                  const progressPercent = glyphWeavingExercises.length > 0 
                    ? (completedGlyphWeavingCount / glyphWeavingExercises.length) * 100 
                    : 0;

                  // Encontrar el primer ejercicio no completado
                  const findFirstIncomplete = () => {
                    for (let i = 0; i < glyphWeavingExercises.length; i++) {
                      const exerciseId = `glyphWeaving-${i}`;
                      if (!completedExercises.has(exerciseId)) {
                        return i;
                      }
                    }
                    return 0; // Si todas están completadas, empezar desde el principio
                  };

                  return (
                    <div className="mb-4">
                      <motion.button
                        onClick={() =>
                          selectExercise({
                            type: "glyphWeaving",
                            glyphWeavingIndex: findFirstIncomplete(),
                          })
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border ${
                          isFullyCompleted
                            ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white border-violet-300 dark:border-violet-700 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600"
                        }`}
                      >
                        {isFullyCompleted && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <span className="text-sm">✓</span>
                          </motion.div>
                        )}

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-3xl">🔗</div>
                          <div
                            className={`font-bold text-sm ${
                              isFullyCompleted
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            Construcción de Frases
                          </div>
                          <div className="w-full">
                            <div
                              className={`flex items-center justify-between mb-1 text-xs ${
                                isFullyCompleted
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span>
                                {completedGlyphWeavingCount}/{glyphWeavingExercises.length} ejercicios
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div
                              className={`h-2 rounded-full overflow-hidden ${
                                isFullyCompleted
                                  ? "bg-white/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  isFullyCompleted
                                    ? "bg-white"
                                    : "bg-gradient-to-r from-violet-400 to-purple-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Ejercicios Resonance Path - Un solo botón */}
                {resonancePathExercises.length > 0 && (() => {
                  const completedResonancePathCount = resonancePathExercises.filter((_, idx) => 
                    completedExercises.has(`resonancePath-${idx}`)
                  ).length;
                  const isFullyCompleted = completedResonancePathCount === resonancePathExercises.length;
                  const progressPercent = resonancePathExercises.length > 0 
                    ? (completedResonancePathCount / resonancePathExercises.length) * 100 
                    : 0;

                  // Encontrar el primer ejercicio no completado
                  const findFirstIncomplete = () => {
                    for (let i = 0; i < resonancePathExercises.length; i++) {
                      const exerciseId = `resonancePath-${i}`;
                      if (!completedExercises.has(exerciseId)) {
                        return i;
                      }
                    }
                    return 0; // Si todas están completadas, empezar desde el principio
                  };

                  return (
                    <div className="mb-4">
                      <motion.button
                        onClick={() =>
                          selectExercise({
                            type: "resonancePath",
                            resonancePathIndex: findFirstIncomplete(),
                          })
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border ${
                          isFullyCompleted
                            ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white border-pink-300 dark:border-pink-700 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-600"
                        }`}
                      >
                        {isFullyCompleted && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <span className="text-sm">✓</span>
                          </motion.div>
                        )}

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-3xl">🎤</div>
                          <div
                            className={`font-bold text-sm ${
                              isFullyCompleted
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            Entonación
                          </div>
                          <div className="w-full">
                            <div
                              className={`flex items-center justify-between mb-1 text-xs ${
                                isFullyCompleted
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span>
                                {completedResonancePathCount}/{resonancePathExercises.length} ejercicios
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div
                              className={`h-2 rounded-full overflow-hidden ${
                                isFullyCompleted
                                  ? "bg-white/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  isFullyCompleted
                                    ? "bg-white"
                                    : "bg-gradient-to-r from-pink-400 to-rose-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })()}

                {/* Matriz de Janus */}
                {world?.janusMatrix && (
                  <div className="mb-4">
                    <motion.button
                      onClick={() => router.push(`/world/${world.id}/janus`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full relative overflow-hidden rounded-lg p-4 text-center transition-all border bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-300 dark:border-purple-700 shadow-md hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-3xl">🧩</div>
                        <div className="font-bold text-sm">
                          Matriz de Janus
                        </div>
                        <div className="text-xs opacity-90">
                          {world.janusMatrix.title}
                        </div>
                      </div>
                    </motion.button>
                  </div>
                )}

                {/* Resumen de progreso granular */}
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      Progreso total:
                    </span>
                    <span className="text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {completedExercises.size} / {totalExercises}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${
                          (completedExercises.size / totalExercises) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Progreso por categoría */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {totalPhrases > 0 &&
                      (() => {
                        const phrasesCompleted = Array.from(
                          completedExercises
                        ).filter((id) => id.startsWith("phrase-")).length;
                        const totalPhrasesExercises = totalPhrases * 2; // Cloze + Variations
                        return (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-1.5 border border-blue-200 dark:border-blue-800">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                📝
                              </span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {phrasesCompleted}/{totalPhrasesExercises}
                              </span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (phrasesCompleted / totalPhrasesExercises) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                    {pragmaExercises.length > 0 &&
                      (() => {
                        const pragmaCompleted = Array.from(
                          completedExercises
                        ).filter((id) => id.startsWith("pragma-")).length;
                        return (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-1.5 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                ⚡
                              </span>
                              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                {pragmaCompleted}/{pragmaExercises.length}
                              </span>
                            </div>
                            <div className="w-full bg-yellow-200 dark:bg-yellow-900 rounded-full h-1">
                              <div
                                className="bg-yellow-500 h-1 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (pragmaCompleted / pragmaExercises.length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                    {shardExercises.length > 0 &&
                      (() => {
                        const shardCompleted = Array.from(
                          completedExercises
                        ).filter((id) => id.startsWith("shard-")).length;
                        return (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-1.5 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                🔍
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {shardCompleted}/{shardExercises.length}
                              </span>
                            </div>
                            <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1">
                              <div
                                className="bg-emerald-500 h-1 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (shardCompleted / shardExercises.length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                  </div>
                </div>
              </div>
            </motion.div>
          )}

        {/* Exercises Phase - Clásicos y Core v2.0 */}
        {phase === "exercises" && (
          <>
            {/* Botón para volver al menú en modo academia */}
            {lessonMode === "academia" && (
              <div className="mb-4">
                <button
                  onClick={handleReturnToMenuWithConfirm}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Volver al menú</span>
                </button>
              </div>
            )}

            {/* Vocabulary Exercises */}
            {currentExerciseType === "vocabulary" && (
              <>
                {currentVocabulary ? (
                  <motion.div
                    key={`vocabulary-${currentVocabularyIndex}-${currentVocabulary.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Vocabulario {currentVocabularyIndex + 1} de{" "}
                        {vocabularyExercises.length}
                      </div>
                      {lessonMode === "desafio" && timeRemaining !== null && (
                        <div
                          className={`font-bold ${
                            timeRemaining < 60
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          ⏱️ {formatTime(timeRemaining)}
                        </div>
                      )}
                    </div>
                    <VocabularyExercise
                      exercise={currentVocabulary}
                      onComplete={handleVocabularyComplete}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Cargando ejercicio de vocabulario...
                  </div>
                )}
              </>
            )}

            {/* Pragma Strike Exercises */}
            {currentExerciseType === "pragmaStrike" && (
              <>
                {currentPragma ? (
                  <motion.div
                    key={`pragma-${currentPragmaIndex}-${currentPragma.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Comunicación Situacional {currentPragmaIndex + 1} de{" "}
                        {pragmaExercises.length}
                      </div>
                      {lessonMode === "desafio" && timeRemaining !== null && (
                        <div
                          className={`font-bold ${
                            timeRemaining < 60
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          ⏱️ {formatTime(timeRemaining)}
                        </div>
                      )}
                    </div>
                    <PragmaStrikeExercise
                      exercise={currentPragma}
                      onComplete={handlePragmaComplete}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Cargando ejercicio Comunicación Situacional...
                  </div>
                )}
              </>
            )}

            {/* Shard Detection Exercises */}
            {currentExerciseType === "shardDetection" && (
              <>
                {currentShard ? (
                  <motion.div
                    key={`shard-${currentShardIndex}-${currentShard.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Reconocimiento de Audio {currentShardIndex + 1} de{" "}
                        {shardExercises.length}
                      </div>
                      {lessonMode === "desafio" && timeRemaining !== null && (
                        <div
                          className={`font-bold ${
                            timeRemaining < 60
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          ⏱️ {formatTime(timeRemaining)}
                        </div>
                      )}
                    </div>
                    <ShardDetectionExercise
                      exercise={currentShard}
                      onComplete={handleShardComplete}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Cargando ejercicio Reconocimiento de Audio...
                  </div>
                )}
              </>
            )}

            {/* Echo Stream Exercises */}
            {currentExerciseType === "echoStream" && (
              <>
                {currentEchoStream ? (
                  <motion.div
                    key={`echoStream-${currentEchoStreamIndex}-${currentEchoStream.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Repetición de Audio {currentEchoStreamIndex + 1} de{" "}
                        {echoStreamExercises.length}
                      </div>
                      {lessonMode === "desafio" && timeRemaining !== null && (
                        <div
                          className={`font-bold ${
                            timeRemaining < 60
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          ⏱️ {formatTime(timeRemaining)}
                        </div>
                      )}
                    </div>
                    <EchoStreamExercise
                      exercise={currentEchoStream}
                      onComplete={handleEchoStreamComplete}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Cargando ejercicio Repetición de Audio...
                  </div>
                )}
              </>
            )}

            {/* Glyph Weaving Exercises */}
            {currentExerciseType === "glyphWeaving" && (
              <>
                {currentGlyphWeaving ? (
                  <motion.div
                    key={`glyphWeaving-${currentGlyphWeavingIndex}-${currentGlyphWeaving.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Construcción de Frases {currentGlyphWeavingIndex + 1} de{" "}
                        {glyphWeavingExercises.length}
                      </div>
                      {lessonMode === "desafio" && timeRemaining !== null && (
                        <div
                          className={`font-bold ${
                            timeRemaining < 60
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          ⏱️ {formatTime(timeRemaining)}
                        </div>
                      )}
                    </div>
                    <GlyphWeavingExercise
                      exercise={currentGlyphWeaving}
                      onComplete={handleGlyphWeavingComplete}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Cargando ejercicio Construcción de Frases...
                  </div>
                )}
              </>
            )}

            {/* Resonance Path Exercises */}
            {currentExerciseType === "resonancePath" && (
              <>
                {currentResonancePath ? (
                  <motion.div
                    key={`resonancePath-${currentResonancePathIndex}-${currentResonancePath.id}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Entonación {currentResonancePathIndex + 1} de{" "}
                        {resonancePathExercises.length}
                      </div>
                      {lessonMode === "desafio" && timeRemaining !== null && (
                        <div
                          className={`font-bold ${
                            timeRemaining < 60
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          ⏱️ {formatTime(timeRemaining)}
                        </div>
                      )}
                    </div>
                    <ResonancePathExercise
                      exercise={currentResonancePath}
                      onComplete={handleResonancePathComplete}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Cargando ejercicio Entonación...
                  </div>
                )}
              </>
            )}

            {/* Classic Phrases Exercises */}
            {currentExerciseType === "phrases" && currentPhrase && (() => {
              // Encontrar el bloque que contiene la frase actual
              const currentBlock = conversationalBlocks.find(block => 
                block.phrases.some(p => p.id === currentPhrase.id)
              );
              
              return (
                <motion.div
                  key={`phrases-${currentPhraseIndex}-${phrasePhase}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  {/* Progress indicator and timer */}
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      {currentBlock 
                        ? `Bloque ${conversationalBlocks.indexOf(currentBlock) + 1} de ${conversationalBlocks.length} - Frase ${currentBlock.phrases.findIndex(p => p.id === currentPhrase.id) + 1} de ${currentBlock.phrases.length}`
                        : `Frase ${currentPhraseIndex + 1} de ${totalPhrases}`
                      } -{" "}
                      {phrasePhase === "cloze"
                        ? "Cloze"
                        : "Variaciones"}
                    </div>
                    {lessonMode === "desafio" && timeRemaining !== null && (
                      <div
                        className={`font-bold ${
                          timeRemaining < 60 ? "text-red-500" : "text-orange-500"
                        }`}
                      >
                        ⏱️ {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>

                  {phrasePhase === "cloze" && (
                    <ClozeExercise
                      phrase={currentPhrase}
                      block={currentBlock}
                      onComplete={handleClozeComplete}
                    />
                  )}

                  {phrasePhase === "variations" && (
                    <VariationsExercise
                      phrase={currentPhrase}
                      block={currentBlock}
                      onComplete={handleVariationsComplete}
                    />
                  )}
                </motion.div>
              );
            })()}
          </>
        )}

        {/* Input Phase */}
        {phase === "input" && currentInput && (
          <motion.div
            key={`input-${currentInputIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Input {currentInputIndex + 1} de {totalInputs}
            </div>
            <InputPlayer
              content={currentInput}
              onComplete={handleInputComplete}
              onBack={() => setPhase("phrases")}
            />
          </motion.div>
        )}

        {/* Test Phase */}
        {phase === "test" && lessonContent?.miniTest && (
          <motion.div
            key="test"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ComprehensionTest
              content={{
                id: lessonContent.miniTest.id,
                languageCode: lessonContent.languageCode,
                levelCode: lessonContent.levelCode,
                type: "text",
                title: "Mini-test",
                description: "Evalúa tu comprensión",
                url: "",
                wordCount: 0,
                comprehensionQuestions: lessonContent.miniTest.questions,
              }}
              onComplete={handleTestComplete}
              onBack={() => setPhase("input")}
            />
          </motion.div>
        )}

        {/* Complete Phase */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Lección completada!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Has completado {totalPhrases} frases y {totalInputs} inputs
              comprensible.
            </p>
            {lessonContent?.miniTask && (
              <div className="mt-6">
                <MiniTaskExercise
                  task={lessonContent.miniTask}
                  onComplete={() => {
                    addXP(XP_RULES.miniTaskComplete);
                    router.push("/tree");
                  }}
                />
              </div>
            )}
            <button
              onClick={() => router.push("/tree")}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg"
            >
              Volver al árbol
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogo de confirmación para salir */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              ¿Salir del ejercicio?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tu progreso se guardará automáticamente. Puedes continuar más
              tarde.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  returnToMenu();
                }}
                className="flex-1 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
              >
                Salir
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
