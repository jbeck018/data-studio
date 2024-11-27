import { Link, useLocation } from "@remix-run/react";
import { useTheme } from "~/utils/theme";
import { TableCellsIcon as TableIcon, CircleStackIcon as DatabaseIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Tables', href: '/', icon: TableIcon },
    { name: 'Databases', href: '/databases', icon: DatabaseIcon },
    { name: 'Run Query', href: '/query', icon: DatabaseIcon },
  ];

  return (
    <div className="flex h-screen bg-light-bg-secondary dark:bg-dark-bg-primary">
      {/* Sidebar */}
      <div className="w-[297px] p-4">
        <div className="flex h-full flex-col rounded-2xl bg-light-bg-primary dark:bg-dark-bg-secondary shadow-lg">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Data Studio</h1>
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
                        ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-tertiary'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors`}
                  >
                    <item.icon
                      className={`${
                        isActive
                          ? 'text-light-text-primary dark:text-dark-text-primary'
                          : 'text-light-text-secondary dark:text-dark-text-secondary group-hover:text-light-text-primary dark:group-hover:text-dark-text-primary'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-light-border dark:border-dark-border p-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 mr-2" />
              ) : (
                <MoonIcon className="h-5 w-5 mr-2" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 p-4">
        <main className="w-full h-full bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-lg overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
