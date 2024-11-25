import { Link, useLocation } from "@remix-run/react";
import { useTheme } from "~/utils/theme";
import { TableCellsIcon as TableIcon, CircleStackIcon as DatabaseIcon,  SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Tables', href: '/', icon: TableIcon },
    { name: 'Run Query', href: '/query', icon: DatabaseIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Floating Sidebar */}
      <div className="fixed left-4 top-4 bottom-4 w-64">
        <div className="flex h-full flex-col rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Data Studio</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors`}
                  >
                    <item.icon
                      className={`${
                        isActive
                          ? 'text-gray-500 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 p-4">
            <button
              onClick={toggleTheme}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              ) : (
                <MoonIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 pl-72">
        <main className="h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
