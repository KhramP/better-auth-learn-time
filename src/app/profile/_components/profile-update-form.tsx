"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export function ProfileUpdateForm({ user }: { user: { email: string; name: string } }) {
  const router = useRouter();

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  });

  const { isSubmitting } = form.formState;

  async function handleProfileUpdate(data: ProfileUpdateForm) {
    const promises = [
      authClient.updateUser({
        name: data.name,
      }),
    ];

    if (data.email !== user.email) {
      promises.push(authClient.changeEmail({ newEmail: data.email, callbackURL: "/profile" }));
    }

    const res = await Promise.all(promises);

    const updatedUserResult = res[0];
    const emailResult = res[1] ?? { error: false };

    if (updatedUserResult.error) {
      toast.error(updatedUserResult.error.message || "Failed to update profile");
    } else if (emailResult.error) {
      toast.error(emailResult.error.message || "Failed to change email");
    } else {
      if (data.email !== user.email) {
        toast.success("Verify your new email address to complete the change.");
      } else {
        toast.success("Profile updated!");
      }
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleProfileUpdate)}>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
          <LoadingSwap isLoading={isSubmitting}>Update Profile</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
