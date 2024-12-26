import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
} from '@xyflow/react';
import TableNode from './TableNode';
import RelationshipEdge from './RelationshipEdge';
import { useSchemaLayout } from '../../hooks/useSchemaLayout';
import { ProcessedSchemaTable, RelationshipEdgeData, TableNodeData, LayoutType } from '../../types/schema';

const nodeTypes: NodeTypes = {
  table: TableNode as unknown as any,
} as const;

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge as any,
} as const;

interface SchemaVisualizationProps {
  schema: {
    tables: ProcessedSchemaTable[];
    relationships: RelationshipEdgeData[];
  };
  onLayoutChange?: (layout: LayoutType) => void;
}

export function SchemaVisualization({ schema, onLayoutChange }: SchemaVisualizationProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectedLayout,
    onLayoutChange: handleLayoutChange,
  } = useSchemaLayout(schema);

  const handleNodesChange = (changes: NodeChange[]) => {
    onNodesChange(changes as NodeChange<Node<TableNodeData>>[]);
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    onEdgesChange(changes as EdgeChange<Edge<RelationshipEdgeData>>[]);
  };

  const handleLayoutTypeChange = (layout: LayoutType) => {
    handleLayoutChange(layout);
    onLayoutChange?.(layout);
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
