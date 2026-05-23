// ── Types used by both the frontend and the API routes ────────────────────────

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