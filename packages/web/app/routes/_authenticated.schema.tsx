import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { fetchDatabaseSchema } from '../utils/database.server';
import { SchemaVisualization } from '../components/SchemaVisualization';
import { PageContainer } from '../components/PageContainer';
import type { TableSchema, ProcessedSchemaTable, RelationshipEdgeData } from '../types/schema';

export async function loader({ request }: { request: Request }) {
  try {
    const connectionId = 'your-connection-id'; // You'll need to get this from your auth context
    const organizationId = 'your-org-id'; // You'll need to get this from your auth context
    const schema = await fetchDatabaseSchema(connectionId, organizationId);
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

function transformSchemaData(schema: TableSchema[]): {
  tables: ProcessedSchemaTable[];
  relationships: RelationshipEdgeData[];
} {
  const tables: ProcessedSchemaTable[] = schema.map((table, index) => ({
    id: `table-${index}`,
    type: 'table',
    position: { x: 0, y: index * 200 },
    data: {
      id: `table-${index}`,
      name: table.name,
      columns: table.columns.map(col => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable,
        isPrimaryKey: col.isPrimaryKey,
        isForeignKey: col.isForeignKey,
        references: col.references,
      })),
      type: 'table',
      selected: false,
      draggable: true,
      selectable: true,
      deletable: false,
    },
  }));

  const relationships: RelationshipEdgeData[] = schema.flatMap((table, tableIndex) =>
    table.columns
      .filter(col => col.isForeignKey && col.references)
      .map((col, colIndex) => {
        const targetTableIndex = schema.findIndex(t => t.name === col.references!.table);
        return {
          id: `edge-${tableIndex}-${colIndex}`,
          source: `table-${tableIndex}`,
          target: `table-${targetTableIndex}`,
          label: `${table.name}.${col.name} → ${col.references!.table}.${col.references!.column}`,
          sourceTable: table.name,
          sourceColumn: col.name,
          targetTable: col.references!.table,
          targetColumn: col.references!.column,
          selected: false,
          animated: false,
        };
      })
  );

  return { tables, relationships };
}

export default function Schema() {
  const { schema, error } = useLoaderData<LoaderData>();

  if (error) {
    return <div>Error: {error}</div>;
  }

  const schemaData = transformSchemaData(schema);

  return (
    <PageContainer>
      <SchemaVisualization schema={schemaData} />
    </PageContainer>
  );
}
