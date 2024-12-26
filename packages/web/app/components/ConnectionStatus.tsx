import { useEffect, useState } from 'react';
import { DatabaseConnection } from '../lib/db/schema';

interface ConnectionStatusProps {
  connection: DatabaseConnection | null;
}

export function ConnectionStatus({ connection }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    if (!connection) {
      setStatus('disconnected');
      return;
    }

    // Ping the connection every 30 seconds
    const checkConnection = async () => {
      try {
        const response = await fetch(`/api/connections/${connection.id}/status`);
        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
      setLastChecked(new Date());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [connection]);

  if (!connection) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`h-2 w-2 rounded-full ${
          status === 'connected'
            ? 'bg-green-500'
            : status === 'error'
            ? 'bg-red-500'
            : 'bg-gray-500'
        }`}
      />
      <span className="text-sm text-gray-500">
        {status === 'connected'
          ? 'Connected'
          : status === 'error'
          ? 'Connection Error'
          : 'Disconnected'}
      </span>
    </div>
  );
}
