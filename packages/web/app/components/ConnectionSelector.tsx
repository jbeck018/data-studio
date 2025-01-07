import { useEffect, useState } from "react";
import { Form, useSubmit } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { DatabaseConnection } from "../lib/db/schema";
import { Badge } from "./ui/badge";

interface ConnectionSelectorProps {
  connections: DatabaseConnection[];
  activeConnectionId?: string | null;
  onConnectionChange: (connectionId: string) => void;
}

export function ConnectionSelector({ connections, activeConnectionId, onConnectionChange }: ConnectionSelectorProps) {
  const submit = useSubmit();
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch connection statuses
    const fetchStatuses = async () => {
      const statuses: Record<string, string> = {};
      for (const conn of connections) {
        try {
          const response = await fetch(`/api/connections/${conn.id}/status`);
          const data = await response.json();
          statuses[conn.id] = data.status;
        } catch (error) {
          statuses[conn.id] = "error";
        }
      }
      setConnectionStatuses(statuses);
    };

    fetchStatuses();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatuses, 30000);
    return () => clearInterval(interval);
  }, [connections]);

  const handleConnectionChange = (value: string) => {
    const formData = new FormData();
    formData.append("connectionId", value);
    submit(formData, { method: "post", action: "/connections/change" });
    onConnectionChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeConnectionId || undefined} onValueChange={handleConnectionChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select database" />
        </SelectTrigger>
        <SelectContent>
          {connections.map((conn) => (
            <SelectItem key={conn.id} value={conn.id} className="flex items-center justify-between">
              <span>{conn.name}</span>
              <Badge 
                variant={
                  connectionStatuses[conn.id] === "connected" ? "default" :
                  connectionStatuses[conn.id] === "disconnected" ? "secondary" :
                  "destructive"
                }
                className="ml-2"
              >
                {connectionStatuses[conn.id] || "unknown"}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
