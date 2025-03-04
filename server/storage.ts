import { User, InsertUser, Job, Application, insertJobSchema, insertApplicationSchema } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  createJob(job: Omit<Job, "id" | "createdAt">): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: Partial<Job>): Promise<Job[]>;
  updateJob(id: number, data: Partial<Job>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  createApplication(application: Omit<Application, "id" | "createdAt">): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getUserApplications(userId: number): Promise<Application[]>;
  getJobApplications(jobId: number): Promise<Application[]>;
  updateApplication(id: number, data: Partial<Application>): Promise<Application>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  sessionStore: session.Store;
  private userId: number;
  private jobId: number;
  private applicationId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.userId = 1;
    this.jobId = 1;
    this.applicationId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async createJob(job: Omit<Job, "id" | "createdAt">): Promise<Job> {
    const id = this.jobId++;
    const newJob = { ...job, id, createdAt: new Date() };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(filters?: Partial<Job>): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    if (filters) {
      jobs = jobs.filter(job => 
        Object.entries(filters).every(([key, value]) => 
          job[key as keyof Job] === value
        )
      );
    }
    return jobs;
  }

  async updateJob(id: number, data: Partial<Job>): Promise<Job> {
    const job = await this.getJob(id);
    if (!job) throw new Error("Job not found");
    const updated = { ...job, ...data };
    this.jobs.set(id, updated);
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    this.jobs.delete(id);
  }

  async createApplication(application: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const id = this.applicationId++;
    const newApplication = { ...application, id, createdAt: new Date() };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      app => app.userId === userId
    );
  }

  async getJobApplications(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      app => app.jobId === jobId
    );
  }

  async updateApplication(id: number, data: Partial<Application>): Promise<Application> {
    const application = await this.getApplication(id);
    if (!application) throw new Error("Application not found");
    const updated = { ...application, ...data };
    this.applications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
