import { motion } from 'framer-motion';
import { ImportedNode } from '@/store/useImportedNodesStore';
import { SubtopicCard } from './SubtopicCard';

interface SubtopicListProps {
  node: ImportedNode;
  onSubtopicClick: (subtopicId: string) => void;
}

/**
 * List of subtopics with progress indicator.
 * Displays all subtopics as interactive cards or empty state if none exist.
 */
export function SubtopicList({ node, onSubtopicClick }: SubtopicListProps) {
  const hasSubtopics = node.subtopics.length > 0;

  return (
    <>
      {/* Subtopics header */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-white mb-4"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
      >
        Subtemas ({node.completedSubtopics.length}/{node.subtopics.length})
      </motion.h2>

      {/* Subtopics list */}
      {hasSubtopics ? (
        <div className="space-y-4">
          {node.subtopics.map((subtopic, index) => {
            const isCompleted = node.completedSubtopics.includes(subtopic.id);

            return (
              <SubtopicCard
                key={subtopic.id}
                subtopic={subtopic}
                index={index}
                isCompleted={isCompleted}
                onClick={() => onSubtopicClick(subtopic.id)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}
    </>
  );
}

/**
 * Empty state displayed when no subtopics exist for the node.
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="relative w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <span className="relative text-4xl">📭</span>
      </div>
      <p
        className="text-lf-muted"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        No hay subtemas en este nodo
      </p>
    </motion.div>
  );
}
