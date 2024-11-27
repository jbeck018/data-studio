import { useState } from "react";
import { format } from "sql-formatter";
import type { QueryResult } from "~/types";
import { PageContainer } from "~/components/PageContainer";
import { EmptyState } from "~/components/EmptyState";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, Form, useNavigation } from "@remix-run/react";

interface ActionData {
  result?: QueryResult;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const query = formData.get("query") as string;

  if (!query?.trim()) {
    return json<ActionData>({ error: "Query is required" });
  }

  try {
    const { executeQuery } = await import("~/utils/api.server");
    const result = await executeQuery(query);
    return json<ActionData>({ result });
  } catch (error) {
    return json<ActionData>({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    });
  }
}

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isExecuting = navigation.state === "submitting";

  const handleFormat = () => {
    try {
      const formatted = format(query, { language: 'postgresql' });
      setQuery(formatted);
    } catch (err) {
      console.error('Error formatting query:', err);
    }
  };

  const renderResults = () => {
    if (actionData?.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{actionData.error}</p>
        </div>
      );
    }

    if (!actionData?.result) {
      return (
        <EmptyState
          type="query"
          title="No Query Results"
          message="Write and execute a SQL query to see the results here."
        />
      );
    }

    if (actionData.result.rows.length === 0) {
      return (
        <EmptyState
          type="query"
          title="No Results Found"
          message="Your query executed successfully but returned no results."
        />
      );
    }

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="bg-light-bg-secondary dark:bg-dark-bg-tertiary">
              <tr>
                {actionData.result.fields?.map((field) => (
                  <th
                    key={field.name}
                    className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider"
                  >
                    {field.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-light-bg-primary dark:bg-dark-bg-secondary divide-y divide-light-border dark:divide-dark-border">
              {actionData.result.rows?.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-light-bg-secondary dark:hover:bg-dark-bg-tertiary">
                  {Object.values(row).map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary"
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
    );
  };

  return (
    <PageContainer>
      <div className="flex-none px-4 py-3">
        <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">SQL Query</h1>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="query" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                SQL Query
              </label>
              <button
                onClick={handleFormat}
                type="button"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Format Query
              </button>
            </div>
            <Form method="post">
              <textarea
                id="query"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                placeholder="Enter your SQL query here..."
              />
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isExecuting || !query.trim()}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? 'Executing...' : 'Execute Query'}
                </button>
              </div>
            </Form>
          </div>

          {renderResults()}
        </div>
      </div>
    </PageContainer>
  );
}
