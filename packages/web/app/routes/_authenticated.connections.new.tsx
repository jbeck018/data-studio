import { redirect, type ActionFunctionArgs } from "react-router";
import { Form, useActionData, useNavigation, useSubmit } from "react-router";
import { requireUser } from "../lib/auth/session.server";
import { createConnection, testConnection } from "../lib/connections/config.server";
import { ConnectionSchema, type ConnectionInput } from "../lib/connections/types";
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
  error?: string;
  success?: boolean;
  message?: string;
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
    const intent = formData.get("intent");
    const rawFormData = JSON.parse(formData.get("formData") as string);

    // Validate the data
    const validatedData = ConnectionSchema.parse({
      ...rawFormData,
      // Convert ssl to boolean if it exists
      ssl: rawFormData.ssl === true,
    });

    // Prepare connection configuration
    const connectionConfig = {
      name: validatedData.name,
      type: validatedData.type,
      organizationId: user?.currentOrganization?.id || '',
      createdById: user.id,
      archived: false,
      host: validatedData.host,
      port: validatedData.port,
      database: validatedData.database,
      username: validatedData.username,
      password: validatedData.password,
      ssl: validatedData.ssl,
      filepath: validatedData.filepath,
      config: {
        type: validatedData.type.toLowerCase(),
        host: validatedData.host,
        port: validatedData.port,
        database: validatedData.database,
        username: validatedData.username,
        password: validatedData.password,
        ssl: validatedData.ssl,
        filepath: validatedData.filepath,
      },
    };

    // Test the connection
    const isValid = await testConnection(connectionConfig);

    if (!isValid) {
      return { 
        error: "Invalid connection details", 
        details: ["Could not connect to database"],
        status: 400
      };
    }

    // If this is just a test, return success
    if (intent === "test") {
      return { success: true, message: "Connection test successful" };
    }

    // Otherwise create the connection
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
  const submit = useSubmit();

  const form = useForm<FormSchema>({
    resolver: zodResolver(ConnectionSchema),
    defaultValues: {
      name: "",
      type: undefined,
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
      ssl: false,
      filepath: "",
    },
  });

  const handleTestConnection = () => {
    const data = form.getValues();

    const formData = new FormData();
    const jsonData = {
      ...data,
      host: data.host?.trim() || null,
    };
    
    formData.append("formData", JSON.stringify(jsonData));
    formData.append("intent", "test");
    
    submit(formData, { method: "post" });
  };

  const handleCreateConnection = () => {
    const data = form.getValues();

    const formData = new FormData();
    const jsonData = {
      ...data,
      host: data.host?.trim() || null,
    };
    
    formData.append("formData", JSON.stringify(jsonData));
    
    submit(formData, { method: "post" });
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-3xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground leading-7">New Connection</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new database connection to your organization.
            </p>
          </div>

          <div className="bg-card shadow-sm ring-1 ring-border rounded-xl px-4 py-6 sm:p-8">
            {actionData?.error && (
              <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">Connection Error</h3>
                    <div className="mt-2 text-sm text-destructive/90">
                      {actionData.error}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {actionData?.success && (
              <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-800">Success</h3>
                    <div className="mt-2 text-sm text-emerald-700">
                      {actionData.message}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Form 
              method="post" 
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
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
                          <SelectContent 
                            className="z-[100] bg-popover border border-border shadow-lg"
                          >
                            <SelectItem 
                              value="POSTGRES" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              PostgreSQL
                            </SelectItem>
                            <SelectItem 
                              value="MYSQL" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              MySQL
                            </SelectItem>
                            <SelectItem 
                              value="SQLITE" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              SQLite
                            </SelectItem>
                            <SelectItem 
                              value="MSSQL" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              Microsoft SQL Server
                            </SelectItem>
                            <SelectItem 
                              value="ORACLE" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              Oracle
                            </SelectItem>
                            <SelectItem 
                              value="MONGODB" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              MongoDB
                            </SelectItem>
                            <SelectItem 
                              value="REDIS" 
                              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              Redis
                            </SelectItem>
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
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={field.value || ''}
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
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isSubmitting || !form.formState.isValid}
                      variant="outline"
                      className="bg-background hover:bg-accent"
                    >
                      {isTesting ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateConnection}
                      disabled={isSubmitting || !form.formState.isValid}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
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
  );
}
