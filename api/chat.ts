import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfiguration: GROQ_API_KEY is not set.",
    });
  }

  try {
    const { history, message } = req.body as {
      history: Array<{ role: string; parts: Array<{ text: string }> }>;
      message: string;
    };

    if (!message) {
      return res.status(400).json({ error: "Missing required field: message." });
    }

    const groq = new Groq({ apiKey });

    // Convert ZenStep history format to Groq/OpenAI format
    const groqHistory = (history || []).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.parts?.[0]?.text ?? "",
    }));

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "system",
          content:
            "You are ZenBot, a helpful, slightly robotic but friendly productivity assistant inside the ZenStep app. Keep answers concise, punchy, and motivating. Max 2-3 sentences.",
        },
        ...groqHistory,
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.75,
      max_tokens: 256,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return res.status(200).json({ text });
  } catch (err: any) {
    console.error("[/api/chat] Error:", err);
    return res.status(groqHttpStatus(err)).json({ error: groqErrorMessage(err) });
  }
}

// ── Error helpers ─────────────────────────────────────────────────────────────
function groqHttpStatus(err: any): number {
  const status = err?.status ?? err?.error?.status;
  if (status === 429) return 429;
  if (status === 400) return 400;
  if (status === 401 || status === 403) return 403;
  return 500;
}

function groqErrorMessage(err: any): string {
  const status = err?.status ?? err?.error?.status;
  if (status === 429) {
    return "⚠️ Groq rate limit hit. Try again in a moment.";
  }
  if (status === 401 || status === 403) {
    return "🔑 Invalid Groq API key. Check GROQ_API_KEY in Vercel.";
  }
  return err?.error?.message ?? err?.message ?? "Internal server error.";
}
