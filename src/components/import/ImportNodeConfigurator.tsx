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
  const handleCreateClick = () => {
    if (!topicTitle.trim()) {
      alert('El nombre del tema es obligatorio. Por favor, ingresa un nombre para continuar.');
      return;
    }
    if (subtopics.length === 0) {
      alert('Debes crear al menos un subtópico antes de continuar.');
      return;
    }
    onCreateNode();
  };

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
          className="p-2 rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 text-calm-text-muted hover:text-white transition-all"
        >
          ←
        </motion.button>
        <h2 className="text-2xl font-bold text-calm-text-primary">
          Configura tu nodo
        </h2>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br to-accent-500/10 to-sky-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <label htmlFor="topic-title" className="block text-sm font-medium text-calm-text-primary mb-2">
            Nombre del tópico <span className="text-semantic-error">*</span>
          </label>
          <input
            id="topic-title"
            type="text"
            value={topicTitle}
            onChange={(e) => onTopicTitleChange(e.target.value)}
            placeholder="Ej: En el restaurante, Viaje a París..."
            className="w-full px-4 py-3 rounded-xl bg-calm-bg-tertiary/30 border border-calm-warm-100/30 text-calm-text-primary placeholder:text-calm-text-muted focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          {!topicTitle.trim() && (
            <p className="text-xs text-semantic-error mt-1">Este campo es obligatorio</p>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-amber-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <div className="relative">
          <fieldset className="border-0 p-0 m-0">
            <legend className="block text-sm font-medium text-calm-text-primary mb-3">
              Icono
            </legend>
            <div className="flex flex-wrap gap-2">
              {NODE_ICONS.map((icon) => (
                <motion.button
                  key={icon}
                  onClick={() => onIconSelect(icon)}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={"w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all border-2 " + (
                    selectedIcon === icon
                      ? 'bg-gradient-to-br to-accent-500 to-sky-500 border-accent-500 shadow-calm-md'
                      : 'bg-calm-bg-secondary backdrop-blur-md border-calm-warm-100/30 hover:border-calm-warm-100/50'
                  )}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-accent-500/10"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <div className="relative">
          <label className="block text-sm font-medium text-calm-text-primary mb-2">
            Subtópicos ({subtopics.length})
          </label>
          {extractedPhrases.length > 0 && subtopics.length === 0 && (
            <p className="text-xs text-amber-500 mb-3">
              ✓ {extractedPhrases.length} frases extraídas listas para asignar
            </p>
          )}
          {subtopics.length > 0 && (
            <p className="text-xs text-calm-text-muted mb-3">
              {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} de {extractedPhrases.length} frases asignadas
            </p>
          )}

          <div className="space-y-2 mb-4">
            {subtopics.map((subtopic) => (
              <motion.div
                key={subtopic.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-calm-bg-tertiary/20 border border-calm-warm-100/20"
              >
                <div>
                  <span className="font-medium text-calm-text-primary">
                    {subtopic.title}
                  </span>
                  <span className="text-sm text-calm-text-muted ml-2">
                    ({subtopic.phrases.length} frases)
                  </span>
                </div>
                <motion.button
                  onClick={() => onRemoveSubtopic(subtopic.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-semantic-error hover:text-semantic-error-text hover:bg-semantic-error/10 transition-all"
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtopicTitle}
              onChange={(e) => onSubtopicTitleChange(e.target.value)}
              placeholder={subtopics.length === 0 ? "Ej: Vocabulario, Gramática..." : "Nuevo subtópico..."}
              className="flex-1 px-4 py-2.5 rounded-xl bg-calm-bg-tertiary/30 border border-calm-warm-100/30 text-calm-text-primary placeholder:text-calm-text-muted focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && onAddSubtopic()}
            />
            <motion.button
              onClick={onAddSubtopic}
              disabled={!newSubtopicTitle.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-amber-500 text-white font-medium shadow-calm-lg hover:shadow-calm-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              + Agregar
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-amber-500/10 backdrop-blur-md border border-amber-500/30 p-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-accent-500/10"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <p className="text-sm font-medium text-amber-500 mb-3">
            Vista previa del nodo:
          </p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-calm-bg-secondary backdrop-blur-md border border-calm-warm-100/30">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br to-accent-500 to-sky-500 flex items-center justify-center text-2xl shadow-calm-lg"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {selectedIcon}
            </motion.div>
            <div className="flex-1">
              <p className="font-semibold text-calm-text-primary">
                {topicTitle || 'Sin título'}
              </p>
              <p className="text-sm text-calm-text-muted">
                {subtopics.length} subtópicos •{' '}
                {subtopics.reduce((acc, s) => acc + s.phrases.length, 0)} frases
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleCreateClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r to-accent-500 to-sky-500 text-white font-bold shadow-calm-lg hover:shadow-calm-md transition-all"
      >
        Crear nodo →
      </motion.button>
    </motion.div>
  );
}
