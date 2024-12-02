import bcrypt from 'bcrypt';
import { db } from '../db/db.server';
import { users } from '../db/schema';
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

export async function register(request: Request, formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const name = formData.get('name')?.toString();
  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';

  if (!email || !password || !name) {
    return {
      errors: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null,
        name: !name ? 'Name is required' : null,
      },
    };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      errors: {
        email: 'A user already exists with this email',
      },
    };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db.insert(users).values({
    email,
    name,
    hashedPassword,
  }).returning();

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export async function login(request: Request, formData: FormData) {
  console.log('Starting login process');
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';
  const remember = formData.get('remember') === 'on';

  console.log('Login parameters:', { email, redirectTo, remember });

  if (!email || !password) {
    console.log('Missing required fields');
    return {
      errors: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null,
      },
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.log('User not found');
    return {
      errors: {
        email: 'Invalid email or password',
      },
    };
  }

  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isValidPassword) {
    console.log('Invalid password');
    return {
      errors: {
        email: 'Invalid email or password',
      },
    };
  }

  console.log('Login successful, creating session');
  const sessionResponse = await createUserSession({
    request,
    userId: user.id,
    remember,
    redirectTo,
  });
  console.log('Session created, returning response');
  return sessionResponse;
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

  const isValidPassword = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isValidPassword) {
    return {
      error: 'Invalid current password',
    };
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db.update(users)
    .set({ hashedPassword })
    .where(eq(users.id, userId));

  return { success: true };
}
