import { Link } from "@remix-run/react";
import type { TableSchema } from "~/types";

interface TableListProps {
  tables: TableSchema[];
}

export function TableList({ tables }: TableListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => (
        <Link
          key={table.name}
          to={`/tables/${table.name}`}
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{table.name}</h3>
            <span className="text-sm text-gray-500">
              {table.columns.length} columns
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <div className="flex flex-wrap gap-2">
              {table.columns.slice(0, 3).map((column) => (
                <span
                  key={column.name}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {column.name}
                  {column.type && (
                    <span className="ml-1 text-gray-500">({column.type})</span>
                  )}
                </span>
              ))}
              {table.columns.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                  +{table.columns.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            {table.primaryKey && table.primaryKey.length > 0 && (
              <div className="mr-4">
                <span className="font-medium">Primary Key:</span>{" "}
                {table.primaryKey.join(", ")}
              </div>
            )}
            {table.foreignKeys && table.foreignKeys.length > 0 && (
              <div>
                <span className="font-medium">Foreign Keys:</span>{" "}
                {table.foreignKeys.length}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
