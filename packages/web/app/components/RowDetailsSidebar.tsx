import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Column } from "~/types";
import { startCase } from "lodash-es";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "~/utils/cn";

interface RowDetailsSidebarProps {
  row: Record<string, any> | null;
  columns: Column[];
  isOpen: boolean;
  onClose: () => void;
  formatCellValue: (value: any) => string;
}

export function RowDetailsSidebar({
  row,
  columns,
  isOpen,
  onClose,
  formatCellValue,
}: RowDetailsSidebarProps) {
  const [mounted, setMounted] = useState(false);
  console.log(row, isOpen);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const sidebarContent = (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Row Details</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {row && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {columns.map((column) => (
                  <div key={column.name} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {startCase(column.name)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({column.type})
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                      <pre className="text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                        {formatCellValue(row[column.name])}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(sidebarContent, document.body);
}
