import { useState } from "react";
import type { QueryResult } from "~/types";
import { PageContainer } from "~/components/PageContainer";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import { requireUser } from "~/lib/auth/session.server";
import { db } from "~/lib/db/db.server";
import { databaseConnections } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { connectionManager } from "~/lib/db/connection-manager.server";
import { DatabaseSchemaViewer } from "~/components/DatabaseSchemaViewer";
import { QueryInterface } from "~/components/QueryInterface";
import { StreamingQueryResults } from "~/components/StreamingQueryResults";
import { ConnectionSelector } from "~/components/ConnectionSelector";

export interface DatabaseTableSchema {
  name: string;
  schema: string;
  type: "table";
}

interface ActionData {
  result?: QueryResult;
  error?: string;
}

interface LoaderData {
  schemas: Record<string, DatabaseTableSchema[]>;
  connections: typeof databaseConnections.$inferSelect[];
  activeConnectionId: string | null;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const connections = await db.query.databaseConnections.findMany({
    where: eq(databaseConnections.organizationId, user?.currentOrganization?.id || ''),
  });

  const activeConnectionId = connections[0]?.id || null;
  let schemas: Record<string, DatabaseTableSchema[]> = {};
  let error: string | undefined;

  if (activeConnectionId) {
    try {
      const connection = await connectionManager.getConnection(activeConnectionId);
      if (connection) {
        const result = await connection.query("SELECT * FROM information_schema.tables");
        schemas = result.rows.reduce((acc: Record<string, DatabaseTableSchema[]>, row: any) => {
          if (!acc[row.table_schema]) {
            acc[row.table_schema] = [];
          }
          acc[row.table_schema].push({
            name: row.table_name,
            schema: row.table_schema,
            type: "table",
          });
          return acc;
        }, {});
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to fetch schema";
    }
  }

  return { schemas, connections, activeConnectionId, error };
}

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const connectionId = formData.get("connectionId") as string;

  if (!query) {
    return { error: "Query is required" };
  }

  if (!connectionId) {
    return { error: "Connection ID is required" };
  }

  try {
    const connection = await connectionManager.getConnection(connectionId);
    if (!connection) {
      return { error: "Connection not found" };
    }

    const result = await connection.query(query);
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to execute query" };
  }
}

export default function Query() {
  const { schemas, connections, activeConnectionId, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [isExecuting, setIsExecuting] = useState(false);
  const submit = useSubmit();

  const activeConnection = connections.find((c) => c.id === activeConnectionId);
  const activeSchema = schemas[activeConnection?.database || ""] || [];

  const handleExecuteQuery = async (query: string) => {
    setIsExecuting(true);
    try {
      submit(
        { query, connectionId: activeConnectionId! },
        { method: "post" }
      );
    } finally {
      setIsExecuting(false);
    }
  };

  if (error) {
    return (
      <PageContainer>
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (!activeConnection) {
    return (
      <PageContainer>
        <Alert className="mb-4" variant="default">
          <AlertDescription>Please select a database connection to start querying</AlertDescription>
        </Alert>
        <ConnectionSelector 
          connections={connections as any}
          activeConnectionId={activeConnectionId}
          onConnectionChange={(id: string) => submit({ connectionId: id }, { method: "get" })}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <div>
          <DatabaseSchemaViewer schemas={activeSchema as any} />
        </div>
        <div className="space-y-4">
          <QueryInterface
            isExecuting={isExecuting}
            onExecute={handleExecuteQuery}
            error={actionData?.error || null}
            result={actionData?.result || null}
            connections={connections}
            activeConnectionId={activeConnectionId}
          />
          {isExecuting && <LoadingSpinner />}
          {actionData?.error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}
            {actionData?.result && <StreamingQueryResults result={actionData.result} />}
        </div>
      </div>
    </PageContainer>
  );
}
