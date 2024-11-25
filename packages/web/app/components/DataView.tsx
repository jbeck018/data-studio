import { startCase } from "lodash-es";
import type { Column } from "~/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo } from "react";
import { useSearchParams } from "@remix-run/react";
import { RowDetailsSidebar } from "./RowDetailsSidebar";
import { cn } from "~/utils/cn";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface DataViewProps {
  columns: Column[];
  rows: Record<string, any>[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (column: string) => void;
  formatCellValue: (value: any) => string;
  onEdit?: (rowIndex: number, data: Record<string, any>) => void;
  onDelete?: (rowIndex: number) => void;
  isEditable?: boolean;
  selectedRow?: number;
  onRowSelect?: (index: number | null) => void;
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
}: DataViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const editingCell = searchParams.get("editCell")?.split(",").map(Number);
  const editedValue = searchParams.get("editValue");

  const handleStartEditing = (rowIndex: number, columnId: string) => {
    if (isEditable) {
      setSearchParams(prev => {
        prev.set("editCell", `${rowIndex},${columnId}`);
        prev.set("editValue", formatCellValue(rows[rowIndex][columnId]));
        return prev;
      }, { replace: true });
    }
  };

  const handleFinishEditing = (rowIndex: number, columnId: string) => {
    if (onEdit && editedValue !== null) {
      onEdit(rowIndex, {
        ...rows[rowIndex],
        [columnId]: editedValue,
      });
    }
    setSearchParams(prev => {
      prev.delete("editCell");
      prev.delete("editValue");
      return prev;
    }, { replace: true });
  };

  const columnHelper = createColumnHelper<Record<string, any>>();

  const tableColumns = useMemo(() => [
    ...columns.map((col) =>
      columnHelper.accessor(col.name, {
        header: () => (
          <div className="flex items-center space-x-1">
            <span>{startCase(col.name)}</span>
            <span className="text-xs text-gray-500">({col.type})</span>
          </div>
        ),
        cell: ({ row, column, getValue }) => {
          const value = getValue();
          const isEditing = isEditable && 
            editingCell?.[0] === row.index &&
            String(column.id) === String(editingCell?.[1]);

          if (isEditing) {
            return (
              <input
                className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-800"
                value={editedValue ?? formatCellValue(value)}
                onChange={(e) =>
                  setSearchParams(prev => {
                    prev.set("editValue", e.target.value);
                    return prev;
                  }, { replace: true })
                }
                onBlur={() => handleFinishEditing(row.index, column.id)}
                autoFocus
              />
            );
          }

          return (
            <div
              className={cn(
                "overflow-hidden text-ellipsis",
                isEditable && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                selectedRow === row.index && "bg-blue-50 dark:bg-blue-900"
              )}
              onClick={() => {
                if (isEditable) {
                  handleStartEditing(row.index, column.id);
                }
                if (onRowSelect) {
                  onRowSelect(selectedRow === row.index ? null : row.index);
                }
              }}
              style={{ maxWidth: '300px' }}
            >
              {formatCellValue(value)}
            </div>
          );
        },
      })
    ),
    ...(isEditable && onDelete
      ? [
          columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDelete(row.index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ),
          }),
        ]
      : []),
  ], [columns, isEditable, onDelete, selectedRow, editingCell, editedValue, formatCellValue]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    },
    onSortingChange: (updater) => {
      const newSorting = (typeof updater === 'function' ? updater([]) : updater) as SortingState;
      if (newSorting.length > 0) {
        onSort(newSorting[0].id);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="h-full overflow-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ width: table.getTotalSize() }}>
              <thead className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="group relative px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap select-none bg-white dark:bg-gray-900"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          width: header.getSize(),
                          position: 'relative',
                        }}
                      >
                        <div className="flex items-center justify-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="ml-1">
                            {header.column.getIsSorted() === "asc" ? "↑" : ""}
                            {header.column.getIsSorted() === "desc" ? "↓" : ""}
                          </span>
                        </div>
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className="absolute right-0 top-2 bottom-2 w-4 cursor-col-resize select-none touch-none group/resizer"
                            style={{ cursor: 'col-resize' }}
                          >
                            <div 
                              className={cn(
                                "absolute right-0 h-full",
                                header.column.getIsResizing()
                                  ? "bg-blue-500"
                                  : "bg-gray-200 dark:bg-gray-700 group-hover/resizer:bg-blue-500"
                              )}
                              style={{ width: '1px' }}
                            />
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "group hover:bg-gray-50 dark:hover:bg-gray-800",
                      selectedRow === row.index && "bg-blue-50 dark:bg-blue-900"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        <div className="flex items-center">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          {cell.column.id === columns[0].name && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onRowSelect) {
                                  onRowSelect(selectedRow === row.index ? null : row.index);
                                }
                              }}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          )}
                        </div>
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
        row={rows[selectedRow ?? -1] ?? null}
        columns={columns}
        isOpen={selectedRow !== undefined}
        onClose={() => {
          if (onRowSelect) {
            onRowSelect(null);
          }
        }}
        formatCellValue={formatCellValue}
      />
    </div>
  );
}
