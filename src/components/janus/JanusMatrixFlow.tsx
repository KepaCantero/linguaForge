"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { JanusMatrix as JanusMatrixType } from "@/types";

interface JanusMatrixFlowProps {
  matrix: JanusMatrixType;
  onNodeClick?: (nodeId: string, columnIndex: number) => void;
  selectedNodes?: string[];
  connections?: Array<{ from: string; to: string }>;
}

/**
 * Componente React Flow para visualización avanzada de Janus Matrix
 * Permite nodos arrastrables, conexiones animadas, zoom/paneo
 */
export function JanusMatrixFlow({
  matrix,
  onNodeClick,
  selectedNodes = [],
  connections = [],
}: JanusMatrixFlowProps) {
  // Convertir columnas de Janus a nodos de React Flow
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    const columnWidth = 200;
    const columnSpacing = 250;
    const rowSpacing = 100;

    matrix.columns.forEach((column, colIndex) => {
      const x = colIndex * columnSpacing + 100;

      column.cells.forEach((cell, cellIndex) => {
        const y = cellIndex * rowSpacing + 100;

        nodes.push({
          id: cell.id,
          type: "default",
          position: { x, y },
          data: {
            label: cell.text,
            columnIndex: colIndex,
            columnLabel: column.label,
          },
          style: {
            background: selectedNodes.includes(cell.id) ? "#4F46E5" : "#1F2937",
            color: "#FFFFFF",
            border: selectedNodes.includes(cell.id)
              ? "2px solid #F59E0B"
              : "1px solid #374151",
            borderRadius: "8px",
            padding: "12px",
            minWidth: columnWidth,
            textAlign: "center",
            fontWeight: "500",
          },
        });
      });
    });

    return nodes;
  }, [matrix, selectedNodes]);

  // Convertir conexiones a edges de React Flow
  const initialEdges: Edge[] = useMemo(() => {
    return connections.map((conn, index) => ({
      id: `edge-${index}`,
      source: conn.from,
      target: conn.to,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#4F46E5", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#4F46E5",
      },
    }));
  }, [connections]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const columnIndex = node.data.columnIndex;
      onNodeClick?.(node.id, columnIndex);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-[600px] border border-gray-300 dark:border-gray-700 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return selectedNodes.includes(node.id) ? "#4F46E5" : "#6B7280";
          }}
          maskColor="rgba(0, 0, 0, 0.3)"
        />
      </ReactFlow>
    </div>
  );
}
