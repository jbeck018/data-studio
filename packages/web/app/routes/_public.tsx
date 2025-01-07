import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getUser } from "../lib/auth/session.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import PublicLayout from "../components/PublicLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  // If user is already authenticated, redirect to home
  if (user) {
    return redirect("/");
  }

  return {};
}

export default function PublicRoot() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}
