import OpenAI from "openai";
import { FoodAnalysisResponse, foodAnalysisResponseSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

interface AnalyzeOptions {
  language: string; // 'pt', 'en', 'es'
  detailed?: boolean;
}

export async function analyzeFoodImage(
  base64Image: string, 
  options: AnalyzeOptions = { language: 'pt', detailed: true }
): Promise<FoodAnalysisResponse> {
  try {
    // Define prompts para diferentes idiomas
    const prompts = {
      pt: `
        Analise esta imagem de alimentos em detalhes. Por favor, identifique todos os alimentos visíveis e forneça informações nutricionais abrangentes sobre a refeição.
        
        Para sua resposta, forneça:
        1. Uma lista de todos os alimentos que você pode identificar
        2. Os valores nutricionais estimados (calorias, proteínas, carboidratos, gorduras, fibras)
        3. Uma breve análise do perfil nutricional da refeição
        4. Algumas sugestões para melhorar a refeição, se necessário
        5. Para cada alimento identificado, forneça detalhes nutricionais específicos, quando possível

        Formate sua resposta como um objeto JSON com a seguinte estrutura:
        {
          "foods": ["alimento 1", "alimento 2", ...],
          "nutrition": {
            "calories": número (kcal),
            "protein": número (g),
            "carbs": número (g),
            "fats": número (g),
            "fiber": número (g)
          },
          "analysis": "texto descrevendo o valor nutricional da refeição",
          "suggestions": ["sugestão 1", "sugestão 2", ...],
          "foodDetails": [
            { 
              "name": "nome do alimento",
              "quantity": "quantidade aproximada",
              "calories": número (kcal),
              "protein": número (g),
              "carbs": número (g), 
              "fats": número (g),
              "fiber": número (g)
            },
            ...
          ]
        }
      `,
      en: `
        Analyze this food image in detail. Please identify all food items visible, and provide comprehensive nutritional information about the meal.
        
        For your response, provide:
        1. A list of all food items you can identify
        2. The estimated nutritional values (calories, protein, carbs, fats, fiber)
        3. A brief analysis of the meal's nutritional profile
        4. Some suggestions to improve the meal if needed
        5. For each identified food, provide specific nutritional details when possible
        
        Format your response as a JSON object with the following structure:
        {
          "foods": ["food item 1", "food item 2", ...],
          "nutrition": {
            "calories": number (kcal),
            "protein": number (g),
            "carbs": number (g),
            "fats": number (g),
            "fiber": number (g)
          },
          "analysis": "text describing the nutritional value of the meal",
          "suggestions": ["suggestion 1", "suggestion 2", ...],
          "foodDetails": [
            { 
              "name": "food name",
              "quantity": "approximate quantity",
              "calories": number (kcal),
              "protein": number (g),
              "carbs": number (g), 
              "fats": number (g),
              "fiber": number (g)
            },
            ...
          ]
        }
      `,
      es: `
        Analiza esta imagen de alimentos en detalle. Por favor, identifica todos los alimentos visibles y proporciona información nutricional completa sobre la comida.
        
        Para tu respuesta, proporciona:
        1. Una lista de todos los alimentos que puedes identificar
        2. Los valores nutricionales estimados (calorías, proteínas, carbohidratos, grasas, fibra)
        3. Un breve análisis del perfil nutricional de la comida
        4. Algunas sugerencias para mejorar la comida, si es necesario
        5. Para cada alimento identificado, proporciona detalles nutricionales específicos cuando sea posible
        
        Formatea tu respuesta como un objeto JSON con la siguiente estructura:
        {
          "foods": ["alimento 1", "alimento 2", ...],
          "nutrition": {
            "calories": número (kcal),
            "protein": número (g),
            "carbs": número (g),
            "fats": número (g),
            "fiber": número (g)
          },
          "analysis": "texto describiendo el valor nutricional de la comida",
          "suggestions": ["sugerencia 1", "sugerencia 2", ...],
          "foodDetails": [
            { 
              "name": "nombre del alimento",
              "quantity": "cantidad aproximada",
              "calories": número (kcal),
              "protein": número (g),
              "carbs": número (g), 
              "fats": número (g),
              "fiber": número (g)
            },
            ...
          ]
        }
      `
    };

    // Seleciona o prompt pelo idioma (padrão: português)
    const languageCode = options.language || 'pt';
    const languageCodes = ['pt', 'en', 'es'] as const;
    type LanguageCode = typeof languageCodes[number];
    
    // Verifica se o código de idioma é válido
    const isValidLanguage = (code: string): code is LanguageCode => {
      return languageCodes.includes(code as LanguageCode);
    };
    
    // Usa o código de idioma validado ou o padrão
    const validLanguage: LanguageCode = isValidLanguage(languageCode) ? languageCode : 'pt';
    const prompt = prompts[validLanguage];

    // Configuração do sistema para o modelo saber qual idioma usar
    const systemMessages = {
      pt: "Você é um assistente nutricional especializado em análise de alimentos a partir de imagens. Responda sempre em português brasileiro, de forma clara e precisa, usando termos técnicos apenas quando necessário e com explicações simples.",
      en: "You are a nutritional assistant specialized in analyzing food from images. Always respond in English, in a clear and precise manner, using technical terms only when necessary and with simple explanations.",
      es: "Eres un asistente nutricional especializado en analizar alimentos a partir de imágenes. Responde siempre en español, de forma clara y precisa, utilizando términos técnicos solo cuando sea necesario y con explicaciones sencillas."
    };

    const systemPrompt = systemMessages[validLanguage];

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse e valida a resposta
    const parsedData = JSON.parse(content);
    const validatedData = foodAnalysisResponseSchema.parse(parsedData);
    
    return validatedData;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw new Error(`Failed to analyze food image: ${error.message}`);
  }
}
