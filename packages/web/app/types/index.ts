export interface QueryColumn {
  name: string;
  type: string;
}

export interface QueryResult {
  columns: QueryColumn[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  organizationId: string;
}

export * from './schema';
