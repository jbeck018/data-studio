import React, { useState, useCallback } from 'react';
import { useFetcher } from '@remix-run/react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { SQLEditor } from './SQLEditor';
import type { QueryResult, QueryError, TableSchema } from '../types';

interface QueryResult {
  rows: any[];
  fields: any[];
  rowCount: number;
  executionTime: number;
  columns: any[];
  explain?: string;
  metrics: {
    executionTime: number;
    rowCount: number;
  };
}

interface QueryInterfaceProps {
  connectionId: string;
  defaultQuery: string;
  schema?: TableSchema[];
  selectedTables?: Set<string>;
  databaseAliases?: { alias: string; connectionId: string }[];
  onExecute?: () => void;
  isExecuting?: boolean;
  result?: QueryResult;
}

export function QueryInterface({ 
  connectionId, 
  defaultQuery = '',
  schema,
  selectedTables,
  databaseAliases,
  onExecute,
  isExecuting,
  result
}: QueryInterfaceProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [isExecutingState, setIsExecuting] = useState(isExecuting || false);
  const [error, setError] = useState<string | null>(null);
  const fetcher = useFetcher();

  const handleEditorChange = useCallback((value: string) => {
    setQuery(value);
    setError(null);
  }, []);

  const executeQuery = useCallback(() => {
    if (!query.trim() || isExecutingState) return;

    setIsExecuting(true);
    setError(null);
    
    fetcher.submit(
      { query, connectionId },
      { method: 'POST', action: '/api/query/execute' }
    );
  }, [query, connectionId, isExecutingState, fetcher]);

  const results = fetcher.data as QueryResult | undefined;
  const queryError = fetcher.data as QueryError | undefined;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 min-h-[300px]">
        <SQLEditor
          value={query}
          onChange={handleEditorChange}
          onError={setError}
          schema={schema}
          selectedTables={selectedTables}
          databaseAliases={databaseAliases}
          onExecute={executeQuery}
          isExecuting={isExecutingState}
          height="100%"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isExecutingState ? 'secondary' : 'default'}>
            {isExecutingState ? 'Executing...' : 'Ready'}
          </Badge>
          {results && (
            <Badge variant="outline">
              {results.rowCount} rows in {results.executionTime}ms
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-md">
        {error || queryError ? (
          <div className="p-4">
            <div className="text-sm font-medium text-destructive">Error executing query</div>
            <pre className="mt-2 p-2 bg-muted rounded text-sm whitespace-pre-wrap">
              {error || queryError?.message}
            </pre>
          </div>
        ) : results ? (
          <div className="p-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="results">
                <AccordionTrigger>Query Results</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {results.columns.map((column) => (
                            <th key={column} className="p-2 text-left font-medium">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((row, i) => (
                          <tr key={i} className="border-b">
                            {results.columns.map((column) => (
                              <td key={column} className="p-2">
                                {formatValue(row[column])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {results.explain && (
                <AccordionItem value="explain">
                  <AccordionTrigger>Query Plan</AccordionTrigger>
                  <AccordionContent>
                    <pre className="p-2 bg-muted rounded text-sm whitespace-pre-wrap">
                      {results.explain}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null) return 'NULL';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
