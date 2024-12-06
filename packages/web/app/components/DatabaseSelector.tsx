import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { DatabaseConnection } from "../lib/connections/config.server";
import { Badge } from "./ui/badge";

interface DatabaseSelectorProps {
  connections: DatabaseConnection[];
  selectedDatabases: string[];
  onDatabaseSelect: (connectionId: string) => void;
  onDatabaseDeselect: (connectionId: string) => void;
}

export function DatabaseSelector({
  connections,
  selectedDatabases,
  onDatabaseSelect,
  onDatabaseDeselect,
}: DatabaseSelectorProps) {
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});

  const handleConnectionToggle = (connectionId: string) => {
    if (selectedDatabases.includes(connectionId)) {
      onDatabaseDeselect(connectionId);
    } else {
      onDatabaseSelect(connectionId);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Databases</label>
      <div className="flex flex-wrap gap-2">
        {connections.map((conn) => (
          <button
            key={conn.id}
            onClick={() => handleConnectionToggle(conn.id)}
            className={`
              inline-flex items-center px-3 py-1 rounded-md text-sm
              ${
                selectedDatabases.includes(conn.id)
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }
              hover:opacity-80 transition-opacity
            `}
          >
            {conn.name}
            <Badge
              variant={selectedDatabases.includes(conn.id) ? "default" : "secondary"}
              className="ml-2"
            >
              {selectedDatabases.includes(conn.id) ? "Selected" : "Click to select"}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
