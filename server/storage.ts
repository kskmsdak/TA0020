import { db } from "./db";
import {
  reports,
  type Report,
  type InsertReport,
  type UpdateReportStatusRequest,
  type AssignContractorRequest,
  type SubmitFeedbackRequest,
  userProfiles,
  type UserProfile
} from "@shared/schema";
import { eq, desc, isNull } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  setUserProfileRole(userId: string, role: string): Promise<UserProfile>;

  // Reports
  getAllReports(): Promise<Report[]>;
  getReportsByUser(userId: string): Promise<Report[]>;
  getAvailableContracts(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport & { userId: string, previousHash?: string, currentHash?: string }): Promise<Report>;
  updateReportStatus(id: number, status: string): Promise<Report>;
  assignContractor(id: number, data: AssignContractorRequest): Promise<Report>;
  submitFeedback(id: number, data: SubmitFeedbackRequest): Promise<Report>;

  // Blockchain
  getLatestReport(): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async setUserProfileRole(userId: string, role: string): Promise<UserProfile> {
    const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (existing) {
      const [profile] = await db.update(userProfiles).set({ role }).where(eq(userProfiles.userId, userId)).returning();
      return profile;
    } else {
      const [profile] = await db.insert(userProfiles).values({ userId, role }).returning();
      return profile;
    }
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.timestamp));
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.userId, userId)).orderBy(desc(reports.timestamp));
  }

  async getAvailableContracts(): Promise<Report[]> {
    // Return reports that are "Budget Allocated" and have no contractor assigned
    return await db.select().from(reports).where(eq(reports.status, "Budget Allocated")).orderBy(desc(reports.timestamp));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getLatestReport(): Promise<Report | undefined> {
    const [latest] = await db.select().from(reports).orderBy(desc(reports.id)).limit(1);
    return latest;
  }

  async createReport(insertReport: InsertReport & { userId: string }): Promise<Report> {
    // 1. Calculate Severity Score based on keyword logic
    const score = calculateSeverityScore(insertReport);

    // 2. Hash chaining (Blockchain simulation)
    const latest = await this.getLatestReport();
    const previousHash = latest?.currentHash || "0";
    
    // Hash = SHA256(all fields + previous_hash)
    const dataString = `${insertReport.area}${insertReport.complaintType}${insertReport.description}${insertReport.estimatedImpact}${score}${previousHash}`;
    const currentHash = crypto.createHash('sha256').update(dataString).digest('hex');

    const [report] = await db.insert(reports).values({
      ...insertReport,
      severityScore: score,
      previousHash,
      currentHash
    }).returning();
    
    return report;
  }

  async updateReportStatus(id: number, status: string): Promise<Report> {
    const [updated] = await db.update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async assignContractor(id: number, data: AssignContractorRequest): Promise<Report> {
    const [updated] = await db.update(reports)
      .set({
        contractorId: data.contractorId,
        budget: data.budget,
        duration: data.duration,
        requiredSkills: data.requiredSkills,
        status: "Contractor Selected"
      })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async submitFeedback(id: number, data: SubmitFeedbackRequest): Promise<Report> {
    const [updated] = await db.update(reports)
      .set({
        citizenRating: data.rating,
        citizenFeedback: data.feedback,
        status: "Feedback Submitted"
      })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();

function calculateSeverityScore(report: InsertReport): number {
  let score = 0;
  const content = `${report.complaintType} ${report.description}`.toLowerCase();
  
  // High weights
  if (content.includes('collapse') || content.includes('danger') || content.includes('sewage overflow') || content.includes('contamination')) {
    score += 50;
  }
  
  // Medium weights
  if (content.includes('broken') || content.includes('leakage') || content.includes('garbage')) {
    score += 30;
  }
  
  // Low weights
  if (content.includes('delay') || content.includes('slow')) {
    score += 10;
  }

  // Adding urgency base value depending on estimated impact
  if (report.estimatedImpact.toLowerCase().includes('high')) score += 20;
  else if (report.estimatedImpact.toLowerCase().includes('medium')) score += 10;
  
  return score;
}
