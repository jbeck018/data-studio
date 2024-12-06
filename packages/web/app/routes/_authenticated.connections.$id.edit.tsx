import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { 
  ConnectionSchema, 
  type ConnectionInput,
  getConnection, 
  testConnection, 
  updateConnection, 
  deleteConnection, 
  type DatabaseConnection
} from "../lib/connections/config.server";
import { DATABASE_TYPES } from "../lib/db/schema";

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
      ssl?: string[];
      filepath?: string[];
      authSource?: string[];
      replicaSet?: string[];
    };
  };
  tested?: boolean;
}

type LoaderData = {
  connection: DatabaseConnection;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization) {
    throw new Error("No organization selected");
  }

  const connection = await getConnection(params.id!, user.currentOrganization);
  if (!connection) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ connection });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  if (!user.currentOrganization) {
    throw new Error("No organization selected");
  }

  const formData = await request.formData();
  const intent = formData.get("_action");

  if (intent === "delete") {
    await deleteConnection(params.id!, user.currentOrganization);
    return redirect("/connections");
  }

  const rawData = {
    name: formData.get("name") as string | null,
    type: formData.get("type") as string | null,
    host: formData.get("host") as string | null,
    port: formData.get("port") as string | null,
    database: formData.get("database") as string | null,
    username: formData.get("username") as string | null,
    password: formData.get("password") as string | null,
    ssl: formData.get("ssl") === "on",
    filepath: formData.get("filepath") as string | null,
    authSource: formData.get("authSource") as string | null,
    replicaSet: formData.get("replicaSet") as string | null,
  };

  const result = ConnectionSchema.safeParse(rawData);

  if (!result.success) {
    return json<ActionData>({
      errors: {
        formErrors: [],
        fieldErrors: result.error.formErrors.fieldErrors,
      },
    });
  }

  try {
    if (intent === "test") {
      const success = await testConnection(result.data);
      return json<ActionData>({
        tested: success,
      });
    }

    await updateConnection(params.id!, user.currentOrganization, result.data);
    return redirect("/connections");
  } catch (error) {
    return json<ActionData>(
      {
        errors: {
          formErrors: [(error as Error).message],
        },
      },
      { status: 400 }
    );
  }
}

export default function EditConnectionPage() {
  const { connection } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const config = connection.config;
  const initialValues = {
    name: connection.name,
    type: connection.type,
    ...('host' in config ? {
      host: config.host,
      port: config.port?.toString() ?? '',
      username: config.username ?? '',
      password: config.password ?? '',
      ssl: config.ssl ?? false,
    } : {}),
    ...('database' in config ? {
      database: typeof config.database === 'number' ? String(config.database) : config.database ?? '',
    } : {}),
    ...('filepath' in config ? {
      filepath: config.filepath,
    } : {}),
    ...('authSource' in config ? {
      authSource: config.authSource ?? '',
      replicaSet: config.replicaSet ?? '',
    } : {}),
  } as const;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Connection</h1>
        
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={initialValues.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {actionData?.errors?.fieldErrors?.name && (
              <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={initialValues.type}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {DATABASE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {actionData?.errors?.fieldErrors?.type && (
              <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.type[0]}</p>
            )}
          </div>

          {initialValues.type !== "SQLITE" ? (
            <>
              <div>
                <label htmlFor="host" className="block text-sm font-medium text-gray-700">
                  Host
                </label>
                <input
                  type="text"
                  name="host"
                  id="host"
                  defaultValue={initialValues.host}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.errors?.fieldErrors?.host && (
                  <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.host[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                  Port
                </label>
                <input
                  type="text"
                  name="port"
                  id="port"
                  defaultValue={initialValues.port}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.errors?.fieldErrors?.port && (
                  <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.port[0]}</p>
                )}
              </div>

              {initialValues.type !== "REDIS" && (
                <div>
                  <label htmlFor="database" className="block text-sm font-medium text-gray-700">
                    Database
                  </label>
                  <input
                    type="text"
                    name="database"
                    id="database"
                    defaultValue={initialValues.database}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {actionData?.errors?.fieldErrors?.database && (
                    <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.database[0]}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  defaultValue={initialValues.username}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.errors?.fieldErrors?.username && (
                  <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.username[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  defaultValue={initialValues.password}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.errors?.fieldErrors?.password && (
                  <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.password[0]}</p>
                )}
              </div>

              {initialValues.type === "MONGODB" && (
                <>
                  <div>
                    <label htmlFor="authSource" className="block text-sm font-medium text-gray-700">
                      Auth Source
                    </label>
                    <input
                      type="text"
                      name="authSource"
                      id="authSource"
                      defaultValue={initialValues.authSource}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {actionData?.errors?.fieldErrors?.authSource && (
                      <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.authSource[0]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="replicaSet" className="block text-sm font-medium text-gray-700">
                      Replica Set
                    </label>
                    <input
                      type="text"
                      name="replicaSet"
                      id="replicaSet"
                      defaultValue={initialValues.replicaSet}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {actionData?.errors?.fieldErrors?.replicaSet && (
                      <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.replicaSet[0]}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ssl"
                  id="ssl"
                  defaultChecked={initialValues.ssl}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ssl" className="ml-2 block text-sm text-gray-900">
                  Use SSL
                </label>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="filepath" className="block text-sm font-medium text-gray-700">
                File Path
              </label>
              <input
                type="text"
                name="filepath"
                id="filepath"
                defaultValue={initialValues.filepath}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {actionData?.errors?.fieldErrors?.filepath && (
                <p className="mt-2 text-sm text-red-600">{actionData.errors.fieldErrors.filepath[0]}</p>
              )}
            </div>
          )}

          {actionData?.errors?.formErrors && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {actionData.errors.formErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="submit"
              name="_action"
              value="test"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? "Testing..." : "Test Connection"}
            </button>
            <div className="space-x-4">
              <button
                type="submit"
                name="_action"
                value="save"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="submit"
                name="_action"
                value="delete"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
