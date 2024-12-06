import React, { useState } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { VisualizationManager } from '../components/DataVisualization';
import { SQLEditor } from '../components/SQLEditor';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import type { QueryResult } from '../types';

export default function Analytics() {
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetcher = useFetcher();

  const handleEditorChange = (value: string) => {
    setQuery(value);
    setError(null);
  };

  const executeQuery = () => {
    if (!query.trim() || isExecuting) return;

    setIsExecuting(true);
    setError(null);
    
    fetcher.submit(
      { query },
      { method: 'POST', action: '/api/query/execute' }
    );
  };

  const results = fetcher.data as QueryResult | undefined;

  return (
    <div className="container mx-auto p-4 h-full">
      <div className="flex flex-col h-full gap-4">
        <div className="flex-none">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <div className="h-[200px]">
            <SQLEditor
              value={query}
              onChange={handleEditorChange}
              onError={setError}
              onExecute={executeQuery}
              isExecuting={isExecuting}
              height="100%"
              placeholder="Enter a query to visualize data..."
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={isExecuting ? 'secondary' : 'default'}>
              {isExecuting ? 'Executing...' : 'Ready'}
            </Badge>
            {results && (
              <Badge variant="outline">
                {results.rowCount} rows in {results.executionTime}ms
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {error ? (
            <div className="p-4">
              <div className="text-sm font-medium text-destructive">Error executing query</div>
              <pre className="mt-2 p-2 bg-muted rounded text-sm whitespace-pre-wrap">
                {error}
              </pre>
            </div>
          ) : results?.rows ? (
            <VisualizationManager 
              queryResult={{
                columns: Object.keys(results.rows[0]).map(name => ({
                  name,
                  type: inferColumnType(results.rows, name)
                })),
                rows: results.rows
              }}
              queryId={query}
            />
          ) : null}
        </ScrollArea>
      </div>
    </div>
  );
}

function inferColumnType(rows: any[], columnName: string): string {
  const value = rows[0][columnName];
  if (value === null || value === undefined) {
    // Try to find first non-null value
    const nonNullRow = rows.find(row => row[columnName] != null);
    if (nonNullRow) {
      return inferTypeFromValue(nonNullRow[columnName]);
    }
    return 'string'; // default to string for null columns
  }
  return inferTypeFromValue(value);
}

function inferTypeFromValue(value: any): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'decimal';
  }
  if (value instanceof Date || !isNaN(Date.parse(value))) {
    return 'timestamp';
  }
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  return 'string';
}
