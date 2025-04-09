import OpenAI from "openai";
import { FoodAnalysisResponse, foodAnalysisResponseSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResponse> {
  try {
    const prompt = `
      Analyze this food image in detail. Please identify all food items visible, and provide comprehensive nutritional information about the meal.
      
      For your response, provide:
      1. A list of all food items you can identify
      2. The estimated nutritional values (calories, protein, carbs, fats, fiber)
      3. A brief analysis of the meal's nutritional profile
      4. Some suggestions to improve the meal if needed
      
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
        "suggestions": ["suggestion 1", "suggestion 2", ...]
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
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
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse and validate the response
    const parsedData = JSON.parse(content);
    const validatedData = foodAnalysisResponseSchema.parse(parsedData);
    
    return validatedData;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw new Error(`Failed to analyze food image: ${error.message}`);
  }
}
