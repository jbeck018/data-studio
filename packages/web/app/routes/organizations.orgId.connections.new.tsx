import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { createDatabaseConnection } from "../lib/connections/connections.server";
import { z } from "zod";

const CreateConnectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["POSTGRES", "MYSQL"], {
    required_error: "Database type is required",
  }),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.coerce.boolean(),
});

type ActionData = {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      name?: string[];
      type?: string[];
      host?: string[];
      port?: string[];
      database?: string[];
      username?: string[];
      password?: string[];
      ssl?: string[];
    };
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const result = CreateConnectionSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    host: formData.get("host"),
    port: formData.get("port"),
    database: formData.get("database"),
    username: formData.get("username"),
    password: formData.get("password"),
    ssl: formData.get("ssl"),
  });

  if (!result.success) {
    return json<ActionData>(
      {
        errors: {
          fieldErrors: result.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const { orgId } = params;
  if (!orgId) {
    return json<ActionData>(
      {
        errors: {
          formErrors: ["Organization ID is required"],
        },
      },
      { status: 400 }
    );
  }

  try {
    await createDatabaseConnection({
      ...result.data,
      organizationId: orgId,
      userId: user.id,
    });

    return redirect(`/organizations/${orgId}/connections`);
  } catch (error) {
    console.error("Failed to create connection:", error);
    return json<ActionData>(
      {
        errors: {
          formErrors: ["Failed to create connection. Please try again."],
        },
      },
      { status: 500 }
    );
  }
}

export default function NewConnectionPage() {
  const actionData = useActionData<ActionData>();
  const { orgId } = useParams();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Connection</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
          Create a new database connection
        </p>
      </div>

      <Form method="post" className="space-y-6">
        {actionData?.errors?.formErrors && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <ul className="list-disc list-inside text-red-600 dark:text-red-400">
              {actionData.errors.formErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Connection Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Database Type
          </label>
          <select
            id="type"
            name="type"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a database type</option>
            <option value="POSTGRES">PostgreSQL</option>
            <option value="MYSQL">MySQL</option>
          </select>
          {actionData?.errors?.fieldErrors?.type && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.type[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="host"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Host
          </label>
          <input
            type="text"
            id="host"
            name="host"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.host && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.host[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="port"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Port
          </label>
          <input
            type="number"
            id="port"
            name="port"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.port && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.port[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="database"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Database Name
          </label>
          <input
            type="text"
            id="database"
            name="database"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.database && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.database[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.username && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.username[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {actionData?.errors?.fieldErrors?.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="ssl"
            name="ssl"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-light-border dark:border-dark-border rounded"
          />
          <label
            htmlFor="ssl"
            className="ml-2 block text-sm text-light-text dark:text-dark-text"
          >
            Use SSL
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Create Connection
          </button>
        </div>
      </Form>
    </div>
  );
}
