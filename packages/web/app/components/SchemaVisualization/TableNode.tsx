import { Handle, Position } from '@reactflow/core';
import type { TableColumn } from '~/types/schema';
import { cn } from '~/utils/cn';

interface TableNodeProps {
  data: {
    label: string;
    columns: TableColumn[];
  };
  selected?: boolean;
}

export function TableNode({ data, selected }: TableNodeProps) {
  return (
    <div
      className={cn(
        'min-w-[200px] bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-md border',
        selected
          ? 'border-primary-500 dark:border-primary-400'
          : 'border-light-border dark:border-dark-border',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary-500" />
      <Handle type="source" position={Position.Right} className="!bg-primary-500" />

      <div className="px-4 py-2 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-t-lg">
        <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
          {data.label}
        </h3>
      </div>

      <div className="p-2">
        {data.columns.map((column) => (
          <div
            key={column.name}
            className="flex items-center px-2 py-1 text-sm rounded hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"
          >
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-light-text-primary dark:text-dark-text-primary">
                {column.name}
              </span>
              {column.isPrimaryKey && (
                <span className="text-xs px-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                  PK
                </span>
              )}
              {column.isForeignKey && (
                <span className="text-xs px-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded">
                  FK
                </span>
              )}
            </div>
            <span className="text-light-text-secondary dark:text-dark-text-secondary ml-2">
              {column.type}
            </span>
            {!column.nullable && (
              <span className="ml-1 text-light-text-tertiary dark:text-dark-text-tertiary">*</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
