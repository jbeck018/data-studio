import { useState } from "react";
import type { QueryResult } from "~/types";
import { RowDetailsSidebar } from "./RowDetailsSidebar";

interface QueryResultsProps {
  result: QueryResult;
  isLoading?: boolean;
}

export function QueryResults({ result, isLoading }: QueryResultsProps) {
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!result || !result.fields) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No results to display
      </div>
    );
  }

  const handleRowClick = (row: Record<string, any>) => {
    setSelectedRow(row);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-current shadow-sm">
          <div className="p-4 border-b">
            {result.metrics && (
              <div className="text-sm text-gray-500">
                {result.rowCount.toLocaleString()} rows in set ({result.metrics.executionTimeMs.toFixed(2)}ms)
              </div>
            )}
            {result.metrics && (
              <div className="text-xs text-gray-400 mt-1">
                {result.metrics.bytesProcessed.toLocaleString()} bytes processed
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {result.fields.map((field) => (
                    <th
                      key={field.name}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {field.name}
                      <div className="text-xs font-normal text-gray-400">
                        {field.dataType}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-current divide-y divide-gray-200">
                {result.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    {result.fields.map((field) => (
                      <td
                        key={field.name}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {formatValue(row[field.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <RowDetailsSidebar
        row={selectedRow}
        columns={result.fields.map(field => ({
          name: field.name,
          type: field.dataType,
          nullable: true,
          isPrimaryKey: false,
          isForeignKey: false
        }))}
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        formatCellValue={formatValue}
        fields={result.fields}
      />
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null) return "NULL";
  if (value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
