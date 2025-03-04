import { Job, Application } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Clock, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface JobCardProps {
  job: Job;
  application?: Application;
  onApply?: (jobId: number) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: number) => void;
}

export default function JobCard({
  job,
  application,
  onApply,
  onEdit,
  onDelete,
}: JobCardProps) {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";
  const isOwner = isEmployer && job.employerId === user.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <div className="flex items-center text-muted-foreground mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
          <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            {job.salary && (
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                {job.salary}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
            </div>
          </div>

          <p className="text-sm line-clamp-3">{job.description}</p>

          {job.requirements && job.requirements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((req, index) => (
                <Badge key={index} variant="outline">
                  {req}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isOwner ? (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onEdit?.(job)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete?.(job.id)}>
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {application ? (
              <Badge variant="secondary">
                Status: {application.status}
              </Badge>
            ) : (
              <Button onClick={() => onApply?.(job.id)}>Apply Now</Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
