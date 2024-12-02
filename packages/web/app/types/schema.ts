import type { Node, Edge } from '@xyflow/react';

export interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  constraint_type?: 'PRIMARY KEY' | 'FOREIGN KEY';
  foreign_table_name?: string;
  foreign_column_name?: string;
}

export interface SchemaTable {
  table_name: string;
  columns: TableColumn[];
}

export interface TableSchema {
  table_name: string;
  connectionId: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>;
  primary_key: string[] | null;
  foreign_keys: Array<{
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
  }> | null;
}

export interface ProcessedSchemaTable {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    references?: {
      table: string;
      column: string;
    };
  }>;
}

export interface TableNode extends Node {
  data: {
    id: string;
    label: string;
    columns: ProcessedSchemaTable['columns'];
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
    columns: ProcessedSchemaTable['columns'];
  };
}

export interface SchemaLayout {
  nodes: SchemaLayoutNode[];
  edges: RelationshipEdge[];
}

export interface SchemaVisualizationProps {
  schema: {
    tables: ProcessedSchemaTable[];
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
