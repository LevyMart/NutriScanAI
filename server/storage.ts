import { foodAnalyses, type FoodAnalysis, type InsertFoodAnalysis } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// Define the storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Food analysis methods
  createFoodAnalysis(analysis: InsertFoodAnalysis): Promise<FoodAnalysis>;
  getFoodAnalyses(limit?: number): Promise<FoodAnalysis[]>;
  getFoodAnalysis(id: number): Promise<FoodAnalysis | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, FoodAnalysis>;
  private userCurrentId: number;
  private analysisCurrentId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.userCurrentId = 1;
    this.analysisCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFoodAnalysis(insertAnalysis: InsertFoodAnalysis): Promise<FoodAnalysis> {
    const id = this.analysisCurrentId++;
    const analysis: FoodAnalysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getFoodAnalyses(limit?: number): Promise<FoodAnalysis[]> {
    const allAnalyses = Array.from(this.analyses.values());
    // Sort by createdAt in descending order (newest first)
    const sorted = allAnalyses.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async getFoodAnalysis(id: number): Promise<FoodAnalysis | undefined> {
    return this.analyses.get(id);
  }
}

export const storage = new MemStorage();
