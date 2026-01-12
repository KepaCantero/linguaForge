'use client';

import { motion } from 'framer-motion';
import { NODE_ICONS } from '@/store/useImportedNodesStore';

export interface Subtopic {
  id: string;
  title: string;
  phrases: string[];
}

interface ImportNodeConfiguratorProps {
  topicTitle: string;
  selectedIcon: string;
  subtopics: Subtopic[];
  newSubtopicTitle: string;
  extractedPhrases: string[];
  onTopicTitleChange: (title: string) => void;
  onIconSelect: (icon: string) => void;
  onSubtopicTitleChange: (title: string) => void;
  onAddSubtopic: () => void;
  onRemoveSubtopic: (id: string) => void;
  onBack: () => void;
  onCreateNode: () => void;
}

/**
 * Import Node Configurator Component
 * Step 3 of the import wizard - configure node details (title, icon, subtopics)
 * Reduces complexity of main import page component
 */
export function ImportNodeConfigurator({
  topicTitle,
  selectedIcon,
  subtopics,
  newSubtopicTitle,
  extractedPhrases,
  onTopicTitleChange,
  onIconSelect,
  onSubtopicTitleChange,
  onAddSubtopic,
  onRemoveSubtopic,
  onBack,
  onCreateNode,
}: ImportNodeConfiguratorProps) {
  return (
    <motion.div
      key="configure"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-lf-muted hover:text-white transition-all"
        >
          ←
        </motion.button>
        <h2 className="text-2xl font-bold text-white">
          Configura tu nodo
        </h2>
      </div>

      {/* Nombre del tópico */}
      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-primary/10 to-lf-secondary/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <label className="block text-sm font-medium text-white mb-2">
            Nombre del tópico
          </label>
          <input
            type="text"
            value={topicTitle}
            onChange={(e) => onTopicTitleChange(e.target.value)}
            placeholder="Ej: En el restaurante, Viaje a París..."
            className="w-full px-4 py-3 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Icono */}
      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-secondary/10 to-lf-accent/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <div className="relative">
          <label className="block text-sm font-medium text-white mb-3">
            Icono
          </label>
          <div className="flex flex-wrap gap-2">
            {NODE_ICONS.map((icon) => (
              <motion.button
                key={icon}
                onClick={() => onIconSelect(icon)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all border-2 ${
                  selectedIcon === icon
                    ? 'bg-gradient-to-br from-lf-primary to-lf-secondary border-lf-primary shadow-glow-accent'
                    : 'bg-glass-surface backdrop-blur-md border-white/20 hover:border-white/40'
                }`}
              >
                {icon}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Subtópicos */}
      <div className="relative overflow-hidden rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-accent/10 to-lf-primary/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <div className="relative">
          <label className="block text-sm font-medium text-white mb-2">
            Subtópicos ({subtopics.length})
          </label>
          {extractedPhrases.length > 0 && subtopics.length === 0 && (
            <p className="text-xs text-lf-accent mb-3">
              ✓ {extractedPhrases.length} frases extraídas listas para asignar
            </p>
          )}
          {subtopics.length > 0 && (
            <p className="text-xs text-lf-muted mb-3">
              {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} de {extractedPhrases.length} frases asignadas
            </p>
          )}

          <div className="space-y-2 mb-4">
            {subtopics.map((subtopic) => (
              <motion.div
                key={subtopic.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-lf-dark/20 border border-white/10"
              >
                <div>
                  <span className="font-medium text-white">
                    {subtopic.title}
                  </span>
                  <span className="text-sm text-lf-muted ml-2">
                    ({subtopic.phrases.length} frases)
                  </span>
                </div>
                <motion.button
                  onClick={() => onRemoveSubtopic(subtopic.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Agregar subtópico */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtopicTitle}
              onChange={(e) => onSubtopicTitleChange(e.target.value)}
              placeholder={subtopics.length === 0 ? "Ej: Vocabulario, Gramática..." : "Nuevo subtópico..."}
              className="flex-1 px-4 py-2.5 rounded-xl bg-lf-dark/30 border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && onAddSubtopic()}
            />
            <motion.button
              onClick={onAddSubtopic}
              disabled={!newSubtopicTitle.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-lf-secondary to-lf-accent text-white font-medium shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              + Agregar
            </motion.button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="relative overflow-hidden rounded-xl bg-lf-accent/10 backdrop-blur-md border border-lf-accent/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-lf-accent/10 to-lf-primary/10"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <p className="text-sm font-medium text-lf-accent mb-3">
            Vista previa del nodo:
          </p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-lf-primary to-lf-secondary flex items-center justify-center text-2xl shadow-depth-lg"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {selectedIcon}
            </motion.div>
            <div className="flex-1">
              <p className="font-semibold text-white">
                {topicTitle || 'Sin título'}
              </p>
              <p className="text-sm text-lf-muted">
                {subtopics.length} subtópicos •{' '}
                {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={onCreateNode}
        disabled={!topicTitle.trim() || subtopics.length === 0}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-lf-primary to-lf-secondary text-white font-bold shadow-glass-xl hover:shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {subtopics.length === 0 ? 'Crea al menos un subtópico' : 'Crear nodo →'}
      </motion.button>
    </motion.div>
  );
}
