import { pgTable, text, serial, integer, boolean, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Configurações de idioma
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // pt, en, es
  name: text("name").notNull(),
});

// Usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  prefLanguage: text("pref_language").default("pt").notNull(), // pt, en, es
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  profileImage: text("profile_image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  nutritionProfiles: many(nutritionProfiles),
  foodAnalyses: many(foodAnalyses),
  dailyNutritionLogs: many(dailyNutritionLogs),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  prefLanguage: true,
});

// Perfil nutricional e metas
export const nutritionProfiles = pgTable("nutrition_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weight: real("weight"), // kg
  height: real("height"), // cm
  age: integer("age"),
  gender: text("gender"), // male, female, other
  activityLevel: text("activity_level"), // sedentary, light, moderate, active, very_active
  goal: text("goal"), // lose_weight, maintain, gain_muscle
  targetCalories: integer("target_calories"),
  targetProtein: integer("target_protein"), // g
  targetCarbs: integer("target_carbs"), // g
  targetFats: integer("target_fats"), // g
  targetFiber: integer("target_fiber"), // g
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const nutritionProfilesRelations = relations(nutritionProfiles, ({ one }) => ({
  user: one(users, {
    fields: [nutritionProfiles.userId],
    references: [users.id],
  }),
}));

export const insertNutritionProfileSchema = createInsertSchema(nutritionProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Log diário de nutrição
export const dailyNutritionLogs = pgTable("daily_nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  totalCalories: integer("total_calories").default(0).notNull(),
  totalProtein: integer("total_protein").default(0).notNull(), // g
  totalCarbs: integer("total_carbs").default(0).notNull(), // g
  totalFats: integer("total_fats").default(0).notNull(), // g
  totalFiber: integer("total_fiber").default(0).notNull(), // g
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const dailyNutritionLogsRelations = relations(dailyNutritionLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyNutritionLogs.userId],
    references: [users.id],
  }),
  foodEntries: many(foodAnalyses),
}));

export const insertDailyNutritionLogSchema = createInsertSchema(dailyNutritionLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Análise de alimentos
export const foodAnalyses = pgTable("food_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  dailyLogId: integer("daily_log_id").references(() => dailyNutritionLogs.id),
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
  language: text("language").default("pt").notNull(), // Idioma da análise
  mealType: text("meal_type"), // breakfast, lunch, dinner, snack
  servingSize: real("serving_size"), // in grams
  servings: real("servings").default(1),
});

export const insertFoodAnalysisSchema = createInsertSchema(foodAnalyses).omit({
  id: true,
});

export type InsertFoodAnalysis = z.infer<typeof insertFoodAnalysisSchema>;
export type FoodAnalysis = typeof foodAnalyses.$inferSelect;

// API response schema for OpenAI
export const foodAnalysesRelations = relations(foodAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [foodAnalyses.userId],
    references: [users.id],
  }),
  dailyLog: one(dailyNutritionLogs, {
    fields: [foodAnalyses.dailyLogId],
    references: [dailyNutritionLogs.id],
  }),
}));

// Tipos para novas tabelas


export type NutritionProfile = typeof nutritionProfiles.$inferSelect;
export type InsertNutritionProfile = z.infer<typeof insertNutritionProfileSchema>;

export type DailyNutritionLog = typeof dailyNutritionLogs.$inferSelect;
export type InsertDailyNutritionLog = z.infer<typeof insertDailyNutritionLogSchema>;

export type Language = typeof languages.$inferSelect;

// Esquema de resposta da API do OpenAI aprimorado
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
  // Novos campos para análise mais detalhada
  foodDetails: z.array(z.object({
    name: z.string(),
    quantity: z.string().optional(),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fats: z.number().optional(),
    fiber: z.number().optional(),
  })).optional(),
});

export type FoodAnalysisResponse = z.infer<typeof foodAnalysisResponseSchema>;
