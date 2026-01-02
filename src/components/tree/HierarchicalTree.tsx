"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { TopicTree, TopicBranch, TopicLeaf, NodeStatus } from "@/types";
import { BRANCH_COLORS } from "@/lib/constants";
import { useTreeProgressStore } from "@/store/useTreeProgressStore";

interface HierarchicalTreeProps {
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


const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export function HierarchicalTree({ tree }: HierarchicalTreeProps) {
  const router = useRouter();
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  const { initTreeProgress, getBranchProgress } =
    useTreeProgressStore();

  useEffect(() => {
    initTreeProgress(tree.id);
  }, [tree.id, initTreeProgress]);

  // Separar ÁREA 0 del resto
  const area0Branch = useMemo(() => {
    return tree.branches.find(b => b.order === 0) || null;
  }, [tree.branches]);

  // Organizar ramas por área (excluyendo ÁREA 0)
  const areas = useMemo(() => {
    const areaMap = new Map<string, { letter: string; name: string; branches: TopicBranch[] }>();

    tree.branches
      .filter(branch => branch.order > 0) // Excluir ÁREA 0
      .forEach((branch) => {
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

  const toggleArea = (areaLetter: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaLetter)) {
        next.delete(areaLetter);
      } else {
        next.add(areaLetter);
      }
      return next;
    });
  };

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
    return "active";
  };

  const getLeafStatusForBranch = (): NodeStatus => {
    return "active";
  };

  const handleLeafClick = (leaf: TopicLeaf) => {
    router.push(`/tree/leaf/${leaf.id}`);
  };

  const isArea0Expanded = expandedBranches.has('a0-base-absoluta');

  return (
    <div className="w-full py-6 px-4 max-w-6xl mx-auto">
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
      {area0Branch && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border-l-4 border-indigo-600 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4">
            <button
              onClick={() => toggleBranch('a0-base-absoluta')}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🆘</span>
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {area0Branch.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {area0Branch.description || 'Prerrequisito: Usuarios con 0 conocimiento de francés'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {area0Branch.leaves.length} nodos · {area0Branch.leaves.reduce((acc, leaf) => acc + (leaf.estimatedMinutes || 15), 0)} min
                </p>
              </div>
              <motion.div
                animate={{ rotate: isArea0Expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </motion.div>
            </button>

            {/* Hojas de ÁREA 0 */}
            <AnimatePresence>
              {isArea0Expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-2 ml-20 border-l-2 border-indigo-300 dark:border-indigo-700"
                >
                  <div className="space-y-1 py-2">
                    {area0Branch.leaves.map((leaf, leafIndex) => {
                      const leafStatus = getLeafStatusForBranch();
                      return (
                        <motion.button
                          key={leaf.id}
                          onClick={() => handleLeafClick(leaf)}
                          className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-800/50 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: leafIndex * 0.05 }}
                        >
                          <span className="text-xl">{leaf.icon || "📄"}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {leaf.title}
                              </span>
                              {leafStatus === "completed" && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {leaf.titleFr} · {leaf.estimatedMinutes || 15} min
                            </p>
                          </div>
                          <Play className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Árbol Jerárquico */}
      <div className="space-y-1">
        {areas.map((area, areaIndex) => {
          const isAreaExpanded = expandedAreas.has(area.letter);
          const colorKey = (areaIndex + 1) as keyof typeof BRANCH_COLORS;
          const areaColor = BRANCH_COLORS[colorKey] || BRANCH_COLORS[1];

          return (
            <motion.div
              key={area.letter}
              className="border-l-2 border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: areaIndex * 0.05 }}
            >
              {/* Área (Nivel 1) */}
              <button
                onClick={() => toggleArea(area.letter)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                style={{ borderLeftColor: areaColor }}
              >
                {/* Línea vertical */}
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: isAreaExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400 dark:text-gray-500"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: areaColor }}
                  >
                    {area.letter}
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {area.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {area.branches.length} rama{area.branches.length !== 1 ? "s" : ""} · {area.branches.reduce((acc, branch) => acc + branch.leaves.length, 0)} hojas
                  </p>
                </div>
              </button>

              {/* Ramas del Área (Nivel 2) */}
              <AnimatePresence>
                {isAreaExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 space-y-1 border-l-2 border-gray-200 dark:border-gray-700">
                      {area.branches.map((branch, branchIndex) => {
                        const branchStatus = getBranchStatus();
                        const isBranchExpanded = expandedBranches.has(branch.id);
                        const branchProgress = getBranchProgress(tree.id, branch.id);
                        const progress = {
                          completed: branchProgress.completed,
                          total: branch.leaves.length || branchProgress.total
                        };

                        return (
                          <motion.div
                            key={branch.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: branchIndex * 0.03 }}
                          >
                            {/* Rama (Nivel 2) */}
                            <button
                              onClick={() => toggleBranch(branch.id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: isBranchExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-gray-400 dark:text-gray-500"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </motion.div>
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                  style={{ backgroundColor: areaColor }}
                                >
                                  {branch.order}
                                </div>
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {progress.completed}/{progress.total}
                                </div>
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: areaColor }}
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
                            </button>

                            {/* Hojas de la Rama (Nivel 3) */}
                            <AnimatePresence>
                              {isBranchExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-8 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700">
                                    {branch.leaves.map((leaf, leafIndex) => {
                                      const leafStatus = getLeafStatusForBranch();

                                      return (
                                        <motion.button
                                          key={leaf.id}
                                          onClick={() => handleLeafClick(leaf)}
                                          disabled={leafStatus === "locked"}
                                          className={`
                                            w-full flex items-center gap-3 p-2.5 rounded-lg text-left
                                            transition-all duration-200
                                            ${
                                              leafStatus === "completed"
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                : leafStatus === "active"
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                                : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
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
                                          transition={{ delay: leafIndex * 0.02 }}
                                        >
                                          <span className="text-base flex-shrink-0">
                                            {leaf.icon || "📄"}
                                          </span>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate text-sm">
                                              {leaf.title}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                              {leaf.titleFr}
                                            </div>
                                          </div>
                                          {leafStatus === "active" && (
                                            <Play className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                          )}
                                          {leafStatus === "completed" && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                          )}
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
                )}
              </AnimatePresence>
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

