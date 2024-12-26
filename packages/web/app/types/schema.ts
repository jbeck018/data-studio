import { Node, Edge, NodeProps, EdgeProps } from '@xyflow/react';
import { CSSProperties } from 'react';

export type ColumnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'timestamp'
  | 'json'
  | 'array'
  | 'object'
  | 'unknown';

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableSchema {
  id: string;
  name: string;
  comment?: string;
  columns: Column[];
  rowCount: number;
  sizeInBytes: number;
}

export interface TableNodeData {
  [key: string]: unknown;
  id: string;
  name: string;
  columns: Column[];
  comment?: string;
  position?: { x: number; y: number };
  type: 'table';
  selected: boolean;
  draggable: boolean;
  selectable: boolean;
  deletable: boolean;
}

export interface RelationshipEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  label?: string;
  selected: boolean;
  animated: boolean;
  style?: CSSProperties;
}

export interface ProcessedSchemaTable extends Node<TableNodeData> {
  id: string;
  type: 'table';
  position: { x: number; y: number };
  data: TableNodeData;
}

export type TableNodeDataFields = TableNodeData;
export type RelationshipEdgeDataFields = RelationshipEdgeData;

export type TableNode = Node<TableNodeData>;
export type RelationshipEdge = Edge<RelationshipEdgeData>;

export type LayoutType = 'auto' | 'force' | 'circular' | 'horizontal' | 'vertical' | 'LR' | 'TB' | 'Radial';

export interface SchemaLayout {
  nodes: TableNode[];
  edges: RelationshipEdge[];
  type: LayoutType;
}

export interface SchemaVisualizationProps {
  tables: ProcessedSchemaTable[];
  relationships: RelationshipEdgeDataFields[];
  onSearch?: (term: string) => void;
}

export interface SchemaData {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      isPrimaryKey?: boolean;
      isForeignKey?: boolean;
      references?: {
        table: string;
        column: string;
      };
    }>;
  }>;
  relationships: Array<{
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
  }>;
}
