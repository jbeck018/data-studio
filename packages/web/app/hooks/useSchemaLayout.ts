import { useCallback, useEffect, useState } from 'react';
import type { Node } from '@xyflow/react';
import type { ProcessedSchemaTable, RelationshipEdge, SchemaLayout } from '../types/schema';
import { findRelatedNodes, type LayoutType } from '../utils/schemaLayout';

const LAYOUT_STORAGE_KEY = 'schema-layout';

interface UseSchemaLayoutOptions {
  initialNodes: Node<{ label: string; columns: ProcessedSchemaTable['columns'] }>[];
  initialEdges: RelationshipEdge[];
  onLayoutChange?: (layout: SchemaLayout) => void;
}

export function useSchemaLayout({
  initialNodes,
  initialEdges,
  onLayoutChange,
}: UseSchemaLayoutOptions) {
  const [nodes, setNodes] = useState<Node<{ label: string; columns: ProcessedSchemaTable['columns'] }>[]>(initialNodes);
  const [edges, setEdges] = useState<RelationshipEdge[]>(initialEdges);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('auto');

  // Load saved layout on mount
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        const { nodes: savedNodes } = JSON.parse(savedLayout);
        // Merge saved positions with current nodes
        setNodes((current) =>
          current.map((node) => {
            const savedNode = savedNodes.find((n: Node) => n.id === node.id);
            return savedNode
              ? { ...node, position: savedNode.position }
              : node;
          })
        );
      }
    } catch (error) {
      console.error('Error loading saved layout:', error);
    }
  }, []);

  // Save layout when nodes change
  useEffect(() => {
    try {
      const layoutToSave = {
        nodes: nodes.map(({ id, position }) => ({ id, position })),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutToSave));
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  }, [nodes]);

  const applyLayout = useCallback(
    (type: LayoutType, layoutedNodes: Node<{ label: string; columns: ProcessedSchemaTable['columns'] }>[]) => {
      setSelectedLayout(type);
      setNodes(layoutedNodes);
      onLayoutChange?.({ nodes: layoutedNodes, edges });
    },
    [edges, onLayoutChange]
  );

  const highlightRelatedNodes = useCallback(
    (nodeIds: string[] | null) => {
      if (!nodeIds) {
        setHighlightedNodes(new Set());
        return;
      }

      const relatedNodes = new Set<string>();
      nodeIds.forEach(id => {
        const related = findRelatedNodes(id, edges);
        related.forEach(nodeId => relatedNodes.add(nodeId));
      });
      setHighlightedNodes(relatedNodes);
    },
    [edges]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node<{ label: string; columns: ProcessedSchemaTable['columns'] }>) => {
      const updatedNodes = nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );
      setNodes(updatedNodes);
      onLayoutChange?.({ nodes: updatedNodes, edges });
    },
    [nodes, edges, onLayoutChange]
  );

  const resetLayout = useCallback(() => {
    setNodes(initialNodes);
    setSelectedLayout('auto');
    onLayoutChange?.({ nodes: initialNodes, edges });
  }, [initialNodes, edges, onLayoutChange]);

  return {
    nodes,
    edges,
    selectedLayout,
    highlightedNodes,
    applyLayout,
    highlightRelatedNodes,
    onNodeDragStop,
    resetLayout,
  };
}
