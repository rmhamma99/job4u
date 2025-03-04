import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobSchema, insertApplicationSchema } from "@shared/schema";
import { insertInterviewSchema } from "@shared/schema"; // Added import
import { generateCV, generateCoverLetter } from "./services/ai-generator";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Configure body parser to accept larger payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

  // Interview API
  app.post("/api/applications/:id/interview", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const application = await storage.getApplication(parseInt(req.params.id));
    if (!application) return res.status(404).send("Application not found");

    const job = await storage.getJob(application.jobId);
    if (!job) return res.status(404).send("Job not found");

    // Only employer who posted the job can schedule interviews
    if (req.user.role !== "employer" || job.employerId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const parsed = insertInterviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const interview = await storage.createInterview({
      ...parsed.data,
      applicationId: application.id
    });
    res.status(201).json(interview);
  });

  app.get("/api/applications/:id/interviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const application = await storage.getApplication(parseInt(req.params.id));
    if (!application) return res.status(404).send("Application not found");

    const job = await storage.getJob(application.jobId);
    if (!job) return res.status(404).send("Job not found");

    // Only the employer who posted the job or the applicant can view interviews
    if (!(
      (req.user.role === "employer" && job.employerId === req.user.id) ||
      (req.user.role === "jobseeker" && application.userId === req.user.id)
    )) {
      return res.status(403).send("Unauthorized");
    }

    const interviews = await storage.getApplicationInterviews(application.id);
    res.json(interviews);
  });

  app.put("/api/interviews/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    const interview = await storage.getInterview(parseInt(req.params.id));
    if (!interview) return res.status(404).send("Interview not found");

    const application = await storage.getApplication(interview.applicationId);
    if (!application) return res.status(404).send("Application not found");

    const job = await storage.getJob(application.jobId);
    if (!job) return res.status(404).send("Job not found");

    // Only the employer who posted the job can update interviews
    if (req.user.role !== "employer" || job.employerId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const updated = await storage.updateInterview(interview.id, req.body);
    res.json(updated);
  });

  // User Profile API
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const updated = await storage.updateUser(req.user.id, req.body);
    res.json(updated);
  });

  app.post("/api/generate/cv", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const cv = await generateCV(req.body);
      res.json({ content: cv });
    } catch (error: any) {
      console.error("CV Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate/cover-letter", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const coverLetter = await generateCoverLetter(req.body);
      res.json({ content: coverLetter });
    } catch (error: any) {
      console.error("Cover Letter Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}