import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import styles from "./tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./utils/theme";
import { Layout } from "./components/Layout";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

const queryClient = new QueryClient();

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-900">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Layout>
              <Outlet />
            </Layout>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
            <ReactQueryDevtools />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
