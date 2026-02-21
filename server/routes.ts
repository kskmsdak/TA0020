import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes, authStorage } from "./replit_integrations/auth";
import { openai } from "./replit_integrations/audio/client"; // reusing configured openai client
import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the database with initial demo data
  await seedDatabase();

  // 1. Setup Auth routes BEFORE API routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. User & Roles API
  app.get(api.users.me.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      
      res.status(200).json({
        user,
        profile: profile || null
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.users.updateRole.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.users.updateRole.input.parse(req.body);
      const userId = req.user.claims.sub;
      await storage.setUserProfileRole(userId, input.role);
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post("/api/users/reset-role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearUserProfileRole(userId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal error" });
    }
  });

  // 3. Reports API
  app.get(api.reports.list.path, isAuthenticated, async (req, res) => {
    const reports = await storage.getAllReports();
    res.json(reports);
  });

  app.get(api.reports.listMyReports.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const reports = await storage.getReportsByUser(userId);
    res.json(reports);
  });

  app.get(api.reports.listAvailableContracts.path, isAuthenticated, async (req, res) => {
    const contracts = await storage.getAvailableContracts();
    res.json(contracts);
  });

  app.get(api.reports.get.path, isAuthenticated, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  });

  app.post(api.reports.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const report = await storage.createReport({ ...input, userId });
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.patch(api.reports.updateStatus.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.reports.updateStatus.input.parse(req.body);
      const report = await storage.updateReportStatus(Number(req.params.id), input.status);
      res.status(200).json(report);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.reports.assignContractor.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.reports.assignContractor.input.parse(req.body);
      const report = await storage.assignContractor(Number(req.params.id), input as any);
      res.status(200).json(report);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.reports.submitFeedback.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.reports.submitFeedback.input.parse(req.body);
      const report = await storage.submitFeedback(Number(req.params.id), input);
      res.status(200).json(report);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // 4. AI Generation Route
  app.post(api.reports.generateAi.path, isAuthenticated, async (req, res) => {
    try {
      const { prompt } = api.reports.generateAi.input.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { 
            role: "system", 
            content: `You are a civic audit assistant. Extract details from the user's report into a JSON object with these exact keys: "area", "complaintType", "description", "estimatedImpact", "fundMisuseEstimate". If a field is missing or unclear, make a reasonable guess based on context or put "Not specified". Make it professional.`
          },
          { role: "user", content: prompt }
        ]
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json({
        area: data.area || "Unknown",
        complaintType: data.complaintType || "General",
        description: data.description || prompt,
        estimatedImpact: data.estimatedImpact || "Medium",
        fundMisuseEstimate: data.fundMisuseEstimate || "None"
      });

    } catch (err) {
      console.error("AI Generation Error", err);
      res.status(500).json({ message: "Failed to generate report using AI." });
    }
  });

  // 5. Blockchain verification
  app.get(api.reports.verifyBlockchain.path, async (req, res) => {
    const reports = await storage.getAllReports();
    // Sort ascending to verify chain
    reports.sort((a, b) => a.id - b.id);
    
    let isValid = true;
    let invalidBlocks: number[] = [];
    
    for (let i = 1; i < reports.length; i++) {
      const current = reports[i];
      const previous = reports[i-1];
      
      // Check if previousHash matches actual previous block's currentHash
      if (current.previousHash !== previous.currentHash) {
        isValid = false;
        invalidBlocks.push(current.id);
      }
    }
    
    res.json({ isValid, invalidBlocks });
  });

  return httpServer;
}
