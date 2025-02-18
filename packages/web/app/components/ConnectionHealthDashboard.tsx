import { useSubmit } from 'react-router';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export interface ConnectionHealth {
  connectionId: string;
  name: string;
  type: string;
  status: 'healthy' | 'unhealthy';
  activeConnections: number;
  totalQueries: number;
  averageQueryTime: number;
  errorCount: number;
  lastHealthCheck: string;
  usageStats: {
    lastHour: number;
    lastDay: number;
    lastWeek: number;
  };
}

interface ConnectionHealthDashboardProps {
  connections: ConnectionHealth[];
  onRefresh?: () => void;
}

export function ConnectionHealthDashboard({ connections, onRefresh }: ConnectionHealthDashboardProps) {
  const submit = useSubmit();
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const handleResetConnection = (connectionId: string) => {
    const formData = new FormData();
    formData.append('action', 'reset');
    formData.append('connectionId', connectionId);

    submit(formData, { method: 'post', action: '/api/connections/health' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Connection Health Dashboard</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
          </label>
          <Button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-current hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => (
          <div
            key={conn.connectionId}
            className={`bg-current overflow-hidden shadow rounded-lg cursor-pointer transition-shadow hover:shadow-md ${
              selectedConnection === conn.connectionId ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setSelectedConnection(conn.connectionId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedConnection(conn.connectionId);
              }
            }}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{conn.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{conn.type}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    conn.status === 'healthy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {conn.status}
                </span>
              </div>
              <div className="mt-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Active Connections</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {conn.activeConnections}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Queries</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {conn.totalQueries}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedConnection && (
        <div className="bg-current shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {connections
              .filter((conn) => conn.connectionId === selectedConnection)
              .map((conn) => (
                <div key={conn.connectionId} className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {conn.name} - Detailed Statistics
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Last health check: {new Date(conn.lastHealthCheck).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleResetConnection(conn.connectionId)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-current hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Reset Connection
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500">Average Query Time</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {conn.averageQueryTime.toFixed(2)}ms
                        </dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500">Error Count</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {conn.errorCount}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500">Active Connections</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {conn.activeConnections}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500">Total Queries</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {conn.totalQueries}
                        </dd>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Usage Statistics</h4>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500">Last Hour</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {conn.usageStats.lastHour}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500">Last 24 Hours</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {conn.usageStats.lastDay}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500">Last 7 Days</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {conn.usageStats.lastWeek}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
