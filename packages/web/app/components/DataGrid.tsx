import { useCallback, useState } from 'react';
import { Button } from './ui/button';

export interface Column {
  field: string;
  headerName: string;
  width: number;
  type: string;
}

interface DataGridProps {
  rows: Record<string, any>[];
  columns: Column[];
  pageSize: number;
  rowsPerPageOptions: number[];
  disableSelectionOnClick?: boolean;
  autoHeight?: boolean;
}

export function DataGrid({
  rows,
  columns,
  pageSize: initialPageSize,
  rowsPerPageOptions,
  disableSelectionOnClick,
  autoHeight,
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, rows.length);
  const currentRows = rows.slice(startIndex, endIndex);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  }, []);

  return (
    <div className={`w-full ${autoHeight ? 'h-auto' : 'h-full'} flex flex-col`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  disableSelectionOnClick ? '' : 'cursor-pointer hover:bg-gray-50'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.field}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatCellValue(row[column.field], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage + 1} of {Math.ceil(rows.length / pageSize)}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={endIndex >= rows.length}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return value instanceof Date ? value.toLocaleString() : value;
    default:
      return String(value);
  }
}
