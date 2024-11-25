import { useState } from 'react';
import { Layout } from '~/components/Layout';
import { useMutation } from '@tanstack/react-query';
import { json, type MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: "SQL Query - Data Studio" },
    { name: "description", content: "Execute SQL queries" },
  ];
};

async function executeQuery(query: string) {
  const response = await fetch('http://localhost:3001/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to execute query');
  }
  
  return response.json();
}

export default function Query() {
  const [query, setQuery] = useState('');
  
  const { mutate, data, isLoading, error } = useMutation({
    mutationFn: executeQuery,
  });

  const handleExecute = () => {
    if (query.trim()) {
      mutate(query);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">
            SQL Query
          </label>
          <div className="mt-1">
            <textarea
              id="query"
              name="query"
              rows={4}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM your_table"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleExecute}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {isLoading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'Failed to execute query'}
                </div>
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {data.fields?.map((field: { name: string }) => (
                    <th
                      key={field.name}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.rows?.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value: any, colIndex: number) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value?.toString() ?? 'null'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {data.rowCount} rows returned
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
