import type { PagesFunction } from "./types";
import { jsonResponse, errorResponse } from "./cors";

interface LoadRequest {
  key?: string;
  sessionId?: string;
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const { key, sessionId } = await request.json() as LoadRequest;
  let noteKey: string | null | undefined = key;
  if (!noteKey && sessionId) {
    noteKey = await env.NOTES_KV.get(`session:${sessionId}:last`);
  }
  if (!noteKey) {
    return errorResponse("No key or session known", 400);
  }
  const content = await env.NOTES_KV.get(`note:${noteKey}`);
  if (content == null) {
    return errorResponse("Note not found", 404);
  }
  return jsonResponse({ key: noteKey, content });
};
