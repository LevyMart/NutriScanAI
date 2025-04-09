export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface FoodAnalysisResult {
  foods: string[];
  nutrition: NutritionInfo;
  analysis: string;
  suggestions: string[];
}

export interface HistoryItem {
  id: number;
  imageUrl: string;
  createdAt: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  analysis: string;
  suggestions: string[];
}
