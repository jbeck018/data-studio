import type { Node, Edge } from '@xyflow/react';

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isIndexed: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableNode extends Node {
  data: {
    id: string;
    label: string;
    columns: TableColumn[];
  };
}

export interface RelationshipEdge extends Edge {
  data: {
    sourceColumn: string;
    targetColumn: string;
    relationType: 'one-to-one' | 'one-to-many' | 'many-to-many';
  };
  source: string;
  target: string;
}

export interface SchemaLayoutNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    columns: TableColumn[];
  };
}

export interface SchemaLayout {
  nodes: SchemaLayoutNode[];
  edges: RelationshipEdge[];
}

export interface SchemaVisualizationProps {
  schema: {
    tables: {
      name: string;
      columns: TableColumn[];
    }[];
    relationships: {
      sourceTable: string;
      sourceColumn: string;
      targetTable: string;
      targetColumn: string;
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    }[];
  };
  onNodeClick?: (node: TableNode) => void;
  onEdgeClick?: (edge: RelationshipEdge) => void;
  className?: string;
}
