export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyConstraint[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

export interface ForeignKeyConstraint {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface QueryResult {
  rows: any[];
  fields: {
    name: string;
    dataTypeID: number;
  }[];
}

export interface TableDataResponse {
  data: any[];
  totalRows: number;
  page: number;
  pageSize: number;
}

export interface QueryRequest {
  sql: string;
  params?: any[];
}

export interface Schema {
  tableName: string;
  columns: Column[];
  primaryKey?: PrimaryKey;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
}

export interface PrimaryKey {
  column: string;
  value: string | number;
}
