import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

let aiClient: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || ''; // In a real app, strict env handling
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateTradingResponse = async (
  userMessage: string,
  contextData: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // System instruction for the Cyberpunk Bot Persona
    const systemInstruction = `
      You are Megatron Solbot, an advanced AI trading assistant in a cyberpunk world.
      Your tone is futuristic, direct, and slightly edgy but helpful.
      You are an expert on Solana, DeFi, and market analysis.
      
      Current Market Context provided by system:
      ${contextData}
      
      Answer the user's question briefly and effectively.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    return response.text || "System malfunction. Re-routing neural pathways...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection to neural net unstable. Please check your API key.";
  }
};