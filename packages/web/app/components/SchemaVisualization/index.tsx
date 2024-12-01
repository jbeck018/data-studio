import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
  NodeMouseHandler,
  EdgeMouseHandler,
  Edge,
  XYPosition,
  NodeTypes,
} from '@xyflow/react';
import type { SchemaVisualizationProps, TableNode, RelationshipEdge, TableColumn } from '~/types/schema';
import { TableNode as CustomTableNode } from './TableNode';
import { SchemaControls } from './SchemaControls';
import { useSchemaLayout } from '~/hooks/useSchemaLayout';
import {
  calculateDetailedNodeStatistics,
  calculateForceDirectedLayout,
  calculateCircularLayout,
  calculateTreeLayout,
  type LayoutType,
} from '~/utils/schemaLayout';
import { cn } from '~/utils/cn';

const nodeTypes: NodeTypes = {
  table: CustomTableNode,
} as const;

interface TableNodeData {
  label: string;
  columns: TableColumn[];
}

export function SchemaVisualization({
  schema,
  onNodeClick,
  onEdgeClick,
  className,
}: SchemaVisualizationProps) {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<TableNode | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const { fitView, setViewport } = useReactFlow();

  const initialNodes: Node[] = useMemo(
    () =>
      schema.tables.map((table, index) => ({
        id: table.name,
        type: 'table' as const,
        position: { x: index * 300, y: index * 100 } satisfies XYPosition,
        data: {
          label: table.name,
          columns: table.columns,
        },
      })),
    [schema.tables],
  );

  const initialEdges: Edge<RelationshipEdge['data']>[] = useMemo(
    () =>
      schema.relationships.map((rel) => ({
        id: `${rel.sourceTable}-${rel.sourceColumn}-${rel.targetTable}-${rel.targetColumn}`,
        source: rel.sourceTable,
        target: rel.targetTable,
        type: 'smoothstep',
        animated: true,
        data: {
          sourceColumn: rel.sourceColumn,
          targetColumn: rel.targetColumn,
          relationType: rel.type,
        },
        label: `${rel.sourceColumn} → ${rel.targetColumn}`,
        labelStyle: { fill: 'var(--text-secondary)' },
        style: { stroke: 'var(--primary-500)' },
      })),
    [schema.relationships],
  );

  const {
    nodes,
    edges,
    selectedLayout,
    highlightedNodes,
    applyLayout,
    highlightRelatedNodes,
    onNodeDragStop,
    resetLayout,
  } = useSchemaLayout({
    initialNodes,
    initialEdges,
  } as any);

  const handleLayoutChange = useCallback((type: LayoutType) => {
    let layoutedNodes;
    switch (type) {
      case 'force':
        layoutedNodes = calculateForceDirectedLayout(nodes, edges);
        break;
      case 'circular':
        layoutedNodes = calculateCircularLayout(nodes, edges);
        break;
      case 'horizontal':
        layoutedNodes = calculateTreeLayout(nodes, edges, { rankdir: 'LR' });
        break;
      case 'vertical':
        layoutedNodes = calculateTreeLayout(nodes, edges, { rankdir: 'TB' });
        break;
      default:
        layoutedNodes = nodes;
    }
    applyLayout(type, layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2 }), 0);
  }, [nodes, edges, applyLayout, fitView]);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = schema.tables
      .filter(
        (table) =>
          table.name.toLowerCase().includes(lowerQuery) ||
          table.columns.some((col) =>
            col.name.toLowerCase().includes(lowerQuery) ||
            col.type.toLowerCase().includes(lowerQuery)
          )
      )
      .map((table) => table.name);

    setSearchResults(matches);
    highlightRelatedNodes(matches);

    if (matches.length === 1) {
      const node = nodes.find((n) => n.id === matches[0]);
      if (node) {
        setViewport({
          x: -node.position.x + window.innerWidth / 2,
          y: -node.position.y + window.innerHeight / 2,
          zoom: 1.5,
        });
      }
    }
  }, [schema.tables, nodes, highlightRelatedNodes, setViewport]);

  const handleExport = useCallback(() => {
    if (!flowWrapper.current) return;

    const dataUrl = flowWrapper.current.querySelector('svg')?.outerHTML;
    if (!dataUrl) return;

    const blob = new Blob([dataUrl], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const tableNode = node;
      setSelectedNode(tableNode as any);
      const stats = calculateDetailedNodeStatistics(
        tableNode as any,
        edges as RelationshipEdge[],
        nodes as TableNode[]
      );
      onNodeClick?.(tableNode as any);
      console.log('Node statistics:', stats);
    },
    [edges, nodes, onNodeClick],
  );

  const handleNodeMouseEnter: NodeMouseHandler = useCallback(
    (_, node) => {
      highlightRelatedNodes([node.id]);
    },
    [highlightRelatedNodes],
  );

  const handleNodeMouseLeave = useCallback(
    () => {
      if (!searchResults.length) {
        highlightRelatedNodes(null);
      }
    },
    [searchResults.length, highlightRelatedNodes],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      onEdgeClick?.(edge as unknown as RelationshipEdge);
    },
    [onEdgeClick],
  );

  const handleNodeDragStop = useCallback(
    (_, node) => {
      onNodeDragStop(node as any, nodes);
    },
    [nodes, onNodeDragStop],
  );

  // Reset search results when layout changes
  useEffect(() => {
    setSearchResults([]);
  }, [selectedLayout]);

  return (
    <div ref={flowWrapper} className={cn('w-full h-full min-h-[600px] relative', className)}>
      <SchemaControls
        selectedLayout={selectedLayout}
        onLayoutChange={handleLayoutChange}
        onReset={resetLayout}
        onSearch={handleSearch}
        onExport={handleExport}
        statistics={selectedNode ? calculateDetailedNodeStatistics(
          selectedNode,
          edges as RelationshipEdge[],
          nodes as TableNode[]
        ) : undefined}
      />
      
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          className: highlightedNodes.size === 0 || highlightedNodes.has(node.id)
            ? ''
            : 'opacity-30',
        }))}
        edges={edges.map((edge) => ({
          ...edge,
          className: highlightedNodes.size === 0 ||
            (highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target))
            ? ''
            : 'opacity-30',
        }))}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onNodeDragStop={handleNodeDragStop}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor="var(--border-primary)"
          nodeColor="var(--bg-secondary)"
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
}
