import { useState } from "react";
import type { QueryResult, TableSchema } from "../types";
import { PageContainer } from "../components/PageContainer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { fetchDatabaseSchema, executeQuery } from "../utils/database.server";
import { StreamingQueryResults } from "../components/StreamingQueryResults";
import { DatabaseSelector } from "../components/DatabaseSelector";
import { DatabaseSchemaViewer } from "../components/DatabaseSchemaViewer";
import type { DatabaseConnection } from "../lib/db/schema/connections";
import { listConnections } from "../lib/connections/config.server";
import { QueryInterface } from "../components/QueryInterface";
import { connectionManager } from "app/lib/db/connection-manager.server";

interface ActionData {
  result?: QueryResult;
  error?: string;
}

interface LoaderData {
  schemas: Record<string, TableSchema[]>;
  connections: DatabaseConnection[];
  activeConnectionId: string | null;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  if (!user.currentOrganization) {
    throw new Response("No organization selected", { status: 400 });
  }

  try {
    // Get all connections for the organization
    const connections = await listConnections(user.currentOrganization.id);

    if (!connections.length) {
      return json<LoaderData>({
        schemas: {},
        connections: [],
        activeConnectionId: null,
        error: "No database connections found for this organization",
      });
    }

    // Get active connection
    const activeConnectionId = await connectionManager.getActiveConnection(user.currentOrganization.id);

    // Get schemas for each connection
    const schemas: Record<string, TableSchema[]> = {};
    for (const connection of connections) {
      try {
        const schema = await fetchDatabaseSchema(connection.id, user.currentOrganization.id);
        schemas[connection.id] = schema;
      } catch (error) {
        console.error(`Failed to fetch schema for connection ${connection.id}:`, error);
        schemas[connection.id] = [];
      }
    }

    return json<LoaderData>({
      schemas,
      connections,
      activeConnectionId: activeConnectionId || connections[0].id, // Default to first connection if none active
    });
  } catch (error) {
    console.error("Error in query loader:", error);
    throw new Response(
      error instanceof Error ? error.message : "An unknown error occurred",
      { status: 500 }
    );
  }
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const sql = formData.get("sql");
  const connectionId = formData.get("connectionId");

  if (!sql || typeof sql !== "string") {
    return json<ActionData>(
      { error: "SQL query is required" },
      { status: 400 }
    );
  }

  if (!connectionId || typeof connectionId !== "string") {
    return json<ActionData>(
      { error: "Connection ID is required" },
      { status: 400 }
    );
  }

  const user = await requireUser(request);
  
  if (!user.currentOrganization) {
    return json<ActionData>(
      { error: "No organization selected" },
      { status: 400 }
    );
  }

  try {
    const connection = await connectionManager.getConnection(connectionId, user.currentOrganization.id);
    const result = await executeQuery(sql, connection);
    return json<ActionData>({ result });
  } catch (error) {
    console.error("Failed to execute query:", error);
    return json<ActionData>(
      { error: error instanceof Error ? error.message : "Failed to execute query" },
      { status: 500 }
    );
  }
}

export default function Query() {
  const { schemas, connections, activeConnectionId, error: loaderError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(loaderError || null);

  const activeConnection = connections.find(c => c.id === activeConnectionId);
  const activeSchema = activeConnectionId ? schemas[activeConnectionId] : [];

  if (error) {
    return (
      <PageContainer>
        <Alert variant="error" message={error} />
      </PageContainer>
    );
  }

  if (!activeConnection) {
    return (
      <PageContainer>
        <Alert variant="warning" message="No active database connection. Please select or create a connection." />
        <DatabaseSelector connections={connections} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <DatabaseSelector 
          connections={connections} 
          activeConnectionId={activeConnectionId} 
        />
        
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <DatabaseSchemaViewer schema={activeSchema} />
          </div>
          
          <div className="col-span-9">
            <QueryInterface
              isExecuting={isExecuting}
              onExecute={async (sql) => {
                setIsExecuting(true);
                setError(null);
                try {
                  const response = await fetch("/query", {
                    method: "POST",
                    body: new URLSearchParams({
                      sql,
                      connectionId: activeConnectionId,
                    }),
                  });
                  const data = await response.json();
                  if (data.error) {
                    setError(data.error);
                  } else {
                    setQueryResult(data.result);
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to execute query");
                } finally {
                  setIsExecuting(false);
                }
              }}
            />
            
            {isExecuting ? (
              <LoadingSpinner />
            ) : actionData?.error ? (
              <Alert variant="error" message={actionData.error} />
            ) : queryResult ? (
              <StreamingQueryResults result={queryResult} />
            ) : null}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
