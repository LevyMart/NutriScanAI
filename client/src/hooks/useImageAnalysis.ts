import { useState } from "react";
import { analyzeFoodImage, saveAnalysis } from "@/lib/api";
import { FoodAnalysisResult, HistoryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useImageAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setImage(null);
    setResult(null);
  };

  const handleImageCapture = async (file: File) => {
    try {
      // Read the file as base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          setImage(imageData);
          
          // Start analysis
          await analyzeImage(imageData);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading image:", error);
      toast({
        title: "Erro ao processar imagem",
        description: "Não foi possível processar a imagem selecionada.",
        variant: "destructive"
      });
    }
  };

  const analyzeImage = async (imageData: string) => {
    try {
      setIsAnalyzing(true);
      
      // Send to API for analysis
      const analysisResult = await analyzeFoodImage(imageData);
      setResult(analysisResult);
      
      toast({
        title: "Análise concluída",
        description: "Sua comida foi analisada com sucesso!",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = async (): Promise<HistoryItem | null> => {
    if (!image || !result) {
      toast({
        title: "Erro ao salvar",
        description: "Não há análise para salvar.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setIsSaving(true);
      
      // Format data for saving
      const analysisData = {
        imageUrl: image,
        foods: result.foods,
        calories: result.nutrition.calories,
        protein: result.nutrition.protein,
        carbs: result.nutrition.carbs,
        fats: result.nutrition.fats,
        fiber: result.nutrition.fiber,
        analysis: result.analysis,
        suggestions: result.suggestions,
      };
      
      // Save to API
      const savedItem = await saveAnalysis(analysisData);
      
      toast({
        title: "Análise salva",
        description: "Sua análise foi salva com sucesso!"
      });
      
      return savedItem;
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a análise.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    image,
    result,
    isAnalyzing,
    isSaving,
    handleImageCapture,
    saveToHistory,
    resetState
  };
}
