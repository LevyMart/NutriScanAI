import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, CheckCircle } from 'lucide-react';
import { FoodAnalysisResult } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisViewProps {
  isLoading: boolean;
  isSaving: boolean;
  image: string | null;
  result: FoodAnalysisResult | null;
  onNewAnalysis: () => void;
  onSaveAnalysis: () => Promise<void>;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  isLoading,
  isSaving,
  image,
  result,
  onNewAnalysis,
  onSaveAnalysis
}) => {
  if (isLoading) {
    return (
      <div className="animate-in fade-in mb-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <span className="material-icons text-4xl text-primary animate-pulse">science</span>
          </div>
          <h2 className="text-xl font-medium text-primary-foreground mb-2">Analisando sua refeição</h2>
          <p className="text-muted-foreground text-sm">Utilizando IA para identificar os alimentos e nutrientes...</p>
        </div>
        
        {/* Loading Shimmer UI */}
        <div className="space-y-4">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="animate-in fade-in mb-6">
      {/* Image and identified foods */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <div className="flex items-center mb-3">
          <CheckCircle className="text-secondary mr-2 h-5 w-5" />
          <h3 className="text-lg font-medium text-primary-foreground">Alimentos Identificados</h3>
        </div>
        
        <div className="flex mb-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden mr-3 flex-shrink-0">
            {image && <img src={image} className="w-full h-full object-cover" alt="Alimentos identificados" />}
          </div>
          <div>
            <ul className="text-sm text-primary-foreground">
              {result.foods.map((food, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-secondary mr-2"></span>
                  {food}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Nutrition information */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="material-icons text-secondary mr-2">nutrition</span>
            <h3 className="text-lg font-medium text-primary-foreground">Informação Nutricional</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">Por porção</span>
        </div>
        
        {/* Nutrition facts */}
        <div className="space-y-3">
          {/* Calories */}
          <div className="flex justify-between border-b border-background pb-2">
            <span className="text-primary-foreground font-medium">Calorias</span>
            <span className="text-secondary font-medium">{result.nutrition.calories} kcal</span>
          </div>
          
          {/* Macros */}
          <div className="flex justify-between border-b border-background pb-2">
            <span className="text-primary-foreground">Proteínas</span>
            <span className="text-muted-foreground">{result.nutrition.protein}g</span>
          </div>
          <div className="flex justify-between border-b border-background pb-2">
            <span className="text-primary-foreground">Carboidratos</span>
            <span className="text-muted-foreground">{result.nutrition.carbs}g</span>
          </div>
          <div className="flex justify-between border-b border-background pb-2">
            <span className="text-primary-foreground">Gorduras</span>
            <span className="text-muted-foreground">{result.nutrition.fats}g</span>
          </div>
          <div className="flex justify-between border-b border-background pb-2">
            <span className="text-primary-foreground">Fibras</span>
            <span className="text-muted-foreground">{result.nutrition.fiber}g</span>
          </div>
        </div>
      </div>
      
      {/* AI Analysis and Recommendations */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <div className="flex items-center mb-3">
          <span className="material-icons text-secondary mr-2">tips_and_updates</span>
          <h3 className="text-lg font-medium text-primary-foreground">Análise e Recomendações</h3>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3">{result.analysis}</p>
        
        <div className="bg-background/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-primary-foreground mb-1">Sugestões de Melhoria:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            {result.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          className="flex-1 mr-2 flex items-center justify-center"
          onClick={onNewAnalysis}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Nova Análise</span>
        </Button>
        <Button 
          variant="default"
          className="flex-1 ml-2 bg-secondary hover:bg-secondary/90 text-black flex items-center justify-center"
          onClick={onSaveAnalysis}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
        </Button>
      </div>
    </div>
  );
};

export default AnalysisView;
