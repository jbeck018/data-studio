import { useState } from "react";
import { Input } from "~/components/ui/input";
import { startCase } from "lodash";
import type { TableSchema } from "~/types";

interface TableListProps {
  tables: TableSchema[];
  selectedTable: TableSchema | null;
  onTableClick: (table: TableSchema) => void;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatNumber(num: number): string {
  if (!num || num < 0) return '0';
  return new Intl.NumberFormat().format(num);
}

function prettyPrintName(name: string): string {
  return startCase(name.toLowerCase());
}

export function TableList({ tables, selectedTable, onTableClick }: TableListProps) {
  const [filter, setFilter] = useState("");

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Filter tables..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {filteredTables.map((table) => (
            <li
              key={table.name}
              className={`px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                selectedTable?.name === table.name
                  ? "bg-gray-100"
                  : ""
              }`}
              onClick={() => onTableClick(table)}
            >
              <div className="font-medium">{prettyPrintName(table.name)}</div>
              <div className="text-xs text-gray-500">
                {table.columns.length} columns • {formatNumber(table.rowCount)} rows • {formatBytes(table.sizeInBytes)} size
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
