// Re-export all auth-related functionality
export {
	createUser,
	verifyLogin,
	getUserById,
	getUserByEmail,
	updateUser,
	requireUser,
	getUserFromSession,
	createUserSession,
	getSession,
	logout,
	login,
	register,
} from './auth.server';

export {
	requireRole,
	requireAdmin,
	requireOwner,
} from './middleware';

export {
	getUserRole,
	hasRole,
	getUsersInOrganization,
	addUserToOrganization,
	updateUserRole,
	removeUserFromOrganization,
} from './rbac.server';

export {
	storage,
} from './storage.server';

// Re-export types
export type { UserWithOrganization, Role } from '~/lib/db/schema';