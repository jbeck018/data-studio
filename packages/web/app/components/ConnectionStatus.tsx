import { useEffect, useState } from "react";
import type { DatabaseConnection } from "~/lib/db/schema";

interface ConnectionStatusProps {
  connection: DatabaseConnection;
}

export function ConnectionStatus({ connection }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      if (!mounted || isChecking) return;
      
      setIsChecking(true);
      try {
        const response = await fetch(`/api/connections/${connection.id}/status`);
        const data = await response.json();
        if (mounted) {
          setStatus(data.status);
        }
      } catch (error) {
        if (mounted) {
          setStatus('error');
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [connection.id, isChecking]);

  const statusColors = {
    connected: 'bg-green-100 text-green-800',
    disconnected: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  };

  const statusText = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status]
      }`}
    >
      <span className={`h-2 w-2 rounded-full mr-1.5 ${
        status === 'connected' ? 'bg-green-400' :
        status === 'error' ? 'bg-red-400' : 'bg-gray-400'
      }`} />
      {statusText[status]}
    </span>
  );
}
