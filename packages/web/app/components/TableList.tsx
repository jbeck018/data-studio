import { Link } from "@remix-run/react";
import type { TableSchema } from "~/types";
import { startCase, capitalize } from "lodash-es";

interface TableListProps {
  tables: TableSchema[];
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

export function TableList({ tables }: TableListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => (
        <Link
          key={table.name}
          to={`/${table.name}`}
          className="group block w-full p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate max-w-[80%]">
              {prettyPrintName(table.name)}
            </h5>
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-bold">{table.columns.length}</span>{' '}
                <span className="italic text-gray-500 dark:text-gray-400">columns</span>
              </p>
              <div className="mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-bold">{formatNumber(table.rowCount)}</span>{' '}
                <span className="italic text-gray-500 dark:text-gray-400">rows</span>
              </p>
              <div className="mx-3 h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-bold">{formatBytes(table.sizeInBytes)}</span>{' '}
                <span className="italic text-gray-500 dark:text-gray-400">size</span>
              </p>
            </div>
            {Array.isArray(table.primaryKey) && table.primaryKey.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                <span className="font-normal text-gray-500 dark:text-gray-400">Primary Key:</span>{' '}
                <span className="font-mono text-purple-600 dark:text-purple-400">
                  {table.primaryKey.map(prettyPrintName).join(", ")}
                </span>
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
            <span>View table</span>
            <svg className="flex-shrink-0 w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
