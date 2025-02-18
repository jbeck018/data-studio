import { useCallback, useState } from 'react';
import { Button } from './ui/button';

export interface Column {
  field: string;
  headerName: string;
  width: number;
  type: string;
  sortable?: boolean;
  editable?: boolean;
}

export interface DataGridProps {
  rows: Record<string, unknown>[];
  columns: Column[];
  pageSize?: number;
  rowsPerPageOptions?: number[];
  disableSelectionOnClick?: boolean;
  autoHeight?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  formatCellValue?: (value: unknown) => string;
  isEditable?: boolean;
  onEdit?: (rowIndex: number, newData: Record<string, unknown>) => Promise<void>;
  onDelete?: (rowIndex: number) => Promise<void>;
  selectedRow?: number;
  onRowSelect?: (index: number | null) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function DataGrid({
  rows,
  columns,
  pageSize = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  disableSelectionOnClick,
  autoHeight,
  sortBy,
  sortOrder,
  onSort,
  formatCellValue: externalFormatCellValue,
  isEditable,
  onEdit,
  onDelete,
  selectedRow,
  onRowSelect,
  isLoading,
  error,
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const startIndex = currentPage * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, rows.length);
  const currentRows = rows.slice(startIndex, endIndex);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setCurrentPageSize(newSize);
    setCurrentPage(0);
  }, []);

  const handleRowClick = useCallback((index: number) => {
    if (!disableSelectionOnClick && onRowSelect) {
      onRowSelect(selectedRow === index ? null : index);
    }
  }, [disableSelectionOnClick, onRowSelect, selectedRow]);

  const handleSort = useCallback((columnId: string) => {
    if (onSort) {
      onSort(columnId);
    }
  }, [onSort]);

  const formatCellValue = useCallback((value: unknown, type: string): string => {
    if (externalFormatCellValue) {
      return externalFormatCellValue(value);
    }

    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'number':
        return typeof value === 'number' ? value.toString() : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return value instanceof Date ? value.toLocaleString() : String(value);
      default:
        return String(value);
    }
  }, [externalFormatCellValue]);

  const handleEdit = useCallback(async (e: React.MouseEvent, rowIndex: number, row: Record<string, unknown>) => {
    e.stopPropagation();
    if (onEdit) {
      try {
        await onEdit(rowIndex, row);
      } catch (error) {
        console.error('Failed to edit row:', error);
      }
    }
  }, [onEdit]);

  const handleDelete = useCallback(async (e: React.MouseEvent, rowIndex: number) => {
    e.stopPropagation();
    if (onDelete) {
      try {
        await onDelete(rowIndex);
      } catch (error) {
        console.error('Failed to delete row:', error);
      }
    }
  }, [onDelete]);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className={`w-full ${autoHeight ? 'h-auto' : 'h-full'} flex flex-col`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => onSort && handleSort(column.field)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.headerName}</span>
                    {sortBy === column.field && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              {(isEditable || onDelete) && (
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-current dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {currentRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  !disableSelectionOnClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                } ${selectedRow === rowIndex ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                onClick={() => handleRowClick(rowIndex)}
              >
                {columns.map((column) => (
                  <td
                    key={column.field}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {formatCellValue(row[column.field], column.type)}
                  </td>
                ))}
                {(isEditable || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {isEditable && onEdit && (
                      <Button
                        onClick={(e) => handleEdit(e, rowIndex, row)}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        onClick={(e) => handleDelete(e, rowIndex)}
                        variant="destructive"
                        size="sm"
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
          <select
            value={currentPageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-current dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage + 1} of {Math.ceil(rows.length / currentPageSize)}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={endIndex >= rows.length}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
