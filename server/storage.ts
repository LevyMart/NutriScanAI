import * as schema from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, SQL, sql } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, data: Partial<schema.InsertUser>): Promise<schema.User | undefined>;
  
  // Análise de alimentos
  createFoodAnalysis(analysis: schema.InsertFoodAnalysis): Promise<schema.FoodAnalysis>;
  updateFoodAnalysis(id: number, data: Partial<schema.InsertFoodAnalysis>): Promise<schema.FoodAnalysis | undefined>;
  getFoodAnalyses(limit?: number, userId?: number): Promise<schema.FoodAnalysis[]>;
  getFoodAnalysis(id: number): Promise<schema.FoodAnalysis | undefined>;
  getFoodAnalysesByDate(userId: number, startDate: Date, endDate: Date): Promise<schema.FoodAnalysis[]>;
  
  // Perfil nutricional
  createNutritionProfile(profile: schema.InsertNutritionProfile): Promise<schema.NutritionProfile>;
  getNutritionProfile(userId: number): Promise<schema.NutritionProfile | undefined>;
  updateNutritionProfile(userId: number, data: Partial<schema.InsertNutritionProfile>): Promise<schema.NutritionProfile | undefined>;
  
  // Log diário de nutrição
  createOrUpdateDailyLog(log: schema.InsertDailyNutritionLog): Promise<schema.DailyNutritionLog>;
  getDailyLog(userId: number, date: Date): Promise<schema.DailyNutritionLog | undefined>;
  getDailyLogs(userId: number, startDate: Date, endDate: Date): Promise<schema.DailyNutritionLog[]>;
  
  // Idiomas
  getLanguages(): Promise<schema.Language[]>;
  getLanguageByCode(code: string): Promise<schema.Language | undefined>;
}

// Implementação de armazenamento em banco de dados PostgreSQL
export class DatabaseStorage implements IStorage {
  // Usuários
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: schema.InsertUser): Promise<schema.User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<schema.InsertUser>): Promise<schema.User | undefined> {
    const [updatedUser] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  // Análise de alimentos
  async createFoodAnalysis(insertAnalysis: schema.InsertFoodAnalysis): Promise<schema.FoodAnalysis> {
    const [analysis] = await db.insert(schema.foodAnalyses).values(insertAnalysis).returning();
    return analysis;
  }
  
  async updateFoodAnalysis(id: number, data: Partial<schema.InsertFoodAnalysis>): Promise<schema.FoodAnalysis | undefined> {
    const [updatedAnalysis] = await db
      .update(schema.foodAnalyses)
      .set(data)
      .where(eq(schema.foodAnalyses.id, id))
      .returning();
    return updatedAnalysis;
  }

  async getFoodAnalyses(limit?: number, userId?: number): Promise<schema.FoodAnalysis[]> {
    let query = db.select().from(schema.foodAnalyses).orderBy(desc(schema.foodAnalyses.createdAt));
    
    if (userId) {
      query = query.where(eq(schema.foodAnalyses.userId, userId));
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getFoodAnalysis(id: number): Promise<schema.FoodAnalysis | undefined> {
    const [analysis] = await db.select().from(schema.foodAnalyses).where(eq(schema.foodAnalyses.id, id));
    return analysis;
  }
  
  async getFoodAnalysesByDate(userId: number, startDate: Date, endDate: Date): Promise<schema.FoodAnalysis[]> {
    return await db
      .select()
      .from(schema.foodAnalyses)
      .where(
        and(
          eq(schema.foodAnalyses.userId, userId),
          gte(schema.foodAnalyses.createdAt, startDate),
          lte(schema.foodAnalyses.createdAt, endDate)
        )
      )
      .orderBy(desc(schema.foodAnalyses.createdAt));
  }
  
  // Perfil nutricional
  async createNutritionProfile(profile: schema.InsertNutritionProfile): Promise<schema.NutritionProfile> {
    const [nutritionProfile] = await db.insert(schema.nutritionProfiles).values(profile).returning();
    return nutritionProfile;
  }
  
  async getNutritionProfile(userId: number): Promise<schema.NutritionProfile | undefined> {
    const [profile] = await db
      .select()
      .from(schema.nutritionProfiles)
      .where(eq(schema.nutritionProfiles.userId, userId));
    return profile;
  }
  
  async updateNutritionProfile(userId: number, data: Partial<schema.InsertNutritionProfile>): Promise<schema.NutritionProfile | undefined> {
    const [profile] = await db
      .select()
      .from(schema.nutritionProfiles)
      .where(eq(schema.nutritionProfiles.userId, userId));
      
    if (!profile) return undefined;
    
    const [updatedProfile] = await db
      .update(schema.nutritionProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.nutritionProfiles.id, profile.id))
      .returning();
      
    return updatedProfile;
  }
  
  // Log diário de nutrição
  async createOrUpdateDailyLog(log: schema.InsertDailyNutritionLog): Promise<schema.DailyNutritionLog> {
    // Converte a data para um formato consistente (apenas data sem hora)
    const dateString = typeof log.date === 'object' && log.date instanceof Date 
      ? log.date.toISOString().split('T')[0] 
      : String(log.date);
    
    const formattedDate = dateString;
    
    // Verifica se já existe um log para esta data e usuário
    const [existingLog] = await db
      .select()
      .from(schema.dailyNutritionLogs)
      .where(
        and(
          eq(schema.dailyNutritionLogs.userId, log.userId),
          sql`DATE(${schema.dailyNutritionLogs.date}) = DATE(${formattedDate})`
        )
      );
    
    // Se existir, atualiza
    if (existingLog) {
      const [updatedLog] = await db
        .update(schema.dailyNutritionLogs)
        .set({ 
          ...log, 
          date: formattedDate,
          updatedAt: new Date() 
        })
        .where(eq(schema.dailyNutritionLogs.id, existingLog.id))
        .returning();
      
      return updatedLog;
    }
    
    // Se não existir, cria novo
    const [newLog] = await db
      .insert(schema.dailyNutritionLogs)
      .values({ ...log, date: formattedDate })
      .returning();
      
    return newLog;
  }
  
  async getDailyLog(userId: number, date: Date): Promise<schema.DailyNutritionLog | undefined> {
    const dateString = date.toISOString().split('T')[0];
    
    const [log] = await db
      .select()
      .from(schema.dailyNutritionLogs)
      .where(
        and(
          eq(schema.dailyNutritionLogs.userId, userId),
          sql`DATE(${schema.dailyNutritionLogs.date}) = DATE(${dateString})`
        )
      );
      
    return log;
  }
  
  async getDailyLogs(userId: number, startDate: Date, endDate: Date): Promise<schema.DailyNutritionLog[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(schema.dailyNutritionLogs)
      .where(
        and(
          eq(schema.dailyNutritionLogs.userId, userId),
          gte(schema.dailyNutritionLogs.date, startDateStr),
          lte(schema.dailyNutritionLogs.date, endDateStr)
        )
      )
      .orderBy(desc(schema.dailyNutritionLogs.date));
  }
  
  // Idiomas
  async getLanguages(): Promise<schema.Language[]> {
    return await db.select().from(schema.languages);
  }
  
  async getLanguageByCode(code: string): Promise<schema.Language | undefined> {
    const [language] = await db.select().from(schema.languages).where(eq(schema.languages.code, code));
    return language;
  }
}

// Exporta a classe de armazenamento em banco de dados
export const storage = new DatabaseStorage();
