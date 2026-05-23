import { ZenStepResponse } from "../types";

/**
 * Analyzes a messy environment image/video via the /api/analyze serverless function.
 * The Gemini API key stays server-side — it is never sent to the browser.
 */
export async function analyzeChaos(
  mediaFile: File,
  timeAvailable: string
): Promise<ZenStepResponse> {
  // Convert the File to base64 so it can be sent as JSON
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data-URL prefix (e.g. "data:image/jpeg;base64,")
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(mediaFile);
  });

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base64Data,
      mimeType: mediaFile.type,
      timeAvailable,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Analysis request failed.");
  }

  return res.json() as Promise<ZenStepResponse>;
}

/**
 * Sends a chat message via the /api/chat serverless function.
 * The Gemini API key stays server-side — it is never sent to the browser.
 */
export async function getChatResponse(
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
  newMessage: string
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, message: newMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Chat request failed.");
  }

  const data = await res.json();
  return data.text || "";
}