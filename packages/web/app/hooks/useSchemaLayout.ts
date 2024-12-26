import { useCallback, useState } from 'react';
import { Edge, Node, NodeChange, EdgeChange, useNodesState, useEdgesState } from '@xyflow/react';
import dagre from 'dagre';
import {
  TableNodeData,
  RelationshipEdgeData,
  ProcessedSchemaTable,
  LayoutType,
  TableNode,
  RelationshipEdge,
} from '../types/schema';

interface UseSchemaLayoutProps {
  tables: ProcessedSchemaTable[];
  relationships: RelationshipEdgeData[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: TableNode[],
  edges: RelationshipEdge[],
  direction: LayoutType = 'TB'
) => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function useSchemaLayout({ tables, relationships }: UseSchemaLayoutProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNode>(
    tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: table.data,
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationshipEdge>(
    relationships.map((rel) => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: 'relationship',
      data: rel,
    }))
  );

  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('TB');

  const onLayoutChange = useCallback(
    (layout: LayoutType) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        layout
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setSelectedLayout(layout);
    },
    [nodes, edges, setNodes, setEdges]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectedLayout,
    onLayoutChange,
  };
}
