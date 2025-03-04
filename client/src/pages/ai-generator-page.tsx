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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
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
  const [contentType, setContentType] = useState<"cv" | "cover-letter">("cv");
  const [photo, setPhoto] = useState<string | null>(null);

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

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCVMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/generate/cv", { ...data, photoBase64: photo });
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
    if (contentType === "cv") {
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
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="flex gap-4 mb-6">
                    <Button
                      type="button"
                      variant={contentType === "cv" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setContentType("cv")}
                    >
                      CV
                    </Button>
                    <Button
                      type="button"
                      variant={contentType === "cover-letter" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setContentType("cover-letter")}
                    >
                      Cover Letter
                    </Button>
                  </div>

                  {contentType === "cv" && (
                    <div className="mb-4">
                      <FormLabel>Photo (Optional)</FormLabel>
                      <div className="mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="cursor-pointer"
                        />
                      </div>
                      {photo && (
                        <div className="mt-2">
                          <img
                            src={photo}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}

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

                  {contentType === "cover-letter" && (
                    <>
                      <FormField
                        control={form.control}
                        name="targetPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Position (Optional)</FormLabel>
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
                            <FormLabel>Company Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

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
                        <FormLabel>Additional Information (Optional)</FormLabel>
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
                    Generate {contentType === "cv" ? "CV" : "Cover Letter"}
                  </Button>
                </form>
              </Form>
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