import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// ── Schema (duplicated here so the API route is self-contained) ──────────────
const ZenStepSchema = {
  type: Type.OBJECT,
  properties: {
    vibe_summary: {
      type: Type.STRING,
      description:
        "A bold, 2-4 word punchy headline summarizing the energy of the mess.",
    },
    deep_think_log: {
      type: Type.STRING,
      description:
        "Internal psychological analysis of why the user is overwhelmed and how you determined the starting point.",
    },
    encouragement_phrase: {
      type: Type.STRING,
      description:
        "A short, powerful, slightly robotic but encouraging phrase for when the assistant is unlocked.",
    },
    micro_steps: {
      type: Type.ARRAY,
      description: "A list of 5 to 10 actionable micro-steps.",
      items: {
        type: Type.OBJECT,
        properties: {
          emoji: { type: Type.STRING },
          action_verb: { type: Type.STRING },
          time_estimate: { type: Type.STRING },
          reason: { type: Type.STRING },
          completion_phrase: { type: Type.STRING },
          speech_cue: {
            type: Type.STRING,
            enum: ["urgent", "calm", "robotic", "cheerful"],
          },
        },
        required: [
          "emoji",
          "action_verb",
          "time_estimate",
          "reason",
          "completion_phrase",
          "speech_cue",
        ],
      },
    },
  },
  required: [
    "vibe_summary",
    "deep_think_log",
    "encouragement_phrase",
    "micro_steps",
  ],
};

const SYSTEM_INSTRUCTION = `
You are an expert Productivity Psychologist and Computer Vision analyst.

INPUT DATA:
1. Image/Video of a messy environment.
2. User's available time commitment (e.g. 2 mins, 10 mins, 30 mins).

YOUR CORE LOGIC:
1. **Analyze Complexity & Stress:** 
   - High Clutter/Chaos? -> Break tasks into tiny, soothing micro-steps.
   - Low Clutter/High Confidence? -> Use fewer, bold "Power Mode" steps.

2. **Determine Step Count based on Time & Complexity:**
   - **Small Task / Short Time (< 5 mins):** Generate **5-7** rapid-fire micro-steps. Focus on immediate visual impact.
   - **Medium Task / Medium Time (5-15 mins):** Generate **7-9** steps. Balanced flow.
   - **Chaotic Room / Long Time (> 15 mins):** Generate **10-12** steps. Deep clean logic.

3. **Output Requirements:**
   - Generate unique, uplifting micro-steps.
   - **CRITICAL:** For each micro-step, provide a \`completion_phrase\`.
     - VARY THE TONE. Do not just say "Good job".
     - Examples: "Visual noise neutralized.", "Excellent. Dopamine received.", "That corner is now breathing.", "Sector clear. Moving on."
   - **SPEECH CUE:** Assign a \`speech_cue\` to each step based on the vibe of the action:
     - 'urgent': Fast, punchy (e.g. for "Pick up trash").
     - 'calm': Slow, soothing (e.g. for "Wipe surface").
     - 'robotic': Monotone, factual (e.g. for "Sort items").
     - 'cheerful': Higher pitch, happy (e.g. for "Done!").
   - You MUST output strict JSON adhering to the provided schema.
`;

// Vercel's default body parser handles JSON/urlencoded but NOT multipart.
// We receive the image as a base64 string + mimeType from the client.
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
    const { base64Data, mimeType, timeAvailable } = req.body as {
      base64Data: string;
      mimeType: string;
      timeAvailable: string;
    };

    if (!base64Data || !mimeType || !timeAvailable) {
      return res.status(400).json({ error: "Missing required fields: base64Data, mimeType, timeAvailable." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `Analyze this chaos. Time available: ${timeAvailable}. Determine the step count and intensity based on this.`,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ZenStepSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "No response from Gemini." });
    }

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("[/api/analyze] Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error." });
  }
}
