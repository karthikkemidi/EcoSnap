import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_VISION } from '../constants';
import { WasteCategory, GeminiWasteClassificationResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY environment variable is not set. Gemini API calls will fail. " +
    "Ensure process.env.API_KEY is configured in your environment."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "NO_API_KEY_CONFIGURED" }); // Provide a fallback to prevent crash if key is missing

const constructPrompt = (): string => {
  const categories = Object.values(WasteCategory).join(", ");
  return `You are an expert waste classification system. Analyze the provided image and identify the primary type of waste visible.
Respond ONLY with a JSON object matching this exact structure:
{
  "wasteType": "CATEGORY_NAME",
  "confidence": 0.0, 
  "reasoning": "Brief explanation of why this category was chosen, or why it's uncertain."
}
- "wasteType" MUST be one of these exact values: ${categories}.
- "confidence" MUST be a float between 0.0 (uncertain) and 1.0 (very certain).
- "reasoning" should be a concise explanation.

If the image does not clearly show waste, is ambiguous, or features multiple distinct waste types that are hard to separate, use "${WasteCategory.UNKNOWN}" for wasteType, set confidence appropriately low (e.g., < 0.5), and explain the ambiguity in reasoning. Focus on the most prominent single piece of waste if multiple are present.
Do not include any text outside of the JSON object. Do not use markdown code fences like \`\`\`json or \`\`\`.
`;
};

export const classifyWaste = async (imageBase64: string): Promise<GeminiWasteClassificationResponse> => {
  if (!API_KEY) {
    // This case should ideally be handled by UI disabling the feature or showing a clear message.
    // For now, returning UNKNOWN to prevent app crash.
    console.error("Gemini API key is not configured. Classification cannot proceed.");
    return {
      wasteType: WasteCategory.UNKNOWN,
      confidence: 0,
      reasoning: "API Key for Gemini is not configured. Please contact support or check setup.",
    };
  }

  try {
    const imageMimeType = imageBase64.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
    const pureBase64 = imageBase64.split(',')[1];

    const imagePart = {
      inlineData: {
        mimeType: imageMimeType,
        data: pureBase64,
      },
    };

    const textPart = {
      text: constructPrompt(),
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_VISION,
      contents: { parts: [imagePart, textPart] },
      config: {
        // Important: Gemini will still return text, but we instruct it to format that text as JSON
        // We are NOT using responseMimeType: "application/json" as per the guideline if it implies Gemini does the parsing,
        // rather we ensure the prompt asks for JSON-formatted text.
        // If the prompt is to return JSON for `responseMimeType: "application/json"` to work,
        // then it implies the model must be explicitly told to return JSON and this config helps.
        // Given the ambiguity and the stricter guideline of parsing text, we rely on the prompt.
        // However, if `responseMimeType: "application/json"` is available and *helps* the model adhere to JSON in its text output,
        // it can be beneficial. For safety based on current guidelines, we will parse the text.
        // Let's add it to encourage Gemini, but still parse robustly.
         responseMimeType: "application/json", 
      }
    });

    let jsonStr = response.text.trim();
    
    // Remove markdown fences if present (though prompt says not to use them)
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr) as GeminiWasteClassificationResponse;

    // Validate parsed data structure (basic check)
    if (!parsedData || typeof parsedData.wasteType !== 'string') {
        throw new Error('Invalid JSON structure received from Gemini.');
    }
    // Ensure confidence is a number
    if (typeof parsedData.confidence !== 'number' || isNaN(parsedData.confidence)) {
        parsedData.confidence = 0.5; // Default if missing or invalid
    }
    parsedData.confidence = Math.max(0, Math.min(1, parsedData.confidence)); // Clamp to 0-1

    return parsedData;

  } catch (error) {
    console.error("Error classifying waste with Gemini:", error);
    let errorMessage = "Failed to classify waste. The AI model might be unavailable or returned an unexpected response.";
    if (error instanceof Error) {
        errorMessage = error.message.includes("API key not valid") 
                       ? "Invalid Gemini API Key. Please check your configuration." 
                       : error.message;
    }
    return {
      wasteType: WasteCategory.UNKNOWN,
      confidence: 0,
      reasoning: `Error: ${errorMessage}`,
    };
  }
};
