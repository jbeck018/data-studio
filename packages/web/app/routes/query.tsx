import { useState } from "react";
import { format } from "sql-formatter";
import type { QueryResult, TableSchema } from "../types";
import { PageContainer } from "../components/PageContainer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import { json, type ActionFunctionArgs, type SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { QueryEngine } from "../lib/db/query-engine.server";
import { requireUser } from "../lib/auth/session.server";
import { SQLEditor } from "../components/SQLEditor";
import { fetchSchema } from "../utils/api.server";
import { StreamingQueryResults } from "../components/StreamingQueryResults";

interface ActionData {
  result?: QueryResult;
  error?: string;
}

interface LoaderData {
  schema: SerializeFrom<TableSchema>[];
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
    const queryEngine = new QueryEngine({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5555'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });
    const result = await queryEngine.executeQuery(query, {
      userId: user.id,
      connectionId,
      organizationId: user.currentOrganization?.id,
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
  const [isExecuting, setIsExecuting] = useState(false);
  const { schema } = useLoaderData<LoaderData>();

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

  const handleQueryComplete = () => {
    setIsExecuting(false);
  };

  const handleExecuteQuery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setIsExecuting(true);
    // Create a new QueryEngine instance with the connection config
    const queryEngine = new QueryEngine({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5555'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });
    try {
      const result = await queryEngine.executeQuery(query, {
        userId: 'user-id', // Replace with actual user ID
        connectionId: schema[0]['connectionId' as keyof TableSchema] as string,
        organizationId: 'organization-id', // Replace with actual organization ID
      });
      // Handle query result
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      setIsExecuting(false);
    }
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
    return null;
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
            <form onSubmit={handleExecuteQuery}>
              <div className="space-y-4">
                <SQLEditor
                  value={query}
                  onChange={setQuery}
                  onError={handleSyntaxError}
                  schema={schema}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!query.trim() || isExecuting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? 'Executing...' : 'Execute Query'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {renderError()}

          {isExecuting && schema.length > 0 && (
            <StreamingQueryResults
              sql={query}
              connectionId={schema[0]['connectionId' as keyof TableSchema] as string}
              onComplete={handleQueryComplete}
            />
          )}
          {isExecuting && schema.length === 0 && (
            <Alert
              type="error"
              title="No Connection"
              message="Please select a database connection before executing queries."
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
