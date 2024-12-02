import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { SchemaVisualization } from '../components/SchemaVisualization';
import { useSchemaData } from '../hooks/useSchemaData';
import { requireUser } from '../lib/auth/session.server';
import { fetchSchema } from '../utils/api.server';
import { PageContainer } from '../components/PageContainer';
import type { TableSchema } from '../types/schema';

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  const schema = await fetchSchema();
  return json({ rawSchema: schema });
}

export default function SchemaPage() {
  const { rawSchema } = useLoaderData<typeof loader>();
  const processedSchema = useSchemaData(rawSchema as unknown as TableSchema[]);
  
  // Extract relationships from foreign keys
  const relationships = processedSchema.tables.flatMap(table => 
    table.columns
      .filter(column => column.isForeignKey && column.references)
      .map(column => ({
        sourceTable: table.name,
        sourceColumn: column.name,
        targetTable: column.references!.table,
        targetColumn: column.references!.column,
        type: 'one-to-many' as const // Default to one-to-many relationship
      }))
  );

  return (
    <PageContainer>
      <div className="flex-none px-4 py-3">
        <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
          Database Schema
        </h1>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <SchemaVisualization
          schema={{
            tables: processedSchema.tables,
            relationships
          }}
          className="h-full"
          onNodeClick={(node) => {
            console.log('Node clicked:', node);
          }}
          onEdgeClick={(edge) => {
            console.log('Edge clicked:', edge);
          }}
        />
      </div>
    </PageContainer>
  );
}
