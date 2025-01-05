import { useEffect, useState } from "react";
import type { QueryResult } from "~/types";
import { DataGrid, type Column } from "./DataGrid";

interface StreamingQueryResultsProps {
  queryId: string;
  onError?: (error: string) => void;
}

export function StreamingQueryResults({ queryId, onError }: StreamingQueryResultsProps) {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queryId) return;

    const eventSource = new EventSource(`/api/query/${queryId}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResult(data);
    };

    eventSource.onerror = () => {
      const errorMessage = "Error streaming query results";
      setError(errorMessage);
      if (onError) onError(errorMessage);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [queryId, onError]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!result) {
    return <div>Loading...</div>;
  }

  const rows = result.rows;
  const columns = result.fields.map((field) => ({
    field: field.name,
    headerName: field.name,
    flex: 1,
  }));

  return (
    <div className="h-full w-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm">
          <div className="p-4 border-b">
            <div className="text-sm text-gray-500">
              {result.rowCount.toLocaleString()} rows in set ({result.metrics.executionTimeMs.toFixed(2)}ms)
            </div>
          </div>
          <DataGrid
            rows={rows}
            columns={columns as unknown as Column[]}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      </div>
    </div>
  );
}
