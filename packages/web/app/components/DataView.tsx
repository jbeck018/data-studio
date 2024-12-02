import { startCase } from "lodash-es";
import { useCallback, useMemo, useState } from "react";
import type { Column } from "../types";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
import { cn } from "../utils/cn";

interface DataViewProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (column: string) => void;
  formatCellValue: (value: unknown) => string;
  onEdit?: (rowIndex: number, data: Record<string, unknown>) => void;
  onDelete?: (rowIndex: number) => void;
  isEditable?: boolean;
  selectedRow?: number;
  onRowSelect?: (index: number | null) => void;
  isLoading?: boolean;
  error?: string;
}

export function DataView({
  columns,
  rows,
  sortBy,
  sortOrder,
  onSort,
  formatCellValue,
  onEdit,
  onDelete,
  isEditable = false,
  selectedRow,
  onRowSelect,
  isLoading = false,
  error = '',
}: DataViewProps) {
  const [editingCell, setEditingCell] = useState<[number, string] | null>(null);
  const [editedValue, setEditedValue] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const handleStartEditing = useCallback((rowIndex: number, columnId: string) => {
    if (!isEditable) return;
    setEditingCell([rowIndex, columnId]);
    setEditedValue(formatCellValue(rows[rowIndex]?.[columnId]));
    setEditError(null);
  }, [rows, isEditable, formatCellValue]);

  const handleStopEditing = useCallback(() => {
    setEditingCell(null);
    setEditedValue(null);
    setEditError(null);
  }, []);

  const handleKeyDown = useCallback(async (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnId: string
  ) => {
    if (e.key === "Escape") {
      handleStopEditing();
    } else if (e.key === "Enter") {
      try {
        const value = (e.target as HTMLInputElement).value;
        const newData = {
          ...rows[rowIndex],
          [columnId]: value,
        };

        await onEdit?.(rowIndex, newData);
        handleStopEditing();
      } catch (error) {
        setEditError(error instanceof Error ? error.message : 'Failed to update value');
      }
    }
  }, [rows, onEdit, handleStopEditing]);

  const handleSort = useCallback((columnId: string) => {
    onSort(columnId);
  }, [onSort]);

  const handleRowClick = useCallback((rowIndex: number) => {
    onRowSelect?.(selectedRow === rowIndex ? null : rowIndex);
  }, [selectedRow, onRowSelect]);

  const handleDelete = useCallback(async (e: React.MouseEvent, rowIndex: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this row?')) return;
    
    try {
      await onDelete?.(rowIndex);
    } catch (error) {
      console.error('Failed to delete row:', error);
      // Show error toast or notification here
    }
  }, [onDelete]);

  const columnHelper = createColumnHelper<Record<string, unknown>>();

  const tableColumns = useMemo(() => 
    columns.map(col => 
      columnHelper.accessor(col.name, {
        header: () => startCase(col.name),
        cell: info => {
          const rowIndex = info.row.index;
          const columnId = col.name;
          const isEditing = editingCell?.[0] === rowIndex && editingCell?.[1] === columnId;
          const value = info.getValue();

          if (isEditing) {
            return (
              <div className="relative">
                <input
                  type="text"
                  value={editedValue || ""}
                  onChange={e => setEditedValue(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, rowIndex, columnId)}
                  onBlur={() => handleStopEditing()}
                  className={cn(
                    "w-full px-2 py-1 bg-white dark:bg-gray-800 border rounded-md focus:outline-none focus:ring-2",
                    editError 
                      ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400" 
                      : "border-primary-500 dark:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                  )}
                  autoFocus
                />
                {editError && (
                  <div className="absolute left-0 right-0 -bottom-6 text-xs text-red-500 dark:text-red-400">
                    {editError}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              className={cn(
                "cursor-pointer",
                isEditable && "hover:bg-primary-50 dark:hover:bg-primary-900/20"
              )}
              onClick={() => handleStartEditing(rowIndex, columnId)}
            >
              {formatCellValue(value)}
            </div>
          );
        },
      })
    ),
    [columns, formatCellValue, editingCell, editedValue, handleKeyDown, handleStartEditing, isEditable, editError]
  );

  const sorting = useMemo<SortingState>(() => 
    sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    [sortBy, sortOrder]
  );

  const [sortingState, setSorting] = useState<SortingState>(sorting);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting: sortingState,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (error) {
    return (
      <div className="border rounded-lg border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/50 p-4">
        <div className="text-red-700 dark:text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full flex flex-col relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">No data available</div>
          <div className="text-sm text-gray-400 dark:text-gray-500">This table is empty</div>
        </div>
      ) : (
        <div className="overflow-auto flex-1 relative rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                {table.getAllColumns().map(column => (
                  <th
                    key={column.id}
                    scope="col"
                    className="px-6 py-3 cursor-pointer select-none whitespace-nowrap bg-gray-50 dark:bg-gray-800"
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{startCase(column.id)}</span>
                      {sortingState[0]?.id === column.id && (
                        <span className="text-gray-400">
                          {sortingState[0].desc ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {isEditable && (
                  <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800 w-24">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "bg-white dark:bg-gray-900",
                    selectedRow === rowIndex && "bg-primary-50 dark:bg-primary-900/20",
                    "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b dark:border-gray-700"
                  )}
                  onClick={() => handleRowClick(rowIndex)}
                >
                  {row.getAllCells().map((cell) => (
                    <td 
                      key={cell.id} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  {isEditable && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => handleDelete(e, rowIndex)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
