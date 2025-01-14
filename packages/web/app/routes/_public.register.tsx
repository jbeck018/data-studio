import { type ActionFunctionArgs, redirect } from "react-router";
import { Form, Link, useActionData } from "react-router";
import { createUserSession, register } from "~/lib/auth";
import { getUser } from "~/lib/auth/session.server";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface RegisterActionData {
  error?: string;
  fields?: {
    email: string;
    password: string;
    name: string;
  };
}

export async function loader({ request }: ActionFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    return redirect("/dashboard");
  }
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return {
      error: "All fields are required",
      fields: { email, password, name },
    } as RegisterActionData;
  }

  const user = await register(email, password, name);
  if (!user) {
    return {
      error: "A user with this email already exists",
      fields: { email, password, name },
    } as RegisterActionData;
  }

  return createUserSession(user.id, "/dashboard");
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <Form method="post" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
            defaultValue={actionData?.fields?.name}
          />
        </div>
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
            autoComplete="new-password"
            required
          />
        </div>

        {actionData?.error && (
          <div className="text-red-500 text-sm">{actionData.error}</div>
        )}

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link 
          to="/login"
          className="hover:text-brand underline underline-offset-4"
        >
          Already have an account? Sign In
        </Link>
      </p>
    </>
  );
}

