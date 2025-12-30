'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TreeLeaf } from './TreeLeaf';
import { useTreeProgressStore } from '@/store/useTreeProgressStore';
import { SPRING, DURATION, EASING } from '@/lib/motion';
import type { TopicBranch, NodeStatus } from '@/types';

interface BranchModalProps {
  branch: TopicBranch | null;
  branchIndex: number;
  treeId: string;
  onClose: () => void;
}

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...SPRING.smooth,
      opacity: { duration: DURATION.fast },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: DURATION.fast,
      ease: EASING.accelerate,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1, duration: DURATION.normal },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.15,
      staggerChildren: 0.08,
    },
  },
};

export function BranchModal({ branch, branchIndex, treeId, onClose }: BranchModalProps) {
  const router = useRouter();
  const { getLeafStatus } = useTreeProgressStore();

  if (!branch) return null;

  const handleLeafClick = (leafId: string, status: NodeStatus) => {
    if (status === 'locked') return;
    router.push(`/tree/leaf/${leafId}`);
  };

  const completedCount = branch.leaves.filter((_, i) =>
    getLeafStatus(treeId, branchIndex, i) === 'completed'
  ).length;

  return (
    <AnimatePresence mode="wait">
      {branch && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 max-w-md mx-auto"
            style={{ y: '-50%' }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-lf-soft rounded-xl shadow-2xl overflow-hidden border border-lf-primary/20">
              {/* Header with branch color */}
              <motion.div
                className="relative p-5 overflow-hidden"
                style={{ backgroundColor: branch.color }}
                variants={headerVariants}
              >
                {/* Background pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "url('/patterns/phonetic-glyphs.svg')",
                    backgroundSize: '60px 60px',
                  }}
                />

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-4xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ ...SPRING.bouncy, delay: 0.2 }}
                    >
                      {branch.icon}
                    </motion.span>
                    <div>
                      <h2 className="font-rajdhani text-xl font-bold text-white leading-tight">
                        {branch.title}
                      </h2>
                      <p className="font-atkinson text-sm text-white/80 italic">
                        {branch.titleFr}
                      </p>
                    </div>
                  </div>

                  {/* Close button */}
                  <motion.button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-white text-lg">×</span>
                  </motion.button>
                </div>

                {/* Description */}
                <motion.p
                  className="relative mt-3 text-sm text-white/70 font-atkinson"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {branch.description}
                </motion.p>

                {/* Progress indicator */}
                <motion.div
                  className="relative mt-4 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < completedCount ? 'bg-white' : 'bg-white/30'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/60 font-rajdhani">
                    {completedCount}/3 completadas
                  </span>
                </motion.div>
              </motion.div>

              {/* Leaves list */}
              <motion.div
                className="p-4 space-y-3"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <h3 className="font-rajdhani text-xs font-semibold text-lf-muted uppercase tracking-wider mb-3">
                  Temas de esta rama
                </h3>

                {branch.leaves.map((leaf, leafIndex) => {
                  const status = getLeafStatus(treeId, branchIndex, leafIndex);
                  return (
                    <TreeLeaf
                      key={leaf.id}
                      leaf={leaf}
                      status={status}
                      index={leafIndex}
                      branchColor={branch.color}
                      onClick={() => handleLeafClick(leaf.id, status)}
                    />
                  );
                })}
              </motion.div>

              {/* Grammar preview footer */}
              <motion.div
                className="px-4 pb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-lf-dark/50 rounded-lg p-3 border border-lf-primary/10">
                  <h4 className="font-rajdhani text-xs font-semibold text-lf-accent mb-2 flex items-center gap-1">
                    <span>◈</span>
                    Gramática asociada
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {branch.leaves
                      .flatMap((leaf) => leaf.grammar.slice(0, 2))
                      .slice(0, 6)
                      .map((g, i) => (
                        <motion.span
                          key={`${g}-${i}`}
                          className="text-xs px-2 py-0.5 bg-lf-soft rounded-full text-gray-400 border border-lf-muted/30"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.55 + i * 0.03 }}
                        >
                          {g}
                        </motion.span>
                      ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
