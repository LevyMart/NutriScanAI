import { apiRequest } from "@/lib/queryClient";
import { FoodAnalysisResult, HistoryItem } from "@/types";

// Analyze food image
export async function analyzeFoodImage(imageData: string): Promise<FoodAnalysisResult> {
  const response = await apiRequest('POST', '/api/analyze-food', { image: imageData });
  return response.json();
}

// Save analysis to history
export async function saveAnalysis(analysisData: {
  imageUrl: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  analysis: string;
  suggestions: string[];
}): Promise<HistoryItem> {
  const response = await apiRequest('POST', '/api/save-analysis', analysisData);
  return response.json();
}

// Get analysis history
export async function getAnalysisHistory(): Promise<HistoryItem[]> {
  const response = await apiRequest('GET', '/api/analysis-history');
  return response.json();
}

// Get a specific analysis
export async function getAnalysis(id: number): Promise<HistoryItem> {
  const response = await apiRequest('GET', `/api/analysis/${id}`);
  return response.json();
}
