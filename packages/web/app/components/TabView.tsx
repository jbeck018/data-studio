import { startCase } from "lodash-es";
import { cn } from "../utils/cn";
import { Button } from "./ui/button";

interface Tab {
  id: string;
  label: string;
}

interface TabViewProps {
  tabs: Array<{
    id: string;
    label: string;
  }>;
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
    <div className="bg-background border-b border-border">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant="ghost"
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 rounded-none",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </Button>
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
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="group px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
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
          <tbody className="bg-card divide-y divide-border">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-pre-wrap text-sm text-foreground font-mono"
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
