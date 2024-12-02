import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { ConnectionSchema, createConnection, testConnection } from "../services/connections.server";

interface ActionData {
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
    };
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization) {
    throw new Error("No organization selected");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  const rawData = {
    name: formData.get("name"),
    type: formData.get("type"),
    host: formData.get("host"),
    port: formData.get("port"),
    database: formData.get("database"),
    username: formData.get("username"),
    password: formData.get("password"),
    ssl: formData.get("ssl") === "true",
  };

  const result = ConnectionSchema.safeParse(rawData);

  if (!result.success) {
    return json<ActionData>(
      { errors: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (intent === "test") {
      const isValid = await testConnection(result.data);
      if (!isValid) {
        return json<ActionData>(
          { errors: { formErrors: ["Could not connect to database"] } },
          { status: 400 }
        );
      }
      return json({ success: true });
    }

    await createConnection(user.currentOrganization, result.data);
    return redirect("/connections");
  } catch (error) {
    if (error instanceof Error) {
      return json<ActionData>(
        { errors: { formErrors: [error.message] } },
        { status: 400 }
      );
    }
    return json<ActionData>(
      { errors: { formErrors: ["An unexpected error occurred"] } },
      { status: 500 }
    );
  }
}

export default function NewConnectionPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isTesting = navigation.formData?.get("intent") === "test";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-10 divide-y divide-gray-900/10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">New Connection</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Add a new database connection to your organization.
              </p>
            </div>

            <Form method="post" className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-md px-4 py-6 sm:p-8 md:col-span-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Connection Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.name)}
                      aria-describedby={actionData?.errors?.fieldErrors?.name ? "name-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.name && (
                    <div className="mt-2 text-sm text-red-600" id="name-error">
                      {actionData.errors.fieldErrors.name.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Database Type
                  </label>
                  <div className="mt-2">
                    <select
                      id="type"
                      name="type"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.type)}
                      aria-describedby={actionData?.errors?.fieldErrors?.type ? "type-error" : undefined}
                    >
                      <option value="">Select a type</option>
                      <option value="POSTGRES">PostgreSQL</option>
                      <option value="MYSQL">MySQL</option>
                    </select>
                  </div>
                  {actionData?.errors?.fieldErrors?.type && (
                    <div className="mt-2 text-sm text-red-600" id="type-error">
                      {actionData.errors.fieldErrors.type.join(", ")}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="host" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Host
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="host"
                      id="host"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.host)}
                      aria-describedby={actionData?.errors?.fieldErrors?.host ? "host-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.host && (
                    <div className="mt-2 text-sm text-red-600" id="host-error">
                      {actionData.errors.fieldErrors.host.join(", ")}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="port" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Port
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="port"
                      id="port"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.port)}
                      aria-describedby={actionData?.errors?.fieldErrors?.port ? "port-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.port && (
                    <div className="mt-2 text-sm text-red-600" id="port-error">
                      {actionData.errors.fieldErrors.port.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="database" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Database Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="database"
                      id="database"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.database)}
                      aria-describedby={actionData?.errors?.fieldErrors?.database ? "database-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.database && (
                    <div className="mt-2 text-sm text-red-600" id="database-error">
                      {actionData.errors.fieldErrors.database.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.username)}
                      aria-describedby={actionData?.errors?.fieldErrors?.username ? "username-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.username && (
                    <div className="mt-2 text-sm text-red-600" id="username-error">
                      {actionData.errors.fieldErrors.username.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 sm:text-sm sm:leading-6"
                      aria-invalid={Boolean(actionData?.errors?.fieldErrors?.password)}
                      aria-describedby={actionData?.errors?.fieldErrors?.password ? "password-error" : undefined}
                    />
                  </div>
                  {actionData?.errors?.fieldErrors?.password && (
                    <div className="mt-2 text-sm text-red-600" id="password-error">
                      {actionData.errors.fieldErrors.password.join(", ")}
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        id="ssl"
                        name="ssl"
                        type="checkbox"
                        value="true"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="ssl" className="font-medium text-gray-900 dark:text-white">
                        Use SSL
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">Enable SSL/TLS for secure connection</p>
                    </div>
                  </div>
                </div>
              </div>

              {actionData?.errors?.formErrors && (
                <div className="mt-6 text-sm text-red-600">
                  {actionData.errors.formErrors.join(", ")}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-x-4">
                <button
                  type="submit"
                  name="intent"
                  value="test"
                  disabled={isSubmitting}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {isSubmitting && !isTesting ? "Creating..." : "Create Connection"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
