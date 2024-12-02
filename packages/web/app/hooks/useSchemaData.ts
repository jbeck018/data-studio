import { useMemo } from 'react';
import type { TableSchema, ProcessedSchemaTable } from '../types/schema';

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

export function useSchemaData(schemaData: TableSchema[]): { tables: ProcessedSchemaTable[] } {
  return useMemo(() => {
    const tables = schemaData.map((table): ProcessedSchemaTable => ({
      name: table.table_name,
      columns: table.columns.map((col) => {
        const isPrimaryKey = table.primary_key?.includes(col.column_name) ?? false;
        const foreignKey = table.foreign_keys?.find(fk => fk.column_name === col.column_name);
        const isForeignKey = !!foreignKey;

        return {
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          isPrimaryKey,
          isForeignKey,
          ...(isForeignKey && {
            references: {
              table: foreignKey!.foreign_table_name,
              column: foreignKey!.foreign_column_name,
            },
          }),
        };
      }),
    }));

    return { tables };
  }, [schemaData]);
}
