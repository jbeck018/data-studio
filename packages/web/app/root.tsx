import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router";
import {
  ThemeProvider,
  Theme,
} from "remix-themes";
import styles from "./tailwind.css?url";
import { themeSessionResolver } from "./lib/auth/session.server";

export const links: any = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/svg+xml", href: "/assets/favicon.svg" },
];

// Return the theme from the session storage using the loader
export const loader: LoaderFunction = async ({ request }) => {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
};

export default function App() {
  const data = useLoaderData();
  return (
      <html lang="en" className="h-full" data-theme={data?.theme ?? ""}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="h-full">
          <ThemeProvider specifiedTheme={data.theme || Theme.LIGHT} themeAction="/action/set-theme">
            <Outlet />
          </ThemeProvider>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
  );
}
