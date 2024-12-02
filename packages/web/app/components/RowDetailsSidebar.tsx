import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { startCase } from "lodash-es";
import { cn } from "../utils/cn";
import type { Column } from "../types";

interface RowDetailsSidebarProps {
  row: Record<string, unknown> | null;
  columns: Column[];
  isOpen: boolean;
  onClose: () => void;
  formatCellValue: (value: unknown) => string;
}

export function RowDetailsSidebar({
  row,
  columns,
  isOpen,
  onClose,
  formatCellValue,
}: RowDetailsSidebarProps) {
  const [mounted, setMounted] = useState(false);

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
          "m-6 border rounded-lg fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className=" rounded-lg flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Row Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {row && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {columns.map((column) => (
                <div 
                  key={column.name}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {startCase(column.name)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {column.type}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-900">
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-words">
                      {formatCellValue(row[column.name])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(sidebarContent, document.body);
}
