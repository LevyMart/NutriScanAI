import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./openai";
import { insertFoodAnalysisSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure API routes
  app.post("/api/analyze-food", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== "string") {
        return res.status(400).json({ message: "Missing or invalid image data" });
      }
      
      // Extract base64 data from image string - handles format "data:image/jpeg;base64,<actual-base64>"
      const base64Data = image.includes("base64,") 
        ? image.split("base64,")[1] 
        : image;
      
      // Analyze the image with OpenAI
      const analysisResult = await analyzeFoodImage(base64Data);
      
      return res.status(200).json(analysisResult);
    } catch (error) {
      console.error("Error in analyze-food endpoint:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid response format", 
          details: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to analyze food image", 
        error: error.message 
      });
    }
  });

  // Save analysis to history
  app.post("/api/save-analysis", async (req: Request, res: Response) => {
    try {
      const analysisData = req.body;
      
      // Validate the incoming data
      const validData = insertFoodAnalysisSchema.parse({
        ...analysisData,
        foods: JSON.stringify(analysisData.foods || []),
        suggestions: JSON.stringify(analysisData.suggestions || []),
        createdAt: new Date(),
      });
      
      // Save analysis to storage
      const savedAnalysis = await storage.createFoodAnalysis(validData);
      
      return res.status(201).json(savedAnalysis);
    } catch (error) {
      console.error("Error saving analysis:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid analysis data", 
          details: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to save analysis", 
        error: error.message 
      });
    }
  });

  // Get analysis history
  app.get("/api/analysis-history", async (_req: Request, res: Response) => {
    try {
      const analyses = await storage.getFoodAnalyses();
      
      // Transform the data for frontend consumption
      const formattedAnalyses = analyses.map(analysis => ({
        ...analysis,
        foods: JSON.parse(analysis.foods),
        suggestions: JSON.parse(analysis.suggestions),
      }));
      
      return res.status(200).json(formattedAnalyses);
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      return res.status(500).json({ 
        message: "Failed to fetch analysis history", 
        error: error.message 
      });
    }
  });

  // Get a specific analysis by ID
  app.get("/api/analysis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      
      const analysis = await storage.getFoodAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      // Transform the data for frontend consumption
      const formattedAnalysis = {
        ...analysis,
        foods: JSON.parse(analysis.foods),
        suggestions: JSON.parse(analysis.suggestions),
      };
      
      return res.status(200).json(formattedAnalysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      return res.status(500).json({ 
        message: "Failed to fetch analysis", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
