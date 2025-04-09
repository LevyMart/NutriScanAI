import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Food analysis schema
export const foodAnalyses = pgTable("food_analyses", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  foods: text("foods").notNull(), // JSON string of identified foods
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(), // in grams
  carbs: integer("carbs").notNull(), // in grams
  fats: integer("fats").notNull(), // in grams
  fiber: integer("fiber").notNull(), // in grams
  analysis: text("analysis").notNull(), // Analysis text
  suggestions: text("suggestions").notNull(), // JSON string of suggestions
});

export const insertFoodAnalysisSchema = createInsertSchema(foodAnalyses).omit({
  id: true,
});

export type InsertFoodAnalysis = z.infer<typeof insertFoodAnalysisSchema>;
export type FoodAnalysis = typeof foodAnalyses.$inferSelect;

// API response schema for OpenAI
export const foodAnalysisResponseSchema = z.object({
  foods: z.array(z.string()),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
    fiber: z.number(),
  }),
  analysis: z.string(),
  suggestions: z.array(z.string()),
});

export type FoodAnalysisResponse = z.infer<typeof foodAnalysisResponseSchema>;
