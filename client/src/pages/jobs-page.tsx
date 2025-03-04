import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Job, insertJobSchema } from "@shared/schema";
import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm({
    resolver: zodResolver(insertJobSchema),
    defaultValues: selectedJob || {
      title: "",
      company: user?.company || "",
      location: "",
      description: "",
      requirements: [],
      type: "Full-time",
      salary: "",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        selectedJob ? "PUT" : "POST",
        selectedJob ? `/api/jobs/${selectedJob.id}` : "/api/jobs",
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowJobDialog(false);
      setSelectedJob(null);
      form.reset();
      toast({
        title: `Job ${selectedJob ? "updated" : "created"} successfully`,
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job deleted successfully",
      });
    },
  });

  const applyForJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest("POST", `/api/jobs/${jobId}/apply`, {
        coverLetter: "",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application submitted successfully",
      });
    },
  });

  const filteredJobs = jobs?.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = form.handleSubmit((data) => {
    createJobMutation.mutate(data);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jobs</h1>
        {user?.role === "employer" && (
          <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
            <DialogTrigger asChild>
              <Button>Post New Job</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedJob ? "Edit Job" : "Create New Job"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border rounded"
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Range</FormLabel>
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
                        <FormLabel>Description</FormLabel>
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
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {selectedJob ? "Update Job" : "Create Job"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search jobs by title, company or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredJobs?.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={(jobId) => applyForJobMutation.mutate(jobId)}
            onEdit={(job) => {
              setSelectedJob(job);
              setShowJobDialog(true);
            }}
            onDelete={(jobId) => deleteJobMutation.mutate(jobId)}
          />
        ))}
      </div>
    </div>
  );
}
