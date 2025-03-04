import { users, jobs, applications } from "@shared/schema";
import type { User, InsertUser, Job, Application } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db, pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      skills: [],
      experience: null,
    }).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createJob(job: Omit<Job, "id" | "createdAt">): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values(job)
      .returning();
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobs(filters?: Partial<Job>): Promise<Job[]> {
    let query = db.select().from(jobs);

    if (filters) {
      const conditions = Object.entries(filters).map(([key, value]) => 
        eq(jobs[key as keyof typeof jobs], value)
      );
      if (conditions.length > 0) {
        query = query.where(conditions[0]); 
      }
    }

    return await query;
  }

  async updateJob(id: number, data: Partial<Job>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set(data)
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async createApplication(application: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async getJobApplications(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async updateApplication(id: number, data: Partial<Application>): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set(data)
      .where(eq(applications.id, id))
      .returning();
    return application;
  }
}

export const storage = new DatabaseStorage();