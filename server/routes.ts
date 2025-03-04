import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobSchema, insertApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Jobs API
  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getJobs(req.query);
    res.json(jobs);
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) return res.status(404).send("Job not found");
    res.json(job);
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "employer") {
      return res.status(403).send("Only employers can post jobs");
    }

    const parsed = insertJobSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const job = await storage.createJob({
      ...parsed.data,
      employerId: req.user.id
    });
    res.status(201).json(job);
  });

  app.put("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) return res.status(404).send("Job not found");
    if (!req.isAuthenticated() || job.employerId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const updated = await storage.updateJob(job.id, req.body);
    res.json(updated);
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) return res.status(404).send("Job not found");
    if (!req.isAuthenticated() || job.employerId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    await storage.deleteJob(job.id);
    res.sendStatus(204);
  });

  // Applications API
  app.post("/api/jobs/:id/apply", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "jobseeker") {
      return res.status(403).send("Only job seekers can apply");
    }

    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) return res.status(404).send("Job not found");

    const parsed = insertApplicationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const application = await storage.createApplication({
      ...parsed.data,
      jobId: job.id,
      userId: req.user.id
    });
    res.status(201).json(application);
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const applications = req.user.role === "employer" 
      ? await storage.getJobApplications(parseInt(req.query.jobId as string))
      : await storage.getUserApplications(req.user.id);
    
    res.json(applications);
  });

  app.put("/api/applications/:id", async (req, res) => {
    const application = await storage.getApplication(parseInt(req.params.id));
    if (!application) return res.status(404).send("Application not found");
    
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const job = await storage.getJob(application.jobId);
    if (!job) return res.status(404).send("Job not found");

    if (req.user.role === "employer" && job.employerId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    if (req.user.role === "jobseeker" && application.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const updated = await storage.updateApplication(application.id, req.body);
    res.json(updated);
  });

  // User Profile API
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const updated = await storage.updateUser(req.user.id, req.body);
    res.json(updated);
  });

  const httpServer = createServer(app);
  return httpServer;
}
