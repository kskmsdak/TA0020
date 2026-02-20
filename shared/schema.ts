import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { sql } from "drizzle-orm";

// Re-export auth schemas
export * from "./models/auth";
export * from "./models/chat"; // Added by AI integration

// Users roles definition
export const userRoles = ['citizen', 'contractor', 'admin'] as const;
export const zUserRole = z.enum(userRoles);

// Note: the `users` table is defined in models/auth.ts
// We might need to extend the User type with a role, or just use a separate table/field if we could.
// For simplicity, we'll assume the role is determined by email (e.g. admin@test.com) or we'll add a profile table.
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("citizen"), // citizen, contractor, admin
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// Blockchain structure
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  
  // Report Details
  area: text("area").notNull(),
  complaintType: text("complaint_type").notNull(), // broken road, garbage, etc.
  description: text("description").notNull(),
  estimatedImpact: text("estimated_impact").notNull(),
  fundMisuseEstimate: text("fund_misuse_estimate"),
  
  // AI Generated fields
  aiSummary: text("ai_summary"),
  severityScore: integer("severity_score").notNull().default(0),
  
  // Status tracking
  status: text("status").notNull().default("Report Sent"), // Report Sent, Received, Admin Verified, Budget Allocated, Contractor Selected, Work Started, Work Completed, Feedback Submitted
  
  // Contract / Assignment details
  contractorId: text("contractor_id").references(() => users.id),
  budget: integer("budget"),
  duration: text("duration"),
  requiredSkills: text("required_skills"),
  
  // Rating and Feedback (After completion)
  citizenRating: integer("citizen_rating"),
  citizenFeedback: text("citizen_feedback"),
  
  // Blockchain metadata
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  previousHash: text("previous_hash"),
  currentHash: text("current_hash"),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  timestamp: true,
  previousHash: true,
  currentHash: true,
  aiSummary: true,
  severityScore: true,
  status: true,
  contractorId: true,
  budget: true,
  duration: true,
  requiredSkills: true,
  citizenRating: true,
  citizenFeedback: true
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type UpdateReportStatusRequest = {
  status: string;
};

export type AssignContractorRequest = {
  contractorId: string;
  budget: number;
  duration: string;
  requiredSkills: string;
};

export type SubmitFeedbackRequest = {
  rating: number;
  feedback: string;
};

// AI assistant report generation request
export type GenerateReportRequest = {
  chatContext: string; // The chat history string or context
};

export type GenerateReportResponse = {
  area: string;
  complaintType: string;
  description: string;
  estimatedImpact: string;
  fundMisuseEstimate?: string;
};
