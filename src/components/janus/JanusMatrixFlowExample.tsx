'use client';

import { useState, useCallback } from 'react';
import { JanusMatrixFlow } from './JanusMatrixFlow';
import { JanusMatrix as JanusMatrixType } from '@/types';

interface JanusMatrixFlowExampleProps {
  matrix: JanusMatrixType;
  onNodeClick?: (nodeId: string, columnIndex: number) => void;
}

/**
 * Ejemplo de uso de JanusMatrixFlow con React Flow
 * Muestra cómo usar el componente con nodos arrastrables y conexiones
 */
export function JanusMatrixFlowExample({ matrix, onNodeClick }: JanusMatrixFlowExampleProps) {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);

  const handleNodeClick = useCallback(
    (nodeId: string, columnIndex: number) => {
      // Toggle selección
      setSelectedNodes((prev) => {
        if (prev.includes(nodeId)) {
          return prev.filter((id) => id !== nodeId);
        }
        return [...prev, nodeId];
      });

      // Si hay un nodo seleccionado en la columna anterior, crear conexión
      if (columnIndex > 0) {
        const previousColumnNodes = matrix.columns[columnIndex - 1].cells.map((c) => c.id);
        const previousSelected = selectedNodes.find((id) => previousColumnNodes.includes(id));
        
        if (previousSelected) {
          setConnections((prev) => [
            ...prev.filter((c) => c.to !== nodeId), // Eliminar conexiones existentes a este nodo
            { from: previousSelected, to: nodeId },
          ]);
        }
      }

      onNodeClick?.(nodeId, columnIndex);
    },
    [selectedNodes, matrix.columns, onNodeClick]
  );

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Janus Matrix - Vista Avanzada
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Arrastra los nodos, haz zoom con la rueda del mouse, y conecta elementos entre columnas.
        </p>
        <JanusMatrixFlow
          matrix={matrix}
          onNodeClick={handleNodeClick}
          selectedNodes={selectedNodes}
          connections={connections}
        />
      </div>
    </div>
  );
}

