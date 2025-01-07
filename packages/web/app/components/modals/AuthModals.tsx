import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useFetcher } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form as ShadForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

const CONNECTION_TYPES = [
  "POSTGRES", 
  "MYSQL", 
  "SQLITE", 
  "MSSQL", 
  "ORACLE", 
  "MONGODB", 
  "REDIS"
] as const;

const BaseConnectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(CONNECTION_TYPES),
});

const StandardConnectionSchema = BaseConnectionSchema.extend({
  type: z.enum(["POSTGRES", "MYSQL", "MSSQL", "ORACLE"]),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().optional().default(false),
});

const MongoDBConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("MONGODB"),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().optional().default(false),
  authSource: z.string().optional(),
  replicaSet: z.string().optional(),
});

const RedisConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("REDIS"),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.coerce.number().optional(),
  ssl: z.boolean().optional().default(false),
});

const SQLiteConnectionSchema = BaseConnectionSchema.extend({
  type: z.literal("SQLITE"),
  filepath: z.string().min(1, "File path is required"),
});

const CreateConnectionSchema = z.discriminatedUnion("type", [
  StandardConnectionSchema,
  MongoDBConnectionSchema,
  RedisConnectionSchema,
  SQLiteConnectionSchema,
]);

type ConnectionFormSchema = z.infer<typeof CreateConnectionSchema>;

export function CreateConnectionDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const fetcher = useFetcher<{ connection?: any; error?: string }>();
  
  const form = useForm<ConnectionFormSchema>({
    resolver: zodResolver(CreateConnectionSchema),
    defaultValues: {
      name: "",
      type: "POSTGRES",
      host: "localhost",
      port: Number(5432),
      database: "",
      username: "",
      password: "",
      ssl: false,
    },
  });

  async function testConnection(data: ConnectionFormSchema) {
    setTesting(true);
    setError(null);
    setConnectionSuccess(false);
    
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "is-test": "true",
        },
        body: JSON.stringify({
          ...data,
          // Normalize port to string
          port: String(data['port' as keyof ConnectionFormSchema]),
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to test connection");
      }
      
      setConnectionSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test connection");
    } finally {
      setTesting(false);
    }
  }

  function onSubmit(data: ConnectionFormSchema) {
    setError(null);
    fetcher.submit(
      { 
        ...data,
        // Convert port to number to ensure proper serialization
        port: Number(data['port' as keyof ConnectionFormSchema]),
      }, 
      {
        method: "POST",
        action: "/connections/new",
        encType: "application/x-www-form-urlencoded",
      }
    );
  }

  // Effect to handle fetcher state and errors
  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data?.error) {
        // Set error if the server returns an error
        setError(fetcher.data.error);
      } else if (fetcher.data?.connection) {
        // Successfully created connection
        setOpen(false);
        setConnectionSuccess(true);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Watch form changes to reset connection success
  useEffect(() => {
    // Reset connection success if form changes or error is present
    if (error || Object.keys(form.formState.errors).length > 0) {
      setConnectionSuccess(false);
    }
  }, [
    form.formState.isDirty, 
    form.formState.errors, 
    error, 
    setConnectionSuccess
  ]);

  const connectionType = form.watch("type");

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Reset states when dialog is closed
          setError(null);
          setConnectionSuccess(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="inline-flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-light-bg-primary dark:bg-dark-bg-secondary">
        <DialogHeader>
          <DialogTitle className="text-light-text-primary dark:text-dark-text-primary">
            Add New Database Connection
          </DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="flex items-center space-x-2">
             <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </div>
          </Alert>
        )}
        <AnimatePresence>
          {connectionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                variant="default" 
                className="flex items-center space-x-2"
              >
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  <AlertDescription className="text-green-700">
                    Connected!
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <ShadForm {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {CONNECTION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(connectionType === "POSTGRES" || 
              connectionType === "MYSQL" || 
              connectionType === "MSSQL" || 
              connectionType === "ORACLE" ||
              connectionType === "MONGODB" ||
              connectionType === "REDIS") && (
              <>
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ssl"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value} 
                          onChange={(e) => field.onChange(e.target.checked)} 
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormLabel>Use SSL</FormLabel>
                    </FormItem>
                  )}
                />
              </>
            )}

            {connectionType === "SQLITE" && (
              <FormField
                control={form.control}
                name="filepath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Path</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => form.handleSubmit(testConnection)()}
                disabled={testing}
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "Creating..." : "Create Connection"}
              </Button>
            </div>
          </form>
        </ShadForm>
      </DialogContent>
    </Dialog>
  );
}

export function CreateOrgDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetcher = useFetcher();

  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Organization name is required"),
        description: z.string().optional(),
      })
    ),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: { name: string; description?: string }) {
    fetcher.submit(data, {
      method: "POST",
      action: "/organizations/new",
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-light-bg-primary dark:bg-dark-bg-secondary">
        <DialogHeader>
          <DialogTitle className="text-light-text-primary dark:text-dark-text-primary">
            Create New Organization
          </DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ShadForm {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Create Organization
            </Button>
          </form>
        </ShadForm>
      </DialogContent>
    </Dialog>
  );
}
