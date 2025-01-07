import { Column } from "~/types/schema";

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
      className={`fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Row Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close panel"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <dl className="space-y-4">
            {columns.map(column => (
              <div 
                key={column.name} 
                className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <dt className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {column.name}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {column.type}
                  </span>
                </dt>
                <dd className="mt-2">
                  <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
                    {formatCellValue(row[column.name])}
                  </div>
                  {column.nullable && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Nullable
                    </div>
                  )}
                  {column.defaultValue !== undefined && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
