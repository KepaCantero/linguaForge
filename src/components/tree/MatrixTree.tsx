"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { TopicTree, TopicBranch, TopicLeaf, NodeStatus } from "@/types";
import { BRANCH_COLORS } from "@/lib/constants";
import { useTreeProgressStore } from "@/store/useTreeProgressStore";

interface MatrixTreeProps {
  tree: TopicTree;
}

// Iconos simples

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Play = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export function MatrixTree({ tree }: MatrixTreeProps) {
  const router = useRouter();
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  const { initTreeProgress, getBranchProgress } =
    useTreeProgressStore();

  useEffect(() => {
    initTreeProgress(tree.id);
  }, [tree.id, initTreeProgress]);

  // Organizar ramas por área
  const areas = useMemo(() => {
    const areaMap = new Map<string, { letter: string; name: string; branches: TopicBranch[] }>();

    tree.branches.forEach((branch) => {
      // Extraer área del ID (formato: a1-A-1, a1-B-2, etc.)
      const match = branch.id.match(/a1-([A-Z])-/);
      const areaLetter = match ? match[1] : String.fromCharCode(64 + Math.floor((branch.order - 1) / 5) + 1);
      const areaId = `area-${areaLetter}`;

      if (!areaMap.has(areaId)) {
        areaMap.set(areaId, {
          letter: areaLetter,
          name: getAreaName(areaLetter),
          branches: [],
        });
      }

      areaMap.get(areaId)!.branches.push(branch);
    });

    // Ordenar ramas dentro de cada área por order
    areaMap.forEach((area) => {
      area.branches.sort((a, b) => a.order - b.order);
    });

    return Array.from(areaMap.values()).sort((a, b) =>
      a.letter.localeCompare(b.letter)
    );
  }, [tree.branches]);

  const toggleBranch = (branchId: string) => {
    setExpandedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  // DESBLOQUEAR TODOS LOS NODOS
  const getBranchStatus = (): NodeStatus => {
    // Todos los nodos están activos (desbloqueados)
    return "active";
  };

  const getLeafStatusForBranch = (): NodeStatus => {
    // Todos los nodos están activos (desbloqueados)
    return "active";
  };

  const handleLeafClick = (leaf: TopicLeaf) => {
    router.push(`/tree/leaf/${leaf.id}`);
  };

  const handleArea0Click = () => {
    router.push("/tree/area-0");
  };

  return (
    <div className="w-full py-6 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {tree.trunk.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {tree.trunk.titleFr}
        </p>
      </motion.div>

      {/* ÁREA 0 - Base Absoluta (Tronco) */}
      <motion.div
        className="mb-8 flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleArea0Click}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">🆘</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white mb-1">
                ÁREA 0 — BASE ABSOLUTA
              </h2>
              <p className="text-white/80 text-sm">
                Prerrequisito: Usuarios con 0 conocimiento de francés
              </p>
            </div>
            <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.button>
      </motion.div>

      {/* Matriz de Áreas - Grid responsive mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {areas.map((area, areaIndex) => {
          const colorKey = (areaIndex + 1) as keyof typeof BRANCH_COLORS;
          const areaColor = BRANCH_COLORS[colorKey] || BRANCH_COLORS[1];
          return (
            <motion.div
              key={area.letter}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-lf-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + areaIndex * 0.05 }}
            >
              {/* Header del Área */}
              <div
                className="p-4 border-b-2"
                style={{ borderColor: areaColor }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: areaColor }}
                    >
                      {area.letter}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {area.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {area.branches.length} rama{area.branches.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {area.branches.reduce((acc, branch) => acc + branch.leaves.length, 0)} hojas
                </div>
              </div>

              {/* Ramas del Área */}
              <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                {area.branches.map((branch, branchIndex) => {
                  const branchStatus = getBranchStatus();
                  const isBranchExpanded = expandedBranches.has(branch.id);
                  // getBranchProgress retorna { completed, total }
                  const branchProgress = getBranchProgress(tree.id, branch.id);
                  const progress = {
                    completed: branchProgress.completed,
                    total: branch.leaves.length || branchProgress.total
                  };

                  return (
                    <motion.div
                      key={branch.id}
                      className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: branchIndex * 0.03 }}
                    >
                      {/* Header de la Rama - Clickable para expandir/colapsar */}
                      <button
                        onClick={() => toggleBranch(branch.id)}
                        className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        aria-expanded={isBranchExpanded}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md"
                            style={{ backgroundColor: areaColor }}
                          >
                            {branch.order}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {branch.title}
                              </span>
                              {branchStatus === "completed" && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {branch.titleFr}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Progreso */}
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {progress.completed}/{progress.total}
                            </div>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: areaColor,
                                }}
                                initial={{ width: 0 }}
                                animate={{
                                  width: progress.total > 0 
                                    ? `${Math.min((progress.completed / progress.total) * 100, 100)}%`
                                    : '0%',
                                }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                          {/* Icono de expandir/colapsar */}
                          <motion.div
                            animate={{ rotate: isBranchExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </button>

                      {/* Hojas de la Rama - Lista Desplegable */}
                      <AnimatePresence>
                        {isBranchExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="px-3 py-2 space-y-1.5 bg-white dark:bg-gray-800/50">
                              {branch.leaves.map((leaf, leafIndex) => {
                                const leafStatus = getLeafStatusForBranch();

                                return (
                                  <motion.button
                                    key={leaf.id}
                                    onClick={() => handleLeafClick(leaf)}
                                    disabled={leafStatus === "locked"}
                                    className={`
                                      w-full p-2.5 rounded-lg text-left text-sm
                                      transition-all duration-200
                                      border
                                      ${
                                        leafStatus === "completed"
                                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                                          : leafStatus === "active"
                                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
                                      }
                                    `}
                                    whileHover={
                                      leafStatus !== "locked"
                                        ? { scale: 1.01, x: 4 }
                                        : {}
                                    }
                                    whileTap={
                                      leafStatus !== "locked"
                                        ? { scale: 0.98 }
                                        : {}
                                    }
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: leafIndex * 0.03 }}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <span className="text-base flex-shrink-0">
                                          {leaf.icon || "📄"}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium truncate text-sm">
                                            {leaf.title}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {leaf.titleFr}
                                          </div>
                                        </div>
                                      </div>
                                      {leafStatus === "active" && (
                                        <Play className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                      )}
                                      {leafStatus === "completed" && (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      )}
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Función helper para obtener el nombre del área
function getAreaName(letter: string): string {
  const areaNames: Record<string, string> = {
    A: "Llegada y Primer Contacto",
    B: "Alojamiento y Convivencia",
    C: "Alimentación y Compras",
    D: "Salud y Bienestar",
    E: "Trabajo y Profesión",
    F: "Vida Social y Relaciones",
    G: "Administración y Servicios",
    H: "Situaciones Incómodas",
    I: "Comunicación Digital",
    J: "Cultura y No Verbal",
    K: "Supervivencia Lingüística",
    L: "Ambigüedad y Matices",
    M: "Identidad Personal",
    N: "Seguridad Personal",
    O: "Clima y Estaciones",
    P: "Cultura y Ocio",
    Q: "Trabajo Avanzado",
    R: "Comunicación Digital Profunda",
    S: "Tiempo Libre y Hobbies",
    T: "Familia y Relaciones",
  };

  return areaNames[letter] || `Área ${letter}`;
}

