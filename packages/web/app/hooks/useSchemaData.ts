import { useMemo } from 'react';
import type { TableColumn } from '~/types/schema';

interface SchemaTable {
  table_name: string;
  columns: {
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    column_default: string | null;
    constraint_type?: 'PRIMARY KEY' | 'FOREIGN KEY';
    foreign_table_name?: string;
    foreign_column_name?: string;
  }[];
}

export function useSchemaData(schemaData: SchemaTable[]) {
  return useMemo(() => {
    const tables = schemaData.map((table) => ({
      name: table.table_name,
      columns: table.columns.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable,
        isPrimaryKey: col.constraint_type === 'PRIMARY KEY',
        isForeignKey: col.constraint_type === 'FOREIGN KEY',
        ...(col.constraint_type === 'FOREIGN KEY' && {
          references: {
            table: col.foreign_table_name!,
            column: col.foreign_column_name!,
          },
        }),
      })) as TableColumn[],
    }));

    const relationships = schemaData
      .flatMap((table) =>
        table.columns
          .filter((col) => col.constraint_type === 'FOREIGN KEY')
          .map((col) => ({
            sourceTable: table.table_name,
            sourceColumn: col.column_name,
            targetTable: col.foreign_table_name!,
            targetColumn: col.foreign_column_name!,
            // This is a simplified relationship type inference
            // In a real app, you'd want to analyze the constraints more carefully
            type: 'one-to-many' as const,
          })),
      )
      .filter(
        (rel, index, self) =>
          index ===
          self.findIndex(
            (r) =>
              r.sourceTable === rel.sourceTable &&
              r.sourceColumn === rel.sourceColumn &&
              r.targetTable === rel.targetTable &&
              r.targetColumn === rel.targetColumn,
          ),
      );

    return {
      tables,
      relationships,
    };
  }, [schemaData]);
}
