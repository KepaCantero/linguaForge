"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { TopicTree, TopicBranch, TopicLeaf, NodeStatus } from "@/types";
import { BRANCH_COLORS } from "@/lib/constants";
import { useTreeProgressStore } from "@/store/useTreeProgressStore";
// Iconos simples sin dependencias externas
const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Lock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

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

interface TopicMapProps {
  tree: TopicTree;
}

interface AreaNode {
  id: string;
  letter: string;
  name: string;
  branches: TopicBranch[];
  color: string;
  isExpanded: boolean;
}

export function TopicMap({ tree }: TopicMapProps) {
  const router = useRouter();
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  const { initTreeProgress, getLeafStatus, getBranchProgress } =
    useTreeProgressStore();

  useEffect(() => {
    initTreeProgress(tree.id);
  }, [tree.id, initTreeProgress]);

  // Organizar ramas por área
  const areas = useMemo(() => {
    const areaMap = new Map<string, AreaNode>();

    tree.branches.forEach((branch) => {
      // Extraer área del ID de la rama (formato: branch-{order}-{area})
      // O usar el orden para determinar el área
      // Por ahora, agrupamos por bloques de 5 ramas por área
      const areaIndex = Math.floor((branch.order - 1) / 5);
      const areaLetter = String.fromCharCode(65 + areaIndex); // A, B, C, ...
      const areaId = `area-${areaLetter}`;

      if (!areaMap.has(areaId)) {
        areaMap.set(areaId, {
          id: areaId,
          letter: areaLetter,
          name: getAreaName(areaLetter),
          branches: [],
          color: BRANCH_COLORS[branch.order as keyof typeof BRANCH_COLORS] || BRANCH_COLORS[1],
          isExpanded: false,
        });
      }

      areaMap.get(areaId)!.branches.push(branch);
    });

    return Array.from(areaMap.values()).sort((a, b) =>
      a.letter.localeCompare(b.letter)
    );
  }, [tree.branches]);

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
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

  const getBranchStatus = (branch: TopicBranch): NodeStatus => {
    const allLeavesCompleted = branch.leaves.every(
      (_, index) =>
        getLeafStatus(tree.id, branch.order - 1, index) === "completed"
    );
    if (allLeavesCompleted) return "completed";

    const anyActive = branch.leaves.some(
      (_, index) => getLeafStatus(tree.id, branch.order - 1, index) === "active"
    );
    if (anyActive) return "active";

    return "locked";
  };

  const getLeafStatusForBranch = (
    branch: TopicBranch,
    leafIndex: number
  ): NodeStatus => {
    return getLeafStatus(tree.id, branch.order - 1, leafIndex);
  };

  const handleLeafClick = (leaf: TopicLeaf, branch: TopicBranch) => {
    const status = getLeafStatusForBranch(
      branch,
      branch.leaves.findIndex((l) => l.id === leaf.id)
    );
    if (status === "locked") return;

    // Navegar a la lección
    router.push(`/tree/leaf/${leaf.id}`);
  };

  return (
    <div className="w-full py-6 px-4">
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

      {/* ÁREA 0 - Base Absoluta (Nodo Especial) */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          {/* Nodo central ÁREA 0 */}
          <motion.button
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/tree/area-0")}
          >
            <div className="flex items-center justify-between">
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
              </div>
              <Play className="w-6 h-6 text-white" />
            </div>
          </motion.button>

          {/* Conector hacia áreas principales */}
          <div className="flex justify-center mt-4">
            <motion.div
              className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-500"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Áreas principales */}
      <div className="space-y-4">
        {areas.map((area, areaIndex) => {
          const isExpanded = expandedAreas.has(area.id);
          const areaBranches = area.branches;

          return (
            <motion.div
              key={area.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + areaIndex * 0.05 }}
            >
              {/* Header del Área */}
              <button
                onClick={() => toggleArea(area.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                style={{
                  borderLeft: `4px solid ${area.color}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </motion.div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: area.color }}
                  >
                    {area.letter}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {area.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {areaBranches.length} rama{areaBranches.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {areaBranches.reduce(
                      (acc, branch) =>
                        acc +
                        branch.leaves.filter(
                          (_, idx) =>
                            getLeafStatus(tree.id, branch.order - 1, idx) ===
                            "completed"
                        ).length,
                      0
                    )}{" "}
                    /{" "}
                    {areaBranches.reduce(
                      (acc, branch) => acc + branch.leaves.length,
                      0
                    )}
                  </div>
                </div>
              </button>

              {/* Ramas del Área */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2 bg-gray-50 dark:bg-gray-900/50">
                      {areaBranches.map((branch, branchIndex) => {
                        const branchStatus = getBranchStatus(branch);
                        const isBranchExpanded = expandedBranches.has(branch.id);
                        const progress = getBranchProgress(
                          tree.id,
                          branch.order - 1
                        );

                        return (
                          <motion.div
                            key={branch.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: branchIndex * 0.05,
                            }}
                          >
                            {/* Header de la Rama */}
                            <button
                              onClick={() => toggleBranch(branch.id)}
                              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <motion.div
                                  animate={{ rotate: isBranchExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </motion.div>
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ backgroundColor: area.color }}
                                >
                                  {branch.order}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {branch.title}
                                    </span>
                                    {branchStatus === "completed" && (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                    {branchStatus === "locked" && (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {branch.titleFr}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {progress.completed} / {progress.total}
                                </div>
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                      backgroundColor: area.color,
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(progress.completed / progress.total) * 100}%`,
                                    }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                            </button>

                            {/* Hojas de la Rama */}
                            <AnimatePresence>
                              {isBranchExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 space-y-1 bg-gray-50 dark:bg-gray-900/30">
                                    {branch.leaves.map((leaf, leafIndex) => {
                                      const leafStatus = getLeafStatusForBranch(
                                        branch,
                                        leafIndex
                                      );

                                      return (
                                        <motion.button
                                          key={leaf.id}
                                          onClick={() =>
                                            handleLeafClick(leaf, branch)
                                          }
                                          disabled={leafStatus === "locked"}
                                          className={`
                                            w-full p-2 rounded-lg text-left text-sm
                                            transition-all
                                            ${
                                              leafStatus === "completed"
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                : leafStatus === "active"
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            }
                                          `}
                                          whileHover={
                                            leafStatus !== "locked"
                                              ? { scale: 1.02, x: 4 }
                                              : {}
                                          }
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            delay: leafIndex * 0.03,
                                          }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">
                                                {leaf.icon || "📄"}
                                              </span>
                                              <div>
                                                <div className="font-medium">
                                                  {leaf.title}
                                                </div>
                                                <div className="text-xs opacity-75">
                                                  {leaf.titleFr}
                                                </div>
                                              </div>
                                            </div>
                                            {leafStatus === "completed" && (
                                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            )}
                                            {leafStatus === "locked" && (
                                              <Lock className="w-4 h-4 text-gray-400" />
                                            )}
                                            {leafStatus === "active" && (
                                              <Play className="w-4 h-4 text-indigo-500" />
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

