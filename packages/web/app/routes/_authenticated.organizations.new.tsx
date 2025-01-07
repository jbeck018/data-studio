import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useFetcher, useFormAction } from "@remix-run/react";
import { requireUser } from "../lib/auth/session.server";
import { createOrganization } from "../lib/organizations/organizations.server";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "../components/ui/textarea";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
});

type FormSchema = z.infer<typeof CreateOrganizationSchema>;

export type ActionData = {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      name?: string[];
      slug?: string[];
      description?: string[];
    };
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const name = formData.get("name");
    const slug = formData.get("slug");
    const description = formData.get("description");

    const result = CreateOrganizationSchema.safeParse({ name, slug, description });
    if (!result.success) {
      return { errors: result.error.flatten(), status: 400 };
    }

    const organization = await createOrganization(
      result.data.name,
      user.id,
    );

    console.log('Organization created:', organization);

    return redirect(`/organizations/${organization.id}`);
  } catch (error) {
    console.error('Error creating organization:', error);
    return {
      errors: {
        formErrors: ['Failed to create organization. Please try again.']
      }, status: 500 };
  }
}

export default function NewOrganizationPage() {
  const { Form, submit } = useFetcher();
  const actionData = useActionData<ActionData>();
  const action = useFormAction();
  const form = useForm<FormSchema>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    return submit(data, {
      method: "post",
      action,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-semibold mb-6">Create Organization</h1>

        {actionData?.errors?.formErrors ? (
          <div className="rounded-md bg-destructive/15 p-4 mb-6">
            <div className="flex">
              <div className="text-sm text-destructive">
                {actionData.errors.formErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <Form method="post" onSubmit={form.handleSubmit(onSubmit)}>
          <ShadForm {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} pattern="[a-z0-9-]+" />
                    </FormControl>
                    <FormDescription>
                      Only lowercase letters, numbers, and hyphens are allowed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">
                  Create Organization
                </Button>
              </div>
            </div>
          </ShadForm>
        </Form>
      </div>
    </div>
  );
}
