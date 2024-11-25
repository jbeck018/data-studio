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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

const queryClient = new QueryClient();

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50">
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </body>
    </html>
  );
}
