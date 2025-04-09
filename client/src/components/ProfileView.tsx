import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { XCircle, Save, User, Goal, ChevronLeft, BarChart3, BarChart2, BarChart, Calendar } from 'lucide-react';

interface ProfileViewProps {
  onClose: () => void;
}

// Interface para o formulário de perfil
interface ProfileFormData {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  goal: string;
}

// Interface para as metas nutricionais
interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

const activityLevels = [
  { value: 'sedentary', label: 'Sedentário', description: 'Pouca ou nenhuma atividade física' },
  { value: 'light', label: 'Leve', description: '1-3 dias por semana de exercício' },
  { value: 'moderate', label: 'Moderado', description: '3-5 dias por semana de exercício' },
  { value: 'active', label: 'Ativo', description: '6-7 dias por semana de exercício' },
  { value: 'very_active', label: 'Muito ativo', description: 'Exercício intenso diariamente ou trabalho físico' },
];

const goalOptions = [
  { value: 'lose_weight', label: 'Perder peso', description: 'Déficit calórico moderado' },
  { value: 'maintain', label: 'Manter peso', description: 'Equilíbrio calórico' },
  { value: 'gain_muscle', label: 'Ganhar músculo', description: 'Superávit calórico controlado' },
];

const ProfileView: React.FC<ProfileViewProps> = ({ onClose }) => {
  // Estado para o formulário de perfil
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain',
  });

  // Estado para as metas calculadas
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  });

  // Estado para a aba atual
  const [activeTab, setActiveTab] = useState('profile');

  // Dados fictícios de histórico de nutrição para demonstração
  const nutritionData = {
    today: {
      calories: 1850,
      protein: 85,
      carbs: 200,
      fats: 60,
      fiber: 22,
    },
    week: {
      calories: [1800, 2100, 1750, 1900, 1850, 2000, 1850],
      protein: [80, 90, 75, 85, 82, 88, 85],
      carbs: [190, 220, 185, 200, 195, 210, 200],
      fats: [65, 70, 60, 62, 60, 65, 60],
      fiber: [20, 22, 18, 23, 21, 24, 22],
    },
    month: {
      calories: [1850, 1900, 1870, 1880],
      protein: [84, 86, 83, 85],
      carbs: [195, 200, 198, 200],
      fats: [62, 63, 62, 60],
      fiber: [21, 22, 22, 22],
    }
  };

  // Meta diária calculada (este seria apenas um exemplo, você teria que implementar sua própria lógica)
  const dailyGoal = {
    calories: 2000,
    protein: 100,
    carbs: 225,
    fats: 65,
    fiber: 25,
  };

  // Função para calcular as metas nutricionais com base nos dados do perfil
  const calculateGoals = () => {
    const { gender, weight, height, age, activityLevel, goal } = formData;
    
    // Convertendo valores para números
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);
    
    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageYears)) {
      // Se os valores não forem números válidos, retornar
      return;
    }
    
    // Calculando Taxa Metabólica Basal (TMB) usando a fórmula de Mifflin-St Jeor
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }
    
    // Fator de atividade
    let activityFactor = 1.2; // Sedentário
    if (activityLevel === 'light') activityFactor = 1.375;
    else if (activityLevel === 'moderate') activityFactor = 1.55;
    else if (activityLevel === 'active') activityFactor = 1.725;
    else if (activityLevel === 'very_active') activityFactor = 1.9;
    
    // Calorias totais com base no nível de atividade
    let totalCalories = bmr * activityFactor;
    
    // Ajuste com base no objetivo
    if (goal === 'lose_weight') totalCalories *= 0.85; // -15% para perda de peso
    else if (goal === 'gain_muscle') totalCalories *= 1.1; // +10% para ganho de músculo
    
    // Arredondar calorias
    totalCalories = Math.round(totalCalories);
    
    // Calculando macronutrientes
    // Para manter: 30% proteína, 40% carboidratos, 30% gorduras
    // Para perder peso: 35% proteína, 35% carboidratos, 30% gorduras
    // Para ganhar músculo: 30% proteína, 45% carboidratos, 25% gorduras
    let proteinPct = 0.3;
    let carbsPct = 0.4;
    let fatsPct = 0.3;
    
    if (goal === 'lose_weight') {
      proteinPct = 0.35;
      carbsPct = 0.35;
      fatsPct = 0.3;
    } else if (goal === 'gain_muscle') {
      proteinPct = 0.3;
      carbsPct = 0.45;
      fatsPct = 0.25;
    }
    
    // Gramas de cada macronutriente
    // Proteína e Carboidratos = 4 calorias por grama
    // Gorduras = 9 calorias por grama
    const proteinGrams = Math.round((totalCalories * proteinPct) / 4);
    const carbsGrams = Math.round((totalCalories * carbsPct) / 4);
    const fatsGrams = Math.round((totalCalories * fatsPct) / 9);
    
    // Fibra: recomendação geral de 14g por 1000 kcal
    const fiberGrams = Math.round(totalCalories / 1000 * 14);
    
    // Definindo as metas calculadas
    setGoals({
      calories: totalCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fats: fatsGrams,
      fiber: fiberGrams,
    });
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para lidar com mudanças nos campos de seleção
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calcula a porcentagem de progresso para o dia atual
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  // Exibe progresso com base em cores (vermelho < 70%, amarelo < 90%, verde >= 90%)
  const getProgressColor = (percent: number) => {
    if (percent < 70) return "bg-red-500";
    if (percent < 90) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col z-50 animate-in fade-in">
      <header className="bg-surface px-4 py-3 flex items-center shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">Perfil e Metas Nutricionais</h2>
      </header>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Goal className="h-4 w-4" />
              <span>Metas</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>Progresso</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="profile" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>
                  Preencha suas informações para calcular suas metas nutricionais personalizadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Seu nome"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input 
                      id="age" 
                      name="age" 
                      type="number" 
                      value={formData.age} 
                      onChange={handleInputChange} 
                      placeholder="Anos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gênero</Label>
                    <RadioGroup 
                      value={formData.gender} 
                      onValueChange={(value) => handleSelectChange('gender', value)} 
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Feminino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input 
                      id="weight" 
                      name="weight" 
                      type="number" 
                      value={formData.weight} 
                      onChange={handleInputChange} 
                      placeholder="Kilogramas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input 
                      id="height" 
                      name="height" 
                      type="number" 
                      value={formData.height} 
                      onChange={handleInputChange} 
                      placeholder="Centímetros"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Nível de Atividade Física</Label>
                  <Select 
                    value={formData.activityLevel} 
                    onValueChange={(value) => handleSelectChange('activityLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu nível de atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex flex-col">
                            <span>{level.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {level.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Select 
                    value={formData.goal} 
                    onValueChange={(value) => handleSelectChange('goal', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={calculateGoals}>
                  <Save className="mr-2 h-4 w-4" />
                  Calcular Metas Nutricionais
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Suas Metas Nutricionais</CardTitle>
                <CardDescription>
                  Com base nos seus dados, estas são suas metas nutricionais diárias recomendadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {goals.calories === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Preencha seus dados na aba "Perfil" e calcule suas metas nutricionais personalizadas.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('profile')}
                    >
                      Ir para Perfil
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Calorias</Label>
                        <span className="text-xl font-bold text-primary">{goals.calories} kcal</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Proteínas</Label>
                        <span className="font-medium">{goals.protein}g</span>
                      </div>
                      <Progress value={100} className="h-2 bg-blue-950" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(goals.protein * 4)} kcal ({Math.round((goals.protein * 4 / goals.calories) * 100)}% das calorias)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Carboidratos</Label>
                        <span className="font-medium">{goals.carbs}g</span>
                      </div>
                      <Progress value={100} className="h-2 bg-amber-950" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(goals.carbs * 4)} kcal ({Math.round((goals.carbs * 4 / goals.calories) * 100)}% das calorias)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Gorduras</Label>
                        <span className="font-medium">{goals.fats}g</span>
                      </div>
                      <Progress value={100} className="h-2 bg-red-950" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(goals.fats * 9)} kcal ({Math.round((goals.fats * 9 / goals.calories) * 100)}% das calorias)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Fibras</Label>
                        <span className="font-medium">{goals.fiber}g</span>
                      </div>
                      <Progress value={100} className="h-2 bg-green-950" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="m-0">
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="daily" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Diário</span>
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Semanal</span>
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Mensal</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso Diário</CardTitle>
                    <CardDescription>
                      Seu consumo nutricional de hoje comparado às suas metas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Calorias</Label>
                        <span className="font-medium">{nutritionData.today.calories} / {dailyGoal.calories} kcal</span>
                      </div>
                      <Progress 
                        value={calculateProgress(nutritionData.today.calories, dailyGoal.calories)} 
                        className={`h-2 ${getProgressColor(calculateProgress(nutritionData.today.calories, dailyGoal.calories))}`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Proteínas</Label>
                        <span className="font-medium">{nutritionData.today.protein} / {dailyGoal.protein}g</span>
                      </div>
                      <Progress 
                        value={calculateProgress(nutritionData.today.protein, dailyGoal.protein)} 
                        className={`h-2 ${getProgressColor(calculateProgress(nutritionData.today.protein, dailyGoal.protein))}`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Carboidratos</Label>
                        <span className="font-medium">{nutritionData.today.carbs} / {dailyGoal.carbs}g</span>
                      </div>
                      <Progress 
                        value={calculateProgress(nutritionData.today.carbs, dailyGoal.carbs)} 
                        className={`h-2 ${getProgressColor(calculateProgress(nutritionData.today.carbs, dailyGoal.carbs))}`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Gorduras</Label>
                        <span className="font-medium">{nutritionData.today.fats} / {dailyGoal.fats}g</span>
                      </div>
                      <Progress 
                        value={calculateProgress(nutritionData.today.fats, dailyGoal.fats)} 
                        className={`h-2 ${getProgressColor(calculateProgress(nutritionData.today.fats, dailyGoal.fats))}`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Fibras</Label>
                        <span className="font-medium">{nutritionData.today.fiber} / {dailyGoal.fiber}g</span>
                      </div>
                      <Progress 
                        value={calculateProgress(nutritionData.today.fiber, dailyGoal.fiber)} 
                        className={`h-2 ${getProgressColor(calculateProgress(nutritionData.today.fiber, dailyGoal.fiber))}`} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weekly">
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso Semanal</CardTitle>
                    <CardDescription>
                      Seu consumo nutricional dos últimos 7 dias.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Aqui seriam exibidos gráficos semanais com seu progresso.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Média semanal: {Math.round(nutritionData.week.calories.reduce((a, b) => a + b, 0) / 7)} kcal/dia
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly">
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso Mensal</CardTitle>
                    <CardDescription>
                      Seu consumo nutricional das últimas 4 semanas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Aqui seriam exibidos gráficos mensais com seu progresso.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Média mensal: {Math.round(nutritionData.month.calories.reduce((a, b) => a + b, 0) / 4)} kcal/dia
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProfileView;