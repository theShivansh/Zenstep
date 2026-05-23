import { Type, Schema } from "@google/genai";

export interface MicroStep {
  emoji: string;
  action_verb: string;
  time_estimate: string;
  reason: string;
  completion_phrase: string;
  speech_cue: string;
}

export interface ZenStepResponse {
  vibe_summary: string;
  deep_think_log: string;
  encouragement_phrase: string;
  micro_steps: MicroStep[];
}

export const ZenStepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vibe_summary: {
      type: Type.STRING,
      description: "A bold, 2-4 word punchy headline summarizing the energy of the mess (e.g., 'CHAOS LEVEL: CRITICAL', 'ENTROPY WINNING').",
    },
    deep_think_log: {
      type: Type.STRING,
      description: "Your internal psychological analysis. Explain WHY the user is overwhelmed by this specific scene and HOW you determined the easiest starting point. Be raw and analytical.",
    },
    encouragement_phrase: {
      type: Type.STRING,
      description: "A short, powerful, slightly robotic but encouraging phrase to say to the user when they unlock the assistant (e.g. 'Momentum detected. You are crushing this.').",
    },
    micro_steps: {
      type: Type.ARRAY,
      description: "A list of 5 to 10 actionable, unique, and uplifting micro-steps. Break it down granularly.",
      items: {
        type: Type.OBJECT,
        properties: {
          emoji: { type: Type.STRING, description: "A relevant emoji for the task." },
          action_verb: { type: Type.STRING, description: "A short, punchy, uplifting command (e.g., 'Rescue the mug', 'Liberate the floor')." },
          time_estimate: { type: Type.STRING, description: "Very short duration (e.g., '10s', '30s')." },
          reason: { type: Type.STRING, description: "Why this step first? (e.g., 'Quickest dopamine hit')." },
          completion_phrase: { type: Type.STRING, description: "A specific, context-aware compliment to speak when this specific task is done." },
          speech_cue: { 
            type: Type.STRING, 
            description: "Tone instruction for TTS. Enum: 'urgent', 'calm', 'robotic', 'cheerful'. Use 'urgent' for quick wins, 'calm' for focus, 'robotic' for facts, 'cheerful' for celebration.",
            enum: ['urgent', 'calm', 'robotic', 'cheerful']
          },
        },
        required: ["emoji", "action_verb", "time_estimate", "reason", "completion_phrase", "speech_cue"],
      },
    },
  },
  required: ["vibe_summary", "deep_think_log", "encouragement_phrase", "micro_steps"],
};