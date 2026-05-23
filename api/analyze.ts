import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

// Increase Vercel's default 1MB body limit — base64 images can be several MB.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are an expert Productivity Psychologist and Computer Vision analyst.

INPUT DATA:
1. Image/Video of a messy environment.
2. User's available time commitment (e.g. 2 mins, 10 mins, 30 mins).

YOUR CORE LOGIC:
1. **Analyze Complexity & Stress:**
   - High Clutter/Chaos? -> Break tasks into tiny, soothing micro-steps.
   - Low Clutter/High Confidence? -> Use fewer, bold "Power Mode" steps.

2. **Determine Step Count based on Time & Complexity:**
   - **Small Task / Short Time (< 5 mins):** Generate **5-7** rapid-fire micro-steps.
   - **Medium Task / Medium Time (5-15 mins):** Generate **7-9** steps. Balanced flow.
   - **Chaotic Room / Long Time (> 15 mins):** Generate **10-12** steps. Deep clean logic.

3. **Output Requirements:**
   - Generate unique, uplifting micro-steps.
   - For each micro-step, provide a completion_phrase. VARY THE TONE.
     Examples: "Visual noise neutralized.", "Excellent. Dopamine received.", "Sector clear. Moving on."
   - Assign a speech_cue to each step: 'urgent', 'calm', 'robotic', or 'cheerful'.
   - You MUST output ONLY valid JSON matching this exact schema — no markdown, no code fences:

{
  "vibe_summary": "string (2-4 word punchy headline, e.g. CHAOS LEVEL: CRITICAL)",
  "deep_think_log": "string (internal psychological analysis)",
  "encouragement_phrase": "string (short robotic encouragement phrase)",
  "micro_steps": [
    {
      "emoji": "string",
      "action_verb": "string (punchy command)",
      "time_estimate": "string (e.g. 10s, 30s)",
      "reason": "string (why this step first)",
      "completion_phrase": "string (context-aware compliment)",
      "speech_cue": "urgent|calm|robotic|cheerful"
    }
  ]
}
`.trim();

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
    const { base64Data, mimeType, timeAvailable } = req.body as {
      base64Data: string;
      mimeType: string;
      timeAvailable: string;
    };

    if (!base64Data || !mimeType || !timeAvailable) {
      return res.status(400).json({
        error: "Missing required fields: base64Data, mimeType, timeAvailable.",
      });
    }

    // Groq vision requires a data URL
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
            {
              type: "text",
              text: `Analyze this environment. Time available: ${timeAvailable}. Respond ONLY with valid JSON matching the schema in the system prompt.`,
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return res.status(500).json({ error: "No response from Groq." });
    }

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("[/api/analyze] Error:", err);
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
    return "⚠️ Groq API rate limit hit. Free tier allows 1,000 requests/day. Please try again in a moment.";
  }
  if (status === 401 || status === 403) {
    return "🔑 Invalid or missing Groq API key. Check your GROQ_API_KEY in the Vercel dashboard.";
  }
  if (status === 400) {
    return "❌ Unsupported image format or file too large. Please try a JPEG/PNG under 4MB.";
  }
  return err?.error?.message ?? err?.message ?? "Internal server error.";
}
