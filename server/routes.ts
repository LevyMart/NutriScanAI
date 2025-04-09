import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./openai";
import { 
  insertFoodAnalysisSchema, 
  insertUserSchema, 
  insertNutritionProfileSchema,
  insertDailyNutritionLogSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Função auxiliar para lidar com erros nas rotas
const handleRouteError = (error: any, res: Response, customMessage: string) => {
  console.error(`Error: ${customMessage}:`, error);
      
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Dados inválidos", 
      details: error.errors 
    });
  }
  
  return res.status(500).json({ 
    message: customMessage, 
    error: error.message 
  });
};

// Middleware para verificar idioma da requisição
const getRequestLanguage = (req: Request): string => {
  // Prioridade:
  // 1. Parâmetro de consulta 'lang'
  // 2. Cookie de idioma
  // 3. Cabeçalho Accept-Language
  // 4. Padrão: 'pt' (português)
  
  // Verifica parâmetro de consulta
  const queryLang = req.query.lang as string;
  if (queryLang && ['pt', 'en', 'es'].includes(queryLang)) {
    return queryLang;
  }
  
  // Verifica cookie
  const cookieLang = req.cookies?.prefLanguage;
  if (cookieLang && ['pt', 'en', 'es'].includes(cookieLang)) {
    return cookieLang;
  }
  
  // Verifica cabeçalho Accept-Language
  const acceptLang = req.headers['accept-language'];
  if (acceptLang) {
    // Simplificado: pega apenas primeiros 2 caracteres
    const browserLang = acceptLang.split(',')[0].substring(0, 2).toLowerCase();
    if (['pt', 'en', 'es'].includes(browserLang)) {
      return browserLang;
    }
  }
  
  // Padrão: português
  return 'pt';
};

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Rotas para configuração de idioma ---
  app.get("/api/languages", async (_req: Request, res: Response) => {
    try {
      const languages = await storage.getLanguages();
      return res.status(200).json(languages);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao buscar idiomas disponíveis");
    }
  });
  
  app.post("/api/set-language", (req: Request, res: Response) => {
    try {
      const { language } = req.body;
      
      if (!language || !['pt', 'en', 'es'].includes(language)) {
        return res.status(400).json({ message: "Idioma inválido" });
      }
      
      // Define um cookie para armazenar preferência de idioma
      res.cookie('prefLanguage', language, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
        httpOnly: true,
        sameSite: 'strict'
      });
      
      return res.status(200).json({ message: "Idioma definido com sucesso" });
    } catch (error) {
      return handleRouteError(error, res, "Falha ao definir idioma");
    }
  });
  
  // --- Rotas para análise de alimentos ---
  app.post("/api/analyze-food", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== "string") {
        return res.status(400).json({ message: "Dados de imagem ausentes ou inválidos" });
      }
      
      // Extrai dados base64 da string de imagem - lida com o formato "data:image/jpeg;base64,<base64-real>"
      const base64Data = image.includes("base64,") 
        ? image.split("base64,")[1] 
        : image;
      
      // Determina o idioma para análise
      const language = getRequestLanguage(req);
      
      // Analisa a imagem com OpenAI usando idioma escolhido
      const analysisResult = await analyzeFoodImage(base64Data, { 
        language, 
        detailed: true 
      });
      
      return res.status(200).json(analysisResult);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao analisar imagem de alimento");
    }
  });

  // --- Rotas para histórico de análises ---
  app.post("/api/save-analysis", async (req: Request, res: Response) => {
    try {
      const analysisData = req.body;
      const userId = req.body.userId || null;
      const language = getRequestLanguage(req);
      
      // Valida os dados recebidos
      const validData = insertFoodAnalysisSchema.parse({
        ...analysisData,
        userId,
        foods: JSON.stringify(analysisData.foods || []),
        suggestions: JSON.stringify(analysisData.suggestions || []),
        language,
        createdAt: new Date(),
      });
      
      // Salva análise no armazenamento
      const savedAnalysis = await storage.createFoodAnalysis(validData);
      
      // Se houver userId, atualiza log diário
      if (userId) {
        try {
          // Busca ou cria log do dia atual
          const today = new Date();
          const dailyLog = await storage.getDailyLog(userId, today) || 
            await storage.createOrUpdateDailyLog({
              userId,
              date: today,
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFats: 0,
              totalFiber: 0
            });
          
          // Atualiza totais do dia com os valores da análise atual
          await storage.createOrUpdateDailyLog({
            userId,
            date: today,
            totalCalories: dailyLog.totalCalories + analysisData.calories,
            totalProtein: dailyLog.totalProtein + analysisData.protein,
            totalCarbs: dailyLog.totalCarbs + analysisData.carbs,
            totalFats: dailyLog.totalFats + analysisData.fats,
            totalFiber: dailyLog.totalFiber + analysisData.fiber,
          });
          
          // Note: Implementaremos a atualização da análise posteriormente
        } catch (logError) {
          console.error("Erro ao atualizar log diário:", logError);
          // Continua mesmo se falhar a atualização do log diário
        }
      }
      
      return res.status(201).json(savedAnalysis);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao salvar análise");
    }
  });

  // Histórico de análises (com suporte a filtro por usuário)
  app.get("/api/analysis-history", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const analyses = await storage.getFoodAnalyses(limit, userId);
      
      // Transforma os dados para consumo no frontend
      const formattedAnalyses = analyses.map(analysis => ({
        ...analysis,
        foods: JSON.parse(analysis.foods),
        suggestions: JSON.parse(analysis.suggestions),
      }));
      
      return res.status(200).json(formattedAnalyses);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao buscar histórico de análises");
    }
  });

  // Obtém uma análise específica pelo ID
  app.get("/api/analysis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de análise inválido" });
      }
      
      const analysis = await storage.getFoodAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Análise não encontrada" });
      }
      
      // Transforma os dados para consumo no frontend
      const formattedAnalysis = {
        ...analysis,
        foods: JSON.parse(analysis.foods),
        suggestions: JSON.parse(analysis.suggestions),
      };
      
      return res.status(200).json(formattedAnalysis);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao buscar análise");
    }
  });
  
  // --- Rotas para usuários ---
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Valida os dados do usuário
      const validData = insertUserSchema.parse(userData);
      
      // Verifica se o nome de usuário já existe
      const existingUser = await storage.getUserByUsername(validData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Nome de usuário já existe" });
      }
      
      // Cria o usuário
      const createdUser = await storage.createUser(validData);
      
      // Omite a senha da resposta
      const { password, ...userWithoutPassword } = createdUser;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao criar usuário");
    }
  });
  
  // --- Rotas para perfis nutricionais ---
  app.post("/api/nutrition-profile", async (req: Request, res: Response) => {
    try {
      const profileData = req.body;
      
      // Valida os dados do perfil
      const validData = insertNutritionProfileSchema.parse(profileData);
      
      // Verifica se o usuário existe
      const user = await storage.getUser(validData.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Verifica se já existe um perfil para este usuário
      const existingProfile = await storage.getNutritionProfile(validData.userId);
      
      let profile;
      if (existingProfile) {
        // Atualiza o perfil existente
        profile = await storage.updateNutritionProfile(validData.userId, validData);
      } else {
        // Cria um novo perfil
        profile = await storage.createNutritionProfile(validData);
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao salvar perfil nutricional");
    }
  });
  
  app.get("/api/nutrition-profile/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      const profile = await storage.getNutritionProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Perfil nutricional não encontrado" });
      }
      
      return res.status(200).json(profile);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao buscar perfil nutricional");
    }
  });
  
  // --- Rotas para logs diários ---
  app.get("/api/daily-logs/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      // Parâmetros opcionais para filtrar por intervalo de datas
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      // Ajusta para início e fim do dia
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const logs = await storage.getDailyLogs(userId, startDate, endDate);
      
      return res.status(200).json(logs);
    } catch (error) {
      return handleRouteError(error, res, "Falha ao buscar logs diários");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
