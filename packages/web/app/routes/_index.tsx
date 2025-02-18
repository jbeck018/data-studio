import { Outlet, useNavigate, useLocation, useLoaderData } from "react-router";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "../lib/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return { user };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPath = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (user) {
      console.log(user);
      if (user?.databaseConnections?.length === 0) {
        navigate('/connections/new');
      }

      if (!location.pathname.startsWith('/dashboard')) {
        // If user is authenticated and not on dashboard, redirect to dashboard
        navigate('dashboard');
      } 
    } else if (!user && !isAuthPath) {
      // If user is not authenticated and not on login/register, redirect to login
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
    }
  }, [user, navigate, location.pathname, isAuthPath]);

  return <Outlet />;
}
