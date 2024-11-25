export interface TableSchema {
  name: string;
  columns: Column[];
  primaryKey?: string[];
  rowCount: number;
  sizeInBytes: number;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

export interface QueryResult {
  rows: Record<string, any>[];
  fields: {
    name: string;
    dataTypeID: number;
  }[];
}

export interface TableDataResponse {
  data: Record<string, any>[];
  totalRows: number;
  page?: number;
  pageSize?: number;
}
