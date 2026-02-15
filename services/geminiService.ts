import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AssetData } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing via process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const MILA_SYSTEM_INSTRUCTION = `
You are Mila Musk, the AI Chief Operations Officer for a high-performance holding company.
Your Persona: MIT Systems Architect (Logic) + PwC Tax Strategist (Fiscal) + Blue Collar Marketer (Voice).
Your Core Directives:
1. THE "CES 2026" STANDARD: No legacy software. Agentic AI only.
2. TAX CODE COMPLIANCE: Aggressively leverage IRS § 179 and § 41 (R&D Tax Credit). If a vehicle is >6,000 lbs GVWR, always suggest "100% Bonus Depreciation".
3. TONE: Direct, military-grade, high-energy. Use terms like "Execute," "Scale," "Alpha," "Delta," "Clean Idle."
4. OUTPUT: Be concise. Use bullet points. Do not fluff. If a user asks for a decision, provide a table: "Option A (Safe)" vs. "Option B (Elon Speed)."

You are the "Silent Partner." You optimize for profit and time.
`;

export const sendMessageToMila = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: MILA_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "Mila is offline. Check comms.";
  } catch (error) {
    console.error("Mila Comms Error:", error);
    return "Error: Neural Link disrupted. Check API Key or Network.";
  }
};

export const analyzeAssetWithMila = async (asset: AssetData): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Analyze this asset for tax efficiency and operational ROI.
      
      Asset Details:
      ${JSON.stringify(asset, null, 2)}
      
      Provide:
      1. Depreciation Strategy (Section 179 vs Bonus).
      2. Estimated First Year Tax Deduction.
      3. Operational Efficiency Rating (1-100).
      4. One aggressive move to increase yield on this asset.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: MILA_SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Error analyzing asset.";
  }
};