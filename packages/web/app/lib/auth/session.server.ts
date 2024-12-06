import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { env } from '../../env.server';
import { db } from '../../lib/db/db.server';
import { users, organizationMembers, databaseConnections } from '../../lib/db/schema';
import { eq, and, not } from 'drizzle-orm';
import { getUserOrganizationRole, getUserOrganizationPermissions, Role, Permission } from './rbac.server';

// Session configuration
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [env.SESSION_SECRET || 'default-secret-please-change'],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

// Get the user session
export async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  // console.log('Got session:', {
  //   userId: session.get('userId'),
  //   organizationId: session.get('organizationId'),
  // });
  return session;
}

// Get the logged-in user with roles and connection status
export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  const organizationId = session.get('organizationId');
  
  if (!userId) {
    console.log('No userId in session');
    return null;
  }

  const userFromDb = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!userFromDb) {
    throw await logout(request);
  }

  // Convert date strings to Date objects
  const user = {
    ...userFromDb,
    createdAt: new Date(userFromDb.createdAt),
    lastLogin: userFromDb.lastLogin ? new Date(userFromDb.lastLogin) : null,
  };

  // Get user organization memberships
  const organizationMemberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
    columns: {
      organizationId: true,
      role: true,
    },
  });

  // Format organizations array to match User type
  const organizations = organizationMemberships.map(membership => ({
    id: membership.organizationId,
    role: membership.role.toUpperCase() as 'OWNER' | 'ADMIN' | 'MEMBER',
  }));

  // If no organizations, return early
  if (organizations.length === 0) {
    return {
      ...user,
      organizations,
      currentOrganization: null,
      organizationRole: null,
      organizationPermissions: null,
      hasConnection: false,
    };
  }

  // If no organization selected but user has organizations, use the first one
  const effectiveOrgId = organizationId || organizations[0].id;

  // Check if user has any active database connections
  const hasConnection = await db.query.databaseConnections.findFirst({
    where: and(
      eq(databaseConnections.organizationId, effectiveOrgId),
      not(eq(databaseConnections.archived, true))
    ),
  }) !== null;

  // Get user's role in current organization
  const organizationRole = (await getUserOrganizationRole(user.id, effectiveOrgId))?.toUpperCase() as 'OWNER' | 'ADMIN' | 'MEMBER' | null;

  // Get user's permissions in current organization
  const organizationPermissions = await getUserOrganizationPermissions(user.id, effectiveOrgId);

  return {
    ...user,
    organizations,
    currentOrganization: effectiveOrgId,
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

  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined; // 30 days if remember

  const cookie = await sessionStorage.commitSession(session, {
    maxAge,
  });
  
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      'Set-Cookie': cookie,
    },
  });
  
  return response;
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

// Require user ID
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}
