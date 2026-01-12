import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos
export interface TranscriptPhrase {
  text: string;
  start: number; // Tiempo de inicio en segundos
  duration: number; // Duración en segundos
}

export interface ImportedSubtopic {
  id: string;
  title: string;
  phrases: string[]; // Frases extraídas del texto
}

export interface ImportedNode {
  id: string;
  title: string;
  icon: string;
  sourceType: 'podcast' | 'article' | 'youtube';
  sourceText: string; // Texto original o transcripción completa
  // Para YouTube: transcripción sincronizada con timestamps
  transcript?: TranscriptPhrase[];
  videoId?: string; // Solo el ID del video, no el video completo
  subtopics: ImportedSubtopic[];
  createdAt: string;
  // Progreso
  completedSubtopics: string[];
  percentage: number;
}

interface ImportedNodesState {
  nodes: ImportedNode[];
}

interface ImportedNodesActions {
  // Crear un nuevo nodo importado
  createNode: (node: Omit<ImportedNode, 'id' | 'createdAt' | 'completedSubtopics' | 'percentage'>) => string;

  // Actualizar nodo
  updateNode: (nodeId: string, updates: Partial<ImportedNode>) => void;

  // Eliminar nodo
  deleteNode: (nodeId: string) => void;

  // Agregar subtópico a un nodo
  addSubtopic: (nodeId: string, subtopic: Omit<ImportedSubtopic, 'id'>) => void;

  // Marcar subtópico como completado
  completeSubtopic: (nodeId: string, subtopicId: string) => void;

  // Obtener nodo por ID
  getNode: (nodeId: string) => ImportedNode | undefined;

  // Reset
  resetNodes: () => void;
}

type ImportedNodesStore = ImportedNodesState & ImportedNodesActions;

export type { ImportedNodesStore };

const initialState: ImportedNodesState = {
  nodes: [],
};

// Generar ID único
const generateId = () => `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Iconos disponibles para nodos
export const NODE_ICONS = ['📚', '🎧', '📰', '🎬', '💬', '📝', '🗣️', '🎯', '✨', '🌟'];

export const useImportedNodesStore = create<ImportedNodesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createNode: (nodeData) => {
        const id = generateId();
        const newNode: ImportedNode = {
          ...nodeData,
          id,
          createdAt: new Date().toISOString(),
          completedSubtopics: [],
          percentage: 0,
        };

        console.log('[ImportedNodesStore] Creating node:', {
          id,
          title: nodeData.title,
          subtopicsCount: nodeData.subtopics.length,
          totalPhrases: nodeData.subtopics.reduce((acc, s) => acc + s.phrases.length, 0),
        });

        set((state) => ({
          nodes: [...state.nodes, newNode],
        }));

        // Verificar que se guardó
        setTimeout(() => {
          const stored = localStorage.getItem('linguaforge-imported-nodes');
          if (!stored) {
            console.error('[ImportedNodesStore] ERROR: No se guardó en localStorage!');
          } else {
            console.log('[ImportedNodesStore] Guardado correctamente, tamaño:', stored.length, 'bytes');
          }
        }, 100);

        return id;
      },

      updateNode: (nodeId, updates) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, ...updates } : node
          ),
        }));
      },

      deleteNode: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
        }));
      },

      addSubtopic: (nodeId, subtopicData) => {
        const subtopicId = `subtopic-${Date.now()}`;
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  subtopics: [
                    ...node.subtopics,
                    { ...subtopicData, id: subtopicId },
                  ],
                }
              : node
          ),
        }));
      },

      completeSubtopic: (nodeId, subtopicId) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id !== nodeId) return node;

            const completedSubtopics = node.completedSubtopics.includes(subtopicId)
              ? node.completedSubtopics
              : [...node.completedSubtopics, subtopicId];

            const percentage = node.subtopics.length > 0
              ? Math.round((completedSubtopics.length / node.subtopics.length) * 100)
              : 0;

            return {
              ...node,
              completedSubtopics,
              percentage,
            };
          }),
        }));
      },

      getNode: (nodeId) => {
        return get().nodes.find((node) => node.id === nodeId);
      },

      resetNodes: () => set(initialState),
    }),
    {
      name: 'linguaforge-imported-nodes',
      onRehydrateStorage: () => (state) => {
        console.log('[ImportedNodesStore] Rehidratando store...');
        console.log('[ImportedNodesStore] Nodos cargados:', state?.nodes?.length || 0);
        if (state && state.nodes) {
          state.nodes.forEach(node => {
            console.log('[ImportedNodesStore] - Node:', node.id, node.title);
          });
        }
      },
    }
  )
);

// Helper hooks
export function useImportedNodes() {
  return useImportedNodesStore((state) => state.nodes);
}

export function useImportedNode(nodeId: string) {
  return useImportedNodesStore((state) =>
    state.nodes.find((node) => node.id === nodeId)
  );
}
