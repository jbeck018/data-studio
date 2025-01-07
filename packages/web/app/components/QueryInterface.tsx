import { useState } from 'react';
import { Form } from 'react-router';
import { Button } from './ui/button';
import { Alert } from './ui/alert';
import { QueryEditor } from './QueryEditor';
import { QueryResults } from './QueryResults';
import type { QueryResult } from '../types';

interface QueryInterfaceProps {
  onExecute: (sql: string) => Promise<void>;
  isExecuting: boolean;
  error: string | null;
  result: QueryResult | null;
  connections: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  activeConnectionId: string | null;
}

export function QueryInterface({
  onExecute,
  isExecuting,
  error,
  result,
  connections,
  activeConnectionId,
}: QueryInterfaceProps) {
  const [sql, setSql] = useState('');

  const handleExecute = async () => {
    if (!sql.trim()) return;
    await onExecute(sql);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b">
        <Form method="post" className="flex gap-4 items-center">
          <div className="flex-1">
            <QueryEditor
              value={sql}
              onChange={setSql}
              onExecute={handleExecute}
              disabled={isExecuting}
            />
          </div>
          <Button
            type="button"
            onClick={handleExecute}
            disabled={isExecuting || !sql.trim()}
          >
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
        </Form>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error && (
          <Alert variant='destructive' className="mb-4">
            {error}
          </Alert>
        )}

        {result && <QueryResults result={result} />}
      </div>
    </div>
  );
}
