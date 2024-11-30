import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { env } from '~/env.server';
import { db } from '~/lib/db/db.server';
import { users } from '~/lib/db/schema';
import { eq } from 'drizzle-orm';

// Session configuration
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [env.SESSION_SECRET],
    secure: env.NODE_ENV === 'production',
  },
});

// Get the user session
export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'));
}

// Get the logged-in user
export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw await logout(request);
  }

  return user;
}

// Create a new session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

// Log out the user
export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

// Require authentication
export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const user = await getUser(request);
  if (!user) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}
