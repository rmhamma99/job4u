import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const generatorSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  experience: z.string().transform(str => str.split('\n').filter(Boolean)),
  education: z.string().transform(str => str.split('\n').filter(Boolean)),
  skills: z.string().transform(str => str.split('\n').filter(Boolean)),
  targetPosition: z.string().optional(),
  companyName: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export default function AIGeneratorPage() {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState("");

  const form = useForm({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      fullName: "",
      experience: "",
      education: "",
      skills: "",
      targetPosition: "",
      companyName: "",
      additionalInfo: "",
    },
  });

  const generateCVMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/generate/cv", data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "CV generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate CV",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateCoverLetterMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/generate/cover-letter", data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "Cover letter generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate cover letter",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const tabValue = document.querySelector('[role="tablist"] [data-state="active"]')?.getAttribute('value');
    if (tabValue === 'cv') {
      generateCVMutation.mutate(data);
    } else {
      generateCoverLetterMutation.mutate(data);
    }
  });

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Document Generator</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Generate Documents</CardTitle>
              <CardDescription>
                Enter your information below to generate a professional CV or cover letter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cv">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="cv">CV</TabsTrigger>
                  <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                </TabsList>

                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
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

                    <TabsContent value="cover-letter">
                      <FormField
                        control={form.control}
                        name="targetPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Position</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyName"
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
                    </TabsContent>

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Experience (one per line)</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="w-full min-h-[100px] p-2 border rounded"
                              placeholder="- Senior Developer at Tech Corp (2020-Present)&#10;- Junior Developer at StartUp Inc (2018-2020)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education (one per line)</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="w-full min-h-[100px] p-2 border rounded"
                              placeholder="- Master's in Computer Science&#10;- Bachelor's in Software Engineering"
                            />
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
                          <FormLabel>Skills (one per line)</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="w-full min-h-[100px] p-2 border rounded"
                              placeholder="- JavaScript&#10;- React&#10;- Node.js"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="w-full min-h-[100px] p-2 border rounded"
                              placeholder="Any other relevant information..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={generateCVMutation.isPending || generateCoverLetterMutation.isPending}
                    >
                      {(generateCVMutation.isPending || generateCoverLetterMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generate Document
                    </Button>
                  </form>
                </Form>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Your generated document will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap font-mono text-sm">
                {generatedContent || "No content generated yet"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
