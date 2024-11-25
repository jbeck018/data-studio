import { useState } from "react";
import { executeQuery } from "~/utils/api";
import { format } from "sql-formatter";
import type { QueryResult } from "~/types";
import { PageContainer } from "~/components/PageContainer";

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExecuteQuery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await executeQuery(query);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormat = () => {
    try {
      const formatted = format(query, { language: 'postgresql' });
      setQuery(formatted);
    } catch (err) {
      setError('Error formatting query');
    }
  };

  return (
    <PageContainer>
      <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SQL Query</h1>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SQL Query
              </label>
              <button
                onClick={handleFormat}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Format Query
              </button>
            </div>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
              placeholder="Enter your SQL query here..."
            />
          </div>

          <div>
            <button
              onClick={handleExecuteQuery}
              disabled={isLoading || !query.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {results && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {results.fields?.map((field) => (
                        <th
                          key={field.name}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {results.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                          >
                            {value === null ? 'NULL' : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
