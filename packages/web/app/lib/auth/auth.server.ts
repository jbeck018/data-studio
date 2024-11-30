import bcrypt from 'bcrypt';
import { db } from '~/lib/db/db.server';
import { users } from '~/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createUserSession } from './session.server';

const SALT_ROUNDS = 10;

interface LoginForm {
  email: string;
  password: string;
  redirectTo: string;
}

interface RegisterForm extends LoginForm {
  name: string;
}

export async function register({ email, password, name, redirectTo }: RegisterForm) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      error: 'A user with this email already exists',
    };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db.insert(users)
    .values({
      email,
      name,
      passwordHash,
    })
    .returning({
      id: users.id,
    });

  return createUserSession(user.id, redirectTo);
}

export async function login({ email, password, redirectTo }: LoginForm) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return {
      error: 'Invalid email or password',
    };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return {
      error: 'Invalid email or password',
    };
  }

  return createUserSession(user.id, redirectTo);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return {
      error: 'User not found',
    };
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    return {
      error: 'Invalid current password',
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));

  return { success: true };
}
