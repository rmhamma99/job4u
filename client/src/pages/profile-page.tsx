import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  skills: z.string().optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEmployer = user?.role === "employer";

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      title: user?.title || "",
      bio: user?.bio || "",
      location: user?.location || "",
      company: user?.company || "",
      skills: user?.skills?.join(", ") || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PUT", "/api/profile", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated successfully",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
    };
    updateProfileMutation.mutate(formattedData);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your profile information visible to {isEmployer ? "job seekers" : "employers"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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

              {!isEmployer && (
                <>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {isEmployer && (
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full p-2 border rounded min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
