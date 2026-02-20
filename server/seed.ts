import { db } from "./db";
import { userProfiles, reports } from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function seedDatabase() {
  console.log("Seeding database...");
  
  // 1. Create Demo Users
  const demoUsers = [
    { email: "citizen@test.com", firstName: "Demo", lastName: "Citizen", role: "citizen" },
    { email: "contractor@test.com", firstName: "Demo", lastName: "Contractor", role: "contractor" },
    { email: "admin@test.com", firstName: "Demo", lastName: "Admin", role: "admin" }
  ];

  const createdUsers = [];

  for (const u of demoUsers) {
    // Check if user already exists
    let [existingUser] = await db.select().from(users).where(eq(users.email, u.email));
    
    if (!existingUser) {
      console.log(`Creating user ${u.email}...`);
      [existingUser] = await db.insert(users).values({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
      }).returning();
    }
    
    // Check/create profile
    let [existingProfile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, existingUser.id!));
    if (!existingProfile) {
      console.log(`Creating profile for ${u.email} as ${u.role}...`);
      await db.insert(userProfiles).values({
        userId: existingUser.id!,
        role: u.role
      });
    }

    createdUsers.push(existingUser);
  }

  // 2. Create Demo Reports
  const [existingReports] = await db.select().from(reports).limit(1);
  if (!existingReports) {
    console.log("Creating demo reports...");
    const citizen = createdUsers[0];
    const contractor = createdUsers[1];

    const demoReports = [
      {
        userId: citizen.id!,
        area: "Downtown Ward",
        complaintType: "broken road",
        description: "Large pothole on Main St causing traffic delays.",
        estimatedImpact: "Medium",
        severityScore: 30, // broken = 30 + Medium = 10
        status: "Report Sent",
        previousHash: "0"
      },
      {
        userId: citizen.id!,
        area: "North District",
        complaintType: "water leakage",
        description: "Main pipe burst near the park, massive water loss.",
        estimatedImpact: "High",
        severityScore: 50, // High = 20 + leakage = 30
        status: "Admin Verified",
      },
      {
        userId: citizen.id!,
        area: "West End",
        complaintType: "sewage overflow",
        description: "Sewage contamination in residential area.",
        estimatedImpact: "High",
        severityScore: 70, // sewage overflow = 50 + High = 20
        status: "Budget Allocated",
      }
    ];

    let lastHash = "0";
    for (const r of demoReports) {
      const dataString = `${r.area}${r.complaintType}${r.description}${r.estimatedImpact}${r.severityScore}${lastHash}`;
      const currentHash = crypto.createHash('sha256').update(dataString).digest('hex');
      
      const [report] = await db.insert(reports).values({
        ...r,
        previousHash: lastHash,
        currentHash
      }).returning();
      
      lastHash = currentHash;
    }
  }

  console.log("Database seeding completed.");
}
