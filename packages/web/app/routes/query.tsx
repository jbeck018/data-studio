import { useState } from "react";
import { format } from "sql-formatter";
import type { QueryResult, TableSchema } from "~/types";
import { PageContainer } from "~/components/PageContainer";
import { EmptyState } from "~/components/EmptyState";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert } from "~/components/Alert";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, Form, useNavigation, useLoaderData } from "@remix-run/react";
import { QueryEngine } from "~/lib/db/query-engine.server";
import { requireUser } from "~/lib/auth/session.server";
import { SQLEditor } from "~/components/SQLEditor";
import { fetchSchema } from "~/utils/api.server";

interface ActionData {
  result?: QueryResult;
  error?: string;
}

interface LoaderData {
  schema: TableSchema[];
}

export async function loader() {
  const schema = await fetchSchema();
  return json<LoaderData>({ schema });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const connectionId = formData.get("connectionId") as string;

  if (!query?.trim()) {
    return json<ActionData>({ error: "Query is required" });
  }

  if (!connectionId) {
    return json<ActionData>({ error: "Database connection is required" });
  }

  try {
    const user = await requireUser(request);
    const queryEngine = QueryEngine.getInstance();
    const result = await queryEngine.executeQuery(query, {
      connectionId,
      userId: user.id,
    });
    return json<ActionData>({ result });
  } catch (error) {
    return json<ActionData>({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    });
  }
}

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const actionData = useActionData<ActionData>();
  const { schema } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const isExecuting = navigation.state === "submitting";

  const handleFormat = async () => {
    if (!query.trim()) return;
    
    setIsFormatting(true);
    try {
      const formatted = format(query, { language: 'postgresql' });
      setQuery(formatted);
    } catch (err) {
      console.error('Error formatting query:', err);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleSyntaxError = (error: string | null) => {
    setSyntaxError(error);
  };

  const renderError = () => {
    if (syntaxError) {
      return (
        <Alert
          type="warning"
          title="SQL Syntax Warning"
          message={syntaxError}
          className="mb-4"
        />
      );
    }

    if (actionData?.error) {
      return (
        <Alert
          type="error"
          title="Query Error"
          message={actionData.error}
          className="mb-4"
        />
      );
    }

    return null;
  };

  const renderResults = () => {
    if (isExecuting) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Executing query...
          </p>
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
        <Alert
          type="info"
          title="Query Executed Successfully"
          message="Your query returned no results."
          className="mb-4"
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
                disabled={isFormatting || !query.trim()}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isFormatting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Formatting...</span>
                  </>
                ) : (
                  <span>Format Query</span>
                )}
              </button>
            </div>
            <Form method="post">
              <input type="hidden" name="query" value={query} />
              {renderError()}
              <SQLEditor
                value={query}
                onChange={setQuery}
                onError={handleSyntaxError}
                className="mb-4"
                schema={schema}
              />
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isExecuting || !query.trim()}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isExecuting ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <span>Execute Query</span>
                  )}
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
