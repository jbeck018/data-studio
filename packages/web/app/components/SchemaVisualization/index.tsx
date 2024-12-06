import { useCallback } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ReactFlow,
} from '@xyflow/react';
import { ProcessedSchemaTable, RelationshipEdgeDataFields } from '../../types/schema';
import { useSchemaLayout } from '../../hooks/useSchemaLayout';
import { TableNode } from './TableNode';
import { RelationshipEdge } from './RelationshipEdge';
import SchemaControls from './SchemaControls';

const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

interface SchemaVisualizationProps {
  tables: ProcessedSchemaTable[];
  relationships: RelationshipEdgeDataFields[];
  onSearch?: (term: string) => void;
}

export default function SchemaVisualization({
  tables,
  relationships,
  onSearch,
}: SchemaVisualizationProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectedLayout,
    onLayoutChange,
  } = useSchemaLayout({
    tables,
    relationships,
  });

  const onInit = useCallback(() => {
    // Any initialization logic can go here
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <SchemaControls
          selectedLayout={selectedLayout}
          onLayoutChange={onLayoutChange}
          onSearch={onSearch}
        />
      </ReactFlow>
    </div>
  );
}
