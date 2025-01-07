import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "../lib/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  console.log('Root route - User:', user);

  // If user is authenticated, redirect to the authenticated dashboard
  if (user) {
    return redirect("/dashboard");
  }

  // Otherwise, redirect to login with the current URL as the redirect target
  const url = new URL(request.url);
  return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
}
