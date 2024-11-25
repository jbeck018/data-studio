import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Schema } from "~/types";

interface EditableTableProps {
  schema: Schema;
  data: any[];
  onSave: (rowIndex: number, data: any) => void;
  onDelete: (rowIndex: number) => void;
  onAdd: (data: any) => void;
}

export function EditableTable({
  schema,
  data,
  onSave,
  onDelete,
  onAdd,
}: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [editedData, setEditedData] = useState<{ [key: string]: any }>({});

  const columnHelper = createColumnHelper<any>();

  const columns: ColumnDef<any, any>[] = [
    ...schema.columns.map((col) =>
      columnHelper.accessor(col.name, {
        header: () => (
          <div className="font-medium text-gray-900">
            {col.name}
            <span className="ml-2 text-xs text-gray-500">({col.type})</span>
          </div>
        ),
        cell: ({ row, column, getValue }) => {
          const isEditing =
            editingCell?.rowIndex === row.index &&
            editingCell?.columnId === column.id;
          const value = getValue();

          if (isEditing) {
            return (
              <input
                className="w-full px-2 py-1 border rounded"
                value={editedData[column.id] ?? value}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    [column.id]: e.target.value,
                  })
                }
                onBlur={() => {
                  onSave(row.index, {
                    ...row.original,
                    [column.id]: editedData[column.id],
                  });
                  setEditingCell(null);
                  setEditedData({});
                }}
                autoFocus
              />
            );
          }

          return (
            <div
              className="px-2 py-1 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setEditingCell({ rowIndex: row.index, columnId: column.id });
                setEditedData({ [column.id]: value });
              }}
            >
              {value}
            </div>
          );
        },
      })
    ),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDelete(row.index)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <button
          onClick={() => {
            const newRow = schema.columns.reduce(
              (acc, col) => ({ ...acc, [col.name]: "" }),
              {}
            );
            onAdd(newRow);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Row
        </button>
      </div>
    </div>
  );
}
