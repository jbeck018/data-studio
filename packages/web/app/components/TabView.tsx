import { ReactNode } from "react";
import { startCase } from "lodash-es";

interface Tab {
  id: string;
  label: string;
}

interface TabViewProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface DataViewProps {
  columns: string[];
  rows: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onPageChange: (page: number) => void;
  onSort: (column: string) => void;
  formatCellValue: (value: any) => string;
}

export function TabView({ tabs, activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-900">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
                isActive
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DataView({
  columns,
  rows,
  currentPage,
  totalPages,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  onSort,
  formatCellValue,
}: DataViewProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="group px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{startCase(column.toLowerCase())}</span>
                    <span className="invisible group-hover:visible">
                      {sortBy === column ? (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        "↕"
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-300 font-mono"
                  >
                    {formatCellValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
