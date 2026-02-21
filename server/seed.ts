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
      area: "Ward 12 – Shastri Nagar",
      complaintType: "Broken Road / Potholes",
      description: "Severe potholes have developed on the main road near Shastri Nagar Bus Stop in Ward 12. The road was reportedly repaired 4 months ago, but due to poor construction quality, the surface has deteriorated again. During rainfall, the potholes fill with water, making them invisible and increasing the risk of accidents. Several two-wheeler riders have already slipped in this area. Local residents believe substandard materials may have been used during the previous repair work.",
      estimatedImpact: "High – Risk of road accidents, vehicle damage, and traffic congestion.",
      fundMisuseEstimate: "Approx. ₹8,00,000 may have been allocated for the previous repair work.",
      severityScore: 9,
      status: "Report Sent",
    },
    {
      userId: citizen.id!,
      area: "Mumbai Ward 7",
      complaintType: "broken road",
      description: "Large pothole on Western Express Highway near Goregaon, causing major traffic jams during monsoon.",
      estimatedImpact: "High",
      severityScore: 4,
      status: "Report Sent",
    },
    {
      userId: citizen.id!,
      area: "Delhi North",
      complaintType: "water leakage",
      description: "Main water pipeline burst near Rohini Sector 15, causing flooding in the residential area.",
      estimatedImpact: "High",
      severityScore: 50,
      status: "Admin Verified",
    },
    {
      userId: citizen.id!,
      area: "Bangalore East",
      complaintType: "garbage",
      description: "Unauthorized garbage dumping in Bellandur lake area, causing severe health concerns.",
      estimatedImpact: "High",
      severityScore: 60,
      status: "Budget Allocated",
      budget: 250000,
      duration: "4 weeks",
      requiredSkills: "Waste Management, Environmental Safety"
    },
    {
      userId: citizen.id!,
      area: "Hyderabad Central",
      complaintType: "street light",
      description: "Dark spots on Banjara Hills Road No. 12 due to non-functional street lights for 10 days.",
      estimatedImpact: "Medium",
      severityScore: 35,
      status: "Contractor Selected",
      contractorId: contractor.id!,
      budget: 45000,
      duration: "1 week",
      requiredSkills: "Electrical Maintenance"
    },
    {
      userId: citizen.id!,
      area: "Chennai South",
      complaintType: "sewage overflow",
      description: "Drainage blockage and sewage overflow in Adyar near the bus terminus.",
      estimatedImpact: "High",
      severityScore: 70,
      status: "Work Started",
      contractorId: contractor.id!,
      budget: 120000,
      duration: "2 weeks",
      requiredSkills: "Sanitation, Plumbing"
    },
    {
      userId: citizen.id!,
      area: "Kolkata West",
      complaintType: "broken bench",
      description: "Damaged public seating in Victoria Memorial gardens.",
      estimatedImpact: "Low",
      severityScore: 15,
      status: "Work Completed",
      contractorId: contractor.id!,
      budget: 15000,
      duration: "3 days",
      requiredSkills: "Carpentry"
    },
    {
      userId: citizen.id!,
      area: "Pune Metro",
      complaintType: "graffiti",
      description: "Vandalism on historical Shaniwar Wada walls.",
      estimatedImpact: "Medium",
      severityScore: 25,
      status: "Feedback Submitted",
      contractorId: contractor.id!,
      budget: 8000,
      duration: "2 days",
      requiredSkills: "Restoration"
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
