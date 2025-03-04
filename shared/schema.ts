import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("jobseeker"),
  name: text("name"),
  email: text("email"),
  company: text("company"),
  title: text("title"),
  bio: text("bio"),
  location: text("location"),
  skills: text("skills").array(),
  experience: jsonb("experience")
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  type: text("type").notNull(),
  salary: text("salary"),
  createdAt: timestamp("created_at").defaultNow()
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow()
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("scheduled"),
  roomId: text("room_id").notNull(),
  recordingUrl: text("recording_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  company: true
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  location: true,
  description: true,
  requirements: true,
  type: true,
  salary: true
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  jobId: true,
  coverLetter: true
});

export const insertInterviewSchema = createInsertSchema(interviews).pick({
  applicationId: true,
  scheduledFor: true,
  duration: true,
  roomId: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;