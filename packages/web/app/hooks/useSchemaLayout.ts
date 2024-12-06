import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import {
  ProcessedSchemaTable,
  RelationshipEdgeDataFields,
  TableNodeData,
  RelationshipEdgeData,
  LayoutType,
} from '../types/schema';
import { getAutoLayout, getForceLayout, getCircularLayout, getTreeLayout } from '../utils/schemaLayout';

interface UseSchemaLayoutProps {
  tables: ProcessedSchemaTable[];
  relationships: RelationshipEdgeDataFields[];
}

export function useSchemaLayout({ tables, relationships }: UseSchemaLayoutProps) {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('auto');
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData['data']>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationshipEdgeData['data']>([]);

  const createNodes = useCallback(
    (tables: ProcessedSchemaTable[]): TableNodeData[] => {
      return tables.map((table) => ({
        id: table.id,
        type: 'table',
        position: table.position || { x: 0, y: 0 },
        data: {
          name: table.name,
          columns: table.columns,
          comment: table.comment,
        },
      }));
    },
    []
  );

  const createEdges = useCallback(
    (relationships: RelationshipEdgeDataFields[]): RelationshipEdgeData[] => {
      return relationships.map((rel, index) => ({
        id: `e${index}`,
        source: rel.sourceTable,
        target: rel.targetTable,
        type: 'relationship',
        data: {
          sourceTable: rel.sourceTable,
          sourceColumn: rel.sourceColumn,
          targetTable: rel.targetTable,
          targetColumn: rel.targetColumn,
          label: rel.label || `${rel.sourceTable}.${rel.sourceColumn} → ${rel.targetTable}.${rel.targetColumn}`,
        },
      }));
    },
    []
  );

  useEffect(() => {
    const initialNodes = createNodes(tables);
    const initialEdges = createEdges(relationships);

    let layoutedNodes = initialNodes;
    switch (selectedLayout) {
      case 'force':
        layoutedNodes = getForceLayout(initialNodes, initialEdges);
        break;
      case 'circular':
        layoutedNodes = getCircularLayout(initialNodes);
        break;
      case 'horizontal':
      case 'vertical':
        layoutedNodes = getTreeLayout(initialNodes, initialEdges, selectedLayout);
        break;
      case 'auto':
      default:
        layoutedNodes = getAutoLayout(initialNodes);
    }

    setNodes(layoutedNodes);
    setEdges(initialEdges);
  }, [tables, relationships, selectedLayout, createNodes, createEdges, setNodes, setEdges]);

  const onLayoutChange = useCallback(
    (layout: LayoutType) => {
      setSelectedLayout(layout);
    },
    []
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
