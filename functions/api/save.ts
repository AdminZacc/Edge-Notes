import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface SaveRequest {
  content?: string;
  sessionId?: string;
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const { content, sessionId } = await request.json() as SaveRequest;
  if (!content || typeof content !== "string") {
    return errorResponse("Invalid content", 400);
  }
  const key = crypto.randomUUID();
  await env.NOTES_KV.put(`note:${key}`, content, { metadata: { created: Date.now() } });
  if (sessionId && typeof sessionId === "string") {
    await env.NOTES_KV.put(`session:${sessionId}:last`, key);
  }
  return jsonResponse({ key });
};
