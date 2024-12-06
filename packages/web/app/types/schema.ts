import { Node, Edge } from '@xyflow/react';

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

export interface SchemaColumn {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableNodeDataFields {
  id: string;
  name: string;
  comment?: string;
  columns: SchemaColumn[];
  label?: string;
  position?: { x: number; y: number };
}

export interface RelationshipEdgeDataFields {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  label?: string;
}

export type TableNodeData = Node<TableNodeDataFields>;
export type RelationshipEdgeData = Edge<RelationshipEdgeDataFields>;

export type ProcessedSchemaTable = TableNodeData;

export type LayoutType = 'auto' | 'force' | 'circular' | 'horizontal' | 'vertical';

export interface SchemaLayout {
  nodes: TableNodeData[];
  edges: RelationshipEdgeData[];
  type: LayoutType;
}

export interface SchemaVisualizationProps {
  tables: ProcessedSchemaTable[];
  relationships: RelationshipEdgeDataFields[];
  onSearch?: (term: string) => void;
}
