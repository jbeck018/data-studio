import { Form, Link, useLocation } from "@remix-run/react";
import { useTheme } from "../utils/theme";
import {
  TableCellsIcon as TableIcon,
  CircleStackIcon as DatabaseIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from "react";
import clsx from "clsx";

interface User {
  id: string;
  email: string;
  name: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

export default function Layout({ children, user }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Tables', href: '/', icon: TableIcon },
    { name: 'Databases', href: '/databases', icon: DatabaseIcon },
    { name: 'Run Query', href: '/query', icon: DatabaseIcon },
  ];

  const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
    { name: 'Organizations', href: '/organizations' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-light-bg-secondary dark:bg-dark-bg-primary">
      {/* Sidebar */}
      <div className="w-[297px] p-4">
        <div className="flex h-full flex-col rounded-2xl bg-light-bg-primary dark:bg-dark-bg-secondary shadow-lg">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img src="/assets/logo.svg" alt="Data Studio" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Data Studio</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      isActive
                        ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-tertiary',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        isActive
                          ? 'text-light-text-primary dark:text-dark-text-primary'
                          : 'text-light-text-secondary dark:text-dark-text-secondary group-hover:text-light-text-primary dark:group-hover:text-dark-text-primary',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-light-border dark:border-dark-border p-4 space-y-3 flex-col">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center w-full px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  <span className="flex-1 text-left">{user.name}</span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 right-0 mt-2 origin-top-right rounded-md bg-white dark:bg-dark-bg-tertiary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-dark-bg-secondary' : '',
                                'block px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary'
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      <Menu.Item>
                        {({ active }) => (
                          <Form action="/logout" method="post">
                            <button
                              type="submit"
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-dark-bg-secondary' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary'
                              )}
                            >
                              Sign out
                            </button>
                          </Form>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
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
