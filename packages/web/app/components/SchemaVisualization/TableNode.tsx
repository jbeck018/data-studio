import { Handle, NodeProps, Position } from '@xyflow/react';
import { TableNodeData } from '../../types/schema';
import { cn } from '../../utils/cn';

export default function TableNode({ data, selected }: NodeProps<TableNodeData>) {
  if (!data?.name || !data?.columns) return null;

  return (
    <div
      className={cn(
        'bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-md border border-light-border dark:border-dark-border min-w-[200px]',
        selected && 'ring-2 ring-primary-500'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary-500" />

      {/* Table Header */}
      <div className="p-3 border-b border-light-border dark:border-dark-border">
        <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
          {data.name}
        </h3>
        {data.comment && (
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {data.comment}
          </p>
        )}
      </div>

      {/* Columns */}
      <div className="p-2">
        {data.columns.map((column) => (
          <div
            key={column.name}
            className="flex items-center py-1 text-sm"
          >
            <div className="flex-1">
              <div className="flex items-center">
                {column.isPrimaryKey && (
                  <span className="mr-1 text-xs text-primary-500">🔑</span>
                )}
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  {column.name}
                </span>
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {column.type}
                {column.isNullable && ' (nullable)'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
