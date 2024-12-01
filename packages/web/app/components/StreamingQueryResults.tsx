import { useEffect, useRef, useState } from 'react';
import { useStreamingQuery } from '~/hooks/useStreamingQuery';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { EmptyState } from './EmptyState';
import { cn } from '~/utils/cn';
import { VisualizationManager } from './DataVisualization';

interface StreamingQueryResultsProps {
  sql: string;
  connectionId: string;
  onComplete?: () => void;
  className?: string;
}

export function StreamingQueryResults({
  sql,
  connectionId,
  onComplete,
  className,
}: StreamingQueryResultsProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const {
    status,
    fields,
    rows,
    progress,
    totalRows,
    error,
    isConnected,
    executeQuery,
    cancelQuery,
  } = useStreamingQuery({
    onComplete,
    debug: process.env.NODE_ENV === 'development',
  });

  useEffect(() => {
    if (sql && connectionId && isConnected) {
      executeQuery(sql, {
        batchSize: 100,
        maxRows: 1000,
        includeProgress: true,
      });

      return () => {
        cancelQuery();
      };
    }
  }, [sql, connectionId, isConnected, executeQuery, cancelQuery]);

  const renderStatus = () => {
    if (error) {
      return (
        <Alert
          type="error"
          title="Query Error"
          message={error}
          className="mb-4"
        />
      );
    }

    if (status === 'streaming' && progress < 100) {
      return (
        <div className="flex items-center space-x-2 mb-4 text-light-text-secondary dark:text-dark-text-secondary">
          <LoadingSpinner size="sm" />
          <span>
            {progress > 0 
              ? `Loading results (${Math.round(progress)}%${totalRows ? ` - ${rows.length} of ${totalRows} rows` : ''})` 
              : 'Starting query...'}
          </span>
        </div>
      );
    }

    return null;
  };

  if (!fields || !rows.length) {
    if (status === 'started' || status === 'streaming') {
      return (
        <div className={cn("flex flex-col items-center justify-center p-8", className)}>
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
            Executing query...
          </p>
        </div>
      );
    }

    return (
      <div className={className}>
        {renderStatus()}
        <EmptyState
          type="query"
          title="No Results"
          message={error ? "An error occurred while executing the query." : "Your query returned no results."}
        />
      </div>
    );
  }

  const queryResult = {
    columns: fields.map(field => ({
      name: field.name,
      type: field.dataType,
    })),
    rows,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {renderStatus()}
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </div>
        <button
          onClick={() => setShowVisualization(!showVisualization)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary rounded-md transition-colors"
        >
          {showVisualization ? 'Show Table' : 'Show Visualization'}
        </button>
      </div>

      {showVisualization ? (
        <div className="rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary p-4">
          <VisualizationManager queryResult={queryResult} />
        </div>
      ) : (
        <div
          ref={tableRef}
          className="overflow-x-auto rounded-lg border border-light-border dark:border-dark-border"
        >
          <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="bg-light-bg-secondary dark:bg-dark-bg-secondary">
              <tr>
                {fields.map((field, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider whitespace-nowrap"
                  >
                    {field.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-light-bg-primary dark:bg-dark-bg-primary divide-y divide-light-border dark:divide-dark-border">
              {rows.map((row, i) => (
                <tr key={i}>
                  {fields.map((field, j) => (
                    <td
                      key={j}
                      className="px-6 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary"
                    >
                      {row[field.name]?.toString() ?? 'NULL'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
