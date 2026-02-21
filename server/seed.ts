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
  if (existingReports) {
    console.log("Cleaning existing reports for fresh seed...");
    await db.delete(reports);
  }

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
      severityScore: 30,
      status: "Report Sent",
    },
    {
      userId: citizen.id!,
      area: "North District",
      complaintType: "water leakage",
      description: "Main pipe burst near the park, massive water loss.",
      estimatedImpact: "High",
      severityScore: 50,
      status: "Admin Verified",
    },
    {
      userId: citizen.id!,
      area: "West End",
      complaintType: "sewage overflow",
      description: "Sewage contamination in residential area.",
      estimatedImpact: "High",
      severityScore: 70,
      status: "Budget Allocated",
      budget: 15000,
      duration: "3 weeks",
      requiredSkills: "Sanitation, plumbing"
    },
    {
      userId: citizen.id!,
      area: "Central Ward",
      complaintType: "street light",
      description: "Entire block of street lights not working for a week.",
      estimatedImpact: "Medium",
      severityScore: 40,
      status: "Contractor Selected",
      contractorId: contractor.id!,
      budget: 5000,
      duration: "1 week",
      requiredSkills: "Electrical"
    },
    {
      userId: citizen.id!,
      area: "East Side",
      complaintType: "garbage",
      description: "Illegal dumping site formed behind the school.",
      estimatedImpact: "Medium",
      severityScore: 45,
      status: "Work Started",
      contractorId: contractor.id!,
      budget: 3000,
      duration: "4 days",
      requiredSkills: "Waste management"
    },
    {
      userId: citizen.id!,
      area: "South Park",
      complaintType: "broken bench",
      description: "Several park benches broken by storm.",
      estimatedImpact: "Low",
      severityScore: 20,
      status: "Work Completed",
      contractorId: contractor.id!,
      budget: 1200,
      duration: "2 days",
      requiredSkills: "Carpentry"
    },
    {
      userId: citizen.id!,
      area: "Old Town",
      complaintType: "graffiti",
      description: "Historical building defaced with graffiti.",
      estimatedImpact: "Low",
      severityScore: 25,
      status: "Feedback Submitted",
      contractorId: contractor.id!,
      budget: 800,
      duration: "1 day",
      requiredSkills: "Restoration",
      citizenRating: 5,
      citizenFeedback: "Excellent restoration work, building looks original again!"
    }
  ];

  let lastHash = "0";
  for (const r of demoReports) {
    const dataString = `${r.area}${r.complaintType}${r.description}${r.estimatedImpact}${r.severityScore}${lastHash}`;
    const currentHash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    await db.insert(reports).values({
      ...r,
      previousHash: lastHash,
      currentHash
    });
    
    lastHash = currentHash;
  }

  console.log("Database seeding completed.");
}
