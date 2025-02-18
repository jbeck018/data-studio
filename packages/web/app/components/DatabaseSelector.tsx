import { Form } from "react-router";
import type { DatabaseConnection } from "~/lib/db/schema";

interface DatabaseSelectorProps {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
}

export function DatabaseSelector({ connections, activeConnection }: DatabaseSelectorProps) {
  if (connections.length === 0) {
    return (
      <div className="flex items-center px-3 py-2 text-sm text-gray-500">
        No connections available
      </div>
    );
  }

  return (
    <Form method="post" className="flex items-center">
      <select
        name="connectionId"
        defaultValue={activeConnection?.id || ""}
        onChange={(e) => e.target.form?.submit()}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="" disabled>
          Select a connection
        </option>
        {connections.map((connection) => (
          <option key={connection.id} value={connection.id}>
            {connection.name}
          </option>
        ))}
      </select>
    </Form>
  );
}

