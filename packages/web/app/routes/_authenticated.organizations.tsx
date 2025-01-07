import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // This ensures all organization routes are protected
  await requireUser(request);
  return {};
}

export default function OrganizationsLayout() {
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      <Outlet />
    </div>
  );
}
