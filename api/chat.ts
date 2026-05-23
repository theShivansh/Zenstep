import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Server misconfiguration: GEMINI_API_KEY is not set." });
  }

  try {
    const { history, message } = req.body as {
      history: Array<{ role: string; parts: Array<{ text: string }> }>;
      message: string;
    };

    if (!message) {
      return res.status(400).json({ error: "Missing required field: message." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: history || [],
      config: {
        systemInstruction:
          "You are ZenBot, a helpful, slightly robotic but friendly productivity assistant in the ZenStep app. Keep answers concise and motivating.",
      },
    });

    const result = await chat.sendMessage({ message });
    const text = result.text || "";

    return res.status(200).json({ text });
  } catch (err: any) {
    console.error("[/api/chat] Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error." });
  }
}
