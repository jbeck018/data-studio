import type { TableSchema } from "~/types";

interface TableStructureProps {
  table: TableSchema;
  onSave: (updatedSchema: TableSchema) => Promise<void>;
}

export function TableStructure({ table, onSave }: TableStructureProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{table.name}</h2>
        <div className="mt-1 text-sm text-gray-500">
          {table.columns.length} columns • {table.rowCount.toLocaleString()} rows
        </div>
      </div>

      <div className="space-y-4">
        {table.primaryKeys && table.primaryKeys.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Primary Keys</h3>
            <div className="mt-1 text-sm font-mono text-gray-900">
              {table.primaryKeys.join(", ")}
            </div>
          </div>
        )}

        {table.foreignKeys.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Foreign Keys</h3>
            <div className="mt-1 space-y-1">
              {table.foreignKeys.map((fk) => (
                <div key={fk.columnName} className="text-sm font-mono text-gray-900">
                  {fk.columnName} → {fk.referencedTable}.{fk.referencedColumn}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Columns</h3>
        <div className="bg-current shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nullable
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
              </tr>
            </thead>
            <tbody className="bg-current divide-y divide-gray-200">
              {table.columns.map((column) => (
                <tr key={column.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {column.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {column.dataType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.isNullable ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {column.defaultValue ?? "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.isPrimaryKey && "PK"}
                    {column.isForeignKey && "FK"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
