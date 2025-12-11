import type { PagesFunction } from "./types";

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const { key, sessionId } = await request.json();
  let noteKey = key;
  if (!noteKey && sessionId) {
    noteKey = await env.NOTES_KV.get(`session:${sessionId}:last`);
  }
  if (!noteKey) {
    return new Response(JSON.stringify({ error: "No key or session known" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const content = await env.NOTES_KV.get(`note:${noteKey}`);
  if (content == null) {
    return new Response(JSON.stringify({ error: "Note not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ key: noteKey, content }), { status: 200, headers: { "Content-Type": "application/json" } });
};
