import type { ActionFunctionArgs } from "react-router";
import { Form, Link, useActionData } from "react-router";
import { createUserSession, login } from "~/lib/auth";
import { getUser } from "~/lib/auth/session.server";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface LoginActionData {
  error?: string;
  fields?: {
    email: string;
    password: string;
  };
}

export async function loader({ request }: ActionFunctionArgs) {
  const user = await getUser(request);
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string || "/dashboard";

  if (!email || !password) {
    return {
      error: "Email and password are required",
      fields: { email, password },
    } as LoginActionData;
  }

  const user = await login(email, password);
  if (!user) {
    return {
      error: "Invalid email or password",
      fields: { email, password },
    } as LoginActionData;
  }

  return createUserSession(user.id, redirectTo);
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>

      <Form method="post" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            defaultValue={actionData?.fields?.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue={actionData?.fields?.password}
          />
        </div>

        {actionData?.error && (
          <div className="text-red-500 text-sm">{actionData.error}</div>
        )}

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link 
          to="/register"
          className="hover:text-brand underline underline-offset-4"
        >
          Don't have an account? Sign Up
        </Link>
      </p>
    </>
  );
}
