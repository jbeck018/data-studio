import { Column } from "~/types/schema";
import { cn } from "~/lib/utils";
import { XIcon } from "lucide-react";

interface RowDetailsSidebarProps {
  row: Record<string, any> | null;
  columns: Column[];
  isOpen: boolean;
  onClose: () => void;
  formatCellValue: (value: unknown) => string;
  fields: { name: string; type: string; dataType: string; }[];
}

export function RowDetailsSidebar({
  row,
  columns,
  isOpen,
  onClose,
  formatCellValue
}: RowDetailsSidebarProps) {
  if (!row) return null;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Row Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <XIcon className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <dl className="space-y-4">
            {columns.map(column => (
              <div 
                key={column.name} 
                className="bg-card px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <dt className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {column.name}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {column.type}
                  </span>
                </dt>
                <dd className="mt-2">
                  <div className="text-sm text-foreground break-words">
                    {formatCellValue(row[column.name])}
                  </div>
                  {column.nullable && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Nullable
                    </div>
                  )}
                  {column.defaultValue !== undefined && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Default: {formatCellValue(column.defaultValue)}
                    </div>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
