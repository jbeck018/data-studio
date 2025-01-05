import { useMemo } from 'react';
import type { TableSchema } from '../types';

export interface ProcessedSchemaTable {
  type: 'table';
  tableName: string;
  primaryKeys: string[];
  foreignKeys: {
    columnName: string;
    referencedTable: string;
    referencedColumn: string;
  }[];
  columns: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
}

export function useSchemaData(schema: TableSchema[]): ProcessedSchemaTable[] {
  return useMemo(() => {
    return schema.map((table) => ({
      type: 'table' as const,
      tableName: table.tableName,
      primaryKeys: table.primaryKeys || [],
      foreignKeys: table.foreignKeys.map(fk => ({
        columnName: fk.columnName,
        referencedTable: fk.referencedTable,
        referencedColumn: fk.referencedColumn,
      })),
      columns: table.columns.map(col => ({
        name: col.columnName,
        type: col.dataType,
        nullable: col.isNullable,
      })),
    }));
  }, [schema]);
}
