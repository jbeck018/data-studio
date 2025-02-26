import { type LoaderFunctionArgs } from "react-router";
import { Outlet } from "react-router";
import { requireUser } from "../lib/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // This ensures all organization routes are protected
  await requireUser(request);
  return {};
}

export default function OrganizationsLayout() {
  return (
    <div className="min-h-screen bg-light-bg-current dark:bg-dark-bg-current">
      <Outlet />
    </div>
  );
}
