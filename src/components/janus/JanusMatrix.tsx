"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JanusCell } from "./JanusCell";
import { JanusMatrix as JanusMatrixType, JanusCombination } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { useGamificationStore } from "@/store/useGamificationStore";
import { XP_RULES, JANUS_CONFIG } from "@/lib/constants";
import { useUndo } from "@/hooks/useUndo";

interface JanusMatrixProps {
  matrix: JanusMatrixType;
  worldId: string;
  onComplete?: () => void;
}

export function JanusMatrix({ matrix, worldId, onComplete }: JanusMatrixProps) {
  const { worldProgress, updateJanusProgress } = useProgressStore();
  const { addXP, addCoins } = useGamificationStore();

  console.log("[JanusMatrix] Rendering with matrix:", matrix);
  console.log("[JanusMatrix] Columns count:", matrix?.columns?.length);
  console.log("[JanusMatrix] WorldId:", worldId);

  const progress = worldProgress[worldId]?.janusProgress;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cellUsage = useMemo(() => progress?.cellUsage || {}, [progress]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const combinations = useMemo(() => progress?.combinations || [], [progress]);

  // Estado local para selección actual con historial de deshacer
  // Hooks must be called before any early returns
  const {
    state: selectedCellsState,
    set: setSelectedCells,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndo<(string | null)[]>([null, null, null, null]);

  // Asegurar que selectedCells siempre sea un array
  const selectedCells: (string | null)[] = Array.isArray(selectedCellsState)
    ? selectedCellsState
    : [null, null, null, null];

  // Validar que matrix tiene la estructura correcta - AFTER all hooks
  const isValidMatrix = matrix && matrix.columns && matrix.columns.length === 4;

  // Calcular estadísticas (safe even if matrix is invalid)
  const totalCombinations = combinations.length;
  const possibleCombinations = isValidMatrix
    ? matrix.columns.reduce((acc, col) => acc * col.cells.length, 1)
    : 0;
  const uniqueCombinations = new Set(
    combinations.map((c) => c.cellIds.join("-"))
  ).size;
  const isComplete = uniqueCombinations >= JANUS_CONFIG.targetRepetitions;

  // Manejar clic en celda
  const handleCellClick = useCallback(
    (columnIndex: number, cellId: string) => {
      // Obtener el estado actual más reciente
      const currentState = Array.isArray(selectedCellsState)
        ? selectedCellsState
        : [null, null, null, null];
      const newSelection = [...currentState];
      newSelection[columnIndex] =
        currentState[columnIndex] === cellId ? null : cellId;
      setSelectedCells(
        newSelection as [
          string | null,
          string | null,
          string | null,
          string | null
        ]
      );
    },
    [selectedCellsState, setSelectedCells]
  );

  // Generar frase combinada
  const generatedPhrase = useMemo(() => {
    if (!isValidMatrix) return null;
    if (selectedCells.some((c) => c === null)) return null;

    const parts = matrix.columns.map((column, index) => {
      const cellId = selectedCells[index];
      const cell = column.cells.find((c) => c.id === cellId);
      return cell?.text || "";
    });

    return parts.join(" ");
  }, [selectedCells, matrix?.columns, isValidMatrix]);

  // Confirmar combinación
  const confirmCombination = useCallback(() => {
    if (!isValidMatrix) return;
    if (!generatedPhrase || selectedCells.some((c) => c === null)) return;

    const cellIds = selectedCells as [string, string, string, string];
    const combinationKey = cellIds.join("-");

    // Verificar si ya existe
    const isNewCombination = !combinations.some(
      (c) => c.cellIds.join("-") === combinationKey
    );

    // Crear nueva combinación
    const newCombination: JanusCombination = {
      cellIds,
      resultPhrase: generatedPhrase,
      timestamp: new Date().toISOString(),
    };

    // Actualizar uso de celdas
    const newCellUsage = { ...cellUsage };
    cellIds.forEach((id) => {
      newCellUsage[id] = (newCellUsage[id] || 0) + 1;
    });

    // Calcular nuevo progreso
    const newCombinations = [...combinations, newCombination];
    const newUnique = new Set(newCombinations.map((c) => c.cellIds.join("-")))
      .size;
    const newIsComplete = newUnique >= JANUS_CONFIG.targetRepetitions;

    // Actualizar store
    updateJanusProgress(worldId, {
      matrixId: matrix.id,
      cellUsage: newCellUsage,
      combinations: newCombinations,
      totalCombinations: newCombinations.length,
      uniqueCombinations: newUnique,
      isComplete: newIsComplete,
    });

    // Dar XP
    addXP(XP_RULES.janusCombination);
    if (isNewCombination && newUnique % 5 === 0) {
      addCoins(10); // Bonus cada 5 combinaciones únicas
    }

    // Completar si llegamos al objetivo
    if (newIsComplete && !isComplete) {
      addXP(XP_RULES.janusMatrixComplete);
      addCoins(50);
      onComplete?.();
    }

    // Limpiar selección para próxima combinación
    setSelectedCells([null, null, null, null]);
  }, [
    generatedPhrase,
    selectedCells,
    combinations,
    cellUsage,
    worldId,
    matrix?.id,
    updateJanusProgress,
    addXP,
    addCoins,
    isComplete,
    onComplete,
    isValidMatrix,
    setSelectedCells,
  ]);

  // Early return AFTER all hooks
  if (!isValidMatrix) {
    console.error("[JanusMatrix] Invalid matrix structure:", matrix);
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl p-4 text-center">
        <p className="text-red-700 dark:text-red-300 font-medium">
          Error: La matriz de Janus no tiene la estructura correcta. Se esperan
          4 columnas.
        </p>
        <p className="text-red-600 dark:text-red-400 text-sm mt-2">
          Columnas encontradas: {matrix?.columns?.length || 0}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {matrix.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {matrix.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalCombinations}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Generadas
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {uniqueCombinations}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Únicas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {possibleCombinations}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Posibles
          </div>
        </div>
      </div>

      {/* Barra de progreso hacia objetivo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Objetivo: {JANUS_CONFIG.targetRepetitions} combinaciones únicas
          </span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {uniqueCombinations}/{JANUS_CONFIG.targetRepetitions}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isComplete
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-indigo-400 to-purple-500"
            }`}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(
                100,
                (uniqueCombinations / JANUS_CONFIG.targetRepetitions) * 100
              )}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controles de deshacer/rehacer */}
      {(canUndo || canRedo) && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              canUndo
                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            ↶ Deshacer
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              canRedo
                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            ↷ Rehacer
          </button>
        </div>
      )}

      {/* Grid de 4 columnas */}
      <div className="grid grid-cols-4 gap-2">
        {matrix.columns.map((column, colIndex) => (
          <div key={column.id} className="space-y-2">
            {/* Header de columna */}
            <div className="text-center">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {column.label}
              </span>
            </div>

            {/* Celdas */}
            <div className="space-y-2">
              {column.cells.map((cell, cellIndex) => (
                <JanusCell
                  key={cell.id}
                  cell={cell}
                  isSelected={selectedCells[colIndex] === cell.id}
                  usageCount={cellUsage[cell.id] || 0}
                  columnIndex={colIndex}
                  cellIndex={cellIndex}
                  onClick={() => handleCellClick(colIndex, cell.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Frase generada */}
      <AnimatePresence mode="wait">
        {generatedPhrase && (
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <p className="text-white text-lg font-medium mb-4">
              {generatedPhrase}
            </p>
            <button
              onClick={confirmCombination}
              className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Confirmar (+{XP_RULES.janusCombination} XP)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de completado */}
      {isComplete && (
        <motion.div
          className="bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 rounded-xl p-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-3xl mb-2 block">🎉</span>
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            ¡Janus Matrix completada! Has alcanzado{" "}
            {JANUS_CONFIG.targetRepetitions} combinaciones únicas.
          </p>
        </motion.div>
      )}

      {/* Instrucciones si no hay selección */}
      {!generatedPhrase && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Selecciona una celda de cada columna para generar una frase
        </div>
      )}
    </div>
  );
}
