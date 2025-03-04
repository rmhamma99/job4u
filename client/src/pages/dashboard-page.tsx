import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Job, Application } from "@shared/schema";
import JobCard from "@/components/job-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";

  const { data: applications, isLoading: isLoadingApplications } = useQuery<
    Application[]
  >({
    queryKey: ["/api/applications"],
  });

  const { data: jobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs", isEmployer ? { employerId: user?.id } : {}],
  });

  if (isLoadingApplications || isLoadingJobs) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-muted-foreground">
          {isEmployer ? "Employer View" : "Job Seeker View"}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEmployer ? "Active Job Posts" : "Applications"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isEmployer ? jobs?.length : applications?.length}
            </div>
          </CardContent>
        </Card>

        {isEmployer && (
          <Card>
            <CardHeader>
              <CardTitle>Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications?.length || 0}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">
          {isEmployer ? "Your Job Posts" : "Your Applications"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {isEmployer
            ? jobs?.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  application={applications?.find((a) => a.jobId === job.id)}
                />
              ))
            : applications?.map((application) => {
                const job = jobs?.find((j) => j.id === application.jobId);
                return job ? (
                  <JobCard
                    key={application.id}
                    job={job}
                    application={application}
                  />
                ) : null;
              })}
        </div>
      </div>
    </div>
  );
}
