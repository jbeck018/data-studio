import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { ConnectionInput, ConnectionSchema, createConnection, testConnection } from "../lib/connections/config.server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import {
  Form as ShadForm,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { create } from "lodash-es";

type FormSchema = z.infer<typeof ConnectionSchema>;

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
  // Ensure user is authenticated
  const user = await requireUser(request);
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // Parse form data 
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate the data
    const validatedData = ConnectionSchema.parse({
      ...data,
      // Convert ssl to boolean if it exists
      ssl: data.ssl === 'true',
      // Convert port to number if it exists
      port: data.port ? Number(data.port) : undefined,
    });

    // Prepare connection configuration
    const connectionConfig = {
      name: validatedData.name,
      type: validatedData.type,
      organizationId: user?.currentOrganization?.id || '',
      createdById: user.id,
      archived: false,
      config: {
        type: validatedData.type.toLowerCase(),
        host: validatedData['host' as keyof typeof validatedData],
        port: validatedData['port' as keyof typeof validatedData],
        database: validatedData['database' as keyof typeof validatedData],
        username: validatedData['username' as keyof typeof validatedData],
        password: validatedData['password' as keyof typeof validatedData],
        ssl: validatedData['ssl' as keyof typeof validatedData],
        filepath: validatedData['filepath' as keyof typeof validatedData],
      },
    };

    // Test the connection first
    const isValid = await testConnection(connectionConfig as unknown as ConnectionInput);

    if (!isValid) {
      return { 
        error: "Invalid connection details", 
        details: ["Could not connect to database"],
        status: 400
      };
    }

    // Insert the connection into the database
    await createConnection(user?.currentOrganization?.id || '', connectionConfig as unknown as ConnectionInput);

    return redirect("/connections");
  } catch (error) {
    console.error("Connection creation error:", error);

    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return { 
        error: "Invalid connection details", 
        details: error.errors,
        status: 400
      };
    }

    return { 
      error: error instanceof Error ? error.message : "Failed to create connection",
      status: 500
    };
  }
}

export default function NewConnectionPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isTesting = navigation.formData?.get("intent") === "test";

  const form = useForm<FormSchema>({
    resolver: zodResolver(ConnectionSchema),
    defaultValues: {
      name: "",
      type: undefined,
      host: "",
      port: undefined,
      database: "",
      username: "",
      password: "",
      ssl: false,
      filepath: "",
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-10 divide-y divide-gray-900/10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7">New Connection</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add a new database connection to your organization.
              </p>
            </div>

            <div className="bg-card shadow-sm ring-1 ring-gray-900/5 rounded-md px-4 py-6 sm:p-8 md:col-span-2">
              {actionData?.errors?.formErrors && (
                <div className="mb-6 rounded-md bg-destructive/15 p-4">
                  <div className="text-sm text-destructive">
                    {actionData.errors.formErrors.join(", ")}
                  </div>
                </div>
              )}

              <Form method="post" onSubmit={form.handleSubmit((data) => {
                // Empty callback is fine since we're using Remix's form handling
              })} noValidate>
                <ShadForm {...form}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Connection Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value ?? undefined}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a database type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="POSTGRES">PostgreSQL</SelectItem>
                              <SelectItem value="MYSQL">MySQL</SelectItem>
                              <SelectItem value="SQLITE">SQLite</SelectItem>
                              <SelectItem value="MSSQL">Microsoft SQL Server</SelectItem>
                              <SelectItem value="ORACLE">Oracle</SelectItem>
                              <SelectItem value="MONGODB">MongoDB</SelectItem>
                              <SelectItem value="REDIS">Redis</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <FormField
                          control={form.control}
                          name="host"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Host</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name="port"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Port</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  type="number"
                                  // Convert empty string to undefined and string to number
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? undefined : parseInt(value, 10));
                                  }}
                                  // Convert undefined to empty string for controlled input
                                  value={field.value?.toString() ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="database"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ssl"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Use SSL</FormLabel>
                            <FormDescription>
                              Enable SSL/TLS for secure connection
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="filepath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Path</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-x-4">
                      <Button
                        type="submit"
                        name="intent"
                        value="test"
                        disabled={isSubmitting}
                        variant="outline"
                      >
                        {isTesting ? "Testing..." : "Test Connection"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && !isTesting ? "Creating..." : "Create Connection"}
                      </Button>
                    </div>
                  </div>
                </ShadForm>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
