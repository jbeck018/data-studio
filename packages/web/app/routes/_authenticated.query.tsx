import { useState } from "react";
import type { QueryResult } from "~/types";
import { PageContainer } from "~/components/PageContainer";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { requireUser } from "~/lib/auth/session.server";
import { db } from "~/lib/db/db.server";
import { databaseConnections } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { connectionManager } from "~/lib/db/connection-manager.server";
import { DatabaseSelector } from "~/components/DatabaseSelector";
import { DatabaseSchemaViewer } from "~/components/DatabaseSchemaViewer";
import { QueryInterface } from "~/components/QueryInterface";
import { StreamingQueryResults } from "~/components/StreamingQueryResults";

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
    where: eq(databaseConnections.organizationId, user.organization.id),
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

  return json<LoaderData>({ schemas, connections, activeConnectionId, error });
}

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const connectionId = formData.get("connectionId") as string;

  if (!query) {
    return json<ActionData>({ error: "Query is required" });
  }

  if (!connectionId) {
    return json<ActionData>({ error: "Connection ID is required" });
  }

  try {
    const connection = await connectionManager.getConnection(connectionId);
    if (!connection) {
      return json<ActionData>({ error: "Connection not found" });
    }

    const result = await connection.query(query);
    return json<ActionData>({ result });
  } catch (err) {
    return json<ActionData>({ error: err instanceof Error ? err.message : "Failed to execute query" });
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
        <DatabaseSelector 
          connections={connections}
          selectedDatabases={[activeConnectionId!].filter(Boolean)}
          onDatabaseSelect={(id) => submit({ connectionId: id }, { method: "get" })}
          onDatabaseDeselect={() => {}}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <div>
          <DatabaseSchemaViewer schemas={activeSchema} />
        </div>
        <div className="space-y-4">
          <QueryInterface
            isExecuting={isExecuting}
            onExecute={handleExecuteQuery}
            error={actionData?.error}
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
