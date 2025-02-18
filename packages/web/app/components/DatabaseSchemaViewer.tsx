import { useState } from "react";
import type { TableSchema } from "~/types";
import { DatabaseTableSchema } from "~/utils/database.server";

interface TableStructureProps {
  table: TableSchema;
}

function TableStructure({ table }: TableStructureProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{table.name}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Column
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nullable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default
              </th>
            </tr>
          </thead>
          <tbody className="bg-current divide-y divide-gray-200">
            {table.columns.map((column) => (
              <tr key={column.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {column.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.isNullable ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.defaultValue || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DatabaseSchemaViewerProps {
  schemas: DatabaseTableSchema[];
}

export function DatabaseSchemaViewer({ schemas }: DatabaseSchemaViewerProps) {
  const [selectedTable, setSelectedTable] = useState<DatabaseTableSchema | null>(schemas[0] || null);

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Tables</h2>
        <div className="space-y-2">
          {schemas.map((schema) => (
            <div 
              key={schema.name}
              className="p-2 bg-gray-100 rounded cursor-pointer"
              onClick={() => setSelectedTable(schema)}
            >
              {schema.name}
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 p-4 overflow-y-auto">
        {selectedTable && <TableStructure table={selectedTable as TableSchema} />}
      </div>
    </div>
  );
}
