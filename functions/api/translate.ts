import type { PagesFunction } from "./types";

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { content, target = "es" } = await request.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Invalid content" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const prompt = `Translate the following text into ${target}. Preserve meaning and tone.\n\n${content}`;
    const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    }) as any;
    const result = aiRes?.response || aiRes?.result || JSON.stringify(aiRes);
    return new Response(JSON.stringify({ result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "AI translate failed", details: String(err?.message || err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
