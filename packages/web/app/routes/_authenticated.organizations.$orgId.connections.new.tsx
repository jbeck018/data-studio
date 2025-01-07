import { data, redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useParams } from "react-router";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { requireUser } from "../lib/auth/session.server";
import { createConnection } from "~/lib/connections/config.server";

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
    return data<ActionData>({ errors: result.error.flatten() }, { status: 400 });
  }

  try {
    const connection = await createConnection(params.orgId!, {
      ...result.data,
      port: result.data.port.toString(),
    });

    return redirect(`/organizations/${params.orgId}/connections/${connection.id}`);
  } catch (error) {
    if (error instanceof Error) {
      return data<ActionData>(
        {
          errors: {
            formErrors: [error.message],
            fieldErrors: {},
          },
        },
        { status: 400 }
      );
    }
    return data<ActionData>(
      {
        errors: {
          formErrors: ["An unexpected error occurred"],
          fieldErrors: {},
        },
      },
      { status: 500 }
    );
  }
}

export default function NewConnectionPage() {
  const actionData = useActionData<ActionData>();
  const params = useParams();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Connect to Database
        </h1>

        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Connection Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.name ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.name ? "name-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.name ? (
                <div className="pt-1 text-red-700" id="name-error">
                  {actionData.errors.fieldErrors.name[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Database Type
            </label>
            <div className="mt-1">
              <select
                id="type"
                name="type"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.type ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.type ? "type-error" : undefined
                }
              >
                <option value="">Select a database type</option>
                <option value="POSTGRES">PostgreSQL</option>
                <option value="MYSQL">MySQL</option>
              </select>
              {actionData?.errors?.fieldErrors?.type ? (
                <div className="pt-1 text-red-700" id="type-error">
                  {actionData.errors.fieldErrors.type[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="host"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Host
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="host"
                name="host"
                required
                placeholder="localhost"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.host ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.host ? "host-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.host ? (
                <div className="pt-1 text-red-700" id="host-error">
                  {actionData.errors.fieldErrors.host[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="port"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Port
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="port"
                name="port"
                required
                placeholder="5432"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.port ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.port ? "port-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.port ? (
                <div className="pt-1 text-red-700" id="port-error">
                  {actionData.errors.fieldErrors.port[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="database"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Database Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="database"
                name="database"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.database ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.database ? "database-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.database ? (
                <div className="pt-1 text-red-700" id="database-error">
                  {actionData.errors.fieldErrors.database[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Username
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="username"
                name="username"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.username ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.username ? "username-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.username ? (
                <div className="pt-1 text-red-700" id="username-error">
                  {actionData.errors.fieldErrors.username[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg dark:bg-gray-800 dark:text-white"
                aria-invalid={actionData?.errors?.fieldErrors?.password ? true : undefined}
                aria-describedby={
                  actionData?.errors?.fieldErrors?.password ? "password-error" : undefined
                }
              />
              {actionData?.errors?.fieldErrors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.fieldErrors.password[0]}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ssl"
              name="ssl"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="ssl"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
            >
              Use SSL
            </label>
          </div>

          {actionData?.errors?.formErrors?.length ? (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul className="list-disc space-y-1 pl-5">
                      {actionData.errors.formErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between space-x-4">
            <Button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 rounded border border-gray-500 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Create Connection
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
