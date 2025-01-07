import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import styles from "./tailwind.css";
import { ThemeProvider } from "./utils/theme";
import Layout from "./components/Layout";
import { loader as connectionLoader } from "./routes/connections.state";
import { DatabaseConnection } from "./lib/db/schema";

interface LoaderData {
  ENV: {
    NODE_ENV: string;
  };
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null | undefined;
}

export const links: any = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/svg+xml", href: "/assets/favicon.svg" },
];

export const loader: LoaderFunction = async ({ request }) => {
  const connectionState = await connectionLoader({ request, params: {}, context: {} });
  const data = await connectionState.json();
  const { connections, activeConnection } = data;

  return json<LoaderData>({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
    connections,
    activeConnection,
  });
};

export default function App() {
  const { connections, activeConnection } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <ThemeProvider>
          <Layout connections={connections} activeConnection={activeConnection}>
            <Outlet />
          </Layout>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
