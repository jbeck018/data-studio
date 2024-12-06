import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { fetchDatabaseSchema } from '../utils/database.server';
import { SchemaVisualization } from '../components/SchemaVisualization';
import { PageContainer } from '../components/PageContainer';
import type { TableSchema } from '../types/schema';

export async function loader() {
  try {
    const schema = await fetchDatabaseSchema('your-connection-id');
    return json({ schema });
  } catch (error) {
    console.error('Failed to fetch schema:', error);
    return json({ error: 'Failed to fetch database schema' }, { status: 500 });
  }
}

interface LoaderData {
  schema: TableSchema[];
  error?: string;
}

export default function Schema() {
  const { schema, error } = useLoaderData<LoaderData>();

  if (error) {
    return (
      <PageContainer>
        <div className="text-red-500">{error}</div>
      </PageContainer>
    );
  }

  // Transform the schema data into the format expected by SchemaVisualization
  const processedSchema = {
    tables: schema.map(table => ({
      name: table.table_name,
      columns: table.columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        isPrimaryKey: table.primary_key?.includes(col.column_name) || false,
        isForeignKey: table.foreign_keys?.some(fk => fk.column_name === col.column_name) || false,
        references: table.foreign_keys?.find(fk => fk.column_name === col.column_name)
          ? {
              table: table.foreign_keys.find(fk => fk.column_name === col.column_name)!.foreign_table_name,
              column: table.foreign_keys.find(fk => fk.column_name === col.column_name)!.foreign_column_name,
            }
          : undefined,
      })),
    })),
    relationships: schema.flatMap(table =>
      (table.foreign_keys || []).map(fk => ({
        sourceTable: table.table_name,
        sourceColumn: fk.column_name,
        targetTable: fk.foreign_table_name,
        targetColumn: fk.foreign_column_name,
        type: 'one-to-many' as const,
      }))
    ),
  };

  return (
    <PageContainer>
      <SchemaVisualization schema={processedSchema} />
    </PageContainer>
  );
}
