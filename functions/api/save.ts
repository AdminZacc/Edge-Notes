import type { Env, PagesFunction } from "./types";

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const { content, sessionId } = await request.json();
  if (!content || typeof content !== "string") {
    return new Response(JSON.stringify({ error: "Invalid content" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const key = crypto.randomUUID();
  await env.NOTES_KV.put(`note:${key}`, content, { metadata: { created: Date.now() } });
  if (sessionId && typeof sessionId === "string") {
    await env.NOTES_KV.put(`session:${sessionId}:last`, key);
  }
  return new Response(JSON.stringify({ key }), { status: 200, headers: { "Content-Type": "application/json" } });
};
