import { Form, useSubmit } from 'react-router';
import { useState } from 'react';
import type { QueryRestriction } from '../lib/db/schema/permissions';
import { Button } from './ui/button';

interface User {
  id: string;
  email: string;
}

interface Permission {
  userId: string;
  isAdmin: boolean;
  canConnect: boolean;
  queryRestrictions?: QueryRestriction;
}

interface PermissionManagerProps {
  connectionId: string;
  users: User[];
  currentPermissions: Permission[];
}

export function PermissionManager({ connectionId, users, currentPermissions }: PermissionManagerProps) {
  const submit = useSubmit();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [canConnect, setCanConnect] = useState(true);
  const [restrictions, setRestrictions] = useState<QueryRestriction>({
    maxRowsPerQuery: 1000,
    allowedOperations: ['SELECT'],
    allowedSchemas: ['public'],
    maxConcurrentQueries: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('connectionId', connectionId);
    formData.append('userId', selectedUser);
    formData.append('isAdmin', isAdmin.toString());
    formData.append('canConnect', canConnect.toString());
    formData.append('queryRestrictions', JSON.stringify(restrictions));

    submit(formData, { method: 'post', action: '/api/permissions' });
  };

  return (
    <div className="space-y-6 p-4 bg-current rounded-lg shadow">
      <h2 className="text-2xl font-semibold">Manage Connection Permissions</h2>
      
      {/* Current Permissions Table */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Current Permissions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Can Connect
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restrictions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-current divide-y divide-gray-200">
              {currentPermissions.map((permission) => (
                <tr key={permission.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {users.find(u => u.id === permission.userId)?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {permission.isAdmin ? '✓' : '✗'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {permission.canConnect ? '✓' : '✗'}
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-xs">
                      {JSON.stringify(permission.queryRestrictions, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      onClick={() => {
                        setSelectedUser(permission.userId);
                        setIsAdmin(permission.isAdmin);
                        setCanConnect(permission.canConnect);
                        setRestrictions(permission.queryRestrictions || restrictions);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Permission Form */}
      <Form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <h3 className="text-lg font-medium">
          {selectedUser ? 'Edit Permission' : 'Add Permission'}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            User
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Admin</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={canConnect}
              onChange={(e) => setCanConnect(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Can Connect</span>
          </label>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Query Restrictions</h4>

          <div>
            <label className="block text-sm text-gray-700">
              Max Rows Per Query
              <input
                type="number"
                value={restrictions.maxRowsPerQuery || ''}
                onChange={(e) => setRestrictions({
                  ...restrictions,
                  maxRowsPerQuery: Number.parseInt(e.target.value) || undefined,
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Max Concurrent Queries
              <input
                type="number"
                value={restrictions.maxConcurrentQueries || ''}
                onChange={(e) => setRestrictions({
                  ...restrictions,
                  maxConcurrentQueries: Number.parseInt(e.target.value) || undefined,
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>
          </div>

          <div>
            <label htmlFor="allowedOperations" className="block text-sm text-gray-700">
              Allowed Operations
              <div className="mt-2 space-x-4">
                {['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'].map((op) => (
                  <label key={op} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={restrictions.allowedOperations?.includes(op) || false}
                      onChange={(e) => {
                        const ops = new Set(restrictions.allowedOperations || []);
                        if (e.target.checked) {
                          ops.add(op);
                        } else {
                          ops.delete(op);
                        }
                        setRestrictions({
                          ...restrictions,
                          allowedOperations: Array.from(ops),
                        });
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{op}</span>
                  </label>
                ))}
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Allowed Schemas (comma-separated)
              <input
                type="text"
                value={restrictions.allowedSchemas?.join(', ') || ''}
                onChange={(e) => setRestrictions({
                  ...restrictions,
                  allowedSchemas: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="public, app, shared"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Allowed Tables (comma-separated)
              <input
                type="text"
                value={restrictions.allowedTables?.join(', ') || ''}
                onChange={(e) => setRestrictions({
                  ...restrictions,
                  allowedTables: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="users, posts, comments"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Blocked Tables (comma-separated)
              <input
                type="text"
                value={restrictions.blockedTables?.join(', ') || ''}
                onChange={(e) => setRestrictions({
                  ...restrictions,
                  blockedTables: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="sensitive_data, user_secrets"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {selectedUser ? 'Update Permission' : 'Add Permission'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
