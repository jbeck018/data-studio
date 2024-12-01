import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { env } from '~/env.server';
import { db } from '~/lib/db/db.server';
import { users, organizationMembers, databaseConnections } from '~/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserOrganizationRole, getUserOrganizationPermissions, Role, Permission } from './rbac.server';

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

// Get the logged-in user with roles and connection status
export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  const organizationId = session.get('organizationId');
  
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) {
    throw await logout(request);
  }

  // Get user organization memberships
  const organizationMemberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
    columns: {
      organizationId: true,
      role: true,
    },
  });

  // If no organization is selected but user has organizations, select the first one
  if (!organizationId && organizationMemberships.length > 0) {
    const session = await getUserSession(request);
    session.set('organizationId', organizationMemberships[0].organizationId);
    throw redirect(request.url, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  // Get current organization details if selected
  let organizationRole = null;
  let organizationPermissions = null;
  let hasConnection = false;

  if (organizationId) {
    [organizationRole, organizationPermissions, hasConnection] = await Promise.all([
      getUserOrganizationRole(user.id, organizationId),
      getUserOrganizationPermissions(user.id, organizationId),
      db.query.databaseConnections.findFirst({
        where: and(
          eq(databaseConnections.organizationId, organizationId),
          eq(databaseConnections.isActive, true),
        ),
        columns: { id: true },
      }).then(Boolean),
    ]);

    if (!organizationRole) {
      // User no longer has access to this organization, clear it from session
      const session = await getUserSession(request);
      session.unset('organizationId');
      throw redirect(request.url, {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      });
    }
  }

  return {
    ...user,
    organizationMemberships: organizationMemberships.map(org => ({
      id: org.organizationId,
      role: org.role,
    })),
    currentOrganization: organizationId,
    organizationRole,
    organizationPermissions,
    hasConnection,
  };
}

// Create a new session
export async function createUserSession({
  request,
  userId,
  organizationId,
  remember = false,
  redirectTo
}: {
  request: Request;
  userId: string;
  organizationId?: string | null;
  remember?: boolean;
  redirectTo: string;
}) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);
  if (organizationId) {
    session.set('organizationId', organizationId);
  }

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

// Set current organization
export async function setCurrentOrganization(request: Request, organizationId: string) {
  const session = await getUserSession(request);
  session.set('organizationId', organizationId);
  return redirect(request.url, {
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

// Require organization selection
export async function requireOrganization(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const user = await requireUser(request);
  if (!user.currentOrganization) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/organizations/select?${searchParams}`);
  }
  return user;
}

// Require specific role in current organization
export async function requireOrganizationRole(
  request: Request,
  role: Role,
  redirectTo: string = '/',
) {
  const user = await requireOrganization(request);
  if (user.organizationRole !== role) {
    throw redirect(redirectTo, {
      status: 403,
    });
  }
  return user;
}

// Require specific permission in current organization
export async function requireOrganizationPermission(
  request: Request,
  permission: Permission,
  redirectTo: string = '/',
) {
  const user = await requireOrganization(request);
  if (!user.organizationPermissions?.includes(permission)) {
    throw redirect(redirectTo, {
      status: 403,
    });
  }
  return user;
}

// Require database connection in current organization
export async function requireConnection(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const user = await requireOrganization(request);
  if (!user.hasConnection) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/connection/new?${searchParams}`);
  }
  return user;
}
