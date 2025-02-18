import { Menu, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  CircleStackIcon as DatabaseIcon,
  MoonIcon,
  SunIcon,
  TableCellsIcon as TableIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Form, Link, useLocation, useSubmit } from "react-router";
import clsx from "clsx";
import { Fragment, useMemo } from "react";
import type { UserWithOrganization } from "../lib/db/schema";
import { Theme, useTheme } from "remix-themes";
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
  user?: UserWithOrganization | null;
  connections?: UserWithOrganization['connectionPermissions'];
}

export default function Layout({ children, user, connections = [] }: LayoutProps) {
  const [theme, setTheme] = useTheme();
  const location = useLocation();
  const submit = useSubmit();

  const innerUser = useMemo(() => user, [user]);

  const navigation = [
    { name: 'Tables', href: '/schema', icon: TableIcon },
    { name: 'Databases', href: '/connections', icon: DatabaseIcon },
    { name: 'Run Query', href: '/query', icon: DatabaseIcon },
  ];

  const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
    { name: 'Organizations', href: '/organizations' },
    { name: 'Settings', href: '/settings' },
  ];
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {(innerUser?.databaseConnections?.length || 0) > 0 && (
        <div className="w-[297px] p-4">
          <div className="flex h-full flex-col rounded-2xl bg-card shadow-lg">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <img src="/assets/logo.svg" alt="Data Studio" className="h-8 w-8 mr-2" />
                <h1 className="text-xl font-bold text-foreground">Data Studio</h1>
              </div>

              <nav className="mt-5 flex-1 space-y-1 px-2" aria-label="Sidebar">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          isActive
                            ? 'text-accent-foreground'
                            : 'text-muted-foreground group-hover:text-foreground',
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
            <div className="flex flex-shrink-0 border-t border-border p-4 space-y-3 flex-col">
              {user ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center w-full px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
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
                    <MenuItems className="absolute bottom-full mb-2 left-0 right-0 origin-bottom-left rounded-md bg-popover shadow-lg ring-1 ring-border focus:outline-none z-50">
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <MenuItem key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href}
                                className={clsx(
                                  active ? 'bg-accent text-accent-foreground' : 'text-foreground',
                                  'block px-4 py-2 text-sm'
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </MenuItem>
                        ))}
                        <MenuItem>
                          {({ active }) => (
                            <Form action="/logout" method="post">
                              <Button
                                type="submit"
                                className={clsx(
                                  active ? 'bg-accent text-accent-foreground' : 'text-foreground',
                                  'block w-full text-left px-4 py-2 text-sm'
                                )}
                              >
                                Sign out
                              </Button>
                            </Form>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
                className="w-full justify-start"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 mr-2" />
                ) : (
                  <MoonIcon className="h-5 w-5 mr-2" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 p-4">
        <main className="w-full h-full bg-card rounded-2xl shadow-lg overflow-hidden p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
