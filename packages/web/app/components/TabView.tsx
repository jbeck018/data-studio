import { startCase } from "lodash-es";
import { cn } from "../utils/cn";

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
    <div className="bg-light-bg-primary dark:bg-dark-bg-secondary px-6">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2",
                isActive
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary hover:border-light-border dark:hover:text-dark-text-primary dark:hover:border-dark-border"
              )}
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
