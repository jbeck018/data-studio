import { Outlet, useLoaderData } from "react-router";
import type { UserWithOrganization } from "~/lib/db/schema";
import type { DatabaseConnection } from "~/lib/db/schema";
import { ConnectionSelector } from "./ConnectionSelector";
import { ConnectionStatus } from "./ConnectionStatus";

interface LoaderData {
  user: UserWithOrganization;
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
}

export function AuthenticatedLayout() {
  const { user, connections, activeConnection } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/assets/logo.svg"
                  alt="Logo"
                />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <ConnectionSelector
                  connections={connections as unknown as DatabaseConnection[]}
                  activeConnectionId={activeConnection?.id}
                  onConnectionChange={() => {}}
                />
              </div>
            </div>
            <div className="flex items-center">
              {activeConnection && (
                <ConnectionStatus connection={activeConnection as unknown as DatabaseConnection} />
              )}
              <div className="ml-3 relative">
                <div>
                  <span className="text-gray-700">{user.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

