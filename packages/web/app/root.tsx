import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import stylesheet from "./tailwind.css?url";
import { ThemeProvider } from "./utils/theme";
import Layout from "./components/Layout";
import { loader as connectionLoader } from "./routes/connections.state";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", type: "image/svg+xml", href: "/assets/favicon.svg" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const connectionState = await connectionLoader({ request, params: {}, context: {} });
  const { connections, activeConnection } = connectionState;

  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
    connections,
    activeConnection,
  });
}

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
